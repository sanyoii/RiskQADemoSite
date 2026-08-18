import type { Metadata } from "next";
import { MergedRepoDashboard, TemplateFooter, TemplateHeader } from "../_template-parts";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "A+B+C Dashboard Template — Low-Tech Testing Dashboard",
  description: "Objective Cards、Release Gate Flow 與 Repo Portfolio Matrix 組成的完整 Repo-Based QA dashboard template。",
};

export default function FullDashboardTemplate() {
  return (
    <main className="visual-samples site-template">
      <a className="vs-skip" href="#template-content">跳到 Dashboard 內容</a>
      <TemplateHeader current="abc" />
      <div className="st-content" id="template-content">
        <MergedRepoDashboard includeGates />
      </div>
      <TemplateFooter />
    </main>
  );
}
