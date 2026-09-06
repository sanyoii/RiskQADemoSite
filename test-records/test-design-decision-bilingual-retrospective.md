# Bilingual navigation and fail-result Test Design Decision pilot

## Review state

- Pilot type：`retrospective`
- Review state：`needs-review`
- Reviewer：`unassigned`
- Decision authority：human reviewer；本文件不會自行把 release 判為 Ready
- Pilot date：2026-08-25

這份 pilot 用已發生的中英切換、GitHub Pages 導覽與 Fail Demo 文字 overlap 變更，檢查 Test Design Decision 是否能補足既有 Test Spec／Test Case 的方法選擇與 oracle traceability。它不是事前證據，不能宣稱這套流程原本一定能防止 overlap。

## Subject and provenance

| Field | Value |
|---|---|
| Repository | `sanyoii/RiskQADemoSite` |
| Branch | `codex/fix-navigation-bilingual` |
| Bilingual／navigation SHA | `254202785f52e112778a5fa51bdd113af390c476` |
| Overlap fix SHA | `e90bafca187c076db1e6ceaf5e79b57ce850c934` |
| Production projection | `https://sanyoii.github.io/test-status/` |
| Requirement source | User acceptance request in the implementation conversation；not stored as a repository-local approved requirement |
| Durable implementation evidence | Commits、`tests/rendered-html.test.mjs`、GitHub Actions run URLs |
| Worktree state during pilot | `dirty` — scoped template contract and this pilot record only |

## Requirement readiness

| Requirement | Readiness | Oracle status | Gap |
|---|---|---|---|
| 首頁的 Test Cases／Run Records、Failure Demo 與 Design Samples 連結可進入目標頁 | Ready for characterization | User-reported intent＋deployed route behavior | 沒有 repo-local approved AC 定義 browser history、fragment 與 direct-load 全部行為 |
| 所有公開頁面可像 Portfolio 一樣切換 EN／中，並保存選擇 | Partially ready | User-reported intent；Portfolio contract is external to this repo | 「像 Portfolio 一樣」沒有 versioned contract；translation quality acceptance 尚未逐頁核准 |
| Fail Demo 的狀態文字不 overlap | Partially ready | User-provided screenshot＋human visual judgment | 未定義 viewport、zoom、font fallback 與最長文案邊界 |

未有核准來源的行為不得由模型補完；本 pilot 對這些項目使用 `Assumption` 或 `Unknown／needs-clarification`。

## Test design decisions

| Target risk／failure mode | Spec characteristic | Observability／environment constraint | Selected technique | Technique parameters | Oracle／source | Coverage claim | Exclusions／residual risk | Reviewer |
|---|---|---|---|---|---|---|---|---|
| GitHub Pages project base path 或 trailing slash 使首頁連結落到錯誤位置／404 | 6 個 public routes、1 個 404 route、project-site base path | Static export 與 server render 可檢查 href；真實 browser navigation 需 production | Route equivalence partition＋navigation contract matrix | `/`、`/dashboard-demo`、`/dashboard-demo/ac`、`/dashboard-demo/abc`、`/run-records`、`/run-records/fail-demo`、`/missing-page`；檢查目標 href 與 status | User-reported broken navigation；`app/_site.ts`；GitHub Pages project URL | Automated rendered contract covers declared routes、404 與主要 cross-page href | Browser back／forward、fragment scrolling、offline cache、非列舉 deep link 未完整覆蓋 | `needs-review` |
| 某些頁面或 metadata 只有單一語言，造成不一致 | Route × language state | Server output 可檢查雙語 payload；翻譯自然度仍需 human review | Coverage matrix＋contract assertions | 6 public routes＋404；`data-en`／`data-zh`、title、description、toggle presence | User request；`app/_i18n.tsx`、page metadata contracts | Automated rendered contract proves every declared route carries EN／ZH switch data | 不證明每句翻譯語意正確、品牌語氣一致或動態資料未來仍完整 | `needs-review` |
| `wl-lang` 沒保存、reload 後語言退回或 `html lang`／metadata 不同步 | Client state transition | SSR test 不會執行 browser storage／reload；production observation 可見但不取代 automated E2E | State-transition testing | default EN → switch ZH → reload → persisted ZH → switch EN；同步 `html lang`、title、description、aria-label | User request；`app/_language-toggle.tsx` behavior；current implementation as characterization evidence | Source contract and prior manual production observation provide partial evidence | 沒有 durable browser E2E artifact；storage disabled、multi-tab、private mode 保持 `Unknown` | `needs-review` |
| Localized status label 被 icon 尺寸規則壓成窄欄並逐字換行 | Direct-child selector 同時命中 icon span 與 text span；localized text length varies | CSS selector可 deterministic 檢查；真實字型排版需 viewport visual check | Cause-effect analysis＋boundary／responsive visual check | selector scope；EN／ZH labels；既有 1900×931 local 與 1280×720 production observations | User screenshot；CSS layout intent；human-readable label must remain separate from icon | Regression assertion proves icon sizing只套用 `span[aria-hidden="true"]`；先前 desktop observations未見 overlap | 不能回溯宣稱事前必抓到；mobile、200% zoom、font fallback、未來更長文案未 fresh 驗證 | `needs-review` |
| 技術 assertions 全綠但 expected result 沒有來源，導致錯把 current behavior 當規格 | Expected result 跨 user intent、code contract 與 visual judgment | User conversation不是 durable requirement repository | Oracle hierarchy＋review gate | approved AC → approved contract → reviewed domain decision → characterization → `Assumption` → `Unknown` | QA template contract v0.2.0 | 新模板要求每個 Case 指回 Design decision、Selected technique 與 Oracle／source | 本 retrospective 尚無獨立 reviewer，也未補建正式產品 AC | `needs-review` |

