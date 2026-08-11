import { describe, expect, it } from 'vitest'
import { catalogs, normalizeLocale, supportedLocales, translate } from './catalogs'

function placeholders(value: string): string[] {
  return [...value.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]!).sort()
}

describe('language catalogs', () => {
  it('keeps every key and placeholder in all 11 language catalogs', () => {
    const englishKeys = Object.keys(catalogs.en).sort()
    expect(supportedLocales).toHaveLength(11)
    for (const locale of supportedLocales) {
      expect(Object.keys(catalogs[locale]).sort()).toEqual(englishKeys)
      for (const key of englishKeys) {
        const message = catalogs[locale][key as keyof typeof catalogs.en]
        expect(message).toBeTruthy()
        expect(message).not.toContain('\n')
        expect(placeholders(message)).toEqual(placeholders(catalogs.en[key as keyof typeof catalogs.en]))
        expect(message).not.toMatch(/ZXQ(?:PH|SEP)/)
      }
    }
  })

  it('interpolates values without leaking template syntax', () => {
    expect(translate('zh-Hans', 'status.teamScore', { ns: 3, ew: 2 })).toBe('南北 3 · 东西 2')
  })

  it('rejects unsupported persisted locale values', () => {
    expect(normalizeLocale('fr')).toBe('fr')
    expect(normalizeLocale('ar')).toBe('ar')
    expect(normalizeLocale('__proto__')).toBe('en')
    expect(normalizeLocale('ja')).toBe('ja')
    expect(normalizeLocale({ toString: () => 'ja' })).toBe('en')
  })
})
