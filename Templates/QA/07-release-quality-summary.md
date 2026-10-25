---
type: release-quality-summary
templateVersion: 0.3.0
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
| 測試交付狀態（發布決定另見 Human decision record） | `Ready` / `At Risk` / `Blocked` / `Unknown` |
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
| Critical paths completed all required checkpoints; reasons alone do not count as execution | `Pass` / `Fail` / `Unknown` | |
| Evidence is within freshness SLA | `Pass` / `Fail` / `Unknown` | |
| Assessment and actual evidence do not conflict | `Pass` / `Fail` / `Unknown` | |
| Four columns agree: known issues, execution completeness, exit decision, untested scope | `Pass` / `Fail` / `Unknown` | |
| Unresolved critical nonconformance or S1 is not Ready and is not hidden as Unknown | `Pass` / `Fail` / `Unknown` | |

## Recommendation

- Release assessment：`Ready` / `At Risk` / `Blocked` / `Unknown`
- One-line rationale（由四列推導，優先序 Blocked ＞ At Risk ＞ Unknown ＞ Ready。有阻擋 → Blocked；無阻擋但有剩餘缺陷或已接受風險 → At Risk；無已知問題但缺依據 → Unknown；結束條件與覆核成立且無剩餘風險 → Ready。未解決 S1 或已確認的阻斷問題不得為 Ready。舊 Fail 經有效新 Run 驗證修復後仍保留歷史。Ready 是測試交付判定，不是發布授權。）：
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


## Four dimensions and exit evidence

| Dimension | Current facts／versioned evidence | Gap／owner／next action |
|---|---|---|
| Known issues | Open S1／S2／S3／S4、處置、接受風險及原始缺陷／Run | |
| Execution completeness | 選定案例；Pass／Fail／Blocked／Skipped／Not Run；(Pass+Fail)/選定案例數，0 記 N/A | |
| Exit decision | 關鍵路徑完整證據；無未解決 S1；S2 修復及重測／回歸或有權延期；無未解釋追溯缺口 | |
| Untested scope | 案例／風險、未測原因、影響及責任人 | |

由四面向推導摘要，不另維護第二份總結狀態。S3 加上未測關鍵路徑應是 At Risk 且退出條件未達，不把已知問題藏成 Unknown。接受 S2 仍屬 At Risk；缺少 S1 不代表 Ready。

覆核分歧保留雙方判準／證據、受影響結論、裁決人與時間；未解決時不得升級受影響的 Ready／Go。AI 自查不是真人或獨立驗收。已知風險與證據有效性分開列；更新建置時間不延長核准。
