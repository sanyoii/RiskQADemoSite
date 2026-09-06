# Visual status cards · local implementation

Date: 2026-09-06. Base: `c26b3b60cc0fac2a06ef474639d2ed5173bbe240`, branch `codex/fix-navigation-bilingual`. Delivery: uncommitted local implementation; no push or deployment in this turn.

## Approved direction

Three standalone samples are retained in `design-samples/visual-status/index.html`: A status cards, B signal matrix and C decision board. Each supports EN/ZH and separates the frozen current snapshot from explicitly synthetic mixed-status examples. Query parameters `view=a|b|c`, `data=current|demo` and `lang=zh|en` select an initial preview. No sample data is imported into the application.

The user accepted the recommendation to adopt A. The actual homepage now has four status totals/filter buttons, large icon-and-text verdicts, one-line evidence reasons and last recorded test dates. Empty filters have a clear message and an all-repositories reset. Unknown is distinct from failed tests. Existing reasons, owner actions, gates, scope, coverage, history and provenance remain inside native collapsed details. The clock explanation is also expandable; the existing 30-second/focus/visibility checks are unchanged.

Changes: `app/_dashboard.tsx`, `app/page.tsx`, scoped decision styles in `app/globals.css`, and regression assertions in `tests/rendered-html.test.mjs`. No dependency, decision-policy, snapshot, workflow or authorization changes. `git diff -- data lib .github` was empty after verification.

## Automated verification

Environment: Windows, Node v24.19.0. Command: `npm run verify:workflow`. Receipt: `decision-workflow/artifacts/2026-09-06T12-08-21-194Z/receipt.json` (local, Git-ignored).

| Scope | Actual result |
|---|---|
| Archive registry | Pass: 2 historical repositories |
| Contract tests | Pass: 42/42 |
| Playbook tests | Pass: 12/12 and 14 fixtures |
| Rendered tests | Pass: 10/10; added assertions that actions/codes stay inside collapsed evidence and cards remain Unknown |
| Lint / typecheck | Pass, exit 0 |
| Pages build / export | Pass, exit 0; 7 prerendered routes |
| Product release gate | Fail, exit 1: `DATA_NOT_FRESH:dataStatus`; expected existing evidence boundary |
| Sample JavaScript syntax | Pass via Node `vm.Script` |
| Whitespace validation | `git diff --check`, Pass |

Additional fresh export: `node scripts/prepare-pages-artifact.mjs --source dist/client --output out/visual-cards-20260906-1209/test-status`, exit 0.

## Browser verification

Local Chrome, real exported application at `http://127.0.0.1:4179/test-status/`:

- Actual viewport widths 1280 and 375; EN and ZH; no document horizontal overflow or paired-text mismatches. Counts remained Ready 0 / At Risk 0 / No-Go 0 / Unknown 2.
- Both native evidence panels were closed by default. Supported locator visibility check confirmed actions were hidden; opening via Enter made the original reasons/owner/code text visible. Closing via Enter hid it again.
- Filtering Ready produced zero cards and the localized empty state; switching language updated that state; Show all restored both cards.
- Expanded evidence at both widths had no horizontal overflow. Reload restored the chosen language. Temporary viewport overrides were cleared.
- Desktop screenshot inspected in the task: large Unknown labels, short expired-evidence reasons, compact header and colored summary. At the initial 1629 x 754 viewport both card verdicts ended around y=710.
- A diagnostic using element bounds was unsuitable for closed native details. A follow-up `checkVisibility()` call was unsupported by the browser tool; supported locator `isVisible()` correctly verified hidden/visible states. These diagnostic limitations were not treated as application failures or passing evidence.

Standalone samples at `http://127.0.0.1:4178/`: 12 desktop combinations (3 layouts x 2 datasets x 2 languages) passed item-count/source-label/overflow checks; filtering and native dialog/Escape worked. Six 375 px mixed-demo layout/language checks passed; B uses an intentionally contained, keyboard-focusable horizontal table scroller. Desktop screenshots of A/B/C were inspected; the mobile sample screenshot timed out, so only DOM/layout checks are claimed there. The separate sample testing tab was closed; the user-facing sample and application preview tabs were retained.

The two loopback-only preview servers remain running for user review. No new product approval, cross-browser certification or persistent monitoring is claimed.

## English-content follow-up · 2026-09-06

User reported Chinese remaining on the English page. Reproduced in local Chrome after expanding historical evidence: seven distinct Chinese gate titles/notes were rendered directly from immutable snapshots. The earlier paired-text check did not detect unpaired source text; its passing result did not establish that the entire English page was translated.

Fix: exact-source English translations in `app/_dashboard.tsx`, rendered through the existing bilingual component. Chinese mode retains the recorded wording. No snapshot, digest, status policy or approval claim is changed. The explanatory source note now describes the translation accurately.

Regression: `npm run test:rendered` first returned exit 1 (10 pass, 1 fail), identifying Chinese in homepage content. The new test scans the text of all six public pages, including collapsed evidence, excluding translation attributes and scripts rather than checking only already-paired strings.

Fresh verification: `npm run verify:workflow`, Windows / Node v24.19.0; receipt `decision-workflow/artifacts/2026-09-06T12-24-01-531Z/receipt.json`. Contract 42/42, Playbooks 12/12 plus 14 fixtures, rendered 11/11 (65 tests total); lint, types, Pages build/export all exit 0. Product release gate still Fail, exit 1: `DATA_NOT_FRESH:dataStatus`; no new product approval.

Preview export: `node scripts/prepare-pages-artifact.mjs --source dist/client --output out/english-gates-20260906-1225/test-status`, exit 0. Active corrected preview: `http://127.0.0.1:4180/test-status/` (loopback-only Python server).

Browser checks on that export: all six routes' English main content had no Han characters. Homepage with both evidence panels expanded passed; ZH restored the original seven phrases, EN removed all Han again; Ready empty filter and Show all recreated English cards/details correctly. No new responsive-layout or cross-browser claims for this translation-only change.

Preview limitation: Ctrl+C did not stop the older 4179 server. Read-only port/process checks identified Python PID 1048, started at 20:09; targeted termination failed with Access denied, including the elevated attempt. A newly started server also bound 4179, so that port is not a reliable corrected preview. It was not used as passing evidence; use 4180. No files were deleted or old artifacts overwritten. No commit, push or deployment.
