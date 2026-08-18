import type { Metadata } from "next";
import { MergedRepoDashboard, TemplateFooter, TemplateHeader } from "../_template-parts";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "A+C Dashboard Template — Low-Tech Testing Dashboard",
  description: "Objective Cards 與 Repo Portfolio Matrix 組成的 Repo-Based QA dashboard template。",
};

export default function ObjectivePortfolioTemplate() {
  return (
    <main className="visual-samples site-template">
      <a className="vs-skip" href="#template-content">跳到 Dashboard 內容</a>
      <TemplateHeader current="ac" />
      <div className="st-content" id="template-content">
        <MergedRepoDashboard includeGates={false} />
      </div>
      <TemplateFooter />
    </main>
  );
}
