---
type: defect-report
templateVersion: 0.1.0
status: New
defectId:
title:
qaSuggestedSeverity:
clientDecidedSeverity:
finalSeverity:
fixPriority:
repository:
releaseTarget:
fullSha:
productArea:
reporter:
owner:
reportedAt: {{date}}
publicDisclosure: internal
tags:
  - qa
  - defect
---

# Defect Report

## Summary

- What failed：
- User／business impact：
- Release impact：
- Reproducibility：
- Defect status：`New` / `Triaged` / `In Progress` / `Fixed` / `Verified` / `Closed` / `Reopened` / `Rejected` / `Duplicate` / `Deferred`
- Cause category：`product` / `test` / `environment` / `data` / `unknown`（沒有證據記 unknown）

Defect `In Progress` 是處理進度，不是 Run Status。Rejected／Duplicate 要寫依據；Duplicate 寫原缺陷 ID。Deferred 要寫風險接受者、理由、剩餘風險、重評日期。延後修復不等於調降 Severity。

## Severity（S1–S4；兩方都保留，不得覆寫）

| 判定方 | 等級 | 依據 | 判定者 | 日期 |
|---|---|---|---|---|
| QA 建議 | `S1` / `S2` / `S3` / `S4` | | | |
| 委託方裁定 | `S1` / `S2` / `S3` / `S4` | | | |
| 最終等級 | | 採哪一方 | — | — |

- 修復 Priority（排程，與 Severity、案例 Priority 分開）：
- S1：關鍵路徑不可用且無替代方案；或資料毀損／遺失、金流或點數錯誤、安全或隱私外洩。後三類不論有無替代方案都是 S1。
- S2：主要功能或結果錯誤，只有困難的替代方案。S3：次要或邊界錯誤，有簡單替代方案。S4：文字或外觀，不影響功能。
- 定義為初稿。示範用的裁定要標 demo／fictional。

## Subject and traceability

| Field | Value |
|---|---|
| Repository | |
| Release／tag | |
| Full SHA | |
| Environment | |
| Product Area | |
| Requirement | |
| Risk | |
| Scenario | |
| Test case | |
| Run ID | |

## Reproduction

### Preconditions and data

- Preconditions：
- Test data identity：

### Steps

1. <!-- fill in -->
2. <!-- fill in -->
3. <!-- fill in -->

### Results

- Expected：
- Actual：
- Reproducibility rate：

## Evidence

| Evidence | Link／path | Availability／expiry | Confidentiality | Public-safe |
|---|---|---|---|---|
| | | | | `yes` / `no` / `review-required` |

## Cause analysis

- Suspected cause：
- Confirmed cause：
- Trigger：
- Root cause evidence：

> Suspected 和 confirmed 要分開；沒有 evidence 時不要把推測寫成結論。

## Resolution

- Owner：
- Target fix：
- Resolution：
- Fixed SHA：
- Technical prevention：
- Process prevention：
- Coverage added：

## Verification

- Retest run ID（新 Run，不覆蓋原 Fail）：
- Actual verification result：
- Regression scope（同模型元素／轉換／約束或同風險 ID）：
- Retest status：`Not Run` / `Skipped`（原因） / `Blocked` / `Pass` / `Fail`
- Verified by／at（Verified 前必須有新 Run 證據）：

## Disposition

- Status：`New` / `Triaged` / `In Progress` / `Fixed` / `Verified` / `Closed` / `Reopened` / `Rejected` / `Duplicate` / `Deferred`
- Decision owner：
- Acceptance／defer reason：
- Residual risk：
- Expiry／review date：
