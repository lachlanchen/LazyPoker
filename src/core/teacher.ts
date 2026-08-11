import { legalBridgeActions, type BridgeState } from './bridge'
import { legalGuandanActions, type GuandanState } from './guandan'
import { chipTotal, estimateVisibleEquity, legalHoldemActions, previewHoldemAction, publicHoldemView, type HoldemState } from './holdem'
import type { Candidate, Facet } from './types'

export interface TeachingPacket<Action> {
  readonly candidate: Candidate<Action>
  readonly facets: readonly Facet[]
}

export function holdemTeaching(state: HoldemState): TeachingPacket<ReturnType<typeof legalHoldemActions>[number]['action']>[] {
  if (!state.activePlayer) return []
  const equity = estimateVisibleEquity(publicHoldemView(state, state.activePlayer), state.activePlayer, 240)
  return legalHoldemActions(state, state.activePlayer).map((candidate) => {
    const preview = previewHoldemAction(state, candidate.id)
    return {
      candidate,
      facets: [
        { evidence: 'exact', titleKey: 'facet.chips', bodyKey: 'facet.chipsBody', value: `${chipTotal(preview)}` },
        { evidence: 'calculated', titleKey: 'facet.equity', bodyKey: 'facet.equityBody', value: `${Math.round(equity.hero * 100)}% · n=${equity.samples}` },
        { evidence: 'authored', titleKey: 'facet.purpose', bodyKey: `strategy.${candidate.action.kind}` },
      ],
    }
  })
}

export function bridgeTeaching(state: BridgeState): TeachingPacket<ReturnType<typeof legalBridgeActions>[number]['action']>[] {
  if (!state.activeSeat) return []
  return legalBridgeActions(state, state.activeSeat).map((candidate) => ({ candidate, facets: [
    { evidence: 'exact', titleKey: 'facet.followSuit', bodyKey: 'facet.followSuitBody', value: `${state.trick.length}/4` },
    { evidence: 'authored', titleKey: 'facet.partnership', bodyKey: 'strategy.bridgePartnership' },
  ] }))
}

export function guandanTeaching(state: GuandanState): TeachingPacket<ReturnType<typeof legalGuandanActions>[number]['action']>[] {
  if (!state.activeSeat) return []
  return legalGuandanActions(state, state.activeSeat).map((candidate) => ({ candidate, facets: [
    { evidence: 'exact', titleKey: 'facet.structure', bodyKey: 'facet.guandanStructureBody', value: candidate.action.kind === 'pass' ? '—' : candidate.action.cardId },
    { evidence: 'authored', titleKey: 'facet.partnership', bodyKey: 'strategy.guandanPartnership' },
  ] }))
}
