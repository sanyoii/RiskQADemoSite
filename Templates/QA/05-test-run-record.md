---
type: test-run-record
templateVersion: 0.1.0
status: running
runId:
repository:
releaseTarget:
fullSha:
branch:
tester:
reviewer:
startedAt:
endedAt:
timezone: Asia/Taipei
publicDisclosure: internal
tags:
  - qa
  - test-run
---

# Test Run Record

> 每次 attempt 都要追加保存。修正後的 Pass 不能覆寫先前的 Fail 或 Blocked。

## Subject

| Field | Value |
|---|---|
| Repository | |
| Release／tag | |
| Branch | |
| Full SHA | |
| Worktree state | `clean` / `dirty` / `unknown` |
| Tested scope | |
| Excluded scope | |

## Environment

| Component | Version／identity | Evidence |
|---|---|---|
| OS | | |
| Runtime | | |
| Test tool | | |
| Browser／device | | |
| External service | | |
| Test data | | |

- Test data generation／reset method：
- Secret／PII handling：

## Procedure

- Exact command or manual procedure：
- Procedure version／hash：
- Expected artifact root：

## Attempt log

| Event ID | Attempt | Started at | Ended at | Command／procedure | Exit code | Collected | Pass | Fail | Blocked | Skipped | Warning／retry reason | Artifact／hash |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| EVT-001 | 1 | | | | | | | | | | | |

## Case results

| Case ID | Actual result | Status | Defect／blocker | Evidence |
|---|---|---|---|---|
| | | `Pass` / `Fail` / `Blocked` / `Skipped` | | |

## Artifacts

| Artifact | Path／URL | SHA-256 | Retention／expiry | Availability | Public-safe |
|---|---|---|---|---|---|
| | | | | `available` / `expired` / `unknown` | `yes` / `no` / `review-required` |

## Completion

- Cleanup status：
- Unexecuted coverage：
- Limitations：
- Final run state：`Passed` / `Failed` / `Blocked` / `Incomplete`
- Final state rationale：

## Review

- Evidence accessible：`yes` / `no` / `partial`
- Subject and command reproducible：`yes` / `no` / `unknown`
- Review outcome：`accepted` / `changes-required` / `blocked`
- Reviewed at：
