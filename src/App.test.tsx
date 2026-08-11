import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { applyHoldemAction, legalHoldemActions, type HoldemState } from './core/holdem'
import { SessionRepository } from './core/sessionStore'
import { localizedDocumentMetadata } from './i18n/metadata'

describe('Open Table shell', () => {
  it('does not create a session until the learner deals', () => {
    render(<App />)
    expect(screen.getByText('Open Table')).toBeInTheDocument()
    expect(localStorage.getItem('open-table.sessions.v1')).toBeNull()
  })

  it('switches all visible launcher content to Chinese', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'zh-Hans' } })
    expect(screen.getByText('发一局新课')).toBeInTheDocument()
    expect(screen.getByText('德州扑克')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('zh-Hans')
    expect(document.documentElement.dir).toBe('ltr')
    expect(document.title).toBe(localizedDocumentMetadata('zh-Hans').title)
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', localizedDocumentMetadata('zh-Hans').description)
  })

  it('persists an allowlisted Arabic locale and enables RTL direction', () => {
    render(<App />)
    const selector = screen.getByLabelText('Language')
    expect(selector.querySelectorAll('option')).toHaveLength(11)
    fireEvent.change(selector, { target: { value: 'ar' } })
    expect(localStorage.getItem('open-table.locale')).toBe('ar')
    expect(document.documentElement.lang).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
    expect(document.title).toBe(localizedDocumentMetadata('ar').title)
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', localizedDocumentMetadata('ar').description)
    expect(document.querySelector('.app-shell')).toHaveAttribute('dir', 'rtl')
  })

  it('creates exactly one session per click and exposes legal intentions', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Deal a new lesson'))
    expect(screen.getByText('Legal intentions')).toBeInTheDocument()
    const stored = JSON.parse(localStorage.getItem('open-table.sessions.v1')!) as { sessions: unknown[] }
    expect(stored.sessions).toHaveLength(1)
  })

  it('shows an opening suggestion and updates the Hold’em map without committing on click', () => {
    const { container } = render(<App />)
    fireEvent.click(screen.getByText('Deal a new lesson'))
    expect(screen.getByTestId('suggested-action')).toHaveTextContent('Suggested legal action')
    const map = screen.getByTestId('holdem-decision-map')
    expect(map).toHaveTextContent('Viewer-visible cards only')

    const candidate = container.querySelector<HTMLButtonElement>('[data-candidate-id]')!
    fireEvent.click(candidate)
    const preview = screen.getByTestId('candidate-preview')
    expect(preview).toHaveTextContent('Preview · no state changed')
    expect(preview).toHaveTextContent('Failure condition')
    expect(preview).toHaveTextContent('Transferable principle')
    expect(map).toHaveAttribute('data-preview-candidate', candidate.dataset.candidateId)
    const stored = JSON.parse(localStorage.getItem('open-table.sessions.v1')!) as { sessions: { state: { revision: number } }[] }
    expect(stored.sessions[0]?.state.revision).toBe(0)
  })

  it('clears a preview with right-click or Escape', () => {
    const { container } = render(<App />)
    fireEvent.click(screen.getByText('Deal a new lesson'))
    const candidate = container.querySelector<HTMLButtonElement>('[data-candidate-id]')!
    fireEvent.click(candidate)
    expect(screen.getByTestId('candidate-preview')).toBeInTheDocument()
    fireEvent.contextMenu(candidate)
    expect(screen.queryByTestId('candidate-preview')).not.toBeInTheDocument()

    fireEvent.focus(candidate)
    expect(screen.getByTestId('candidate-preview')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByTestId('candidate-preview')).not.toBeInTheDocument()
  })

  it('recomputes the map after explicit confirmation and clears the hypothetical layer', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Deal a new lesson'))
    fireEvent.click(screen.getByTestId('suggested-action'))
    expect(screen.getByTestId('holdem-decision-map').getAttribute('data-preview-candidate')).not.toBe('')
    fireEvent.click(screen.getByText('Confirm this action'))

    const stored = JSON.parse(localStorage.getItem('open-table.sessions.v1')!) as { sessions: { state: { revision: number } }[] }
    expect(stored.sessions[0]?.state.revision).toBe(1)
    expect(screen.getByTestId('holdem-decision-map')).toHaveAttribute('data-preview-candidate', '')
    expect(screen.queryByTestId('candidate-preview')).not.toBeInTheDocument()
  })

  it('uses a Bridge-specific trick compass and localized authored suggestion', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Contract Bridge/ }))
    fireEvent.click(screen.getByText('Deal a new lesson'))
    expect(screen.getByTestId('bridge-trick-compass')).toHaveTextContent('Trick compass')
    const suggestion = screen.getByTestId('suggested-action')
    expect(suggestion).toHaveTextContent('Suggested legal action')
    expect(suggestion).toHaveTextContent('longest non-trump suit')
    fireEvent.click(suggestion)
    expect(screen.getByTestId('candidate-preview')).toHaveTextContent('Exact rule fact')
    fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'zh-Hans' } })
    expect(screen.getByTestId('bridge-trick-compass')).toHaveTextContent('一墩罗盘')
    expect(screen.getByTestId('suggested-action')).toHaveTextContent('建议合法动作')
  })

  it('uses a Guandan-specific initiative queue instead of poker odds', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Guandan/ }))
    fireEvent.click(screen.getByText('Deal a new lesson'))
    const map = screen.getByTestId('guandan-initiative-queue')
    expect(map).toHaveTextContent('Initiative queue')
    expect(map).toHaveTextContent('Response order')
    const legalCount = within(map).getByTestId('guandan-legal-play-count')
    expect(legalCount).toHaveAttribute('data-play-context', 'lead')
    expect(legalCount).toHaveAttribute('data-count-available', 'true')
    expect(legalCount).toHaveTextContent('Legal opening singles')
    expect(legalCount).toHaveTextContent('6')
    expect(legalCount).not.toHaveTextContent('Legal beaters')
    expect(map).not.toHaveTextContent('equity')
    expect(screen.getByTestId('suggested-action')).toBeInTheDocument()
  })

  it('renders the exact Guandan owner and response order with accessible statuses', () => {
    const repository = new SessionRepository(localStorage)
    const stored = repository.create('guandan', 'queue-ui', 'create-queue-ui')
    if (stored.state.kind !== 'guandan') throw new Error('Unexpected mode')
    const currentCard = stored.state.hands.right[0]!
    repository.save({
      ...stored.state,
      revision: 1,
      activeSeat: 'partner',
      currentPlay: { seat: 'right', card: currentCard },
      responseQueue: ['partner', 'left', 'you'],
      hands: { ...stored.state.hands, right: stored.state.hands.right.filter((card) => card.id !== currentCard.id) },
    }, 0)

    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Guandan/ }))
    fireEvent.click(screen.getByText('Resume table'))
    const map = screen.getByTestId('guandan-initiative-queue')
    const entries = within(map).getAllByTestId('guandan-queue-seat')

    expect(entries.map((entry) => entry.getAttribute('data-queue-seat'))).toEqual(['right', 'partner', 'left', 'you'])
    expect(entries.map((entry) => entry.getAttribute('data-queue-status'))).toEqual(['owner', 'active', 'waiting', 'waiting'])
    expect(entries[0]).toHaveAccessibleName('Current owner: Right opponent')
    expect(entries[1]).toHaveAccessibleName('Responder 1, active now: Partner')
    expect(entries[2]).toHaveAccessibleName('Responder 2, waiting: Left opponent')
    expect(entries.map((entry) => entry.querySelector('.queue-seat')?.textContent)).toEqual(['OwnerRight opponent', 'Now 1Partner', 'Wait 2Left opponent', 'Wait 3You'])
    expect(within(within(map).getByRole('list', { name: 'Response order' })).getAllByRole('listitem')).toEqual(entries)
    expect(container.querySelectorAll('.queue-arrow')).toHaveLength(3)
    const legalCount = within(map).getByTestId('guandan-legal-play-count')
    expect(legalCount).toHaveAttribute('data-play-context', 'response')
    expect(legalCount).toHaveAttribute('data-count-available', 'false')
    expect(legalCount).toHaveTextContent('Legal beaters')
    expect(legalCount).toHaveTextContent('—')
    expect(legalCount).toHaveTextContent('Available on your decision')
  })

  it('labels an open Guandan preview as establishing initiative', () => {
    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Guandan/ }))
    fireEvent.click(screen.getByText('Deal a new lesson'))
    fireEvent.click(container.querySelector<HTMLButtonElement>('[data-candidate-id]')!)

    const map = screen.getByTestId('guandan-initiative-queue')
    const preview = screen.getByTestId('candidate-preview')
    expect(map).toHaveTextContent('Establish initiative')
    expect(map).not.toHaveTextContent('Challenge the lead')
    expect(preview).toHaveTextContent('Opening lead')
    expect(preview).toHaveTextContent('any visible single in your hand is a legal lead')
    expect(preview).toHaveTextContent('there is no beat threshold and Pass is not legal')
    expect(preview).not.toHaveTextContent('Response threshold')
    expect(preview).not.toHaveTextContent('passing remains legal while responding')
  })

  it('keeps threshold and pass guidance for a Guandan response preview', () => {
    const repository = new SessionRepository(localStorage)
    const stored = repository.create('guandan', 'response-facet-ui', 'create-response-facet-ui')
    if (stored.state.kind !== 'guandan') throw new Error('Unexpected mode')
    const currentCard = stored.state.hands.right[0]!
    repository.save({
      ...stored.state,
      revision: 1,
      activeSeat: 'you',
      leader: 'right',
      currentPlay: { seat: 'right', card: currentCard },
      responseQueue: ['you', 'partner', 'left'],
      hands: { ...stored.state.hands, right: stored.state.hands.right.filter((card) => card.id !== currentCard.id) },
    }, 0)

    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Guandan/ }))
    fireEvent.click(screen.getByText('Resume table'))
    fireEvent.click(container.querySelector<HTMLButtonElement>('[data-candidate-id]')!)

    const preview = screen.getByTestId('candidate-preview')
    expect(preview).toHaveTextContent('Response threshold')
    expect(preview).toHaveTextContent('A single must be higher than the current single')
    expect(preview).toHaveTextContent('passing remains legal while responding')
    expect(preview).not.toHaveTextContent('Opening lead')
  })

  it('renders second-finisher Guandan completion as exact with no future responder', () => {
    const repository = new SessionRepository(localStorage)
    const stored = repository.create('guandan', 'finish-ui', 'create-finish-ui')
    if (stored.state.kind !== 'guandan') throw new Error('Unexpected mode')
    repository.save({
      ...stored.state,
      revision: 1,
      activeSeat: 'you',
      leader: 'you',
      currentPlay: null,
      responseQueue: [],
      finishOrder: ['partner'],
      hands: { ...stored.state.hands, you: [stored.state.hands.you[0]!], partner: [] },
    }, 0)

    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Guandan/ }))
    fireEvent.click(screen.getByText('Resume table'))
    fireEvent.click(container.querySelector<HTMLButtonElement>('[data-candidate-id]')!)
    const preview = screen.getByTestId('candidate-preview')

    expect(screen.getByTestId('guandan-initiative-queue')).toHaveTextContent('Finish the lesson')
    expect(preview).toHaveTextContent('Exact rule fact · Why now')
    expect(preview).toHaveTextContent('Exact rule fact · Likely reply')
    expect(preview).toHaveTextContent('nobody responds')
    expect(within(preview).queryByText('Failure condition')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Confirm this action'))
    const legalCount = screen.getByTestId('guandan-legal-play-count')
    expect(legalCount).toHaveAttribute('data-play-context', 'complete')
    expect(legalCount).toHaveAttribute('data-count-available', 'false')
    expect(legalCount).toHaveTextContent('Legal singles')
    expect(legalCount).toHaveTextContent('No decision available')
  })

  it('renders a complete Hold’em board without a fictitious next-card denominator', () => {
    const repository = new SessionRepository(localStorage)
    const stored = repository.create('holdem', 'river-ui', 'create-river-ui')
    if (stored.state.kind !== 'holdem') throw new Error('Unexpected mode')
    repository.save({
      ...stored.state,
      revision: 1,
      phase: 'river',
      activePlayer: 'hero',
      community: stored.state.deck.slice(5, 10),
      deckIndex: 10,
      pot: 30,
      currentBet: 0,
      needsAction: ['hero', 'villain'],
      players: stored.state.players.map((player) => ({ ...player, contribution: 0 })) as unknown as HoldemState['players'],
    }, 0)

    render(<App />)
    const map = screen.getByTestId('holdem-decision-map')
    const improvements = map.querySelector('.outs-metric')!

    expect(improvements).toHaveTextContent('Board complete; no next community card remains')
    expect(improvements.querySelector('strong')).toHaveTextContent('—')
    expect(improvements.querySelector('strong')?.textContent).not.toContain('/')
    expect(map).toHaveTextContent('Exact rule fact')
    expect(map).toHaveTextContent('Calculated sample')
  })

  it('renders a folded flop as a completed hand without fictitious improvement cards', () => {
    const repository = new SessionRepository(localStorage)
    const stored = repository.create('holdem', 'folded-flop-ui', 'create-folded-flop-ui')
    if (stored.state.kind !== 'holdem') throw new Error('Unexpected mode')
    repository.save({
      ...stored.state,
      revision: 1,
      phase: 'complete',
      activePlayer: null,
      community: stored.state.deck.slice(5, 8),
      deckIndex: 8,
      pot: 0,
      currentBet: 0,
      needsAction: [],
      winnerIds: ['villain'],
      players: stored.state.players.map((player) => ({ ...player, contribution: 0, folded: player.id === 'hero' })) as unknown as HoldemState['players'],
    }, 0)

    render(<App />)
    const improvements = screen.getByTestId('holdem-decision-map').querySelector('.outs-metric')!

    expect(improvements).toHaveAttribute('data-next-card-status', 'hand-complete')
    expect(improvements.querySelector('strong')).toHaveTextContent('—')
    expect(improvements.querySelector('strong')?.textContent).not.toContain('/')
    expect(improvements).toHaveTextContent('Hand complete; no further community card will be dealt')
    expect(improvements).not.toHaveTextContent('Possible unseen cards')
  })

  it('uses exact final-trick Bridge copy without a later-seat failure', () => {
    const repository = new SessionRepository(localStorage)
    const stored = repository.create('bridge', 'bridge-finish-ui', 'create-bridge-finish-ui')
    if (stored.state.kind !== 'bridge') throw new Error('Unexpected mode')
    repository.save({
      ...stored.state,
      revision: 1,
      leader: 'west',
      activeSeat: 'south',
      completedTricks: [[], [], [], []],
      trick: [
        { seat: 'west', card: { id: '2H', suit: 'hearts', rank: 2 } },
        { seat: 'north', card: { id: '3H', suit: 'hearts', rank: 3 } },
        { seat: 'east', card: { id: '4H', suit: 'hearts', rank: 4 } },
      ],
      hands: { ...stored.state.hands, south: [{ id: '5H', suit: 'hearts', rank: 5 }] },
    }, 0)

    const { container } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Contract Bridge/ }))
    fireEvent.click(screen.getByText('Resume table'))
    fireEvent.click(container.querySelector<HTMLButtonElement>('[data-candidate-id]')!)
    const preview = screen.getByTestId('candidate-preview')

    expect(preview).toHaveTextContent('Exact rule fact · Likely reply')
    expect(preview).toHaveTextContent('completes the fifth trick and the lesson')
    expect(preview).not.toHaveTextContent('A later seat may')
    expect(within(preview).queryByText('Failure condition')).not.toBeInTheDocument()
  })

  it('falls back safely when persisted locale data is unsupported', () => {
    localStorage.setItem('open-table.locale', '__proto__')
    render(<App />)
    expect(screen.getByText('Deal a new lesson')).toBeInTheDocument()
    expect(screen.getByLabelText('Language')).toHaveValue('en')
  })

  it('previews on pointer hover and keyboard focus without mutating the session', () => {
    const { container } = render(<App />)
    fireEvent.click(screen.getByText('Deal a new lesson'))
    const before = JSON.parse(localStorage.getItem('open-table.sessions.v1')!) as { sessions: { state: { revision: number } }[] }
    const candidates = [...container.querySelectorAll<HTMLButtonElement>('[data-candidate-id]')]
    expect(candidates.length).toBeGreaterThan(1)
    fireEvent.pointerEnter(candidates[0]!)
    expect(screen.getByText('Preview · no state changed')).toBeInTheDocument()
    let stored = JSON.parse(localStorage.getItem('open-table.sessions.v1')!) as { sessions: { state: { revision: number } }[] }
    expect(stored.sessions[0]?.state.revision).toBe(before.sessions[0]?.state.revision)
    candidates[1]!.focus()
    fireEvent.focus(candidates[1]!)
    expect(candidates[1]).toHaveFocus()
    expect(candidates[1]).toHaveAttribute('aria-pressed', 'true')
    stored = JSON.parse(localStorage.getItem('open-table.sessions.v1')!) as { sessions: { state: { revision: number } }[] }
    expect(stored.sessions[0]?.state.revision).toBe(0)
  })

  it('recovers from a revision conflict and releases the mutation lock', () => {
    const { container } = render(<App />)
    fireEvent.click(screen.getByText('Deal a new lesson'))
    const repository = new SessionRepository(localStorage)
    const stored = repository.list()[0]!
    const staleState = stored.state as HoldemState
    const call = legalHoldemActions(staleState, 'hero').find((candidate) => candidate.action.kind === 'call')!
    const external = applyHoldemAction(staleState, { candidateId: call.id, clientRequestId: 'external-writer' })
    repository.save(external, 0)

    const staleCandidate = container.querySelector<HTMLButtonElement>('[data-candidate-id]')!
    fireEvent.focus(staleCandidate)
    fireEvent.click(container.querySelector<HTMLButtonElement>('.confirm-row .confirm-button')!)
    expect(screen.getByRole('alert')).toHaveTextContent('newest saved table has been restored')

    const agentCandidate = container.querySelector<HTMLButtonElement>('[data-candidate-id]')!
    fireEvent.focus(agentCandidate)
    fireEvent.click(container.querySelector<HTMLButtonElement>('.confirm-row .confirm-button')!)
    expect(repository.list()[0]?.state.revision).toBe(2)
  })
})
