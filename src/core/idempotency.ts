import { stableHash } from './hash'
import { RuleError, type MutationReceipt, type Selection } from './types'

export function selectionFingerprint(selection: Selection): string {
  return stableHash({ candidateId: selection.candidateId })
}

/** Returns true only for an exact replay; rejects reuse with another payload. */
export function isExactReplay(receipts: readonly MutationReceipt[], selection: Selection): boolean {
  const existing = receipts.find((receipt) => receipt.clientRequestId === selection.clientRequestId)
  if (!existing) return false
  if (existing.payloadFingerprint !== selectionFingerprint(selection)) {
    throw new RuleError('idempotency_conflict', 'Client request ID was already used with a different selection')
  }
  return true
}

export function receiptFor(selection: Selection): MutationReceipt {
  return { clientRequestId: selection.clientRequestId, payloadFingerprint: selectionFingerprint(selection) }
}
