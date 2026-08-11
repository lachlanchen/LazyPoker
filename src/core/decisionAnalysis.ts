import { makeDeck } from './cards'
import { compareHands, evaluateHoldem } from './handEvaluator'
import type { BridgeAction, BridgePlay, BridgePublicView, BridgeSeat } from './bridge'
import type { GuandanAction, GuandanPublicView, GuandanSeat } from './guandan'
import { estimateVisibleEquity, type HoldemAction, type HoldemPlayerId, type HoldemPublicView } from './holdem'
import type { Candidate, Card, EvidenceKind, Suit } from './types'

interface TeachingSequence {
  readonly purposeKey: string
  readonly purposeEvidence: EvidenceKind
  readonly replyKey: string
  readonly replyEvidence: EvidenceKind
  readonly nextKey: string
  readonly failureKey: string | null
}

export type BoardPairing = 'empty' | 'unpaired' | 'paired' | 'double-paired' | 'trips' | 'full-house' | 'quads'
export type BoardSuits = 'empty' | 'rainbow' | 'two-tone' | 'three-suit' | 'four-suit' | 'monotone'
export type BoardConnection = 'empty' | 'connected' | 'gapped'

export interface HoldemActionImpact extends TeachingSequence {
  readonly candidateId: string
  readonly kind: HoldemAction['kind']
  readonly risk: number
  readonly potAfter: number
  readonly stackAfter: number
  readonly potOdds: number | null
  readonly potFraction: number
}

export interface HoldemDecisionAnalysis {
  readonly kind: 'holdem'
  readonly pot: number
  readonly callPrice: number
  readonly effectiveStack: number
  readonly equity: number
  readonly equitySamples: number
  readonly pairing: BoardPairing
  readonly suits: BoardSuits
  readonly connection: BoardConnection
  readonly nextCardStatus: 'available' | 'before-flop' | 'board-complete' | 'hand-complete'
  readonly nextCardAvailable: boolean
  readonly improvingOuts: readonly Card[]
  readonly unseenCount: number
  readonly candidates: readonly HoldemActionImpact[]
  readonly suggestionId: string | null
  readonly suggestionReasonKey: string
}

export interface BridgeActionImpact extends TeachingSequence {
  readonly candidateId: string
  readonly card: Card
  readonly opensTrick: boolean
  readonly winsNow: boolean
  readonly winnerAfter: BridgeSeat
  readonly rankCost: number
  readonly legalChoiceCount: number
}

export interface BridgeDecisionAnalysis {
  readonly kind: 'bridge'
  readonly ledSuit: Suit | null
  readonly trump: Suit
  readonly trickProgress: number
  readonly currentWinner: BridgeSeat | null
  readonly currentWinningCard: Card | null
  readonly partnerAhead: boolean
  readonly legalSuit: Suit | null
  readonly suitCounts: Readonly<Record<Suit, number>>
  readonly candidates: readonly BridgeActionImpact[]
  readonly suggestionId: string | null
  readonly suggestionReasonKey: string
}

export interface GuandanActionImpact extends TeachingSequence {
  readonly candidateId: string
  readonly kind: GuandanAction['kind']
  readonly card: Card | null
  readonly reserveCost: number | null
  readonly nextSeat: GuandanSeat | null
  readonly establishesLead: boolean
  readonly completesLesson: boolean
}

export interface GuandanInitiativeEntry {
  readonly seat: GuandanSeat
  readonly status: 'owner' | 'active' | 'waiting'
  readonly position: number | null
}

export interface GuandanDecisionAnalysis {
  readonly kind: 'guandan'
  readonly activeSeat: GuandanSeat | null
  readonly threshold: number | null
  readonly legalPlayContext: 'lead' | 'response' | 'complete'
  readonly legalPlayCount: number | null
  readonly passes: number
  readonly responseQueue: readonly GuandanSeat[]
  readonly initiativeOrder: readonly GuandanInitiativeEntry[]
  readonly leader: GuandanSeat
  readonly currentOwner: GuandanSeat | null
  readonly partnerAhead: boolean
  readonly partnerFinished: boolean
  readonly handCounts: Readonly<Record<GuandanSeat, number>>
  readonly candidates: readonly GuandanActionImpact[]
  readonly suggestionId: string | null
  readonly suggestionReasonKey: string
}

export type DecisionAnalysis = HoldemDecisionAnalysis | BridgeDecisionAnalysis | GuandanDecisionAnalysis

function visibleCards(cards: readonly (Card | null)[]): Card[] {
  return cards.filter((card): card is Card => card !== null)
}

