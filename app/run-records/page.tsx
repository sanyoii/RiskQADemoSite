import Link from "next/link";
import { deterministicGroups, liveGroups, manualGroups, type TestCaseGroup } from "./cases";

const runGroups = [
  {
    title: "修正後執行 — 目前採用",
    note: "這組 Run 目前用來支持 Decision Desk 的發布判斷。",
    records: [
      { runId: "RUN-20260817T015452830Z-8fd5081254b5-DETERMINISTIC", label: "自動化測試", summary: "39 個自動化檢查，涵蓋 34 個 logical Test Case IDs", time: "2026/08/17 09:57（台灣時間）", groups: deterministicGroups },
      { runId: "RUN-20260817T015452830Z-8fd5081254b5-LIVE", label: "Live market-data 測試", summary: "5 個 Live market-data 檢查", time: "2026/08/17 09:58（台灣時間）", groups: liveGroups },
      { runId: "RUN-20260817T015452830Z-8fd5081254b5-MANUAL", label: "人工檢查", summary: "2 個人工檢查", time: "2026/08/17 09:58（台灣時間）", groups: manualGroups },
    ],
  },
  {
    title: "較早執行 — 未採用",
    note: "這組 Run 的測試結果雖為 Pass，但流程記錄不符合要求，所以只保留歷程，不用來做目前決定。",
    records: [
      { runId: "RUN-20260817T013741977Z-8fd5081254b5-DETERMINISTIC", label: "自動化測試", summary: "39 個自動化檢查，涵蓋 34 個 logical Test Case IDs", time: "2026/08/17 09:40（台灣時間）", groups: deterministicGroups },
      { runId: "RUN-20260817T013741977Z-8fd5081254b5-LIVE", label: "Live market-data 測試", summary: "5 個 Live market-data 檢查", time: "2026/08/17 09:40（台灣時間）", groups: liveGroups },
      { runId: "RUN-20260817T013741977Z-8fd5081254b5-MANUAL", label: "人工檢查", summary: "2 個人工檢查", time: "2026/08/17 09:41（台灣時間）", groups: manualGroups },
    ],
  },
] as const;

function CaseGroups({ groups }: { groups: TestCaseGroup[] }) {
  return (
    <div className="case-groups">
      {groups.map((group) => (
        <details className="case-group" key={group.id}>
          <summary>{group.title}</summary>
          <div className="case-table-wrap">
            <table className="case-table">
              <thead>
                <tr><th scope="col">Test Case</th><th scope="col">優先級</th><th scope="col">檢查內容</th><th scope="col">預期結果</th></tr>
              </thead>
              <tbody>
                {group.cases.map((testCase) => (
                  <tr key={testCase.id}>
                    <th scope="row">{testCase.id}</th>
                    <td>{testCase.priority}</td>
                    <td>{testCase.check}</td>
                    <td>{testCase.expected}</td>
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
    <main className="shell">
      <header className="masthead compact-masthead">
        <div>
          <div className="eyebrow">Risk-based QA records / Pilot 0 / Portfolio demo</div>
          <h1>Test Cases 與執行記錄</h1>
        </div>
        <Link href="/">回到 Decision Desk</Link>
      </header>

      <section className="section record-intro" aria-labelledby="records-title">
        <h2 id="records-title">這一輪測了什麼？</h2>
        <p>每個 Run ID 都連到它收錄的 Test Cases。頁面顯示受測版本、檢查內容與預期結果，讓人不用閱讀 JSON 就能了解測試範圍。</p>
        <p className="notice"><strong>這是 sanitized Run 記錄，沒有逐項 raw output。</strong>現有資料只足以確認 Run 的整體結果與當時收錄的 Test Cases；原始 JUnit／人工檢查檔目前不在公開頁，也不會假裝成可下載的結果。</p>
        <dl className="technical-list record-subject">
          <dt>Repo</dt><dd>sanyoii/cex-market-data-quality-lab</dd>
          <dt>受測版本</dt><dd>8fd5081254b5429e480ec20a56ef09bcc6f5ab9e</dd>
          <dt>Branch</dt><dd>main</dd>
          <dt>Release target</dt><dd>0.1.0</dd>
        </dl>
      </section>

      {runGroups.map((runGroup) => (
        <section className="section" key={runGroup.title} aria-label={runGroup.title}>
          <h2>{runGroup.title}</h2>
          <p>{runGroup.note}</p>
          <div className="run-record-list">
            {runGroup.records.map((record) => (
              <article className="run-record" id={record.runId} key={record.runId}>
                <div className="run-record-heading">
                  <div>
                    <h3>{record.label}</h3>
                    <p className="run-summary"><span className="pass-chip">Pass</span> {record.summary}</p>
                  </div>
                  <Link href={`#${record.runId}`}>Run ID 連結</Link>
                </div>
                <dl className="technical-list">
                  <dt>Run ID</dt><dd>{record.runId}</dd>
                  <dt>執行時間</dt><dd>{record.time}</dd>
                  <dt>結果範圍</dt><dd>Pass 是這個 Run 的整體記錄；下表是收錄範圍，不是逐項 raw result。</dd>
                </dl>
                <CaseGroups groups={[...record.groups]} />
              </article>
            ))}
          </div>
        </section>
      ))}

      <footer className="footer"><Link href="/">← 回到 Decision Desk</Link><span>公開頁只顯示做決定需要的記錄摘要。</span></footer>
    </main>
  );
}
