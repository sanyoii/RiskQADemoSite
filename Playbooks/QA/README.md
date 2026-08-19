# QA Playbooks

QA Playbooks 是輸入資料與九個核心 QA 模板之間的 advisory layer。它們協助整理問題、缺口與建議，不保存 release truth，也不直接產生 Dashboard status。

```text
Jira／OpenAPI／diff／test results
→ QA Playbook draft
→ human evidence review
→ Templates/QA/00..08
→ approved Release Quality Summary
→ .test-dashboard/status.json
→ QA Decision Desk
```

## 使用順序

1. 先讀 [Playbook Contract](playbook-contract.md)、[Router](router.md) 與 [Security Rules](security-rules.md)。
2. 選擇一個符合 trigger 的 Playbook；不符合時不要硬套。
3. 保存 input provenance、scope、Unknown 與限制。
4. 把輸出視為 draft／recommendation，由人類 reviewer 決定是否寫進 release-specific evidence。
5. 只有 approved Release Quality Summary 可以投影為 Dashboard status。

## Playbook index

| Playbook | 作用 | Canonical evidence 落點 |
|---|---|---|
| [Requirement Readiness](requirement-readiness.md) | 找出 requirement／AC 缺口、矛盾與待問問題 | 00、01 |
| [Coverage Analysis](coverage-analysis.md) | 建立 Requirement／AC → Scenario → Case → Run traceability | 03 套用後的 `coverage-inventory.md`，07 只引用摘要 |
| [Regression Selection](regression-selection.md) | 形成可辯護的 targeted regression set | 02 execution plan、05 run record |
| [Test Data Design](test-data-design.md) | 設計 valid／invalid／boundary／synthetic data | conditional Test Data Sheet、04 |
| [API Coverage Design](api-coverage-design.md) | 依 contract 建立 API coverage matrix | 02、03、04 |
| [Defect Triage](defect-triage.md) | 批次整理 duplicate、priority、owner suggestion 與缺資料 | 多份 06 的 triage recommendation |
| [RCA／Escape Analysis](rca-escape-analysis.md) | 分離 symptom、hypothesis、confirmed cause 與 escape point | 06 appendix／RCA evidence |

## 不在這一層做的事

- 不自動更新 Jira、GitHub issue、tracker 或 release。
- 不產生、刪除或省略 test run。
- 不把 draft、coverage estimate 或 hypothesis 當成 evidence。
- 不修改九個核心模板的語意或 status contract。
- 不把模型輸出直接標成 `Pass`、`Ready` 或 confirmed root cause。

Fixture 與 deterministic checks 見 [`tests/playbooks`](../../tests/playbooks/README.md)。Static fixture PASS 不等於 Playbook behavior PASS。
