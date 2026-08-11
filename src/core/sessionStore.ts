import { stableHash } from './hash'
import { initialBridgeState, type BridgeState } from './bridge'
import { initialGuandanState, type GuandanState } from './guandan'
import { initialHoldemState, type HoldemState } from './holdem'
import type { GameMode } from './types'

export type GameState = HoldemState | BridgeState | GuandanState

export interface StoredSession {
  readonly id: string
  readonly mode: GameMode
  readonly createdAt: string
  readonly updatedAt: string
  readonly state: GameState
}

interface StoreDocument {
  readonly sessions: readonly StoredSession[]
  readonly creationRequests: Readonly<Record<string, CreationReceipt | string>>
  readonly activeByMode: Partial<Record<GameMode, string>>
}

interface CreationReceipt {
  readonly sessionId: string
  readonly payloadFingerprint: string
}

export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

const EMPTY: StoreDocument = { sessions: [], creationRequests: {}, activeByMode: {} }

function stateFor(mode: GameMode, seed: string, id: string): GameState {
  if (mode === 'holdem') return initialHoldemState(seed, id)
  if (mode === 'bridge') return initialBridgeState(seed, id)
  return initialGuandanState(seed, id)
}

export class SessionRepository {
  constructor(private readonly storage: KeyValueStorage, private readonly key = 'open-table.sessions.v1') {}

  private read(): StoreDocument {
    try {
      const raw = this.storage.getItem(this.key)
      if (!raw) return EMPTY
      const parsed = JSON.parse(raw) as StoreDocument
      if (!Array.isArray(parsed.sessions)) return EMPTY
      return parsed
    } catch {
      return EMPTY
    }
  }

  private write(document: StoreDocument): void { this.storage.setItem(this.key, JSON.stringify(document)) }

  list(): readonly StoredSession[] { return [...this.read().sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) }

  get(id: string): StoredSession | null { return this.read().sessions.find((session) => session.id === id) ?? null }

  resume(mode: GameMode): StoredSession | null {
    const document = this.read()
    const id = document.activeByMode[mode]
    return id ? document.sessions.find((session) => session.id === id) ?? null : null
  }

  create(mode: GameMode, seed: string, clientRequestId: string, now = new Date().toISOString()): StoredSession {
    const document = this.read()
    const payloadFingerprint = stableHash({ mode, seed })
    const receipt = document.creationRequests[clientRequestId]
    if (receipt) {
      const existingId = typeof receipt === 'string' ? receipt : receipt.sessionId
      const existing = document.sessions.find((session) => session.id === existingId)
      const recordedFingerprint = typeof receipt === 'string' && existing
        ? stableHash({ mode: existing.mode, seed: existing.state.seed })
        : typeof receipt === 'string' ? null : receipt.payloadFingerprint
      if (recordedFingerprint !== payloadFingerprint) throw new Error('Creation request ID payload conflict')
      if (existing) return existing
    }
    const id = `${mode}_${stableHash({ clientRequestId, seed })}`
    const session: StoredSession = { id, mode, createdAt: now, updatedAt: now, state: stateFor(mode, seed, id) }
    this.write({
      sessions: [...document.sessions, session],
      creationRequests: { ...document.creationRequests, [clientRequestId]: { sessionId: id, payloadFingerprint } },
      activeByMode: { ...document.activeByMode, [mode]: id },
    })
    return session
  }

  save(state: GameState, expectedRevision: number, now = new Date().toISOString()): StoredSession {
    const document = this.read()
    const existing = document.sessions.find((session) => session.id === state.sessionId)
    if (!existing) throw new Error('Session not found')
    if (existing.state.revision !== expectedRevision) throw new Error('Revision conflict')
    const updated: StoredSession = { ...existing, state, updatedAt: now }
    this.write({ ...document, sessions: document.sessions.map((session) => session.id === updated.id ? updated : session) })
    return updated
  }
}

export class MemoryStorage implements KeyValueStorage {
  private readonly values = new Map<string, string>()
  getItem(key: string): string | null { return this.values.get(key) ?? null }
  setItem(key: string, value: string): void { this.values.set(key, value) }
}
