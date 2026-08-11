import { describe, expect, it } from 'vitest'
import { makeDeck } from './cards'
import { compareHands, evaluateHoldem } from './handEvaluator'

const deck = makeDeck()
const cards = (...ids: string[]) => ids.map((id) => deck.find((card) => card.id === id)!)

describe('Hold’em hand evaluation', () => {
  it('recognizes a wheel straight and royal straight flush', () => {
    expect(evaluateHoldem(cards('AS', '2C', '3D', '4H', '5S', 'KD', 'QC')).categoryKey).toBe('hand.straight')
    expect(evaluateHoldem(cards('AS', 'KS', 'QS', 'JS', 'TS', '2D', '3C')).categoryKey).toBe('hand.straightFlush')
  })

  it('orders full houses by trips before pair', () => {
    const aces = evaluateHoldem(cards('AS', 'AH', 'AD', 'KS', 'KH', '2C', '3D'))
    const kings = evaluateHoldem(cards('KS', 'KH', 'KD', 'AS', 'AH', '2C', '3D'))
    expect(compareHands(aces, kings)).toBeGreaterThan(0)
  })

  it('uses all kickers to settle equal categories', () => {
    const queen = evaluateHoldem(cards('AS', 'AH', 'QD', 'JC', '9S', '4H', '2D'))
    const ten = evaluateHoldem(cards('AC', 'AD', 'TD', '8C', '7S', '4D', '2H'))
    expect(compareHands(queen, ten)).toBeGreaterThan(0)
  })
})
