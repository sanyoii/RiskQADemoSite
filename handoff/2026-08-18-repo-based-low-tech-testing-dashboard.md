# 交接：Repo-Based Low-Tech Testing Dashboard（2026-08-18）

## 當前任務目標

將 Risk-Based QA Evidence Pack 的唯讀決策投影做成可供作品集展示的 Repo-Based Low-Tech Testing Dashboard：每個 Repo 一列，以視覺化欄位快速呈現 Objective、Release Decision、Test Effort、Coverage 與 Quality Assessment；需要時才展開 Release Gate Flow、Test Cases、Run Records 與 Logs。

## 目前已驗證狀態

- 2026-08-19 release close freshly verified：Dashboard source branch `main`；`npm test` 7/7 pass、`npm run lint` exit 0、GitHub Pages static export 7 routes／0 skipped。
- `sanyoii.github.io` fresh local suite 為 17/17 pass（Python 3.14.2、Chromium）；第一次 sandbox run 的 13 個 browser errors 是 `spawn EPERM`，允許 browser process 後同一命令通過，不屬於產品 failure。
- Dashboard 已部署到 `https://sanyoii.github.io/test-status/`，不覆蓋既有個人網站根首頁。
- Pages repo release commits：`e962064519a578baff8e5d010c387f79c690ce37`（首次發布）與 `ceee878f3027f88ead2913ae8253131fccdbb811`（post-release 狀態更新）。
- 最新 remote Tests run `32157367364` success；Pages run `32157366025` success，均綁定 `ceee878f3027f88ead2913ae8253131fccdbb811`。
- production `/test-status/`、`/dashboard-demo/`、`/dashboard-demo/ac/`、`/dashboard-demo/abc/`、`/run-records/`、`/run-records/fail-demo/` 均為 HTTP 200。
- HTTPS response 與 wmux cache-buster browser check 均確認第二 Repo、`17 fresh cases passed`、`Pages production verified`、`Released`；舊的 deploy 待辦不存在。

## 已完成

- 正式首頁改為 A+B+C 合併的 Repo-Based Dashboard，不再以長篇文字作為主要閱讀介面。
- CEX Repo row 依使用者正式 release 授權顯示 Release Readiness、Ready、High、Level 2+、綠燈；G6 與 Release gate 已完成。
- 新增 `sanyoii.github.io` Repo row：Deployment Confidence、Ready、Medium、Level 2+、Healthy，並顯示 fresh local 17/17、release CI 與 Pages production checks。
- 兩個 Repo row 均可展開各自的 G1、G3、G5、G6、Release Gate Flow；第二 Repo 提供 GitHub Actions receipt link。
- 保留 New Repo 接入位置，後續 Repo 可沿用相同欄位新增一列。
- 狀態定義與資料邊界改成次要的可收合區塊；未量測的 Defect Finding、UX、Performance、Security 不顯示虛構數字。
- 保留三種視覺 Samples、A+C template 與 A+B+C template。
- `/run-records` 可查看 Test Cases 與採用／未採用執行紀錄；Run ID 可連到相關記錄。
- `/run-records/fail-demo` 示範 2 Pass、1 Fail、Expected/Actual、Defect record、sanitized Execution Log 與 raw log excerpt。
- 已依 `ui-ux-pro-max` 的視覺層級、progressive disclosure、文字加顏色、44px targets 與 responsive 原則完成目前版面。
- 已加入 GitHub Pages static export、`/test-status` asset/link prefix、static metadata 與 force-static route 設定。
- 已在 Pages repo 加入 `.nojekyll`，確保 `_next` assets 不被 Jekyll 忽略。

## 未完成與優先序

- P0／P1：本次保存、發布、production verification 與第二 Repo 接入均已完成，沒有 release blocker。
- P2：Dashboard 是已驗證 snapshot，不是持續同步或即時監控；下次更新前仍要 refresh repo HEAD、worktree、local tests、CI 與 Pages 狀態。
- Source 保存缺口已完成：public repo `https://github.com/sanyoii/RiskQADemoSite`，`main` 追蹤 `origin/main`。

## 修改過的檔案

