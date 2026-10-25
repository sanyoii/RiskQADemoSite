---
type: test-case
templateVersion: 0.3.0
status: designed
caseId:
repository:
releaseTarget:
productArea:
priority:
testType:
executionMode:
owner:
reviewer:
publicDisclosure: internal
tags:
  - qa
  - test-case
---

# Test Case

## Identity and traceability

| Field | Value |
|---|---|
| Case ID | |
| Case version／review state | |
| Title | |
| Product Area | |
| Case priority（案例 Priority） | 執行優先序（P0／P1…）。引用風險 ID。不是缺陷 Severity，不用來當發布判準。 |
| Requirement | |
| Risk | |
| Scenario | |
| Design decision | |
| Selected technique | |
| Technique parameters | |
| Oracle／source | approved source / `Assumption` / `Unknown／needs-clarification` |
| Coverage claim | |
| Residual risk | |
| Test type | Functional / Non-Functional / Change-related |
| Automation suitability | automated / partial / manual；理由與人工檢查點 |
| Implementation status／script | not-implemented / blocked / implemented；腳本版本與引用 |

## Preconditions

- Subject release／full SHA：
- Environment／versions：
- Account／permission state：
- Concrete test data：
- Other preconditions：

## Procedure

| Step | Action | Data | Observable expected result | Oracle reference |
|---|---|---|---|---|
| 1 | | | | |

## Cleanup／rollback

- Expected final state：
- Cleanup steps：
- Rollback or reset evidence：

## Variants

| Variant | Parameter／boundary | Expected result | Applies | Reason if excluded |
|---|---|---|---|---|
| | | | `yes` / `no` | |

## Execution links

Actual result、Status、執行人、時間與證據只寫入 Run Record。此處只留 Run／Defect 連結；需要顯示結果時，使用具名 Run、案例版本與環境的唯讀投影，不另手填。

- Run Record links：
- Defect links：

## Review

- Technique traces to risk／failure mode：`yes` / `no` / `not-reviewed`
- Expected results have an approved Oracle／source or explicit `Assumption`／`Unknown`：`yes` / `no` / `not-reviewed`
- Coverage claim and Residual risk are explainable：`yes` / `no` / `not-reviewed`
- Reproducible by another tester：`yes` / `no` / `not-reviewed`
- Review outcome：`approved` / `changes-required` / `blocked`
- Reviewer notes：


## Versioned data and stopping conditions

- 共用資料契約 ID／version／條款：
- 本案具體輸入／資料集版本／資料列 ID／衍生預期值：
- 等待條件／核定時限／允許狀態／重試及額度上限：
- 證據要求／檢查點 ID／Task ID：
- 條件式 AI 設計：模型、prompt、資料及評測版本，K 次、允許變異、逐次與彙整判準；不適用寫原因。

一案一個主要目的，每組資料獨立判定。核定產品時限違反記 Fail；判準或觀察條件不足記 Blocked。已確認的不符合不因其他部分受阻而消失。Cleanup 仍須在明確授權內。
