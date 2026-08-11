import { describe, expect, it } from 'vitest'
import { MemoryStorage, SessionRepository } from './sessionStore'
import { applyHoldemAction, legalHoldemActions } from './holdem'

describe('session persistence', () => {
  it('does not duplicate a retried creation request', () => {
    const repository = new SessionRepository(new MemoryStorage())
    const first = repository.create('holdem', 'seed', 'create-once', '2026-01-01T00:00:00Z')
    const retry = repository.create('holdem', 'seed', 'create-once', '2026-01-02T00:00:00Z')
    expect(retry.id).toBe(first.id)
    expect(repository.list()).toHaveLength(1)
  })

  it('rejects a creation request ID reused with another payload', () => {
    const repository = new SessionRepository(new MemoryStorage())
    repository.create('holdem', 'first-seed', 'bound-create')
    expect(() => repository.create('bridge', 'second-seed', 'bound-create')).toThrow(/payload conflict/)
    expect(repository.list()).toHaveLength(1)
  })

  it('resumes the exact revision and rejects conflicting saves', () => {
    const repository = new SessionRepository(new MemoryStorage())
    const initial = repository.create('holdem', 'resume', 'create', '2026-01-01T00:00:00Z')
    if (initial.state.kind !== 'holdem') throw new Error('Unexpected mode')
    const call = legalHoldemActions(initial.state, 'hero').find((item) => item.action.kind === 'call')!
    const next = applyHoldemAction(initial.state, { candidateId: call.id, clientRequestId: 'action' })
    repository.save(next, 0)
    expect(repository.resume('holdem')?.state.revision).toBe(1)
    expect(() => repository.save(next, 0)).toThrow(/Revision conflict/)
  })
})
