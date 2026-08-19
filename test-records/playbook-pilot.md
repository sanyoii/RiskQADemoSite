# QA Playbook pilot record

## Decision scope

驗證 QA Playbook advisory layer 的 deterministic contract、security boundary、documentation mapping 與一筆 Requirement Readiness behavior run。這不是產品 release assessment，不修改 `.test-dashboard/status.json`。

## Subject

| Field | Value |
|---|---|
| Repository | `sanyoii/RiskQADemoSite` |
| Branch | `main` |
| Candidate base full SHA | `bdb8cd40ddf49a76e8e1cb4cda0a54e5985041b8` |
| Worktree state | `dirty` — 僅本次 scoped Playbook implementation |
| OS／runtime | Windows；Node.js `v24.19.0`；npm `11.17.0` |
| Pilot date | 2026-08-19 |
| External systems | 未連接 Jira／tracker；本 pilot 無 external write |

## Implemented scope

- P0：Playbook contract、router、security rules、fixture schema 與 validator。
- P1：Requirement Readiness、Coverage Analysis、Regression Selection。
- P2：Test Data Design、API Coverage Design、Defect Triage、RCA／Escape Analysis。
- P3：prompt injection、routing collision、no-external-write fixtures，以及一筆 Codex desktop／GPT-5 behavior run。
- P4：README 與 core template index mapping。

九個 canonical templates、`lib/status-contract.mjs` 與 schema 未修改。

## Evidence states

| Evidence | State | Meaning |
|---|---|---|
| 14 static fixtures | `DEFINED_UNRUN`＋deterministic PASS | Schema／required phrase／forbidden claim checks 通過；沒有執行模型 |
| Node contract tests | Pass | Public CLI、Playbook docs、routing／security 與 npm cascade checks |
| Requirement Readiness behavior run | `needs-review` | Host/model run 已保存，但為 single-agent self-evaluation |
| Independent model comparison | `Not verified` | 未執行，不以 static fixtures 取代 |
| Production Jira／OpenAPI pilot | `Not verified` | 不在本次 scope |

## Behavior receipt

- [Input](playbooks/2026-08-19-requirement-readiness/input.md)
- [Candidate output](playbooks/2026-08-19-requirement-readiness/candidate-output.md)
- [Machine-checkable receipt](playbooks/2026-08-19-requirement-readiness/behavior-fixture.json)
- [Run record and hashes](playbooks/2026-08-19-requirement-readiness/run-record.md)

Host 是 Codex desktop，model 是 runtime-provided GPT-5 family；exact deployment ID unavailable。Evaluator verdict 保持 `needs-review`，沒有宣稱 production certification。

## Command evidence

| Command | Current result |
|---|---|
| `npm run test:playbooks` | Exit 0；12 tests passed；14 fixtures valid |
| `npm test` | Exit 0；21 contract tests、12 Playbook tests、7 rendered tests 全數通過；14 fixtures valid |
| `npm run lint` | Exit 0 |
| `node tests/playbooks/validate-fixture.mjs test-records/playbooks/2026-08-19-requirement-readiness/behavior-fixture.json` | Exit 0；1 behavior fixture valid |

以上結果是 2026-08-19 implementation candidate 的 pre-publication evidence；發布前仍要重新執行 full verification、public disclosure scan 與 Pages export／route smoke。

## Decision

Deterministic contract phase 可進入 release verification。Behavior quality 仍需獨立 reviewer／model comparison 才能從 `needs-review` 升級；這不阻擋將 Playbooks 作為明確標示的 advisory documentation 發布，但不得宣稱它們已通過 production behavior certification。
