"use client";

import { useEffect, useState } from "react";
import { decisionView, safeEvidenceUrl, coverageLevels, POLICY_VERSION } from "../lib/decision-policy.mjs";
import { dashboardData, statusLabels } from "./dashboard-data";
import { T, type LocalizedText } from "./_i18n";
import { siteHref } from "./_site";
import { suggestedAction } from "../lib/decision-actions.mjs";

const verdicts = {
  ready: { en: "Ready", zh: "可發布", icon: "✓" },
  "at-risk": { en: "At Risk", zh: "有風險", icon: "!" },
  blocked: { en: "No-Go", zh: "不可發布", icon: "×" },
  unknown: { en: "Unknown", zh: "待確認", icon: "?" },
};
type Verdict = keyof typeof verdicts;
type ScenarioId = "cex-go" | "portfolio-go" | "hold-sim";
type ThemeMode = "dark" | "light";

const THEME_STORE = "wl-qa-theme";

// Translate exact recorded wording only; snapshots and their integrity digests stay unchanged.
const historicalGateEnglish: Record<string, string> = {
  "範圍已鎖定": "Scope locked",
  "測試已通過": "Tests passed",
  "3 類測試完成": "3 test categories completed",
  "外部檢視完成": "External review completed",
  "回饋已取得": "Feedback received",
  "正式 Go 紀錄完成": "Formal Go record completed",
  "測試範圍已定義": "Test scope defined",
};

function HistoricalGateText({ value }: { value: string }) {
  return <T en={historicalGateEnglish[value] ?? value} zh={value} />;
}

function Label({ value }: { value: string }) {
  return <T {...(statusLabels[value] ?? { en: value, zh: value })} />;
}
function EvidenceLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return safeEvidenceUrl(href) ? <a className={className} href={href.startsWith("/") ? siteHref(href) : href}>{children}</a> : <span><T en="Link withheld" zh="連結已隱藏" /></span>;
}

interface ScenarioConfig {
  id: ScenarioId;
  tabTitle: LocalizedText;
  badgeText: string;
  badgeType: "go" | "hold";
  tabSub: LocalizedText;
  activeLabel: string;
  risks: Array<{ tier: "P0" | "P1"; label: LocalizedText; status: LocalizedText }>;
  exclusions: LocalizedText[];
  suiteTitle: LocalizedText;
  suiteBadge: string;
  suiteBadgeType: "go" | "hold";
  suites: Array<{ label: LocalizedText; result: string; tone: "pass" | "fail" | "warn" }>;
  secondaryTitle: LocalizedText;
  secondaryTag: string;
  secondaryItems: Array<{ label: LocalizedText; result: string; tone: "pass" | "fail" | "warn" }>;
  triageTitle: LocalizedText;
  triageBadge: string;
  triageBadgeType: "go" | "hold";
  triageItems: Array<{ label: LocalizedText; result: LocalizedText; tone: "pass" | "warn" | "fail" }>;
  verdictBig: LocalizedText;
  verdictSub: LocalizedText;
  verdictTone: "go" | "hold";
  criteriaCount: string;
  criteria: Array<{ label: LocalizedText; result: LocalizedText; tone: "pass" | "warn" | "fail" }>;
  evidenceAnchor: string;
  evidenceAnchorLabel: string;
}

