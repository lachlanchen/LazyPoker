import { shuffleDeck } from './cards'
import { bindCandidate, stableHash } from './hash'
import { isExactReplay, receiptFor } from './idempotency'
import { RuleError, type Candidate, type Card, type ChronicleEvent, type MutationReceipt, type Selection, type Suit } from './types'

export type BridgeSeat = 'north' | 'east' | 'south' | 'west'
export interface BridgeAction { readonly kind: 'play'; readonly cardId: string }
export interface BridgePlay { readonly seat: BridgeSeat; readonly card: Card }
export interface BridgeState {
  readonly kind: 'bridge'
  readonly sessionId: string
  readonly seed: string
  readonly revision: number
  readonly activeSeat: BridgeSeat | null
  readonly leader: BridgeSeat
  readonly hands: Readonly<Record<BridgeSeat, readonly Card[]>>
  readonly trick: readonly BridgePlay[]
  readonly completedTricks: readonly (readonly BridgePlay[])[]
  readonly tricks: Readonly<Record<'northSouth' | 'eastWest', number>>
  readonly trump: Suit
  readonly unusedDeck: readonly Card[]
  readonly processedRequests: readonly MutationReceipt[]
  readonly events: readonly ChronicleEvent[]
  readonly complete: boolean
}

export interface BridgePublicView extends Omit<BridgeState, 'seed' | 'hands' | 'unusedDeck' | 'processedRequests'> {
  readonly hands: Readonly<Record<BridgeSeat, readonly (Card | null)[]>>
  readonly unusedCardCount: number
  readonly limitationKey: 'limit.bridgeMini'
}

const seatOrder: readonly BridgeSeat[] = ['north', 'east', 'south', 'west']

function nextSeat(seat: BridgeSeat): BridgeSeat {
  return seatOrder[(seatOrder.indexOf(seat) + 1) % seatOrder.length] as BridgeSeat
}

function token(state: BridgeState): string { return `b_${stableHash(state)}` }

export function initialBridgeState(seed: string, sessionId = `bridge_${stableHash(seed)}`): BridgeState {
  const deck = shuffleDeck(seed)
  const hands = Object.fromEntries(seatOrder.map((seat, seatIndex) => [seat, deck.filter((_, index) => index % 4 === seatIndex).slice(0, 5)])) as unknown as BridgeState['hands']
  return {
    kind: 'bridge', sessionId, seed, revision: 0, activeSeat: 'south', leader: 'south', hands,
    trick: [], completedTricks: [], tricks: { northSouth: 0, eastWest: 0 }, trump: 'spades', unusedDeck: deck.slice(20),
    processedRequests: [], events: [{ revision: 0, key: 'event.bridgeLessonStarted' }], complete: false,
  }
}

export function legalBridgeActions(state: BridgeState, actor: BridgeSeat): Candidate<BridgeAction>[] {
  if (state.complete || state.activeSeat === null) return []
  if (actor !== state.activeSeat) throw new RuleError('not_your_turn', `It is ${state.activeSeat}'s turn`)
  const hand = state.hands[actor]
  const ledSuit = state.trick[0]?.card.suit
  const follows = ledSuit ? hand.filter((card) => card.suit === ledSuit) : []
  const playable = follows.length > 0 ? follows : hand
  const stateToken = token(state)
  return playable.map((card) => {
    const action = { kind: 'play', cardId: card.id } as const
    return { id: bindCandidate(stateToken, actor, action), stateToken, actorId: actor, action, labelKey: 'action.playCard' }
  })
}

function trickWinner(trick: readonly BridgePlay[], trump: Suit): BridgeSeat {
  const ledSuit = trick[0]?.card.suit
  return trick.reduce((winner, play) => {
    const winningCard = winner.card
    if (play.card.suit === winningCard.suit && play.card.rank > winningCard.rank) return play
    if (play.card.suit === trump && winningCard.suit !== trump) return play
    if (play.card.suit === ledSuit && winningCard.suit !== trump && winningCard.suit !== ledSuit) return play
    return winner
  }, trick[0] as BridgePlay).seat
}

export function applyBridgeAction(state: BridgeState, selection: Selection): BridgeState {
  if (isExactReplay(state.processedRequests, selection)) return state
  if (state.complete || state.activeSeat === null) throw new RuleError('game_complete', 'The lesson is complete')
  const candidates = legalBridgeActions(state, state.activeSeat)
  const chosen = candidates.find((candidate) => candidate.id === selection.candidateId)
  if (!chosen || chosen.stateToken !== token(state)) throw new RuleError('stale_candidate', 'Candidate does not belong to the current trick')
  const seat = state.activeSeat
  const card = state.hands[seat].find((item) => item.id === chosen.action.cardId)
  if (!card) throw new RuleError('illegal_action', 'Card is not in the active hand')
  const hands = { ...state.hands, [seat]: state.hands[seat].filter((item) => item.id !== card.id) }
  const trick = [...state.trick, { seat, card }]
  let next: BridgeState = {
    ...state, revision: state.revision + 1, hands, trick, activeSeat: nextSeat(seat),
    processedRequests: [...state.processedRequests, receiptFor(selection)],
    events: [...state.events, { revision: state.revision + 1, key: 'event.cardPlayed', actor: seat, cards: [card] }],
  }
  if (trick.length === 4) {
    const winner = trickWinner(trick, state.trump)
    const team = winner === 'north' || winner === 'south' ? 'northSouth' : 'eastWest'
    const tricks = { ...state.tricks, [team]: state.tricks[team] + 1 }
    const completedTricks = [...state.completedTricks, trick]
    const complete = completedTricks.length === 5
    next = {
      ...next, trick: [], completedTricks, tricks, leader: winner, activeSeat: complete ? null : winner, complete,
      events: [...next.events, { revision: next.revision, key: 'event.trickWon', actor: winner }, ...(complete ? [{ revision: next.revision, key: 'event.bridgeLessonComplete' }] : [])],
    }
  }
  return next
}

export function publicBridgeView(state: BridgeState, viewer: BridgeSeat | 'spectator'): BridgePublicView {
  const hands = Object.fromEntries(seatOrder.map((seat) => [seat, seat === viewer ? state.hands[seat] : state.hands[seat].map(() => null)])) as unknown as BridgePublicView['hands']
  const { seed: _seed, unusedDeck: _unused, processedRequests: _processed, ...safe } = state
  void _seed; void _unused; void _processed
  return { ...safe, hands, unusedCardCount: state.unusedDeck.length, limitationKey: 'limit.bridgeMini' }
}

export function bridgeAgentCandidate(state: BridgeState): Candidate<BridgeAction> {
  if (state.activeSeat === null) throw new RuleError('game_complete', 'The lesson is complete')
  const legal = legalBridgeActions(state, state.activeSeat)
  return [...legal].sort((left, right) => left.action.cardId.localeCompare(right.action.cardId))[0] as Candidate<BridgeAction>
}
