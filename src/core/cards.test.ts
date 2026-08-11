import { describe, expect, it } from 'vitest'
import { assertUniqueCards, makeDeck, shuffleDeck } from './cards'

describe('deterministic deck', () => {
  it('contains all 52 unique cards', () => {
    const deck = makeDeck()
    expect(deck).toHaveLength(52)
    expect(() => assertUniqueCards(deck)).not.toThrow()
  })

  it('replays a seed without making all seeds equal', () => {
    expect(shuffleDeck('lesson-a').map((card) => card.id)).toEqual(shuffleDeck('lesson-a').map((card) => card.id))
    expect(shuffleDeck('lesson-a').map((card) => card.id)).not.toEqual(shuffleDeck('lesson-b').map((card) => card.id))
  })
})
