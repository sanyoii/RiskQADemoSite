# QA Playbook Router

一次只選擇最窄、最接近目前 decision question 的 Playbook。輸入同時命中多個 trigger 時，先完成上游判斷，再把 reviewed artifact 交給下游；不要讓兩個 Playbook 同時改寫同一結論。

| Playbook | Trigger | Non-trigger | Output target |
|---|---|---|---|
| Requirement Readiness | 要判斷 requirement／AC 是否足以進入測試設計 | 已核准 scenario 要展開為步驟；不要改用 Test Plan 重新解讀 ticket | 00／01 |
| Coverage Analysis | 已有 requirements、tests 或 runs，要找 traceability gaps | 只有一個尚未釐清的 ticket；先做 Requirement Readiness | release-specific coverage inventory |
| Regression Selection | 已有 diff／changed areas 與 test inventory，要選 targeted set | 沒有 change scope 或 test inventory | 02 execution plan |
| Test Data Design | 已知 field／entity constraints，要準備安全資料類別 | constraint 未定；回到 Requirement Readiness | conditional Test Data Sheet／04 |
| API Coverage Design | 有 contract／OpenAPI／endpoint rules，要設計 coverage | 只要求產生 automation code | 02／03／04 |
| Defect Triage | 有多份 defect，要分群、補資料、建議 priority／owner | 單一 failure 尚未形成可重現 defect | triage recommendation over 06 |
| RCA／Escape Analysis | defect 已有可核對 evidence，要分析 cause／escape | 只有 symptom、沒有 timeline／evidence | 06 appendix／RCA evidence |

## Collision rules

- 「分析 ticket 是否可測」只走 Requirement Readiness；「根據 reviewed requirement 規劃 approach／gates」才進 02 Test Spec。
- API contract 缺欄位時，API Coverage Design 回報 Unknown，不自行轉成 Requirement Readiness 的第二份報告。
- Coverage Analysis 不替 Regression Selection 決定 skip；它只提供 gaps 與風險輸入。
- RCA 不回寫 Defect Triage 的 priority／owner，也不把相似症狀宣告為同一 root cause。

## Routing receipt

輸出記錄 selected playbook、matched trigger、rejected alternatives、input provenance 與 reviewer。若沒有明確 trigger，停止並回報 `Unknown`，不挑最接近的名稱硬跑。
