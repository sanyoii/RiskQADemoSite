---
type: dashboard-status-contract
templateVersion: 0.3.0
status: draft
repository:
releaseTarget:
fullSha:
contractVersion: 1.0.0
schema: schema/test-status.schema.json
exporterVersion:
qaOwner:
publisher:
publicDisclosure: internal
tags:
  - qa
  - dashboard-contract
---

# Dashboard Status Contract

> Exporter 只能把已核准的 release assessment 投影成 `.test-dashboard/status.json`。這份 status 不是 run ledger，不能改寫 chronology。

## Authority and versions

| Field | Value |
|---|---|
| Assessment source | |
| Contract version | |
| Schema | `schema/test-status.schema.json` |
| Exporter version／SHA | |
| Policy version／SHA | |
| Publisher workflow／SHA | |

## Required projection

```json
{
  "contractVersion": "1.0.0",
  "snapshotId": "owner--repository--yyyymmdd",
  "repository": {
    "name": "repository",
    "url": "https://github.com/owner/repository",
    "releaseTarget": "release name",
    "branch": "main",
    "fullSha": "0123456789abcdef0123456789abcdef01234567"
  },
  "objective": "Release Readiness",
  "environment": "public-safe environment summary",
  "testedScope": ["tested area"],
  "excludedScope": ["explicit exclusion"],
  "releaseAssessment": {
    "status": "ready",
    "rationale": "Human-owned release rationale.",
    "decidedAt": "2026-08-19T09:00:00+08:00",
    "expiresAt": "2026-08-26T09:00:00+08:00",
    "qaOwner": "role or public-safe name",
    "reviewer": "reviewer role",
    "decisionOwner": "decision owner role"
  },
  "summary": {
    "effortLevel": "medium",
    "coverage": "2",
    "quality": "good",
    "comment": "Public-safe assessment summary."
  },
  "productAreas": [{
    "id": "core-flow",
    "name": "Core flow",
    "effortLevel": "medium",
    "executionState": "complete",
    "coverage": "2",
    "targetCoverage": "2",
    "quality": "good",
    "comment": "Required evidence passed.",
    "evidenceLinks": ["https://github.com/owner/repository/actions/runs/123"]
  }],
  "gates": [{
    "id": "G3",
    "title": "Required checks completed",
    "note": "Illustrative example only",
    "state": "complete"
  }, {
    "id": "G6",
    "title": "Release decision recorded",
    "note": "Decision owner approved",
    "state": "complete"
  }],
  "runs": [{
    "runId": "123",
    "executedAt": "2026-08-19T08:00:00+08:00",
    "evidenceUrl": "https://github.com/owner/repository/actions/runs/123"
  }],
  "provenance": {
    "generatedAt": "2026-08-19T09:05:00+08:00",
    "syncedAt": "2026-08-19T09:06:00+08:00",
    "sourceSha": "0123456789abcdef0123456789abcdef01234567"
  },
  "dataStatus": "fresh",
  "publicDisclosure": "public"
}
```

## Status rules

### Product Test Status

- `Ready`：human-owned assessment 明確核准，且已知問題、執行完整性、結束條件判定、未測範圍四列都支援；未解決的阻斷問題或 S1 不得為 Ready；歷史 Fail 經有效新 Run 驗證修復後仍保留。歷史 Ready 不是目前授權。
- `At Risk`：無阻斷問題但有剩餘缺陷或已接受風險，列 owner 與 follow-up；另列退出條件與未測範圍，不代表已准許發布。
- `Blocked`：有未解決 S1、未獲接受的 S2 或已確認關鍵路徑不符合；同時保留缺少的 evidence、environment 與未測部分。
- `Unknown`：無已知阻斷或剩餘問題，但資料、判準、執行或覆核不足；不能蓋掉可信且同版本的 Blocked／At Risk。損毀或版本不符的來源不當成可信產品事實。

### Data Status

- `Fresh`：snapshot 通過 schema、sync 與 freshness policy。
- `Stale`：last-known-good 仍可讀，但 evidence 或 sync 已過期。
- `Invalid`：schema／contract 不合法，不能猜測缺值。
- `Not Configured`：repository 尚未接入 exporter。
- `Unreachable`：最近一次 snapshot 取得失敗；這不是即時產品監控。

## Fail-closed checks

| Check | Result | Evidence／error code |
|---|---|---|
| Repository, branch and full SHA match the approved subject | `Pass` / `Fail` | |
| Assessment source is the authorized Release Quality Summary | `Pass` / `Fail` | |
| Required fields and supported versions validate | `Pass` / `Fail` | |
| Evidence and assessment are within freshness SLA | `Pass` / `Fail` | |
| Unresolved blocker／waiver disposition is complete | `Pass` / `Fail` | |
| Public fields pass allowlist and link review | `Pass` / `Fail` | |
| Secret／PII／internal URL scan passes | `Pass` / `Fail` | |
| Atomic manifest keeps last-known-good on failure | `Pass` / `Fail` | |

## Public disclosure review

- Allowed fields：public repository identity, branch, full SHA, named release target, sanitized assessment, Product Areas, coverage, sanitized counts, timestamps, public evidence links, limitations and role labels without personal data.
- Prohibited fields：credentials, tokens, cookies, test accounts, PII, sensitive test data, local paths, private URLs, account／order／fund／trade data, exploit details and unsanitized logs.
- Reviewer：
- Outcome：`approved` / `changes-required` / `blocked`
- Reviewed at：

## Publication and correction

- Generated at：
- Synced at：
- Active manifest／hash：
- Last-known-good snapshot：
- Correction／withdrawal procedure：
- Rollback owner：
- Post-publish smoke evidence：


Ready 表示測試交付條件成立且無已知剩餘缺陷／接受風險；實際發布另需具名 Go。新版 current policy 拒絕 Ready 與 Warning 並存。archive 驗證保留舊決定原文，不改寫歷史 Ready／Run；目前投影另列資料時效與未完成核准。此輪保留 status schema 與既有四種狀態，不新增發布帳本。
