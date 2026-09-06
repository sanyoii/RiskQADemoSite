# Decision workflow consolidation

Approved scope: 2026-09-06 user request to implement the architecture, workflow, presentation and reduction recommendations. Local implementation only; no commit, push, deployment or refreshed human approval is implied.

## Architecture and ownership

One writer. Preserve the pre-existing template/pilot changes and `app/run-records/cases.ts` English edits. Reuse React/Vinext, JSON and Node; no new production dependency or database. RiskQADemoSite becomes the maintained implementation; the original TestDashboard is preserved as a historical pilot, with a migration map rather than deleted evidence.

1. `lib/decision-policy.mjs`, `lib/status-contract.mjs`, schema/fixtures/tests: shared semantic rules, safe evidence links, temporal consistency, required gates, archived versus current assessments; focused adversarial checks.
2. `lib/release-evidence.mjs`, `scripts/review-release.mjs`, release packet and tests: real ID relationships, immutable attempts, review subject/digest binding, scoped assumptions/waivers, typed evidence freshness, conservative change impact. Human authorship is recorded, not inferred or cryptographically certified.
3. `scripts/sync-status.mjs`, registry validator and package scripts: immutable content-addressed snapshots, atomic activation, retained previous result and failure receipt; separate software checks from current evidence gate. Never move historical expiry forward to obtain a green build.
4. `app/dashboard-data.ts`, shared dashboard/replay components, routes, CSS and browser checks: data-driven reasons/owners/actions and coverage; timed current-state reevaluation; historical decision replay and explicitly synthetic exploration. Move Design Samples out of primary navigation; keep old URLs usable.
5. README/templates/migration notes: QA-Lite authoring, one source for results, receipt provenance, legacy retirement guidance. Cloudflare/Sites dependencies are conditional candidates: remove only after proving local preview/rendered checks do not require them; otherwise document the concrete retained dependency.

## Verification and acceptance

- `node --test tests/decision-policy.test.mjs tests/release-evidence.test.mjs`: reject contradictory Ready, unresolved required cases, changed review input, reordered/removed attempts, invalid evidence links and unsafe waiver acceptance.
- `npm test`: deterministic software tests, archival data validation, build and rendered routes all pass regardless of the wall-clock age of historical samples.
- `npm run gate:release`: current evidence remains nonzero for expired/legacy unreviewed releases; no approval fabricated.
- `npm run lint`; production Pages export; visible-browser EN/ZH, reload, keyboard, replay, route compatibility and narrow viewport checks.
- Test records identify actual commands/results and remaining human checks. No claim of independent QA, real defect-prevention impact or SLSA certification.

## Recovery

Local scoped diffs remain reviewable. Preserve old pilot files, all failed/blocked chronology and old route URLs. New snapshot activation never deletes previous immutable content. No force-push, reset, broad staging or destructive cleanup. Publishing remains a separate explicit action.
