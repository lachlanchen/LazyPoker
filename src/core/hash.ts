import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex } from '@noble/hashes/utils.js'

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, normalize(item)]),
    )
  }
  return value
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(normalize(value))
}

/** Stable SHA-256-derived identity for state and candidate binding. */
export function stableHash(value: unknown): string {
  const source = typeof value === 'string' ? value : canonicalJson(value)
  return bytesToHex(sha256(new TextEncoder().encode(source))).slice(0, 32)
}

export function bindCandidate(stateToken: string, actorId: string, action: unknown): string {
  return `c_${stableHash({ action, actorId, stateToken })}`
}