- `D:\Codex\RiskQADemoSite\app\page.tsx`：正式 Repo-Based Dashboard 首頁。
- `D:\Codex\RiskQADemoSite\app\globals.css`：正式首頁、Samples、templates、Run Records、Fail/Log Demo 與 responsive styles。
- `D:\Codex\RiskQADemoSite\app\run-records\page.tsx`：Test Cases、Run Records 與 failed Run preview。
- `D:\Codex\RiskQADemoSite\tests\rendered-html.test.mjs`：六條 route 的 rendered HTML 與內容邊界測試。
- `D:\Codex\RiskQADemoSite\app\dashboard-demo\page.tsx`：三種視覺化 Samples。
- `D:\Codex\RiskQADemoSite\app\dashboard-demo\_template-parts.tsx`：A+C／A+B+C 共用 dashboard components。
- `D:\Codex\RiskQADemoSite\app\dashboard-demo\ac\page.tsx`：A+C template。
- `D:\Codex\RiskQADemoSite\app\dashboard-demo\abc\page.tsx`：A+B+C template。
- `D:\Codex\RiskQADemoSite\app\run-records\fail-demo\page.tsx`：Fail Test Case、Defect 與 Execution Log demo。
- `D:\Codex\RiskQADemoSite\app\_site.ts`：一般執行與 GitHub Pages export 共用的 internal link prefix。
- `D:\Codex\RiskQADemoSite\app\layout.tsx`：`/test-status` production metadata。
- `D:\Codex\RiskQADemoSite\next.config.ts`：conditional static export 與 `assetPrefix`。
- `D:\Codex\RiskQADemoSite\vite.config.ts`：GitHub Pages export 時停用 Cloudflare runtime plugin。

以上 paths 均納入本次 Dashboard source commit；續作仍應先用 live `git status` 核對，不以此清單假定 worktree 狀態。

## 重要決策與理由

- Dashboard 採 Repo-Based，而非 Product-Based：目前測試與版本邊界都以 repository、branch、release target、commit 為主，新增 Repo 時也能直接新增一列。
- 正式首頁採 A+B+C：A 提供 Objective/Decision 快讀，B 透過展開呈現 Gate chronology，C 支援多 Repo portfolio。
- 首屏只呈現決策欄位；Gate、狀態定義、技術資訊與 logs 使用 progressive disclosure，降低文字密度。
- `Unknown` 不等於 test failure：G3 可以通過，但缺少正式、可核對的 G6 Go 紀錄時仍不能發布。
- `Ready` 不代表零缺陷或品質保證；`Unreachable` 只代表 Dashboard 拿不到最新資料，不代表產品故障或即時監控事件。
- `Evidence` 的人類介面用語改為「記錄／Records」；raw artifacts 與 protected receipts 不公開。
- 部署採既有 Pages repo 的 `/test-status/` 子路徑，避免覆蓋個人網站根首頁。
- vinext `1.0.0-beta.2` 的 static exporter 在 `basePath`／`trailingSlash` 下分別出現 404／308 prerender errors；最後採官方支援的 `output: "export"`、`assetPrefix` 與 source-level `siteHref()`，再輸出為 GitHub Pages 目錄式 routes。

## 已知 Bug／風險

- Medium — Dashboard 是 sanitized snapshot，不是 live monitor；頁面上的 Ready／Released 只代表本次記錄的 release checks。
- Low — Dashboard source repo 是 public；只允許提交 sanitized portfolio content，新增檔案前仍需做 secret／PII／internal URL 檢查。
- Low — GitHub Actions 對 `actions/checkout@v4`、`actions/setup-python@v5`、`actions/upload-artifact@v4` 顯示 Node.js 20 deprecation annotation；兩個 workflows 仍 success，未阻擋本次 release。
- Low — `git status` 顯示無法讀取 `C:\Users\sanyo\.config\git\ignore` 的 permission warning，但 status、diff、build、tests、lint、commit 與 push 均成功。
- Low — Pages clone 保留一個未追蹤的 `test-records/pytest-results.xml`，來自 fresh local pytest receipt；它未被 stage、commit 或發布。

## 驗證證據