const scenarioConfigs: Record<ScenarioId, ScenarioConfig> = {
  "cex-go": {
    id: "cex-go",
    tabTitle: { en: "① CEX Market Data Lab", zh: "① CEX 行情品質實驗室" },
    badgeText: "GO · fc1e060",
    badgeType: "go",
    tabSub: { en: "45/45 checks pass · 40 deterministic + 5 live", zh: "45/45 項檢查通過 · 40 項自動化 + 5 項即時行情" },
    activeLabel: "cex-market-data-quality-lab @ SHA fc1e060",
    risks: [
      { tier: "P0", label: { en: "Order Book Sequence & State Integrity", zh: "Order Book 序號與狀態完整性" }, status: { en: "Covered", zh: "已覆蓋" } },
      { tier: "P0", label: { en: "REST & WebSocket Schema Contract", zh: "REST 與 WebSocket 結構契約" }, status: { en: "Covered", zh: "已覆蓋" } },
      { tier: "P1", label: { en: "Public Binance Live Feed Handshake", zh: "Binance 公開即時行情連線驗證" }, status: { en: "Covered", zh: "已覆蓋" } },
      { tier: "P1", label: { en: "Documentation & Claim Boundary Sync", zh: "文件與主張邊界一致性檢查" }, status: { en: "Covered", zh: "已覆蓋" } },
    ],
    exclusions: [
      { en: "Authenticated Orders / Funds", zh: "私密金鑰與真實下單資金" },
      { en: "Load / Stress Reconnect", zh: "高併發壓測與生產重連" },
      { en: "Human Manual UI Tour", zh: "人工手動介面探索" },
    ],
    suiteTitle: { en: "Deterministic Gate Suite", zh: "Deterministic 自動化測試套件" },
    suiteBadge: "40 / 40 PASS",
    suiteBadgeType: "go",
    suites: [
      { label: { en: "Order Book Unit Checks (test_order_book)", zh: "Order Book 單元檢查 (test_order_book)" }, result: "12/12 PASS", tone: "pass" },
      { label: { en: "REST Contract Suite (test_rest_contract)", zh: "REST 契約測試 (test_rest_contract)" }, result: "11/11 PASS", tone: "pass" },
      { label: { en: "WebSocket Contract (test_websocket_contract)", zh: "WebSocket 契約測試 (test_websocket_contract)" }, result: "12/12 PASS", tone: "pass" },
      { label: { en: "Documentation Meta (test_documentation)", zh: "文件一致性檢查 (test_documentation)" }, result: "5/5 PASS", tone: "pass" },
    ],
    secondaryTitle: { en: "Public Market-Data Live Integration", zh: "公開即時行情整合驗證 (Live)" },
    secondaryTag: "5 / 5 PASS",
    secondaryItems: [
      { label: { en: "Live REST Market Endpoint Checks", zh: "即時 REST 行情端點檢查" }, result: "3/3 PASS", tone: "pass" },
      { label: { en: "Live WebSocket Stream Checks", zh: "即時 WebSocket 串流檢查" }, result: "2/2 PASS", tone: "pass" },
      { label: { en: "JUnit SHA-256 Digest Verification", zh: "JUnit 原始產物 SHA-256 雜湊驗證" }, result: "VERIFIED", tone: "pass" },
    ],
    triageTitle: { en: "Pinned Release Run (SHA fc1e060)", zh: "鎖定版本執行結果 (SHA fc1e060)" },
    triageBadge: "0 BLOCKERS",
    triageBadgeType: "go",
    triageItems: [
      { label: { en: "Open P0 / P1 Release-Blocking Defects", zh: "未關閉之 P0 / P1 阻擋缺陷" }, result: { en: "0 Open", zh: "0 個未關" }, tone: "pass" },
      { label: { en: "Prior Sept 6 Baseline Runs Retained", zh: "保留 9/6 前置執行歷史紀錄" }, result: { en: "4 Runs Linked", zh: "4 筆 Run 已連結" }, tone: "warn" },
    ],
    verdictBig: { en: "✓ GO — SCOPED RELEASE APPROVED", zh: "✓ GO — 限定範圍驗收通過" },
    verdictSub: { en: "Pinned SHA fc1e060 · Verified 2026-09-07 · Coverage Level 2", zh: "鎖定 SHA fc1e060 · 2026-09-07 驗證 · 覆蓋等級 Level 2" },
    verdictTone: "go",
    criteriaCount: "4/4 Met",
    criteria: [
      { label: { en: "G1 · Automated Scope & Exclusions Locked", zh: "G1 · 自動化範圍與排除項已鎖定" }, result: { en: "✓ YES", zh: "✓ 通過" }, tone: "pass" },
      { label: { en: "G3 · Deterministic (40) + Live (5) Suites", zh: "G3 · 自動化 (40) + 即時 (5) 套件全過" }, result: { en: "✓ 45/45", zh: "✓ 45/45" }, tone: "pass" },
      { label: { en: "Zero Open P0 / P1 Blocking Defects", zh: "零開放之 P0 / P1 發布阻擋缺陷" }, result: { en: "✓ 0 Open", zh: "✓ 0 阻擋" }, tone: "pass" },
      { label: { en: "G6 · Owner Self-Review & Overlap Disclosed", zh: "G6 · 負責人自審與角色重疊已揭露" }, result: { en: "✓ Disclosed", zh: "✓ 已揭露" }, tone: "warn" },
    ],
    evidenceAnchor: "/run-records/#RUN-20260907-cex-deterministic-1",
    evidenceAnchorLabel: "#RUN-20260907-cex-deterministic-1 ↗",
  },
  "portfolio-go": {
    id: "portfolio-go",
    tabTitle: { en: "② Portfolio Acceptance", zh: "② 個人主站驗收 (sanyoii.github.io)" },
    badgeText: "GO · 643b017",
    badgeType: "go",
    tabSub: { en: "22/22 checks pass · 1 prior Blocked attempt retained", zh: "22/22 項檢查通過 · 保留 1 次前置 Blocked 紀錄" },
    activeLabel: "sanyoii.github.io @ SHA 643b017",
    risks: [
      { tier: "P0", label: { en: "Primary CTA, Proof Links & 404 Routing", zh: "主要 CTA、證據連結與 404 路由" }, status: { en: "Covered", zh: "已覆蓋" } },
      { tier: "P0", label: { en: "Bilingual EN / Traditional Chinese Parity", zh: "英／繁中雙語切換與內容對齊" }, status: { en: "Covered", zh: "已覆蓋" } },
      { tier: "P1", label: { en: "Responsive Chromium Layouts (Desktop/Mobile)", zh: "Chromium 響應式版面 (桌機／手機)" }, status: { en: "Covered", zh: "已覆蓋" } },
      { tier: "P1", label: { en: "Reduced-Motion & Accessibility Guardrails", zh: "減敏動態與基礎無障礙防線" }, status: { en: "Covered", zh: "已覆蓋" } },
    ],
    exclusions: [
      { en: "Non-Chromium Browsers", zh: "非 Chromium 瀏覽器矩陣" },
      { en: "Load / Performance Stress", zh: "效能與高併發壓力測試" },
      { en: "Full WCAG Certification", zh: "完整無障礙合規認證" },
    ],
    suiteTitle: { en: "Static & Chromium Acceptance Suite", zh: "靜態結構與 Chromium 驗收套件" },
    suiteBadge: "22 / 22 PASS",
    suiteBadgeType: "go",
    suites: [
      { label: { en: "Static HTML & Asset Integrity (test_static)", zh: "靜態 HTML 與資源完整性 (test_static)" }, result: "9/9 PASS", tone: "pass" },
      { label: { en: "Playwright Chromium Runtime (test_runtime)", zh: "Playwright Chromium 執行期檢查 (test_runtime)" }, result: "13/13 PASS", tone: "pass" },
      { label: { en: "Bilingual Toggle & Metadata Sync", zh: "雙語切換與 Metadata 同步檢查" }, result: "VERIFIED", tone: "pass" },
      { label: { en: "Mobile Viewport & Reduced Motion", zh: "行動端視窗與 Reduced Motion 檢查" }, result: "VERIFIED", tone: "pass" },
    ],
    secondaryTitle: { en: "Append-Only Attempt Chronology", zh: "不可竄改之執行歷程 (Append-Only)" },
    secondaryTag: "2 ATTEMPTS",
    secondaryItems: [
      { label: { en: "Attempt 1 · Initial Run (Environment Blocked)", zh: "第 1 次執行 · 初始環境受阻 (Blocked)" }, result: "9/22 BLOCKED", tone: "warn" },
      { label: { en: "Attempt 2 · Retry Run (Full Suite Passed)", zh: "第 2 次執行 · 排除環境後重跑全過" }, result: "22/22 PASS", tone: "pass" },
      { label: { en: "Prior Attempt Link Preserved in Packet", zh: "前置失敗紀錄完整保留於證據包" }, result: "AUDITED", tone: "pass" },
    ],
    triageTitle: { en: "Pinned Release Run (SHA 643b017)", zh: "鎖定版本執行結果 (SHA 643b017)" },
    triageBadge: "0 BLOCKERS",
    triageBadgeType: "go",
    triageItems: [
      { label: { en: "Open P0 / P1 Product Defects on Retry", zh: "重跑後未關閉之 P0 / P1 產品缺陷" }, result: { en: "0 Open", zh: "0 個未關" }, tone: "pass" },
      { label: { en: "Initial Blocked Run Retained (Not Erased)", zh: "初始 Blocked 紀錄完整保留（未抹除）" }, result: { en: "1 Retained", zh: "保留 1 筆" }, tone: "warn" },
    ],
    verdictBig: { en: "✓ GO — SCOPED RELEASE APPROVED", zh: "✓ GO — 限定範圍驗收通過" },
    verdictSub: { en: "Pinned SHA 643b017 · Verified 2026-09-06 · Coverage Level 2", zh: "鎖定 SHA 643b017 · 2026-09-06 驗證 · 覆蓋等級 Level 2" },
    verdictTone: "go",
    criteriaCount: "4/4 Met",
    criteria: [
      { label: { en: "G1 · Automated Scope & Exclusions Locked", zh: "G1 · 自動化範圍與排除項已鎖定" }, result: { en: "✓ YES", zh: "✓ 通過" }, tone: "pass" },
      { label: { en: "G3 · Static (9) + Chromium Runtime (13)", zh: "G3 · 靜態 (9) + Chromium 執行期 (13) 全過" }, result: { en: "✓ 22/22", zh: "✓ 22/22" }, tone: "pass" },
      { label: { en: "Earlier Blocked Attempt Linked in Ledger", zh: "前置 Blocked 紀錄已串接於帳本" }, result: { en: "✓ Linked", zh: "✓ 已串接" }, tone: "pass" },
      { label: { en: "G6 · Owner Self-Review & Overlap Disclosed", zh: "G6 · 負責人自審與角色重疊已揭露" }, result: { en: "✓ Disclosed", zh: "✓ 已揭露" }, tone: "warn" },
    ],
    evidenceAnchor: "/run-records/#RUN-20260906-portfolio-chromium-retry",
    evidenceAnchorLabel: "#RUN-20260906-portfolio-chromium-retry ↗",
  },
  "hold-sim": {
    id: "hold-sim",
    tabTitle: { en: "③ Counterfactual Hold Demo", zh: "③ 反事實攔截示範 (Hold / No-Go)" },
    badgeText: "HOLD · DEMO-FAIL",
    badgeType: "hold",
    tabSub: { en: "Blocked by P0 stale-sequence defect DEF-MDQ-004", zh: "因 P0 過期序號缺陷 DEF-MDQ-004 觸發攔截" },
    activeLabel: "DEMO-RUN-FAIL-001 · Counterfactual Gate Rejection",
    risks: [
      { tier: "P0", label: { en: "TC-MDQ-017 · Reject Stale Sequence Updates", zh: "TC-MDQ-017 · 拒絕過期序號覆蓋最新狀態" }, status: { en: "FAILED", zh: "驗證失敗" } },
      { tier: "P0", label: { en: "TC-MDQ-016 · Sequential Order Book Update", zh: "TC-MDQ-016 · 依序遞增更新 Order Book" }, status: { en: "Covered", zh: "已覆蓋" } },
      { tier: "P1", label: { en: "TC-MDQ-018 · Reconnect Snapshot Recovery", zh: "TC-MDQ-018 · 斷線重連後恢復最新快照" }, status: { en: "Covered", zh: "已覆蓋" } },
      { tier: "P1", label: { en: "G6 · Passing Rerun Cannot Self-Approve Go", zh: "G6 · 重跑通過不得自動跳過負責人核准" }, status: { en: "Enforced", zh: "強制攔截" } },
    ],
    exclusions: [
      { en: "Synthetic Teaching Scenario", zh: "合成教學情境（非真實產品結果）" },
      { en: "Never Overwrites Real Pass Ledger", zh: "絕不覆寫真實 Pass 帳本" },
    ],
    suiteTitle: { en: "WebSocket Ordering Suite (DEMO-RUN-FAIL-001)", zh: "WebSocket 序號檢查套件 (DEMO-RUN-FAIL-001)" },
    suiteBadge: "1 FAILED · 2 PASS",
    suiteBadgeType: "hold",
    suites: [
      { label: { en: "TC-MDQ-016 · Sequential Update Accepted", zh: "TC-MDQ-016 · 接受依序遞增之更新" }, result: "PASS (0.18s)", tone: "pass" },
      { label: { en: "TC-MDQ-017 · Stale Sequence 103 After 104", zh: "TC-MDQ-017 · 收到 104 後拒絕舊序號 103" }, result: "FAIL (Exit 1)", tone: "fail" },
      { label: { en: "TC-MDQ-018 · Reconnect Snapshot Recovery", zh: "TC-MDQ-018 · 斷線重連後恢復最新快照" }, result: "PASS (0.44s)", tone: "pass" },
      { label: { en: "Pytest Execution Log & Assertion Trace", zh: "Pytest 執行日誌與 Assertion 追蹤" }, result: "CAPTURED", tone: "warn" },
    ],
    secondaryTitle: { en: "Decision Replay Boundary (3 Stages)", zh: "決策邊界回放（三階段狀態機）" },
    secondaryTag: "STOPS AT HOLD",
    secondaryItems: [
      { label: { en: "Stage 1 · P0 Failure Detected", zh: "階段 1 · 偵測到 P0 必要案例失敗" }, result: "NO-GO", tone: "fail" },
      { label: { en: "Stage 2 · Fix Proposed Without Rerun", zh: "階段 2 · 僅提出修正但尚未重跑驗證" }, result: "NO-GO", tone: "fail" },
      { label: { en: "Stage 3 · Rerun Passed (Awaiting G6 Sign-Off)", zh: "階段 3 · 重跑通過（待負責人 G6 簽核）" }, result: "HOLD", tone: "warn" },
    ],
    triageTitle: { en: "Active Blocker Triage (DEF-MDQ-004)", zh: "活躍阻擋缺陷分析 (DEF-MDQ-004)" },
    triageBadge: "1 P0 BLOCKER",
    triageBadgeType: "hold",
    triageItems: [
      { label: { en: "DEF-MDQ-004 · Stale sequence 103 overwrote 104", zh: "DEF-MDQ-004 · 舊序號 103 覆蓋最新狀態 104" }, result: { en: "High · Open", zh: "高風險 · 未關閉" }, tone: "fail" },
      { label: { en: "Reproduction Rate Across Attempts", zh: "多次執行重現率" }, result: { en: "3 / 3 Failed", zh: "3 / 3 次皆失敗" }, tone: "fail" },
    ],
    verdictBig: { en: "× NO-GO / HOLD — RELEASE BLOCKED", zh: "× NO-GO / HOLD — 攔截禁止發布" },
    verdictSub: { en: "P0 Risk Unaccepted · Requires Fix + Targeted Rerun + Owner G6 Review", zh: "P0 風險未接受 · 須完成修正 + 重跑 + 負責人 G6 重審" },
    verdictTone: "hold",
    criteriaCount: "Gate Blocked",
    criteria: [
      { label: { en: "G1 · Required P0 Risk Mitigation", zh: "G1 · 必要 P0 風險緩解" }, result: { en: "× FAILED", zh: "× 未通過" }, tone: "fail" },
      { label: { en: "G3 · Required Automated Suite Pass", zh: "G3 · 必要自動化套件全數通過" }, result: { en: "× 2/3 Pass", zh: "× 2/3 通過" }, tone: "fail" },
      { label: { en: "Open P0 / P1 Blocking Defects", zh: "未關閉之 P0 / P1 阻擋缺陷" }, result: { en: "× DEF-MDQ-004", zh: "× DEF-MDQ-004" }, tone: "fail" },
      { label: { en: "G6 · Passing Rerun Alone Cannot Authorize Go", zh: "G6 · 單靠重跑通過不會自動變成 Go" }, result: { en: "! Hold Rule", zh: "! 維持 Hold" }, tone: "warn" },
    ],
    evidenceAnchor: "/run-records/fail-demo",
    evidenceAnchorLabel: "Open Fail Demo ↗",
  },
};

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.getElementById("ctThemeDark")?.classList.toggle("is-on", mode === "dark");
  document.getElementById("ctThemeLight")?.classList.toggle("is-on", mode === "light");
}

