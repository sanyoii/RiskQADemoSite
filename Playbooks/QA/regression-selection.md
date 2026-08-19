# Regression Selection

## Decision question

針對一個明確 change，在不假裝 targeted subset 等於 full regression 的前提下，哪些 tests 必須執行、哪些建議執行、哪些可以提出 skip recommendation？

## Required inputs

- Repository、release、branch、candidate full SHA 與 worktree state。
- Scoped diff／changed modules／behavior change。
- Existing test inventory、critical user journeys、shared dependencies 與近期香港 defects。
- Risk assessment、target coverage、time／environment constraints。

Change scope 或 test inventory 不明時，輸出 `Unknown`／`blocked`，不靠檔名猜 mapping。

## Selection classes

| Class | Rule |
|---|---|
| `Must-run` | 直接驗證 changed behavior、受影響 contract、migration、permission 或高風險 shared path |
| `Should-run` | 鄰近功能、共用 component／data／dependency，或有合理 regression history |
| `safety net` | 不論 change 大小都保留的 critical smoke／install／release gate |
| `Skip-with-reason` | 有明確 test identity、理由、uncovered gap、residual risk、owner 與 expiry 的建議 |

沒有 reason 的 skip 是 omission，不是 selection。沒有 human approval 時，`Skip-with-reason` 仍是 recommendation，不能從 run scope 移除。

## Workflow

1. 把 changed area 映射到 product behavior、contract、shared dependency 與 risk。
2. 只使用有來源的 test-to-area mapping；不確定的 mapping 標 `Unknown`，偏向列入。
3. 分類 Must-run、Should-run 與 safety net。
4. 每個 Skip-with-reason 列出未覆蓋內容、failure mode、residual risk、owner 與到期條件。
5. 由 reviewer／decision owner 核准實際 run scope；05 Test Run Record 保存最後採用與未採用項目。

## Output

```markdown
Playbook: Regression Selection
Review state: draft
State: draft / needs-clarification / blocked
Subject and change scope: <repo/release/full SHA/diff>
Must-run:
Should-run:
safety net:
Skip-with-reason:
| Test | Reason | uncovered gap | Residual risk | Owner | Expiry |
Unknown mappings:
Recommendation limitations:
Evidence target: 02 execution plan / 05 run record
Decision owner: <human or Unknown>
External actions: none
```

這份輸出不能宣告 subset risk-free，不能修改 test suite、CI selection、run record 或 release decision。
