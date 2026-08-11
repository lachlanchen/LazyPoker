import { assertUniqueCards, makeDeck, shuffleDeck } from './cards'
import { bindCandidate, stableHash } from './hash'
import { compareHands, evaluateHoldem, type HandValue } from './handEvaluator'
import { isExactReplay, receiptFor } from './idempotency'
import { RuleError, type Candidate, type Card, type ChronicleEvent, type MutationReceipt, type Selection } from './types'

export type HoldemPlayerId = 'hero' | 'villain'
export type HoldemPhase = 'preflop' | 'flop' | 'turn' | 'river' | 'complete'
export type HoldemAction =
  | { readonly kind: 'fold' }
  | { readonly kind: 'check' }
  | { readonly kind: 'call'; readonly to: number }
  | { readonly kind: 'bet'; readonly to: number }
  | { readonly kind: 'raise'; readonly to: number }

export interface HoldemPlayer {
  readonly id: HoldemPlayerId
  readonly stack: number
  readonly hole: readonly Card[]
  readonly contribution: number
  readonly totalContribution: number
  readonly folded: boolean
  readonly allIn: boolean
}

export interface HoldemState {
  readonly kind: 'holdem'
  readonly sessionId: string
  readonly seed: string
  readonly revision: number
  readonly phase: HoldemPhase
  readonly dealer: HoldemPlayerId
  readonly activePlayer: HoldemPlayerId | null
  readonly players: readonly [HoldemPlayer, HoldemPlayer]
  readonly community: readonly Card[]
  readonly deck: readonly Card[]
  readonly deckIndex: number
  readonly pot: number
  readonly currentBet: number
  readonly minRaise: number
  readonly needsAction: readonly HoldemPlayerId[]
  readonly events: readonly ChronicleEvent[]
  readonly processedRequests: readonly MutationReceipt[]
  readonly winnerIds: readonly HoldemPlayerId[]
}

export interface HoldemPublicPlayer extends Omit<HoldemPlayer, 'hole'> {
  readonly hole: readonly (Card | null)[]
}

export interface HoldemPublicView extends Omit<HoldemState, 'seed' | 'deck' | 'players' | 'processedRequests'> {
  readonly players: readonly [HoldemPublicPlayer, HoldemPublicPlayer]
  readonly remainingCards: number
}

const STARTING_STACK = 1_000
const SMALL_BLIND = 10
const BIG_BLIND = 20

function otherPlayer(id: HoldemPlayerId): HoldemPlayerId {
  return id === 'hero' ? 'villain' : 'hero'
}

function playerById(state: HoldemState, id: HoldemPlayerId): HoldemPlayer {
  return state.players.find((player) => player.id === id) as HoldemPlayer
}

function stateToken(state: HoldemState): string {
  return `h_${stableHash(state)}`
}

function replacePlayer(state: HoldemState, updated: HoldemPlayer): HoldemState['players'] {
  return state.players.map((player) => player.id === updated.id ? updated : player) as unknown as HoldemState['players']
}

export function initialHoldemState(seed: string, sessionId = `holdem_${stableHash(seed)}`): HoldemState {
  const deck = shuffleDeck(seed)
  const heroHole = [deck[0], deck[2]] as Card[]
  const villainHole = [deck[1], deck[3]] as Card[]
  assertUniqueCards([...heroHole, ...villainHole])
  return {
    kind: 'holdem', sessionId, seed, revision: 0, phase: 'preflop', dealer: 'hero', activePlayer: 'hero',
    players: [
      { id: 'hero', stack: STARTING_STACK - SMALL_BLIND, hole: heroHole, contribution: SMALL_BLIND, totalContribution: SMALL_BLIND, folded: false, allIn: false },
      { id: 'villain', stack: STARTING_STACK - BIG_BLIND, hole: villainHole, contribution: BIG_BLIND, totalContribution: BIG_BLIND, folded: false, allIn: false },
    ],
    community: [], deck, deckIndex: 4, pot: 0, currentBet: BIG_BLIND, minRaise: BIG_BLIND,
    needsAction: ['hero', 'villain'], processedRequests: [], winnerIds: [],
    events: [
      { revision: 0, key: 'event.handStarted' },
      { revision: 0, key: 'event.smallBlind', actor: 'hero', amount: SMALL_BLIND },
      { revision: 0, key: 'event.bigBlind', actor: 'villain', amount: BIG_BLIND },
    ],
  }
}

