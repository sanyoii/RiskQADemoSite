# CEX scoped renewal · 2026-09-07

- User authorized unchanged acceptance scope, fresh reruns, and expiry **2026-09-08 23:59 Asia/Taipei** (`2026-09-08T23:59:00+08:00`).
- Subject: `fc1e0604f96206e1f9dbbc58308031b5ff2f4c4f`; local HEAD and GitHub main matched before execution. CEX checkout was clean before and after tests.
- Environment: Windows, Python 3.14.2, pytest 9.1.1; existing CEX `.venv`; public Binance REST/WebSocket market data only. Dashboard validation used the existing Node/npm dependencies.
- Scope: unit and REST/WebSocket contract checks, documentation consistency, public market-data live integration. Exclusions and same-person self-review remain as recorded in [owner approval](owner-approval.md).

## Fresh execution

Commands ran from `D:/Codex/Web3/cex-market-data-quality-lab`:

```text
.venv/Scripts/python.exe -m pytest tests/unit tests/contract tests/meta -v -p no:cacheprovider --junitxml=D:/Codex/RiskQADemoSite/test-records/releases/2026-09-07/cex/raw/deterministic.xml
.venv/Scripts/python.exe -m pytest tests/live -v -m live -p no:cacheprovider --junitxml=D:/Codex/RiskQADemoSite/test-records/releases/2026-09-07/cex/raw/live.xml
```

| Check | Actual result | Artifact |
|---|---|---|
| Unit, contract, documentation | Pass; 40 passed in 0.83s; exit 0 | [JUnit](raw/deterministic.xml), [run](artifacts/RUN-20260907-cex-deterministic-1.json) |
| Public market-data live integration | Pass; 5 passed in 23.94s; exit 0 | [JUnit](raw/live.xml), [run](artifacts/RUN-20260907-cex-live-1.json) |

## Dashboard validation

Commands ran from `D:/Codex/RiskQADemoSite`:

- `node work/renew-cex-20260907.mjs`: exit 0; packaged fresh executions and recorded the user's conditional renewal after both suites passed.
- `node scripts/prepare-decision-data.mjs`: exit 0; regenerated the browser data using the new CEX packet.
- `npm test`: exit 0; 44 contract tests, 12 Playbook tests, 14 fixture validations, build, and 12 rendered HTML tests passed (68 tests total).
- `node scripts/validate-registry.mjs data/repos/index.json --release`: exit 0; both registry entries valid. Current CEX decision: `ready`, `fresh`, no blocking codes.
- One-off Node assertions: exit 0; raw JUnit SHA-256 values match new run artifacts; prior public CEX runs and the Portfolio public record remain byte-equivalent after JSON parsing; current CEX decision is Ready and becomes Unknown at the exact expiry boundary.
- `git diff --check`: exit 0. September 6 snapshot and release packet remain unchanged; the new packet retains their runs and events, and `previousReleaseEvidence` enforces append-only history.

## Limits and delivery state

- Initial Git reads were Blocked by repository ownership under both sandbox and user identities. Command-scoped `safe.directory` allowed read-only checks; no global Git configuration or ownership change was made.
- The preceding diagnosis returned `EVIDENCE_STALE:releaseAssessment.expiresAt` for the old packet. This remains valid historical evidence; its dates were not rewritten.
- No fresh human/manual, independent review, production trading-system, load, or production reconnect verification is claimed.
- Browser interaction and production read-back: Skipped in this renewal; no deployment was authorized. The preceding turn's HTTP/TLS failures are not evidence of a successful online check.
- At initial renewal completion, changes were local and uncommitted; production could continue to show Unknown until publication.
- Existing Portfolio approval was not renewed. No CEX source code changed. HUB was updated to distinguish local renewal from the existing online release.

## Authorized publication preflight

- User subsequently authorized: `commit, push and deploy.`
- `npm run verify:workflow` completed with exit 0: software (68 tests and 14 fixtures), lint, types, Pages build, Pages export, and release gate all Pass. Local receipt: `test-records/decision-workflow/artifacts/2026-09-07T15-18-18-385Z/receipt.json`.
- Chrome read-back before publication confirmed CEX Unknown with the old expiry 2026-09-07 20:40 +08:00; Portfolio remained Ready. Publication follows the existing Portfolio `Test and deploy Pages` workflow, which checks out Dashboard `main`.
