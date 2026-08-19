# QA Playbook Contract

## Role

Playbook 把有來源的輸入整理成 reviewable draft。它可以提出 recommendation，不能建立 release fact、測試結果或 decision authority。

## Required input

每次使用至少記錄：

| Field | Rule |
|---|---|
| Playbook | 使用的 Playbook 名稱與版本／commit |
| Subject | Repository、release／tag、branch、full SHA；未知欄位明寫 `Unknown` |
| Scope | 本次分析涵蓋與排除的內容 |
| Input provenance | 原始文件、ticket、contract、diff、run 或 defect 的穩定連結／path |
| Captured at | 取得輸入的 timestamp |
| Trust | `trusted`／`untrusted`／`mixed` |
| Requested decision | 這份 draft 要協助人類回答的問題 |

缺少關鍵輸入時縮窄結論，不補值、不猜測。

## Required output

每份輸出必須包含：

```markdown
Playbook: <name>
Review state: draft / reviewed
Recommendation: <advisory conclusion>
Subject and scope: <repo/release/SHA/scope or Unknown>
Input sources: <stable links or paths>
Findings: <source-backed observations>
Unknowns and assumptions: <explicit list>
Evidence target: <00..08 or release-specific evidence path>
Decision owner: <human owner or Unknown>
External actions: none
```

`approved` 只能由具名 human decision owner 在 canonical evidence 中記錄。Playbook 不得自行把 review state 升為 approved。

## Authority rules

- Playbook output 是 draft／recommendation，不是 test evidence。
- `Pass`、`Fail`、`Blocked` 只能來自已執行的 run record。
- `Ready`、`At Risk`、`Blocked`、`Unknown` 的 release recommendation 只由 07 Release Quality Summary 管理。
- confirmed root cause 必須有 evidence、reviewer 與 evidence owner；否則維持 hypothesis／Unknown。
- 新輸出不能覆蓋舊 Fail、Blocked、retry 或 disposition chronology。

## Template mapping

Playbook 只能把 review 後內容送到既有模板或 release-specific artifact：

| Output | Target |
|---|---|
| Requirement gaps／questions | 00 Test Request、01 Risk Assessment |
| Coverage approach | 02 Test Spec |
| Traceability matrix | 03 套用後的 `docs/quality/<release>/coverage-inventory.md` |
| Executable procedure／data | 04 Test Case |
| Actual execution | 05 Test Run Record；Playbook 不得代填 |
| Defect／RCA | 06 Defect Report 或 evidence-linked appendix |
| Release summary | 07；只引用 reviewed inputs，不複製完整 inventory |
| Public status | 08 projection；Playbook 不得直接寫入 |

## Evidence label

沒有實際 host／model behavior run receipt 時，Playbook eval 標為 `DEFINED_UNRUN`。Parser、schema 或 static fixture PASS 只能證明 deterministic contract checks 通過。
