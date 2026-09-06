import { siteHref } from "../_site";
import { pageLanguageData, T } from "../_i18n";
export const dynamic = "force-static";
export default function DesignEvolution() {
  return <main className="shell design-history" {...pageLanguageData(
    { en: "Design Evolution — QA Decision Desk", zh: "設計演進 — QA 決策台" },
    { en: "Why the dashboard moved from visual samples to evidence-led decisions.", zh: "Dashboard 從視覺 Samples 走向證據導向判斷的設計取捨。" },
  )}>
    <header className="masthead"><div><p className="eyebrow"><T en="Design history · not a second status source" zh="設計歷史 · 不是另一份狀態來源" /></p><h1><T en="Design evolution" zh="設計演進" /></h1></div><a href={siteHref("/")}><T en="Current Dashboard" zh="目前 Dashboard" /></a></header>
    <p><T en="The original samples are retired as live dashboards. Their URLs remain available so existing links do not break." zh="原 Samples 已退役，不再作為即時 Dashboard；保留原網址，避免既有連結失效。" /></p>
    <ol className="decision-timeline">
      <li><strong>A · Objective Cards</strong><p><T en="Kept the clear management questions; removed repeated Ready claims and effort bars from the first screen." zh="保留清楚的管理問題；首頁移除重複的 Ready 主張與測試力度條。" /></p></li>
      <li><strong>B · Release Gate Flow</strong><p><T en="Kept traceability; gates are now explicitly historical, separated from today's eligibility." zh="保留可追溯性；Gate 明確標為歷史記錄，與今天是否有效分開。" /></p></li>
      <li><strong>C · Repo Portfolio Matrix</strong><p><T en="Kept the per-repository overview; replaced fixed Level 2+ decoration with data-driven coverage in details." zh="保留逐 Repo 總覽；將固定 Level 2+ 圖示改為明細中的資料驅動覆蓋。" /></p></li>
      <li><strong><T en="Decision Desk" zh="決策台" /></strong><p><T en="One policy supplies the current verdict, evidence gap, owner and next action. Replay preserves the distinction between observed history and synthetic teaching scenarios." zh="同一套規則提供目前判定、證據缺口、負責人與下一步。回放清楚區分實際歷史與合成教學情境。" /></p></li>
    </ol>
    <nav className="decision-nav"><a href={siteHref("/dashboard-demo/ac")}>A+C</a><a href={siteHref("/dashboard-demo/abc")}>A+B+C</a><a href={siteHref("/run-records/fail-demo")}><T en="Explore decision replay" zh="查看決定回放" /></a></nav>
  </main>;
}
