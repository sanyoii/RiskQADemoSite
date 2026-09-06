# Decision workflow reinforcement · verification

Date: 2026-09-06. Delivery state: local implementation verified; not committed, pushed or deployed. Branch: `codex/fix-navigation-bilingual`. Base commit: `e90bafca187c076db1e6ceaf5e79b57ce850c934`.

## Final automated run

Command: `npm run verify:workflow`.

Environment: Windows 10.0.26200, Node v24.19.0. The source was an uncommitted worktree, not the base commit alone. Tested workspace digest: `5e43e0e4d0f3627553ef37cbab0504ead9e3c5b564b49f431aded15a8b52df76`.

Raw receipts/logs: `artifacts/2026-09-06T10-06-44-646Z/receipt.json` and its six adjacent logs. These retain commands, timestamps, exit statuses, hashes and warnings. They are local and Git-ignored; do not publish them without reviewing their contents.

| Command / scope | Result |
|---|---|
| `npm test` | Pass, exit 0: archive registry 2; contract 42/42; Playbook 12/12 plus 14 fixtures; rendered 10/10 |
| `npm run lint` | Pass, exit 0 |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Pass, exit 0 |
| `GITHUB_PAGES=true npm run build` | Pass, exit 0; 7 prerendered routes including 404 |
| `node scripts/prepare-pages-artifact.mjs --source dist/client --output out/pages-2026-09-06T10-06-44-646Z` | Pass, exit 0; directory routes and prefixed assets exported |
| `npm run gate:release` | **Fail, exit 1**: `EVIDENCE_STALE:releaseAssessment.expiresAt`; expected unresolved product evidence, not a software regression |

The earlier recorded full run remains at `artifacts/2026-09-06T10-04-38-864Z/receipt.json`; it had 41 contract tests before the final uncommitted-subject defense/test was added. It is not silently replaced by this later run.

## Earlier findings retained

- Focused policy/contract checks initially failed on duplicate-ID error-path compatibility and the template example's missing G3; both were corrected and rerun.
- `npm run test:contract`: 36/37 initially, because the old stale fixture also lacked required evidence links/G3. The fixture was corrected to isolate expiry; current suite is 42/42.
- First `npm run test:rendered`: 9/10, because an overbroad negative assertion also rejected a preserved historical source phrase. The check now scopes the current first-screen assertion; historical facts remain visible in details.
- First lint failed `no-control-regex`; the URL guard now tests control characters without that regex.
- First typecheck found the new release-review argument's inferred-null type and pre-existing undefined Worker binding types. The option contract and actually used ASSETS type were corrected; the unused DB declaration was removed. Latest typecheck passed.
- Read-only Git commands warned that the global ignore file was not accessible. No global Git permissions/config were changed.

These intermediate failures are not current Pass claims and are not product execution evidence. Raw pre-recorder output remains in the task history; this document does not invent missing timestamps or source hashes for it.

## Browser verification

See [browser-checks.md](browser-checks.md): six routes × EN/ZH at 375×812, desktop checks, language persistence, dynamic replay, keyboard Enter, actual expired state and Pages navigation. Existing extension-injected body attributes caused development hydration warnings; no pristine-browser-console pass is claimed. Initial language can flash English until hydration.

## Implemented scope and retained boundaries

- Shared fail-closed snapshot policy; actual requirement/oracle/artifact file hashing; ID-chain and authority/input binding; immutable attempt/history rules; scoped waivers and optional uncertainty.
- Separated software/archive checks from current release gate; content-addressed sync with failure receipt; safe export refuses existing targets.
- Data-driven current reason/owner/action and coverage; clock reevaluation; real historical replay and clearly synthetic interactive teaching states.
- Removed duplicate sample implementation and unused sample CSS; preserved all six old URLs as current pages/design-history links. Original TestDashboard files remain untouched except a new archival README.
- QA-Lite reduced to three records; authoring library, original evidence and pre-existing English/template edits retained. Cloudflare/Sites remain because current preview/rendered tests depend on them; no production dependency or deployment infrastructure changed.

The filled [release packet](release-evidence.json) records implementation evidence but remains `needs-review` / Hold: its source is uncommitted, oracle acceptance and designated reviewer/owner approval are not supplied. No synthetic fixture or software Pass is promoted to real release Go. New CEX live/manual evidence, new Portfolio decision, independent review and newcomer 30-second comprehension remain outside completed verification.

Final filled-packet check: `npm run review:release -- test-records/decision-workflow/release-evidence.json --design-only` exited 0 after opening and hashing the requirement/oracle sources and four actual evidence references. Normal review without `--design-only` exited 1 with `SUBJECT_UNCOMMITTED`, `ORACLE_UNRESOLVED` and `HUMAN_REVIEW_REQUIRED`, and input digest `f346aa5e3ba7e27f697a1699f06d1151e70915c63e60c6347bbbf9b88a701134`. No missing-artifact or ID-chain findings remained at that check. The tool-assisted browser record has an explicitly assumed one-hour observation lease; it is not a durable or human-approved release receipt.
