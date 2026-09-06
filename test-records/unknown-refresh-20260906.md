# Unknown remediation · 2026-09-06

Status: execution evidence refreshed; release review pending. No Go, authority configuration, public snapshot replacement, commit, push or deployment is recorded by this document.

## Subject and scope

Read-only `git status --short` was clean before and after each product suite. Remote main was checked with `git -c http.sslBackend=openssl ls-remote origin refs/heads/main` after testing and matched the tested HEAD:

| Product | Full subject SHA | Verified scope |
|---|---|---|
| CEX market-data lab | `fc1e0604f96206e1f9dbbc58308031b5ff2f4c4f` | Existing unit, REST/WebSocket contract, documentation and public-market-data live suites |
| Portfolio | `643b01720959dad2b1ccc9c8fcbe4f493f89bf0b` | Existing static and locally served Chromium suite in the clean release worktree |

Environment: Windows, Python 3.14.2, pytest 9.1.1. CEX uses its existing virtual environment; Portfolio uses the existing Web3 virtual environment. No dependencies or product source files were changed. The original dirty Web3 checkout was not used as the test subject.

## Append-only execution record

Raw JUnit files are local, ignored artifacts under `work/unknown-refresh-20260906/`; they are not public evidence URLs. Times below are Taiwan time from JUnit suite headers.

| Attempt | Started | Result | Exit | Artifact |
|---|---|---|---|---|
| CEX deterministic | 20:40:01 | 40 passed | 0 | `cex-deterministic.xml` |
| Portfolio initial | 20:40:03 | 9 passed, 13 setup errors; browser execution Blocked by `BrowserType.launch: spawn EPERM` | 1 | `portfolio.xml` |
| CEX live | 20:40:18 | 5 passed in 18.34s | 0 | `cex-live.xml` |
| Portfolio retry | 20:40:54 | 22 passed in 10.74s after elevated execution; retains initial attempt | 0 | `portfolio-retry.xml` |

