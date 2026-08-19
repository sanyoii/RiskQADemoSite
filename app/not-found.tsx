import { pageLanguageData, T } from "./_i18n";
import { siteHref } from "./_site";

export default function NotFound() {
  return (
    <main className="shell not-found" {...pageLanguageData(
      { en: "Page not found — QA Decision Desk", zh: "找不到頁面 — QA Decision Desk" },
      { en: "The requested QA Decision Desk page does not exist.", zh: "要求的 QA Decision Desk 頁面不存在。" },
    )}>
      <div className="eyebrow">404 / QA Decision Desk</div>
      <h1><T en="Page not found" zh="找不到頁面" /></h1>
      <p><T en="The address may have changed, or the page may no longer exist." zh="網址可能已變更，或該頁面已不存在。" /></p>
      <a href={siteHref("/")}><T en="Back to Decision Desk" zh="回到 Decision Desk" /></a>
    </main>
  );
}
