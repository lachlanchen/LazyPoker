import { describe, expect, it } from 'vitest'
import { applyBridgeAction, initialBridgeState, legalBridgeActions, publicBridgeView } from './bridge'
import { applyGuandanAction, initialGuandanState, legalGuandanActions, publicGuandanView, type GuandanState } from './guandan'

describe('Bridge beginner table', () => {
  it('requires following suit when possible', () => {
    const base = initialBridgeState('follow-suit')
    const led = base.hands.south[0]!
    const eastHasSuit = base.hands.east.some((card) => card.suit === led.suit)
    const state = { ...base, activeSeat: 'east' as const, trick: [{ seat: 'south' as const, card: led }] }
    const legal = legalBridgeActions(state, 'east')
    if (eastHasSuit) expect(legal.every((item) => base.hands.east.find((card) => card.id === item.action.cardId)?.suit === led.suit)).toBe(true)
    else expect(legal).toHaveLength(base.hands.east.length)
  })

  it('redacts all other seats, the seed and unused deck', () => {
    const view = publicBridgeView(initialBridgeState('bridge-private'), 'south')
    expect(view.hands.south.every(Boolean)).toBe(true)
    expect(view.hands.north.every((card) => card === null)).toBe(true)
    for (const card of initialBridgeState('bridge-private').hands.north) expect(JSON.stringify(view)).not.toContain(card.id)
    expect(JSON.stringify(view)).not.toContain('bridge-private')
    expect(view).not.toHaveProperty('unusedDeck')
  })

  it('rejects a card candidate after the trick state changes', () => {
    const state = initialBridgeState('bridge-stale')
    const candidate = legalBridgeActions(state, 'south')[0]!
    const changed = applyBridgeAction(state, { candidateId: candidate.id, clientRequestId: 'bridge-1' })
    expect(() => applyBridgeAction(changed, { candidateId: candidate.id, clientRequestId: 'bridge-2' })).toThrow(/current trick/)
  })

  it('binds a replay request ID to its original card payload', () => {
    const state = initialBridgeState('bridge-idempotency')
    const [first, second] = legalBridgeActions(state, 'south')
    const changed = applyBridgeAction(state, { candidateId: first!.id, clientRequestId: 'bridge-bound' })
    expect(() => applyBridgeAction(changed, { candidateId: second!.id, clientRequestId: 'bridge-bound' })).toThrow(/different selection/)
  })
})

describe('Guandan beginner table', () => {
  it('allows only higher singles or pass after a lead', () => {
    const base = initialGuandanState('higher-single')
    const played = base.hands.you[0]!
    const state = { ...base, activeSeat: 'right' as const, currentPlay: { seat: 'you' as const, card: played } }
    const legal = legalGuandanActions(state, 'right')
    const playedRanks = legal.flatMap((item) => {
      const action = item.action
      if (action.kind !== 'play-single') return []
      const cardId = action.cardId
      return [base.hands.right.find((card) => card.id === cardId)!.rank]
    })
    expect(playedRanks.every((rank) => rank > played.rank)).toBe(true)
    expect(legal.some((item) => item.action.kind === 'pass')).toBe(true)
  })

  it('redacts partner and opponents as well as the deal seed', () => {
    const view = publicGuandanView(initialGuandanState('guandan-private'), 'you')
    expect(view.hands.you.every(Boolean)).toBe(true)
    expect(view.hands.partner.every((card) => card === null)).toBe(true)
    for (const card of initialGuandanState('guandan-private').hands.partner) expect(JSON.stringify(view)).not.toContain(card.id)
    expect(JSON.stringify(view)).not.toContain('guandan-private')
    expect(view).not.toHaveProperty('unusedDeck')
  })

  it('applies one legal play idempotently', () => {
    const state = initialGuandanState('guandan-action')
    const candidate = legalGuandanActions(state, 'you')[0]!
    const once = applyGuandanAction(state, { candidateId: candidate.id, clientRequestId: 'g-1' })
    const twice = applyGuandanAction(once, { candidateId: candidate.id, clientRequestId: 'g-1' })
    expect(twice).toBe(once)
    expect(once.hands.you).toHaveLength(5)
  })

  it('binds a replay request ID to its original play payload', () => {
    const state = initialGuandanState('guandan-idempotency')
    const [first, second] = legalGuandanActions(state, 'you')
    const changed = applyGuandanAction(state, { candidateId: first!.id, clientRequestId: 'guandan-bound' })
    expect(() => applyGuandanAction(changed, { candidateId: second!.id, clientRequestId: 'guandan-bound' })).toThrow(/different selection/)
  })

  it('waits for every eligible remaining seat before returning initiative', () => {
    const base = initialGuandanState('guandan-passes')
    const lead = base.hands.you[0]!
    let state: GuandanState = {
      ...base,
      hands: { ...base.hands, you: [] as const },
      activeSeat: 'right' as const,
      currentPlay: { seat: 'you' as const, card: lead },
      responseQueue: ['right', 'partner', 'left'] as const,
      finishOrder: ['you'] as const,
    }
    for (const [seat, request] of [['right', 'pass-right'], ['partner', 'pass-partner'], ['left', 'pass-left']] as const) {
      expect(state.activeSeat).toBe(seat)
      const pass = legalGuandanActions(state, seat).find((candidate) => candidate.action.kind === 'pass')!
      state = applyGuandanAction(state, { candidateId: pass.id, clientRequestId: request })
    }
    expect(state.currentPlay).toBeNull()
    expect(state.activeSeat).toBe('right')
    expect(state.responseQueue).toEqual([])
  })
})