Commands (run from each product's root; `{artifact-root}` is the local Dashboard `work/unknown-refresh-20260906` directory):

```text
# CEX, using its .venv/Scripts/python.exe
python -m pytest tests/unit tests/contract tests/meta -v -p no:cacheprovider --junitxml={artifact-root}/cex-deterministic.xml
python -m pytest tests/live -v -m live -p no:cacheprovider --junitxml={artifact-root}/cex-live.xml
# Portfolio release worktree, using the existing Web3 .venv/Scripts/python.exe
python -m pytest tests -v -p no:cacheprovider --junitxml={artifact-root}/portfolio.xml
python -m pytest tests -v -p no:cacheprovider --junitxml={artifact-root}/portfolio-retry.xml
```

SHA-256:

```text
b836c589694947da419047afc22539819568ec1df7aa9ec423b888623420253e  cex-deterministic.xml
4530c5f35881149d0075137960bd0fc62854f1a46c133c952a862f198f02c50c  cex-live.xml
0eacce992cc5313ba590fc34724c9cf83c5c3d89c6ef72eef658214348c430a0  portfolio.xml
7df49109c2efdd1cb32d7bb86ac2726ba9bd8463cc68a018fc52f229b504d1e1  portfolio-retry.xml
```

The first remote-SHA query using default Schannel failed with `SEC_E_NO_CREDENTIALS` (exit 128). Retrying with a command-scoped OpenSSL backend succeeded (exit 0); TLS validation was not disabled and no Git configuration was persisted.

## Remaining decision boundary

The registry still has only historical snapshots and no `releaseEvidence` / `authority` references. It therefore reports `DATA_NOT_FRESH` and `RELEASE_EVIDENCE_REQUIRED`. New local passing tests alone do not replace the original decision, assign a reviewer, approve oracle sources or create public evidence links.

Required before activating Ready:

1. Designate the decision owner and reviewer in separately controlled authority configuration. Explicitly disclose overlap if the same person holds both roles; do not claim independent review.
2. Confirm the scoped acceptance sources and limitations, then assemble and review the versioned requirement/risk/design/case/run packet for the exact SHAs above. Proposed sources: CEX `docs/requirements.md`, `docs/test-cases.md` and `docs/test-governance.md`; Portfolio `TESTPLAN.md` and existing tests. Existing documents do not establish a new approval by themselves.
3. CEX manual lifecycle remains designed/not executed; the live suite does not replace human testing. Portfolio checks are local Chromium, not a fresh production deployment or cross-browser certification. Broader scope requires additional evidence, not an implicit waiver.
4. Record the actual owner's decision, evidence input digest and approved validity period; refresh live/runtime evidence as necessary at that point. No expiry has been invented or extended here.
5. Preserve the old snapshots and failed attempts; activate new sanitized snapshots only after packet/authority/artifact checks pass. Public evidence publication and commit/push/deploy need separate authorization.

## Dashboard presentation

For stale evidence plus missing release review, cards now show two bilingual tags: `Evidence not updated` / `證據未更新`, and `Approval pending` / `核准待完成`. This distinguishes data freshness from approval, while the policy-derived verdict remains unchanged. Source snapshot facts are untouched.

Rendered regression assertions failed before the change (exit 1), confirming the old card lacked the requested tags. Detailed owner actions remain inside expanded evidence. Showing a concise next action directly on non-Ready cards was discussed subsequently; it is a recommendation, not implemented in this change.

Fresh Dashboard verification: `npm run verify:workflow` exit 0; receipt `decision-workflow/artifacts/2026-09-06T12-42-34-656Z/receipt.json`. 42 contract + 12 Playbook + 11 rendered tests passed, 14 fixtures valid, lint/types/Pages build/export passed. The separately reported product gate remains Fail (`DATA_NOT_FRESH:dataStatus`, exit 1). Real Chrome accessibility snapshots verified both tags in English and Chinese at the new loopback preview `http://127.0.0.1:4181/test-status/`. No fresh mobile layout claim is made.

Single-person review clarification: policy 2.0.0 already permits the same person as reviewer and decision owner when `roleOverlapDisclosed` is true and the separate authority configuration permits both roles. A second person is not inherently required. The user asked whether this step could be skipped because they work alone; self-review was recommended, without fabricating a new Go, changing authority configuration or treating that question as approval of a scoped release packet.

## Owner-approved activation · subsequent explicit acceptance

The user subsequently accepted the exact scoped acceptance, exclusions, validity periods and William self-review arrangement. New packets and sanitized snapshots were created; old snapshots under `data/approved/` and the former `data/repos/sanyoii--*.json` were left unchanged. This is a new decision, not renewal of old test timestamps.

- CEX `fc1e0604f96206e1f9dbbc58308031b5ff2f4c4f`: existing 40 deterministic + 5 live results; expiry `2026-09-07T20:40:00+08:00`.
- Portfolio `643b01720959dad2b1ccc9c8fcbe4f493f89bf0b`: existing 22 passing results; expiry `2026-09-13T20:40:00+08:00`. The initial 9 Pass / 13 Blocked setup results remain an earlier linked attempt.
- Packets, versioned source copies, actual per-test sanitized JUnit projections and owner receipts: `releases/2026-09-06/{cex,portfolio}/`. Raw JUnit stays ignored; hashes match the earlier recorded originals. Packet configuration/source hashes bind the checked clean committed subjects. Artifact paths are not exposed as pretend public downloads.
- Separate authorized roles: `data/authority/`; active registry: `data/repos/index.json`; public run projection: `data/release-records.json`. No decision-policy or release-validator rules were weakened.
- New Run Records section exposes all four actual attempts, scope, exclusions, owner self-review, expiry, commands and per-test outcomes. Historical August runs are now explicitly historical, not current approval.
- `lib/decision-actions.mjs` supplies cause-based bilingual next actions without mutating status. Six clearly synthetic examples are shown under `/dashboard-demo/#next-action-examples`: expired, pending approval, unreachable, stale plus pending review, No-Go and At Risk. Ready has no remediation prompt.

Verification: `npm run verify:workflow` receipt `decision-workflow/artifacts/2026-09-06T12-56-42-061Z/receipt.json`: 44 contract + 12 Playbook + 12 rendered tests (68 total), 14 fixtures, lint, types, Pages build/export and product release gate all passed (exit 0). The old rendered assertion requiring missing approval initially failed after approval became available; it now verifies no-clock fail-closed rendering without assuming historical production data. Explicit packet tests use the recorded approval time and expiry boundary, including historical Ready retention after expiry.

Real Chrome at `http://127.0.0.1:4182/test-status/`: Ready 2 / other counts 0 in EN and ZH, both updated SHAs and expiry times visible, zero remediation prompts for Ready. The six synthetic guidance examples switched EN/ZH correctly. Expanded initial Portfolio attempt displayed 22 rows and retained Blocked outcomes. Homepage, examples and expanded record had no horizontal overflow at 1629 px. Mobile and other browsers were not newly verified in this activation turn. Page initialization can briefly show English/server-side Unknown before saved language and browser clock apply; no instantaneous-hydration guarantee is claimed.

Packaging initially stopped at a cross-workspace Git ownership warning. It succeeded with per-command `safe.directory` for the two exact product roots; no global config or ACL change. Local source/registry activation is complete, but no commit, push, deployment or automated renewal was performed. The user was told expiry limits the reuse of a release decision, not the validity of historical Pass; 24 hours / 7 days are the explicitly accepted one-time values, not an industry requirement.
