import cexStatus from "../data/repos/sanyoii--cex-market-data-quality-lab.json";
import portfolioStatus from "../data/repos/sanyoii--sanyoii.github.io.json";
import { siteHref } from "./_site";

export type SignalTone = "good" | "warning" | "unknown";
export type GateState = "complete" | "blocked" | "unknown";
export type QualityTone = "good" | "warning" | "bad";

export type ProductArea = {
  id: string;
  name: string;
  effortLevel: string;
  executionState: string;
  coverage: string;
  targetCoverage: string;
  quality: QualityTone;
  comment: string;
  evidenceLinks: string[];
};

export type DashboardRepo = {
  name: string;
  version: string;
  objective: string;
  decision: string;
  decisionTone: SignalTone;
  decisionNote: string;
  effort: string;
  effortBars: number;
  coverage: string;
  coverageLabel: string;
  quality: string;
  qualityTone: QualityTone;
  qualityLabel: string;
  finalDecision: string;
  finalNote: string;
  gateSummary: string;
  nextAction: string;
  recordsHref: string;
  recordsLabel: string;
  dataStatus: string;
  syncedAt: string;
  productAreas: ProductArea[];
  gates: Array<{ id: string; title: string; note: string; state: GateState }>;
};

const snapshots = [cexStatus, portfolioStatus];
const effortBars = { none: 0, low: 1, medium: 3, high: 4 } as const;
const statusLabel = { ready: "Ready", "at-risk": "At Risk", blocked: "Blocked", unknown: "Unknown" } as const;
const decisionTone = { ready: "good", "at-risk": "warning", blocked: "warning", unknown: "unknown" } as const;
const finalDecision = { ready: "可以發布", "at-risk": "風險接受後發布", blocked: "不能發布", unknown: "尚未判定" } as const;

function evidenceHref(url: string) {
  return url.startsWith("/") ? siteHref(url) : url;
}

export const dashboardRepos: DashboardRepo[] = snapshots.map((snapshot) => {
  const assessment = snapshot.releaseAssessment.status as keyof typeof statusLabel;
  const effort = snapshot.summary.effortLevel as keyof typeof effortBars;
  const primaryEvidence = snapshot.runs[0]?.evidenceUrl ?? snapshot.repository.url;
  return {
    name: snapshot.repository.name,
    version: `${snapshot.repository.branch} · ${snapshot.repository.releaseTarget} · ${snapshot.repository.fullSha.slice(0, 7)}`,
    objective: snapshot.objective,
    decision: statusLabel[assessment],
    decisionTone: decisionTone[assessment],
    decisionNote: snapshot.summary.comment,
    effort: effort[0].toUpperCase() + effort.slice(1),
    effortBars: effortBars[effort],
    coverage: `Level ${snapshot.summary.coverage}`,
    coverageLabel: snapshot.summary.comment,
    quality: snapshot.summary.quality === "good" ? "Healthy" : snapshot.summary.quality === "warning" ? "Warning" : "Bad",
    qualityTone: snapshot.summary.quality as QualityTone,
    qualityLabel: snapshot.summary.comment,
    finalDecision: finalDecision[assessment],
    finalNote: snapshot.releaseAssessment.rationale,
    gateSummary: snapshot.gates.find((gate) => gate.id === "G6")?.title ?? "Gate status unavailable",
    nextAction: assessment === "ready" ? "Release approved · refresh before the assessment expires" : "Review required",
    recordsHref: evidenceHref(primaryEvidence),
    recordsLabel: snapshot.repository.name === "cex-market-data-quality-lab" ? "查看測試記錄" : "查看 GitHub Actions",
    dataStatus: snapshot.dataStatus,
    syncedAt: snapshot.provenance.syncedAt,
    productAreas: snapshot.productAreas as ProductArea[],
    gates: snapshot.gates as DashboardRepo["gates"],
  };
});

export const readyRepoCount = dashboardRepos.filter((repo) => repo.decision === "Ready").length;
export const templateRepo = dashboardRepos[0];
