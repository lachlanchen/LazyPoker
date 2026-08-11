import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { applyHoldemAction, legalHoldemActions, type HoldemState } from './core/holdem'
import { SessionRepository } from './core/sessionStore'

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
  })

  it('creates exactly one session per click and exposes legal intentions', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Deal a new lesson'))
    expect(screen.getByText('Legal intentions')).toBeInTheDocument()
    const stored = JSON.parse(localStorage.getItem('open-table.sessions.v1')!) as { sessions: unknown[] }
    expect(stored.sessions).toHaveLength(1)
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
