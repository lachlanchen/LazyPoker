import { describe, expect, it } from 'vitest'
import { applyBridgeAction, initialBridgeState, legalBridgeActions } from './bridge'
import { applyGuandanAction, initialGuandanState, legalGuandanActions } from './guandan'
import { applyHoldemAction, initialHoldemState, legalHoldemActions } from './holdem'
import { bridgeTeaching, guandanTeaching, holdemTeaching } from './teacher'

describe('learner teaching boundary', () => {
  it('does not expose a teaching packet derived from another Hold’em seat', () => {
    const state = initialHoldemState('opaque-villain-turn')
    const call = legalHoldemActions(state, 'hero').find((candidate) => candidate.action.kind === 'call')!
    const villainTurn = applyHoldemAction(state, { candidateId: call.id, clientRequestId: 'hero-call' })
    expect(villainTurn.activePlayer).toBe('villain')
    expect(holdemTeaching(villainTurn)).toEqual([])
  })

  it('does not expose Bridge or Guandan advice from hidden agent hands', () => {
    const bridge = initialBridgeState('opaque-east-turn')
    const bridgePlay = legalBridgeActions(bridge, 'south')[0]!
    const westTurn = applyBridgeAction(bridge, { candidateId: bridgePlay.id, clientRequestId: 'south-play' })
    expect(westTurn.activeSeat).toBe('west')
    expect(bridgeTeaching(westTurn)).toEqual([])

    const guandan = initialGuandanState('opaque-right-turn')
    const guandanPlay = legalGuandanActions(guandan, 'you')[0]!
    const rightTurn = applyGuandanAction(guandan, { candidateId: guandanPlay.id, clientRequestId: 'you-play' })
    expect(rightTurn.activeSeat).toBe('right')
    expect(guandanTeaching(rightTurn)).toEqual([])
  })

  it('labels deterministic Bridge trick position as exact evidence', () => {
    const packets = bridgeTeaching(initialBridgeState('bridge-exact-provenance'))
    expect(packets.length).toBeGreaterThan(0)
    expect(packets.every((packet) => packet.facets.find((facet) => facet.titleKey === 'facet.trickPosition')?.evidence === 'exact')).toBe(true)
  })

  it('distinguishes an exact Guandan opening lead from a response threshold', () => {
    const opening = initialGuandanState('guandan-facet-context')
    const openingPackets = guandanTeaching(opening)

    expect(openingPackets.length).toBeGreaterThan(0)
    expect(openingPackets.every((packet) => {
      const facet = packet.facets[0]
      return facet?.evidence === 'exact'
        && facet.titleKey === 'facet.guandanOpenLead'
        && facet.bodyKey === 'facet.guandanOpenLeadBody'
        && facet.value === undefined
    })).toBe(true)

    const currentCard = opening.hands.right[0]!
    const response = {
      ...opening,
      activeSeat: 'you' as const,
      leader: 'right' as const,
      currentPlay: { seat: 'right' as const, card: currentCard },
      responseQueue: ['you', 'partner', 'left'] as const,
      hands: { ...opening.hands, right: opening.hands.right.filter((card) => card.id !== currentCard.id) },
    }
    const responsePackets = guandanTeaching(response)

    expect(responsePackets.length).toBeGreaterThan(0)
    expect(responsePackets.every((packet) => {
      const facet = packet.facets[0]
      return facet?.evidence === 'exact'
        && facet.titleKey === 'facet.initiative'
        && facet.bodyKey === 'facet.initiativeBody'
        && facet.value === `${currentCard.rank}`
    })).toBe(true)
  })
})
