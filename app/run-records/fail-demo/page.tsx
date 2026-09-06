import type { Metadata } from "next";
import { siteHref } from "../../_site";
import { DecisionReplay } from "./_decision-replay";
import { pageLanguageData, T } from "../../_i18n";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Failed Test Run Demo — QA Decision Desk",
  description: "A demonstration of how a failed Test Case affects its Run, Defect, and Release Decision.",
};

type CaseStatus = "Pass" | "Fail";

const cases: Array<{
  id: string;
  title: string;
  titleEn: string;
  priority: string;
  status: CaseStatus;
  duration: string;
}> = [
  { id: "TC-MDQ-016", title: "接受依序增加的 market-data update", titleEn: "Accept sequentially increasing market-data updates", priority: "P0", status: "Pass", duration: "0.18s" },
  { id: "TC-MDQ-017", title: "拒絕 sequence 已過期的 update", titleEn: "Reject stale-sequence updates", priority: "P0", status: "Fail", duration: "0.21s" },
  { id: "TC-MDQ-018", title: "斷線重連後恢復最新 snapshot", titleEn: "Restore the latest snapshot after reconnecting", priority: "P1", status: "Pass", duration: "0.44s" },
];

function Result({ state, children }: { state: "Pass" | "Fail" | "At Risk" | "No-Go"; children: React.ReactNode }) {
  return <span className="fail-result" data-state={state}><span aria-hidden="true">{state === "Pass" ? "✓" : state === "At Risk" ? "!" : "×"}</span>{children}</span>;
}