function candidate(state: HoldemState, action: HoldemAction, labelKey: string, amount?: number): Candidate<HoldemAction> {
  const token = stateToken(state)
  const actorId = state.activePlayer as HoldemPlayerId
  return { id: bindCandidate(token, actorId, action), stateToken: token, actorId, action, labelKey, ...(amount === undefined ? {} : { amount }) }
}

export function legalHoldemActions(state: HoldemState, actorId: HoldemPlayerId): Candidate<HoldemAction>[] {
  if (state.phase === 'complete' || state.activePlayer === null) return []
  if (actorId !== state.activePlayer) throw new RuleError('not_your_turn', `It is ${state.activePlayer}'s turn`)
  const actor = playerById(state, actorId)
  const opponent = playerById(state, otherPlayer(actorId))
  if (actor.folded || actor.allIn) return []
  const toCall = Math.max(0, state.currentBet - actor.contribution)
  const actions: Candidate<HoldemAction>[] = []
  if (toCall > 0) {
    actions.push(candidate(state, { kind: 'fold' }, 'action.fold'))
    const callTo = actor.contribution + Math.min(actor.stack, toCall)
    actions.push(candidate(state, { kind: 'call', to: callTo }, 'action.call', callTo - actor.contribution))
  } else {
    actions.push(candidate(state, { kind: 'check' }, 'action.check'))
  }

  const maximumTarget = Math.min(actor.contribution + actor.stack, opponent.contribution + opponent.stack)
  if (state.currentBet === 0) {
    const targets = [...new Set([Math.min(BIG_BLIND, maximumTarget), Math.min(Math.max(BIG_BLIND, Math.floor((state.pot + 1) / 2)), maximumTarget), maximumTarget])]
      .filter((target) => target > 0)
    for (const target of targets) actions.push(candidate(state, { kind: 'bet', to: target }, target === maximumTarget ? 'action.allInBet' : 'action.bet', target))
  } else {
    const minimumTarget = state.currentBet + state.minRaise
    if (maximumTarget >= minimumTarget) {
      const potTarget = state.currentBet + Math.max(state.minRaise, state.pot + state.players.reduce((sum, player) => sum + player.contribution, 0))
      const targets = [...new Set([minimumTarget, Math.min(potTarget, maximumTarget), maximumTarget])].filter((target) => target >= minimumTarget && target <= maximumTarget)
      for (const target of targets) actions.push(candidate(state, { kind: 'raise', to: target }, target === maximumTarget ? 'action.allInRaise' : 'action.raise', target - actor.contribution))
    }
  }
  return actions
}

function settleStreet(state: HoldemState): HoldemState {
  const added = state.players.reduce((sum, player) => sum + player.contribution, 0)
  return { ...state, pot: state.pot + added, currentBet: 0, players: state.players.map((player) => ({ ...player, contribution: 0 })) as unknown as HoldemState['players'] }
}

function showdown(state: HoldemState): HoldemState {
  let complete = settleStreet(state)
  let deckIndex = complete.deckIndex
  const community = [...complete.community]
  while (community.length < 5) {
    deckIndex += 1 // burn
    community.push(complete.deck[deckIndex] as Card)
    deckIndex += 1
  }
  const [hero, villain] = complete.players
  const comparison = compareHands(evaluateHoldem([...hero.hole, ...community]), evaluateHoldem([...villain.hole, ...community]))
  const winnerIds: HoldemPlayerId[] = comparison > 0 ? ['hero'] : comparison < 0 ? ['villain'] : ['hero', 'villain']
  const share = Math.floor(complete.pot / winnerIds.length)
  let remainder = complete.pot - share * winnerIds.length
  const paid = complete.players.map((player) => {
    if (!winnerIds.includes(player.id)) return player
    const oddChip = remainder > 0 ? 1 : 0
    remainder -= oddChip
    return { ...player, stack: player.stack + share + oddChip }
  }) as unknown as HoldemState['players']
  const resultEvent: ChronicleEvent = winnerIds.length === 2
    ? { revision: complete.revision, key: 'event.splitPot', amount: share }
    : { revision: complete.revision, key: 'event.showdownWon', actor: winnerIds[0] as HoldemPlayerId, amount: share }
  complete = { ...complete, community, deckIndex, players: paid, pot: 0, phase: 'complete', activePlayer: null, needsAction: [], winnerIds, events: [...complete.events, resultEvent] }
  return complete
}

