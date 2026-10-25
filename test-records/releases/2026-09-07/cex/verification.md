# CEX scoped renewal · 2026-09-07

- User authorized unchanged acceptance scope, fresh reruns, and expiry **2026-09-08 23:59 Asia/Taipei** (`2026-09-08T23:59:00+08:00`).
- Subject: `fc1e0604f96206e1f9dbbc58308031b5ff2f4c4f`; local HEAD and GitHub main matched before execution. CEX checkout was clean before and after tests.
- Environment: Windows, Python 3.14.2, pytest 9.1.1; existing CEX `.venv`; public Binance REST/WebSocket market data only. Dashboard validation used the existing Node/npm dependencies.
- Scope: unit and REST/WebSocket contract checks, documentation consistency, public market-data live integration. Exclusions and same-person self-review remain as recorded in [owner approval](owner-approval.md).

## Fresh execution

Commands ran in the CEX checkout:

```text
python -m pytest tests/unit tests/contract tests/meta -q
python -m pytest tests/live -q -m live
```

| Check | Actual result | Artifact |
|---|---|---|
| Unit, contract, documentation | Pass; 40 passed in 0.83s; exit 0 | [JUnit](raw/deterministic.xml), [run](artifacts/RUN-20260907-cex-deterministic-1.json) |
| Public market-data live integration | Pass; 5 passed in 23.94s; exit 0 | [JUnit](raw/live.xml), [run](artifacts/RUN-20260907-cex-live-1.json) |

## Dashboard validation

Commands ran in this repository:

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
- Existing Portfolio approval was not renewed. No CEX source code changed.
