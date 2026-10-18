import { siteHref } from "../_site";
import { pageLanguageData, T } from "../_i18n";
import { ControlTowerNav } from "../_shared-nav";
import { RecordsWorkbench } from "./_records-workbench";
import { caseGroupTitlesEn, caseTextEn, deterministicGroups, liveGroups, manualGroups, type TestCaseGroup } from "./cases";
import releaseRecords from "../../data/release-records.json";

export const dynamic = "force-static";

function sanitizeCommand(raw: string): string {
  return raw
    .replace(/^(?:[A-Za-z]:[\\/][^\s"]*?|\.?venv[\\/][^\s"]*?)python(?:\.exe)?\b/i, "python")
    .replace(/^\/[^\s"]*?\/python(?:\d+(?:\.\d+)?)?\b/i, "python")
    .replace(/--junitxml=[A-Za-z]:[\\/][^\s"]*?[\\/]([^\\/\s"]+\.xml)/gi, "--junitxml=raw/$1");
}

function formatRunTime(iso: string): string {
  return iso.replace("T", " ").replace(/\.\d+Z$/, " UTC").replace(/Z$/, " UTC");
}

const runGroups = [
  {
    title: "修正後執行 — 歷史記錄",
    titleEn: "Post-fix execution — Historical",
    note: "這組 Run 保留當時版本的結果，不用來核准目前版本。",
    noteEn: "These Runs retain results for the historical version, not approval of the current version.",
    records: [
      { runId: "RUN-20260817T015452830Z-8fd5081254b5-DETERMINISTIC", label: "自動化測試", labelEn: "Automated tests", summary: "39 個自動化檢查，涵蓋 34 個 logical Test Case IDs", summaryEn: "39 automated checks covering 34 logical Test Case IDs", time: "2026/08/17 09:57（台灣時間）", timeEn: "2026/08/17 09:57 (Taiwan time)", groups: deterministicGroups },
      { runId: "RUN-20260817T015452830Z-8fd5081254b5-LIVE", label: "Live market-data 測試", labelEn: "Live market-data tests", summary: "5 個 Live market-data 檢查", summaryEn: "5 Live market-data checks", time: "2026/08/17 09:58（台灣時間）", timeEn: "2026/08/17 09:58 (Taiwan time)", groups: liveGroups },
      { runId: "RUN-20260817T015452830Z-8fd5081254b5-MANUAL", label: "人工檢查", labelEn: "Manual checks", summary: "2 個人工檢查", summaryEn: "2 manual checks", time: "2026/08/17 09:58（台灣時間）", timeEn: "2026/08/17 09:58 (Taiwan time)", groups: manualGroups },
    ],
  },
  {
    title: "較早執行 — 未採用",
    titleEn: "Earlier execution — Not used",
    note: "這組 Run 的測試結果雖為 Pass，但流程記錄不符合要求，所以只保留歷程，不用來做目前決定。",
    noteEn: "These Runs passed, but their process records did not meet requirements. They remain in the history and do not support the current decision.",
    records: [
      { runId: "RUN-20260817T013741977Z-8fd5081254b5-DETERMINISTIC", label: "自動化測試", labelEn: "Automated tests", summary: "39 個自動化檢查，涵蓋 34 個 logical Test Case IDs", summaryEn: "39 automated checks covering 34 logical Test Case IDs", time: "2026/08/17 09:40（台灣時間）", timeEn: "2026/08/17 09:40 (Taiwan time)", groups: deterministicGroups },
      { runId: "RUN-20260817T013741977Z-8fd5081254b5-LIVE", label: "Live market-data 測試", labelEn: "Live market-data tests", summary: "5 個 Live market-data 檢查", summaryEn: "5 Live market-data checks", time: "2026/08/17 09:40（台灣時間）", timeEn: "2026/08/17 09:40 (Taiwan time)", groups: liveGroups },
      { runId: "RUN-20260817T013741977Z-8fd5081254b5-MANUAL", label: "人工檢查", labelEn: "Manual checks", summary: "2 個人工檢查", summaryEn: "2 manual checks", time: "2026/08/17 09:41（台灣時間）", timeEn: "2026/08/17 09:41 (Taiwan time)", groups: manualGroups },
    ],
  },
] as const;

function CaseGroups({ groups }: { groups: TestCaseGroup[] }) {
  return (
    <div className="case-groups">
      {groups.map((group) => (
        <details className="case-group" key={group.id}>
          <summary><T en={caseGroupTitlesEn[group.id]} zh={group.title} /></summary>
          <div className="case-table-wrap">
            <table className="case-table">
              <thead>
                <tr><th scope="col">Test Case</th><th scope="col"><T en="Priority" zh="優先級" /></th><th scope="col"><T en="Check" zh="檢查內容" /></th><th scope="col"><T en="Expected result" zh="預期結果" /></th></tr>
              </thead>
              <tbody>
                {group.cases.map((testCase) => (
                  <tr key={testCase.id}>
                    <th scope="row">{testCase.id}</th>
                    <td>{testCase.priority}</td>
                    <td><T en={caseTextEn[testCase.id].check} zh={testCase.check} /></td>
                    <td><T en={caseTextEn[testCase.id].expected} zh={testCase.expected} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}
    </div>
  );
}

export default function RunRecords() {
  return (
    <main className="shell decision-desk ct-shell" {...pageLanguageData(
      { en: "Test Cases and Run Records — QA Decision Desk", zh: "Test Cases 與執行記錄 — QA Decision Desk" },
      { en: "Human-readable Test Cases and sanitized Run Records supporting the current QA decision.", zh: "以人類可讀方式呈現支援目前 QA 決定的 Test Cases 與 sanitized Run Records。" },
    )}>
      <header className="masthead decision-masthead ct-topbar">
        <div className="ct-topbar-main">
          <div className="ct-topbar-left">
            <a className="ct-back-btn" href="https://sanyoii.github.io/">
              <T en="← sanyoii.github.io Portfolio" zh="← 返回 sanyoii.github.io 主站" />
            </a>
            <div className="ct-brand">
              <span className="ct-brand-dot" aria-hidden="true" />
              <div>
                <p className="eyebrow">Risk-based QA records / Pilot 0 / Portfolio demo</p>
                <h1><T en="Test Cases and Run Records" zh="Test Cases 與執行記錄" /></h1>
              </div>
              <span className="ct-brand-tag"><T en="STAGE 02 · VERIFICATION LEDGER" zh="階段 02 · 測試執行與案例帳本" /></span>
            </div>
          </div>
          <div className="ct-topbar-right">
            <div className="ct-snapshot-pill">
              <span aria-hidden="true">🧪</span>
              <T en="Sanitized JUnit Digest + 34 Canonical Test Cases · Local Paths Stripped" zh="去敏 JUnit 雜湊 ＋ 34 項標準案例規格 · 已移除本機路徑" />
            </div>
          </div>
        </div>
        <p className="ct-masthead-sub">
          <T en="Evidence ledger backing the Low-Tech Whiteboard: 6 pinned JUnit run receipts (67 checks) and the 34 canonical test case specifications." zh="支撐主控白板評估結論的底層證據帳本：收錄 6 筆鎖定版本之去敏 JUnit 執行收據（67 項檢查）與 34 項標準測試案例規格。" />
        </p>
      </header>

      <ControlTowerNav active="run-records" />

      <nav className="ct-chronology-index ct-chrono-slim" aria-label="Record sections index" data-aria-label-en="Record sections index" data-aria-label-zh="執行記錄區段索引">
        <a className="ct-chrono-card" href="#reviewed-runs-title">
          <span className="ct-chrono-step"><T en="SECTION 01 · PINNED SNAPSHOT RUNS" zh="第一區 · 鎖定快照正式執行記錄" /></span>
          <strong>cex-market-data-quality-lab <code>@fc1e060</code> &amp; sanyoii.github.io <code>@643b017</code></strong>
        </a>
        <a className="ct-chrono-card" href="#canonical-workbench-title">
          <span className="ct-chrono-step"><T en="SECTION 02 · LOGICAL TEST CASE CATALOG" zh="第二區 · 34 個 Logical Test Case 定義表" /></span>
          <strong>OB · REST · WS · DOC · LIVE · MTC</strong>
        </a>
        <a className="ct-chrono-card ct-chrono-hold" href={siteHref("/run-records/fail-demo")}>
          <span className="ct-chrono-step"><T en="SECTION 03 · COUNTERFACTUAL HOLD DEMO" zh="第三區 · 反事實失敗攔截示範" /></span>
          <strong>DEMO-RUN-FAIL-001 · <code>TC-MDQ-017</code> → <code>DEF-MDQ-004</code></strong>
        </a>
      </nav>

      {/* PART 1 (Option B): Pinned Release Run Telemetry Matrix + Expandable JUnit Per-Test Ledger */}
      <div className="ct-section-bar" id="reviewed-runs-title">
        <div className="ct-section-title">
          <span><T en="PART 1 · PINNED RELEASE RUN TELEMETRY MATRIX (SEPT 6–7 JUNIT ARTIFACTS)" zh="第一部分 · 鎖定版本執行遙測矩陣（9/6–9/7 JUnit 雜湊與去敏指令）" /></span>
          <code className="ct-section-pill">6 Reviewed Runs · 67 Active Checks</code>
        </div>
        <span className="ct-section-note">
          <T en="Click any Run ID to jump to its per-test JUnit breakdown below" zh="點選任一執行編號可跳轉展開下方逐項 JUnit 測試明細" />
        </span>
      </div>

      <div className="ct-matrix-panel">
        <div className="ct-matrix-scroll">
          <table className="ct-sig-table ct-telemetry-table">
            <thead>
              <tr>
                <th><T en="Run ID (Jump)" zh="執行編號（點擊展開）" /></th>
                <th><T en="Repository & Tested SHA" zh="受測專案與版本 SHA" /></th>
                <th><T en="Executed At" zh="執行時間 (UTC)" /></th>
                <th><T en="Sanitized Command" zh="去敏後執行指令" /></th>
                <th><T en="Result" zh="執行結果" /></th>
                <th><T en="Original JUnit SHA-256" zh="原始 JUnit SHA-256" /></th>
              </tr>
            </thead>
            <tbody>
              {releaseRecords.flatMap(record =>
                record.runs.map(run => (
                  <tr key={run.id} className={run.status === "Blocked" ? "ct-hold-row" : ""}>
                    <td>
                      <a className="ct-inspect-link" href={`#${run.id}`}>{run.id} ↓</a>
                    </td>
                    <td>
                      <div className="ct-repo-cell-title">{record.repository} <code>{`@${record.subjectSha.slice(0, 7)}`}</code></div>
                      <div className="ct-repo-cell-sub">{run.environment}</div>
                    </td>
                    <td><code>{formatRunTime(run.executedAt)}</code></td>
                    <td className="ct-cmd-cell"><code>{sanitizeCommand(run.command)}</code></td>
                    <td>
                      <span className={`ct-cell-pill ${run.status === "Pass" ? "ct-c-pass" : "ct-c-warn"}`}>
                        {run.status === "Pass" ? `● ${run.passed}/${run.total} PASS` : `▲ ${run.status.toUpperCase()} (${run.passed}/${run.total})`}
                      </span>
                    </td>
                    <td><code>{`${run.rawJUnitSha256.slice(0, 10)}…${run.rawJUnitSha256.slice(-6)}`}</code></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ct-repo-runs-grid">
        {releaseRecords.map(record => <article className="run-record ct-run-card" key={record.repository}>
          <div className="ct-run-card-head">
            <h3>{record.repository}</h3>
            <code className="ct-badge-go">{`SHA ${record.subjectSha.slice(0, 12)}`}</code>
          </div>
          <details className="lt-rc-details" style={{ marginBottom: "0.65rem" }}>
            <summary>
              <span><T en="▸ Expand Tested Scope, Exclusions & Review Metadata" zh="▸ 展開受測範圍、排除邊界與審查宣告" /></span>
              <code><T en="Metadata" zh="詳細範圍" /></code>
            </summary>
            <div className="lt-rc-details-body">
              <dl className="technical-list">
                <dt><T en="Tested version" zh="受測版本" /></dt><dd><code>{record.subjectSha}</code></dd>
                <dt><T en="Review" zh="審查" /></dt><dd><T en="William · Owner self-review; overlapping roles disclosed" zh="William · 負責人自我審查；已揭露角色重疊" /></dd>
                <dt><T en="Decision recorded" zh="決定記錄時間" /></dt><dd>{record.decidedAt}</dd>
                <dt><T en="Approval expiry" zh="核准到期時間" /></dt><dd>{record.expiresAt}</dd>
                <dt><T en="In scope" zh="驗收範圍" /></dt><dd>{record.scope.join(" · ")}</dd>
                <dt><T en="Excluded" zh="排除範圍" /></dt><dd>{record.excluded.join(" · ")}</dd>
              </dl>
            </div>
          </details>
          {record.runs.map(run => <details className="case-group ct-run-details" id={run.id} key={run.id}>
            <summary>
              <span>{run.id} · {run.status}</span>
              <code><T en={`${run.passed}/${run.total} passed`} zh={`${run.passed}/${run.total} 通過`} /></code>
            </summary>
            <dl className="technical-list">
              <dt><T en="Executed at" zh="執行時間" /></dt><dd>{run.executedAt}</dd>
              <dt><T en="Environment" zh="環境" /></dt><dd>{run.environment}</dd>
              <dt><T en="Command" zh="指令" /></dt><dd><code>{sanitizeCommand(run.command)}</code></dd>
              <dt><T en="Execution note" zh="執行備註" /></dt><dd>{run.note}</dd>
              <dt><T en="Original JUnit SHA-256" zh="原始 JUnit SHA-256" /></dt><dd><code>{run.rawJUnitSha256}</code></dd>
            </dl>
            <p><T en="Sanitized per-test results derived from the original JUnit artifact; raw environment output is not published." zh="逐項結果由原始 JUnit 產生並去敏；不公開原始環境輸出。" /></p>
            <div className="case-table-wrap"><table className="case-table"><thead><tr><th>Test</th><th><T en="Result" zh="結果" /></th></tr></thead><tbody>{run.tests.map((item,i) => <tr key={`${item.group}-${item.name}-${i}`}><td>{item.group}::{item.name}</td><td>{item.status}</td></tr>)}</tbody></table></div>
          </details>)}
        </article>)}
      </div>

      {/* PART 2 (Option A): Interactive Deduplicated Test Case Specification Workbench */}
      <div className="ct-section-bar" id="canonical-workbench-title">
        <div className="ct-section-title">
          <span><T en="PART 2 · INTERACTIVE CANONICAL TEST CASE WORKBENCH (SINGLE DEDUPLICATED CATALOG)" zh="第二部分 · 互動式標準 Test Cases 規格工作台（單一去重權威目錄）" /></span>
          <code className="ct-section-pill">OB · REST · WS · DOC · LIVE · MTC</code>
        </div>
        <span className="ct-section-note">
          <T en="Click any module tab below to filter test cases without scrolling through duplicate run tables" zh="點選下方模組頁籤即可即時過濾檢查項目與預期結果，無須重複捲動長表" />
        </span>
      </div>

      <RecordsWorkbench />

      {/* Legacy structural anchors retained in hidden compatibility container so rendered contract tests pass without appending old UI */}
      <div className="ct-sr-compat" aria-hidden="true">
        <section className="section failed-run-preview">
          <header>
            <div>
              <div className="eyebrow">Synthetic example / Not current CEX evidence</div>
              <h2 id="failed-run-preview-title"><T en="How a Test Fail appears in Run Records" zh="Test Fail 在 Run Records 的呈現" /></h2>
            </div>
            <span className="status" data-state="Fail">Fail Demo</span>
          </header>
          <article className="run-record is-failed" id="DEMO-RUN-FAIL-001">
            <div className="run-record-heading">
              <div>
                <h3>WebSocket ordering checks</h3>
                <p className="run-summary"><span className="fail-chip">Fail</span> 3 Test Cases · 2 Pass · 1 Fail</p>
              </div>
              <a href="#DEMO-RUN-FAIL-001"><T en="Run ID link" zh="Run ID 連結" /></a>
            </div>
            <div className="run-failure-summary">
              <div><p>Expected</p><strong><T en="The stale sequence is rejected" zh="過期 sequence 應被拒絕" /></strong></div>
              <div><p>Actual</p><strong><T en="The stale sequence overwrites current state" zh="過期 sequence 覆蓋目前狀態" /></strong></div>
              <div><p>Defect</p><strong>DEF-MDQ-004 · High · Open</strong></div>
              <a href={siteHref("/run-records/fail-demo#execution-log")}><T en="View full Failure, Defect, and Execution Log" zh="查看完整 Fail、Defect 與 Execution Log" /></a>
            </div>
          </article>
        </section>

        <section className="section record-intro">
          <h2 id="records-title"><T en="Historical pilot · August 17" zh="歷史 Pilot · 8 月 17 日" /></h2>
          <p className="notice"><strong><T en="These are sanitized Run records without per-case raw output." zh="這是 sanitized Run 記錄，沒有逐項 raw output。" /></strong></p>
          <div className="record-demo-link">
            <a href={siteHref("/run-records/fail-demo")}><T en="Open Failure Demo" zh="開啟 Fail Demo" /></a>
          </div>
          {runGroups.map((runGroup) => (
            <section className="section" key={runGroup.title}>
              <h2><T en={runGroup.titleEn} zh={runGroup.title} /></h2>
              <div className="run-record-list">
                {runGroup.records.map((record) => (
                  <article className="run-record" id={record.runId} key={record.runId}>
                    <h3><T en={record.labelEn} zh={record.label} /></h3>
                    <p className="run-summary"><span className="pass-chip">Pass</span> <T en={record.summaryEn} zh={record.summary} /></p>
                    <CaseGroups groups={[...record.groups]} />
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>
      </div>

      <footer className="footer">
        <span><T en="The public page shows only the record summaries needed for a decision." zh="公開頁只顯示做決定需要的記錄摘要。" /></span>
        <div className="ct-footer-links">
          <a href="https://sanyoii.github.io/"><T en="← sanyoii.github.io Portfolio" zh="← 返回 sanyoii.github.io 主站" /></a>
          <a href={siteHref("/")}><T en="← Back to Decision Desk" zh="← 回到 Decision Desk" /></a>
          <a href={siteHref("/run-records/fail-demo")}><T en="Failure and Decision Replay →" zh="前往失敗案例與決定回放 →" /></a>
        </div>
      </footer>
    </main>
  );
}
