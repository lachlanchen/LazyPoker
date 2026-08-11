import { useEffect, useMemo, useRef, useState } from 'react'
import { bridgeAgentCandidate, applyBridgeAction, publicBridgeView, type BridgeSeat, type BridgeState } from './core/bridge'
import { rankLabel, suitGlyph } from './core/cards'
import { guandanAgentCandidate, applyGuandanAction, publicGuandanView, type GuandanSeat, type GuandanState } from './core/guandan'
import { applyHoldemAction, currentHandValue, publicHoldemView, type HoldemState } from './core/holdem'
import { SessionRepository, type GameState, type StoredSession } from './core/sessionStore'
import { bridgeTeaching, guandanTeaching, holdemTeaching } from './core/teacher'
import type { Card, EvidenceKind, Facet, GameMode, Locale } from './core/types'
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
}

function requestId(prefix: string): string {
  return `${prefix}_${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random()}`}`
}

function CardTile({ card, label }: { readonly card: Card | null; readonly label: string }) {
  if (!card) return <span className="card card-back" aria-label={label}><span>◆</span></span>
  const red = card.suit === 'hearts' || card.suit === 'diamonds'
  return <span className={`card ${red ? 'is-red' : ''}`} aria-label={`${rankLabel(card.rank)} ${suitGlyph(card.suit)}`}><b>{rankLabel(card.rank)}</b><span>{suitGlyph(card.suit)}</span></span>
}

function Hand({ cards, hiddenLabel }: { readonly cards: readonly (Card | null)[]; readonly hiddenLabel: string }) {
  return <div className="hand">{cards.map((card, index) => <CardTile key={card?.id ?? `hidden-${index}`} card={card} label={hiddenLabel} />)}</div>
}

function HoldemTable({ state, t }: { readonly state: HoldemState; readonly t: (key: string, values?: Record<string, string | number>) => string }) {
  const view = publicHoldemView(state, 'hero')
  const hero = view.players.find((player) => player.id === 'hero')
  const villain = view.players.find((player) => player.id === 'villain')
  const value = currentHandValue(state, 'hero')
  return <section className="felt holdem-felt" aria-label={t('mode.holdem')}>
    <div className={`seat opponent ${state.activePlayer === 'villain' ? 'is-active' : ''}`}><span>{t('table.villain')}</span><Hand cards={villain?.hole ?? []} hiddenLabel={t('table.hidden')} /><small>{t('table.stack')} {villain?.stack}</small></div>
    <div className="pot"><small>{t('table.pot')}</small><strong>{state.pot + state.players.reduce((sum, player) => sum + player.contribution, 0)}</strong></div>
    <div className="board-cards"><small>{t('table.community')}</small><Hand cards={[...view.community, ...Array.from({ length: 5 - view.community.length }, () => null)]} hiddenLabel={t('table.hidden')} />{value && <span className="hand-name">{t(value.categoryKey)}</span>}</div>
    <div className={`seat hero ${state.activePlayer === 'hero' ? 'is-active' : ''}`}><span>{t('table.you')}</span><Hand cards={hero?.hole ?? []} hiddenLabel={t('table.hidden')} /><small>{t('table.stack')} {hero?.stack}</small></div>
  </section>
}

const bridgeSeats: readonly BridgeSeat[] = ['north', 'east', 'south', 'west']
function BridgeTable({ state, t }: { readonly state: BridgeState; readonly t: (key: string, values?: Record<string, string | number>) => string }) {
  const view = publicBridgeView(state, 'south')
  return <section className="felt trick-felt" aria-label={t('mode.bridge')}>
    {bridgeSeats.map((seat) => <div key={seat} className={`seat seat-${seat} ${view.activeSeat === seat ? 'is-active' : ''}`}><span>{t(`table.${seat}`)}</span><Hand cards={view.hands[seat]} hiddenLabel={t('table.hidden')} /></div>)}
    <div className="trick-center">{view.trick.length === 0 ? <small>{t('table.tricks')}</small> : view.trick.map((play) => <div key={play.seat} className={`played played-${play.seat}`}><CardTile card={play.card} label={play.card.id} /></div>)}</div>
    <div className="score-ribbon">{t('status.teamScore', { ns: view.tricks.northSouth, ew: view.tricks.eastWest })}</div>
  </section>
}

const guandanSeats: readonly GuandanSeat[] = ['you', 'right', 'partner', 'left']
function GuandanTable({ state, t }: { readonly state: GuandanState; readonly t: (key: string, values?: Record<string, string | number>) => string }) {
  const view = publicGuandanView(state, 'you')
  return <section className="felt trick-felt" aria-label={t('mode.guandan')}>
    {guandanSeats.map((seat) => <div key={seat} className={`seat seat-${seat === 'you' ? 'south' : seat === 'right' ? 'east' : seat === 'partner' ? 'north' : 'west'} ${view.activeSeat === seat ? 'is-active' : ''}`}><span>{t(`table.${seat}`)}</span><Hand cards={view.hands[seat]} hiddenLabel={t('table.hidden')} /></div>)}
    <div className="trick-center">{view.currentPlay ? <div className="current-card"><CardTile card={view.currentPlay.card} label={view.currentPlay.card.id} /><small>{t(`table.${view.currentPlay.seat}`)}</small></div> : <small>{t('table.current')}</small>}</div>
    <div className="score-ribbon">{t('status.finish', { order: view.finishOrder.length ? view.finishOrder.map((seat) => t(`table.${seat}`)).join(' · ') : '—' })}</div>
  </section>
}

function modeOf(state: GameState): GameMode { return state.kind }

function displayCandidates(state: GameState): DisplayCandidate[] {
  if (state.kind === 'holdem') {
    const ownTurn = state.activePlayer === 'hero'
    const packets = holdemTeaching(state)
    if (!ownTurn && packets.length > 0) {
      const preferred = packets.find((packet) => packet.candidate.action.kind === 'check') ?? packets.find((packet) => packet.candidate.action.kind === 'call') ?? packets[0]
      return preferred ? [{ id: preferred.candidate.id, labelKey: 'decision.agentConfirm', facets: preferred.facets.filter((facet) => facet.evidence !== 'calculated'), opaque: true }] : []
    }
    return packets.map(({ candidate, facets }) => ({ id: candidate.id, labelKey: candidate.labelKey, ...(candidate.amount === undefined ? {} : { amount: candidate.amount }), facets, opaque: false }))
  }
  if (state.kind === 'bridge') {
    const packets = bridgeTeaching(state)
    if (state.activeSeat !== 'south' && state.activeSeat !== null) {
      const agent = bridgeAgentCandidate(state)
      const packet = packets.find((item) => item.candidate.id === agent.id)
      return [{ id: agent.id, labelKey: 'decision.agentConfirm', facets: packet?.facets ?? [], opaque: true }]
    }
    return packets.map(({ candidate, facets }) => ({ id: candidate.id, labelKey: candidate.labelKey, detail: candidate.action.cardId, facets, opaque: false }))
  }
  const packets = guandanTeaching(state)
  if (state.activeSeat !== 'you' && state.activeSeat !== null) {
    const agent = guandanAgentCandidate(state)
    const packet = packets.find((item) => item.candidate.id === agent.id)
    return [{ id: agent.id, labelKey: 'decision.agentConfirm', facets: (packet?.facets ?? []).filter((facet) => facet.evidence !== 'exact'), opaque: true }]
  }
  return packets.map(({ candidate, facets }) => ({ id: candidate.id, labelKey: candidate.labelKey, ...(candidate.action.kind === 'play-single' ? { detail: candidate.action.cardId } : {}), facets, opaque: false }))
}

function DecisionPanel({ state, selectedId, onSelect, onConfirm, onCancel, t }: { readonly state: GameState; readonly selectedId: string | null; readonly onSelect: (id: string) => void; readonly onConfirm: () => void; readonly onCancel: () => void; readonly t: (key: string, values?: Record<string, string | number>) => string }) {
  const candidates = useMemo(() => displayCandidates(state), [state])
  const selected = candidates.find((candidate) => candidate.id === selectedId) ?? null
  const actor = state.kind === 'holdem' ? state.activePlayer : state.kind === 'bridge' ? state.activeSeat : state.activeSeat
  const own = state.kind === 'holdem' ? actor === 'hero' : state.kind === 'bridge' ? actor === 'south' : actor === 'you'
  const complete = state.kind === 'holdem' ? state.phase === 'complete' : state.complete
  return <aside className="decision-panel">
    <div className="turn-line"><span className="live-dot" />{complete ? t('turn.complete') : own ? t('turn.yours') : t('turn.agent', { actor: actor ? t(`table.${actor === 'hero' ? 'you' : actor === 'villain' ? 'villain' : actor}`) : '' })}</div>
    {!complete && <>
      <h2>{t('decision.heading')}</h2>
      <div className="candidate-list">{candidates.map((candidate) => <button key={candidate.id} className={`candidate ${selectedId === candidate.id ? 'is-selected' : ''}`} data-candidate-id={candidate.id} onPointerEnter={() => onSelect(candidate.id)} onFocus={() => onSelect(candidate.id)} onClick={() => onSelect(candidate.id)} aria-pressed={selectedId === candidate.id}>
        <span>{t(candidate.labelKey)}</span>{!candidate.opaque && candidate.detail && <b>{candidate.detail}</b>}{!candidate.opaque && candidate.amount !== undefined && <b>{candidate.amount}</b>}
      </button>)}</div>
      {!selected ? <p className="empty-preview">{t('decision.choose')}</p> : <div className="preview" aria-live="polite"><strong>{t('decision.preview')}</strong>{selected.facets.map((facet) => <FacetView key={`${facet.evidence}-${facet.titleKey}`} facet={facet} t={t} />)}<div className="confirm-row"><button className="quiet-button" onClick={onCancel}>{t('decision.cancel')}</button><button className="confirm-button" onClick={onConfirm}>{selected.opaque ? t('decision.agentConfirm') : t('decision.confirm')}</button></div></div>}
    </>}
  </aside>
}

function FacetView({ facet, t }: { readonly facet: Facet; readonly t: (key: string) => string }) {
  return <article className={`facet facet-${facet.evidence}`}><span>{t(`evidence.${facet.evidence}` as EvidenceKind)}</span><h3>{t(facet.titleKey)} {facet.value && <b>{facet.value}</b>}</h3><p>{t(facet.bodyKey)}</p></article>
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
    {screen === 'table' && session && <main className="workspace"><div className="mode-strip"><div><span>{t(`mode.${modeOf(session.state)}`)}</span><small>{t(session.state.kind === 'holdem' ? 'limit.full' : session.state.kind === 'bridge' ? 'limit.bridgeMini' : 'limit.guandanMini')}</small></div><button className="quiet-button" onClick={() => setSession(null)}>{t('start.new')}</button></div><div className="table-column">{session.state.kind === 'holdem' ? <HoldemTable state={session.state} t={t} /> : session.state.kind === 'bridge' ? <BridgeTable state={session.state} t={t} /> : <GuandanTable state={session.state} t={t} />}<Chronicle state={session.state} t={t} /></div><DecisionPanel state={session.state} selectedId={selectedId} onSelect={setSelectedId} onCancel={() => setSelectedId(null)} onConfirm={confirm} t={t} /></main>}
    {screen === 'history' && <main className="history-page"><div><span className="eyebrow">{t('history.promise')}</span><h1>{t('history.title')}</h1></div>{sessions.length === 0 ? <p>{t('history.empty')}</p> : <div className="history-grid">{sessions.map((stored) => <article key={stored.id}><span>{t(`mode.${stored.mode}`)}</span><b>{stored.id}</b><small>{t('history.revision')} {stored.state.revision} · {new Date(stored.updatedAt).toLocaleString(locale)}</small><button className="quiet-button" onClick={() => openSession(stored)}>{t('history.open')}</button></article>)}</div>}</main>}
    {screen === 'method' && <main className="method-page"><span className="eyebrow">{t('method.promise')}</span><h1>{t('method.title')}</h1><div className="method-grid">{(['exact', 'calculated', 'authored'] as const).map((kind) => <article key={kind} className={`facet-${kind}`}><span>{t(`evidence.${kind}`)}</span><p>{t(`method.${kind}`)}</p></article>)}</div></main>}
  </div>
}
