# QA 核心模板

這九份檔案是 QA Decision Desk 的 canonical authoring library。套用到 release 時，把填好的文件複製進該 repository，跟著 release version review；不要直接引用這裡的檔案，避免歷史 evidence 隨模板更新。

## Decision flow

```mermaid
flowchart LR
    REQUEST["00 Test Request"] --> RISK["01 Risk Assessment"]
    RISK --> SPEC["02 Test Spec + Design Decision"]
    SPEC --> SCENARIO["03 Scenario"]
    SCENARIO --> CASE["04 Test Case"]
    CASE --> RUN["05 Run Record"]
    RUN --> DEFECT["06 Defect Report"]
    RUN --> SUMMARY["07 Release Summary"]
    DEFECT --> SUMMARY
    SUMMARY --> STATUS["08 Dashboard Status"]
```

## Template index

| Canonical Markdown | English example | 繁體中文示例 | Suggested repository copy |
|---|---|---|---|
| [00 QA Test Request](00-qa-test-request.md) | [English](../../public/qa-templates/qa-test-request.en.html) | [繁體中文](../../public/qa-templates/qa-test-request.html) | `docs/quality/<release>/quality-decision-brief.md` |
| [01 Quality Risk Assessment](01-quality-risk-assessment.md) | [English](../../public/qa-templates/quality-risk-assessment.en.html) | [繁體中文](../../public/qa-templates/quality-risk-assessment.html) | `docs/quality/<release>/risk-assessment.md` |
| [02 Test Spec](02-test-spec.md) | [English](../../public/qa-templates/test-spec-template.en.html) | [繁體中文](../../public/qa-templates/test-spec-template.html) | `docs/quality/<release>/test-spec.md` |
| [03 Test Scenario](03-test-scenario.md) | [English](../../public/qa-templates/test-scenario-template.en.html) | [繁體中文](../../public/qa-templates/test-scenario-template.html) | `docs/quality/<release>/coverage-inventory.md` |
| [04 Test Case](04-test-case.md) | [English](../../public/qa-templates/test-case-template.en.html) | [繁體中文](../../public/qa-templates/test-case-template.html) | `docs/quality/<release>/test-cases.md` |
| [05 Test Run Record](05-test-run-record.md) | [English](../../public/qa-templates/run-log.en.html) | [繁體中文](../../public/qa-templates/run-log.html) | `test-records/<run-id>/run-record.md` |
| [06 Defect Report](06-defect-report.md) | [English](../../public/qa-templates/bug-report-template.en.html) | [繁體中文](../../public/qa-templates/bug-report-template.html) | `docs/quality/<release>/defect-log.md` |
| [07 Release Quality Summary](07-release-quality-summary.md) | [English](../../public/qa-templates/quality-report.en.html) | [繁體中文](../../public/qa-templates/quality-report.html) | `docs/quality/<release>/release-quality-summary.md` |
| [08 Dashboard Status Contract](08-dashboard-status-contract.md) | [English](../../public/qa-templates/dashboard-status-contract.en.html) | [繁體中文](../../public/qa-templates/dashboard-status-contract.html) | `.test-dashboard/status.json` |

九份模板是 library，不代表每次 release 都要建立九份文件。依 `QA-Lite`、`QA-Standard`、`QA-High-Risk` 與 conditional triggers 決定所需組合；Test Run Record 與 Release Quality Summary 每次 release 都不能省略。

Test Design Decision 直接放在 02 Test Spec，**不新增第十個核心模板**。它保存這條可審查鏈：

```text
Risk → Failure mode → Method → Oracle → Execution evidence → Decision
```

選擇 Method 時同時考慮 risk、規格特徵與 observability／environment constraint。Expected result 優先引用 approved requirement、business rule、API／schema contract 或 reviewed domain decision；只有 current behavior 時標為 characterization evidence，無核准來源時誠實標 `Assumption`，來源衝突或需求未定義時標 `Unknown／needs-clarification`。

## Playbook advisory layer

### 填好之後怎麼驗證

QA-Lite 只維護三份 release-specific 記錄：**brief/design、run ledger、decision**。Requirement、Risk、Design、Case 使用穩定 ID；machine packet 引用這三份，不新增另一套審批真相。

依 [執行契約](../../docs/decision-workflow.md) 填入 `release-evidence.json`，執行 `npm run review:release -- <packet> --design-only` 檢查設計；實際測試 artifact 與人工 review 齊全後，才執行不含 `--design-only` 的 review 和 `npm run gate:release`。Template heading test 只驗模板，不能代替 filled-packet review。

未解決的必要 oracle、缺少 required case、過期 live/manual run、artifact 雜湊不符與已改變的審查 input 都不得變成 Ready。後續 Pass 追加到台帳；使用 `--previous` 核對不能被刪改的先前 attempts/events。

[`Playbooks/QA`](../../Playbooks/QA/README.md) 提供 requirement readiness、coverage analysis、regression selection、test data、API coverage、defect triage 與 RCA 的 reviewable workflow。Playbook 不是第十個核心模板，也不是 evidence source；reviewed findings 仍要落回上表的 release-specific artifacts。

Coverage Analysis 沿用 03 Test Scenario contract，把完整 Requirement／AC → Scenario → Case → Run matrix 寫到 `docs/quality/<release>/coverage-inventory.md`。07 Release Quality Summary 只保留 target vs actual、重要 gaps、residual risk 與 inventory link，不複製完整矩陣。

## Shared rules

- 所有 evidence 都要綁定 repository、release、branch、full SHA、environment、scope、owner 與 timestamps。
- `Fail`、`Blocked`、retry 與後續 `Pass` 全部保留，不能覆寫 chronology。
- Product Test Status 和 Data Status 分開判定。
- `Ready` 需要 human-owned release assessment；測試全綠不會自動產生 Ready。
- 公開前執行 allowlist projection、secret／PII scan、link review 與 post-publish smoke。


## 中英文 HTML 範本與合成示例

[繁體中文入口](../../public/qa-templates/index.html)／[English entry](../../public/qa-templates/index.en.html)。每種語言都是入口加九份文件，共 20 頁；00～08 與上表一一對應，每份都有空白欄位、Order Book 合成示例及對應語言連結。網站導覽依目前語言開啟閱讀版；Pages 路徑保留 `/test-status/qa-templates/`。檔案可獨立閱讀與列印，沒有編輯、儲存、實測證據或核准功能。

The HTML library provides a complete English and Traditional Chinese reading version of all nine documents, with blank fields and the same synthetic Order Book example. Markdown remains canonical for authoring. Applied release records retain their versions; HTML is not another ledger or approval system. QA-Lite retains brief/design, run ledger and decision as three records.

空白範本與方法源自測試公司 2026-10-25 的範本；v1.2 改用本站 Order Book，v1.3 補齊申請、風險、公開狀態契約與完整雙語內容。原公司檔案及歷史 Run 不改寫。九份 Markdown v0.3.0 保留版本與資料契約、readiness／授權、三項退出條件、四面向摘要及分歧／AI 誤判恢復；適用欄位填寫，不適用寫原因。維護方式見 [產生器說明](samples/README.md)。
