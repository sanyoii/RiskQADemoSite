import { T } from "../_i18n";
import { RecordPage } from "../_record-page";
import { dashboardData } from "../dashboard-data";
import { exitCriteriaByRepo } from "../../lib/p3-pages.mjs";
import { ExitCriterionArticle } from "../_view-time-approval";

export const dynamic = "force-static";

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
      {pages.map((page: { repository: string; criteria: Array<{ id: string; title: { en: string; zh: string }; resultLabel: { en: string; zh: string }; tone: "good" | "warning" | "bad" | "unknown"; evidence: { en: string; zh: string }; links: string[]; anchorId: string }> }) => (
        <section className="exit-criteria-repo" aria-labelledby={`exit-${page.repository}`} key={page.repository}>
          <h2 id={`exit-${page.repository}`}>{page.repository}</h2>
          {page.criteria.map((item) => (
            <ExitCriterionArticle repository={page.repository} item={item} key={item.id} />
          ))}
        </section>
      ))}
    </RecordPage>
  );
}
