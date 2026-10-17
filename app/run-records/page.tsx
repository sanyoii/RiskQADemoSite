import { siteHref } from "../_site";
import { pageLanguageData, T } from "../_i18n";
import { ControlTowerNav } from "../_shared-nav";
import { RecordsWorkbench } from "./_records-workbench";
import { caseGroupTitlesEn, caseTextEn, deterministicGroups, liveGroups, manualGroups, type TestCaseGroup } from "./cases";
import releaseRecords from "../../data/release-records.json";

export const dynamic = "force-static";

function sanitizeCommand(raw: string): string {
  return raw
    .replace(/^[A-Za-z]:\\[^\s"]*?python(?:\.exe)?\b/i, "python")
    .replace(/^\/[^\s"]*?\/python(?:\d+(?:\.\d+)?)?\b/i, "python");
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
          <T en="Part B Telemetry Matrix for Sept 6–7 pinned runs + Part A Interactive Workbench for the deduplicated test case catalog." zh="結合 B 版「9/6–9/7 鎖定執行遙測矩陣」與 A 版「互動式測試案例分類工作台」，消除重複表格與本機路徑外洩。" />
        </p>
      </header>

      <ControlTowerNav active="run-records" />

      <nav className="ct-chronology-index" aria-label="Record sections index" data-aria-label-en="Record sections index" data-aria-label-zh="執行記錄區段索引">
        <a className="ct-chrono-card" href="#reviewed-runs-title">
          <span className="ct-chrono-step"><T en="SECTION 01 · PINNED SNAPSHOT RUNS" zh="第一區 · 鎖定快照正式執行記錄" /></span>
          <strong>cex-market-data-quality-lab <code>@fc1e060</code> &amp; sanyoii.github.io <code>@643b017</code></strong>
          <small><T en="Sept 6–7 owner-reviewed runs (45/45 CEX Pass + 22/22 Portfolio Pass after 1 Blocked retry)" zh="9/6–9/7 負責人已審查之執行（45/45 CEX 通過 + 22/22 主站重跑通過）" /></small>
        </a>
        <a className="ct-chrono-card" href="#canonical-workbench-title">
          <span className="ct-chrono-step"><T en="SECTION 03 · LOGICAL TEST CASE CATALOG" zh="第二區 · 34 個 Logical Test Case 定義表" /></span>
          <strong>cex-market-data-quality-lab <code>@fc1e060 / @8fd5081</code></strong>
          <small><T en="Interactive filter workbench for OB, REST, WS, DOC, LIVE & MTC test specifications" zh="互動式篩選工作台（OB / REST / WS / DOC / LIVE / MTC 檢查內容與預期結果）" /></small>
        </a>
        <a className="ct-chrono-card ct-chrono-hold" href="#DEMO-RUN-FAIL-001">
          <span className="ct-chrono-step"><T en="SECTION 02 · COUNTERFACTUAL HOLD DEMO" zh="第三區 · 反事實失敗攔截示範" /></span>
          <strong>DEMO-RUN-FAIL-001 · <code>TC-MDQ-017</code> → <code>DEF-MDQ-004</code></strong>
          <small><T en="Synthetic P0 failure showing Expected vs. Actual and No-Go release impact" zh="合成 P0 失敗案例，展示 Expected vs. Actual 與 No-Go 攔截影響" /></small>
        </a>
      </nav>

      {/* PART 1 (Option B): Pinned Release Run Telemetry Matrix + Expandable JUnit Per-Test Ledger */}
      <div className="ct-section-bar">
        <div className="ct-section-title">
          <span><T en="PART 1 · PINNED RELEASE RUN TELEMETRY MATRIX (SEPT 6–7 JUNIT ARTIFACTS)" zh="第一部分 · 鎖定版本執行遙測矩陣（9/6–9/7 JUnit 雜湊與去敏指令）" /></span>
          <code className="ct-section-pill">4 Reviewed Runs · 67 Checks</code>
        </div>
        <span className="ct-section-note">
          <T en="Sanitized command strings and SHA-256 digests bound to data/release-records.json" zh="指令已正規化去敏，並綁定原始 JUnit SHA-256 雜湊" />
        </span>
      </div>

      <div className="ct-matrix-panel">
        <div className="ct-matrix-scroll">
          <table className="ct-sig-table">
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
                    <td><code>{run.executedAt}</code></td>
                    <td><code>{sanitizeCommand(run.command)}</code></td>
                    <td>
                      <span className={`ct-cell-pill ${run.status === "Pass" ? "ct-c-pass" : "ct-c-warn"}`}>
                        {run.status === "Pass" ? `● ${run.passed}/${run.total} PASS` : `▲ ${run.status.toUpperCase()} (${run.passed}/${run.total})`}
                      </span>
                    </td>
                    <td><code>{`${run.rawJUnitSha256.slice(0, 12)}…${run.rawJUnitSha256.slice(-6)}`}</code></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <section className="section ct-dark-section" aria-labelledby="reviewed-runs-title">
        <h2 id="reviewed-runs-title"><T en="Owner-reviewed runs · September 6" zh="負責人已審查的執行記錄 · 9 月 6 日" /></h2>
        <p className="notice"><T en="Scoped automated acceptance for a personal portfolio. Owner self-review, not independent review or production certification. See the Dashboard for current validity; expiry does not erase recorded test results." zh="個人作品集限定範圍的自動化驗收。負責人自我審查，不是獨立審查或正式產品認證。目前有效性請看 Dashboard；到期不會抹除已記錄的測試結果。" /></p>
        <div className="ct-repo-runs-grid">
          {releaseRecords.map(record => <article className="run-record ct-run-card" key={record.repository}>
            <div className="ct-run-card-head">
              <h3>{record.repository}</h3>
              <code className="ct-badge-go">{`SHA ${record.subjectSha.slice(0, 12)}`}</code>
            </div>
            <dl className="technical-list">
              <dt><T en="Tested version" zh="受測版本" /></dt><dd><code>{record.subjectSha}</code></dd>
              <dt><T en="Review" zh="審查" /></dt><dd><T en="William · Owner self-review; overlapping roles disclosed" zh="William · 負責人自我審查；已揭露角色重疊" /></dd>
              <dt><T en="Decision recorded" zh="決定記錄時間" /></dt><dd>{record.decidedAt}</dd>
              <dt><T en="Approval expiry" zh="核准到期時間" /></dt><dd>{record.expiresAt}</dd>
              <dt><T en="In scope" zh="驗收範圍" /></dt><dd>{record.scope.join(" · ")}</dd>
              <dt><T en="Excluded" zh="排除範圍" /></dt><dd>{record.excluded.join(" · ")}</dd>
            </dl>
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
      </section>

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

      {/* PART 3: Counterfactual Failure Card in Run Records */}
      <div className="ct-section-bar">
        <div className="ct-section-title">
          <span><T en="PART 3 · COUNTERFACTUAL FAILURE RECORD IN LEDGER (DEMO-RUN-FAIL-001)" zh="第三部分 · 失敗案例在執行記錄帳本中的攔截呈現 (DEMO-RUN-FAIL-001)" /></span>
          <code className="ct-badge-hold">SYNTHETIC HOLD PROOF</code>
        </div>
        <span className="ct-section-note">
          <T en="Demonstrates how a P0 case failure surfaces Expected vs. Actual and links to DEF-MDQ-004" zh="示範 P0 關鍵案例失敗時如何標示 Expected/Actual 並串接 DEF-MDQ-004" />
        </span>
      </div>

      <section className="section failed-run-preview ct-dark-section" aria-labelledby="failed-run-preview-title">
        <header>
          <div>
            <div className="eyebrow">Synthetic example / Not current CEX evidence</div>
            <h2 id="failed-run-preview-title"><T en="How a Test Fail appears in Run Records" zh="Test Fail 在 Run Records 的呈現" /></h2>
          </div>
          <span className="status" data-state="Fail">Fail Demo</span>
        </header>
        <p className="notice"><strong><T en="The following is a synthetic failed Run card." zh="以下是一張合成的失敗 Run 卡片。" /></strong><T en=" It only demonstrates how to read failure data. It does not belong to the tested version above and does not overwrite the current Pass records." zh="它只示範失敗資料的閱讀方式，不屬於上方受測版本，也不會改寫目前採用的 Pass 記錄。" /></p>

        <article className="run-record is-failed ct-run-card" id="DEMO-RUN-FAIL-001">
          <div className="run-record-heading">
            <div>
              <h3>WebSocket ordering checks</h3>
              <p className="run-summary"><span className="fail-chip">Fail</span> 3 Test Cases · 2 Pass · 1 Fail</p>
            </div>
            <a href="#DEMO-RUN-FAIL-001"><T en="Run ID link" zh="Run ID 連結" /></a>
          </div>
          <dl className="technical-list">
            <dt>Run ID</dt><dd>DEMO-RUN-FAIL-001</dd>
            <dt><T en="Execution time" zh="執行時間" /></dt><dd><T en="2026/08/18 17:20 (Taiwan time, demo)" zh="2026/08/18 17:20（台灣時間，示範）" /></dd>
            <dt>Run Result</dt><dd><span className="status" data-state="Fail">Fail</span></dd>
            <dt>Release impact</dt><dd><span className="status" data-state="At Risk"><T en="P0 risk not accepted; currently No-Go" zh="P0 風險未接受，目前 No-Go" /></span></dd>
          </dl>

          <div className="run-case-preview" role="list" aria-label="Synthetic failed Run Test Cases">
            <div role="listitem"><span>TC-MDQ-016</span><strong><T en="Accept sequentially increasing updates" zh="接受依序增加的 update" /></strong><span className="status" data-state="Pass">Pass</span></div>
            <div className="is-failed" role="listitem"><span>TC-MDQ-017</span><strong><T en="Reject stale-sequence updates" zh="拒絕 sequence 已過期的 update" /></strong><span className="status" data-state="Fail">Fail</span></div>
            <div role="listitem"><span>TC-MDQ-018</span><strong><T en="Restore the snapshot after reconnecting" zh="斷線重連後恢復 snapshot" /></strong><span className="status" data-state="Pass">Pass</span></div>
          </div>

          <div className="run-failure-summary">
            <div><p>Expected</p><strong><T en="The stale sequence is rejected" zh="過期 sequence 應被拒絕" /></strong></div>
            <div><p>Actual</p><strong><T en="The stale sequence overwrites current state" zh="過期 sequence 覆蓋目前狀態" /></strong></div>
            <div><p>Defect</p><strong>DEF-MDQ-004 · High · Open</strong></div>
            <a href={siteHref("/run-records/fail-demo#execution-log")}><T en="View full Failure, Defect, and Execution Log" zh="查看完整 Fail、Defect 與 Execution Log" /></a>
          </div>
        </article>
      </section>

      {/* PART 4: Historical Pilot Archive (Aug 17) tucked cleanly into a collapsible Archive Drawer */}
      <div className="ct-section-bar">
        <div className="ct-section-title">
          <span><T en="PART 4 · HISTORICAL PILOT ARCHIVE (AUGUST 17 · 6 RUN IDS RETAINED)" zh="第四部分 · 早期 Pilot 歷史封存紀錄（8 月 17 日 · 完整保留 6 組 Run ID）" /></span>
          <code className="ct-section-pill">SHA 8fd5081 · Append-Only</code>
        </div>
        <span className="ct-section-note">
          <T en="Retained for audit traceability; collapsed by default to prevent duplicate table clutter" zh="為確保不可竄改之稽核追溯而保留；預設收合避免重複表格干擾閱讀" />
        </span>
      </div>

      <section className="section record-intro ct-dark-section" aria-labelledby="records-title">
        <h2 id="records-title"><T en="Historical pilot · August 17" zh="歷史 Pilot · 8 月 17 日" /></h2>
        <p><T en="Each Run ID links to its included Test Cases. The page shows the tested version, checks, and expected results so readers can understand scope without reading JSON." zh="每個 Run ID 都連到它收錄的 Test Cases。頁面顯示受測版本、檢查內容與預期結果，讓人不用閱讀 JSON 就能了解測試範圍。" /></p>
        <p className="notice"><strong><T en="These are sanitized Run records without per-case raw output." zh="這是 sanitized Run 記錄，沒有逐項 raw output。" /></strong><T en=" The available data confirms each Run's overall result and included Test Cases. Raw JUnit and manual-check files are not public and are not presented as downloadable results." zh="現有資料只足以確認 Run 的整體結果與當時收錄的 Test Cases；原始 JUnit／人工檢查檔目前不在公開頁，也不會假裝成可下載的結果。" /></p>
        <div className="record-demo-link">
          <div><strong><T en="How is a Test Case failure presented?" zh="Test Case Fail 會怎麼呈現？" /></strong><span><T en="View the Run, failed case, Expected/Actual, Defect, and release impact." zh="查看 Run、失敗案例、Expected／Actual、Defect 與發布影響。" /></span></div>
          <a href={siteHref("/run-records/fail-demo")}><T en="Open Failure Demo" zh="開啟 Fail Demo" /></a>
        </div>
        <dl className="technical-list record-subject">
          <dt>Repo</dt><dd>sanyoii/cex-market-data-quality-lab</dd>
          <dt><T en="Tested version" zh="受測版本" /></dt><dd>8fd5081254b5429e480ec20a56ef09bcc6f5ab9e</dd>
          <dt>Branch</dt><dd>main</dd>
          <dt>Release target</dt><dd>0.1.0</dd>
        </dl>

        <details className="ct-archive-drawer">
          <summary>
            <span><T en="📂 Expand August 17 Historical Run Groups (Post-fix & Earlier Execution · 6 Run IDs)" zh="📂 展開 8 月 17 日歷史執行群組明細（修正後執行 ＋ 較早未採用執行 · 共 6 組 Run ID）" /></span>
            <code>6 Historical Runs</code>
          </summary>
          <div className="ct-archive-drawer-body">
            {runGroups.map((runGroup) => (
              <section className="section" key={runGroup.title} aria-label={runGroup.title}>
                <h2><T en={runGroup.titleEn} zh={runGroup.title} /></h2>
                <p><T en={runGroup.noteEn} zh={runGroup.note} /></p>
                <div className="run-record-list">
                  {runGroup.records.map((record) => (
                    <article className="run-record" id={record.runId} key={record.runId}>
                      <div className="run-record-heading">
                        <div>
                          <h3><T en={record.labelEn} zh={record.label} /></h3>
                          <p className="run-summary"><span className="pass-chip">Pass</span> <T en={record.summaryEn} zh={record.summary} /></p>
                        </div>
                        <a href={`#${record.runId}`}><T en="Run ID link" zh="Run ID 連結" /></a>
                      </div>
                      <dl className="technical-list">
                        <dt>Run ID</dt><dd>{record.runId}</dd>
                        <dt><T en="Execution time" zh="執行時間" /></dt><dd><T en={record.timeEn} zh={record.time} /></dd>
                        <dt><T en="Result scope" zh="結果範圍" /></dt><dd><T en="Pass is the Run-level result; the table below shows included scope, not per-case raw results." zh="Pass 是這個 Run 的整體記錄；下表是收錄範圍，不是逐項 raw result。" /></dd>
                      </dl>
                      <CaseGroups groups={[...record.groups]} />
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </details>
      </section>

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
