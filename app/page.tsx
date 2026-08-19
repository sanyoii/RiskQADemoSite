import Link from "next/link";
import { siteHref } from "./_site";
import { MergedRepoDashboard } from "./dashboard-demo/_template-parts";
import { readyRepoCount } from "./dashboard-data";

export const dynamic = "force-static";

export default function Home() {
  return (
    <main className="visual-samples site-template formal-dashboard">
      <a className="vs-skip" href="#formal-dashboard">跳到 Repository Quality Dashboard</a>

      <header className="st-header fd-header">
        <div className="st-topline">
          <p>Risk-Based QA Records · Pilot 0</p>
          <span>Read-only portfolio</span>
        </div>

        <div className="st-title-row">
          <div>
            <p className="st-overline">Low-Tech Testing Dashboard</p>
            <h1>QA Decision Desk</h1>
            <p>每個 Repo 一列；先看能不能發，需要時再展開 Gate 與測試記錄。</p>
          </div>
          <div className="st-release-summary">
            <small>Current portfolio</small>
            <span className="vs-signal" data-tone="good">
              <span className="vs-signal-mark" aria-hidden="true">✓</span>
              {`${readyRepoCount} releases ready`}
            </span>
          </div>
        </div>

        <nav className="st-nav" aria-label="Primary navigation">
          <span aria-current="page">Dashboard</span>
          <Link href={siteHref("/run-records")}>Test Cases 與執行記錄</Link>
          <Link href={siteHref("/run-records/fail-demo")}>Fail 與 Log Demo</Link>
          <Link href={siteHref("/dashboard-demo")}>Design Samples</Link>
        </nav>
      </header>

      <div className="st-content" id="formal-dashboard">
        <MergedRepoDashboard includeGates formal />

        <section className="fd-rules" aria-labelledby="status-rules-title">
          <details>
            <summary id="status-rules-title">查看狀態定義與資料邊界</summary>
            <div className="fd-rule-grid">
              <article>
                <p>Release Ready</p>
                <strong>正式 Go 已核准</strong>
                <span>CEX 的 G3 測試、外部檢視與 G6 正式 Go 紀錄已完成；portfolio site 也有 fresh local 與 CI checks。</span>
              </article>
              <article>
                <p>Ready</p>
                <strong>符合目前發布條件</strong>
                <span>不代表零缺陷，也不是品質保證。</span>
              </article>
              <article>
                <p>Unreachable</p>
                <strong>拿不到最新測試資料</strong>
                <span>不是產品故障，也不是即時監控。</span>
              </article>
              <article>
                <p>Data boundary</p>
                <strong>未量測就不顯示數字</strong>
                <span>Defect Finding、UX、Performance、Security 尚未納入本次 Pilot。</span>
              </article>
            </div>
          </details>
        </section>
      </div>

      <footer className="fd-footer">
        <div>
          <strong>Sanitized public projection</strong>
          <span>只顯示支援決定所需資訊；raw artifacts 與 protected receipts 不公開。</span>
        </div>
        <nav aria-label="Record links">
          <Link href={siteHref("/run-records")}>查看 Test Cases、Runs 與 Logs</Link>
        </nav>
      </footer>
    </main>
  );
}
