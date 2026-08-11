# Reviewed engine and model options

Review date: 2026-08-11. These are optional evidence providers, not game
authorities. The application runs without them. The lock file pins immutable
Git commits; `setup-models.sh` checks out and verifies those commit checksums.
No model, dataset, or binary is downloaded by default.

## Texas Hold'em — OpenSpiel v2.0.1

- Primary source: [google-deepmind/open_spiel](https://github.com/google-deepmind/open_spiel)
- Pin: tag `v2.0.1`, commit `112b77704631fc2ce7ad8e4581f6ca09798ce15a`
- License: Apache-2.0; source repository is approximately 38 MiB by GitHub's
  repository-size field.
- Fit: OpenSpiel provides poker environments and CFR-family algorithms. It is a
  sound research substrate for bounded policy/equity experiments, not a
  ready-made solved strategy for this app's no-limit tree.
- Integration boundary: receive a redacted observation plus legal candidate
  IDs, return numeric evidence keyed to those IDs. It must never receive the
  authoritative seed/deck or apply an action.

We intentionally do not call a sampled equity estimate “GTO”. Full no-limit
Hold'em remains unsolved at arbitrary stacks and bet sizes; abstraction and
opponent-range assumptions must be shown beside any result.

## Contract Bridge — DDS 3.0 and BRL

### DDS 3.0

- Primary source: [dds-bridge/dds](https://github.com/dds-bridge/dds)
- Pin: tag `v3.0.0`, commit `37c8a79f4c67c55d1a309ccb66dd00cb58af464a`
- License: Apache-2.0; source repository approximately 23 MiB.
- Fit: fast double-dummy play analysis. “Double dummy” means all four hands are
  known to the solver; it is not a valid claim about what a player could know.
  Results must therefore be labeled engine evidence and never shown before the
  teaching scenario authorizes revealing the full deal.

### BRL bridge-bidding baseline — metadata only, quarantined

- Primary source/model repository: [harukaki/brl](https://github.com/harukaki/brl)
- Associated primary paper: [A Simple, Solid, and Reproducible Baseline for
  Bridge Bidding AI](https://arxiv.org/abs/2406.10306)
- Pin: commit `fdd958ff8adcb44844d70ea2e233bed18d5a7b70`
- License: Apache-2.0; repository approximately 67 MiB and contains published
  executable Python pickle parameter files.
- Fit: bidding research, not card-play authority. Its published best model is
  reported by the authors at +1.24 IMP/board against WBridge5 under their
  evaluation. That benchmark result must not be generalized to arbitrary human
  partnership systems.
- Extra data: the upstream workflow requires large OpenSpiel/PGX DDS datasets.
  They are deliberately excluded from the setup script until their exact size,
  redistribution terms, and upstream checksum are recorded.

BRL is deliberately absent from `model-sources.lock`: cloning the source would
also download unmanifested executable pickle weights. The setup script therefore
rejects `brl`. A future integration must obtain a source-only archive or list
each weight with exact bytes, SHA-256 and safe conversion in a quarantined
process. Never unpickle an upstream artifact in the application process.

## Guandan — NUAA research implementation

- Primary source: [LSTM-Kirigaya/NUAA-guandan](https://github.com/LSTM-Kirigaya/NUAA-guandan)
- Pin: commit `f6920868649c26536b3dc3fce8ecd1d4f7c755fa`
- License: MIT; repository approximately 16 MiB.
- Fit: an experimental imitation/reinforcement-learning system with several
  historical agents. Upstream explicitly has unfinished integration work and
  its README does not claim Linux support. Treat it as a research reference,
  not a production-strength recommendation.

DanZero/DanZero+ papers report substantially stronger Guandan agents, but the
repositories found during this review either lacked a clearly declared source
license or lacked a stable, checksum-published model release. They are not in
the install allowlist. Relevant primary papers:

- [DanZero](https://arxiv.org/abs/2210.17087)
- [DanZero+](https://arxiv.org/abs/2312.02561)
- [GuanZero](https://arxiv.org/abs/2402.13582)

This is an intentional gap: “available on GitHub” is not enough to authorize
redistribution or silently trust a checkpoint.

## Safe setup

```bash
scripts/setup-models.sh --list
scripts/setup-models.sh open-spiel dds
scripts/verify-models.sh
```

The allowlisted scripts install source checkouts only under ignored
`.local/models/sources` (BRL is research metadata only and cannot be fetched).
They verify exact Git commit checksums, origin URLs, and tracked-file
cleanliness. They never execute upstream code, install dependencies, or fetch
weights/datasets. Each future artifact must add an immutable URL, expected byte
size, SHA-256 checksum, license, and an explicit user-triggered download step.
