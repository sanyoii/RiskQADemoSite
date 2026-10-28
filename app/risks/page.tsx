import type { ReactNode } from "react";
import { siteHref } from "../_site";
import { T } from "../_i18n";
import { RecordPage } from "../_record-page";
import { dashboardData } from "../dashboard-data";
import catalog from "../../data/risks.json";
import { exclusionScope, sortRisks } from "../../lib/p3-pages.mjs";

export const dynamic = "force-static";

type RiskRow = {
  id: string;
  repository: string;
  severity: string;
  title: { en: string; zh: string };
  owner: string;
  handling: { en: string; zh: string };
  relatedExitCriterion: string | null;
  dueLabel: { en: string; zh: string };
  synthetic: boolean;
};

function Cell({ en, zh, children }: { en: string; zh: string; children: ReactNode }) {
  return <td data-label={en} data-label-en={en} data-label-zh={zh}>{children}</td>;
}

const S2_ACCOUNTS_ID = "RISK-auth-orders-funds";

function exclusionAlsoListedAsS2(item: { repository: string; en: string }, s2: RiskRow | undefined) {
  return s2?.id === S2_ACCOUNTS_ID
    && item.repository === s2.repository
    && item.en === "Authenticated accounts, orders and funds";
}

export default function RisksPage() {
  const rows = sortRisks(catalog.risks) as RiskRow[];
  const s2Accounts = rows.find((risk) => risk.id === S2_ACCOUNTS_ID);
  const excluded = exclusionScope(dashboardData.repositories) as Array<{ repository: string; en: string; zh: string }>;
  return (
    <RecordPage
      active="risks"
      title={{ en: "Risks — QA Decision Desk", zh: "風險 — QA 決策台" }}
      description={{
        en: "Risks in priority order from S1 to S3, plus scope that has no severity.",
        zh: "依優先順序由 S1 排到 S3 的風險，以及沒有嚴重度的排除範圍。",
      }}
      heading={{ en: "Risks", zh: "風險" }}
      eyebrow={{ en: "Priority order S1 to S3", zh: "優先順序由 S1 到 S3" }}
    >
      <p className="record-lead">
        <T
          en="Settled severity, owners, and handling are recorded as decisions."
          zh="嚴重度、負責人與處置都是已定案內容。"
        />
      </p>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div className="risk-table-wrap" tabIndex={0} role="region" aria-label="Risk table" data-aria-label-en="Risk table" data-aria-label-zh="風險表">
        <table className="risk-table">
          <thead>
            <tr>
              <th scope="col"><T en="Severity" zh="嚴重度" /></th>
              <th scope="col"><T en="Repository" zh="專案" /></th>
              <th scope="col"><T en="Risk" zh="風險" /></th>
              <th scope="col"><T en="Owner" zh="負責人" /></th>
              <th scope="col"><T en="Handling" zh="處置" /></th>
              <th scope="col"><T en="Related exit criterion" zh="相關結束條件" /></th>
              <th scope="col"><T en="Due" zh="期限" /></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((risk) => (
              <tr id={risk.id} data-risk-id={risk.id} data-severity={risk.severity} data-synthetic={risk.synthetic ? "true" : "false"} key={risk.id}>
                <Cell en="Severity" zh="嚴重度"><code>{risk.severity}</code></Cell>
                <Cell en="Repository" zh="專案">{risk.repository}</Cell>
                <Cell en="Risk" zh="風險"><T en={risk.title.en} zh={risk.title.zh} /></Cell>
                <Cell en="Owner" zh="負責人">{risk.owner}</Cell>
                <Cell en="Handling" zh="處置"><T en={risk.handling.en} zh={risk.handling.zh} /></Cell>
                <Cell en="Related exit criterion" zh="相關結束條件">
                  {risk.relatedExitCriterion
                    ? <a href={siteHref(`/exit-criteria/#${risk.repository}-${risk.relatedExitCriterion}`)}>{risk.relatedExitCriterion}</a>
                    : <T en="None" zh="無" />}
                </Cell>
                <Cell en="Due" zh="期限"><T en={risk.dueLabel.en} zh={risk.dueLabel.zh} /></Cell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="exclusion-block" id="excluded-scope" aria-labelledby="excluded-scope-title">
        <h2 id="excluded-scope-title"><T en="Excluded scope" zh="排除範圍" /></h2>
        <p>
          <T
            en="Load testing, browsers other than Chromium, and the other boundaries below have no severity."
            zh="負載測試、Chromium 以外的瀏覽器，以及下面其他邊界，都沒有嚴重度。"
          />
        </p>
        <ul className="exclusion-list">
          {excluded.map((item) => (
            <li data-repository={item.repository} key={`${item.repository}-${item.en}`}>
              <span>{item.repository}</span>
              <T en={item.en} zh={item.zh} />
              {exclusionAlsoListedAsS2(item, s2Accounts) ? (
                <a href={`#${S2_ACCOUNTS_ID}`}><T en="also listed as S2" zh="另列 S2" /></a>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </RecordPage>
  );
}
