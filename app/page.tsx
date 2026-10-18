import { siteHref } from "./_site";
import { pageLanguageData, T } from "./_i18n";
import { DecisionDashboard } from "./_dashboard";
import { ControlTowerNav } from "./_shared-nav";

export const dynamic = "force-static";
export default function Home() {
  return <main className="shell decision-desk ct-shell" {...pageLanguageData(
    { en: "QA Decision Desk — Risk-Based QA Records", zh: "QA 決策台 — 風險導向 QA 記錄" },
    { en: "Current release readiness, missing evidence and accountable next actions.", zh: "目前發布就緒度、缺少的證據與負責人的下一步。" },
  )}>
    <a className="vs-skip" href="#formal-dashboard"><T en="Skip to Repository Quality Dashboard" zh="跳到 Repository Quality Dashboard" /></a>
    <header className="masthead decision-masthead ct-topbar">
      <div className="ct-topbar-main">
        <div className="ct-topbar-left">
          <a className="ct-back-btn" href="https://sanyoii.github.io/">
            <T en="← sanyoii.github.io Portfolio" zh="← 返回 sanyoii.github.io 主站" />
          </a>
          <div className="ct-brand">
            <span className="ct-brand-dot" aria-hidden="true" />
            <div>
              <p className="eyebrow"><T en="Risk-Based QA · Read-only portfolio · Low-Tech Testing Dashboard" zh="風險導向 QA · 唯讀作品集 · Low-Tech Testing Dashboard" /></p>
              <h1>QA Decision Desk</h1>
            </div>
            <span className="ct-dne-badge"><T en="📌 DO NOT ERASE · LOW-TECH BOARD" zh="📌 DO NOT ERASE · 低科技決策白板" /></span>
            <span className="ct-brand-tag ct-sr-compat"><T en="B+C HYBRID · CONTROL TOWER" zh="B+C 混搭黃金版 · 風險決策控制台" /></span>
          </div>
        </div>
        <div className="ct-topbar-right">
          <div className="ct-snapshot-pill">
            <span aria-hidden="true">📌</span>
            <T en="Pinned Snapshot: 2026-09-07 · SHA fc1e060 & 643b017 · Historical Go Preserved" zh="鎖定快照：2026-09-07 · SHA fc1e060 & 643b017 · 保留歷史 Go 證據" />
          </div>
        </div>
      </div>
      <p className="ct-masthead-sub"><T en="Inspired by James Bach (1997): Do not count vanity numbers — make evidence-based assessments with 3-stage plain-language coverage milestones." zh="源自 James Bach (1997) Low-Tech Testing Dashboard：「不計算虛榮數字，而是基於證據做出主觀評估」——以三階段白話里程碑呈現測試深度與風險邊界。" /></p>
    </header>
    <ControlTowerNav active="dashboard" />
    <div id="formal-dashboard"><DecisionDashboard /></div>
    <div className="ct-legacy-ssr-contract" aria-hidden="true">
      <details className="decision-boundary"><summary><T en="Reading rules and limitations" zh="閱讀規則與限制" /></summary>
        <p><T en="Ready requires a coherent snapshot, current evidence and a linked, owner-approved release packet. Historical Ready is not current authorization." zh="Ready 需要一致的 snapshot、有效證據，以及已連結且由負責人核准的發布證據包。歷史 Ready 不是目前的發布授權。" /></p>
        <p><T en="Unknown means the evidence does not support a current decision; Unreachable does not mean product failure. This is not real-time monitoring." zh="Unknown 表示證據不足以支持目前判斷；Unreachable 不是產品故障，也不是即時監控。" /></p>
        <p><T en="No metric without measurement. Coverage levels describe the stated scope, not a percentage or quality guarantee. Automated review validates consistency, not oracle correctness or reviewer identity." zh="未量測就不顯示數字。覆蓋等級只描述已聲明的範圍，不是百分比或品質保證。自動審查驗證一致性，不證明 oracle 正確或審查者身分。" /></p>
      </details>
    </div>
    <footer className="footer">
      <span><T en="Sanitized public projection · original evidence retained" zh="已隱去敏感資訊的公開版 · 原始證據完整保留" /></span>
      <div className="ct-footer-links">
        <a href="https://sanyoii.github.io/"><T en="← Back to Main Portfolio" zh="← 返回個人主作品集" /></a>
        <a href={siteHref("/dashboard-demo")}><T en="Design evolution" zh="設計演進" /></a>
      </div>
    </footer>
  </main>;
}
