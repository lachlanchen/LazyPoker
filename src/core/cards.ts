import type { Card, Rank, Suit } from './types'

export const suits: readonly Suit[] = ['clubs', 'diamonds', 'hearts', 'spades']
export const ranks: readonly Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

const suitCode: Record<Suit, string> = { clubs: 'C', diamonds: 'D', hearts: 'H', spades: 'S' }
const rankCode: Record<Rank, string> = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: 'T',
  11: 'J', 12: 'Q', 13: 'K', 14: 'A',
}

export function makeDeck(): Card[] {
  return suits.flatMap((suit) => ranks.map((rank) => ({ id: `${rankCode[rank]}${suitCode[suit]}`, suit, rank })))
}

function xmur3(text: string): () => number {
  let hash = 1779033703 ^ text.length
  for (let index = 0; index < text.length; index += 1) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 3432918353)
    hash = (hash << 13) | (hash >>> 19)
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507)
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909)
    return (hash ^= hash >>> 16) >>> 0
  }
}

function mulberry32(seed: number): () => number {
  return () => {
    let value = (seed += 0x6d2b79f5)
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffleDeck(seed: string): Card[] {
  const random = mulberry32(xmur3(seed)())
  const deck = makeDeck()
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1))
    const held = deck[index]
    deck[index] = deck[swapWith] as Card
    deck[swapWith] = held as Card
  }
  return deck
}

export function assertUniqueCards(cards: readonly Card[]): void {
  if (new Set(cards.map((card) => card.id)).size !== cards.length) {
    throw new Error('Duplicate card detected')
  }
}

export function rankLabel(rank: Rank): string {
  if (rank <= 10) return String(rank)
  return ({ 11: 'J', 12: 'Q', 13: 'K', 14: 'A' } as Record<number, string>)[rank] as string
}

export function suitGlyph(suit: Suit): string {
  return { clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠' }[suit]
}
