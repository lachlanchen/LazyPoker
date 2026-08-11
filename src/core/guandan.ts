import { shuffleDeck } from './cards'
import { bindCandidate, stableHash } from './hash'
import { isExactReplay, receiptFor } from './idempotency'
import { RuleError, type Candidate, type Card, type ChronicleEvent, type MutationReceipt, type Selection } from './types'

export type GuandanSeat = 'you' | 'right' | 'partner' | 'left'
export type GuandanAction = { readonly kind: 'play-single'; readonly cardId: string } | { readonly kind: 'pass' }
export interface GuandanPlay { readonly seat: GuandanSeat; readonly card: Card }
export interface GuandanState {
  readonly kind: 'guandan'
  readonly sessionId: string
  readonly seed: string
  readonly revision: number
  readonly activeSeat: GuandanSeat | null
  readonly leader: GuandanSeat
  readonly hands: Readonly<Record<GuandanSeat, readonly Card[]>>
  readonly currentPlay: GuandanPlay | null
  readonly passes: number
  readonly responseQueue: readonly GuandanSeat[]
  readonly finishOrder: readonly GuandanSeat[]
  readonly events: readonly ChronicleEvent[]
  readonly processedRequests: readonly MutationReceipt[]
  readonly unusedDeck: readonly Card[]
  readonly complete: boolean
}

export interface GuandanPublicView extends Omit<GuandanState, 'seed' | 'hands' | 'unusedDeck' | 'processedRequests'> {
  readonly hands: Readonly<Record<GuandanSeat, readonly (Card | null)[]>>
  readonly unusedCardCount: number
  readonly limitationKey: 'limit.guandanMini'
}

const seats: readonly GuandanSeat[] = ['you', 'right', 'partner', 'left']
function nextSeat(seat: GuandanSeat, finished: readonly GuandanSeat[]): GuandanSeat {
  let index = seats.indexOf(seat)
  do index = (index + 1) % seats.length
  while (finished.includes(seats[index] as GuandanSeat))
  return seats[index] as GuandanSeat
}
function eligibleSeatsAfter(seat: GuandanSeat, finished: readonly GuandanSeat[]): GuandanSeat[] {
  const start = seats.indexOf(seat)
  return [1, 2, 3]
    .map((offset) => seats[(start + offset) % seats.length] as GuandanSeat)
    .filter((candidate) => !finished.includes(candidate))
}
function token(state: GuandanState): string { return `g_${stableHash(state)}` }

export function initialGuandanState(seed: string, sessionId = `guandan_${stableHash(seed)}`): GuandanState {
  const deck = shuffleDeck(seed)
  const hands = Object.fromEntries(seats.map((seat, seatIndex) => [seat, deck.filter((_, index) => index % 4 === seatIndex).slice(0, 6).sort((a, b) => a.rank - b.rank)])) as unknown as GuandanState['hands']
  return { kind: 'guandan', sessionId, seed, revision: 0, activeSeat: 'you', leader: 'you', hands, currentPlay: null, passes: 0, responseQueue: [], finishOrder: [], events: [{ revision: 0, key: 'event.guandanLessonStarted' }], processedRequests: [], unusedDeck: deck.slice(24), complete: false }
}

export function legalGuandanActions(state: GuandanState, actor: GuandanSeat): Candidate<GuandanAction>[] {
  if (state.complete || state.activeSeat === null) return []
  if (actor !== state.activeSeat) throw new RuleError('not_your_turn', `It is ${state.activeSeat}'s turn`)
  const stateToken = token(state)
  const minimum = state.currentPlay?.card.rank ?? 1
  const cards = state.hands[actor].filter((card) => state.currentPlay === null || card.rank > minimum)
  const result: Candidate<GuandanAction>[] = cards.map((card) => {
    const action = { kind: 'play-single', cardId: card.id } as const
    return { id: bindCandidate(stateToken, actor, action), stateToken, actorId: actor, action, labelKey: 'action.playSingle' }
  })
  if (state.currentPlay && state.currentPlay.seat !== actor) {
    const action = { kind: 'pass' } as const
    result.push({ id: bindCandidate(stateToken, actor, action), stateToken, actorId: actor, action, labelKey: 'action.pass' })
  }
  return result
}

export function applyGuandanAction(state: GuandanState, selection: Selection): GuandanState {
  if (isExactReplay(state.processedRequests, selection)) return state
  if (state.complete || state.activeSeat === null) throw new RuleError('game_complete', 'The lesson is complete')
  const candidates = legalGuandanActions(state, state.activeSeat)
  const chosen = candidates.find((candidate) => candidate.id === selection.candidateId)
  if (!chosen || chosen.stateToken !== token(state)) throw new RuleError('stale_candidate', 'Candidate does not belong to the current state')
  const seat = state.activeSeat
  let hands = state.hands
  let currentPlay = state.currentPlay
  let passes = state.passes
  let responseQueue = [...state.responseQueue]
  const finishOrder = [...state.finishOrder]
  const events = [...state.events]
  if (chosen.action.kind === 'pass') {
    passes += 1
    responseQueue = responseQueue.filter((candidate) => candidate !== seat)
    events.push({ revision: state.revision + 1, key: 'event.passed', actor: seat })
  } else {
    const cardId = chosen.action.cardId
    const card = state.hands[seat].find((item) => item.id === cardId)
    if (!card) throw new RuleError('illegal_action', 'Card is not in the active hand')
    hands = { ...hands, [seat]: state.hands[seat].filter((item) => item.id !== card.id) }
    currentPlay = { seat, card }
    passes = 0
    events.push({ revision: state.revision + 1, key: 'event.cardPlayed', actor: seat, cards: [card] })
    if (hands[seat].length === 0) finishOrder.push(seat)
    responseQueue = eligibleSeatsAfter(seat, finishOrder)
  }
  const complete = finishOrder.length >= 2
  let leader = state.leader
  let activeSeat: GuandanSeat | null = complete ? null : responseQueue[0] ?? null
  if (!complete && responseQueue.length === 0 && currentPlay) {
    leader = currentPlay.seat
    currentPlay = null
    passes = 0
    activeSeat = finishOrder.includes(leader) ? nextSeat(leader, finishOrder) : leader
    events.push({ revision: state.revision + 1, key: 'event.trickReset', actor: activeSeat })
  }
  return { ...state, revision: state.revision + 1, activeSeat, leader, hands, currentPlay, passes, responseQueue: complete ? [] : responseQueue, finishOrder, complete, events: [...events, ...(complete ? [{ revision: state.revision + 1, key: 'event.guandanLessonComplete' }] : [])], processedRequests: [...state.processedRequests, receiptFor(selection)] }
}

export function publicGuandanView(state: GuandanState, viewer: GuandanSeat | 'spectator'): GuandanPublicView {
  const hands = Object.fromEntries(seats.map((seat) => [seat, seat === viewer ? state.hands[seat] : state.hands[seat].map(() => null)])) as unknown as GuandanPublicView['hands']
  const { seed: _seed, unusedDeck: _unused, processedRequests: _processed, ...safe } = state
  void _seed; void _unused; void _processed
  return { ...safe, hands, unusedCardCount: state.unusedDeck.length, limitationKey: 'limit.guandanMini' }
}

export function guandanAgentCandidate(state: GuandanState): Candidate<GuandanAction> {
  if (state.activeSeat === null) throw new RuleError('game_complete', 'The lesson is complete')
  const legal = legalGuandanActions(state, state.activeSeat)
  return legal.find((candidate) => candidate.action.kind !== 'pass') ?? legal[0] as Candidate<GuandanAction>
}
