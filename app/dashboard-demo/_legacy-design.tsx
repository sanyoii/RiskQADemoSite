import { siteHref } from "../_site";
import { pageLanguageData, T } from "../_i18n";
export function LegacyDesign({ name }: { name: string }) {
  return <main className="shell design-history" {...pageLanguageData(
    { en: `${name} — Retired Design Sample`, zh: `${name} — 已退役設計 Sample` },
    { en: "A compatible historical link to the consolidated Decision Desk.", zh: "保留舊連結，導向已整合的決策台。" },
  )}>
    <header className="masthead"><div><p className="eyebrow"><T en="Retired sample · no current status claims" zh="已退役 Sample · 不提供目前狀態主張" /></p><h1>{name}</h1></div></header>
    <p><T en="This sample has been consolidated into the current Dashboard. Historical approvals are no longer duplicated here." zh="此 Sample 已整合進目前 Dashboard，不再於此重複顯示歷史核准。" /></p>
    <nav className="decision-nav"><a href={siteHref("/")}><T en="Current Dashboard" zh="目前 Dashboard" /></a><a href={siteHref("/dashboard-demo")}><T en="Design evolution" zh="設計演進" /></a></nav>
  </main>;
}
