import { siteHref } from "./_site";
import { pageLanguageData, T } from "./_i18n";
import { MergedRepoDashboard } from "./dashboard-demo/_template-parts";
import { readyRepoCount } from "./dashboard-data";

export const dynamic = "force-static";

export default function Home() {
  return (
    <main
      className="visual-samples site-template formal-dashboard"
      {...pageLanguageData(
        { en: "QA Decision Desk — Risk-Based QA Records", zh: "QA 決策台 — 風險導向 QA 記錄" },
        { en: "A human-readable QA portfolio showing release decisions, test records, and risk status.", zh: "以人類可讀的方式呈現發布判斷、測試記錄與風險狀態的 QA 作品集示範。" },
      )}
    >
      <a className="vs-skip" href="#formal-dashboard"><T en="Skip to Repository Quality Dashboard" zh="跳到 Repository Quality Dashboard" /></a>

      <header className="st-header fd-header">
        <div className="st-topline">
          <p>Risk-Based QA Records · Pilot 0</p>
          <span><T en="Read-only portfolio" zh="唯讀作品集" /></span>
        </div>

        <div className="st-title-row">
          <div>
            <p className="st-overline">Low-Tech Testing Dashboard</p>
            <h1>QA Decision Desk</h1>
            <p><T en="One row per repo. Check release readiness first, then expand gates and test records when needed." zh="每個 Repo 一列；先看能不能發，需要時再展開 Gate 與測試記錄。" /></p>
          </div>
          <div className="st-release-summary">
            <small><T en="Current portfolio" zh="目前作品集" /></small>
            <span className="vs-signal" data-tone="good">
              <span className="vs-signal-mark" aria-hidden="true">✓</span>
              {`${readyRepoCount} releases ready`}
            </span>
          </div>
        </div>

        <nav className="st-nav" aria-label="Primary navigation">
          <span aria-current="page">Dashboard</span>
          <a href={siteHref("/run-records")}><T en="Test Cases and Run Records" zh="Test Cases 與執行記錄" /></a>
          <a href={siteHref("/run-records/fail-demo")}><T en="Failure and Log Demo" zh="Fail 與 Log Demo" /></a>
          <a href={siteHref("/dashboard-demo")}><T en="Design Samples" zh="設計 Samples" /></a>
        </nav>
      </header>

      <div className="st-content" id="formal-dashboard">
        <MergedRepoDashboard includeGates formal />

        <section className="fd-rules" aria-labelledby="status-rules-title">
          <details>
            <summary id="status-rules-title"><T en="View status definitions and data boundaries" zh="查看狀態定義與資料邊界" /></summary>
            <div className="fd-rule-grid">
              <article>
                <p>Release Ready</p>
                <strong><T en="Formal Go approved" zh="正式 Go 已核准" /></strong>
                <span><T en="CEX G3 tests, external review, and the formal G6 Go record are complete; the portfolio site also has fresh local and CI checks." zh="CEX 的 G3 測試、外部檢視與 G6 正式 Go 紀錄已完成；portfolio site 也有 fresh local 與 CI checks。" /></span>
              </article>
              <article>
                <p>Ready</p>
                <strong><T en="Meets current release conditions" zh="符合目前發布條件" /></strong>
                <span><T en="This does not mean zero defects or provide a quality guarantee." zh="不代表零缺陷，也不是品質保證。" /></span>
              </article>
              <article>
                <p>Unreachable</p>
                <strong><T en="Latest test data is unavailable" zh="拿不到最新測試資料" /></strong>
                <span><T en="This does not indicate a product failure and is not real-time monitoring." zh="不是產品故障，也不是即時監控。" /></span>
              </article>
              <article>
                <p>Data boundary</p>
                <strong><T en="No metric without measurement" zh="未量測就不顯示數字" /></strong>
                <span><T en="Defect Finding, UX, Performance, and Security are outside this pilot." zh="Defect Finding、UX、Performance、Security 尚未納入本次 Pilot。" /></span>
              </article>
            </div>
          </details>
        </section>
      </div>

      <footer className="fd-footer">
        <div>
          <strong>Sanitized public projection</strong>
          <span><T en="Only decision-supporting information is shown; raw artifacts and protected receipts stay private." zh="只顯示支援決定所需資訊；raw artifacts 與 protected receipts 不公開。" /></span>
        </div>
        <nav aria-label="Record links">
          <a href={siteHref("/run-records")}><T en="View Test Cases, Runs, and Logs" zh="查看 Test Cases、Runs 與 Logs" /></a>
        </nav>
      </footer>
    </main>
  );
}
