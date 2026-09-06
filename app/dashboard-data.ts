import data from "../data/decision-index.json";

export const dashboardData = data;
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
