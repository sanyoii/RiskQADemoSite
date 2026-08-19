---
type: quality-risk-assessment
templateVersion: 0.1.0
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
