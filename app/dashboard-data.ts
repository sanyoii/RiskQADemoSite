import cexStatus from "../data/repos/sanyoii--cex-market-data-quality-lab.json";
import portfolioStatus from "../data/repos/sanyoii--sanyoii.github.io.json";
import { siteHref } from "./_site";
import type { LocalizedText } from "./_i18n";

export type SignalTone = "good" | "warning" | "unknown";
export type GateState = "complete" | "blocked" | "unknown";
export type QualityTone = "good" | "warning" | "bad";

export type ProductArea = {
  id: string;
  name: LocalizedText;
  effortLevel: LocalizedText;
  executionState: LocalizedText;
  coverage: string;
  targetCoverage: string;
  quality: LocalizedText;
  comment: LocalizedText;
  evidenceLinks: string[];
};

export type DashboardRepo = {
  name: string;
  version: string;
  objective: LocalizedText;
  decision: LocalizedText;
  decisionTone: SignalTone;
  decisionNote: LocalizedText;
  effort: LocalizedText;
  effortBars: number;
  coverage: string;
  coverageLabel: LocalizedText;
  quality: LocalizedText;
  qualityTone: QualityTone;
  qualityLabel: LocalizedText;
  finalDecision: LocalizedText;
  finalNote: LocalizedText;
  gateSummary: LocalizedText;
  nextAction: LocalizedText;
  recordsHref: string;
  recordsLabel: LocalizedText;
  dataStatus: LocalizedText;
  syncedAt: string;
  productAreas: ProductArea[];
  gates: Array<{ id: string; title: LocalizedText; note: LocalizedText; state: GateState }>;
};

const snapshots = [cexStatus, portfolioStatus];
const effortBars = { none: 0, low: 1, medium: 3, high: 4 } as const;
const statusLabel = {
  ready: { en: "Ready", zh: "就緒" },
  "at-risk": { en: "At Risk", zh: "有風險" },
  blocked: { en: "Blocked", zh: "受阻" },
  unknown: { en: "Unknown", zh: "未知" },
} as const;
const decisionTone = { ready: "good", "at-risk": "warning", blocked: "warning", unknown: "unknown" } as const;
const finalDecision = {
  ready: { en: "Release", zh: "可以發布" },
  "at-risk": { en: "Release after risk acceptance", zh: "風險接受後發布" },
  blocked: { en: "Do not release", zh: "不能發布" },
  unknown: { en: "Not decided", zh: "尚未判定" },
} as const;
const effortLabel = {
  none: { en: "None", zh: "無" },
  low: { en: "Low", zh: "低" },
  medium: { en: "Medium", zh: "中" },
  high: { en: "High", zh: "高" },
} as const;
const qualityLabel = {
  good: { en: "Healthy", zh: "良好" },
  warning: { en: "Warning", zh: "警示" },
  bad: { en: "Bad", zh: "不佳" },
} as const;