function boardPairing(board: readonly Card[]): BoardPairing {
  if (board.length === 0) return 'empty'
  const counts = [...new Set(board.map((card) => card.rank))]
    .map((rank) => board.filter((card) => card.rank === rank).length)
    .sort((left, right) => right - left)
  if (counts[0] === 4) return 'quads'
  if (counts[0] === 3 && counts[1] === 2) return 'full-house'
  if (counts[0] === 3) return 'trips'
  const pairs = counts.filter((count) => count === 2).length
  return pairs >= 2 ? 'double-paired' : pairs === 1 ? 'paired' : 'unpaired'
}

function boardSuits(board: readonly Card[]): BoardSuits {
  if (board.length === 0) return 'empty'
  const suitCount = new Set(board.map((card) => card.suit)).size
  if (suitCount === 1) return 'monotone'
  if (suitCount === 2) return 'two-tone'
  if (suitCount === 3) return board.length === 3 ? 'rainbow' : 'three-suit'
  return 'four-suit'
}

function boardConnection(board: readonly Card[]): BoardConnection {
  if (board.length === 0) return 'empty'
  const ranks = [...new Set(board.flatMap((card) => card.rank === 14 ? [14, 1] : [card.rank]))].sort((left, right) => left - right)
  const connected = ranks.some((rank, index) => ranks.slice(index + 1).some((other) => other - rank <= 2))
  return connected ? 'connected' : 'gapped'
}

function handImprovingCards(view: HoldemPublicView, viewerId: HoldemPlayerId): { cards: Card[]; unseenCount: number } {
  const player = view.players.find((item) => item.id === viewerId)
  const hole = visibleCards(player?.hole ?? [])
  const known = [...hole, ...view.community, ...view.players.flatMap((item) => item.id === viewerId ? [] : visibleCards(item.hole))]
  const unseen = makeDeck().filter((card) => !known.some((visible) => visible.id === card.id))
  const combined = [...hole, ...view.community]
  if (view.phase === 'complete' || combined.length < 5 || view.community.length >= 5) return { cards: [], unseenCount: unseen.length }
  const current = evaluateHoldem(combined)
  return {
    cards: unseen.filter((card) => compareHands(evaluateHoldem([...combined, card]), current) > 0),
    unseenCount: unseen.length,
  }
}

function holdemImpact(view: HoldemPublicView, candidate: Candidate<HoldemAction>, viewerId: HoldemPlayerId): HoldemActionImpact {
  const actor = view.players.find((player) => player.id === viewerId)
  if (!actor) throw new Error('Viewer is not seated at this table')
  const tablePot = view.pot + view.players.reduce((sum, player) => sum + player.contribution, 0)
  const target = candidate.action.kind === 'fold' || candidate.action.kind === 'check' ? actor.contribution : candidate.action.to
  const risk = Math.max(0, target - actor.contribution)
  const potAfter = tablePot + risk
  const potOdds = candidate.action.kind === 'call' && risk > 0 ? risk / potAfter : null
  const aggressive = candidate.action.kind === 'bet' || candidate.action.kind === 'raise'
  return {
    candidateId: candidate.id,
    kind: candidate.action.kind,
    risk,
    potAfter,
    stackAfter: actor.stack - risk,
    potOdds,
    potFraction: tablePot > 0 ? risk / tablePot : 0,
    purposeKey: `strategy.${candidate.action.kind}`,
    purposeEvidence: 'authored',
    replyKey: aggressive ? 'coach.holdem.replyPressure' : candidate.action.kind === 'fold' ? 'coach.holdem.replyFold' : 'coach.holdem.replyPassive',
    replyEvidence: 'authored',
    nextKey: 'coach.holdem.next',
    failureKey: 'coach.holdem.failure',
  }
}

function chooseHoldemSuggestion(impacts: readonly HoldemActionImpact[], equity: number): { id: string | null; reasonKey: string } {
  const check = impacts.find((impact) => impact.kind === 'check')
  const call = impacts.find((impact) => impact.kind === 'call')
  const fold = impacts.find((impact) => impact.kind === 'fold')
  const smallestAggression = impacts
    .filter((impact) => impact.kind === 'bet' || impact.kind === 'raise')
    .sort((left, right) => left.risk - right.risk)[0]
  if (call && call.potOdds !== null) {
    if (equity + 0.04 < call.potOdds && fold) return { id: fold.candidateId, reasonKey: 'suggestion.holdemPriceFold' }
    if (equity >= 0.62 && smallestAggression && smallestAggression.potFraction <= 1.25) return { id: smallestAggression.candidateId, reasonKey: 'suggestion.holdemValuePressure' }
    return { id: call.candidateId, reasonKey: 'suggestion.holdemPriceContinue' }
  }
  if (check) {
    if (equity >= 0.58 && smallestAggression && smallestAggression.potFraction <= 1) return { id: smallestAggression.candidateId, reasonKey: 'suggestion.holdemValuePressure' }
    return { id: check.candidateId, reasonKey: 'suggestion.holdemFreeCard' }
  }
  return { id: impacts[0]?.candidateId ?? null, reasonKey: 'suggestion.authoredBaseline' }
}

