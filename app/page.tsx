type StatusName =
  | "Pass"
  | "Ready"
  | "Fail"
  | "Blocked"
  | "At Risk"
  | "Current"
  | "Unknown"
  | "Unreachable";

const evidenceGroups = [
  {
    id: "RUN-20260817T013741977Z-8fd5081254b5",
    title: "較早執行 — 未採用",
    disposition: "No-Go",
    explanation: "測試本身通過，但執行流程與證據紀錄不合規，因此只保留作為歷史紀錄。",
    records: [
      ["自動化測試", "RUN-20260817T013741977Z-8fd5081254b5-DETERMINISTIC", "2026/08/17 09:40（台灣時間）", "2026-08-17T01:40:33.001721Z"],
      ["Live market-data 測試", "RUN-20260817T013741977Z-8fd5081254b5-LIVE", "2026/08/17 09:40（台灣時間）", "2026-08-17T01:40:51.548476Z"],
      ["人工檢查", "RUN-20260817T013741977Z-8fd5081254b5-MANUAL", "2026/08/17 09:41（台灣時間）", "2026-08-17T01:41:27.5793869Z"],
    ],
  },
  {
    id: "RUN-20260817T015452830Z-8fd5081254b5",
    title: "修正後執行 — 目前採用",
    disposition: "採用",
    explanation: "修正流程問題後重新執行；這組結果目前用來支持頁面最上方的發布判斷。",
    records: [
      ["自動化測試", "RUN-20260817T015452830Z-8fd5081254b5-DETERMINISTIC", "2026/08/17 09:57（台灣時間）", "2026-08-17T01:57:49.150407Z"],
      ["Live market-data 測試", "RUN-20260817T015452830Z-8fd5081254b5-LIVE", "2026/08/17 09:58（台灣時間）", "2026-08-17T01:58:11.069228Z"],
      ["人工檢查", "RUN-20260817T015452830Z-8fd5081254b5-MANUAL", "2026/08/17 09:58（台灣時間）", "2026-08-17T01:58:44.2768321Z"],
    ],
  },
] as const;

const scenarios: Array<{
  scenario: string;
  scenarioState: StatusName;
  data: string;
  dataState: StatusName;
  product: string;
  productState: StatusName;
  release: string;
  reason: string;
  evidence: string;
}> = [
  {
    scenario: "通過（Pass）",
    scenarioState: "Pass",
    data: "資料已更新（Current）",
    dataState: "Current",
    product: "符合發布條件（Ready）",
    productState: "Ready",
    release: "可以（Yes）",
    reason: "必要測試通過，證據也齊全，可以發布。",
    evidence: "測試與證據齊全",
  },
  {
    scenario: "未通過（Fail）",
    scenarioState: "Fail",
    data: "資料已更新（Current）",
    dataState: "Current",
    product: "有風險（At Risk）",
    productState: "At Risk",
    release: "不可以（No）",
    reason: "測試發現未接受的風險，不能發布。",
    evidence: "已記錄未接受的風險",
  },
  {
    scenario: "測試受阻（Blocked）",
    scenarioState: "Blocked",
    data: "資料已更新（Current）",
    dataState: "Current",
    product: "測試受阻（Blocked）",
    productState: "Blocked",
    release: "不可以（No）",
    reason: "必要測試沒做完，證據不齊，不能發布。",
    evidence: "必要測試尚未完成",
  },
  {
    scenario: "資料無法取得（Unreachable）",
    scenarioState: "Unreachable",
    data: "資料無法取得（Unreachable）",
    dataState: "Unreachable",
    product: "狀態未知（Unknown）",
    productState: "Unknown",
    release: "尚未決定（Unknown）",
    reason: "Dashboard 拿不到最新測試資料，發布狀態維持 Unknown。",
    evidence: "最新資料取得失敗",
  },
];

