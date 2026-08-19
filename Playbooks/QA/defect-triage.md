# Defect Triage

## Decision question

一批已有的 06 Defect Reports 中，哪些是 possible duplicate、哪些缺少必要資訊，severity／priority 與 component／owner 可以提出什麼有來源的 recommendation？

## Required inputs

- Defect IDs、summary、environment、release／full SHA、steps、expected／actual、evidence 與 current disposition。
- Severity／priority policy、component ownership map（若有）。
- Triage scope、cutoff timestamp 與 human triage owner。

資料不完整時保留 `Unknown`。文字相似不等於同一 defect，symptom 相似也不等於同一 root cause。

## Workflow

1. 先列出 missing information：repro、environment、subject SHA、evidence、impact 或 owner policy。
2. 以 affected behavior、trigger、environment 與 evidence 建立 possible duplicate groups，逐組寫相同點與不同點。
3. 分開提出 `severity`（impact）與 `priority`（urgency）recommendation，附 policy／evidence 理由。
4. 只有 ownership map 支持時才提出 `owner suggestion`；否則為 Unknown。
5. 保存每份 defect 原始 ID 與 chronology，不合併、不關閉、不重新 assign。

## Output

```markdown
Playbook: Defect Triage
Review state: draft
State: draft / needs-clarification / blocked
Scope and cutoff:
| Defect | possible duplicate | severity recommendation | priority recommendation | owner suggestion | missing information | Evidence |
Duplicate rationale and differences:
Unknowns:
Evidence target: triage recommendation over existing 06 Defect Reports
Triage owner: <human or Unknown>
External actions: none
```

本 Playbook 不直接更新 tracker、合併 duplicate、關閉 defect、改 priority 或 assign owner。這些都是 external write，必須由 human triage owner review 並另行授權。
