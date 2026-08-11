import type { Locale } from '../core/types'
import { translate } from './catalogs'

export function localizedDocumentMetadata(locale: Locale): { title: string; description: string } {
  return {
    title: `${translate(locale, 'app.title')} · ${translate(locale, 'app.subtitle')}`,
    description: translate(locale, 'mode.holdemDescription'),
  }
}
