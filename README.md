# Open Table

A deterministic, multilingual teacher for Texas Hold'em and introductory
partnership card-game tables. It uses the same interaction loop for every mode:
inspect legal intentions, preview evidence without mutation, then explicitly
confirm.

## What is playable

| Mode | Scope | Honest boundary |
| --- | --- | --- |
| Texas Hold'em | Complete heads-up no-limit hand: deterministic deal, blinds, fold/check/call/bet/raise/all-in, four streets, hand evaluation and pot settlement | One hand starts with equal 1,000-chip stacks; tournament structure and side pots are outside this heads-up lesson |
| Contract Bridge | Five-trick teaching table with follow-suit, fixed spade trump, trick winner and team score | No bidding, dummy, vulnerability, contract or duplicate scoring |
| Guandan | Six-card, four-seat shedding table teaching higher-single response, pass, initiative and partner order | One deck and singles only; no level wildcards, combinations/bombs, tribute or promotion scoring |

The two limited modes are labeled on both the launcher and active table. They
are useful scenarios, not claims of full competitive rules.

## Safety and teaching guarantees

- Seeded Fisher–Yates dealing is replayable and duplicate-card checked.
- Deterministic adapters alone own legality, transitions, scoring and history.
- Every SHA-256-derived candidate ID binds the complete authoritative state,
  acting player and canonical action. Unknown and stale choices fail closed.
- Every mutation has a client request ID; retried actions and session creation
  are idempotent. Persistence also checks the expected revision.
- Public views remove the seed, undealt deck, request ledger, opponent cards and
  partner cards. Hidden-seat agent choices are opaque until confirmed.
- Preview cards never mutate the session and never reveal a future board card.
- Evidence is visibly separated into **exact**, **calculated**, and **authored**.
  Hold'em equity is a deterministic Monte Carlo sample against uniformly random
  unseen cards—not an opponent-range read and not “GTO”.
- English, Simplified Chinese and Japanese use catalogs with identical stable
  keys and a visible switch.

The current build is a local-first reference client. Authoritative states are
stored in local browser storage; UI rendering receives only viewer-redacted
views. A networked/multi-user deployment must move the same pure adapters and
private state to a trusted server—the browser is not a security boundary
against its own operator.

## Run

Requires Node.js 22 and npm.

```bash
npm ci
npm run dev
```

Open <http://127.0.0.1:8020/>. Both `npm run dev` and `npm run preview`
explicitly use loopback port **8020** with strict-port mode; they fail instead
of silently moving to Vite's default port when 8020 is occupied.

## Verify

```bash
npm run lint
npm test
npm run build
npm run audit
bash -n scripts/*.sh
bash scripts/test-model-safety.sh
git diff --check
```

Tests cover deck uniqueness/replay, hand ranking, chip conservation and
settlement, turn/follow-suit/response legality, stale candidates, hidden-view
redaction, hidden-state-independent equity sampling, payload-bound mutation
idempotency, session deduplication, optimistic resume/conflict recovery,
non-mutating pointer/keyboard previews, port pinning, and catalog parity.

## Optional solvers and models

The app ships and teaches without a model. Reviewed source/model options and
their evidence boundaries are in [docs/model-options.md](docs/model-options.md).
Nothing is downloaded automatically.

```bash
scripts/setup-models.sh --list
scripts/setup-models.sh open-spiel
scripts/verify-models.sh
```

Optional sources live under ignored `.local/`; they cannot mutate a game and
must consume only viewer-redacted state plus server-supplied candidate IDs.

## Architecture

```text
src/core/cards.ts          seeded deck and card identity
src/core/{mode}.ts         pure rules, candidates, apply and redaction
src/core/handEvaluator.ts  exact 5–7 card Hold'em evaluation
src/core/sessionStore.ts   revision-safe local persistence
src/core/teacher.ts        provenance-separated teaching packets
src/i18n/catalogs.ts       en / zh-Hans / ja learner text
src/App.tsx                shared table, preview, confirmation and chronicle UI
```

Licensed under MIT. Optional upstream engines retain their own licenses.

## Citation

GitHub reads [`CITATION.cff`](CITATION.cff) to expose **Cite this repository**.

```bibtex
@software{chen_open_table_2026,
  author  = {Chen, Lachlan},
  title   = {Open Table: Hold'em, Contract Bridge, and Guandan Decision Teacher},
  year    = {2026},
  version = {0.1.0},
  url     = {https://github.com/lachlanchen/Poker}
}
```

## Support

Support continued open-source work through [GitHub Sponsors](https://github.com/sponsors/lachlanchen)
or visit [Lazying Art](https://lazying.art). Funding links are declared in
[`.github/FUNDING.yml`](.github/FUNDING.yml).
