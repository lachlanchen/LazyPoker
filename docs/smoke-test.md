# Browser smoke check

The only documented Poker URL is <http://127.0.0.1:8020/>. Both the development
and production-preview scripts use strict port 8020, so a report from another
port is not valid evidence for this repository.

For a future shared noVNC review, reuse the workspace-owned GUI stack and:

1. Run `npm run build && npm run preview`.
2. Open `http://127.0.0.1:8020/` at desktop and 390 × 844 widths.
3. Confirm no console errors, external requests, overflow, or hidden-card text.
4. Pointer-hover and keyboard-focus a candidate; verify “Preview” appears while
   the revision and chronicle remain unchanged.
5. Confirm once; verify exactly one revision is stored.
6. Exercise EN, 简中 and 日本語, then restore or remove only sessions created by
   this smoke run.

No browser runtime is launched by model/source setup scripts.
