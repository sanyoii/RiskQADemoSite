---
type: quality-risk-assessment
templateVersion: 0.3.0
status: draft
assessmentId:
repository:
releaseTarget:
candidateSha:
qaOwner:
reviewer:
reviewedAt:
publicDisclosure: internal
tags:
  - qa
  - risk-assessment
---

# Quality Risk Assessment

> 先決定 Product Area 的風險與 target coverage，再安排測試。Unknown 保持 Unknown，不能自行填成 Low。

## Subject

| Field | Value |
|---|---|
| Repository | |
| Release／tag | |
| Branch | |
| Candidate full SHA | |
| Risk tier | `QA-Lite` / `QA-Standard` / `QA-High-Risk` / `Unknown` |

## Scoring guide

- Impact：失敗造成的使用者、業務、資料或營運後果。
- Likelihood／uncertainty：發生可能性與目前未知程度。
- Detectability：發布前或發布後能否及時發現。
- Recoverability：能否安全、快速復原。
- Coverage target：`0`、`1`、`1+`、`2`、`2+`、`3`。

## Risk register

| Risk ID | Product Area | Risk statement | Failure mode／trigger | Affected user／asset | Impact | Likelihood／uncertainty | Detectability | Recoverability | Existing control＋evidence | Target coverage | Test response | Owner | Residual risk | Acceptance owner | Review date |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| RISK-001 | | | | | | | | | | | | | | | |

## Unknowns and assumptions

| ID | Type | Statement | Effect on decision | Owner | Due date | Disposition |
|---|---|---|---|---|---|---|
| UA-001 | `unknown` / `assumption` | | | | | |

## Conditional template triggers

| Trigger | Applies | Required template | Owner | Link |
|---|---|---|---|---|
| Complex or sensitive test data | `yes` / `no` / `unknown` | Test Data Sheet | | |
| Cross-service or permission dependency | `yes` / `no` / `unknown` | Environment Readiness | | |
| Security／privacy exposure | `yes` / `no` / `unknown` | Security／Privacy Checklist | | |
| Accessibility／compatibility scope | `yes` / `no` / `unknown` | Accessibility／Compatibility Matrix | | |
| Migration／production behavior change | `yes` / `no` / `unknown` | Migration or Production Validation Plan | | |

## Review

- Critical Product Areas all have target coverage：`yes` / `no`
- Untreated risks have a disposition：`yes` / `no`
- Independent review required：`yes` / `no`
- Review outcome：`approved` / `changes-required` / `blocked`
- Notes：


## Change and traceability review

| Requirement ID／version | Risk ID | Scenario ID／version | Case ID／version | Run／Defect links | Gap／owner／resolution |
|---|---|---|---|---|---|
| | | | | | |

此表索引原始紀錄，不另維護 Pass／Fail。新失效模式回到風險評估；新流程回到建模；規則新解讀回到判準；帳號、環境或額度不足回到準備。記錄變動理由、受影響 ID 與恢復條件。

Severity 描述已發生缺陷的影響，案例 Priority 描述執行順序；不可從風險排序或 P0／P1 機械轉成 S1／S2。風險接受不能代替關鍵路徑的完成證據。
