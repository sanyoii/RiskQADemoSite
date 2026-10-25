---
type: release-quality-summary
templateVersion: 0.1.0
status: draft
decisionId:
repository:
releaseTarget:
fullSha:
environment:
riskTier:
qaOwner:
reviewer:
decisionOwner:
decidedAt:
expiresAt:
releaseAssessment: Unknown
publicDisclosure: internal
tags:
  - qa
  - release-decision
---

# Release Quality Summary

> 這份 summary 是 human-owned release decision input。Test count、coverage 或 defect count 都不能自動產生 Ready。

## Decision at a glance

| Question | Answer |
|---|---|
| 能不能發布？ | `Ready` / `At Risk` / `Blocked` / `Unknown` |
| 為什麼？ | |
| Evidence 在哪裡？ | |
| 下一個必要動作 | |

## Subject

| Field | Value |
|---|---|
| Repository | |
| Release／tag | |
| Branch | |
| Full SHA | |
| Environment | |
| Worktree state | |
| Assessment expiry | |

## Scope and risk

- Tested scope：
- Out of scope：
- Risk tier：
- Critical Product Areas：
- Known limitations：
- 本次 evidence 不會證明：

## Coverage and quality assessment

| Product Area | Related risk | Effort | Target coverage | Actual coverage | Quality | Evidence | Comment／required action |
|---|---|---|---|---|---|---|---|
| | | Low / Medium / High | | | Good / Warning / Bad / Unknown | | |

## Run inventory

| Run ID | Subject／environment | Executed at | Pass | Fail | Blocked | Skipped（原因） | Not Run | Evidence available | Freshness |
|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | `yes` / `no` / `partial` | `Fresh` / `Stale` / `Unknown` |

## Unresolved items and dispositions

| Type | ID | Severity／impact | Status | Owner | Decision／disposition | Expiry | Evidence |
|---|---|---|---|---|---|---|---|
| defect / blocker / accepted risk / waiver | | | | | | | |

## Ready rule check

| Rule | Result | Evidence／reason |
|---|---|---|
| Subject, scope, evidence and owners are complete | `Pass` / `Fail` / `Unknown` | |
| Critical areas reached their planned coverage | `Pass` / `Fail` / `Unknown` | |
| No untreated release blocker remains | `Pass` / `Fail` / `Unknown` | |
| Blocked, Skipped and Not Run have reasons | `Pass` / `Fail` / `Unknown` | |
| Evidence is within freshness SLA | `Pass` / `Fail` / `Unknown` | |
| Assessment and actual evidence do not conflict | `Pass` / `Fail` / `Unknown` | |
| Four columns agree: known issues, execution completeness, exit decision, untested scope | `Pass` / `Fail` / `Unknown` | |
| Confirmed Fail or unresolved S1 is not Ready and is not hidden as Unknown | `Pass` / `Fail` / `Unknown` | |

## Recommendation

- Release assessment：`Ready` / `At Risk` / `Blocked` / `Unknown`
- One-line rationale（由四列推導，優先序 Blocked ＞ At Risk ＞ Unknown ＞ Ready。有阻擋 → Blocked；無阻擋但有剩餘缺陷或已接受風險 → At Risk；無已知問題但缺依據 → Unknown；出場與覆核成立且無剩餘風險 → Ready。已確認 Fail 或 S1 不得為 Ready。Ready 由人最後決定。）：
- Required actions：
- Residual risk：
- Assessment expires at：

## Human decision record

- QA owner recommendation：
- Reviewer outcome：
- Decision owner decision：`Go` / `No-Go` / `Hold` / `Unknown`
- Decided at：
- Decision owner：

## Override／waiver

- Applies：`yes` / `no`
- Original assessment：
- Overridden decision：
- Reason and affected scope：
- Compensating controls：
- Approver：
- Decided at／expires at：
- Required retest／follow-up：
- Related defect／run／release：
- Public wording：
