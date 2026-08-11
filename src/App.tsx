import { useEffect, useMemo, useRef, useState } from 'react'
import { bridgeAgentCandidate, applyBridgeAction, legalBridgeActions, publicBridgeView, type BridgeSeat, type BridgeState } from './core/bridge'
import { rankLabel, suitGlyph } from './core/cards'
import {
  analyzeBridgeDecision,
  analyzeGuandanDecision,
  analyzeHoldemDecision,
  type BridgeActionImpact,
  type BridgeDecisionAnalysis,
  type DecisionAnalysis,
  type GuandanActionImpact,
  type GuandanDecisionAnalysis,
  type HoldemActionImpact,
  type HoldemDecisionAnalysis,
} from './core/decisionAnalysis'
import { guandanAgentCandidate, applyGuandanAction, legalGuandanActions, publicGuandanView, type GuandanSeat, type GuandanState } from './core/guandan'
import { applyHoldemAction, currentHandValue, legalHoldemActions, publicHoldemView, type HoldemState } from './core/holdem'
import { SessionRepository, type GameState, type StoredSession } from './core/sessionStore'
import type { Card, EvidenceKind, Facet, GameMode, Locale, Rank } from './core/types'
import { localeLabels, normalizeLocale, supportedLocales, translate } from './i18n/catalogs'
import { localizedDocumentMetadata } from './i18n/metadata'

type Screen = 'table' | 'history' | 'method'

interface DisplayCandidate {
  readonly id: string
  readonly labelKey: string
  readonly detail?: string
  readonly amount?: number
  readonly facets: readonly Facet[]
  readonly opaque: boolean
  readonly purposeKey?: string
  readonly purposeEvidence?: EvidenceKind
  readonly replyKey?: string
  readonly replyEvidence?: EvidenceKind
  readonly nextKey?: string
  readonly failureKey?: string | null
}

interface DecisionContext {
  readonly analysis: DecisionAnalysis
  readonly candidates: readonly DisplayCandidate[]
}

