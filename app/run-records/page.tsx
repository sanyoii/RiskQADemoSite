import { siteHref } from "../_site";
import { pageLanguageData, T } from "../_i18n";
import { caseGroupTitlesEn, caseTextEn, deterministicGroups, liveGroups, manualGroups, type TestCaseGroup } from "./cases";

export const dynamic = "force-static";

const runGroups = [
  {
    title: "修正後執行 — 目前採用",
    titleEn: "Post-fix execution — Current",
    note: "這組 Run 目前用來支持 Decision Desk 的發布判斷。",
    noteEn: "These Runs currently support the Decision Desk release decision.",
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
    <main className="shell" {...pageLanguageData(
      { en: "Test Cases and Run Records — QA Decision Desk", zh: "Test Cases 與執行記錄 — QA Decision Desk" },
      { en: "Human-readable Test Cases and sanitized Run Records supporting the current QA decision.", zh: "以人類可讀方式呈現支援目前 QA 決定的 Test Cases 與 sanitized Run Records。" },
    )}>
      <header className="masthead compact-masthead">
        <div>
          <div className="eyebrow">Risk-based QA records / Pilot 0 / Portfolio demo</div>
          <h1><T en="Test Cases and Run Records" zh="Test Cases 與執行記錄" /></h1>
        </div>
        <a href={siteHref("/")}><T en="Back to Decision Desk" zh="回到 Decision Desk" /></a>
      </header>

      <section className="section record-intro" aria-labelledby="records-title">
        <h2 id="records-title"><T en="What did this round test?" zh="這一輪測了什麼？" /></h2>
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
      </section>

      <section className="section failed-run-preview" aria-labelledby="failed-run-preview-title">
        <header>
          <div>
            <div className="eyebrow">Synthetic example / Not current CEX evidence</div>
            <h2 id="failed-run-preview-title"><T en="How a Test Fail appears in Run Records" zh="Test Fail 在 Run Records 的呈現" /></h2>
          </div>
          <span className="status" data-state="Fail">Fail Demo</span>
        </header>
        <p className="notice"><strong><T en="The following is a synthetic failed Run card." zh="以下是一張合成的失敗 Run 卡片。" /></strong><T en=" It only demonstrates how to read failure data. It does not belong to the tested version above and does not overwrite the current Pass records." zh="它只示範失敗資料的閱讀方式，不屬於上方受測版本，也不會改寫目前採用的 Pass 記錄。" /></p>

        <article className="run-record is-failed" id="DEMO-RUN-FAIL-001">
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

      <footer className="footer"><a href={siteHref("/")}><T en="← Back to Decision Desk" zh="← 回到 Decision Desk" /></a><span><T en="The public page shows only the record summaries needed for a decision." zh="公開頁只顯示做決定需要的記錄摘要。" /></span></footer>
    </main>
  );
}
