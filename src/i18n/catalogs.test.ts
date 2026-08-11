import { describe, expect, it } from 'vitest'
import { catalogs, normalizeLocale, translate } from './catalogs'

describe('language catalogs', () => {
  it('keeps every English teaching key in Chinese and Japanese', () => {
    const englishKeys = Object.keys(catalogs.en).sort()
    expect(Object.keys(catalogs['zh-Hans']).sort()).toEqual(englishKeys)
    expect(Object.keys(catalogs.ja).sort()).toEqual(englishKeys)
  })

  it('interpolates values without leaking template syntax', () => {
    expect(translate('zh-Hans', 'status.teamScore', { ns: 3, ew: 2 })).toBe('南北 3 · 东西 2')
  })

  it('rejects unsupported persisted locale values', () => {
    expect(normalizeLocale('fr')).toBe('en')
    expect(normalizeLocale('__proto__')).toBe('en')
    expect(normalizeLocale('ja')).toBe('ja')
  })
})
