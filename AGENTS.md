# Poker repository guidance

This repository is a production teaching application for hidden-information
card games. Deterministic code owns shuffling, rules, legality, redaction,
state transitions, scoring, history, and persistence.

- Never expose deck order, seeds, opponent cards, or private analysis in a
  public/player view before the rules reveal them.
- Candidate IDs bind the complete authoritative state, actor, and action.
- Previewing is hypothetical; confirmation is the only mutation path.
- Mark facts as exact, calculations as calculated, and strategic guidance as
  authored. Never present a heuristic probability as exact.
- Hold'em is a complete heads-up hand. Bridge and Guandan are visibly labeled
  beginner teaching tables, not full competitive implementations.
- Learner-facing text belongs in the `src/i18n` catalogs.
- Models and generated runtime state belong only in ignored `.local/` paths.

Run `npm run lint && npm test && npm run build && npm run audit` before release.
