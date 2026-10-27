import data from "../data/decision-index.json";
import registry from "../data/repos/index.json";
import cexPreviousRelease from "../test-records/releases/2026-09-06/cex/release-evidence.json";
import cexCurrentRelease from "../test-records/releases/2026-09-07/cex/release-evidence.json";
import { comparisonRows, previousComparisonUrls, summarizeExitCriteria, summarizeRisks } from "../lib/homepage-brief.mjs";

export const dashboardData = data;

const releasePackets: Record<string, { previous: typeof cexPreviousRelease; current: typeof cexCurrentRelease }> = {
  "https://github.com/sanyoii/cex-market-data-quality-lab": {
    previous: cexPreviousRelease,
    current: cexCurrentRelease,
  },
};

export function homepageExitCriteria() {
  return summarizeExitCriteria(dashboardData.repositories.map((repo) => ({
    repository: repo.snapshot.repository.name,
    exitCriteria: repo.decision.exitCriteria,
  })));
}

export function homepageRisks() {
  return summarizeRisks(dashboardData.repositories.flatMap((repo) => repo.risks ?? []));
}

export function homepagePreviousComparisons(now = new Date()) {
  const allowed = new Set(previousComparisonUrls(registry));
  return dashboardData.repositories.flatMap((repo) => {
    const url = repo.snapshot.repository.url;
    if (!allowed.has(url)) return [];
    const packets = releasePackets[url];
    if (!packets) return [];
    return [{
      repository: repo.snapshot.repository.name,
      rows: comparisonRows(packets.previous, packets.current, now),
    }];
  });
}
export type DashboardEntry = typeof data.repositories[number];
export const statusLabels: Record<string, { en: string; zh: string }> = {
  ready: { en: "Ready", zh: "就緒" },
  "at-risk": { en: "At Risk", zh: "有風險" },
  blocked: { en: "Blocked", zh: "受阻" },
  unknown: { en: "Unknown", zh: "未知" },
  stale: { en: "Expired", zh: "已過期" },
  unreachable: { en: "Unreachable", zh: "無法取得" },
  unverified: { en: "Unverified", zh: "尚未驗證" },
  fresh: { en: "Fresh", zh: "有效期內" },
};
