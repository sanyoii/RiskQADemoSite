import { siteHref } from "./_site";
import { pageLanguageData, T } from "./_i18n";
import { DecisionDashboard } from "./_dashboard";

export const dynamic = "force-static";
export default function Home() {
  return <main className="shell decision-desk" {...pageLanguageData(
    { en: "QA Decision Desk — Risk-Based QA Records", zh: "QA 決策台 — 風險導向 QA 記錄" },
    { en: "Current release readiness, missing evidence and accountable next actions.", zh: "目前發布就緒度、缺少的證據與負責人的下一步。" },
  )}>
    <a className="vs-skip" href="#formal-dashboard"><T en="Skip to Repository Quality Dashboard" zh="跳到 Repository Quality Dashboard" /></a>
    <header className="masthead decision-masthead"><div><p className="eyebrow"><T en="Risk-Based QA · Read-only portfolio" zh="風險導向 QA · 唯讀作品集" /></p><h1>QA Decision Desk</h1><p><T en="Can we release? What is missing? Who decides?" zh="能不能發？缺什麼？誰來決定？" /></p></div></header>
    <nav className="decision-nav" aria-label="Primary navigation" data-aria-label-en="Primary navigation" data-aria-label-zh="主要導覽">
      <span aria-current="page">Dashboard</span>
      <a href={siteHref("/run-records")}><T en="Test Cases and Run Records" zh="Test Cases 與執行記錄" /></a>
      <a href={siteHref("/run-records/fail-demo")}><T en="Failure and Decision Replay" zh="失敗案例與決定回放" /></a>
    </nav>
    <div id="formal-dashboard"><DecisionDashboard /></div>
    <details className="decision-boundary"><summary><T en="Reading rules and limitations" zh="閱讀規則與限制" /></summary>
      <p><T en="Ready requires a coherent snapshot, current evidence and a linked, owner-approved release packet. Historical Ready is not current authorization." zh="Ready 需要一致的 snapshot、有效證據，以及已連結且由負責人核准的發布證據包。歷史 Ready 不是目前的發布授權。" /></p>
      <p><T en="Unknown means the evidence does not support a current decision; Unreachable does not mean product failure. This is not real-time monitoring." zh="Unknown 表示證據不足以支持目前判斷；Unreachable 不是產品故障，也不是即時監控。" /></p>
      <p><T en="No metric without measurement. Coverage levels describe the stated scope, not a percentage or quality guarantee. Automated review validates consistency, not oracle correctness or reviewer identity." zh="未量測就不顯示數字。覆蓋等級只描述已聲明的範圍，不是百分比或品質保證。自動審查驗證一致性，不證明 oracle 正確或審查者身分。" /></p>
    </details>
    <footer className="footer"><span><T en="Sanitized public projection · original evidence retained" zh="去敏後的公開呈現 · 原始證據保留" /></span><a href={siteHref("/dashboard-demo")}><T en="Design evolution" zh="設計演進" /></a></footer>
  </main>;
}
