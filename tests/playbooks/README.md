# QA Playbook fixtures

這裡保存 QA Playbook 的 deterministic contract fixtures。Fixture 至少包含 input、expected assertions、candidate output 與 run metadata。

`validate-fixture.mjs` 只驗證 schema、required fields、required phrases 與 forbidden claims。它不呼叫模型、不執行 Playbook，也不能證明 Playbook behavior。沒有實際 host／model run receipt 時，狀態只能是 `DEFINED_UNRUN`。

```powershell
node tests/playbooks/validate-fixture.mjs tests/playbooks/fixtures/_base
```