const repoTranslations = {
  "cex-market-data-quality-lab": {
    objective: { en: "Release Readiness", zh: "發布就緒度" },
    summary: { en: "Formal Go approved", zh: "正式 Go 已核准" },
    rationale: { en: "Deterministic, live, and required manual evidence passed; formal Go was recorded.", zh: "Deterministic、live 與必要人工記錄皆通過，且已完成正式 Go 紀錄。" },
    nextAction: { en: "Release approved · refresh before the assessment expires", zh: "發布已核准 · assessment 到期前重新整理" },
    recordsLabel: { en: "View test records", zh: "查看測試記錄" },
    productAreas: {
      deterministic: { name: { en: "Deterministic checks", zh: "Deterministic 檢查" }, comment: { en: "Unit, contract, and meta checks passed.", zh: "Unit、contract 與 meta checks 已通過。" } },
      "market-data": { name: { en: "Live market data", zh: "Live market data" }, comment: { en: "Required public-endpoint checks passed.", zh: "必要的 public endpoint 檢查已通過。" } },
      "order-book": { name: { en: "Order-book synchronization", zh: "Order-book 同步" }, comment: { en: "Sequence and stale-update paths were exercised.", zh: "已涵蓋 sequence 與 stale-update 路徑。" } },
      evidence: { name: { en: "Evidence and release decision", zh: "記錄與發布決定" }, comment: { en: "Manual evidence review and the G6 decision were completed.", zh: "人工記錄檢視與 G6 決定已完成。" } },
    },
    gates: {
      G1: { title: { en: "Scope locked", zh: "範圍已鎖定" }, note: { en: "Scope complete", zh: "範圍完成" } },
      G3: { title: { en: "Tests passed", zh: "測試已通過" }, note: { en: "3 test categories complete", zh: "3 類測試完成" } },
      G5: { title: { en: "External review complete", zh: "外部檢視完成" }, note: { en: "Feedback received", zh: "回饋已取得" } },
      G6: { title: { en: "Formal Go recorded", zh: "正式 Go 紀錄完成" }, note: { en: "Release authorized", zh: "發布已核准" } },
      Release: { title: { en: "Ready", zh: "就緒" }, note: { en: "Release allowed", zh: "可以發布" } },
    },
  },
  "sanyoii.github.io": {
    objective: { en: "Deployment Confidence", zh: "部署信心" },
    summary: { en: "17 fresh cases passed", zh: "17 個 fresh cases 通過" },
    rationale: { en: "The test-gated workflow passed 17 portfolio checks plus Dashboard contract, rendered, lint, and export checks before deployment.", zh: "部署前，test-gated workflow 已通過 17 項 portfolio checks，以及 Dashboard contract、rendered、lint 與 export checks。" },
    nextAction: { en: "Release approved · refresh before the assessment expires", zh: "發布已核准 · assessment 到期前重新整理" },
    recordsLabel: { en: "View GitHub Actions", zh: "查看 GitHub Actions" },
    productAreas: {
      document: { name: { en: "Document integrity and privacy", zh: "文件完整性與隱私" }, comment: { en: "Structure, URL allowlist, and phone-data checks passed.", zh: "結構、URL allowlist 與 phone-data checks 已通過。" } },
      responsive: { name: { en: "Responsive layout", zh: "Responsive 版面" }, comment: { en: "375, 768, and 1440 px overflow checks passed.", zh: "375、768 與 1440 px overflow checks 已通過。" } },
      bilingual: { name: { en: "Bilingual behavior", zh: "雙語行為" }, comment: { en: "Language toggle, metadata, and persisted state passed.", zh: "Language toggle、metadata 與 persisted state 已通過。" } },
      runtime: { name: { en: "Runtime and accessibility behavior", zh: "Runtime 與 accessibility 行為" }, comment: { en: "No external requests, reduced motion, and 404 behavior passed.", zh: "No external requests、reduced motion 與 404 行為已通過。" } },
    },
    gates: {
      G1: { title: { en: "Test scope defined", zh: "測試範圍已定義" }, note: { en: "TESTPLAN.md · 12 checks", zh: "TESTPLAN.md · 12 項檢查" } },
      G3: { title: { en: "17 fresh cases passed", zh: "17 個 fresh cases 通過" }, note: { en: "Python 3.14.2 · Chromium", zh: "Python 3.14.2 · Chromium" } },
      G5: { title: { en: "Test-gated build passed", zh: "Test-gated build 通過" }, note: { en: "Portfolio + Dashboard checks", zh: "Portfolio + Dashboard checks" } },
      G6: { title: { en: "Pages production verified", zh: "Pages production 已驗證" }, note: { en: "8 routes + CSS · HTTP 200", zh: "8 routes + CSS · HTTP 200" } },
      Release: { title: { en: "Released", zh: "已發布" }, note: { en: "Production verified", zh: "Production 已驗證" } },
    },
  },
} as const;

function evidenceHref(url: string) {
  return url.startsWith("/") ? siteHref(url) : url;
}

export const dashboardRepos: DashboardRepo[] = snapshots.map((snapshot) => {
  const assessment = snapshot.releaseAssessment.status as keyof typeof statusLabel;
  const effort = snapshot.summary.effortLevel as keyof typeof effortBars;
  const quality = snapshot.summary.quality as keyof typeof qualityLabel;
  const translations = repoTranslations[snapshot.repository.name as keyof typeof repoTranslations];
  const primaryEvidence = snapshot.runs[0]?.evidenceUrl ?? snapshot.repository.url;
  return {
    name: snapshot.repository.name,
    version: `${snapshot.repository.branch} · ${snapshot.repository.releaseTarget} · ${snapshot.repository.fullSha.slice(0, 7)}`,
    objective: translations.objective,
    decision: statusLabel[assessment],
    decisionTone: decisionTone[assessment],
    decisionNote: translations.summary,
    effort: effortLabel[effort],
    effortBars: effortBars[effort],
    coverage: `Level ${snapshot.summary.coverage}`,
    coverageLabel: translations.summary,
    quality: qualityLabel[quality],
    qualityTone: snapshot.summary.quality as QualityTone,
    qualityLabel: translations.summary,
    finalDecision: finalDecision[assessment],
    finalNote: translations.rationale,
    gateSummary: translations.gates.G6.title,
    nextAction: assessment === "ready" ? translations.nextAction : { en: "Review required", zh: "需要檢視" },
    recordsHref: evidenceHref(primaryEvidence),
    recordsLabel: translations.recordsLabel,
    dataStatus: { en: snapshot.dataStatus[0].toUpperCase() + snapshot.dataStatus.slice(1), zh: snapshot.dataStatus === "fresh" ? "最新" : snapshot.dataStatus },
    syncedAt: snapshot.provenance.syncedAt,
    productAreas: snapshot.productAreas.map((area) => {
      const translated = translations.productAreas[area.id as keyof typeof translations.productAreas];
      return {
        ...area,
        name: translated.name,
        effortLevel: effortLabel[area.effortLevel as keyof typeof effortLabel],
        executionState: { en: area.executionState[0].toUpperCase() + area.executionState.slice(1), zh: area.executionState === "complete" ? "完成" : area.executionState },
        quality: qualityLabel[area.quality as keyof typeof qualityLabel],
        comment: translated.comment,
      };
    }),
    gates: snapshot.gates.map((gate) => {
      const translated = translations.gates[gate.id as keyof typeof translations.gates];
      return { id: gate.id, title: translated.title, note: translated.note, state: gate.state as GateState };
    }),
  };
});

export const readyRepoCount = dashboardRepos.filter((repo) => repo.decision.en === "Ready").length;
export const templateRepo = dashboardRepos[0];