function finishFold(state: HoldemState, folder: HoldemPlayerId): HoldemState {
  const settled = settleStreet(state)
  const winnerId = otherPlayer(folder)
  const winner = playerById(settled, winnerId)
  return {
    ...settled, phase: 'complete', activePlayer: null, needsAction: [], winnerIds: [winnerId], pot: 0,
    players: replacePlayer(settled, { ...winner, stack: winner.stack + settled.pot }),
    events: [...settled.events, { revision: settled.revision, key: 'event.foldWon', actor: winnerId, amount: settled.pot }],
  }
}

function nextStreet(state: HoldemState): HoldemState {
  const settled = settleStreet(state)
  if (settled.phase === 'river') return showdown(settled)
  const drawCount = settled.phase === 'preflop' ? 3 : 1
  let deckIndex = settled.deckIndex + 1 // burn
  const community = [...settled.community, ...settled.deck.slice(deckIndex, deckIndex + drawCount)]
  deckIndex += drawCount
  const phase: HoldemPhase = settled.phase === 'preflop' ? 'flop' : settled.phase === 'flop' ? 'turn' : 'river'
  const live = settled.players.filter((player) => !player.folded && !player.allIn).map((player) => player.id)
  const ordered = (['villain', 'hero'] as HoldemPlayerId[]).filter((id) => live.includes(id))
  const advanced: HoldemState = { ...settled, phase, community, deckIndex, minRaise: BIG_BLIND, needsAction: ordered, activePlayer: ordered[0] ?? null, events: [...settled.events, { revision: settled.revision, key: `event.${phase}`, cards: community.slice(-drawCount) }] }
  return ordered.length < 2 ? showdown(advanced) : advanced
}

export function applyHoldemAction(state: HoldemState, selection: Selection): HoldemState {
  if (isExactReplay(state.processedRequests, selection)) return state
  if (state.phase === 'complete' || state.activePlayer === null) throw new RuleError('game_complete', 'The hand is complete')
  const legal = legalHoldemActions(state, state.activePlayer)
  const selected = legal.find((item) => item.id === selection.candidateId)
  if (!selected || selected.stateToken !== stateToken(state)) throw new RuleError('stale_candidate', 'Candidate does not belong to the current state')
  const actorId = state.activePlayer
  let next: HoldemState = { ...state, revision: state.revision + 1, processedRequests: [...state.processedRequests, receiptFor(selection)] }
  const action = selected.action
  if (action.kind === 'fold') {
    const actor = playerById(next, actorId)
    next = { ...next, players: replacePlayer(next, { ...actor, folded: true }), events: [...next.events, { revision: next.revision, key: 'event.folded', actor: actorId }] }
    return finishFold(next, actorId)
  }
  const actor = playerById(next, actorId)
  const target = action.kind === 'check' ? actor.contribution : action.to
  const payment = target - actor.contribution
  if (payment < 0 || payment > actor.stack) throw new RuleError('illegal_action', 'Invalid chip payment')
  const updated = { ...actor, stack: actor.stack - payment, contribution: target, totalContribution: actor.totalContribution + payment, allIn: actor.stack === payment }
  next = { ...next, players: replacePlayer(next, updated) }
  let needsAction = next.needsAction.filter((id) => id !== actorId)
  if (action.kind === 'bet' || action.kind === 'raise') {
    const raiseSize = target - state.currentBet
    next = { ...next, currentBet: target, minRaise: Math.max(state.minRaise, raiseSize) }
    needsAction = [otherPlayer(actorId)].filter((id) => !playerById(next, id).allIn)
  }
  const eventKey = `event.${action.kind}`
  next = { ...next, needsAction, activePlayer: needsAction[0] ?? null, events: [...next.events, { revision: next.revision, key: eventKey, actor: actorId, ...(payment > 0 ? { amount: payment } : {}) }] }
  if (needsAction.length === 0) return nextStreet(next)
  return next
}

