export type Locale = 'en' | 'ar' | 'es' | 'fr' | 'ja' | 'ko' | 'vi' | 'zh-Hans' | 'zh-Hant' | 'de' | 'ru'
export type GameMode = 'holdem' | 'bridge' | 'guandan'
export type EvidenceKind = 'exact' | 'calculated' | 'authored'

export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades'
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14

export interface Card {
  readonly id: string
  readonly suit: Suit
  readonly rank: Rank
}

export interface ChronicleEvent {
  readonly revision: number
  readonly key: string
  readonly actor?: string
  readonly cards?: readonly Card[]
  readonly amount?: number
}

export interface Candidate<Action> {
  readonly id: string
  readonly stateToken: string
  readonly actorId: string
  readonly action: Action
  readonly labelKey: string
  readonly amount?: number
}

export interface Selection {
  readonly candidateId: string
  readonly clientRequestId: string
}

export interface MutationReceipt {
  readonly clientRequestId: string
  readonly payloadFingerprint: string
}

export interface Facet {
  readonly evidence: EvidenceKind
  readonly titleKey: string
  readonly bodyKey: string
  readonly value?: string
}

export class RuleError extends Error {
  constructor(
    readonly code: 'not_your_turn' | 'stale_candidate' | 'illegal_action' | 'game_complete' | 'idempotency_conflict',
    message: string,
  ) {
    super(message)
    this.name = 'RuleError'
  }
}