export default function FailedRunDemo() {
  return (
    <main className="shell fail-demo" {...pageLanguageData(
      { en: "Failed Test Run Demo — QA Decision Desk", zh: "失敗 Test Run Demo — QA Decision Desk" },
      { en: "A demonstration of how a failed Test Case affects its Run, Defect, and Release Decision.", zh: "示範 Test Case Fail 時，Run、Defect 與 Release Decision 應如何呈現。" },
    )}>
      <header className="masthead compact-masthead">
        <div>
          <div className="eyebrow">Synthetic scenario / Not current CEX evidence</div>
          <h1>Test Case Fail Demo</h1>
        </div>
        <a href={siteHref("/run-records")}><T en="Back to Run Records" zh="回到執行記錄" /></a>
      </header>

      <aside className="fail-demo-warning" aria-label="Demo disclosure">
        <strong><T en="This is a synthetic demo, not a current product test result." zh="這是合成示範，不是目前產品的測試結果。" /></strong>
        <span><T en="It shows the human-readable information a public page should provide when a Test Case fails." zh="用途是展示 Test Case Fail 時，公開頁應提供哪些人類可讀資訊。" /></span>
      </aside>

      <DecisionReplay />

      <section className="section" aria-labelledby="fail-decision-title">
        <div className="fail-decision-heading">
          <div><p className="eyebrow">Decision impact</p><h2 id="fail-decision-title"><T en="How does one required-case failure affect the decision?" zh="一個必要案例失敗，會怎麼影響決定？" /></h2></div>
          <Result state="No-Go">No-Go</Result>
        </div>
        <div className="fail-summary-grid">
          <article><p>Run Result</p><Result state="Fail">Fail</Result><small>3 Cases · 2 Pass · 1 Fail</small></article>
          <article><p>Product Status</p><Result state="At Risk">At Risk</Result><small><T en="P0 risk not accepted" zh="P0 風險尚未接受" /></small></article>
          <article><p>Release Decision</p><Result state="No-Go"><T en="Do not release" zh="不能發布" /></Result><small><T en="Remain No-Go until fixed and rerun" zh="修正並重跑前維持 No-Go" /></small></article>
          <article><p>Linked Defect</p><strong>DEF-MDQ-004</strong><small>High · Open</small></article>
        </div>
      </section>

      <section className="section" aria-labelledby="failed-run-title">
        <header className="fail-run-header">
          <div>
            <p className="eyebrow">Synthetic run record</p>
            <h2 id="failed-run-title">WebSocket ordering checks</h2>
          </div>
          <Result state="Fail">Run Failed</Result>
        </header>

        <dl className="technical-list fail-run-meta">
          <dt>Run ID</dt><dd>DEMO-RUN-FAIL-001</dd>
          <dt>Repo</dt><dd>demo/cex-market-data-quality-lab</dd>
          <dt><T en="Tested version" zh="受測版本" /></dt><dd>demo-sha-not-current-evidence</dd>
          <dt><T en="Execution time" zh="執行時間" /></dt><dd><T en="2026/08/18 17:20 (Taiwan time, demo)" zh="2026/08/18 17:20（台灣時間，示範）" /></dd>
        </dl>

        <div className="fail-case-list" role="list" aria-label="Test Case results">
          {cases.map((testCase) => (
            <article className="fail-case-row" data-state={testCase.status} role="listitem" key={testCase.id}>
              <div><span className="fail-case-id">{testCase.id}</span><strong><T en={testCase.titleEn} zh={testCase.title} /></strong></div>
              <span>{testCase.priority}</span>
              <span>{testCase.duration}</span>
              <Result state={testCase.status}>{testCase.status}</Result>
            </article>
          ))}
        </div>

        <details className="failed-case-detail" open>
          <summary><span>×</span><strong><T en="TC-MDQ-017 failure details" zh="TC-MDQ-017 失敗詳情" /></strong><small><T en="Open by default so material risk is not hidden" zh="預設展開，避免重要風險被藏起來" /></small></summary>
          <div className="failed-case-body">
            <div className="expected-actual">
              <article>
                <p>Expected</p>
                <strong><T en="Reject the stale-sequence update" zh="拒絕 sequence 已過期的 update" /></strong>
                <span><T en="After sequence 104, sequence 103 must not overwrite current data." zh="收到 sequence 104 後，sequence 103 不得覆蓋目前資料。" /></span>
              </article>
              <article>
                <p>Actual</p>
                <strong><T en="The stale update was accepted" zh="過期 update 被接受" /></strong>
                <span><T en="Sequence 103 overwrote 104, returning the order book to stale state." zh="sequence 103 覆蓋 104，導致 order book 回到舊狀態。" /></span>
              </article>
            </div>

            <div className="fail-impact-grid">
              <article><p><T en="Impact" zh="影響" /></p><strong><T en="Users may see stale market data" zh="使用者可能看到過期的 market data" /></strong></article>
              <article><p><T en="Risk" zh="風險" /></p><strong>High · Release blocking</strong></article>
              <article><p><T en="Reproduction" zh="重現" /></p><strong><T en="Failed 3 of 3 times" zh="3/3 次皆失敗" /></strong></article>
            </div>

            <div className="defect-record">
              <div><p className="eyebrow">Linked defect</p><h3>DEF-MDQ-004 · Stale update overwrites current state</h3></div>
              <dl>
                <div><dt>Status</dt><dd>Open</dd></div>
                <div><dt>Severity</dt><dd>High</dd></div>
                <div><dt>Owner</dt><dd><T en="William (Demo)" zh="William（Demo）" /></dd></div>
                <div><dt>Next</dt><dd><T en="Fix → targeted rerun → release re-assessment" zh="修正 → targeted rerun → release re-assessment" /></dd></div>
              </dl>
            </div>

            <section className="execution-log" id="execution-log" aria-labelledby="execution-log-title">
              <header>
                <div><p className="eyebrow">Sanitized execution output</p><h3 id="execution-log-title">Execution Log</h3></div>
                <span>Exit code 1</span>
              </header>
              <p className="log-disclosure"><T en="Only logs directly supporting the failure decision are shown; secrets, internal paths, and unrelated output were removed." zh="只顯示與失敗判斷直接相關的 log；secrets、內部路徑與無關輸出已移除。" /></p>
              <dl className="log-meta">
                <dt>Command</dt><dd><code>python -m pytest tests/test_order_book.py::test_rejects_stale_update -q</code></dd>
                <dt>Source</dt><dd>DEMO-RUN-FAIL-001 · sanitized excerpt</dd>
              </dl>
              <ol className="log-lines" aria-label="Execution log lines">
                <li><time>17:20:11.402</time><strong data-level="info">INFO</strong><code>case=TC-MDQ-017 start current_sequence=104</code></li>
                <li><time>17:20:11.519</time><strong data-level="assert">ASSERT</strong><code>expected=reject actual=accepted incoming_sequence=103</code></li>
                <li><time>17:20:11.521</time><strong data-level="error">ERROR</strong><code>stale update replaced current order-book state</code></li>
                <li><time>17:20:11.523</time><strong data-level="info">INFO</strong><code>result=FAIL defect=DEF-MDQ-004</code></li>
              </ol>
              <details className="raw-log" open>
                <summary><T en="View raw log excerpt" zh="查看 raw log excerpt" /></summary>
                <pre><code>{`FAILED tests/test_order_book.py::test_rejects_stale_update
AssertionError: stale sequence 103 was accepted after sequence 104
Expected: update rejected and current state preserved
Actual: stale update replaced current state
1 failed, 2 passed in 0.83s`}</code></pre>
              </details>
            </section>
          </div>
        </details>
      </section>

      <section className="section fail-reading-rule" aria-labelledby="fail-rule-title">
        <h2 id="fail-rule-title"><T en="Reading rules" zh="閱讀規則" /></h2>
        <ol>
          <li><strong>Test Case Fail</strong><span><T en="Records the actual failure of one check." zh="記錄單一檢查的實際失敗。" /></span></li>
          <li><strong>Run Fail</strong><span><T en="This Run contains at least one case that did not meet acceptance criteria." zh="這次 Run 至少包含一個不符合接受條件的案例。" /></span></li>
          <li><strong>Release No-Go</strong><span><T en="This case is a required P0 and its risk is not accepted; not every failure automatically produces the same release decision." zh="因為此案例是必要 P0 且風險未被接受；不是所有 Fail 都會自動得到同一發布決定。" /></span></li>
        </ol>
      </section>

      <footer className="footer"><a href={siteHref("/run-records")}><T en="← Back to Test Cases and Run Records" zh="← 回到 Test Cases 與執行記錄" /></a><span><T en="Synthetic demo · not part of the current formal CEX records" zh="Synthetic demo · 不屬於目前 CEX 的正式記錄" /></span></footer>
    </main>
  );
}
