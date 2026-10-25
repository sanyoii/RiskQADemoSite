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
- `Pass`／`Fail` 必須來自實際執行與核定判準。選定案例缺必要前提可在操作前記 `Blocked`，附缺項、已觀察事實與恢復條件；Playbook 本身不產生 Run 結果。
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


## Review and recovery

覆核先讀原始需求、判準版本、案例與證據，再比較作者結論。設計與結果各記覆核範圍。同人或同上下文換角色是自查；不同 Bot 也不保證獨立，AI 覆核不等於真人驗收。沿原角色分工，不另設核准者。

| Trigger | Preserve in the existing record | Stop／return | Resume condition |
|---|---|---|---|
| 來源改版 | 問題 ID、舊／新來源及判準版本、受影響案例／Run、責任人 | 流程回建模、規則回判準、失效模式回風險、前提回準備；只停受影響範圍 | 重評、必要新 Run 及新覆核；舊 Pass／Fail 不改寫 |
| 覆核分歧 | 雙方主張、來源／證據、影響 ID、未決原因 | 不升級受影響結論；交原有權人裁決，不用多數模型投票代替 | 裁決理由、人員、時間及必要重測／再覆核 |
| AI 誤判 | 原輸入輸出、模型／prompt／資料／評測版本、錯誤類型及影響範圍 | 暫停受影響自動判定，回到原證據人工檢查；保留舊評測結果並另記修正 | 修正後以既有失敗題、正反例與保留測試集重評，記覆核限制 |

AI 生成案例須查來源、遺漏、重複及步驟／資料一致性；自動化檢查需已知正反例。若使用 AI judge，使用人工核准標籤，分開校準集與保留測試集；記樣本來源／版本／數量、誤報與漏報、適用範圍。未量測不宣稱準確率。模型、prompt 或資料改版後重新評測；把誤判題加入校準後，不能再把同一題當未見過的保留集。

非確定性輸出需記 K 次、允許變異、不變條件、逐次與彙整判準、停止／費用上限，逐次保存結果。這些方法不自動授權外部模型、敏感資料上傳或帳號操作。
