---
type: test-spec
templateVersion: 0.2.0
status: draft
specId:
repository:
releaseTarget:
candidateSha:
riskTier:
qaOwner:
reviewer:
publicDisclosure: internal
tags:
  - qa
  - test-strategy
---

# Test Spec

> 定義這次如何取得足以支持 release decision 的 evidence。測試數量本身不能代表 coverage 或 Ready。

## Purpose and decision

- Purpose：
- Decision to support：
- Risk tier：

## Subject

| Field | Value |
|---|---|
| Repository | |
| Release／tag | |
| Branch | |
| Full SHA | |
| Environment | |
| Worktree state | |

## Scope

### Tested scope

- <!-- fill in -->

### Out of scope

- <!-- fill in -->

## Coverage design

| Product Area | Related risk | Target coverage | Test type | Approach | Evidence output | Owner |
|---|---|---|---|---|---|---|
| | | | Functional / Non-Functional / Change-related | automated / manual / exploratory / inspection / live | | |

## Test design decisions

> 先用 risk／failure mode、規格特徵及可觀察性限制選擇 technique，再由 human reviewer 核准。不要用案例數量代替 coverage，也不要讓模型補完未定義的 expected behavior。

| Target risk／failure mode | Spec characteristic | Observability／environment constraint | Selected technique | Technique parameters | Oracle／source | Coverage claim | Exclusions／residual risk | Reviewer |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

### Oracle and testability rules

- Oracle hierarchy：approved requirement／AC → approved business rule／API or schema contract → reviewed domain decision → current behavior as characterization evidence → `Assumption` → `Unknown／needs-clarification`。
- Observability／testability gap：<!-- UI, API response, event, log, database state or external side effect that cannot be observed or controlled -->
- Test data／dependency constraint：
- Stopping rule：<!-- the risk-based condition that ends design or execution; not a target number of cases -->
- Run／Defect／Escape feedback：<!-- how later evidence will confirm or revise technique, parameters, coverage claim and residual risk -->

## Entry, suspension and exit

### Entry criteria

- <!-- fill in -->

### Suspension criteria

- <!-- fill in -->

### Resumption criteria

- <!-- fill in -->

### Exit criteria

- <!-- fill in -->

## Environment, data and dependencies

- Environment／versions：
- Test data identity／generation：
- External dependencies：
- Observability／health checks：
- Secrets／PII handling：

## Execution plan

| Sequence | Test activity | Exact command／procedure source | Timebox | Executor | Expected artifact |
|---|---|---|---|---|---|
| 1 | | | | | |

## Evidence handling

- Artifact root：
- Retention：
- Hash／integrity method：
- Reviewer method：
- Evidence accessibility check：

## Defects, reruns and exceptions

- Defect triage rule：
- Retest rule：
- Regression rule：
- Retry／flakiness rule：
- Waiver／override authority：
- Escalation path：

## Roles and schedule

| Role | Person／system | Responsibility | Role overlap disclosed |
|---|---|---|---|
| QA owner | | | |
| Test executor | | | |
| Reviewer | | | |
| Decision owner | | | |

## Known limitations

- 本次 evidence 不會證明：
- 未執行範圍對 decision 的影響：
- Resource limitations：

## Approval

- Review outcome：`approved` / `changes-required` / `blocked`
- Approved by：
- Approved at：
