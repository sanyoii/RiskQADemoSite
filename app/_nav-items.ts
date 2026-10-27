export type ActivePageId = "dashboard" | "exit-criteria" | "risks" | "run-records" | "fail-demo" | "templates" | "dashboard-demo";

export const NAV_ITEMS: Array<{
  id: ActivePageId;
  en: string;
  zh: string;
  path: string;
  /** Flip to true when that page is part of the build. Hidden items are not rendered as links. */
  enabled: boolean;
  bilingualTemplates?: boolean;
}> = [
  { id: "dashboard", en: "Decision", zh: "決策", path: "/", enabled: true },
  { id: "exit-criteria", en: "Exit criteria", zh: "結束條件", path: "/exit-criteria", enabled: false },
  { id: "risks", en: "Risks", zh: "風險", path: "/risks", enabled: false },
  { id: "run-records", en: "Run records", zh: "執行紀錄", path: "/run-records", enabled: true },
  { id: "fail-demo", en: "Failure drill", zh: "失敗演練", path: "/run-records/fail-demo", enabled: true },
  { id: "templates", en: "QA templates", zh: "QA 範本", path: "/qa-templates/", enabled: true, bilingualTemplates: true },
  { id: "dashboard-demo", en: "Design history", zh: "設計演進", path: "/history", enabled: false },
];

export function navRoute(id: ActivePageId): { enabled: boolean; path: string } {
  const item = NAV_ITEMS.find((entry) => entry.id === id);
  if (!item) return { enabled: false, path: "" };
  return { enabled: item.enabled, path: item.path };
}