export function DecisionDashboard() {
  const [clock, setClock] = useState<number | null>(null);
  const [filter, setFilter] = useState<Verdict | null>(null);
  const [activeScenario, setActiveScenario] = useState<ScenarioId>("cex-go");

  useEffect(() => {
    const refresh = () => setClock(Date.now());
    refresh();
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, []);

  useEffect(() => {
    let saved: ThemeMode = "dark";
    try {
      const stored = localStorage.getItem(THEME_STORE);
      if (stored === "light" || stored === "dark") saved = stored;
    } catch {
      saved = "dark";
    }
    applyTheme(saved);
  }, []);

  function switchTheme(next: ThemeMode) {
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORE, next);
    } catch {
      return;
    }
  }

  const entries = dashboardData.repositories.map(entry => ({ ...entry, current: decisionView(entry.snapshot, {
    now: new Date(clock ?? 0), clockConfirmed: clock !== null, enforceReview: true, releaseReview: entry.releaseReview,
  }) }));
  const visible = entries.filter(entry => !filter || entry.current.status === filter);
  const activeConfig = scenarioConfigs[activeScenario];
  const totalChecksPassed = dashboardData.repositories.reduce((sum, r) => sum + (r.runMetrics?.latestChecksPassed ?? 0), 0);
  const totalChecksCount = dashboardData.repositories.reduce((sum, r) => sum + (r.runMetrics?.latestChecksTotal ?? 0), 0);

  return <section className="decision-dashboard" aria-labelledby="repo-quality-title">
    {/* Control Strip: Interactive Scenario Switcher (Option C) + 4 Telemetry KPIs (Option B) */}
    <div className="ct-control-strip">
      <div className="ct-scenario-bar">
        <div className="ct-scenario-header">
          <span className="ct-scenario-label">
            <T en="Interactive Release Decision Scenarios (Click to Switch Traceability Board)" zh="互動式發布決策情境（點選切換下方四步追溯看板）" />
          </span>
          <div className="ct-theme-switch" role="group" aria-label="Theme mode" data-aria-label-en="Theme mode" data-aria-label-zh="主題模式">
            <button type="button" id="ctThemeDark" className="is-on" onClick={() => switchTheme("dark")}>
              <T en="🌙 Dark Tower" zh="🌙 深色控制台" />
            </button>
            <button type="button" id="ctThemeLight" onClick={() => switchTheme("light")}>
              <T en="☀️ Light" zh="☀️ 淺色紙質" />
            </button>
          </div>
        </div>
        <div className="ct-scenario-tabs" role="group" aria-label="Release decision scenarios" data-aria-label-en="Release decision scenarios" data-aria-label-zh="發布決策情境切換">
          {(Object.values(scenarioConfigs)).map(item => (
            <button
              type="button"
              key={item.id}
              className={`ct-s-tab ${activeScenario === item.id ? (item.badgeType === "hold" ? "is-active-hold" : "is-active-go") : ""} ${item.badgeType === "hold" ? "is-hold-tab" : ""}`}
              aria-pressed={activeScenario === item.id}
              onClick={() => setActiveScenario(item.id)}
            >
              <span className="ct-s-tab-top">
                <strong><T {...item.tabTitle} /></strong>
                <code className={item.badgeType === "hold" ? "ct-badge-hold" : "ct-badge-go"}>{item.badgeText}</code>
              </span>
              <span className="ct-s-tab-sub"><T {...item.tabSub} /></span>
            </button>
          ))}
        </div>
      </div>

      <div className="ct-kpi-grid">
        <div className="ct-kpi-card">
          <span className="ct-kpi-title"><T en="Pinned Snapshots" zh="鎖定快照決策" /></span>
          <strong className="ct-kpi-val ct-val-green">2 GO / 1 HOLD</strong>
          <span className="ct-kpi-sub"><T en="2 Scoped Go + 1 Hold Demo" zh="2 個 Scoped Go + 1 個攔截示範" /></span>
        </div>
        <div className="ct-kpi-card">
          <span className="ct-kpi-title"><T en="Verified Checks" zh="已驗證測試總數" /></span>
          <strong className="ct-kpi-val ct-val-blue">{`${totalChecksPassed} / ${totalChecksCount} PASS`}</strong>
          <span className="ct-kpi-sub"><T en="45 CEX + 22 Portfolio Checks" zh="45 項 CEX + 22 項主站檢查" /></span>
        </div>
        <div className="ct-kpi-card">
          <span className="ct-kpi-title"><T en="Evidence Pack" zh="QA 證據鏈模板" /></span>
          <strong className="ct-kpi-val ct-val-purple">00–08 Linked</strong>
          <span className="ct-kpi-sub"><T en="9 Canonical QA Templates" zh="9 份標準 QA 模板串接" /></span>
        </div>
        <div className="ct-kpi-card">
          <span className="ct-kpi-title"><T en="Commit Truth Sync" zh="版本與雜湊同步" /></span>
          <strong className="ct-kpi-val ct-val-amber">SHA-256 Match</strong>
          <span className="ct-kpi-sub"><T en="Unified JSON + JUnit Digest" zh="統一 JSON 與 JUnit 雜湊" /></span>
        </div>
      </div>
    </div>

    {/* PART 1: 4-Column Traceability & Release Decision Workflow Board (Option C Core) */}
    <div className="ct-section-bar">
      <div className="ct-section-title">
        <span><T en="PART 1 · TRACEABILITY & RELEASE DECISION WORKFLOW" zh="第一部分 · 風險追溯與發布決策四步看板" /></span>
        <code className="ct-section-pill">{activeConfig.activeLabel}</code>
      </div>
      <span className="ct-section-note">
        <T en="Trace how QA moves from Risk Identification → Suite Execution → Blocker Triage → Final Verdict" zh="追蹤 QA 如何從「風險識別 → 測試執行 → 缺陷攔截 → 最終簽核」形成有證據的決策" />
      </span>
    </div>

    <div className="ct-trace-board">
      {/* Stage 01 */}
      <article className="ct-stage-col">
        <div>
          <header className="ct-stage-head">
            <div className="ct-stage-step"><span><T en="STAGE 01 · CHARTER & RISK" zh="階段 01 · 測試委託與風險" /></span><code>00–02</code></div>
            <h3><T en="Scope & Risk Prioritization" zh="範圍界定與風險優先級" /></h3>
            <p><T en="What must not break vs. explicit exclusions" zh="不可退讓的核心風險 vs. 誠實揭露之未測邊界" /></p>
          </header>
          <div className="ct-card-block">
            <div className="ct-card-block-title">
              <span><T en="Prioritized Release Risks" zh="優先納管之發布風險" /></span>
              <code className="ct-text-green">{activeConfig.risks.length} Tracked</code>
            </div>
            {activeConfig.risks.map((risk, idx) => (
              <div className="ct-risk-item" key={idx}>
                <span>
                  <code className={risk.tier === "P0" ? "ct-p0-tag" : "ct-p1-tag"}>{risk.tier}</code>
                  <T {...risk.label} />
                </span>
                <strong className={risk.status.en === "FAILED" ? "ct-text-red" : "ct-text-green"}><T {...risk.status} /></strong>
              </div>
            ))}
          </div>
          <div className="ct-oos-box">
            <div className="ct-oos-title"><T en="◌ Explicit Out-of-Scope (Honest Boundaries)" zh="◌ 明確排除範圍（誠實揭露未測邊界）" /></div>
            <div className="ct-oos-tags">
              {activeConfig.exclusions.map((ex, idx) => (
                <span className="ct-oos-tag" key={idx}><T {...ex} /></span>
              ))}
            </div>
          </div>
        </div>
        <footer className="ct-artifact-footer">
          <span className="ct-art-chip">00-qa-test-request.md</span>
          <span className="ct-art-chip">01-risk-assessment.md</span>
          <span className="ct-art-chip">02-test-spec.md</span>
        </footer>
      </article>

      {/* Stage 02 */}
      <article className="ct-stage-col">
        <div>
          <header className="ct-stage-head">
            <div className="ct-stage-step"><span><T en="STAGE 02 · VERIFICATION" zh="階段 02 · 執行與驗證信號" /></span><code>03–04</code></div>
            <h3><T en="Execution & Test Signals" zh="測試執行與覆蓋信號" /></h3>
            <p><T en="Deterministic suites, live checks & attempt logs" zh="自動化套件、即時端點驗證與完整執行紀錄" /></p>
          </header>
          <div className="ct-card-block">
            <div className="ct-card-block-title">
              <span><T {...activeConfig.suiteTitle} /></span>
              <code className={activeConfig.suiteBadgeType === "hold" ? "ct-badge-hold" : "ct-badge-go"}>{activeConfig.suiteBadge}</code>
            </div>
            {activeConfig.suites.map((suite, idx) => (
              <div className="ct-risk-item" key={idx}>
                <span><T {...suite.label} /></span>
                <code className={suite.tone === "fail" ? "ct-text-red" : suite.tone === "warn" ? "ct-text-amber" : "ct-text-green"}>{suite.result}</code>
              </div>
            ))}
          </div>
          <div className="ct-card-block">
            <div className="ct-card-block-title">
              <span><T {...activeConfig.secondaryTitle} /></span>
              <code className="ct-text-blue">{activeConfig.secondaryTag}</code>
            </div>
            {activeConfig.secondaryItems.map((item, idx) => (
              <div className="ct-risk-item" key={idx}>
                <span><T {...item.label} /></span>
                <code className={item.tone === "fail" ? "ct-text-red" : item.tone === "warn" ? "ct-text-amber" : "ct-text-green"}>{item.result}</code>
              </div>
            ))}
          </div>
        </div>
        <footer className="ct-artifact-footer">
          <span className="ct-art-chip">03-test-scenario.md</span>
          <span className="ct-art-chip">04-test-case.md</span>
          <EvidenceLink className="ct-art-chip ct-art-link" href={activeConfig.evidenceAnchor}>{activeConfig.evidenceAnchorLabel}</EvidenceLink>
        </footer>
      </article>

      {/* Stage 03 */}
      <article className="ct-stage-col">
        <div>
          <header className="ct-stage-head">
            <div className="ct-stage-step"><span><T en="STAGE 03 · TRIAGE & GATE" zh="階段 03 · 缺陷分流與攔截" /></span><code>05–06</code></div>
            <h3><T en="Blockers & Hold Counterfactual" zh="阻擋缺陷與反事實攔截證明" /></h3>
            <p><T en="Current blocker state + proof the gate stops bad builds" zh="目前阻擋狀態 ＋ 證明品質門檻能攔截問題版本" /></p>
          </header>
          <div className="ct-card-block">
            <div className="ct-card-block-title">
              <span><T {...activeConfig.triageTitle} /></span>
              <code className={activeConfig.triageBadgeType === "hold" ? "ct-badge-hold" : "ct-badge-go"}>{activeConfig.triageBadge}</code>
            </div>
            {activeConfig.triageItems.map((item, idx) => (
              <div className="ct-risk-item" key={idx}>
                <span><T {...item.label} /></span>
                <strong className={item.tone === "fail" ? "ct-text-red" : item.tone === "warn" ? "ct-text-amber" : "ct-text-green"}><T {...item.result} /></strong>
              </div>
            ))}
          </div>

          <div className="ct-hold-sim-box">
            <div className="ct-hold-sim-title">
              <span><T en="🛑 Counterfactual Hold (DEMO-RUN-FAIL-001)" zh="🛑 反事實攔截證明 (DEMO-RUN-FAIL-001)" /></span>
              <code className="ct-badge-hold">NO-GO PROOF</code>
            </div>
            <p className="ct-hold-defect">
              <strong>[DEF-MDQ-004 · P0 Blocker]</strong>{" "}
              <T en="TC-MDQ-017 failed: stale sequence 103 overwrote sequence 104 in order-book state." zh="TC-MDQ-017 失敗：舊序號 103 覆蓋最新序號 104 之 Order Book 狀態。" />
            </p>
            <p className="ct-hold-defect">
              <strong>[Replay Rule]</strong>{" "}
              <T en="Even after a hypothetical passing rerun, decision stays at HOLD until G6 owner review." zh="即使後續重跑通過，在負責人完成 G6 重審前仍強制維持 HOLD。" />
            </p>
            <div className="ct-hold-actions">
              {activeScenario !== "hold-sim" ? (
                <button type="button" className="ct-hold-switch-btn" onClick={() => setActiveScenario("hold-sim")}>
                  <T en="⚡ Switch Board to Inspect HOLD State →" zh="⚡ 切換看板檢視 HOLD 攔截狀態 →" />
                </button>
              ) : (
                <EvidenceLink className="ct-hold-switch-btn" href="/run-records/fail-demo">
                  <T en="Open Full Failure & Execution Log Demo →" zh="開啟完整失敗案例與 Execution Log →" />
                </EvidenceLink>
              )}
            </div>
          </div>
        </div>
        <footer className="ct-artifact-footer">
          <span className="ct-art-chip">05-test-run-record.md</span>
          <span className="ct-art-chip">06-defect-report.md</span>
          <EvidenceLink className="ct-art-chip ct-art-link" href="/run-records/fail-demo">Fail Demo ↗</EvidenceLink>
        </footer>
      </article>

      {/* Stage 04 */}
      <article className={`ct-stage-col ${activeConfig.verdictTone === "hold" ? "ct-verdict-hold-col" : "ct-verdict-col"}`}>
        <div>
          <header className="ct-stage-head">
            <div className="ct-stage-step"><span><T en="STAGE 04 · DECISION" zh="階段 04 · 最終發布裁決" /></span><code>07–08</code></div>
            <h3><T en="Release Verdict & Sign-Off" zh="發布決策與負責人簽核" /></h3>
            <p><T en="Evidence-backed recommendation & TTL boundary" zh="具證據支撐之發布裁決與時效防線" /></p>
          </header>
          <div className={activeConfig.verdictTone === "hold" ? "ct-verdict-banner ct-verdict-banner-hold" : "ct-verdict-banner"}>
            <strong className="ct-verdict-big"><T {...activeConfig.verdictBig} /></strong>
            <span className="ct-verdict-sub"><T {...activeConfig.verdictSub} /></span>
          </div>
          <div className="ct-card-block">
            <div className="ct-card-block-title">
              <span><T en="Release Gate Criteria Check" zh="發布門檻準則核對" /></span>
              <code className={activeConfig.verdictTone === "hold" ? "ct-text-red" : "ct-text-green"}>{activeConfig.criteriaCount}</code>
            </div>
            {activeConfig.criteria.map((crit, idx) => (
              <div className="ct-risk-item" key={idx}>
                <span><T {...crit.label} /></span>
                <strong className={crit.tone === "fail" ? "ct-text-red" : crit.tone === "warn" ? "ct-text-amber" : "ct-text-green"}><T {...crit.result} /></strong>
              </div>
            ))}
          </div>
        </div>
        <footer className="ct-artifact-footer">
          <span className="ct-art-chip">07-release-quality-summary.md</span>
          <span className="ct-art-chip">08-status-contract.json</span>
        </footer>
      </article>
    </div>

    {/* PART 2: Cross-Repo Signal & Coverage Matrix (Option B Core) */}
    <div className="ct-section-bar">
      <div className="ct-section-title">
        <span><T en="PART 2 · CROSS-REPO SIGNAL & COVERAGE MATRIX (7 DIMENSIONS × 3 SNAPSHOTS)" zh="第二部分 · 跨專案測試信號與覆蓋度矩陣（7 大維度 × 3 組快照）" /></span>
        <code className="ct-section-pill">Single Source of Truth: data/decision-index.json</code>
      </div>
      <div className="ct-legend-group">
        <span className="ct-legend-item"><i className="ct-dot-pass" aria-hidden="true" /><T en="PASS / VERIFIED" zh="通過／已驗證" /></span>
        <span className="ct-legend-item"><i className="ct-dot-warn" aria-hidden="true" /><T en="RETENTION / DISCLOSED" zh="歷程保留／已揭露" /></span>
        <span className="ct-legend-item"><i className="ct-dot-hold" aria-hidden="true" /><T en="BLOCKED / HOLD" zh="阻擋／禁止發布" /></span>
        <span className="ct-legend-item"><i className="ct-dot-oos" aria-hidden="true" /><T en="EXPLICIT OUT-OF-SCOPE" zh="明確排除範圍" /></span>
      </div>
    </div>

    <div className="ct-matrix-panel">
      <div className="ct-matrix-scroll">
        <table className="ct-sig-table">
          <thead>
            <tr>
              <th><T en="Repository / Snapshot" zh="專案／版本快照" /></th>
              <th><T en="Pinned Verdict" zh="快照裁決" /></th>
              <th><T en="1. Unit / Static" zh="1. 單元／靜態" /></th>
              <th><T en="2. Contract / Runtime" zh="2. 契約／執行期" /></th>
              <th><T en="3. Live / RWD" zh="3. 即時／響應式" /></th>
              <th><T en="4. Triage / Chronology" zh="4. 歷程／分流" /></th>
              <th><T en="5. Risk Coverage" zh="5. 風險覆蓋深度" /></th>
              <th><T en="6. Exclusions" zh="6. 未測邊界揭露" /></th>
              <th><T en="Evidence" zh="證據連結" /></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="ct-repo-cell-title">cex-market-data-quality-lab <code>@fc1e060</code></div>
                <div className="ct-repo-cell-sub"><T en="Scoped automated market-data acceptance" zh="限定範圍之行情品質自動化驗收" /></div>
              </td>
              <td><code className="ct-badge-go">✓ SCOPED GO</code></td>
              <td><span className="ct-cell-pill ct-c-pass">● 12/12 PASS</span></td>
              <td><span className="ct-cell-pill ct-c-pass">● 28/28 PASS</span></td>
              <td><span className="ct-cell-pill ct-c-pass">● 5/5 LIVE</span></td>
              <td><span className="ct-cell-pill ct-c-pass">● 4 RUNS OK</span></td>
              <td><span className="ct-cell-pill ct-c-pass">● LEVEL 2/2</span></td>
              <td><span className="ct-cell-pill ct-c-oos">◌ AUTH/LOAD</span></td>
              <td><EvidenceLink className="ct-inspect-link" href="/run-records/#RUN-20260907-cex-deterministic-1">#RUN-20260907 ↗</EvidenceLink></td>
            </tr>
            <tr>
              <td>
                <div className="ct-repo-cell-title">sanyoii.github.io <code>@643b017</code></div>
                <div className="ct-repo-cell-sub"><T en="Primary QA portfolio static & Chromium acceptance" zh="個人主作品集靜態與 Chromium 自動化驗收" /></div>
              </td>
              <td><code className="ct-badge-go">✓ SCOPED GO</code></td>
              <td><span className="ct-cell-pill ct-c-pass">● 9/9 STATIC</span></td>
              <td><span className="ct-cell-pill ct-c-pass">● 13/13 RUNTIME</span></td>
              <td><span className="ct-cell-pill ct-c-pass">● EN/ZH + RWD</span></td>
              <td><span className="ct-cell-pill ct-c-warn">▲ 1 BLOCKED→PASS</span></td>
              <td><span className="ct-cell-pill ct-c-pass">● LEVEL 2/2</span></td>
              <td><span className="ct-cell-pill ct-c-oos">◌ NON-CHROMIUM</span></td>
              <td><EvidenceLink className="ct-inspect-link" href="/run-records/#RUN-20260906-portfolio-chromium-retry">#RUN-20260906 ↗</EvidenceLink></td>
            </tr>
            <tr className="ct-hold-row">
              <td>
                <div className="ct-repo-cell-title ct-text-red">cex-market-data-quality-lab (Hold Sim) <code>@DEMO-FAIL</code></div>
                <div className="ct-repo-cell-sub"><T en="Counterfactual P0 failure & release gate rejection" zh="反事實 P0 失敗與發布門檻攔截示範" /></div>
              </td>
              <td><code className="ct-badge-hold">■ HOLD / NO-GO</code></td>
              <td><span className="ct-cell-pill ct-c-fail">■ TC-017 FAIL</span></td>
              <td><span className="ct-cell-pill ct-c-pass">● 2/3 PASS</span></td>
              <td><span className="ct-cell-pill ct-c-warn">▲ STALE SEQ</span></td>
              <td><span className="ct-cell-pill ct-c-fail">■ DEF-MDQ-004</span></td>
              <td><span className="ct-cell-pill ct-c-warn">▲ HOLD AT G6</span></td>
              <td><span className="ct-cell-pill ct-c-oos">◌ SYNTHETIC</span></td>
              <td><EvidenceLink className="ct-inspect-link ct-inspect-hold" href="/run-records/fail-demo">Fail Demo ↗</EvidenceLink></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* Legacy SSR Contract Container (hidden from visual Control Tower UI) */}
    <div className="ct-legacy-ssr-contract" aria-hidden="true">
    <header className="decision-heading">
      <div>
        <h2 id="repo-quality-title"><T en="Release overview" zh="目前發布狀態" /></h2>
        <p className="ct-part3-sub">
          <T en="Dual-layer transparency: Pinned Historical Approval (Scoped Go) vs. Live Browser Clock TTL Gate" zh="雙層狀態透明呈現：鎖定之歷史驗收快照（Scoped Go）vs. 瀏覽器即時時效門檻（TTL Gate）" />
        </p>
      </div>
      <p className="decision-count"><T en={`${entries.length} repositories · Not live`} zh={`${entries.length} 個 Repo · 非即時`} /></p>
    </header>
    <div className="decision-summary" role="group" aria-label="Filter by current decision" data-aria-label-en="Filter by current decision" data-aria-label-zh="依目前判定篩選">
      {(Object.keys(verdicts) as Verdict[]).map(status => <button type="button" key={status} data-status={status} aria-pressed={filter === status} onClick={() => setFilter(filter === status ? null : status)}>
        <span><i aria-hidden="true">{verdicts[status].icon}</i><T {...verdicts[status]} /></span><strong>{entries.filter(entry => entry.current.status === status).length}</strong>
      </button>)}
    </div>
    <div className="decision-reading-hint"><span><T en="Unknown ≠ failed tests" zh="待確認 ≠ 測試失敗" /></span>{filter ? <button type="button" onClick={() => setFilter(null)}><T en="Show all repositories" zh="顯示全部 Repo" /></button> : <span><T en="Select a status to filter" zh="點選狀態可篩選" /></span>}</div>
    <noscript><p><T en="JavaScript is disabled. Current release readiness is Unknown; historical records remain available." zh="JavaScript 已停用。目前發布就緒度為 Unknown；仍可查看歷史記錄。" /></p></noscript>
    <div className="decision-repositories">
      {visible.map(({ snapshot, snapshotDigest, runMetrics, current }) => {
        const verdict = verdicts[current.status as Verdict] ?? verdicts.unknown;
        const historicalVerdict = verdicts[current.historicalStatus as Verdict] ?? verdicts.unknown;
        const nextAction = suggestedAction(current);
        const lastRun = [...snapshot.runs].filter(run => Number.isFinite(Date.parse(run.executedAt))).sort((a, b) => Date.parse(b.executedAt) - Date.parse(a.executedAt))[0];
        const shortReasons = [];
        if (current.dataStatus === "stale" || snapshot.dataStatus === "stale") shortReasons.push({ en: "Evidence not updated", zh: "證據未更新" });
        if (current.reasons.some(reason => ["RELEASE_EVIDENCE_REQUIRED", "RELEASE_REVIEW_INVALID"].includes(reason.code))) shortReasons.push({ en: "Approval pending", zh: "核准待完成" });
        if (!shortReasons.length) shortReasons.push(current.reasons[0]?.title ?? ({ ready: { en: "Evidence and approval complete", zh: "證據與核准齊全" }, "at-risk": { en: "Known risk remains", zh: "仍有已知風險" }, blocked: { en: "Release blocked", zh: "發布受到阻擋" }, unknown: { en: "Current decision unconfirmed", zh: "目前判定尚待確認" } }[current.status as Verdict] ?? { en: "Review required", zh: "需要審查" }));
        return <article className="decision-repo" data-status={current.status} key={snapshot.repository.url}>
        <div className="decision-repo-top">
          <div>
            <div className="ct-repo-header-badges">
              <p className="eyebrow">{snapshot.objective}</p>
              <span className="ct-pinned-go-badge">
                <span aria-hidden="true">{historicalVerdict.icon}</span>
                <T en={`Pinned Snapshot: ${historicalVerdict.en} (${runMetrics.latestChecksPassed}/${runMetrics.latestChecksTotal} Pass)`} zh={`鎖定快照：${historicalVerdict.zh}（${runMetrics.latestChecksPassed}/${runMetrics.latestChecksTotal} 通過）`} />
              </span>
            </div>
            <h3><EvidenceLink href={snapshot.repository.url}>{snapshot.repository.name}</EvidenceLink></h3>
            <p className="decision-version">{snapshot.repository.branch} · {snapshot.repository.releaseTarget} · <code>{snapshot.repository.fullSha.slice(0, 7)}</code></p>
          </div>
          <div className="decision-current" data-status={current.status}><span className="decision-status-icon" aria-hidden="true">{verdict.icon}</span><div><strong><T {...verdict} /></strong><p className="decision-short-reason">{shortReasons.map(reason => <T key={reason.en} {...reason} />)}</p></div></div>
          <p className="decision-last-test"><T en="Last recorded test" zh="最後記錄的測試" /> · {lastRun ? <time dateTime={lastRun.executedAt} title={lastRun.executedAt}>{new Date(lastRun.executedAt).toISOString().slice(0, 10)}</time> : <T en="No record" zh="尚無記錄" />}</p>
          <p className="decision-last-test"><T en="Assessment expires" zh="評估到期" /> · <time dateTime={snapshot.releaseAssessment.expiresAt}>{snapshot.releaseAssessment.expiresAt.replace("T", " ")}</time></p>
          {nextAction && <p className="decision-next-action"><strong><T en="Next step" zh="建議處理" /></strong><T {...nextAction} /></p>}
        </div>
        <details className="decision-details">
          <summary><T en="View evidence and details" zh="查看證據與細節" /></summary>
          <div className="decision-detail-body">
          <section className="decision-actions" aria-label="Required actions" data-aria-label-en="Required actions" data-aria-label-zh="必要行動">
          <h4>{current.status === "ready" ? <T en="Current decision" zh="目前決定" /> : <T en="What prevents a current Go?" zh="目前為什麼不能 Go？" />}</h4>
          {current.reasons.length ? <ul>{current.reasons.map(reason => <li key={`${reason.code}-${reason.path}`}><strong><T {...reason.title} /></strong><span><T {...reason.action} /></span><small>{reason.code} · {reason.path} · <T en="Owner" zh="負責人" />: {reason.owner}</small></li>)}</ul>
            : <p>{current.status === "ready" ? <T en="No blocking finding in the current evidence scope. This is not a zero-defect guarantee." zh="目前證據範圍內沒有阻擋項目；不代表零缺陷保證。" /> : <T en="The recorded decision is not Go. Ask the decision owner to resolve the recorded rationale." zh="記錄的決定不是 Go；請決策負責人處理記錄中的原因。" />}</p>}
        </section>
            <p className="source-note"><T en="Evidence state" zh="證據狀態" />: <Label value={current.dataStatus} /></p>
            <h4><T en="Historical decision replay — recorded events only" zh="歷史決定回放 — 只呈現已有記錄" /></h4>
            <ol className="decision-timeline">
              {snapshot.runs.map(run => <li key={run.runId}><time>{run.executedAt}</time><EvidenceLink href={run.evidenceUrl}>{run.runId}</EvidenceLink></li>)}
              <li><time>{snapshot.releaseAssessment.decidedAt}</time><span><T en="Recorded assessment" zh="當時記錄的評估" />: <Label value={current.historicalStatus} /></span><p lang="en">{snapshot.releaseAssessment.rationale}</p></li>
              <li><time>{snapshot.releaseAssessment.expiresAt}</time><T en="Original validity boundary — not renewed by a later site build" zh="原有效期限 — 網站重新建置不會延長" /></li>
              <li><T en="Now — no later verified approval is inferred" zh="現在 — 不推定存在更晚的有效核准" /><strong><Label value={current.status} /></strong></li>
            </ol>
            <p className="source-note"><T en="Chinese gate wording is translated for reading; original snapshots and historical claims are unchanged." zh="中文 Gate 內容提供英文翻譯；原始快照與歷史主張維持不變。" /></p>
            <dl className="decision-facts">
              <dt><T en="Environment" zh="環境" /></dt><dd>{snapshot.environment}</dd>
              <dt><T en="In scope" zh="測試範圍" /></dt><dd>{snapshot.testedScope.join(" · ")}</dd>
              <dt><T en="Excluded" zh="排除範圍" /></dt><dd>{snapshot.excludedScope.join(" · ")}</dd>
              <dt><T en="QA / Reviewer / Decision owner" zh="QA／審查者／決策負責人" /></dt><dd>{snapshot.releaseAssessment.qaOwner} / {snapshot.releaseAssessment.reviewer} / {snapshot.releaseAssessment.decisionOwner}</dd>
              <dt><T en="Role boundary" zh="角色邊界" /></dt><dd><T en="Recorded names are not verified identities or proof of independent review." zh="記錄姓名不等於已驗證身分，也不等於獨立審查證明。" /></dd>
            </dl>
            <h4><T en="Historical coverage and execution" zh="歷史覆蓋與執行" /></h4>
            <div className="decision-area-list">{snapshot.productAreas.map(area => <article key={area.id}>
              <h5>{area.name}</h5><p>{area.executionState} · {area.quality} · <T en="Effort" zh="測試力度" />: {area.effortLevel}</p>
              <div className="coverage-track" role="img" aria-label={`Coverage ${area.coverage}; target ${area.targetCoverage}`} data-aria-label-en={`Coverage ${area.coverage}; target ${area.targetCoverage}`} data-aria-label-zh={`覆蓋 ${area.coverage}；目標 ${area.targetCoverage}`}>
                {coverageLevels.map(level => <span key={level} data-covered={coverageLevels.indexOf(level) <= coverageLevels.indexOf(area.coverage)} data-current={level === area.coverage}>{level}</span>)}
              </div><p><T en="Target" zh="目標" />: {area.targetCoverage} · {area.comment}</p>
              {area.evidenceLinks.map((url, i) => <EvidenceLink key={url} href={url}><T en={`Evidence ${i + 1}`} zh={`證據 ${i + 1}`} /></EvidenceLink>)}
            </article>)}</div>
            <h4><T en="Gates as recorded at the historical decision" zh="歷史決定當時記錄的 Gates" /></h4>
            <ul className="historical-gates">{snapshot.gates.map(gate => <li key={gate.id}><code>{gate.id}</code> · {gate.state} · <HistoricalGateText value={gate.title} /> · <HistoricalGateText value={gate.note} /></li>)}</ul>
            <details><summary><T en="Provenance and integrity" zh="來源與完整性" /></summary><dl className="decision-facts">
              <dt>Snapshot ID</dt><dd>{snapshot.snapshotId}</dd><dt>Source SHA</dt><dd><code>{snapshot.repository.fullSha}</code></dd><dt>SHA-256</dt><dd><code>{snapshotDigest}</code></dd>
              <dt><T en="Synced at" zh="同步時間" /></dt><dd>{snapshot.provenance.syncedAt}</dd><dt><T en="Clock checked" zh="時間檢查" /></dt><dd>{current.checkedAt ?? "Unknown"}</dd>
            </dl></details>
          </div>
        </details>
      </article>;})}
    </div>
    {!visible.length && <p className="decision-empty" role="status"><T en="No repositories in this state." zh="此狀態目前沒有 Repo。" /></p>}
    <details className="decision-policy-note"><summary><T en="How is status determined?" zh="狀態如何判定？" /></summary><p>Policy {POLICY_VERSION}</p><p className="decision-clock"><T en="Clock rechecked every 30 seconds and when returning to this page. Browser time is advisory; the CLI release gate is authoritative." zh="每 30 秒及返回頁面時重新檢查時間。瀏覽器時間僅供參考；發布時以 CLI gate 為準。" /></p></details>
    </div>
  </section>;
}
