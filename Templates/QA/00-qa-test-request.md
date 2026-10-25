---
type: qa-test-request
templateVersion: 0.3.0
status: draft
requestId:
repository:
releaseTarget:
candidateSha:
requester:
qaOwner:
requestedAt: {{date}}
targetDecisionAt:
publicDisclosure: internal
tags:
  - qa
  - quality-evidence
---

# QA Test Request

> 用這份 request 鎖定測試 subject、範圍與要支援的決策。資訊不足時保留 `needs-information`，不要預設 scope。

## Decision request

- 要回答的 release question：
- Business objective：
- Affected users／assets：
- 為什麼現在需要決定：

## Subject

| Field | Value |
|---|---|
| Repository | |
| Release／tag | |
| Branch | |
| Candidate full SHA | |
| Target decision date | |

## Change summary


## Scope

### Requested scope

- <!-- fill in -->

### Explicit out of scope

- <!-- fill in -->

## Known context

| Item | Detail | Evidence／link |
|---|---|---|
| Known risk | | |
| Known defect | | |
| Dependency | | |
| Assumption | | |

## Environment and data constraints

- Target environments／platforms：
- Test data constraints：
- Access or service dependencies：

## Available inputs

- Requirement／design：
- Issue／PR：
- Runbook／operations：
- Existing test evidence：

## Constraints

- Time：
- People：
- Environment：
- Other limitations：

## Public disclosure

- Classification：`internal` / `public-candidate` / `public`
- Sanitization requirements：
- Prohibited fields：

## QA intake decision

- Status：`accepted` / `needs-information` / `rejected`
- Proposed risk tier：`QA-Lite` / `QA-Standard` / `QA-High-Risk` / `Unknown`
- Missing information：
- QA owner：
- Reviewed at：


## Questions, authority and return conditions

| Question ID | Source／version | Question | Owner | Affected requirement／risk／case IDs | Answer source／date | New criteria version／recheck |
|---|---|---|---|---|---|---|
| | | | | | | |

- 允許的帳號、操作及費用／點數上限：
- 允許 AI 使用的模型／服務、可讀資料與外傳範圍：
- 遮蔽、證據存取、保存位置／期限及清理授權：
- Unknown 不代表允許。問題回答後回到 Spec 重評受影響案例及既有 Run；保留舊判準及原結果，只暫停受影響範圍。
