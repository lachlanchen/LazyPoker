[English](README.md) · [العربية](i18n/README.ar.md) · [Español](i18n/README.es.md) · [Français](i18n/README.fr.md) · [日本語](i18n/README.ja.md) · [한국어](i18n/README.ko.md) · [Tiếng Việt](i18n/README.vi.md) · [中文 (简体)](i18n/README.zh-Hans.md) · [中文（繁體）](i18n/README.zh-Hant.md) · [Deutsch](i18n/README.de.md) · [Русский](i18n/README.ru.md)

[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

# LazyPoker · Open Table

*Inspect legal intentions, preview honest evidence, then confirm exactly one action.*

[![Lazying Art](https://img.shields.io/badge/Lazying-Art-0EA5E9?style=flat-square)](https://lazying.art) [![App screenshot](https://img.shields.io/badge/App-screenshot-173F5F?style=flat-square)](docs/images/app.png) [![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=flat-square&logo=githubsponsors)](https://github.com/sponsors/lachlanchen)

LazyPoker is a local-first decision teacher for a complete heads-up Texas Hold’em hand and clearly bounded introductory Contract Bridge and Guandan tables. Deterministic code owns rules, redaction, scoring, history, and persistence.

## Support open teaching tools

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=kofi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## App preview

[![Application screenshot](docs/images/app.png)](docs/images/app.png)

The current learning table keeps legal choices, non-mutating previews, and exact, calculated, and authored evidence visibly separate.

## What is playable

- Texas Hold’em: a complete heads-up no-limit hand with blinds, four betting streets, all-in play, folding, showdown evaluation, and pot settlement.
- Contract Bridge: a five-trick beginner table for follow-suit, fixed spade trump, trick winners, and partnership timing; bidding, dummy, contracts, and duplicate scoring are outside this lesson.
- Guandan: a six-card, singles-only beginner table for initiative, passing, and partner awareness; combinations, bombs, tribute, level wildcards, and promotion scoring are outside this lesson.
- All modes use the same learning loop: inspect a legal option produced by the deterministic rules engine, preview without mutation, and confirm explicitly.

## Repository map

| Path | Purpose |
| --- | --- |
| [`src/core/`](src/core/) | Deterministic cards, rules, legal candidates, state transitions, redaction, evaluation, and persistence. |
| [`src/i18n/catalogs.ts`](src/i18n/catalogs.ts) | Eleven complete learner-facing catalogs with stable keys and placeholders. |
| [`src/App.tsx`](src/App.tsx) | The shared multilingual table, preview, confirmation, history, and method interface. |
| [`docs/model-options.md`](docs/model-options.md) | Optional solver and model choices with their evidence and safety boundaries. |
| [`docs/smoke-test.md`](docs/smoke-test.md) | Repeatable browser review steps. |
| [`docs/images/app.png`](docs/images/app.png) | Current application screenshot. |

## Quick start

Requires Node.js `^20.19.0` or `>=22.12.0`, plus npm.

```bash
npm ci
npm run dev
```

<http://127.0.0.1:8020/>

Open the loopback URL printed by Vite. The configured development port is 8020 and strict-port mode fails closed if that port is occupied.

## Authority, privacy, and evidence

- Public views remove deck order, seeds, request ledgers, opponent cards, partner cards, and private analysis before rendering.
- Opaque candidate IDs bind the complete authoritative state, actor, and canonical action; stale or unknown choices fail closed.
- Preview is hypothetical and never reveals a future board card. Confirmation is the only mutation path.
- Exact rules, calculated samples, and authored strategy remain separately labeled. Hold’em equity assumes uniformly random legal unseen cards; it is not an opponent-range read and is not presented as GTO.

## Verification

```bash
npm run lint
npm test
npm run build
npm run audit
bash -n scripts/*.sh
bash scripts/test-model-safety.sh
git diff --check
```

Tests cover deterministic dealing, card uniqueness, scoring and chip conservation, stale-candidate rejection, hidden-view redaction, idempotent mutations, persistence conflicts, non-mutating previews, port pinning, and strict 11-language key and placeholder parity.

## Citation

If you use LazyPoker in teaching or research, cite the repository. GitHub reads [CITATION.cff](CITATION.cff) and displays a **Cite this repository** panel.

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

The Texas Hold’em mode is a complete heads-up hand. Bridge and Guandan remain conspicuously labeled beginner teaching subsets, not claims of full competitive implementations. Optional models are disabled by default.
