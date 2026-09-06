# QA Decision Desk

QA Decision Desk 把 repository、CI、manual check 與 release review 的結果整理成可追溯的發布判斷介面。每個 repo 先回答：現在能不能發、缺什麼、誰要補什麼；歷史決定與證據收在明細，不當成目前核准。

[Live Dashboard](https://sanyoii.github.io/test-status/) · [Test Cases 與執行記錄](https://sanyoii.github.io/test-status/run-records/) · [Fail 與 Log Demo](https://sanyoii.github.io/test-status/run-records/fail-demo/) · [Design Samples](https://sanyoii.github.io/test-status/dashboard-demo/) · [Source](https://github.com/sanyoii/RiskQADemoSite)

## Idea

測試結果常散在 CI logs、人工紀錄、issue、聊天與個人判斷裡。QA Decision Desk 把這些 evidence 接回同一個 release subject，讓讀者先看到 decision，再按需要展開 Gate Flow、Test Case、Run 與 Defect。

Dashboard 是 sanitized、read-only projection。Release Quality Summary 保留人工作出的判斷；Run Record 保存實際執行；Defect／Risk Log 保存 failure 與 disposition；`.test-dashboard/status.json` 負責 machine-readable projection。畫面不建立第二套真相來源。

## 現役流程與驗證入口

完整契約、遷移與減量取捨見 [Decision workflow](docs/decision-workflow.md)。主要實作已統一在此 repository，原 TestDashboard pilot 保留為歷史參考。

- **QA-Lite 三份記錄**：brief/design、append-only run ledger、human-owned decision。九份模板仍是 library。
- **填寫內容可驗證**：Requirement → Risk → Design → Case → Run → Review ID 鏈、oracle source hash、artifact 實檔雜湊、同 subject/environment/config、例外期限與審查 input digest。
- **目前與歷史分開**：`npm test` 驗證軟體與歷史一致性；`npm run gate:release` 驗證目前發布資格。過期 evidence 不靠改日期變綠。
- **Decision replay / change impact**：畫面只回放已記錄的歷史；synthetic 後續步驟停在核准前。CLI `review:release --previous` 輸出保守的 must-run 清單。
- **設計減量**：Samples、AC、ABC 已移到設計演進，舊 URL 保留；首頁不再有 effort bars、固定 Level 2+ 或複製的核准文字。

## Decision flow

```mermaid
flowchart LR
    REQUEST["00 Test Request"] --> RISK["01 Risk Assessment"]
    RISK --> SPEC["02 Test Spec"]
    SPEC --> DESIGN["03 Scenario + 04 Test Case"]
    DESIGN --> RUN["05 Test Run Record"]
    RUN --> DEFECT["06 Defect / Risk"]
    RUN --> SUMMARY["07 Release Quality Summary"]
    DEFECT --> SUMMARY
    SUMMARY --> STATUS["08 status.json"]
    STATUS --> DASHBOARD["QA Decision Desk"]
```

一次 release 的 evidence chain：

1. Test Request 鎖定 repository、release、full SHA、scope 與 decision question。
2. Risk Assessment 為每個 Product Area 設定 target coverage。
3. Test Spec 把風險轉成 automated、manual、exploratory、inspection 或 live checks。
4. Scenario 與 Test Case 定義使用者路徑、失敗路徑、資料與可觀察結果。
5. Run Record 追加保存每次 attempt。Fail、Blocked、retry 與後續 Pass 都留在 chronology。
6. Defect Report 記錄 failure、release impact、修正與 verification。
7. Release Quality Summary 由 QA owner、reviewer 與 decision owner 形成 recommendation。
8. Exporter 驗證 contract、freshness 與 public allowlist，產生 status snapshot。
9. Dashboard 讀取 snapshot；讀者可沿連結回到公開 evidence。

## Dashboard 怎麼讀

| Element | 回答的問題 | 來源 |
|---|---|---|
| Repository | 正在看哪個 release subject？ | repo、release／tag、branch、full SHA |
| Objective | 這次要支持什麼決策？ | Test Request／Test Spec |
| Release Decision | 現在能不能發布？ | human-owned Release Quality Summary |
| Test Effort（明細） | 當時投入多少種測試活動？ | Run inventory＋QA assessment |
| Coverage | 風險區域測到多深？ | Risk Assessment＋Coverage Inventory |
| Quality Assessment | 有哪些 warning、blocker 或 residual risk？ | Defect／Risk Log＋QA assessment |
| Historical Gates（明細） | 原決定當時記錄了什麼？ | G1、G3、G5、G6、Release receipts；不是目前授權 |
| Records | 判斷可否被重建？ | Test Cases、Run IDs、artifacts、public CI links |

Coverage 的 `0`、`1`、`1+`、`2`、`2+`、`3` 是測試深度，不是 code coverage 百分比。`Ready` 代表發布條件已由 decision owner 核准；缺陷、限制與 residual risk 仍要保留 disposition。`Unreachable` 表示最新 snapshot 取得失敗，產品狀態需要重新確認。

## 歷史資料範例（不是目前發布核准）

| Repository | Objective | Decision | Effort | Coverage | Quality | Public evidence |
|---|---|---|---|---|---|---|
| `cex-market-data-quality-lab` | Release Readiness | 歷史 Ready；目前重新檢查 | High | Level 2+ | 歷史 assessment | [Test Cases 與 Run Records](https://sanyoii.github.io/test-status/run-records/) |
| `sanyoii.github.io` | Deployment Confidence | 歷史 Ready；目前重新檢查 | Medium | Level 2+ | 歷史 assessment | [Test-gated Pages run](https://github.com/sanyoii/sanyoii.github.io/actions/runs/32241879480) |

舊 sample 與原始日期仍保留。2026-09-06 已加入限定自動化作品集範圍的 owner-reviewed packets：CEX `fc1e060`（40 deterministic＋5 live），Portfolio `643b017`（22 項本機 Chromium／靜態檢查）。William 自我審查並揭露角色重疊；不是獨立審查或正式產品認證。CEX 核准到期時間為 2026-09-07 20:40、Portfolio 為 2026-09-13 20:40（台灣時間）；目前是否有效仍由 gate 與瀏覽器時間檢查決定，舊 Pass 不會因到期被刪除。

每張非 Ready 卡片顯示一項由實際原因產生的下一步；[六種合成範例](https://sanyoii.github.io/test-status/dashboard-demo/#next-action-examples) 用相同規則示範過期、待核准、無法取得來源、缺少證據與審查、No-Go 與 At Risk，不改動真實狀態。

Fail Demo 使用 synthetic data，示範 Test Case Fail、release blocker、targeted rerun 與 No-Go 的呈現方式；它不屬於目前兩個 repository 的正式結果。

## 核心模板與放置位置

九個模板是 authoring library。實際套用時，把填好的文件複製進目標 repository，讓 evidence 跟著 release version 一起 review。Public README 只提供內容索引與 repo 落點；private QA vault 的本機位置不公開。

| Template | Canonical file | 套用後的 repository 位置 |
|---|---|---|
| [00 QA Test Request](Templates/QA/00-qa-test-request.md) | `Templates/QA/00-qa-test-request.md` | `docs/quality/<release>/quality-decision-brief.md` |
| [01 Quality Risk Assessment](Templates/QA/01-quality-risk-assessment.md) | `Templates/QA/01-quality-risk-assessment.md` | `docs/quality/<release>/risk-assessment.md` |
| [02 Test Spec](Templates/QA/02-test-spec.md) | `Templates/QA/02-test-spec.md` | `docs/quality/<release>/test-spec.md` |
| [03 Test Scenario](Templates/QA/03-test-scenario.md) | `Templates/QA/03-test-scenario.md` | `docs/quality/<release>/coverage-inventory.md` |
| [04 Test Case](Templates/QA/04-test-case.md) | `Templates/QA/04-test-case.md` | `docs/quality/<release>/test-cases.md` |
| [05 Test Run Record](Templates/QA/05-test-run-record.md) | `Templates/QA/05-test-run-record.md` | `test-records/<run-id>/run-record.md` |
| [06 Defect Report](Templates/QA/06-defect-report.md) | `Templates/QA/06-defect-report.md` | `docs/quality/<release>/defect-log.md` |
| [07 Release Quality Summary](Templates/QA/07-release-quality-summary.md) | `Templates/QA/07-release-quality-summary.md` | `docs/quality/<release>/release-quality-summary.md` |
| [08 Dashboard Status Contract](Templates/QA/08-dashboard-status-contract.md) | `Templates/QA/08-dashboard-status-contract.md` | `.test-dashboard/status.json` |

九份模板不等於每次 release 都要產生九份文件。`QA-Lite` 可以把 request、risk、coverage 與 decision 收在同一份短文件；Test Run Record 與 Release Quality Summary 每次執行都要保留。`QA-Standard`、`QA-High-Risk` 與命中 hard trigger 的範圍，再加入詳細 case 或 conditional templates。

### 00 QA Test Request

鎖定 requester、release subject、business objective、scope、known risks、限制與要支持的 release question。資訊不足時維持 `needs-information`。

### 01 Quality Risk Assessment

逐一列出 Product Area、failure mode、impact、uncertainty、recoverability、existing controls、target coverage、residual risk 與 owner。Unknown 不會被默認成 Low。

### 02 Test Spec

定義 tested scope、test types、entry／suspension／exit criteria、環境、test data、execution method、artifact、retention、review 與 limitations。

### 03 Test Scenario

以使用者或業務路徑描述 start state、trigger、happy／negative paths、expected outcome 與 risk traceability，不塞入 click-by-click steps。

### 04 Test Case

保存 preconditions、concrete data、連續步驟、observable expected result、cleanup、variants、actual result、Run ID、Defect ID 與 evidence links。

### 05 Test Run Record

Append-only 保存 full SHA、worktree、environment、exact command／procedure、每次 attempt、exit code、case results、artifact hash、retention 與 final run state。

### 06 Defect Report

把 failure 接到 requirement、risk、scenario、case 與 run；清楚區分 suspected cause、confirmed cause、Fixed 與 Verified。

### 07 Release Quality Summary

整理 coverage target／actual、run inventory、open defects、accepted risks、waivers、limitations 與 recommendation，再由 decision owner記錄 Go、No-Go 或 Hold。

### 08 Dashboard Status Contract

約束 `.test-dashboard/status.json` 的 versions、subject、assessment、timestamps、Data Status、evidence links 與 public disclosure。Schema invalid、evidence stale 或 authority 不符時 fail closed。

## QA Playbooks

[QA Playbooks](Playbooks/QA/README.md) 是輸入資料與九個核心模板之間的 advisory layer。它們把 requirement、API contract、diff、test inventory 或 defect 整理成 reviewable draft，不直接產生 test result、release decision 或 Dashboard status。

| Playbook | 用途 | Reviewed output 落點 |
|---|---|---|
| [Requirement Readiness](Playbooks/QA/requirement-readiness.md) | 找 requirement／AC 缺口與矛盾 | 00、01 |
| [Coverage Analysis](Playbooks/QA/coverage-analysis.md) | 建立 requirement-to-run traceability | 03 套用後的 `coverage-inventory.md`；07 只引用摘要 |
| [Regression Selection](Playbooks/QA/regression-selection.md) | 形成 Must-run／Should-run／Skip-with-reason 建議 | 02、05 |
| [Test Data Design](Playbooks/QA/test-data-design.md) | 設計安全的 valid／invalid／boundary／synthetic data | conditional Test Data Sheet、04 |
| [API Coverage Design](Playbooks/QA/api-coverage-design.md) | 依 contract 設計 API coverage | 02、03、04 |
| [Defect Triage](Playbooks/QA/defect-triage.md) | 批次提出 duplicate／priority／owner recommendation | 多份 06 的 triage note |
| [RCA／Escape Analysis](Playbooks/QA/rca-escape-analysis.md) | 分離 symptom、hypothesis、confirmed cause 與 escape point | 06 appendix／RCA evidence |

Playbook output 一律先標 draft／recommendation。External input 視為 untrusted data；沒有 run receipt 不能宣告 Pass，沒有 human-owned Release Quality Summary 不能宣告 Ready。Deterministic fixtures 只驗 contract，不等於 model behavior PASS；pilot 記錄見 [test-records/playbook-pilot.md](test-records/playbook-pilot.md)。

## Source of truth and public boundary

| Layer | 保存內容 | 規則 |
|---|---|---|
| QA template library | 可重用的空白模板 | 只定義欄位與流程，不代表已執行 |
| Repository evidence | release-specific docs、run records、machine results、artifacts | 綁定 full SHA、environment、scope 與 chronology |
| Status contract | approved assessment 的 machine-readable projection | validator 不猜缺值；failure 保留 last-known-good 並標示 Stale／Invalid／Unreachable |
| Public Dashboard | 支持決策所需的 sanitized snapshot | 只顯示 allowlist fields 與可公開 links |

Public surface 不包含 raw logs、protected receipts、credentials、test accounts、PII、local paths、private URLs、敏感 test data 或未消毒的 defect details。

## Repository map

- [正式 Dashboard](app/page.tsx)
- [九個核心 QA 模板](Templates/QA/README.md)
- [Status contract schema](schema/test-status.schema.json)
- [Approved source records](data/approved)
- [Public snapshot registry](data/repos/index.json)
- [Repository data adapter](app/dashboard-data.ts)
- [Current decision / historical evidence UI](app/_dashboard.tsx)
- [Shared decision policy](lib/decision-policy.mjs)
- [Filled release evidence validator](lib/release-evidence.mjs)
- [Test Cases 與 Run Records](app/run-records/page.tsx)
- [Synthetic Fail Demo](app/run-records/fail-demo/page.tsx)
- [Contract、sync 與 registry tests](tests/status-contract.test.mjs)
- [Rendered route tests](tests/rendered-html.test.mjs)
- [Continuity handoff](handoff/2026-08-18-repo-based-low-tech-testing-dashboard.md)

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm ci
npm run dev
npm test
npm run lint
```

`npm test` 驗證 archive registry、contract、chronology、public disclosure boundary、playbooks，再 build 並檢查所有 routes。它不宣告目前的 evidence freshness 或發布核准。

`npm run verify:workflow` 另外記錄 lint、typecheck、Pages build/export 與 release gate；每次執行輸出新的實際 logs、SHA-256 和 source/worktree digest。Raw artifacts 留在忽略的本機資料夾，不打包進公開 UI。`release-gate` 結果獨立保存，軟體 Pass 不掩蓋產品 release Fail。

Pages export 要指定新的 output directory；不再自動遞迴刪除既有目錄。Cloudflare/Sites 仍支援目前本機 preview 與 rendered-test runtime，沒有新增 production dependency，也沒有修改 hosted deployment 設定。