export function analyzeHoldemDecision(
  view: HoldemPublicView,
  viewerId: HoldemPlayerId,
  legalCandidates: readonly Candidate<HoldemAction>[],
  samples = 480,
): HoldemDecisionAnalysis {
  const viewer = view.players.find((player) => player.id === viewerId)
  if (!viewer || visibleCards(viewer.hole).length !== 2) throw new Error('Analysis requires the viewer-authorized hole cards')
  const opponent = view.players.find((player) => player.id !== viewerId)
  const pot = view.pot + view.players.reduce((sum, player) => sum + player.contribution, 0)
  const callPrice = Math.max(0, view.currentBet - viewer.contribution)
  const equityEstimate = estimateVisibleEquity(view, viewerId, samples)
  const equity = equityEstimate.hero + equityEstimate.tie / 2
  const improving = handImprovingCards(view, viewerId)
  const nextCardStatus = view.community.length >= 5
    ? 'board-complete'
    : view.phase === 'complete'
      ? 'hand-complete'
      : view.community.length < 3
        ? 'before-flop'
        : 'available'
  const candidates = legalCandidates.filter((candidate) => candidate.actorId === viewerId).map((candidate) => holdemImpact(view, candidate, viewerId))
  const suggestion = chooseHoldemSuggestion(candidates, equity)
  return {
    kind: 'holdem', pot, callPrice, effectiveStack: Math.min(viewer.stack, opponent?.stack ?? viewer.stack),
    equity, equitySamples: equityEstimate.samples, pairing: boardPairing(view.community), suits: boardSuits(view.community),
    connection: boardConnection(view.community), improvingOuts: improving.cards, unseenCount: improving.unseenCount,
    nextCardStatus, nextCardAvailable: nextCardStatus === 'available',
    candidates, suggestionId: suggestion.id, suggestionReasonKey: suggestion.reasonKey,
  }
}

function winningBridgePlay(trick: readonly BridgePlay[], trump: Suit): BridgePlay | null {
  const first = trick[0]
  if (!first) return null
  const ledSuit = first.card.suit
  const priority = (play: BridgePlay) => play.card.suit === trump ? 2 : play.card.suit === ledSuit ? 1 : 0
  return trick.slice(1).reduce((winner, play) => priority(play) > priority(winner) || priority(play) === priority(winner) && play.card.suit === winner.card.suit && play.card.rank > winner.card.rank ? play : winner, first)
}

const suits: readonly Suit[] = ['clubs', 'diamonds', 'hearts', 'spades']
const bridgePartners: Readonly<Record<BridgeSeat, BridgeSeat>> = { north: 'south', east: 'west', south: 'north', west: 'east' }

