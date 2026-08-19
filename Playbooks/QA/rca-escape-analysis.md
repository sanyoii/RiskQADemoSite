# RCA／Escape Analysis

## Decision question

現有 evidence 能支持哪些 causal links？哪個只是 symptom、哪個仍是 hypothesis、哪個才可由 evidence owner 確認為 confirmed cause？Failure 為什麼沒有在較早的 control／test／review 被發現？

## Entry criteria

- 有可識別 defect／incident、subject full SHA、environment、timeline 與 observable impact。
- 有 logs、diff、run、artifact、reproduction 或其他可核對 evidence。
- 有 reviewer 與 evidence owner。

只有 symptom 或傳聞時可以整理 questions，但 state 必須是 `needs-clarification`；不能開始 confirmed RCA。

## Analysis model

1. **Symptom**：只寫觀察到的 effect、scope、時間與 evidence。
2. **Causal chain**：每一個 why 都附 supporting／contradicting evidence；缺證據時標 `hypothesis`。
3. **Contributing factors**：People、Process、Tooling、Data、Environment 只作檢查面，不硬湊每一類。
4. **Confirmed cause**：必須有直接 evidence、alternative explanation disposition、reviewer 與 evidence owner。
5. **Escape point**：指出哪個 planned control 本可發現、為何沒有發現，以及這項判斷的 evidence。
6. **Actions**：`corrective action` 修目前 instance；`preventive action` 降低同類 recurrence。每項需 owner、due date、verification method。

5-Whys／fishbone 是提問工具，不是 causal proof。時間先後也不自動等於因果。

## Output

```markdown
Playbook: RCA / Escape Analysis
Review state: draft
State: draft / needs-clarification / blocked
Subject and evidence set:
Symptom:
| Link | Statement | Status: hypothesis / supported / contradicted | Evidence | Owner |
Confirmed cause: <only with evidence owner; otherwise Unknown>
Alternative explanations:
Escape point:
Corrective action:
Preventive action:
Unknowns and limitations:
Evidence target: 06 appendix / RCA evidence
Decision owner: <human or Unknown>
External actions: none
```

本 Playbook 不改 defect state、不 assign action、不宣告修復完成。Action 完成與否要由後續 verification evidence 證明。
