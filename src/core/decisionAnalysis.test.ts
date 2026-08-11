import { describe, expect, it } from 'vitest'
import { initialBridgeState, legalBridgeActions, publicBridgeView } from './bridge'
import { analyzeBridgeDecision, analyzeGuandanDecision, analyzeHoldemDecision } from './decisionAnalysis'
import { applyGuandanAction, initialGuandanState, legalGuandanActions, publicGuandanView } from './guandan'
import { initialHoldemState, legalHoldemActions, publicHoldemView } from './holdem'
import type { Card } from './types'

const card = (id: string, suit: Card['suit'], rank: Card['rank']): Card => ({ id, suit, rank })

function withoutOpaqueIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutOpaqueIds)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'candidateId' && key !== 'suggestionId').map(([key, item]) => [key, withoutOpaqueIds(item)]))
  }
  return value
}

describe('public decision analysis', () => {
  it('derives Hold’em equity, board map and advice only from viewer-authorized cards', () => {
    const state = initialHoldemState('public-analysis-a')
    const alternate = initialHoldemState('public-analysis-b')
    const hiddenVariant = {
      ...state,
      seed: alternate.seed,
      deck: alternate.deck,
      players: [state.players[0], { ...state.players[1], hole: alternate.players[1].hole }] as const,
    }
    const analysis = analyzeHoldemDecision(publicHoldemView(state, 'hero'), 'hero', legalHoldemActions(state, 'hero'), 160)
    const hiddenAnalysis = analyzeHoldemDecision(publicHoldemView(hiddenVariant, 'hero'), 'hero', legalHoldemActions(hiddenVariant, 'hero'), 160)

    expect(withoutOpaqueIds(hiddenAnalysis)).toEqual(withoutOpaqueIds(analysis))
    expect(analysis.suggestionId).toBeTruthy()
    expect(analysis.equitySamples).toBe(160)
    expect(analysis.pot).toBe(30)
    expect(analysis.callPrice).toBe(10)
    expect(analysis.candidates.every((candidate) => candidate.stackAfter >= 0)).toBe(true)
    for (const card of state.players[1].hole) expect(JSON.stringify(analysis)).not.toContain(card.id)
  })

  it('maps post-flop texture and possible next-card improvements without reading the real deck', () => {
    const base = initialHoldemState('flop-analysis')
    const state = { ...base, phase: 'flop' as const, community: base.deck.slice(5, 8), deckIndex: 8, currentBet: 0, players: base.players.map((player) => ({ ...player, contribution: 0 })) as unknown as typeof base.players }
    const analysis = analyzeHoldemDecision(publicHoldemView(state, 'hero'), 'hero', legalHoldemActions(state, 'hero'), 80)

    expect(['unpaired', 'paired', 'trips']).toContain(analysis.pairing)
    expect(['rainbow', 'two-tone', 'monotone']).toContain(analysis.suits)
    expect(analysis.nextCardAvailable).toBe(true)
    expect(analysis.nextCardStatus).toBe('available')
    expect(analysis.unseenCount).toBe(47)
    expect(new Set(analysis.improvingOuts.map((card) => card.id)).size).toBe(analysis.improvingOuts.length)
  })

  it('distinguishes turn and river suit counts plus full-house and quads boards', () => {
    const base = initialHoldemState('exact-board-texture')
    const players = [
      { ...base.players[0], hole: [card('KC', 'clubs', 13), card('QS', 'spades', 12)], contribution: 0 },
      { ...base.players[1], hole: [card('JD', 'diamonds', 11), card('TC', 'clubs', 10)], contribution: 0 },
    ] as unknown as typeof base.players
    const analyzeBoard = (community: readonly Card[]) => {
      const state = { ...base, phase: community.length === 4 ? 'turn' as const : 'river' as const, community, currentBet: 0, players }
      return analyzeHoldemDecision(publicHoldemView(state, 'hero'), 'hero', legalHoldemActions(state, 'hero'), 20)
    }

    expect(analyzeBoard([card('AH', 'hearts', 14), card('7H', 'hearts', 7), card('4C', 'clubs', 4), card('2D', 'diamonds', 2)]).suits).toBe('three-suit')
    const quads = analyzeBoard([card('AH', 'hearts', 14), card('AS', 'spades', 14), card('AD', 'diamonds', 14), card('AC', 'clubs', 14), card('2C', 'clubs', 2)])
    expect(quads.pairing).toBe('quads')
    expect(quads.suits).toBe('four-suit')
    expect(analyzeBoard([card('AH', 'hearts', 14), card('AS', 'spades', 14), card('AD', 'diamonds', 14), card('2C', 'clubs', 2), card('2D', 'diamonds', 2)]).pairing).toBe('full-house')
  })

  it('does not present possible next-card improvements after the river completes the board', () => {
    const base = initialHoldemState('river-analysis')
    const state = {
      ...base,
      phase: 'river' as const,
      community: base.deck.slice(5, 10),
      deckIndex: 10,
      currentBet: 0,
      players: base.players.map((player) => ({ ...player, contribution: 0 })) as unknown as typeof base.players,
    }
    const analysis = analyzeHoldemDecision(publicHoldemView(state, 'hero'), 'hero', legalHoldemActions(state, 'hero'), 20)

    expect(analysis.nextCardAvailable).toBe(false)
    expect(analysis.nextCardStatus).toBe('board-complete')
    expect(analysis.improvingOuts).toEqual([])
    expect(analysis.unseenCount).toBeGreaterThan(0)
  })

  it('does not offer a fictitious next card after a fold ends the hand on the flop or turn', () => {
    const base = initialHoldemState('folded-board-analysis')
    for (const communityCount of [3, 4]) {
      const state = {
        ...base,
        phase: 'complete' as const,
        activePlayer: null,
        community: base.deck.slice(5, 5 + communityCount),
        currentBet: 0,
        needsAction: [] as const,
        winnerIds: ['villain'] as const,
        players: [
          { ...base.players[0], folded: true, contribution: 0 },
          { ...base.players[1], contribution: 0 },
        ] as typeof base.players,
      }
      const analysis = analyzeHoldemDecision(publicHoldemView(state, 'hero'), 'hero', [], 20)

      expect(analysis.nextCardAvailable).toBe(false)
      expect(analysis.nextCardStatus).toBe('hand-complete')
      expect(analysis.improvingOuts).toEqual([])
      expect(analysis.unseenCount).toBeGreaterThan(0)
    }
  })

  it('keeps post-flop outs and equity unchanged when only hidden cards and deck order change', () => {
    const base = initialHoldemState('flop-private-a')
    const alternate = initialHoldemState('flop-private-b')
    const state = { ...base, phase: 'flop' as const, community: base.deck.slice(5, 8), deckIndex: 8, currentBet: 0, players: base.players.map((player) => ({ ...player, contribution: 0 })) as unknown as typeof base.players }
    const hiddenVariant = { ...state, seed: alternate.seed, deck: alternate.deck, players: [state.players[0], { ...state.players[1], hole: alternate.players[1].hole }] as const }
    const analysis = analyzeHoldemDecision(publicHoldemView(state, 'hero'), 'hero', legalHoldemActions(state, 'hero'), 120)
    const hiddenAnalysis = analyzeHoldemDecision(publicHoldemView(hiddenVariant, 'hero'), 'hero', legalHoldemActions(hiddenVariant, 'hero'), 120)

    expect(withoutOpaqueIds(hiddenAnalysis)).toEqual(withoutOpaqueIds(analysis))
  })

  it('keeps Bridge trick guidance invariant to every hidden hand and deck change', () => {
    const state = initialBridgeState('bridge-public-a')
    const alternate = initialBridgeState('bridge-public-b')
    const hiddenVariant = {
      ...state,
      seed: alternate.seed,
      unusedDeck: alternate.unusedDeck,
      hands: { ...alternate.hands, south: state.hands.south },
    }
    const analysis = analyzeBridgeDecision(publicBridgeView(state, 'south'), 'south', legalBridgeActions(state, 'south'))
    const hiddenAnalysis = analyzeBridgeDecision(publicBridgeView(hiddenVariant, 'south'), 'south', legalBridgeActions(hiddenVariant, 'south'))

    expect(withoutOpaqueIds(hiddenAnalysis)).toEqual(withoutOpaqueIds(analysis))
    expect(analysis.suggestionId).toBeTruthy()
    expect(analysis.trickProgress).toBe(0)
    expect(Object.values(analysis.suitCounts).reduce((sum, count) => sum + count, 0)).toBe(5)
    for (const card of state.hands.north) expect(JSON.stringify(analysis)).not.toContain(card.id)
  })

  it('labels an opening Bridge lead as authored shape development rather than a current winner', () => {
    const base = initialBridgeState('bridge-opening-shape')
    const state = {
      ...base,
      hands: { ...base.hands, south: [card('2C', 'clubs', 2), card('3C', 'clubs', 3), card('4D', 'diamonds', 4), card('KS', 'spades', 13), card('AS', 'spades', 14)] },
    }
    const legal = legalBridgeActions(state, 'south')
    const analysis = analyzeBridgeDecision(publicBridgeView(state, 'south'), 'south', legal)
    const suggested = legal.find((candidate) => candidate.id === analysis.suggestionId)

    expect(suggested?.action.cardId).toBe('2C')
    expect(analysis.suggestionReasonKey).toBe('suggestion.bridgeOpeningLead')
    const impact = analysis.candidates.find((candidate) => candidate.candidateId === suggested?.id)
    expect(impact?.opensTrick).toBe(true)
    expect(impact?.winsNow).toBe(false)
    expect(impact?.purposeKey).toBe('coach.bridge.purposeLead')
  })

  it('conserves rank when the visible Bridge partner is already ahead', () => {
    const base = initialBridgeState('bridge-partner-ahead')
    const state = {
      ...base,
      activeSeat: 'south' as const,
      trick: [
        { seat: 'north' as const, card: card('TH', 'hearts', 10) },
        { seat: 'east' as const, card: card('2H', 'hearts', 2) },
      ],
      hands: { ...base.hands, south: [card('3H', 'hearts', 3), card('QH', 'hearts', 12), card('AS', 'spades', 14)] },
    }
    const legal = legalBridgeActions(state, 'south')
    const analysis = analyzeBridgeDecision(publicBridgeView(state, 'south'), 'south', legal)
    const suggested = legal.find((candidate) => candidate.id === analysis.suggestionId)

    expect(analysis.partnerAhead).toBe(true)
    expect(suggested?.action.cardId).toBe('3H')
  })

  it('does not spend a low trump over a visibly winning Bridge partner when a discard exists', () => {
    const base = initialBridgeState('bridge-partner-void')
    const state = {
      ...base,
      activeSeat: 'south' as const,
      trick: [
        { seat: 'north' as const, card: card('TH', 'hearts', 10) },
        { seat: 'east' as const, card: card('2H', 'hearts', 2) },
      ],
      hands: { ...base.hands, south: [card('2S', 'spades', 2), card('QC', 'clubs', 12), card('KD', 'diamonds', 13)] },
    }
    const legal = legalBridgeActions(state, 'south')
    const analysis = analyzeBridgeDecision(publicBridgeView(state, 'south'), 'south', legal)
    const suggested = legal.find((candidate) => candidate.id === analysis.suggestionId)

    expect(suggested?.action.cardId).toBe('QC')
    expect(analysis.candidates.find((candidate) => candidate.candidateId === suggested?.id)?.winsNow).toBe(false)
    expect(analysis.suggestionReasonKey).toBe('suggestion.bridgePartnerAhead')
  })

  it('preserves a lower trump under partner’s winning trump when a discard exists', () => {
    const base = initialBridgeState('bridge-partner-high-trump')
    const state = {
      ...base,
      leader: 'west' as const,
      activeSeat: 'south' as const,
      trick: [
        { seat: 'west' as const, card: card('TH', 'hearts', 10) },
        { seat: 'north' as const, card: card('TS', 'spades', 10) },
        { seat: 'east' as const, card: card('2H', 'hearts', 2) },
      ],
      hands: { ...base.hands, south: [card('2S', 'spades', 2), card('QC', 'clubs', 12), card('KD', 'diamonds', 13)] },
    }
    const legal = legalBridgeActions(state, 'south')
    const analysis = analyzeBridgeDecision(publicBridgeView(state, 'south'), 'south', legal)

    expect(analysis.partnerAhead).toBe(true)
    expect(legal.find((candidate) => candidate.id === analysis.suggestionId)?.action.cardId).toBe('QC')
  })

  it('assigns equal Bridge rank cost to equal ranks in different suits', () => {
    const base = initialBridgeState('bridge-rank-ties')
    const state = {
      ...base,
      hands: { ...base.hands, south: [card('3C', 'clubs', 3), card('3D', 'diamonds', 3), card('9H', 'hearts', 9), card('AS', 'spades', 14)] },
    }
    const analysis = analyzeBridgeDecision(publicBridgeView(state, 'south'), 'south', legalBridgeActions(state, 'south'))
    const threes = analysis.candidates.filter((candidate) => candidate.card.rank === 3)

    expect(threes).toHaveLength(2)
    expect(threes[0]?.rankCost).toBe(threes[1]?.rankCost)
  })

  it('uses resolved and terminal Bridge copy without claiming another hidden reply', () => {
    const base = initialBridgeState('bridge-terminal-copy')
    const common = {
      ...base,
      leader: 'west' as const,
      activeSeat: 'south' as const,
      trick: [
        { seat: 'west' as const, card: card('2H', 'hearts', 2) },
        { seat: 'north' as const, card: card('3H', 'hearts', 3) },
        { seat: 'east' as const, card: card('4H', 'hearts', 4) },
      ],
      hands: { ...base.hands, south: [card('5H', 'hearts', 5)] },
    }
    const resolved = analyzeBridgeDecision(publicBridgeView(common, 'south'), 'south', legalBridgeActions(common, 'south')).candidates[0]!
    const finalState = { ...common, completedTricks: [[], [], [], []] }
    const terminal = analyzeBridgeDecision(publicBridgeView(finalState, 'south'), 'south', legalBridgeActions(finalState, 'south')).candidates[0]!

    expect(resolved.replyKey).toBe('coach.bridge.replyComplete')
    expect(resolved.replyEvidence).toBe('exact')
    expect(resolved.nextKey).toBe('coach.bridge.nextResolved')
    expect(resolved.failureKey).toBeNull()
    expect(terminal.replyKey).toBe('coach.bridge.replyLessonComplete')
    expect(terminal.nextKey).toBe('coach.bridge.nextComplete')
    expect(terminal.failureKey).toBeNull()
  })

  it('labels a forced Bridge overtake when every legal card trumps partner', () => {
    const base = initialBridgeState('bridge-partner-forced')
    const state = {
      ...base,
      activeSeat: 'south' as const,
      trick: [
        { seat: 'north' as const, card: card('TH', 'hearts', 10) },
        { seat: 'east' as const, card: card('2H', 'hearts', 2) },
      ],
      hands: { ...base.hands, south: [card('2S', 'spades', 2), card('3S', 'spades', 3)] },
    }
    const legal = legalBridgeActions(state, 'south')
    const analysis = analyzeBridgeDecision(publicBridgeView(state, 'south'), 'south', legal)

    expect(legal.find((candidate) => candidate.id === analysis.suggestionId)?.action.cardId).toBe('2S')
    expect(analysis.suggestionReasonKey).toBe('suggestion.bridgeForcedOvertake')
  })

  it('keeps Guandan initiative guidance invariant to partner and opponent cards', () => {
    const state = initialGuandanState('guandan-public-a')
    const alternate = initialGuandanState('guandan-public-b')
    const hiddenVariant = {
      ...state,
      seed: alternate.seed,
      unusedDeck: alternate.unusedDeck,
      hands: { ...alternate.hands, you: state.hands.you },
    }
    const analysis = analyzeGuandanDecision(publicGuandanView(state, 'you'), 'you', legalGuandanActions(state, 'you'))
    const hiddenAnalysis = analyzeGuandanDecision(publicGuandanView(hiddenVariant, 'you'), 'you', legalGuandanActions(hiddenVariant, 'you'))

    expect(withoutOpaqueIds(hiddenAnalysis)).toEqual(withoutOpaqueIds(analysis))
    expect(analysis.suggestionId).toBeTruthy()
    expect(analysis.threshold).toBeNull()
    expect(analysis.legalPlayContext).toBe('lead')
    expect(analysis.legalPlayCount).toBe(6)
    for (const card of state.hands.partner) expect(JSON.stringify(analysis)).not.toContain(card.id)
  })

  it('orders the Guandan initiative instrument by owner then exact response queue', () => {
    const base = initialGuandanState('guandan-queue-order')
    const state = {
      ...base,
      activeSeat: 'partner' as const,
      currentPlay: { seat: 'right' as const, card: base.hands.right[0]! },
      responseQueue: ['partner', 'left', 'you'] as const,
    }
    const analysis = analyzeGuandanDecision(publicGuandanView(state, 'you'), 'you', [])

    expect(analysis.initiativeOrder).toEqual([
      { seat: 'right', status: 'owner', position: null },
      { seat: 'partner', status: 'active', position: 1 },
      { seat: 'left', status: 'waiting', position: 2 },
      { seat: 'you', status: 'waiting', position: 3 },
    ])
    expect(analysis.legalPlayContext).toBe('response')
    expect(analysis.legalPlayCount).toBeNull()
  })

  it('suggests passing when the Guandan partner owns the visible lead', () => {
    const base = initialGuandanState('guandan-partner-ahead')
    const state = {
      ...base,
      activeSeat: 'you' as const,
      currentPlay: { seat: 'partner' as const, card: card('7C', 'clubs', 7) },
      responseQueue: ['you', 'right', 'left'] as const,
    }
    const legal = legalGuandanActions(state, 'you')
    const analysis = analyzeGuandanDecision(publicGuandanView(state, 'you'), 'you', legal)
    const suggested = legal.find((candidate) => candidate.id === analysis.suggestionId)

    expect(analysis.partnerAhead).toBe(true)
    expect(analysis.partnerFinished).toBe(false)
    expect(suggested?.action.kind).toBe('pass')
  })

  it('gives equal Guandan reserve cost to equal ranks regardless of suit', () => {
    const base = initialGuandanState('guandan-rank-ties')
    const state = {
      ...base,
      hands: { ...base.hands, you: [card('3C', 'clubs', 3), card('3D', 'diamonds', 3), card('9H', 'hearts', 9), card('AS', 'spades', 14)] },
    }
    const analysis = analyzeGuandanDecision(publicGuandanView(state, 'you'), 'you', legalGuandanActions(state, 'you'))
    const threes = analysis.candidates.filter((candidate) => candidate.card?.rank === 3)

    expect(threes).toHaveLength(2)
    expect(threes[0]?.reserveCost).toBe(threes[1]?.reserveCost)
  })

  it('contests initiative instead of promising a reset to a finished Guandan partner', () => {
    const base = initialGuandanState('guandan-finished-partner')
    const state = {
      ...base,
      activeSeat: 'you' as const,
      currentPlay: { seat: 'partner' as const, card: card('7C', 'clubs', 7) },
      responseQueue: ['you', 'right'] as const,
      finishOrder: ['partner'] as const,
      hands: { ...base.hands, you: [card('8D', 'diamonds', 8), card('AS', 'spades', 14)] },
    }
    const legal = legalGuandanActions(state, 'you')
    const analysis = analyzeGuandanDecision(publicGuandanView(state, 'you'), 'you', legal)
    const suggested = legal.find((candidate) => candidate.id === analysis.suggestionId)
    const pass = analysis.candidates.find((candidate) => candidate.kind === 'pass')

    expect(analysis.partnerAhead).toBe(true)
    expect(analysis.partnerFinished).toBe(true)
    expect(suggested?.action).toEqual({ kind: 'play-single', cardId: '8D' })
    expect(analysis.suggestionReasonKey).toBe('suggestion.guandanFinishedPartnerTakeover')
    expect(pass?.purposeKey).toBe('coach.guandan.purposeFinishedPartnerPass')
  })

  it('previews the second finisher as immediate completion with no responder', () => {
    const base = initialGuandanState('guandan-second-finisher')
    const state = {
      ...base,
      activeSeat: 'you' as const,
      leader: 'you' as const,
      currentPlay: null,
      responseQueue: [] as const,
      finishOrder: ['partner'] as const,
      hands: { ...base.hands, you: [card('AS', 'spades', 14)], partner: [] },
    }
    const legal = legalGuandanActions(state, 'you')
    const analysis = analyzeGuandanDecision(publicGuandanView(state, 'you'), 'you', legal)
    const impact = analysis.candidates[0]!
    const applied = applyGuandanAction(state, { candidateId: legal[0]!.id, clientRequestId: 'finish-preview' })

    expect(impact.establishesLead).toBe(true)
    expect(impact.completesLesson).toBe(true)
    expect(impact.nextSeat).toBeNull()
    expect(impact.purposeKey).toBe('coach.guandan.purposeFinish')
    expect(impact.purposeEvidence).toBe('exact')
    expect(impact.replyKey).toBe('coach.guandan.replyComplete')
    expect(impact.replyEvidence).toBe('exact')
    expect(impact.nextKey).toBe('coach.guandan.nextComplete')
    expect(impact.failureKey).toBeNull()
    expect(analysis.suggestionReasonKey).toBe('suggestion.guandanFinish')
    expect(applied.complete).toBe(true)
    expect(applied.activeSeat).toBeNull()
    const completedAnalysis = analyzeGuandanDecision(publicGuandanView(applied, 'you'), 'you', [])
    expect(completedAnalysis.legalPlayContext).toBe('complete')
    expect(completedAnalysis.legalPlayCount).toBeNull()
  })

  it('labels an ordinary open Guandan play as establishing rather than challenging initiative', () => {
    const state = initialGuandanState('guandan-open-lead-copy')
    const analysis = analyzeGuandanDecision(publicGuandanView(state, 'you'), 'you', legalGuandanActions(state, 'you'))

    expect(analysis.candidates.every((candidate) => candidate.kind !== 'play-single' || candidate.establishesLead)).toBe(true)
    expect(analysis.candidates.every((candidate) => !candidate.completesLesson)).toBe(true)
  })

  it('labels Guandan passing as forced when no visible single can beat', () => {
    const base = initialGuandanState('guandan-forced-pass')
    const state = {
      ...base,
      activeSeat: 'you' as const,
      currentPlay: { seat: 'right' as const, card: card('QC', 'clubs', 12) },
      responseQueue: ['you', 'partner', 'left'] as const,
      hands: { ...base.hands, you: [card('3D', 'diamonds', 3), card('9H', 'hearts', 9)] },
    }
    const legal = legalGuandanActions(state, 'you')
    const analysis = analyzeGuandanDecision(publicGuandanView(state, 'you'), 'you', legal)

    expect(legal.find((candidate) => candidate.id === analysis.suggestionId)?.action.kind).toBe('pass')
    expect(analysis.suggestionReasonKey).toBe('suggestion.guandanForcedPass')
    expect(analysis.legalPlayContext).toBe('response')
    expect(analysis.legalPlayCount).toBe(0)
  })
})
