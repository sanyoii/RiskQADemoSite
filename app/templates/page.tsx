import { siteHref } from "../_site";
import { T } from "../_i18n";
import { RecordPage } from "../_record-page";
import { qaTemplateLinks } from "../../lib/p3-pages.mjs";

export const dynamic = "force-static";

export default function TemplatesPage() {
  const base = siteHref("/qa-templates/");
  const links = qaTemplateLinks(base) as Array<{ id: string; slug: string; en: string; zh: string; hrefEn: string; hrefZh: string }>;
  return (
    <RecordPage
      active="templates"
      title={{ en: "QA templates — QA Decision Desk", zh: "QA 範本 — QA 決策台" }}
      description={{
        en: "Nine QA templates for reading and copying fields. They are not an approval system.",
        zh: "九份 QA 範本，供閱讀與複製欄位，不是核准系統。",
      }}
      heading={{ en: "QA templates", zh: "QA 範本" }}
      eyebrow={{ en: "Nine reading copies", zh: "九份閱讀版" }}
    >
      <p className="record-lead">
        <T
          en="Each link opens the matching reading copy. English and Traditional Chinese stay in the same document pair."
          zh="每條連結開啟對應的閱讀版。英文與繁體中文是同一份文件的兩個版本。"
        />
      </p>
      <ol className="template-list">
        {links.map((item) => (
          <li data-template-id={item.id} key={item.id}>
            <a href={item.hrefEn} data-href-en={item.hrefEn} data-href-zh={item.hrefZh}>
              <code>{item.id}</code> <T en={item.en} zh={item.zh} />
            </a>
          </li>
        ))}
      </ol>
    </RecordPage>
  );
}