function Status({ state, children }: { state: StatusName; children: React.ReactNode }) {
  return (
    <span className="status" data-state={state}>
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <main className="shell">
      <header className="masthead">
        <div>
          <div className="eyebrow">Risk-based QA evidence / Pilot 0 / Portfolio demo</div>
          <h1>QA Decision Desk</h1>
        </div>
        <div className="stamp">唯讀作品集展示</div>
      </header>

      <section className="section" aria-labelledby="current-title">
        <h2 id="current-title">目前能做什麼決定？</h2>
        <dl className="decision-grid">
          <div className="decision">
            <dt className="label">能不能發</dt>
            <dd>尚未核准發布（Unknown）</dd>
          </div>
          <div className="decision">
            <dt className="label">為什麼</dt>
            <dd>G3 測試已通過。這份案例的正式發布判斷仍保留為 Unknown，因此不把測試通過說成已核准發布。</dd>
          </div>
          <div className="decision">
            <dt className="label">證據在哪</dt>
            <dd><a href="#evidence-register">查看本次測試證據</a></dd>
          </div>
        </dl>

        <div className="subject">
          <div className="subject-summary">受測版本：cex-market-data-quality-lab · 0.1.0 · 8fd5081</div>
          <details>
            <summary>完整受測版本</summary>
            <dl className="technical-list">
              <dt>Repository</dt><dd>sanyoii/cex-market-data-quality-lab</dd>
              <dt>Branch</dt><dd>main</dd>
              <dt>Release target</dt><dd>0.1.0</dd>
              <dt>Full commit SHA</dt><dd>8fd5081254b5429e480ec20a56ef09bcc6f5ab9e</dd>
            </dl>
          </details>
        </div>

        <div className="notice-grid">
          <p className="notice"><strong>Ready 不等於零缺陷，也不是品質保證。</strong>它表示受測版本在證據有效期內，符合目前核准的發布條件。</p>
          <p className="notice"><strong>Unreachable：Dashboard 暫時拿不到最新測試資料。</strong>這不是產品故障警報，也不是即時監控。</p>
        </div>
      </section>

      <section className="section" id="evidence-register" aria-labelledby="evidence-title" tabIndex={-1}>
        <h2 id="evidence-title">本次測試證據</h2>
        <p>第一組測試因執行流程不合規而作廢。第二組重跑後通過，目前採用第二組結果。原始測試檔已另外保存，公開頁只顯示做決定需要的摘要。</p>

        {evidenceGroups.map((group) => (
          <article className="evidence-group" key={group.id}>
            <div className="evidence-group-header">
              <h3>{group.title}</h3>
              <span className="group-status">整體結果：{group.disposition}</span>
            </div>
            <p>{group.explanation}</p>
            <ul className="evidence-list">
              {group.records.map(([label, runId, localTime, utcTime]) => (
                <li className="evidence-card" key={runId}>
                  <strong>{label}</strong>
                  <p>測試結果：通過</p>
                  <p>證據狀態：仍在有效期限內（有效至 2026/08/24 09:58，台灣時間）</p>
                  <p>執行時間：{localTime}</p>
                  <details>
                    <summary>查看技術資訊</summary>
                    <span className="run-id">完整 Run ID：{runId}<br />UTC 時間：{utcTime}<br />原始測試檔：已另外保存，不在公開頁提供</span>
                  </details>
                </li>
              ))}
            </ul>
          </article>
        ))}

        <p className="footnote">三項測試都通過，仍不代表可以發布。請看頁面最上方的「能不能發」。</p>
      </section>

      <section className="section" aria-labelledby="scenarios-title">
        <h2 id="scenarios-title">四種情境怎麼影響發布</h2>
        <div className="table-wrap">
          <table>
            <caption>Pass、Fail、Blocked、Unreachable 對發布的影響</caption>
            <thead>
              <tr>
                <th scope="col">情境</th>
                <th scope="col">資料狀態</th>
                <th scope="col">產品狀態</th>
                <th scope="col">能不能發</th>
                <th scope="col">為什麼</th>
                <th scope="col">證據</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((row) => (
                <tr key={row.scenarioState}>
                  <th scope="row"><Status state={row.scenarioState}>{row.scenario}</Status></th>
                  <td><Status state={row.dataState}>{row.data}</Status></td>
                  <td><Status state={row.productState}>{row.product}</Status></td>
                  <td>{row.release}</td>
                  <td>{row.reason}</td>
                  <td>{row.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="footnote">這四列用來說明判斷規則，不是本次產品的測試結果。本次決定請看頁面最上方。</p>
      </section>

      <footer className="footer">
        <strong>Portfolio demo</strong>
        <span>這個公開頁只包含 sanitized decision summary，不含 raw artifacts、protected receipts 或內部文件。</span>
      </footer>
    </main>
  );
}
