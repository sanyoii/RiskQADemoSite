# Coverage Analysis

## Decision question

哪些 Requirement／AC 已有 Scenario、Case 與實際 Run evidence？哪些只有設計、尚未執行、執行失敗或完全沒有 coverage？

## Trigger

已有 requirements／AC、test inventory 或 run records，需要建立 traceability、找 gaps 或解釋 target 與 actual coverage。只有單一 ticket 且內容未釐清時，先用 Requirement Readiness。

## Source hierarchy

1. Requirement／AC 與 approved change scope。
2. 03 Test Scenario 套用後的 release-specific coverage inventory。
3. 04 Test Case。
4. 05 Test Run Record 與 artifact。
5. 06 Defect／blocked disposition。

缺少任何一層時保留 `Unknown`；不能從檔名、測試名稱或 pass rate 猜 mapping。

## Coverage states

| State | Meaning |
|---|---|
| `unmapped` | Requirement／AC 沒有可指認的 Scenario 或 Case |
| `designed-not-run` | 已有 Scenario／Case，但沒有 matching Run evidence |
| `covered` | 有明確 test mapping；這只代表 designed coverage，不代表通過 |
| `executed-failing` | Matching Run 為 Fail／Blocked；保留 defect／blocker |
| `covered-and-passing` | Matching Run 在同一 release、full SHA、environment 與 scope 下通過 |
| `Unknown` | Subject、mapping、freshness 或 evidence 無法判定 |

`covered` 和 `covered-and-passing` 必須分開。舊 Pass 不會覆蓋後續 Fail，後續 Pass 也不能刪除首次 Fail chronology。

## Matrix

完整矩陣寫入 03 Test Scenario 套用後的：

`docs/quality/<release>/coverage-inventory.md`

```markdown
| Requirement / AC | Risk | Scenario | Case | Run | Run status | Coverage state | Gap / action | Evidence |
|---|---|---|---|---|---|---|---|---|
```

每列至少回答 Requirement → Scenario → Case → Run。Orphan test 另列，不能把找不到 requirement 的 test 偷算進 coverage。

## Gap ranking

先按 risk 與 release impact 排序，再看 gap 數量：

1. High-risk `unmapped` 或 `Unknown`。
2. High-risk `executed-failing`／Blocked。
3. 只有 happy path、缺 negative／boundary／role／failure mode 的 thin coverage。
4. `designed-not-run`。
5. Orphan／duplicate tests。

## Output boundary

07 Release Quality Summary 只保存 target vs actual、重要 gaps、residual risk 與 inventory link；不複製完整矩陣，不建立第二套 test database。Playbook 只產生 draft，review 後才更新 release-specific inventory。

```markdown
Playbook: Coverage Analysis
Review state: draft
State: draft / needs-clarification
Subject and scope: <repo/release/full SHA/environment>
Input sources: <requirements, cases, runs>
Coverage summary: <counts by state>
Risk-ranked gaps:
Orphan tests:
Unknowns and assumptions:
Evidence target: docs/quality/<release>/coverage-inventory.md
07 Release Quality Summary: <summary and link only>
Decision owner: <human or Unknown>
External actions: none
```
