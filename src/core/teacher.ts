import { legalBridgeActions, publicBridgeView, type BridgeState } from './bridge'
import { analyzeBridgeDecision, analyzeGuandanDecision, analyzeHoldemDecision } from './decisionAnalysis'
import { legalGuandanActions, publicGuandanView, type GuandanState } from './guandan'
import { legalHoldemActions, publicHoldemView, type HoldemState } from './holdem'
import type { Candidate, Facet } from './types'

export interface TeachingPacket<Action> {
  readonly candidate: Candidate<Action>
  readonly facets: readonly Facet[]
}

// Public teaching entry points deliberately return nothing during another
// seat's turn. Agent policy stays opaque; it is never repackaged as learner
// evidence from a private hand.
export function holdemTeaching(state: HoldemState): TeachingPacket<ReturnType<typeof legalHoldemActions>[number]['action']>[] {
  if (state.activePlayer !== 'hero') return []
  const candidates = legalHoldemActions(state, 'hero')
  const analysis = analyzeHoldemDecision(publicHoldemView(state, 'hero'), 'hero', candidates)
  return candidates.map((candidate) => {
    const impact = analysis.candidates.find((item) => item.candidateId === candidate.id)
    if (!impact) throw new Error('Missing same-state Hold’em analysis')
    return { candidate, facets: [
      { evidence: 'exact', titleKey: 'facet.actionPrice', bodyKey: 'facet.actionPriceBody', value: `${impact.risk} → ${impact.potAfter}` },
      { evidence: 'calculated', titleKey: impact.potOdds === null ? 'facet.equity' : 'facet.potOdds', bodyKey: impact.potOdds === null ? 'facet.equityBody' : 'facet.potOddsBody', value: impact.potOdds === null ? `${Math.round(analysis.equity * 100)}% · n=${analysis.equitySamples}` : `${Math.round(impact.potOdds * 100)}%` },
      { evidence: 'authored', titleKey: 'facet.purpose', bodyKey: impact.purposeKey },
    ] }
  })
}

export function bridgeTeaching(state: BridgeState): TeachingPacket<ReturnType<typeof legalBridgeActions>[number]['action']>[] {
  if (state.activeSeat !== 'south') return []
  const candidates = legalBridgeActions(state, 'south')
  const analysis = analyzeBridgeDecision(publicBridgeView(state, 'south'), 'south', candidates)
  return candidates.map((candidate) => {
    const impact = analysis.candidates.find((item) => item.candidateId === candidate.id)
    if (!impact) throw new Error('Missing same-state Bridge analysis')
    return { candidate, facets: [
      { evidence: 'exact', titleKey: 'facet.followSuit', bodyKey: 'facet.followSuitBody', value: analysis.ledSuit ?? '—' },
      { evidence: 'exact', titleKey: 'facet.trickPosition', bodyKey: impact.opensTrick ? 'facet.openingLeadBody' : 'facet.trickPositionBody', value: impact.opensTrick ? '◆' : impact.winsNow ? '↑' : '→' },
      { evidence: 'authored', titleKey: 'facet.partnership', bodyKey: impact.purposeKey },
    ] }
  })
}

export function guandanTeaching(state: GuandanState): TeachingPacket<ReturnType<typeof legalGuandanActions>[number]['action']>[] {
  if (state.activeSeat !== 'you') return []
  const candidates = legalGuandanActions(state, 'you')
  const analysis = analyzeGuandanDecision(publicGuandanView(state, 'you'), 'you', candidates)
  const initiativeFacet: Facet | null = analysis.legalPlayContext === 'lead'
    ? { evidence: 'exact', titleKey: 'facet.guandanOpenLead', bodyKey: 'facet.guandanOpenLeadBody' }
    : analysis.legalPlayContext === 'response' && analysis.threshold !== null
      ? { evidence: 'exact', titleKey: 'facet.initiative', bodyKey: 'facet.initiativeBody', value: `${analysis.threshold}` }
      : null
  return candidates.map((candidate) => {
    const impact = analysis.candidates.find((item) => item.candidateId === candidate.id)
    if (!impact || !initiativeFacet) throw new Error('Missing same-state Guandan analysis')
    return { candidate, facets: [
      initiativeFacet,
      { evidence: 'calculated', titleKey: 'facet.reserve', bodyKey: 'facet.reserveBody', value: impact.reserveCost === null ? '—' : `${Math.round(impact.reserveCost * 100)}%` },
      { evidence: 'authored', titleKey: 'facet.partnership', bodyKey: impact.purposeKey },
    ] }
  })
}