export function publicHoldemView(state: HoldemState, viewerId: HoldemPlayerId | 'spectator'): HoldemPublicView {
  const revealAll = state.phase === 'complete' && state.winnerIds.length !== 1 || state.phase === 'complete' && !state.players.some((player) => player.folded)
  const players = state.players.map((player) => ({ ...player, hole: player.id === viewerId || revealAll ? player.hole : [null, null] })) as unknown as HoldemPublicView['players']
  const { seed: _seed, deck: _deck, processedRequests: _processed, ...safe } = state
  void _seed; void _deck; void _processed
  return { ...safe, players, remainingCards: 52 - state.deckIndex }
}

export function previewHoldemAction(state: HoldemState, candidateId: string): HoldemState {
  return applyHoldemAction(state, { candidateId, clientRequestId: `preview_${candidateId}` })
}

export interface EquityEstimate {
  readonly hero: number
  readonly tie: number
  readonly villain: number
  readonly samples: number
  readonly provenance: 'calculated'
}

export function estimateVisibleEquity(view: HoldemPublicView, viewerId: HoldemPlayerId, samples = 600): EquityEstimate {
  const viewer = view.players.find((player) => player.id === viewerId)
  if (!viewer) throw new Error('Viewer is not seated at this table')
  const viewerHole = viewer.hole.filter((card): card is Card => card !== null)
  if (viewerHole.length !== 2) throw new Error('Equity requires the viewer-authorized hole cards')
  const opponent = view.players.find((player) => player.id !== viewerId)
  const revealedOpponentHole = opponent?.hole.filter((card): card is Card => card !== null) ?? []
  const visibleCards = [...viewerHole, ...revealedOpponentHole, ...view.community]
  const known = new Set(visibleCards.map((card) => card.id))
  const available = makeDeck().filter((card) => !known.has(card.id))
  const availableIds = new Set(available.map((card) => card.id))
  const observationFingerprint = stableHash({
    community: view.community.map((card) => card.id),
    opponentHole: revealedOpponentHole.map((card) => card.id),
    viewerHole: viewerHole.map((card) => card.id),
    viewerId,
  })
  let wins = 0; let losses = 0; let ties = 0
  const count = Math.max(1, samples)
  for (let sample = 0; sample < count; sample += 1) {
    const shuffled = shuffleDeck(`equity:${observationFingerprint}:${sample}`).filter((card) => availableIds.has(card.id))
    const opponentHole = revealedOpponentHole.length === 2 ? revealedOpponentHole : shuffled.slice(0, 2)
    const drawOffset = revealedOpponentHole.length === 2 ? 0 : 2
    const board = [...view.community, ...shuffled.slice(drawOffset, drawOffset + 5 - view.community.length)]
    const result = compareHands(evaluateHoldem([...viewerHole, ...board]), evaluateHoldem([...opponentHole, ...board]))
    if (result > 0) wins += 1
    else if (result < 0) losses += 1
    else ties += 1
  }
  return { hero: wins / count, tie: ties / count, villain: losses / count, samples: count, provenance: 'calculated' }
}

export function currentHandValue(state: HoldemState, viewerId: HoldemPlayerId): HandValue | null {
  const cards = [...playerById(state, viewerId).hole, ...state.community]
  return cards.length >= 5 ? evaluateHoldem(cards) : null
}

export function chipTotal(state: HoldemState): number {
  return state.pot + state.players.reduce((sum, player) => sum + player.stack + player.contribution, 0)
}