## Testability and observability gaps

- Browser persistence、reload、`html lang`、title／description 的同步，目前缺少可保存 artifact 的 E2E run。
- CSS contract 能防止已知 broad selector 回歸，但無法證明所有 viewport、zoom、OS font rendering 都不 overlap。
- User-provided screenshot 是 defect evidence，但來源在對話附件，尚未複製進 repository；公開前需確認是否適合保存。
- Production observation 只能證明當時看到的狀態；它不是 approved oracle，也不是持續監控。

## Existing execution evidence

| Evidence | State | Scope／limitation |
|---|---|---|
| Commit `254202785f52e112778a5fa51bdd113af390c476` | Implemented | Bilingual payload、language toggle、site href routing、404 與 rendered tests |
| Commit `e90bafca187c076db1e6ceaf5e79b57ce850c934` | Implemented | Fail-result selector correction與 regression assertion |
| `tests/rendered-html.test.mjs` | Reproducible local contract | 6 public routes＋404、主要 href、bilingual markers、known CSS selector regression；不執行完整 browser interaction |
| [Source CI run 32324820538](https://github.com/sanyoii/RiskQADemoSite/actions/runs/32324820538) | Prior evidence；not rerun by this pilot | 先前工作階段記錄為 success；本輪 `gh` 因 local config 權限無法重新查詢 |
| [Pages run 32325015085](https://github.com/sanyoii/test-status/actions/runs/32325015085) | Prior evidence；not rerun by this pilot | 先前工作階段記錄為 success；本輪未重新部署 |
| Production visual observations | Prior manual evidence | EN／ZH desktop states曾人工檢查；沒有納入 repo 的 screenshot artifact，不延伸宣稱 mobile coverage |

## Defect feedback

Fail Demo 的 broad selector `.fail-result > span` 同時限制 icon span 與 localized text span 的 `width`／`height`，使 `Do not release` 被壓到 icon 寬度後逐字換行。修正將 icon sizing限縮到 `.fail-result > span[aria-hidden="true"]`，並加入 source-level regression assertion。

這項 defect 會改變未來 design decision：凡是 icon＋localized label 的 component，除了檢查 selector scope，也要依文案長度、viewport 與 zoom 選 representative boundary。這是 retrospective learning，不是「新流程原本必然能防止 defect」的證明。

## Stopping rule

只有在以下條件成立後，這個 pilot 才可由 `needs-review` 升級：

1. Human reviewer 能把每個 Selected technique 指回 risk／failure mode、規格特徵與環境限制。
2. Expected result 有 approved Oracle／source，或明確維持 `Assumption`／`Unknown`。
3. Reviewer 接受 Coverage claim 與 Exclusions／residual risk 的界線。
4. 至少新增一筆可保存的 browser state-transition evidence，或正式接受該缺口。
5. 後續 Run／Defect／production finding 已回饋到 design decision，而非只增加案例數。

## Pilot decision

Test Design Decision 欄位值得併入既有 02 Test Spec 與 04 Test Case，因為它補上目前模板未明示的 technique rationale、oracle、coverage claim、residual risk 與 feedback loop；不需要新增 Dashboard page、Playbook、status schema 或第十個核心模板。

本文件維持 `needs-review`。它證明的是 traceability 結構已能表達這次案例，不是 production certification，也不是 release approval。
