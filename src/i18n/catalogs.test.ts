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

  it('uses equity rather than win-probability terminology where ties share the pot', () => {
    expect(translate('ar', 'analysis.equity')).toContain('إكويتي')
    expect(translate('zh-Hans', 'analysis.equity')).toContain('权益')
    expect(translate('zh-Hant', 'analysis.equity')).toContain('權益')
    expect(translate('zh-Hans', 'facet.equity')).not.toContain('胜率')
    expect(translate('zh-Hant', 'facet.equity')).not.toContain('勝率')
  })

  it('describes the Bridge partner-ahead baseline as trump preservation in all locales', () => {
    const messages = supportedLocales.map((locale) => translate(locale, 'suggestion.bridgePartnerAhead'))

    expect(messages).toHaveLength(11)
    expect(messages.every(Boolean)).toBe(true)
    expect(new Set(messages).size).toBe(11)
    expect(translate('en', 'suggestion.bridgePartnerAhead')).toContain('non-trump discard')
    expect(translate('en', 'suggestion.bridgePartnerAhead')).toContain('preserves trump')
    expect(translate('en', 'suggestion.bridgePartnerAhead')).not.toContain('conserves rank')
  })

  it('keeps Guandan opening-lead and response-threshold evidence distinct in every locale', () => {
    for (const locale of supportedLocales) {
      const openingTitle = translate(locale, 'facet.guandanOpenLead')
      const openingBody = translate(locale, 'facet.guandanOpenLeadBody')
      expect(openingTitle).toBeTruthy()
      expect(openingBody).toBeTruthy()
      expect(openingTitle).not.toBe(translate(locale, 'facet.initiative'))
      expect(openingBody).not.toBe(translate(locale, 'facet.initiativeBody'))
    }

    expect(translate('en', 'facet.guandanOpenLeadBody')).toContain('any visible single')
    expect(translate('en', 'facet.guandanOpenLeadBody')).toContain('no beat threshold')
    expect(translate('en', 'facet.guandanOpenLeadBody')).toContain('Pass is not legal')
    expect(translate('en', 'facet.initiativeBody')).toContain('higher than the current single')
    expect(translate('en', 'facet.initiativeBody')).toContain('passing remains legal')
  })

  it('rejects unsupported persisted locale values', () => {
    expect(normalizeLocale('fr')).toBe('fr')
    expect(normalizeLocale('ar')).toBe('ar')
    expect(normalizeLocale('__proto__')).toBe('en')
    expect(normalizeLocale('ja')).toBe('ja')
    expect(normalizeLocale({ toString: () => 'ja' })).toBe('en')
  })
})
