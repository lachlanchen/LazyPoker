import { describe, expect, it } from 'vitest'
import { bindCandidate, canonicalJson, stableHash } from './hash'

describe('canonical state binding', () => {
  it('normalizes object key order before hashing', () => {
    expect(canonicalJson({ b: 2, a: 1 })).toBe('{"a":1,"b":2}')
    expect(stableHash({ b: 2, a: 1 })).toBe(stableHash({ a: 1, b: 2 }))
  })

  it('changes candidate identity with state, actor, or action', () => {
    const base = bindCandidate('state-a', 'hero', { kind: 'check' })
    expect(base).toMatch(/^c_[0-9a-f]{32}$/)
    expect(bindCandidate('state-b', 'hero', { kind: 'check' })).not.toBe(base)
    expect(bindCandidate('state-a', 'villain', { kind: 'check' })).not.toBe(base)
    expect(bindCandidate('state-a', 'hero', { kind: 'fold' })).not.toBe(base)
  })
})
