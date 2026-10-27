// View data for the four P3 pages. Pages render this; they do not invent a second catalog.

export const DUE_WHEN_UNSET = {
  en: "To be decided on the launch date",
  zh: "待上線日決定",
};

const SEVERITY_RANK = { S1: 1, S2: 2, S3: 3 };

const RESULT_LABEL = {
  met: { en: "Met", zh: "已滿足", tone: "good" },
  "not-met": { en: "Not met", zh: "未滿足", tone: "bad" },
  unknown: { en: "To be confirmed", zh: "待確認", tone: "unknown" },
};

const EXCLUSION_ZH = {
  "Human manual testing": "人工測試",
  "Authenticated accounts, orders and funds": "已登入帳戶、下單與資金",
  "Production trading-system certification": "正式交易系統驗證",
  "Load and production reconnect testing": "負載與正式環境重連測試",
  "Fresh production-site verification": "正式站最新驗證",
  "Browsers other than Chromium": "Chromium 以外的瀏覽器",
  "Performance testing": "效能測試",
  "Full accessibility conformance certification": "完整無障礙符合性驗證",
};

export const QA_TEMPLATES = [
  { id: "00", slug: "qa-test-request", en: "QA Test Request", zh: "QA 測試申請" },
  { id: "01", slug: "quality-risk-assessment", en: "Quality Risk Assessment", zh: "品質風險評估" },
  { id: "02", slug: "test-spec-template", en: "Test Specification", zh: "測試規格" },
  { id: "03", slug: "test-scenario-template", en: "Test Scenario", zh: "測試情境" },
  { id: "04", slug: "test-case-template", en: "Test Case", zh: "測試案例" },
  { id: "05", slug: "run-log", en: "Test Run Record", zh: "測試執行紀錄" },
  { id: "06", slug: "bug-report-template", en: "Defect Report", zh: "缺陷報告" },
  { id: "07", slug: "quality-report", en: "Release Quality Summary", zh: "發布品質摘要" },
  { id: "08", slug: "dashboard-status-contract", en: "Dashboard Status Contract", zh: "看板狀態合約" },
];

export function exitCriteriaByRepo(repositories) {
  return (repositories ?? []).map((repo) => {
    const name = repo?.snapshot?.repository?.name ?? repo?.repository ?? "";
    const criteria = (repo?.decision?.exitCriteria ?? repo?.exitCriteria ?? []).map((item) => {
      const result = RESULT_LABEL[item.result] ?? RESULT_LABEL.unknown;
      const links = Array.isArray(item.evidence?.links) ? item.evidence.links : [];
      return {
        id: item.id,
        title: item.title,
        result: item.result,
        resultLabel: { en: result.en, zh: result.zh },
        tone: result.tone,
        evidence: { en: item.evidence?.en ?? "", zh: item.evidence?.zh ?? "" },
        links,
        anchorId: `${name}-${item.id}`,
      };
    });
    return { repository: name, criteria };
  });
}

export function dueLabel(dueAt) {
  if (dueAt == null || dueAt === "") return DUE_WHEN_UNSET;
  return { en: String(dueAt), zh: String(dueAt) };
}

export function sortRisks(risks) {
  return [...(risks ?? [])]
    .map((risk) => ({
      ...risk,
      dueLabel: dueLabel(risk.dueAt),
      synthetic: risk.synthetic === true,
    }))
    .sort((left, right) => (SEVERITY_RANK[left.severity] ?? 9) - (SEVERITY_RANK[right.severity] ?? 9));
}

export function exclusionScope(repositories) {
  return (repositories ?? []).flatMap((repo) => {
    const name = repo?.snapshot?.repository?.name ?? "";
    return (repo?.snapshot?.excludedScope ?? []).map((en) => ({
      repository: name,
      en,
      zh: EXCLUSION_ZH[en] ?? en,
    }));
  });
}

export function qaTemplateLinks(prefix = "/qa-templates/") {
  const base = prefix.endsWith("/") ? prefix : `${prefix}/`;
  return QA_TEMPLATES.map((item) => ({
    ...item,
    hrefEn: `${base}${item.slug}.en.html`,
    hrefZh: `${base}${item.slug}.html`,
  }));
}

export function historyRoutes() {
  const previous = [
    {
      shortName: "/dashboard-demo",
      route: "/dashboard-demo",
      published: "/test-status/dashboard-demo/",
      en: "Previous design evolution page",
      zh: "先前的設計演進頁",
    },
    {
      shortName: "/abc",
      route: "/dashboard-demo/abc",
      published: "/test-status/dashboard-demo/abc/",
      en: "Retired A+B+C sample. /abc is this page, not a separate root address.",
      zh: "已退役的 A＋B＋C 示意。／abc 指的是這個頁面，不是另一個根路徑。",
    },
    {
      shortName: "/ac",
      route: "/dashboard-demo/ac",
      published: "/test-status/dashboard-demo/ac/",
      en: "Retired A+C sample. /ac is this page, not a separate root address.",
      zh: "已退役的 A＋C 示意。／ac 指的是這個頁面，不是另一個根路徑。",
    },
  ];
  return {
    archived: { en: "Archived", zh: "已封存" },
    destination: "/test-status/history/",
    redirectsInThisBuild: false,
    previous: previous.map((item) => ({ ...item, redirectsNow: false })),
  };
}