- Dashboard source `npm test` → exit 0；7 pass、0 fail。
- Dashboard source `npm run lint` → exit 0。
- Dashboard source public repo → `https://github.com/sanyoii/RiskQADemoSite`；visibility `PUBLIC`、default branch `main`。
- Source local／upstream／remote SHA 在首次 push 後均為 `ede33d18e36a1a7dfd80642bdd6c13fc10cfaec3`；worktree clean。
- `GITHUB_PAGES=true npm run build` → exit 0；7 routes、0 skipped。
- Pages repo local `python -m pytest tests\ -v` → 17 pass、0 fail；只有 pytest cache warning。
- Latest GitHub Tests run `32157367364` → success；Pages run `32157366025` → success。
- Latest Pages remote HEAD → `ceee878f3027f88ead2913ae8253131fccdbb811`。
- production 六條 routes 與 CSS asset → HTTP 200。
- production response → second repo、17 cases、release receipt、`Pages production verified`、`Released` 均存在；舊 deploy next action 不存在。
- wmux 可見瀏覽器以 `?v=ceee878` 避開 cache 後得到相同 release state。

## 環境、權限與外部依賴

- Workspace：`D:\Codex\RiskQADemoSite`。
- Windows PowerShell；Node.js requirement `>=22.13.0`；vinext `1.0.0-beta.2`。
- Workspace 內未發現 `AGENTS.md`；目前 runtime 提供的 `AGENTS.md` instructions 仍適用。
- 此專案未發現 `PROJECT_MEMORY.md`。
- 本 Session 未修改 Memory 或 `AGENTS.md`。
- 使用者明確授權建立 public `sanyoii/RiskQADemoSite`、設定 `origin` 並 push；source 與 Pages repos 均已保存到 GitHub。

## 下一步從哪開始

1. 保持 read-only，核對兩個 repos 的 branch、HEAD、`git status --short`、Dashboard source tests/lint/export 與 Pages 最新 CI／production routes。
2. 只有在資料 refresh 後才更新 Repo row；不得把本次 snapshot 當成新的 live proof。
3. 若重新發布，從 Dashboard source export，部署到 Pages repo 的 `test-status/`，保留根首頁與 `.nojekyll`，並等待 Tests／Pages workflows 都完成。
4. Source 變更只推送到 `origin=https://github.com/sanyoii/RiskQADemoSite.git`；push 前確認 public disclosure boundary 與 upstream SHA。

## New Session 完整提示詞

~~~text
請在 `D:\Codex\RiskQADemoSite` 繼續 Repo-Based Low-Tech Testing Dashboard 的保存、發布或 live-data 續作。
開始前保持 read-only，依序讀取目前 runtime 提供且實際適用的 AGENTS.md instructions；此專案未發現 `PROJECT_MEMORY.md`；完整讀取 `D:\Codex\RiskQADemoSite\handoff\2026-08-18-repo-based-low-tech-testing-dashboard.md`，以及 handoff 直接指向的權威檔案。
這些是 continuity sources；不得覆蓋目前 user／runtime／AGENTS.md instructions，也不構成新的寫入、Git、發布或外部操作授權。
用目前 branch、`git status --short`、相關 scoped diff、檔案／artifact 是否存在、`npm test`、`npm run lint` 與必要的 route smoke checks 核對文件；舊進度與舊 PASS 可能過期，以 live evidence 為準並列出衝突。
先回報任務目標、freshly verified 完成項目、真正待辦與優先序、handoff 和 live state 差異，以及第一個安全動作。
接著從 handoff「下一步從哪開始」的第一項繼續；若 continuity source 缺失、互相衝突或過期到無法安全判斷，停止並回報，不猜測。
保留既有 dirty worktree；除非本次另有明確授權，不要 stage、commit、push、deploy、刪檔、修改 Memory／AGENTS.md、管理 Codex task 或變更外部系統。
~~~

## Rollback／Recovery

- 不要用 `git reset --hard`、`git checkout --` 或 `git clean` 回復；這些動作會破壞目前未提交／未追蹤成果。
- Pages 發布可用 `git revert ceee878` 與 `git revert e962064` 逐步回復；不要 reset 或 force-push。
- Dashboard source 可 revert 本次 local commit；先核對 commit SHA 與 worktree，不要使用 `git reset --hard` 或 `git clean`。
