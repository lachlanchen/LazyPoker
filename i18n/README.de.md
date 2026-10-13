[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)

[![LazyingArt banner — apps and four buddies](https://github.com/lachlanchen/LazyingArtWebsite/raw/main/media/brand/lazyingart-intro.gif)](https://lazying.art)

# LazyPoker · Open Table

*Prüfen Sie zulässige Aktionen und ihre Belege, und bestätigen Sie dann genau eine Aktion.*

[![Lazying Art](https://img.shields.io/badge/Lazying-Art-0EA5E9?style=flat-square)](https://lazying.art) [![App screenshot](https://img.shields.io/badge/App-screenshot-173F5F?style=flat-square)](../docs/images/app.png) [![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=flat-square&logo=githubsponsors)](https://github.com/sponsors/lachlanchen)

LazyPoker ist ein lokal arbeitender Entscheidungstrainer für eine vollständige Heads-up-Hand Texas Hold’em und klar begrenzte Einführungstische für Contract Bridge und Guandan. Deterministischer Code verwaltet Regeln, Informationsausblendung, Wertung, Verlauf und Persistenz.

## Unterstützen Sie offene Lehrmittel

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=kofi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## App-Vorschau

[![Screenshot der Anwendung](../docs/images/app.png)](../docs/images/app.png)

Der Lerntisch gibt jedem Spiel ein eigenes kompaktes Entscheidungsinstrument statt einer allgemeinen „Kraft“-Anzeige:

- Hold’em nutzt eine Board-und-Preis-Karte für öffentliche Struktur, Sichtkarten-Equity, mögliche Verbesserungen durch die nächste Karte, Callpreis, effektiven Stack und den Einsatz jedes Kandidaten.
- Bridge nutzt einen Stichkompass für Ausspielfarbe, festen Trumpf, sichtbare Führung, Bedienpflicht und Rangkosten der vorgeschauten Karte.
- Guandan nutzt eine Initiativreihe für Antwortreihenfolge, Schwelle, legale Überbietungen, öffentliche Team-Kartenzahlen und Reservekosten hoher Karten.

In jedem eigenen Zug erscheint ein transparenter Lehrvorschlag. Zeigen, Fokussieren oder Tippen öffnet eine Vorschau ohne Änderung; Rechtsklick oder `Esc` löscht sie, und nur die Bestätigung führt die Aktion aus.

## Was ist spielbar?

- Texas Hold’em: eine vollständige Heads-up-No-Limit-Hand mit Blinds, vier Setzrunden, All-in, Fold, Showdown-Auswertung und Pot-Abrechnung.
- Contract Bridge: ein Einsteigertisch mit fünf Stichen für Farbzwang, festen Pik-Trumpf, Stichgewinner und Partnerspiel; Reizen, Dummy, Kontrakte und Duplicate-Wertung gehören nicht zu dieser Lektion.
- Guandan: ein Einsteigertisch mit sechs Karten und nur Einzelkarten für Initiative, Passen und Partnerbewusstsein; Kombinationen, Bomben, Tribute, Level-Wildcards und Aufstiegswertung gehören nicht zu dieser Lektion.
- Alle Modi nutzen dieselbe Lernschleife: eine von der deterministischen Regel-Engine erzeugte zulässige Option prüfen, ohne Zustandsänderung vorschauen und ausdrücklich bestätigen.

## Repository-Karte

| Pfad | Zweck |
| --- | --- |
| [`src/core/`](../src/core/) | Deterministische Karten, Regeln, zulässige Kandidaten, Zustandsübergänge, Informationsausblendung, Bewertung und Persistenz. |
| [`src/i18n/catalogs.ts`](../src/i18n/catalogs.ts) | Elf vollständige Kataloge für Lernende mit stabilen Schlüsseln und Platzhaltern. |
| [`src/core/decisionAnalysis.ts`](../src/core/decisionAnalysis.ts) | Hold’em-, Bridge- und Guandan-Entscheidungsbelege ausschließlich aus öffentlichen Beobachtungen. |
| [`src/i18n/analysisCatalogs.ts`](../src/i18n/analysisCatalogs.ts) | Kontextübersetzungen für die drei spielspezifischen Analyseinstrumente. |
| [`src/App.tsx`](../src/App.tsx) | Die gemeinsame mehrsprachige Spieltisch-, Vorschau-, Bestätigungs-, Verlaufs- und Methodenschnittstelle. |
| [`docs/model-options.md`](../docs/model-options.md) | Optionale Löser- und Modellauswahl mit ihren Evidenz- und Sicherheitsgrenzen. |
| [`docs/smoke-test.md`](../docs/smoke-test.md) | Wiederholbare Schritte zur Browserüberprüfung. |
| [`docs/images/app.png`](../docs/images/app.png) | Aktueller Anwendungs-Screenshot. |

## Schnellstart

Erfordert Node.js `^20.19.0` oder `>=22.12.0` sowie npm.

```bash
npm ci
npm run dev
```

<http://127.0.0.1:8020/>

Öffnen Sie die von Vite angezeigte lokale URL. Der Entwicklungsport ist auf 8020 festgelegt; ist er belegt, schlägt die Anwendung sicher fehl, statt einen anderen Port zu wählen.

## Autorität, Privatsphäre und Beweise

- Öffentliche Ansichten entfernen vor dem Rendern die Deckreihenfolge, Seeds, Anforderungsbücher, Gegnerkarten, Partnerkarten und private Analysen.
- Undurchsichtige Kandidaten-IDs binden den vollständigen maßgeblichen Zustand, den Akteur und die kanonische Aktion; veraltete oder unbekannte Auswahlmöglichkeiten werden sicher abgelehnt.
- Die Vorschau ist hypothetisch und enthüllt niemals eine zukünftige Gemeinschaftskarte. Nur die Bestätigung verändert den Zustand.
- Exakte Regeln, berechnete Stichproben und verfasste Strategien bleiben separat gekennzeichnet. Die Hold’em-Equity nimmt gleichverteilte zulässige unbekannte Karten an; „Verbesserungen“ stärken nur die sichtbare gemachte Hand und sind keine garantierten Gewinn-Outs. Keiner der Werte liest eine gegnerische Range oder wird als GTO dargestellt.
- Bridge liest nur die eigene Hand und bereits gespielte Karten; Guandan nur die eigene Hand, die aktuelle Einzelkarte, öffentliche Kartenzahlen und die Antwortreihe. Änderungen ausschließlich verborgener Zustände lassen die semantische Analyse unverändert.

## Überprüfung

```bash
npm run lint
npm test
npm run build
npm run audit
bash -n scripts/*.sh
bash scripts/test-model-safety.sh
git diff --check
```

Die Tests umfassen deterministisches Geben, Karteneindeutigkeit, Wertung und Chiperhaltung, veraltete Kandidaten, Redaction und Hidden-State-Nichtbeeinflussung, undurchsichtige Agentenzüge, Idempotenz, Persistenzkonflikte, Vorschläge, löschbare nicht mutierende Vorschauen, Neuberechnung nach Bestätigung, spielspezifische Instrumente, Port-Pinning und strikte Parität aller elf Sprachkataloge.

## Zitat

Wenn Sie LazyPoker in Lehre oder Forschung verwenden, zitieren Sie das Repository. GitHub liest [CITATION.cff](../CITATION.cff) und zeigt den Bereich „Dieses Repository zitieren“ an.

```bibtex
@software{chen_lazy_poker_2026,
  author  = {Chen, Lachlan},
  title   = {LazyPoker: Hold'em, Contract Bridge, and Guandan Decision Teacher},
  year    = {2026},
  version = {0.1.0},
  url     = {https://github.com/lachlanchen/LazyPoker}
}
```

## Status

Der Texas Hold’em-Modus ist eine komplette Heads-up-Hand. Bridge und Guandan bleiben auffällig als Teilmengen für den Anfängerunterricht gekennzeichnet und behaupten nicht, dass sie vollständig wettbewerbsfähige Implementierungen darstellen. Optionale Modelle sind standardmäßig deaktiviert.
