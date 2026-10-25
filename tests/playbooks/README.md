# QA Playbook fixtures

這裡保存 QA Playbook 的 deterministic contract fixtures。Fixture 至少包含 input、expected assertions、candidate output 與 run metadata。

`validate-fixture.mjs` 只驗證 schema、required fields、required phrases 與 forbidden claims。它不呼叫模型、不執行 Playbook，也不能證明 Playbook behavior。沒有實際 host／model run receipt 時，狀態只能是 `DEFINED_UNRUN`。

```powershell
node tests/playbooks/validate-fixture.mjs tests/playbooks/fixtures/_base
```


## AI evaluator calibration and recovery

實際使用 AI judge 時，依 [Review and recovery](../../Playbooks/QA/playbook-contract.md#review-and-recovery) 在既有 run record 記錄人工核准標籤、校準集與保留測試集的來源／版本／樣本數、false positives／false negatives 及限制。這些內容不由 phrase checker 判定正確，也不新增 fixture 必填欄位來假裝已做模型實測。

模型／prompt／資料改版或發現誤判時，停止受影響自動判定、保存原輸出與版本、重查既有結論。修正後執行失敗題回歸及未用於調整的保留集，人工覆核後才恢復。沒有真人標籤或實際模型結果時維持 DEFINED_UNRUN，不宣稱準確率。
