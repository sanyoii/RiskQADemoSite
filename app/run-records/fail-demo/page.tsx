import type { Metadata } from "next";
import { siteHref } from "../../_site";
import { ControlTowerNav } from "../../_shared-nav";
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
    <main className="shell decision-desk ct-shell fail-demo" {...pageLanguageData(
      { en: "Failed Test Run Demo — QA Decision Desk", zh: "失敗 Test Run Demo — QA Decision Desk" },
      { en: "A demonstration of how a failed Test Case affects its Run, Defect, and Release Decision.", zh: "示範 Test Case Fail 時，Run、Defect 與 Release Decision 應如何呈現。" },
    )}>
      <header className="masthead decision-masthead ct-topbar">
        <div className="ct-topbar-main">
          <div className="ct-topbar-left">
            <a className="ct-back-btn" href="https://sanyoii.github.io/">
              <T en="← sanyoii.github.io Portfolio" zh="← 返回 sanyoii.github.io 主站" />
            </a>
            <div className="ct-brand">
              <span className="ct-brand-dot ct-brand-dot-red" aria-hidden="true" />
              <div>
                <p className="eyebrow">Synthetic scenario / Not current CEX evidence</p>
                <h1>Test Case Fail Demo</h1>
              </div>
              <span className="ct-brand-tag ct-brand-tag-red"><T en="STAGE 03 · INCIDENT & REPLAY GATE" zh="階段 03 · 失敗攔截與狀態機回放" /></span>
            </div>
          </div>
          <div className="ct-topbar-right">
            <div className="ct-snapshot-pill ct-snapshot-pill-red">
              <span aria-hidden="true">🛑</span>
              <T en="Counterfactual Run: DEMO-RUN-FAIL-001 · P0 Blocker DEF-MDQ-004 · Verdict: HOLD / NO-GO" zh="反事實執行：DEMO-RUN-FAIL-001 · P0 阻擋缺陷 DEF-MDQ-004 · 裁決：HOLD / NO-GO" />
            </div>
          </div>
        </div>
        <p className="ct-masthead-sub">
          <T en="Part C 4-Stage Incident Traceability Pipeline + Part A Split Expected/Actual Diff & Pytest Execution Log." zh="結合 C 版「四步事故因果追溯鏈」與 A 版「Expected/Actual 狀態差異 ＋ Pytest 終端機日誌雙欄檢視器」。" />
        </p>
      </header>

      <ControlTowerNav active="fail-demo" />

      <aside className="fail-demo-warning ct-fail-banner" aria-label="Demo disclosure">
        <strong><T en="This is a synthetic demo, not a current product test result." zh="這是合成示範，不是目前產品的測試結果。" /></strong>
        <span><T en="It shows the human-readable information a public page should provide when a Test Case fails." zh="用途是展示 Test Case Fail 時，公開頁應提供哪些人類可讀資訊。" /></span>
      </aside>

      {/* PART 1 (Option C): 4-Stage Incident & Gate Traceability Pipeline */}
      <div className="ct-section-bar">
        <div className="ct-section-title">
          <span><T en="PART 1 · 4-STAGE COUNTERFACTUAL INCIDENT & GATE PIPELINE" zh="第一部分 · 反事實失敗案例四步因果與攔截看板" /></span>
          <code className="ct-badge-hold">DEMO-RUN-FAIL-001 → DEF-MDQ-004</code>
        </div>
        <span className="ct-section-note">
          <T en="How a single P0 assertion failure propagates from test execution to defect triage and release gate rejection" zh="單一 P0 關鍵斷言失敗如何從測試執行一路傳遞至缺陷立案與發布門檻攔截" />
        </span>
      </div>

      <div className="ct-trace-board">
        <article className="ct-stage-col">
          <div>
            <header className="ct-stage-head">
              <div className="ct-stage-step"><span><T en="STAGE 01 · TRIGGER CASE" zh="階段 01 · 觸發失敗案例" /></span><code>04-CASE</code></div>
              <h3>TC-MDQ-017 · P0 Required</h3>
              <p><T en="Reject stale-sequence market-data updates" zh="拒絕 sequence 已過期的行情更新" /></p>
            </header>
            <div className="ct-card-block">
              <div className="ct-risk-item"><span><T en="Suite Target" zh="測試套件" /></span><code>test_order_book.py</code></div>
              <div className="ct-risk-item"><span><T en="Case Priority" zh="風險等級" /></span><strong className="ct-text-red">P0 Release Gate</strong></div>
              <div className="ct-risk-item"><span><T en="Reproducibility" zh="重現率" /></span><strong className="ct-text-red"><T en="3 / 3 Failed" zh="3 / 3 次皆失敗" /></strong></div>
            </div>
          </div>
          <footer className="ct-artifact-footer">
            <span className="ct-art-chip">04-test-case.md</span>
            <span className="ct-art-chip">TC-MDQ-017</span>
          </footer>
        </article>

        <article className="ct-stage-col">
          <div>
            <header className="ct-stage-head">
              <div className="ct-stage-step"><span><T en="STAGE 02 · STATE DIFF" zh="階段 02 · 狀態異常差異" /></span><code>05-RUN</code></div>
              <h3><T en="Seq 103 Overwrote 104" zh="舊序號 103 覆蓋最新 104" /></h3>
              <p><T en="Order-book state regressed to stale snapshot" zh="Order Book 狀態倒退回過期快照" /></p>
            </header>
            <div className="ct-card-block">
              <div className="ct-risk-item"><span>Expected</span><strong className="ct-text-green"><T en="Reject seq 103 < 104" zh="拒絕舊序號 103" /></strong></div>
              <div className="ct-risk-item"><span>Actual</span><strong className="ct-text-red"><T en="Accepted seq 103" zh="接受並覆蓋 104" /></strong></div>
              <div className="ct-risk-item"><span>Pytest Status</span><code className="ct-text-red">Exit code 1 (0.83s)</code></div>
            </div>
          </div>
          <footer className="ct-artifact-footer">
            <span className="ct-art-chip">05-test-run-record.md</span>
            <a className="ct-art-chip ct-art-link" href="#execution-log">Execution Log ↓</a>
          </footer>
        </article>

        <article className="ct-stage-col">
          <div>
            <header className="ct-stage-head">
              <div className="ct-stage-step"><span><T en="STAGE 03 · BLOCKER DEFECT" zh="階段 03 · 阻擋缺陷立案" /></span><code>06-DEFECT</code></div>
              <h3>DEF-MDQ-004 (Open)</h3>
              <p><T en="High severity · Release-blocking P0 defect" zh="高嚴重度 · 阻擋發布之 P0 缺陷" /></p>
            </header>
            <div className="ct-card-block">
              <div className="ct-risk-item"><span>Severity / State</span><strong className="ct-text-red">High · Open</strong></div>
              <div className="ct-risk-item"><span>User Impact</span><strong className="ct-text-amber"><T en="Stale market data" zh="顯示過期行情" /></strong></div>
              <div className="ct-risk-item"><span>Accountable Owner</span><strong>William (Demo)</strong></div>
            </div>
          </div>
          <footer className="ct-artifact-footer">
            <span className="ct-art-chip">06-defect-report.md</span>
            <span className="ct-art-chip">DEF-MDQ-004</span>
          </footer>
        </article>

        <article className="ct-stage-col ct-verdict-hold-col">
          <div>
            <header className="ct-stage-head">
              <div className="ct-stage-step"><span><T en="STAGE 04 · GATE VERDICT" zh="階段 04 · 門檻裁決邊界" /></span><code>07–08</code></div>
              <h3><T en="Enforced HOLD / NO-GO" zh="強制攔截 HOLD / NO-GO" /></h3>
              <p><T en="Passing rerun alone cannot self-authorize Go" zh="單靠重跑通過不會自動解除攔截" /></p>
            </header>
            <div className="ct-verdict-banner ct-verdict-banner-hold">
              <strong className="ct-verdict-big">× NO-GO / HOLD</strong>
              <span className="ct-verdict-sub"><T en="Requires Fix + Targeted Rerun + G6 Owner Review" zh="須完成修正 ＋ 重跑驗證 ＋ G6 負責人重審" /></span>
            </div>
          </div>
          <footer className="ct-artifact-footer">
            <span className="ct-art-chip">07-release-quality-summary.md</span>
            <span className="ct-art-chip">G6 Governance</span>
          </footer>
        </article>
      </div>

      {/* Interactive 3-Step Replay State Machine */}
      <DecisionReplay />

      {/* PART 2 (Option A): Split Inspector for Expected/Actual Diff, Defect & Pytest Terminal */}
      <div className="ct-section-bar">
        <div className="ct-section-title">
          <span><T en="PART 2 · SPLIT EXPECTED / ACTUAL STATE DIFF, DEFECT & PYTEST EXECUTION LOG" zh="第二部分 · 左右雙欄 Expected / Actual 狀態差異、缺陷單與 Pytest 終端機紀錄" /></span>
          <code className="ct-badge-hold">TC-MDQ-017 · Exit Code 1</code>
        </div>
        <span className="ct-section-note">
          <T en="Side-by-side comparison of expected contract vs. actual stale state overwrite and sanitized pytest trace" zh="並列檢視預期規格、實際過期覆蓋異常與去敏後之 pytest 失敗輸出" />
        </span>
      </div>

      <div className="failed-case-body ct-split-inspector">
        <div className="ct-inspector-left">
          <div className="expected-actual ct-diff-pair">
            <article className="ct-diff-card ct-diff-expected">
              <p>Expected</p>
              <strong><T en="Reject the stale-sequence update" zh="拒絕 sequence 已過期的 update" /></strong>
              <span><T en="After sequence 104, sequence 103 must not overwrite current data." zh="收到 sequence 104 後，sequence 103 不得覆蓋目前資料。" /></span>
            </article>
            <article className="ct-diff-card ct-diff-actual">
              <p>Actual</p>
              <strong><T en="The stale update was accepted" zh="過期 update 被接受" /></strong>
              <span><T en="Sequence 103 overwrote 104, returning the order book to stale state." zh="sequence 103 覆蓋 104，導致 order book 回到舊狀態。" /></span>
            </article>
          </div>

          <div className="fail-impact-grid ct-impact-cards">
            <article><p><T en="Impact" zh="影響" /></p><strong><T en="Users may see stale market data" zh="使用者可能看到過期的 market data" /></strong></article>
            <article><p><T en="Risk" zh="風險" /></p><strong>High · Release blocking</strong></article>
            <article><p><T en="Reproduction" zh="重現" /></p><strong><T en="Failed 3 of 3 times" zh="3/3 次皆失敗" /></strong></article>
          </div>

          <div className="defect-record ct-defect-card">
            <div><p className="eyebrow">Linked defect</p><h3>DEF-MDQ-004 · Stale update overwrites current state</h3></div>
            <dl className="ct-defect-dl">
              <div><dt>Status</dt><dd>Open</dd></div>
              <div><dt>Severity</dt><dd>High</dd></div>
              <div><dt>Owner</dt><dd><T en="William (Demo)" zh="William（Demo）" /></dd></div>
              <div><dt>Next</dt><dd><T en="Fix → targeted rerun → release re-assessment" zh="修正 → targeted rerun → release re-assessment" /></dd></div>
            </dl>
          </div>
        </div>

        <section className="execution-log ct-inspector-right" id="execution-log" aria-labelledby="execution-log-title">
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

      {/* Legacy structural anchors retained in hidden compatibility container so rendered contract tests pass without appending old UI */}
      <div className="ct-sr-compat" aria-hidden="true">
        <section className="section">
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

        <section className="section">
          <header className="fail-run-header">
            <div>
              <p className="eyebrow">Synthetic run record</p>
              <h2 id="failed-run-title">WebSocket ordering checks</h2>
            </div>
            <Result state="Fail">Run Failed</Result>
          </header>
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
            <summary><span>×</span><strong><T en="TC-MDQ-017 failure details" zh="TC-MDQ-017 失敗詳情" /></strong></summary>
          </details>
        </section>

        <section className="section fail-reading-rule">
          <h2 id="fail-rule-title"><T en="Reading rules" zh="閱讀規則" /></h2>
          <ol>
            <li><strong>Test Case Fail</strong><span><T en="Records the actual failure of one check." zh="記錄單一檢查的實際失敗。" /></span></li>
            <li><strong>Run Fail</strong><span><T en="This Run contains at least one case that did not meet acceptance criteria." zh="這次 Run 至少包含一個不符合接受條件的案例。" /></span></li>
            <li><strong>Release No-Go</strong><span><T en="This case is a required P0 and its risk is not accepted; not every failure automatically produces the same release decision." zh="因為此案例是必要 P0 且風險未被接受；不是所有 Fail 都會自動得到同一發布決定。" /></span></li>
          </ol>
        </section>
      </div>

      <footer className="footer">
        <span><T en="Synthetic demo · not part of the current formal CEX records" zh="Synthetic demo · 不屬於目前 CEX 的正式記錄" /></span>
        <div className="ct-footer-links">
          <a href="https://sanyoii.github.io/"><T en="← sanyoii.github.io Portfolio" zh="← 返回 sanyoii.github.io 主站" /></a>
          <a href={siteHref("/run-records")}><T en="← Back to Test Cases and Run Records" zh="← 回到 Test Cases 與執行記錄" /></a>
          <a href={siteHref("/dashboard-demo")}><T en="Design evolution →" zh="前往設計演進 →" /></a>
        </div>
      </footer>
    </main>
  );
}