export function analyzeBridgeDecision(
  view: BridgePublicView,
  viewer: BridgeSeat,
  legalCandidates: readonly Candidate<BridgeAction>[],
): BridgeDecisionAnalysis {
  const hand = visibleCards(view.hands[viewer])
  const partner = bridgePartners[viewer]
  const current = winningBridgePlay(view.trick, view.trump)
  const ledSuit = view.trick[0]?.card.suit ?? null
  const legalCards = legalCandidates.flatMap((candidate) => {
    const action = candidate.action
    const card = hand.find((item) => item.id === action.cardId)
    return card ? [card] : []
  })
  const resolvesTrick = view.trick.length === 3
  const completesLesson = resolvesTrick && view.completedTricks.length === 4
  const candidates = legalCandidates.flatMap((candidate): BridgeActionImpact[] => {
    if (candidate.actorId !== viewer) return []
    const card = hand.find((item) => item.id === candidate.action.cardId)
    if (!card) return []
    const winner = winningBridgePlay([...view.trick, { seat: viewer, card }], view.trump) as BridgePlay
    return [{
      candidateId: candidate.id, card, opensTrick: current === null, winsNow: current !== null && winner.seat === viewer, winnerAfter: winner.seat,
      rankCost: legalCards.filter((item) => item.rank <= card.rank).length, legalChoiceCount: legalCards.length,
      purposeKey: current === null ? 'coach.bridge.purposeLead' : winner.seat === viewer ? 'coach.bridge.purposeWin' : current.seat === partner ? 'coach.bridge.purposePartner' : 'coach.bridge.purposeConserve',
      purposeEvidence: 'authored',
      replyKey: completesLesson ? 'coach.bridge.replyLessonComplete' : resolvesTrick ? 'coach.bridge.replyComplete' : 'coach.bridge.replyOpen',
      replyEvidence: resolvesTrick ? 'exact' : 'authored',
      nextKey: completesLesson ? 'coach.bridge.nextComplete' : resolvesTrick ? 'coach.bridge.nextResolved' : 'coach.bridge.next',
      failureKey: resolvesTrick ? null : 'coach.bridge.failure',
    }]
  })
  const partnerAhead = current?.seat === partner
  const lowest = [...candidates].sort((left, right) => left.card.rank - right.card.rank || left.card.id.localeCompare(right.card.id))[0]
  const cheapestWinner = [...candidates].filter((candidate) => candidate.winsNow).sort((left, right) => left.card.rank - right.card.rank || left.card.id.localeCompare(right.card.id))[0]
  const nonWinning = candidates.filter((candidate) => !candidate.winsNow)
  const nonWinningNonTrump = nonWinning.filter((candidate) => candidate.card.suit !== view.trump)
  const lowestNonWinner = [...(nonWinningNonTrump.length > 0 ? nonWinningNonTrump : nonWinning)]
    .sort((left, right) => left.card.rank - right.card.rank || left.card.id.localeCompare(right.card.id))[0]
  const nonTrump = candidates.filter((candidate) => candidate.card.suit !== view.trump)
  const longestNonTrumpCount = Math.max(0, ...nonTrump.map((candidate) => hand.filter((card) => card.suit === candidate.card.suit).length))
  const preferredOpeningLeads = nonTrump.filter((candidate) => hand.filter((card) => card.suit === candidate.card.suit).length === longestNonTrumpCount)
  const openingLead = [...(preferredOpeningLeads.length > 0 ? preferredOpeningLeads : candidates)]
    .sort((left, right) => left.card.rank - right.card.rank || left.card.id.localeCompare(right.card.id))[0]
  const suggestion = current === null ? openingLead : partnerAhead ? lowestNonWinner ?? lowest : cheapestWinner ?? lowest
  const suggestionReasonKey = current === null
    ? 'suggestion.bridgeOpeningLead'
    : partnerAhead && lowestNonWinner
      ? 'suggestion.bridgePartnerAhead'
      : partnerAhead
        ? 'suggestion.bridgeForcedOvertake'
        : cheapestWinner
          ? 'suggestion.bridgeCheapestWinner'
          : 'suggestion.bridgeConserve'
  return {
    kind: 'bridge', ledSuit, trump: view.trump, trickProgress: view.trick.length, currentWinner: current?.seat ?? null,
    currentWinningCard: current?.card ?? null, partnerAhead, legalSuit: ledSuit && hand.some((card) => card.suit === ledSuit) ? ledSuit : null,
    suitCounts: Object.fromEntries(suits.map((suit) => [suit, hand.filter((card) => card.suit === suit).length])) as Record<Suit, number>,
    candidates, suggestionId: suggestion?.candidateId ?? null, suggestionReasonKey,
  }
}

const guandanSeats: readonly GuandanSeat[] = ['you', 'right', 'partner', 'left']
const guandanPartners: Readonly<Record<GuandanSeat, GuandanSeat>> = { you: 'partner', right: 'left', partner: 'you', left: 'right' }

function guandanSeatsAfter(seat: GuandanSeat, finished: readonly GuandanSeat[]): GuandanSeat[] {
  const start = guandanSeats.indexOf(seat)
  return [1, 2, 3].map((offset) => guandanSeats[(start + offset) % guandanSeats.length] as GuandanSeat).filter((item) => !finished.includes(item))
}

