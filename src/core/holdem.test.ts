import { describe, expect, it } from 'vitest'
import { applyHoldemAction, chipTotal, estimateVisibleEquity, initialHoldemState, legalHoldemActions, publicHoldemView } from './holdem'
import { RuleError } from './types'

function act(state: ReturnType<typeof initialHoldemState>, kind: string, request: string) {
  const candidate = legalHoldemActions(state, state.activePlayer!).find((item) => item.action.kind === kind)
  if (!candidate) throw new Error(`Missing ${kind}`)
  return applyHoldemAction(state, { candidateId: candidate.id, clientRequestId: request })
}

describe('heads-up Hold’em authority', () => {
  it('enforces the acting player and rejects stale candidates', () => {
    const initial = initialHoldemState('legality')
    expect(() => legalHoldemActions(initial, 'villain')).toThrowError(RuleError)
    const stale = legalHoldemActions(initial, 'hero').find((item) => item.action.kind === 'call')!
    const after = applyHoldemAction(initial, { candidateId: stale.id, clientRequestId: 'first' })
    expect(() => applyHoldemAction(after, { candidateId: stale.id, clientRequestId: 'stale' })).toThrowError(/current state/)
  })

  it('makes mutation request IDs idempotent', () => {
    const initial = initialHoldemState('idempotent')
    const candidate = legalHoldemActions(initial, 'hero').find((item) => item.action.kind === 'call')!
    const once = applyHoldemAction(initial, { candidateId: candidate.id, clientRequestId: 'same-request' })
    const twice = applyHoldemAction(once, { candidateId: candidate.id, clientRequestId: 'same-request' })
    expect(twice).toBe(once)
    expect(twice.revision).toBe(1)
  })

  it('rejects reusing a request ID for a different candidate payload', () => {
    const initial = initialHoldemState('idempotency-conflict')
    const call = legalHoldemActions(initial, 'hero').find((item) => item.action.kind === 'call')!
    const fold = legalHoldemActions(initial, 'hero').find((item) => item.action.kind === 'fold')!
    const once = applyHoldemAction(initial, { candidateId: call.id, clientRequestId: 'bound-request' })
    expect(() => applyHoldemAction(once, { candidateId: fold.id, clientRequestId: 'bound-request' })).toThrow(/different selection/)
  })

  it('plays all four streets to an exact showdown and conserves chips', () => {
    let state = initialHoldemState('showdown')
    state = act(state, 'call', 'pre-call')
    state = act(state, 'check', 'pre-check')
    expect(state.phase).toBe('flop')
    for (const street of ['flop', 'turn', 'river']) {
      state = act(state, 'check', `${street}-one`)
      state = act(state, 'check', `${street}-two`)
    }
    expect(state.phase).toBe('complete')
    expect(state.community).toHaveLength(5)
    expect(state.winnerIds.length).toBeGreaterThan(0)
    expect(chipTotal(state)).toBe(2_000)
  })

  it('settles a fold immediately without revealing the folded hand', () => {
    const state = act(initialHoldemState('fold'), 'fold', 'fold-now')
    expect(state.phase).toBe('complete')
    expect(chipTotal(state)).toBe(2_000)
    expect(publicHoldemView(state, 'hero').players[1].hole).toEqual([null, null])
  })

  it('runs the board and settles when an effective-stack all-in is called', () => {
    const initial = initialHoldemState('all-in')
    const shove = legalHoldemActions(initial, 'hero').find((item) => item.action.kind === 'raise' && item.action.to === 1_000)!
    const facing = applyHoldemAction(initial, { candidateId: shove.id, clientRequestId: 'shove' })
    const call = legalHoldemActions(facing, 'villain').find((item) => item.action.kind === 'call')!
    const settled = applyHoldemAction(facing, { candidateId: call.id, clientRequestId: 'call-shove' })
    expect(settled.phase).toBe('complete')
    expect(settled.community).toHaveLength(5)
    expect(chipTotal(settled)).toBe(2_000)
  })

  it('redacts every server-only field and opponent cards', () => {
    const state = initialHoldemState('secret-seed')
    const view = publicHoldemView(state, 'hero')
    expect(view.players[0].hole.every(Boolean)).toBe(true)
    expect(view.players[1].hole).toEqual([null, null])
    for (const card of state.players[1].hole) expect(JSON.stringify(view)).not.toContain(card.id)
    expect(JSON.stringify(view)).not.toContain('secret-seed')
    expect(view).not.toHaveProperty('deck')
    expect(view).not.toHaveProperty('processedRequests')
  })

  it('makes calculated equity invariant to every hidden opponent/deck change', () => {
    const state = initialHoldemState('equity-private-a')
    const alternate = initialHoldemState('equity-private-b')
    const hiddenVariant = {
      ...state,
      seed: alternate.seed,
      deck: alternate.deck,
      players: [state.players[0], { ...state.players[1], hole: alternate.players[1].hole }] as const,
    }
    expect(legalHoldemActions(hiddenVariant, 'hero')[0]?.id).not.toBe(legalHoldemActions(state, 'hero')[0]?.id)
    const estimate = estimateVisibleEquity(publicHoldemView(state, 'hero'), 'hero', 180)
    const hiddenVariantEstimate = estimateVisibleEquity(publicHoldemView(hiddenVariant, 'hero'), 'hero', 180)
    expect(hiddenVariantEstimate).toEqual(estimate)
  })
})
