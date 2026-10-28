import { siteHref } from "../_site";
import { T } from "../_i18n";
import { RecordPage } from "../_record-page";
import { historyRoutes } from "../../lib/p3-pages.mjs";

export const dynamic = "force-static";

const sketches = [
  { en: "Objective Cards", zh: "目標卡片", synthetic: true },
  { en: "Release Gate Flow", zh: "發布閘門流程", synthetic: true },
  { en: "Repo Portfolio Matrix", zh: "專案組合矩陣", synthetic: true },
];

export default function HistoryPage() {
  const history = historyRoutes();
  return (
    <RecordPage
      active="dashboard-demo"
      title={{ en: "Design evolution — QA Decision Desk", zh: "設計演進 — QA 決策台" }}
      description={{
        en: "Archived design evolution. Previous URLs still open their original pages in this build.",
        zh: "已封存的設計演進。這個版本的舊網址仍開啟原本的頁面。",
      }}
      heading={{ en: "Design evolution", zh: "設計演進" }}
      eyebrow={{ en: "Not a second status source", zh: "不是另一份狀態來源" }}
    >
      <p className="record-lead">
        <span className="archived-page-mark" data-archive-state="archived"><T en={history.archived.en} zh={history.archived.zh} /></span>
      </p>
      <p>
        <T
          en="This page is archived. The three previous addresses now use a meta refresh to /test-status/history/, with a canonical link and a link you can click. This page is that destination."
          zh="此頁已封存。三個舊網址現在用 meta refresh 轉到 /test-status/history/，並附上 canonical 與可點連結。本頁就是那個目標。"
        />
      </p>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div className="risk-table-wrap" tabIndex={0} role="region" aria-label="Previous addresses" data-aria-label-en="Previous addresses" data-aria-label-zh="先前網址">
        <table className="history-url-table">
          <thead>
            <tr>
              <th scope="col"><T en="Previous name" zh="舊名稱" /></th>
              <th scope="col"><T en="Address in this build" zh="這個版本的網址" /></th>
              <th scope="col"><T en="Published path" zh="發布路徑" /></th>
              <th scope="col"><T en="Redirects now" zh="現在是否跳轉" /></th>
            </tr>
          </thead>
          <tbody>
            {history.previous.map((item: { shortName: string; route: string; published: string; en: string; zh: string; redirectsNow: boolean }) => (
              <tr data-history-route={item.route} key={item.route}>
                <td><code>{item.shortName}</code><p><T en={item.en} zh={item.zh} /></p></td>
                <td><a href={siteHref(item.route)}>{item.route}</a></td>
                <td><code>{item.published}</code></td>
                <td data-redirects={item.redirectsNow ? "yes" : "no"}><T en={item.redirectsNow ? "Yes" : "No"} zh={item.redirectsNow ? "是" : "否"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        <T
          en={`Later destination: ${history.destination}`}
          zh={`之後的跳轉目標：${history.destination}`}
        />
      </p>
      <section aria-labelledby="retired-sketches-title">
        <h2 id="retired-sketches-title"><T en="Retired layout sketches" zh="已退役的版面示意" /></h2>
        <ul className="sketch-list">
          {sketches.map((item) => (
            <li data-synthetic={item.synthetic ? "true" : "false"} key={item.en}>
              <T en={item.en} zh={item.zh} />
              {item.synthetic ? <span className="sample-data-mark"><T en="Sample data" zh="範例資料" /></span> : null}
            </li>
          ))}
        </ul>
      </section>
    </RecordPage>
  );
}
