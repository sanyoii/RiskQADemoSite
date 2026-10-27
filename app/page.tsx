import type { ReactNode } from "react";
import { siteHref } from "./_site";
import { pageLanguageData, T } from "./_i18n";
import { DecisionDashboard } from "./_dashboard";
import { ControlTowerNav } from "./_shared-nav";
import { homepageExitCriteria, homepagePreviousComparisons, homepageRisks } from "./dashboard-data";
import { navRoute, type ActivePageId } from "./_nav-items";
import { StatusLamp, type LampTone } from "./_status-lamp";
import { LiveExpiryComparison } from "./_view-time-approval";

function PendingPageLink({ id, children }: { id: ActivePageId; children: ReactNode }) {
  const route = navRoute(id);
  if (route.enabled) return <a className="home-page-link" href={siteHref(route.path)}>{children}</a>;
  return (
    <p className="home-pending-link">
      <span className="home-page-link is-pending" data-pending-route={route.path}>{children}</span>
      <span className="home-pending-note"><T en="This page is not in this build yet." zh="這個版本還沒有這一頁。" /></span>
    </p>
  );
}

function HomeBrief() {
  const exitCriteria = homepageExitCriteria();
  const risks = homepageRisks();
  const comparisons = homepagePreviousComparisons();
  const counts = exitCriteria.counts;
  return (
    <div className="home-brief" id="home-brief">
      <section className="home-brief-card" data-home-section="exit-criteria" data-met={counts.met} data-not-met={counts.notMet} data-unknown={counts.unknown} aria-labelledby="home-exit-title">
        <h2 id="home-exit-title"><T en="Exit criteria" zh="結束條件" /></h2>
        <p className="home-brief-lead">
          <T
            en={`Not met ${counts.notMet}, to be confirmed ${counts.unknown}, met ${counts.met}. Counts come from each repository's exit criteria.`}
            zh={`未滿足 ${counts.notMet}、待確認 ${counts.unknown}、已滿足 ${counts.met}。數字由各 repo 的結束條件計算。`}
          />
        </p>
        <ul className="home-brief-list">
          {exitCriteria.byId.map((item: { id: string; title: { en: string; zh: string }; notMet: number; unknown: number; met: number }) => (
            <li key={item.id} data-criterion={item.id}>
              <code>{item.id}</code>
              <T en={item.title.en} zh={item.title.zh} />
              <T
                en={`Not met ${item.notMet}, to be confirmed ${item.unknown}, met ${item.met}`}
                zh={`未滿足 ${item.notMet}、待確認 ${item.unknown}、已滿足 ${item.met}`}
              />
            </li>
          ))}
        </ul>
        <h3><T en="Unmet items" zh="未滿足項" /></h3>
        <ul className="home-brief-list">
          {exitCriteria.unmet.map((item: { id: string; title: { en: string; zh: string }; repository: string }) => (
            <li key={`${item.repository}-${item.id}`} data-unmet={item.id} data-repository={item.repository}>
              <code>{item.id}</code>
              <T en={item.title.en} zh={item.title.zh} />
              <span>{item.repository}</span>
            </li>
          ))}
        </ul>
        <PendingPageLink id="exit-criteria"><T en="See all" zh="看全部" /></PendingPageLink>
      </section>
      <section className="home-brief-card" data-home-section="risks" data-s1-count={risks.s1.length} data-other-risks={risks.otherCount} aria-labelledby="home-risk-title">
        <h2 id="home-risk-title"><T en="Risks" zh="風險" /></h2>
        <p className="home-brief-lead"><T en="By priority, the homepage shows S1 only." zh="依優先順序，首頁只顯示 S1。" /></p>
        <ul className="home-brief-list">
          {risks.s1.map((risk: { id: string; severity: string; repository: string; title: { en: string; zh: string }; handling: { en: string; zh: string } }) => (
            <li key={risk.id} data-risk-id={risk.id} data-severity={risk.severity}>
              <code>{risk.severity}</code>
              <span>{risk.repository}</span>
              <T en={risk.title.en} zh={risk.title.zh} />
              <T en={risk.handling.en} zh={risk.handling.zh} />
            </li>
          ))}
        </ul>
        <PendingPageLink id="risks">
          <T en={`Open the risks page (${risks.otherCount} others)`} zh={`看風險頁（其餘 ${risks.otherCount} 項）`} />
        </PendingPageLink>
      </section>
      {comparisons.map((section) => (
        <section className="home-brief-card" data-home-section="previous-comparison" data-repository={section.repository} aria-labelledby="home-compare-title" key={section.repository}>
          <h2 id="home-compare-title"><T en={`Compared with last time · ${section.repository}`} zh={`跟上次相比 · ${section.repository}`} /></h2>
          <ul className="home-brief-list">
            {section.rows.map((row) => (
              <li className="home-compare-row" data-comparison-row={row.id} key={row.id}>
                <span><T en={row.field.en} zh={row.field.zh} /></span>
                {row.id === "expiry"
                  ? <LiveExpiryComparison repository={section.repository} initial={{ tone: row.tone as LampTone, label: row.label }} />
                  : <StatusLamp tone={row.tone as LampTone} label={row.label} />}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

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
            <T en="Pinned snapshot: 2026-09-07 · SHA fc1e060 & 643b017 · expired self-review, not a current Go" zh="鎖定快照：2026-09-07 · SHA fc1e060 與 643b017 · 自審已過期，不是目前的 Go" />
          </div>
        </div>
      </div>
      <p className="ct-masthead-sub"><T en="Inspired by James Bach (1997): Do not count vanity numbers — make evidence-based assessments with 3-stage plain-language coverage milestones." zh="源自 James Bach (1997) Low-Tech Testing Dashboard：「不計算虛榮數字，而是基於證據做出主觀評估」——以三階段白話里程碑呈現測試深度與風險邊界。" /></p>
    </header>
    <ControlTowerNav active="dashboard" />
    <div id="formal-dashboard">
      <HomeBrief />
      <DecisionDashboard />
    </div>
    <div className="ct-legacy-ssr-contract" aria-hidden="true">
      <details className="decision-boundary"><summary><T en="Reading rules and limitations" zh="閱讀規則與限制" /></summary>
        <p><T en="Ready requires a coherent snapshot, current evidence and a linked, owner-approved release packet. Historical Ready is not current authorization." zh="Ready 需要一致的 snapshot、有效證據，以及已連結且由負責人核准的發布證據包。歷史 Ready 不是目前的發布授權。" /></p>
        <p><T en="Unknown means the evidence does not support a current decision; Unreachable does not mean product failure. This is not real-time monitoring." zh="Unknown 表示證據不足以支援目前判斷；Unreachable 不是產品故障，也不是即時監控。" /></p>
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
