# Visible browser verification · 2026-09-06

Environment: installed Chrome with existing user extensions; local Vinext at port 4175 and static Pages preview at port 4176. No production site changed. This is tool-assisted observation, not independent human acceptance.

## Executed checks

| Check | Actual result |
|---|---|
| Dashboard hydration | Initial Unknown/unverified became Unknown/expired after the current clock check; both repositories showed `EVIDENCE_STALE` and `RELEASE_EVIDENCE_REQUIRED` |
| Homepage EN→ZH and reload | `lang=zh-Hant`, `目前 0 / 2 個就緒`; zero mismatches against `data-zh` after hydration |
| Dynamic replay in Chinese | Proposed fix → Hold / `no-rerun`; keyboard Enter on hypothetical passing rerun → Hold / `no-owner-approval`; zero localized-text mismatches |
| Desktop English replay | Hold retained on language change; zero localized-text mismatches; no horizontal overflow at viewport 1280 |
| Original Fail Demo overlap location | Visible desktop screenshot shows “Do not release” on one line beside its icon; measured localized label width 107.61px, no narrow icon-width constraint |
| Static Pages main navigation | Homepage link opened `/test-status/run-records/`; all six public routes rendered the expected headings |
| Static Pages replay | Clicking hypothetical passing rerun produced Hold, never an invented Go |
| 375×812, all six routes, both languages | `scrollWidth <= innerWidth` on every check; zero mismatches against selected `data-en` / `data-zh`; expected `lang=en` / `zh-Hant` |
| Viewport cleanup | Temporary viewport override reset |

Routes: `/`, `/run-records/`, `/run-records/fail-demo/`, `/dashboard-demo/`, `/dashboard-demo/ac/`, `/dashboard-demo/abc/` under the `/test-status/` prefix. Screenshots were inspected through the visible browser tool; no screenshot file was saved or claimed.

Initial static preview artifact: `out/pages-2026-09-06T10-04-38-864Z`. The final verification run produced `out/pages-2026-09-06T10-06-44-646Z`; all six routes in both languages at 375×812 were then rechecked against this final artifact at port 4177, again with zero overflow and zero localized-text mismatches. Keyboard Enter on the final artifact's hypothetical passing-rerun button produced Hold. Temporary viewport overrides were reset.

The two export directories are not byte-identical: Vinext build IDs, manifests and associated chunks change per build. No claim of reproducible byte-for-byte builds is made; the last artifact was tested directly.

## Warnings and unverified boundaries

- Development-console hydration warnings explicitly listed body attributes added by existing Testim/Grammarly-related browser extensions (`data-testim-main-word-scripts-loaded`, `data-new-gr-c-s-check-loaded`, `data-gr-ext-installed`). Those extensions were not disabled or modified. Do not claim a pristine-browser console pass.
- A first immediate post-navigation read was English before the saved-language effect ran; after hydration, Chinese persisted. This is an initial-language flash, not zero-flash localization.
- One automation locator used an unsupported `level` option and matched several headings; it was corrected to the actual `h1` selector. No application defect was inferred from that tool failure.
- New-user 30-second comprehension, independent reviewer judgment and real product release approval were not performed.
