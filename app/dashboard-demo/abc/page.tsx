import type { Metadata } from "next";
import { MergedRepoDashboard, TemplateFooter, TemplateHeader } from "../_template-parts";
import { pageLanguageData, T } from "../../_i18n";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "A+B+C Dashboard Template — Low-Tech Testing Dashboard",
  description: "A complete Repo-Based QA dashboard template combining Objective Cards, Release Gate Flow, and a Repo Portfolio Matrix.",
};

export default function FullDashboardTemplate() {
  return (
    <main className="visual-samples site-template" {...pageLanguageData(
      { en: "A+B+C Dashboard Template — Low-Tech Testing Dashboard", zh: "A+B+C Dashboard 範本 — Low-Tech Testing Dashboard" },
      { en: "A complete Repo-Based QA dashboard template combining Objective Cards, Release Gate Flow, and a Repo Portfolio Matrix.", zh: "由 Objective Cards、Release Gate Flow 與 Repo Portfolio Matrix 組成的完整 Repo-Based QA dashboard 範本。" },
    )}>
      <a className="vs-skip" href="#template-content"><T en="Skip to Dashboard content" zh="跳到 Dashboard 內容" /></a>
      <TemplateHeader current="abc" />
      <div className="st-content" id="template-content">
        <MergedRepoDashboard includeGates />
      </div>
      <TemplateFooter />
    </main>
  );
}
