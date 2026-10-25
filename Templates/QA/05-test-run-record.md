---
type: test-run-record
templateVersion: 0.3.0
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

| Case ID／version | Data row／attempt／checkpoint | Actual result | Status | Defect／blocker／recovery | Evidence |
|---|---|---|---|---|---|
| | | | `Not Run` / `Skipped`（原因） / `Blocked` / `Pass` / `Fail` | | |

`In Progress` 只用於尚未交付的草稿，不能當最終狀態。重測是新的 Run，原 Fail 保留。

## Artifacts

| Artifact | Path／URL | SHA-256 | Retention／expiry | Availability | Public-safe |
|---|---|---|---|---|---|
| | | | | `available` / `expired` / `unknown` | `yes` / `no` / `review-required` |

## Completion

- Cleanup status：
- Unexecuted coverage：
- Limitations：
- Final run state：`Not Run` / `Skipped`（原因） / `Blocked` / `Pass` / `Fail`
- Final state rationale：

## Review

- Evidence accessible：`yes` / `no` / `partial`
- Subject and command reproducible：`yes` / `no` / `unknown`
- Review outcome：`accepted` / `changes-required` / `blocked`
- Reviewed at：


## Readiness, data and result basis

- 執行前 readiness 結果／來源／授權／額度：
- 實際案例版本或不可變快照／oracle 版本：
- 資料契約 ID／version、資料集／列 ID、快照、as-of／時區與擷取時間：
- 原 Run／失敗檢查點／本次修正與回歸選取理由：
- 條件式 AI：實際模型／prompt／資料／評測版本、逐次輸入輸出、K 次與彙整結果；未知版本明示。

Not Run＝未開始；Skipped＝明確決定不做並附理由；Blocked＝缺必要前提，可在產品操作前記錄，保留已觀察事實與恢復條件。Pass＝全部必要檢查點符合核定判準；Fail＝至少一項已確認偏差，並另列未完成部分。Fail 不自動等於產品缺陷，需區分 test／data／environment／product。

完成率＝(Pass + Fail) / 本輪選定案例數；Blocked、Skipped、Not Run 不從分母偷偷刪掉，分母為 0 記 N/A。案例、資料列、工具與產品分開計數；保留中途增減範圍的原因。In Progress 只屬草稿，不新增 Incomplete 結果。
