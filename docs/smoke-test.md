# Browser smoke check

The only documented Poker URL is <http://127.0.0.1:8020/>. Both the development
and production-preview scripts use strict port 8020, so a report from another
port is not valid evidence for this repository.

For a future shared noVNC review, reuse the workspace-owned GUI stack and:

1. Run `npm run build && npm run preview`.
2. Open `http://127.0.0.1:8020/` at desktop, 1024 × 768, 768 × 1024,
   and 390 × 844 widths so both responsive breakpoint boundaries are exercised.
3. Confirm no console errors, external requests, overflow, or hidden-card text.
4. On the first own turn, verify a suggested legal action appears without an
   automatic commit. Hold’em must show the board-and-price map, Bridge the trick
   compass, and Guandan the initiative queue.
5. Pointer-hover, keyboard-focus, and tap a candidate; verify the mode-specific
   visualization and “Preview” evidence change while revision and chronicle
   remain unchanged. Clear with right-click and `Esc`.
6. Confirm once; verify exactly one revision is stored, the hypothetical layer
   clears, and the current-state instrument recomputes.
7. Verify the bounded edge copy when those positions are reached: a Hold’em
   river says the board is complete, while a flop/turn fold says the hand is
   complete; neither shows a next-card fraction. A fourth Bridge card names
   the resolved winner (and the fifth-trick preview
   says the lesson ends) without a later-seat warning; a second Guandan
   finisher shows immediate completion with no responder or failure condition.
8. In Guandan, verify the visible owner/now/wait labels and accessible names
   follow the stored response queue exactly, rather than fixed compass order.
   An opening-lead preview must say that any visible single can establish
   initiative, with no beat threshold and no Pass; once a single is current,
   the preview must instead show the response threshold and legal Pass.
9. Exercise EN, 简中 and 日本語, then restore or remove only sessions created by
   this smoke run.

No browser runtime is launched by model/source setup scripts.
