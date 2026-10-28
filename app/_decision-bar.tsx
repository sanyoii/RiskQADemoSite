"use client";

import { entryDecisionAt } from "../lib/approval-expiry.mjs";
import {
  decisionVerdict,
  lampLegends,
  pinnedSnapshotLine,
  projectStatusLine,
  readApprovalExpired,
  taipeiParts,
} from "../lib/decision-bar-copy.mjs";
import { suggestedAction } from "../lib/decision-actions.mjs";
import { dashboardData, type DashboardEntry } from "./dashboard-data";
import { DecisionBarDetails } from "./_decision-bar-details";
import { T } from "./_i18n";
import { StatusLamp, type LampTone } from "./_status-lamp";
import { ApprovalComputedNote, LiveDecisionLamp, useViewNow } from "./_view-time-approval";

function toRepo(entry: DashboardEntry, now: number | null) {
  const assessment = entry.snapshot.releaseAssessment;
  const live = now == null ? null : entryDecisionAt(entry, new Date(now));
  return {
    name: entry.snapshot.repository.name,
    archived: entry.archived === true,
    decisionOwner: entry.decisionBar.decisionOwner,
    decidedAt: entry.decisionBar.decidedAt,
    expiresAt: entry.decisionBar.expiresAt,
    decidedLabel: taipeiParts(entry.decisionBar.decidedAt),
    expiresLabel: taipeiParts(entry.decisionBar.expiresAt),
    status: live ? live.status : entry.decisionBar.status,
    approvalExpired: live ? live.expired === true : readApprovalExpired(entry.decision, entry.risks),
    nextStep: live ? suggestedAction(live.view) : entry.decisionBar.nextStep,
    shortSha: entry.snapshot.repository.fullSha.slice(0, 7),
    selfReview: Boolean(assessment.reviewer) && assessment.reviewer === assessment.decisionOwner,
  };
}

export function DecisionBar() {
  const now = useViewNow();
  const repos = dashboardData.repositories.map((entry) => toRepo(entry, now));
  const verdict = decisionVerdict(repos);
  const legends = lampLegends(repos);
  const snapshot = pinnedSnapshotLine(repos);

  return (
    <section
      className="decision-bar-shell"
      aria-label="Release decisions"
      data-aria-label-en="Release decisions"
      data-aria-label-zh="發布決策"
    >
      <h2 className="decision-bar-title"><T en="Release decisions" zh="發布決策" /></h2>
      <p className="decision-bar-verdict"><T en={verdict.en} zh={verdict.zh} /></p>
      <ol className="decision-bar-rows">
        {repos.map((repo) => {
          const line = projectStatusLine({
            status: repo.status,
            approvalExpired: repo.approvalExpired,
            expiresEn: repo.expiresLabel?.en ?? "",
            expiresZh: repo.expiresLabel?.zh ?? "",
          });
          return (
            <li className="decision-bar-row" data-status={repo.status} key={repo.name}>
              <LiveDecisionLamp repositoryName={repo.name} buildStatus={repo.status} />
              <span className="decision-bar-repo">{repo.name}</span>
              <span className="decision-bar-status-line"><T en={line.en} zh={line.zh} /></span>
            </li>
          );
        })}
      </ol>
      <div className="decision-bar-legend">
        {legends.map((legend) => (
          <p className="decision-bar-legend-item" key={legend.status}>
            <StatusLamp tone={legend.tone as LampTone} label={{ en: legend.en, zh: legend.zh }} />
            <span className="decision-bar-legend-text"><T en={legend.explanation.en} zh={legend.explanation.zh} /></span>
          </p>
        ))}
      </div>
      <DecisionBarDetails>
        <summary className="decision-bar-summary" aria-expanded="false" aria-controls="decision-bar-panel">
          <span className="when-closed"><T en="Show decision details" zh="展開決策細節" /></span>
          <span className="when-open"><T en="Collapse" zh="收合" /></span>
        </summary>
        <div className="decision-bar-panel" id="decision-bar-panel">
          <ol className="decision-bar-details-list">
            {repos.map((repo) => (
              <li className="decision-bar-detail" key={repo.name}>
                <div className="decision-bar-detail-head">
                  <LiveDecisionLamp repositoryName={repo.name} buildStatus={repo.status} />
                  {repo.archived ? (
                    <span className="archived-demo" data-marker="archived-demo">
                      <T en="Archived demo" zh="封存展示" />
                    </span>
                  ) : null}
                  <span className="decision-bar-repo">{repo.name}</span>
                </div>
                <p className="decision-bar-field">
                  <span className="decision-bar-kicker"><T en="Decision maker" zh="決策人" /></span>
                  <strong>{repo.decisionOwner}</strong>
                </p>
                <p className="decision-bar-field">
                  <span className="decision-bar-kicker"><T en="Decision date" zh="決策日" /></span>
                  <time dateTime={repo.decidedAt}><T en={repo.decidedLabel?.en ?? ""} zh={repo.decidedLabel?.zh ?? ""} /></time>
                </p>
                <p className="decision-bar-field">
                  <span className="decision-bar-kicker"><T en="Expiry" zh="到期日" /></span>
                  <time dateTime={repo.expiresAt}><T en={repo.expiresLabel?.en ?? ""} zh={repo.expiresLabel?.zh ?? ""} /></time>
                </p>
                <p className="decision-bar-field decision-bar-next">
                  <span className="decision-bar-kicker"><T en="Next step" zh="下一步" /></span>
                  {repo.nextStep ? <T en={repo.nextStep.en} zh={repo.nextStep.zh} /> : <T en="No further action." zh="沒有後續動作。" />}
                </p>
              </li>
            ))}
          </ol>
          <p className="decision-bar-snapshot"><T en={snapshot.en} zh={snapshot.zh} /></p>
        </div>
      </DecisionBarDetails>
      <ApprovalComputedNote computedOn={dashboardData.evaluatedOn} />
    </section>
  );
}