export function analyzeGuandanDecision(
  view: GuandanPublicView,
  viewer: GuandanSeat,
  legalCandidates: readonly Candidate<GuandanAction>[],
): GuandanDecisionAnalysis {
  const hand = visibleCards(view.hands[viewer])
  const partner = guandanPartners[viewer]
  const rankPercentile = (card: Card) => hand.filter((item) => item.rank <= card.rank).length / Math.max(1, hand.length)
  const partnerFinished = view.finishOrder.includes(partner)
  const candidates = legalCandidates.flatMap((candidate): GuandanActionImpact[] => {
    if (candidate.actorId !== viewer) return []
    const action = candidate.action
    if (action.kind === 'pass') {
      const queue = view.responseQueue.filter((seat) => seat !== viewer)
      const nextSeat = queue[0] ?? (view.currentPlay ? view.finishOrder.includes(view.currentPlay.seat) ? guandanSeatsAfter(view.currentPlay.seat, view.finishOrder)[0] ?? null : view.currentPlay.seat : null)
      return [{
        candidateId: candidate.id, kind: 'pass', card: null, reserveCost: null, nextSeat,
        establishesLead: false, completesLesson: false,
        purposeKey: view.currentPlay?.seat === partner ? partnerFinished ? 'coach.guandan.purposeFinishedPartnerPass' : 'coach.guandan.purposePartner' : 'coach.guandan.purposePass',
        purposeEvidence: 'authored', replyKey: queue.length === 0 ? 'coach.guandan.replyReset' : 'coach.guandan.replyQueue',
        replyEvidence: 'authored', nextKey: 'coach.guandan.next', failureKey: 'coach.guandan.failure',
      }]
    }
    const card = hand.find((item) => item.id === action.cardId)
    if (!card) return []
    const finishesHand = hand.length === 1 && !view.finishOrder.includes(viewer)
    const finishOrderAfter = finishesHand ? [...view.finishOrder, viewer] : view.finishOrder
    const completesLesson = finishOrderAfter.length >= 2
    const nextSeat = completesLesson ? null : guandanSeatsAfter(viewer, finishOrderAfter)[0] ?? null
    const establishesLead = view.currentPlay === null
    return [{
      candidateId: candidate.id, kind: 'play-single', card, reserveCost: rankPercentile(card), nextSeat,
      establishesLead, completesLesson,
      purposeKey: completesLesson ? 'coach.guandan.purposeFinish' : view.currentPlay ? 'coach.guandan.purposeBeat' : 'coach.guandan.purposeLead',
      purposeEvidence: completesLesson ? 'exact' : 'authored',
      replyKey: completesLesson ? 'coach.guandan.replyComplete' : 'coach.guandan.replyQueue',
      replyEvidence: completesLesson ? 'exact' : 'authored',
      nextKey: completesLesson ? 'coach.guandan.nextComplete' : 'coach.guandan.next',
      failureKey: completesLesson ? null : 'coach.guandan.failure',
    }]
  })
  const pass = candidates.find((candidate) => candidate.kind === 'pass')
  const plays = candidates.filter((candidate) => candidate.kind === 'play-single').sort((left, right) => (left.card?.rank ?? 0) - (right.card?.rank ?? 0) || (left.card?.id ?? '').localeCompare(right.card?.id ?? ''))
  const partnerAhead = view.currentPlay?.seat === partner
  const partnerCanRecoverInitiative = partnerAhead && !partnerFinished
  const finishingPlay = plays.find((candidate) => candidate.completesLesson)
  const suggestion = finishingPlay ?? (partnerCanRecoverInitiative && pass ? pass : plays[0] ?? pass)
  const suggestionReasonKey = suggestion?.completesLesson
    ? 'suggestion.guandanFinish'
    : partnerCanRecoverInitiative && pass
      ? 'suggestion.guandanPartnerPass'
      : partnerAhead && partnerFinished && plays[0]
        ? 'suggestion.guandanFinishedPartnerTakeover'
        : plays[0]
          ? view.currentPlay ? 'suggestion.guandanCheapestBeat' : 'suggestion.guandanLowLead'
          : 'suggestion.guandanForcedPass'
  const initiativeOrder: GuandanInitiativeEntry[] = [
    ...(view.currentPlay ? [{ seat: view.currentPlay.seat, status: 'owner' as const, position: null }] : []),
    ...view.responseQueue.map((seat, index) => ({ seat, status: seat === view.activeSeat ? 'active' as const : 'waiting' as const, position: index + 1 })),
    ...(!view.currentPlay && view.activeSeat && view.responseQueue.length === 0
      ? [{ seat: view.activeSeat, status: 'active' as const, position: 1 }]
      : []),
  ]
  return {
    kind: 'guandan', activeSeat: view.activeSeat, threshold: view.currentPlay?.card.rank ?? null,
    legalPlayContext: view.complete || view.activeSeat === null ? 'complete' : view.currentPlay ? 'response' : 'lead',
    legalPlayCount: view.activeSeat === viewer ? plays.length : null, passes: view.passes,
    responseQueue: view.responseQueue, initiativeOrder, leader: view.leader, currentOwner: view.currentPlay?.seat ?? null, partnerAhead, partnerFinished,
    handCounts: Object.fromEntries(guandanSeats.map((seat) => [seat, view.hands[seat].length])) as Record<GuandanSeat, number>,
    candidates, suggestionId: suggestion?.candidateId ?? null, suggestionReasonKey,
  }
}
