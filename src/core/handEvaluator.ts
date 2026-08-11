import type { Card } from './types'

export const handCategoryKeys = [
  'hand.highCard', 'hand.pair', 'hand.twoPair', 'hand.trips', 'hand.straight',
  'hand.flush', 'hand.fullHouse', 'hand.quads', 'hand.straightFlush',
] as const

export interface HandValue {
  readonly category: number
  readonly kickers: readonly number[]
  readonly categoryKey: (typeof handCategoryKeys)[number]
  readonly cards: readonly Card[]
}

function descendingRanks(cards: readonly Card[]): number[] {
  return cards.map((card) => card.rank).sort((a, b) => b - a)
}

function straightHigh(ranks: readonly number[]): number | null {
  const unique = [...new Set(ranks)].sort((a, b) => b - a)
  if (unique.includes(14)) unique.push(1)
  for (let index = 0; index <= unique.length - 5; index += 1) {
    const window = unique.slice(index, index + 5)
    if ((window[0] as number) - (window[4] as number) === 4) return window[0] as number
  }
  return null
}

function evaluateFive(cards: readonly Card[]): HandValue {
  const ranks = descendingRanks(cards)
  const groups = [...new Set(ranks)].map((rank) => ({ rank, count: ranks.filter((item) => item === rank).length })).sort((a, b) => b.count - a.count || b.rank - a.rank)
  const flush = cards.every((card) => card.suit === cards[0]?.suit)
  const straight = straightHigh(ranks)
  let category = 0
  let kickers = ranks
  if (flush && straight !== null) { category = 8; kickers = [straight] }
  else if (groups[0]?.count === 4) { category = 7; kickers = [groups[0].rank, groups[1]?.rank ?? 0] }
  else if (groups[0]?.count === 3 && groups[1]?.count === 2) { category = 6; kickers = [groups[0].rank, groups[1].rank] }
  else if (flush) { category = 5 }
  else if (straight !== null) { category = 4; kickers = [straight] }
  else if (groups[0]?.count === 3) { category = 3; kickers = [groups[0].rank, ...groups.slice(1).map((group) => group.rank).sort((a, b) => b - a)] }
  else if (groups[0]?.count === 2 && groups[1]?.count === 2) { category = 2; kickers = [Math.max(groups[0].rank, groups[1].rank), Math.min(groups[0].rank, groups[1].rank), groups[2]?.rank ?? 0] }
  else if (groups[0]?.count === 2) { category = 1; kickers = [groups[0].rank, ...groups.slice(1).map((group) => group.rank).sort((a, b) => b - a)] }
  return { category, kickers, categoryKey: handCategoryKeys[category] as HandValue['categoryKey'], cards }
}

export function compareHands(left: HandValue, right: HandValue): number {
  if (left.category !== right.category) return Math.sign(left.category - right.category)
  const length = Math.max(left.kickers.length, right.kickers.length)
  for (let index = 0; index < length; index += 1) {
    const difference = (left.kickers[index] ?? 0) - (right.kickers[index] ?? 0)
    if (difference !== 0) return Math.sign(difference)
  }
  return 0
}

function combinations<T>(items: readonly T[], choose: number): T[][] {
  if (choose === 0) return [[]]
  const output: T[][] = []
  for (let index = 0; index <= items.length - choose; index += 1) {
    for (const tail of combinations(items.slice(index + 1), choose - 1)) {
      output.push([items[index] as T, ...tail])
    }
  }
  return output
}

export function evaluateHoldem(cards: readonly Card[]): HandValue {
  if (cards.length < 5 || cards.length > 7) throw new Error('Hold’em evaluation needs five to seven cards')
  return combinations(cards, 5).map(evaluateFive).reduce((best, value) => compareHands(value, best) > 0 ? value : best)
}