function requestId(prefix: string): string {
  return `${prefix}_${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random()}`}`
}

function CardTile({ card, label, preview = false }: { readonly card: Card | null; readonly label: string; readonly preview?: boolean }) {
  if (!card) return <span className="card card-back" aria-label={label}><span>◆</span></span>
  const red = card.suit === 'hearts' || card.suit === 'diamonds'
  return <span className={`card ${red ? 'is-red' : ''} ${preview ? 'is-preview-card' : ''}`} aria-label={`${rankLabel(card.rank)} ${suitGlyph(card.suit)}`}><b>{rankLabel(card.rank)}</b><span>{suitGlyph(card.suit)}</span></span>
}

function Hand({ cards, hiddenLabel, previewCardId }: { readonly cards: readonly (Card | null)[]; readonly hiddenLabel: string; readonly previewCardId?: string }) {
  return <div className="hand">{cards.map((card, index) => <CardTile key={card?.id ?? `hidden-${index}`} card={card} label={hiddenLabel} preview={card?.id === previewCardId} />)}</div>
}

function Percent({ value }: { readonly value: number }) {
  return <>{Math.round(value * 100)}%</>
}

function EvidenceTag({ kind, t }: { readonly kind: EvidenceKind; readonly t: Translator }) {
  return <i className={`evidence-chip evidence-${kind}`}>{t(`evidence.${kind}`)}</i>
}

function MetricHeading({ evidence, label, t }: { readonly evidence: EvidenceKind; readonly label: string; readonly t: Translator }) {
  return <span className="metric-heading"><EvidenceTag kind={evidence} t={t} /><span>{label}</span></span>
}

function HoldemMap({ analysis, selected, t }: { readonly analysis: HoldemDecisionAnalysis; readonly selected: HoldemActionImpact | null; readonly t: Translator }) {
  const outCounts = (['clubs', 'diamonds', 'hearts', 'spades'] as const).map((suit) => ({ suit, count: analysis.improvingOuts.filter((card) => card.suit === suit).length }))
  const hasBoard = analysis.pairing !== 'empty'
  const nextCardMessageKey = analysis.nextCardStatus === 'available'
    ? 'analysis.outsCaution'
    : analysis.nextCardStatus === 'board-complete'
      ? 'analysis.outsBoardComplete'
      : analysis.nextCardStatus === 'hand-complete'
        ? 'analysis.outsHandComplete'
        : 'analysis.outsAfterFlop'
  return <section className="analysis-dock holdem-map" data-testid="holdem-decision-map" data-preview-candidate={selected?.candidateId ?? ''}>
    <div className="dock-heading"><div><b>{t('analysis.holdemBoard')}</b></div><small>{t('analysis.visibleOnly')}</small></div>
    <div className="metric-grid">
      <div className="metric"><MetricHeading evidence="exact" label={t('analysis.boardTexture')} t={t} /><strong>{hasBoard ? `${t(`texture.${analysis.pairing}`)} · ${t(`texture.${analysis.suits}`)} · ${t(`texture.${analysis.connection}`)}` : t('texture.empty')}</strong></div>
      <div className="metric"><MetricHeading evidence="calculated" label={t('analysis.equity')} t={t} /><strong><Percent value={analysis.equity} /></strong><small>{t('analysis.samples', { count: analysis.equitySamples })}</small></div>
      <div className="metric outs-metric" data-next-card-status={analysis.nextCardStatus}><MetricHeading evidence="calculated" label={t('analysis.improvingCards')} t={t} /><strong>{analysis.nextCardAvailable ? <>{analysis.improvingOuts.length}<i>/ {analysis.unseenCount}</i></> : '—'}</strong>{analysis.nextCardAvailable && <div className="out-suits" aria-label={t('analysis.improvingCards')}>{outCounts.map(({ suit, count }) => <i key={suit}>{suitGlyph(suit)}<b>{count}</b></i>)}</div>}<small>{t(nextCardMessageKey)}</small></div>
      <div className="metric"><MetricHeading evidence="exact" label={t('analysis.price')} t={t} /><strong>{analysis.callPrice} <i>→ {analysis.pot}</i></strong><small>{t('analysis.effective', { amount: analysis.effectiveStack })}</small></div>
    </div>
    {selected && <div className="preview-delta" aria-live="polite"><EvidenceTag kind="exact" t={t} /><span>{t('analysis.previewImpact')}</span><b>{t('analysis.risk')} {selected.risk}</b><span>→</span><b>{t('analysis.potAfter')} {selected.potAfter}</b><span>·</span><b>{t('analysis.stackAfter')} {selected.stackAfter}</b></div>}
  </section>
}

type Translator = (key: string, values?: Record<string, string | number>) => string

function HoldemTable({ state, analysis, selected, t }: { readonly state: HoldemState; readonly analysis: HoldemDecisionAnalysis; readonly selected: HoldemActionImpact | null; readonly t: Translator }) {
  const view = publicHoldemView(state, 'hero')
  const hero = view.players.find((player) => player.id === 'hero')
  const villain = view.players.find((player) => player.id === 'villain')
  const value = currentHandValue(state, 'hero')
  return <div className="table-stage"><section className="felt holdem-felt" aria-label={t('mode.holdem')}>
    <div className={`seat opponent ${state.activePlayer === 'villain' ? 'is-active' : ''}`}><span>{t('table.villain')}</span><Hand cards={villain?.hole ?? []} hiddenLabel={t('table.hidden')} /><small>{t('table.stack')} {villain?.stack}</small></div>
    <div className="pot"><small>{t('table.pot')}</small><strong>{state.pot + state.players.reduce((sum, player) => sum + player.contribution, 0)}</strong></div>
    <div className="board-cards"><small>{t('table.community')}</small><Hand cards={[...view.community, ...Array.from({ length: 5 - view.community.length }, () => null)]} hiddenLabel={t('table.hidden')} />{value && <span className="hand-name">{t(value.categoryKey)}</span>}</div>
    <div className={`seat hero ${state.activePlayer === 'hero' ? 'is-active' : ''}`}><span>{t('table.you')}</span><Hand cards={hero?.hole ?? []} hiddenLabel={t('table.hidden')} /><small>{t('table.stack')} {hero?.stack}</small></div>
  </section><HoldemMap analysis={analysis} selected={selected} t={t} /></div>
}

const bridgeSeats: readonly BridgeSeat[] = ['north', 'east', 'south', 'west']
function BridgeMap({ analysis, selected, t }: { readonly analysis: BridgeDecisionAnalysis; readonly selected: BridgeActionImpact | null; readonly t: Translator }) {
  const suitEntries = (['clubs', 'diamonds', 'hearts', 'spades'] as const)
  return <section className="analysis-dock bridge-map" data-testid="bridge-trick-compass" data-preview-candidate={selected?.candidateId ?? ''}>
    <div className="dock-heading"><div><span className="evidence-chip evidence-exact">{t('evidence.exact')}</span><b>{t('analysis.bridgeTrick')}</b></div><small>{t('analysis.bridgeLimit')}</small></div>
    <div className="trick-compass">
      <div className="compass-core"><span>{t('analysis.trickProgress')}</span><strong>{analysis.trickProgress}/4</strong><small>{analysis.currentWinner ? `${t('analysis.ahead', { actor: t(`table.${analysis.currentWinner}`) })}${analysis.currentWinningCard ? ` · ${analysis.currentWinningCard.id}` : ''}` : t('analysis.openLead')}</small></div>
      <div className="contract-facts"><span>{t('analysis.ledSuit')} <b>{analysis.ledSuit ? suitGlyph(analysis.ledSuit) : '—'}</b></span><span>{t('analysis.trump')} <b>{suitGlyph(analysis.trump)}</b></span></div>
      <div className="suit-lanes" aria-label={t('analysis.suitLanes')}>{suitEntries.map((suit) => <span key={suit} className={analysis.legalSuit === suit ? 'is-legal-lane' : ''}><b>{suitGlyph(suit)}</b><i>{analysis.suitCounts[suit]}</i></span>)}</div>
    </div>
    {selected && <div className="preview-delta" aria-live="polite"><EvidenceTag kind="exact" t={t} /><span>{t('analysis.previewImpact')}</span><b>{selected.opensTrick ? t('analysis.opensTrick') : selected.winsNow ? t('analysis.winningNow') : t('analysis.notWinningYet')}</b><span>·</span><b>{t('analysis.rankCost')} {selected.rankCost}/{selected.legalChoiceCount}</b></div>}
  </section>
}

function BridgeTable({ state, analysis, selected, t }: { readonly state: BridgeState; readonly analysis: BridgeDecisionAnalysis; readonly selected: BridgeActionImpact | null; readonly t: Translator }) {
  const view = publicBridgeView(state, 'south')
  return <div className="table-stage"><section className="felt trick-felt" aria-label={t('mode.bridge')}>
    {bridgeSeats.map((seat) => <div key={seat} className={`seat seat-${seat} ${view.activeSeat === seat ? 'is-active' : ''}`}><span>{t(`table.${seat}`)}</span><Hand cards={view.hands[seat]} hiddenLabel={t('table.hidden')} {...(seat === 'south' && selected ? { previewCardId: selected.card.id } : {})} /></div>)}
    <div className="trick-center">{view.trick.length === 0 ? <small>{t('table.tricks')}</small> : view.trick.map((play) => <div key={play.seat} className={`played played-${play.seat}`}><CardTile card={play.card} label={play.card.id} /></div>)}</div>
    <div className="score-ribbon">{t('status.teamScore', { ns: view.tricks.northSouth, ew: view.tricks.eastWest })}</div>
  </section><BridgeMap analysis={analysis} selected={selected} t={t} /></div>
}

const guandanSeats: readonly GuandanSeat[] = ['you', 'right', 'partner', 'left']
function GuandanMap({ analysis, selected, t }: { readonly analysis: GuandanDecisionAnalysis; readonly selected: GuandanActionImpact | null; readonly t: Translator }) {
  const legalPlayLabelKey = analysis.legalPlayContext === 'lead'
    ? 'analysis.legalLeads'
    : analysis.legalPlayContext === 'response'
      ? 'analysis.beaters'
      : 'analysis.legalSingles'
  return <section className="analysis-dock guandan-map" data-testid="guandan-initiative-queue" data-preview-candidate={selected?.candidateId ?? ''}>
    <div className="dock-heading"><div><b>{t('analysis.guandanInitiative')}</b></div><small>{t('analysis.guandanLimit')}</small></div>
    <div className="initiative-grid">
      <div className="queue-track"><MetricHeading evidence="exact" label={t('analysis.responseQueue')} t={t} /><div role="list" aria-label={t('analysis.responseQueue')}>{analysis.initiativeOrder.map((entry, index) => {
        const actor = t(`table.${entry.seat}`)
        const accessibleLabel = entry.status === 'owner'
          ? t('analysis.queueOwnerLabel', { actor })
          : entry.status === 'active'
            ? t('analysis.queueActiveLabel', { actor, position: entry.position ?? 1 })
            : t('analysis.queueWaitingLabel', { actor, position: entry.position ?? 1 })
        const statusLabel = entry.status === 'owner'
          ? t('analysis.queueOwnerShort')
          : t(entry.status === 'active' ? 'analysis.queueActiveShort' : 'analysis.queueWaitingShort', { position: entry.position ?? 1 })
        return <span role="listitem" aria-label={accessibleLabel} className="queue-node" key={`${entry.status}-${entry.seat}`} data-testid="guandan-queue-seat" data-queue-seat={entry.seat} data-queue-status={entry.status} data-queue-position={entry.position ?? ''}>
          {index > 0 && <span className="queue-arrow" aria-hidden="true">→</span>}
          <span aria-hidden="true" className={`queue-seat is-${entry.status}`}><small>{statusLabel}</small><b>{actor}</b></span>
        </span>
      })}</div></div>
      <div className="metric"><MetricHeading evidence="exact" label={t('analysis.threshold')} t={t} /><strong>{analysis.threshold === null ? t('analysis.openLead') : rankLabel(analysis.threshold as Rank)}</strong></div>
      <div className="metric" data-testid="guandan-legal-play-count" data-play-context={analysis.legalPlayContext} data-count-available={analysis.legalPlayCount !== null}><MetricHeading evidence="exact" label={t(legalPlayLabelKey)} t={t} /><strong>{analysis.legalPlayCount ?? '—'}</strong>{analysis.legalPlayCount === null && <small>{t(analysis.legalPlayContext === 'complete' ? 'analysis.noDecision' : 'analysis.countOnYourTurn')}</small>}</div>
      <div className="team-counts"><MetricHeading evidence="exact" label={t('analysis.cardsLeft')} t={t} /><b>{analysis.handCounts.you} + {analysis.handCounts.partner}</b><i>{t('analysis.versus')}</i><b>{analysis.handCounts.right} + {analysis.handCounts.left}</b></div>
    </div>
    {selected && <div className="preview-delta" aria-live="polite"><EvidenceTag kind="exact" t={t} /><span>{t('analysis.previewImpact')}</span><b>{selected.completesLesson ? t('analysis.completeLesson') : selected.kind === 'pass' ? t('analysis.yieldInitiative') : selected.establishesLead ? t('analysis.establishInitiative') : t('analysis.challengeInitiative')}</b><span>→</span><b>{selected.nextSeat ? t(`table.${selected.nextSeat}`) : t('turn.complete')}</b>{selected.reserveCost !== null && <><span>·</span><EvidenceTag kind="calculated" t={t} /><b>{t('analysis.reserveCost')} <Percent value={selected.reserveCost} /></b></>}</div>}
  </section>
}

function GuandanTable({ state, analysis, selected, t }: { readonly state: GuandanState; readonly analysis: GuandanDecisionAnalysis; readonly selected: GuandanActionImpact | null; readonly t: Translator }) {
  const view = publicGuandanView(state, 'you')
  return <div className="table-stage"><section className="felt trick-felt" aria-label={t('mode.guandan')}>
    {guandanSeats.map((seat) => <div key={seat} className={`seat seat-${seat === 'you' ? 'south' : seat === 'right' ? 'east' : seat === 'partner' ? 'north' : 'west'} ${view.activeSeat === seat ? 'is-active' : ''}`}><span>{t(`table.${seat}`)}</span><Hand cards={view.hands[seat]} hiddenLabel={t('table.hidden')} {...(seat === 'you' && selected?.card ? { previewCardId: selected.card.id } : {})} /></div>)}
    <div className="trick-center">{view.currentPlay ? <div className="current-card"><CardTile card={view.currentPlay.card} label={view.currentPlay.card.id} /><small>{t(`table.${view.currentPlay.seat}`)}</small></div> : <small>{t('table.current')}</small>}</div>
    <div className="score-ribbon">{t('status.finish', { order: view.finishOrder.length ? view.finishOrder.map((seat) => t(`table.${seat}`)).join(' · ') : '—' })}</div>
  </section><GuandanMap analysis={analysis} selected={selected} t={t} /></div>
}

function modeOf(state: GameState): GameMode { return state.kind }

function displayContext(state: GameState): DecisionContext {
  if (state.kind === 'holdem') {
    const view = publicHoldemView(state, 'hero')
    const ownTurn = state.activePlayer === 'hero'
    const legal = ownTurn ? legalHoldemActions(state, 'hero') : []
    const analysis = analyzeHoldemDecision(view, 'hero', legal)
    if (!ownTurn && state.activePlayer) {
      const agentLegal = legalHoldemActions(state, state.activePlayer)
      const preferred = agentLegal.find((candidate) => candidate.action.kind === 'check') ?? agentLegal.find((candidate) => candidate.action.kind === 'call') ?? agentLegal[0]
      return { analysis, candidates: preferred ? [{ id: preferred.id, labelKey: 'decision.agentConfirm', facets: [], opaque: true }] : [] }
    }
    return { analysis, candidates: legal.map((candidate) => {
      const impact = analysis.candidates.find((item) => item.candidateId === candidate.id)
      if (!impact) throw new Error('Missing same-state Hold’em analysis')
      const facets: Facet[] = impact ? [
        { evidence: 'exact', titleKey: 'facet.actionPrice', bodyKey: 'facet.actionPriceBody', value: `${impact.risk} → ${impact.potAfter}` },
        { evidence: 'calculated', titleKey: impact.potOdds === null ? 'facet.equity' : 'facet.potOdds', bodyKey: impact.potOdds === null ? 'facet.equityBody' : 'facet.potOddsBody', value: impact.potOdds === null ? `${Math.round(analysis.equity * 100)}% · n=${analysis.equitySamples}` : `${Math.round(impact.potOdds * 100)}%` },
      ] : []
      return { id: candidate.id, labelKey: candidate.labelKey, ...(candidate.amount === undefined ? {} : { amount: candidate.amount }), facets, opaque: false, purposeKey: impact.purposeKey, purposeEvidence: impact.purposeEvidence, replyKey: impact.replyKey, replyEvidence: impact.replyEvidence, nextKey: impact.nextKey, failureKey: impact.failureKey }
    }) }
  }
  if (state.kind === 'bridge') {
    const view = publicBridgeView(state, 'south')
    const legal = state.activeSeat === 'south' ? legalBridgeActions(state, 'south') : []
    const analysis = analyzeBridgeDecision(view, 'south', legal)
    if (state.activeSeat !== 'south' && state.activeSeat !== null) {
      const agent = bridgeAgentCandidate(state)
      return { analysis, candidates: [{ id: agent.id, labelKey: 'decision.agentConfirm', facets: [], opaque: true }] }
    }
    return { analysis, candidates: legal.map((candidate) => {
      const impact = analysis.candidates.find((item) => item.candidateId === candidate.id)
      if (!impact) throw new Error('Missing same-state Bridge analysis')
      const facets: Facet[] = impact ? [
        { evidence: 'exact', titleKey: 'facet.followSuit', bodyKey: 'facet.followSuitBody', value: analysis.ledSuit ? suitGlyph(analysis.ledSuit) : '—' },
        { evidence: 'exact', titleKey: 'facet.trickPosition', bodyKey: impact.opensTrick ? 'facet.openingLeadBody' : 'facet.trickPositionBody', value: impact.opensTrick ? '◆' : impact.winsNow ? '↑' : '→' },
      ] : []
      return { id: candidate.id, labelKey: candidate.labelKey, detail: candidate.action.cardId, facets, opaque: false, purposeKey: impact.purposeKey, purposeEvidence: impact.purposeEvidence, replyKey: impact.replyKey, replyEvidence: impact.replyEvidence, nextKey: impact.nextKey, failureKey: impact.failureKey }
    }) }
  }
  const view = publicGuandanView(state, 'you')
  const legal = state.activeSeat === 'you' ? legalGuandanActions(state, 'you') : []
  const analysis = analyzeGuandanDecision(view, 'you', legal)
  if (state.activeSeat !== 'you' && state.activeSeat !== null) {
    const agent = guandanAgentCandidate(state)
    return { analysis, candidates: [{ id: agent.id, labelKey: 'decision.agentConfirm', facets: [], opaque: true }] }
  }
  const initiativeFacet: Facet | null = analysis.legalPlayContext === 'lead'
    ? { evidence: 'exact', titleKey: 'facet.guandanOpenLead', bodyKey: 'facet.guandanOpenLeadBody' }
    : analysis.legalPlayContext === 'response' && analysis.threshold !== null
      ? { evidence: 'exact', titleKey: 'facet.initiative', bodyKey: 'facet.initiativeBody', value: `${analysis.threshold}` }
      : null
  return { analysis, candidates: legal.map((candidate) => {
    const impact = analysis.candidates.find((item) => item.candidateId === candidate.id)
    if (!impact || !initiativeFacet) throw new Error('Missing same-state Guandan analysis')
    const facets: Facet[] = impact ? [
      initiativeFacet,
      { evidence: 'calculated', titleKey: 'facet.reserve', bodyKey: 'facet.reserveBody', value: impact.reserveCost === null ? '—' : `${Math.round(impact.reserveCost * 100)}%` },
    ] : []
    return { id: candidate.id, labelKey: candidate.labelKey, ...(candidate.action.kind === 'play-single' ? { detail: candidate.action.cardId } : {}), facets, opaque: false, purposeKey: impact.purposeKey, purposeEvidence: impact.purposeEvidence, replyKey: impact.replyKey, replyEvidence: impact.replyEvidence, nextKey: impact.nextKey, failureKey: impact.failureKey }
  }) }
}

function DecisionPanel({ state, context, selectedId, onSelect, onConfirm, onCancel, t }: { readonly state: GameState; readonly context: DecisionContext; readonly selectedId: string | null; readonly onSelect: (id: string) => void; readonly onConfirm: () => void; readonly onCancel: () => void; readonly t: Translator }) {
  const candidates = context.candidates
  const selected = candidates.find((candidate) => candidate.id === selectedId) ?? null
  const suggested = candidates.find((candidate) => candidate.id === context.analysis.suggestionId) ?? null
  const actor = state.kind === 'holdem' ? state.activePlayer : state.kind === 'bridge' ? state.activeSeat : state.activeSeat
  const own = state.kind === 'holdem' ? actor === 'hero' : state.kind === 'bridge' ? actor === 'south' : actor === 'you'
  const complete = state.kind === 'holdem' ? state.phase === 'complete' : state.complete
  return <aside className="decision-panel" data-testid="decision-panel" onContextMenu={(event) => { if (selectedId) { event.preventDefault(); onCancel() } }}>
    <div className="turn-line"><span className="live-dot" />{complete ? t('turn.complete') : own ? t('turn.yours') : t('turn.agent', { actor: actor ? t(`table.${actor === 'hero' ? 'you' : actor === 'villain' ? 'villain' : actor}`) : '' })}</div>
    {!complete && <>
      <h2>{t('decision.heading')}</h2>
      {suggested && <button className="suggestion" data-testid="suggested-action" onClick={() => onSelect(suggested.id)} onFocus={() => onSelect(suggested.id)}><span><i>{t('evidence.authored')}</i>{t('analysis.suggestion')}</span><b>{t(suggested.labelKey)} {suggested.detail ?? suggested.amount ?? ''}</b><small>{t(context.analysis.suggestionReasonKey)}</small></button>}
      <div className="candidate-list">{candidates.map((candidate) => <button key={candidate.id} className={`candidate ${selectedId === candidate.id ? 'is-selected' : ''} ${suggested?.id === candidate.id ? 'is-suggested' : ''}`} data-candidate-id={candidate.id} onPointerEnter={() => onSelect(candidate.id)} onFocus={() => onSelect(candidate.id)} onClick={() => onSelect(candidate.id)} onContextMenu={(event) => { event.preventDefault(); onCancel() }} aria-pressed={selectedId === candidate.id}>
        <span>{t(candidate.labelKey)}{suggested?.id === candidate.id && <small>{t('analysis.suggestedShort')}</small>}</span>{!candidate.opaque && candidate.detail && <b>{candidate.detail}</b>}{!candidate.opaque && candidate.amount !== undefined && <b>{candidate.amount}</b>}
      </button>)}</div>
      {!selected ? <p className="empty-preview">{t('decision.choose')} <small>{t('decision.clearHelp')}</small></p> : <div className="preview" aria-live="polite" data-testid="candidate-preview"><strong>{t('decision.preview')}</strong>{selected.facets.map((facet) => <FacetView key={`${facet.evidence}-${facet.titleKey}`} facet={facet} t={t} />)}{!selected.opaque && selected.purposeKey && selected.replyKey && <div className="coach-sequence"><article><span>{t(`evidence.${selected.purposeEvidence ?? 'authored'}`)} · {t('coach.why')}</span><p>{t(selected.purposeKey)}</p></article><article><span>{t(`evidence.${selected.replyEvidence ?? 'authored'}`)} · {t('coach.likelyReply')}</span><p>{t(selected.replyKey)}</p></article>{selected.nextKey && <article><span>{t('evidence.authored')} · {t('coach.calculateNext')}</span><p>{t(selected.nextKey)}</p></article>}{selected.failureKey && <article><span>{t('evidence.authored')} · {t('coach.failureCondition')}</span><p>{t(selected.failureKey)}</p></article>}<article><span>{t('evidence.authored')} · {t('coach.transferablePrinciple')}</span><p>{t(`coach.${state.kind}.principle`)}</p></article></div>}<div className="confirm-row"><button className="quiet-button" onClick={onCancel}>{t('decision.cancel')}</button><button className="confirm-button" onClick={onConfirm}>{selected.opaque ? t('decision.agentConfirm') : t('decision.confirm')}</button></div></div>}
    </>}
  </aside>
}

function FacetView({ facet, t }: { readonly facet: Facet; readonly t: Translator }) {
  return <article className={`facet facet-${facet.evidence}`}><span>{t(`evidence.${facet.evidence}` as EvidenceKind)}</span><h3>{t(facet.titleKey)} {facet.value && <b>{facet.value}</b>}</h3><p>{t(facet.bodyKey)}</p></article>
}

function LearningTable({ state, analysis, selectedId, t }: { readonly state: GameState; readonly analysis: DecisionAnalysis; readonly selectedId: string | null; readonly t: Translator }) {
  if (state.kind === 'holdem' && analysis.kind === 'holdem') {
    const selected = analysis.candidates.find((candidate) => candidate.candidateId === selectedId) ?? null
    return <HoldemTable state={state} analysis={analysis} selected={selected} t={t} />
  }
  if (state.kind === 'bridge' && analysis.kind === 'bridge') {
    const selected = analysis.candidates.find((candidate) => candidate.candidateId === selectedId) ?? null
    return <BridgeTable state={state} analysis={analysis} selected={selected} t={t} />
  }
  if (state.kind === 'guandan' && analysis.kind === 'guandan') {
    const selected = analysis.candidates.find((candidate) => candidate.candidateId === selectedId) ?? null
    return <GuandanTable state={state} analysis={analysis} selected={selected} t={t} />
  }
  return null
}

function Chronicle({ state, t }: { readonly state: GameState; readonly t: (key: string) => string }) {
  const actorLabel = (actor: string) => {
    const key = actor === 'hero' ? 'you' : actor === 'villain' ? 'villain' : actor
    return ['you', 'villain', 'north', 'east', 'south', 'west', 'right', 'partner', 'left'].includes(key) ? t(`table.${key}`) : actor
  }
  return <section className="chronicle"><h2>{t('history.title')}</h2><ol>{[...state.events].reverse().map((event, index) => <li key={`${event.revision}-${event.key}-${index}`}><span>{event.revision}</span><div><b>{t(event.key)}</b>{event.actor && <small>{actorLabel(event.actor)}</small>}{event.amount !== undefined && <small>{event.amount}</small>}{event.cards && <small>{event.cards.map((card) => card.id).join(' ')}</small>}</div></li>)}</ol></section>
}

export function App() {
  const [locale, setLocale] = useState<Locale>(() => normalizeLocale(localStorage.getItem('open-table.locale')))
  const [screen, setScreen] = useState<Screen>('table')
  const [mode, setMode] = useState<GameMode>('holdem')
  const [seed, setSeed] = useState('open-table-lesson-01')
  const repository = useMemo(() => new SessionRepository(localStorage), [])
  const [session, setSession] = useState<StoredSession | null>(() => repository.resume('holdem'))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [historyVersion, setHistoryVersion] = useState(0)
  const [noticeKey, setNoticeKey] = useState<string | null>(null)
  const mutationInFlight = useRef(false)
  const t = (key: string, values?: Record<string, string | number>) => translate(locale, key, values)
  const decisionContext = useMemo(() => session ? displayContext(session.state) : null, [session])
  const selectLocale = (value: string) => { const next = normalizeLocale(value); setLocale(next); localStorage.setItem('open-table.locale', next) }
  useEffect(() => {
    const metadata = localizedDocumentMetadata(locale)
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.title = metadata.title
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!description) {
      description = document.createElement('meta')
      description.name = 'description'
      document.head.append(description)
    }
    description.content = metadata.description
  }, [locale])
  useEffect(() => {
    if (!selectedId) return
    const clearOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectedId(null) }
    globalThis.addEventListener('keydown', clearOnEscape)
    return () => globalThis.removeEventListener('keydown', clearOnEscape)
  }, [selectedId])
  const start = () => {
    if (mutationInFlight.current) return
    mutationInFlight.current = true
    setNoticeKey(null)
    try {
      const created = repository.create(mode, seed, requestId('create'))
      setSession(created); setSelectedId(null); setScreen('table'); setHistoryVersion((value) => value + 1)
    } catch {
      setNoticeKey('status.persistenceFailed')
    } finally {
      mutationInFlight.current = false
    }
  }
  const resume = () => { const found = repository.resume(mode); if (found) { setSession(found); setSelectedId(null); setNoticeKey(null); setScreen('table') } }
  const confirm = () => {
    if (!session || !selectedId || mutationInFlight.current) return
    mutationInFlight.current = true
    const beforeRevision = session.state.revision
    const selection = { candidateId: selectedId, clientRequestId: requestId('action') }
    setNoticeKey(null)
    try {
      let next: GameState
      if (session.state.kind === 'holdem') next = applyHoldemAction(session.state, selection)
      else if (session.state.kind === 'bridge') next = applyBridgeAction(session.state, selection)
      else next = applyGuandanAction(session.state, selection)
      setSession(repository.save(next, beforeRevision)); setSelectedId(null); setHistoryVersion((value) => value + 1)
    } catch {
      const latest = repository.get(session.id)
      if (latest && latest.state.revision !== beforeRevision) {
        setSession(latest)
        setNoticeKey('status.persistenceConflict')
      } else {
        setNoticeKey('status.persistenceFailed')
      }
      setSelectedId(null)
    } finally {
      mutationInFlight.current = false
    }
  }
  const openSession = (stored: StoredSession) => { setSession(stored); setMode(stored.mode); setSelectedId(null); setNoticeKey(null); setScreen('table') }
  const sessions = useMemo(() => {
    void historyVersion
    return repository.list()
  }, [repository, historyVersion])
  const resumed = repository.resume(mode)

  return <div className="app-shell" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <header><div className="brand"><span className="brand-mark">◈</span><div><b>{t('app.title')}</b><small>{t('app.subtitle')}</small></div></div><nav aria-label={t('nav.primary')}><button className={screen === 'table' ? 'active' : ''} onClick={() => setScreen('table')}>{t('nav.table')}</button><button className={screen === 'history' ? 'active' : ''} onClick={() => setScreen('history')}>{t('nav.history')}</button><button className={screen === 'method' ? 'active' : ''} onClick={() => setScreen('method')}>{t('nav.method')}</button></nav><label className="locale"><span>{t('locale.label')}</span><select value={locale} onChange={(event) => selectLocale(event.target.value)}>{supportedLocales.map((item) => <option key={item} value={item}>{localeLabels[item]}</option>)}</select></label></header>
    {noticeKey && <div className="status-banner" role="alert">{t(noticeKey)}</div>}
    {screen === 'table' && !session && <main className="launcher"><div className="hero-copy"><span className="eyebrow">{t('app.promise')}</span><h1>{t('app.subtitle')}</h1><p>{t(`mode.${mode}Description`)}</p></div><div className="mode-grid">{(['holdem', 'bridge', 'guandan'] as const).map((item) => <button key={item} className={mode === item ? 'is-selected' : ''} onClick={() => setMode(item)}><span className="mode-symbol">{item === 'holdem' ? '♠' : item === 'bridge' ? '♣' : '大'}</span><b>{t(`mode.${item}`)}</b><small>{t(item === 'holdem' ? 'limit.full' : `limit.${item}Mini`)}</small></button>)}</div><div className="deal-panel"><label><span>{t('start.seed')}</span><input value={seed} onChange={(event) => setSeed(event.target.value)} /></label><small>{t('start.seedHelp')}</small><div>{resumed && <button className="quiet-button" onClick={resume}>{t('start.resume')}</button>}<button className="confirm-button" onClick={start}>{t('start.new')}</button></div></div></main>}
    {screen === 'table' && session && decisionContext && <main className="workspace" data-testid="learning-workspace"><div className="mode-strip"><div><span>{t(`mode.${modeOf(session.state)}`)}</span><small>{t(session.state.kind === 'holdem' ? 'limit.full' : session.state.kind === 'bridge' ? 'limit.bridgeMini' : 'limit.guandanMini')}</small></div><button className="quiet-button" onClick={() => setSession(null)}>{t('start.new')}</button></div><div className="table-column"><LearningTable state={session.state} analysis={decisionContext.analysis} selectedId={selectedId} t={t} /><Chronicle state={session.state} t={t} /></div><DecisionPanel state={session.state} context={decisionContext} selectedId={selectedId} onSelect={setSelectedId} onCancel={() => setSelectedId(null)} onConfirm={confirm} t={t} /></main>}
    {screen === 'history' && <main className="history-page"><div><span className="eyebrow">{t('history.promise')}</span><h1>{t('history.title')}</h1></div>{sessions.length === 0 ? <p>{t('history.empty')}</p> : <div className="history-grid">{sessions.map((stored) => <article key={stored.id}><span>{t(`mode.${stored.mode}`)}</span><b>{stored.id}</b><small>{t('history.revision')} {stored.state.revision} · {new Date(stored.updatedAt).toLocaleString(locale)}</small><button className="quiet-button" onClick={() => openSession(stored)}>{t('history.open')}</button></article>)}</div>}</main>}
    {screen === 'method' && <main className="method-page"><span className="eyebrow">{t('method.promise')}</span><h1>{t('method.title')}</h1><div className="method-grid">{(['exact', 'calculated', 'authored'] as const).map((kind) => <article key={kind} className={`facet-${kind}`}><span>{t(`evidence.${kind}`)}</span><p>{t(`method.${kind}`)}</p></article>)}</div></main>}
  </div>
}
