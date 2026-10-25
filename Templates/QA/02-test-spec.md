---
type: test-spec
templateVersion: 0.3.0
status: draft
specId:
repository:
releaseTarget:
candidateSha:
riskTier:
qaOwner:
reviewer:
publicDisclosure: internal
tags:
  - qa
  - test-strategy
---

# Test Spec

> 定義這次如何取得足以支援 release decision 的 evidence。測試數量本身不能代表 coverage 或 Ready。

## Purpose and decision

- Purpose：
- Decision to support：
- Risk tier：

## Subject

| Field | Value |
|---|---|
| Repository | |
| Release／tag | |
| Branch | |
| Full SHA | |
| Environment | |
| Worktree state | |

## Scope

### Tested scope

- <!-- fill in -->

### Out of scope

- <!-- fill in -->

## Coverage design

| Product Area | Related risk | Target coverage | Test type | Approach | Evidence output | Owner |
|---|---|---|---|---|---|---|
| | | | Functional / Non-Functional / Change-related | automated / manual / exploratory / inspection / live | | |

## Test design decisions

> 先用 risk／failure mode、規格特徵及可觀察性限制選擇 technique，再由 human reviewer 核准。不要用案例數量代替 coverage，也不要讓模型補完未定義的 expected behavior。

| Target risk／failure mode | Spec characteristic | Observability／environment constraint | Selected technique | Technique parameters | Oracle／source | Coverage claim | Exclusions／residual risk | Reviewer |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

### Oracle and testability rules

- Oracle hierarchy：approved requirement／AC → approved business rule／API or schema contract → reviewed domain decision → current behavior as characterization evidence → `Assumption` → `Unknown／needs-clarification`。
- Observability／testability gap：<!-- UI, API response, event, log, database state or external side effect that cannot be observed or controlled -->
- Test data／dependency constraint：
- Stopping rule：<!-- the risk-based condition that ends design or execution; not a target number of cases -->
- Run／Defect／Escape feedback：<!-- how later evidence will confirm or revise technique, parameters, coverage claim and residual risk -->

## Entry, suspension and exit

### Entry criteria

每個案例／批次在產品操作前核對：版本、帳號／角色、功能、判準、資料與隔離、觀察方式、停止條件、證據位置、費用／點數及操作授權。缺必要前提時，選定案例可直接記 Blocked，保存原因與恢復條件；不必先操作產品才算阻塞。

- 本批核對結果／來源／責任人：

### Suspension criteria

- <!-- fill in -->

### Resumption criteria

- <!-- fill in -->

### Exit criteria

1. 約定關鍵路徑完成必要步驟與檢查點，具備本次版本／環境的有效證據。
2. 沒有未解決 S1；S2 已修復並完成必要重測／回歸，或有權人明確接受延期，記理由、責任人與重評日期。
3. Requirement ↔ Risk ↔ Scenario ↔ Case／version ↔ Run ↔ Defect 沒有未解釋缺口。

說明未測原因不代表完成關鍵路徑。停止工作、交付階段報告、測試結束與批准上線分開。未解決的剩餘缺陷／已接受風險仍列 At Risk，不變成無條件 Ready。

## Environment, data and dependencies

- Environment／versions：
- Test data identity／generation：
- External dependencies：
- Observability／health checks：
- Secrets／PII handling：

## Execution plan

| Sequence | Test activity | Exact command／procedure source | Timebox | Executor | Expected artifact |
|---|---|---|---|---|---|
| 1 | | | | | |

## Evidence handling

- Artifact root：
- Retention：
- Hash／integrity method：
- Reviewer method：
- Evidence accessibility check：

## Defects, reruns and exceptions

- Defect triage rule：
- Retest rule：修正後新增 Run 重測失敗案例，並加跑同模型元素／同風險的回歸；原 Fail 保留。
- Regression rule：
- Retry／flakiness rule：
- Waiver／override authority：
- Escalation path：

## Roles and schedule

| Role | Person／system | Responsibility | Role overlap disclosed |
|---|---|---|---|
| QA owner | | | |
| Test executor | | | |
| Reviewer | | | |
| Decision owner | | | |

## Known limitations

- 本次 evidence 不會證明：
- 未執行範圍對 decision 的影響：
- Resource limitations：

## Approval

- Review outcome：`approved` / `changes-required` / `blocked`
- Approved by：
- Approved at：


## Shared data contract and revision

適用數值／報表測試時，定義一份共用資料契約；不適用寫理由。

| Contract ID／version／approval | Source／snapshot | Unit／period／currency | as-of／timezone／retrieved at | Formula | Missing／zero | Precision／rounding | Tolerance and source |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

Case 引用契約版本及條款，仍列自身具體輸入與可重算的預期值。絕對、相對與百分點容差分開；不能自行編造容差或把缺值當零。

| Change／question ID | Old → new source／criteria version | Affected cases／Runs | Return stage | Rerun／review and recovery condition |
|---|---|---|---|---|
| | | | | |

來源改版保留舊判準與 Run；新解讀另記分析，不改寫原 Pass／Fail。後續機器證據包用 `--previous`／registry `previousReleaseEvidence` 比對，受影響必要案例必須追加新 Run。

## Review disagreement and AI use

設計覆核檢查來源、風險與案例；結果覆核先看原始判準、案例版本及證據，再比較作者結論。記錄同人／同上下文自查，不能稱為獨立覆核。分歧保留雙方主張、來源、影響 ID、裁決人與時間；未解決前停止受影響結論的升級，恢復須有裁決及必要重測。

AI 輔助採 [Playbook review and recovery](../../Playbooks/QA/playbook-contract.md#review-and-recovery)。生成案例查來源、遺漏、重複與步驟／資料一致性；自動化須正反例對照。AI judge 須人工核准標籤、校準集及獨立保留測試集，記誤報／漏報與限制。沒有量測不寫準確率。

AI 非確定性測試另記模型／服務、prompt／資料／評測版本、K 次、每次與彙整判準、不變條件／允許變異、停止及額度上限。每次輸出與結果都保留；未知版本明示，不能挑最好結果或用後來 Pass 抹去 Fail。
