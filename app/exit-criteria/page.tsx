import { siteHref } from "../_site";
import { T } from "../_i18n";
import { RecordPage } from "../_record-page";
import { StatusLamp, type LampTone } from "../_status-lamp";
import { dashboardData } from "../dashboard-data";
import { exitCriteriaByRepo } from "../../lib/p3-pages.mjs";

export const dynamic = "force-static";

function runId(link: string) {
  const hash = link.split("#")[1] ?? link;
  return hash;
}

export default function ExitCriteriaPage() {
  const pages = exitCriteriaByRepo(dashboardData.repositories);
  return (
    <RecordPage
      active="exit-criteria"
      title={{ en: "Exit criteria — QA Decision Desk", zh: "結束條件 — QA 決策台" }}
      description={{
        en: "The four exit criteria for each repository, with links to the run records.",
        zh: "每個 repo 的四項結束條件，以及連到執行紀錄的證據。",
      }}
      heading={{ en: "Exit criteria", zh: "結束條件" }}
      eyebrow={{ en: "Same four criteria for every repository", zh: "每個 repo 都是同一組四項結束條件" }}
    >
      <p className="record-lead">
        <T
          en="Approval still within its validity period follows the QA decision list. Its owner writes that item into the process source separately."
          zh="「核准仍在效期內」依據 QA 定案清單。這一項由負責人另行寫入流程正本。"
        />
      </p>
      {pages.map((page: { repository: string; criteria: Array<{ id: string; title: { en: string; zh: string }; resultLabel: { en: string; zh: string }; tone: LampTone; evidence: { en: string; zh: string }; links: string[]; anchorId: string }> }) => (
        <section className="exit-criteria-repo" aria-labelledby={`exit-${page.repository}`} key={page.repository}>
          <h2 id={`exit-${page.repository}`}>{page.repository}</h2>
          {page.criteria.map((item) => (
            <article className="exit-criteria-row" data-criterion={item.id} id={item.anchorId} key={item.id}>
              <div className="exit-criteria-criterion">
                <code>{item.id}</code>
                <h3><T en={item.title.en} zh={item.title.zh} /></h3>
                <StatusLamp tone={item.tone} label={item.resultLabel} />
              </div>
              <div className="exit-criteria-evidence">
                <p><T en={item.evidence.en} zh={item.evidence.zh} /></p>
                <ul>
                  {item.links.map((link) => (
                    <li key={link}>
                      <a href={siteHref(link)}>
                        <T en="Run record" zh="執行紀錄" /> {runId(link)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>
      ))}
    </RecordPage>
  );
}
