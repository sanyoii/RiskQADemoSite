import { siteHref } from "../_site";
import { pageLanguageData, T } from "../_i18n";
import { ControlTowerNav } from "../_shared-nav";
import { suggestedAction } from "../../lib/decision-actions.mjs";

const actionExamples = [
  { id: "expired", status: "unknown", dataStatus: "stale", codes: ["EVIDENCE_STALE"], icon: "?", badge: "? UNKNOWN", triggerEn: "Evidence TTL window expired (Pinned historical snapshot preserved)", triggerZh: "證據有效期已過（仍保留鎖定之歷史通過快照）", title: { en: "Unknown · Evidence expired", zh: "待確認 · 證據到期" } },
  { id: "approval", status: "unknown", dataStatus: "fresh", codes: ["RELEASE_EVIDENCE_REQUIRED"], icon: "?", badge: "? UNKNOWN", triggerEn: "Missing linked release packet or undisclosed self-review overlap", triggerZh: "缺少已連結之發布證據包或未揭露自審重疊", title: { en: "Unknown · Approval pending", zh: "待確認 · 核准待完成" } },
  { id: "unreachable", status: "unknown", dataStatus: "unreachable", codes: ["DATA_NOT_FRESH"], icon: "?", badge: "? UNKNOWN", triggerEn: "Source repository or artifact endpoint currently unreachable", triggerZh: "目前無法連上來源專案或證據端點", title: { en: "Unknown · Source unreachable", zh: "待確認 · 無法取得來源" } },
  { id: "both", status: "unknown", dataStatus: "stale", codes: ["EVIDENCE_STALE", "RELEASE_EVIDENCE_REQUIRED"], icon: "?", badge: "? UNKNOWN", triggerEn: "Stale evidence AND unlinked owner review packet", triggerZh: "證據已過期且尚未完成負責人審查證據包", title: { en: "Unknown · Evidence and review needed", zh: "待確認 · 缺少有效證據與審查" } },
  { id: "blocked", status: "blocked", dataStatus: "fresh", codes: [], icon: "×", badge: "× NO-GO", triggerEn: "Open P0 / P1 release-blocking defect or failed required check", triggerZh: "存在未關閉之 P0/P1 發布阻擋缺陷或必要案例失敗", title: { en: "No-Go · Blocking issue", zh: "不可發布 · 存在阻擋問題" } },
  { id: "risk", status: "at-risk", dataStatus: "fresh", codes: [], icon: "!", badge: "! AT RISK", triggerEn: "Non-blocking P1/P2 residual risk requires explicit waiver", triggerZh: "存在非阻擋之剩餘風險，須明確評估或揭露", title: { en: "At Risk · Residual risk", zh: "有風險 · 存在剩餘風險" } },
];

export const dynamic = "force-static";

export default function DesignEvolution() {
  return (
    <main className="shell decision-desk ct-shell design-history" {...pageLanguageData(
      { en: "Design Evolution — QA Decision Desk", zh: "設計演進 — QA 決策台" },
      { en: "Why the dashboard moved from visual samples to evidence-led decisions.", zh: "Dashboard 從視覺 Samples 走向證據導向判斷的設計取捨。" },
    )}>
      <header className="masthead decision-masthead ct-topbar">
        <div className="ct-topbar-main">
          <div className="ct-topbar-left">
            <a className="ct-back-btn" href="https://sanyoii.github.io/">
              <T en="← sanyoii.github.io Portfolio" zh="← 返回 sanyoii.github.io 主站" />
            </a>
            <div className="ct-brand">
              <span className="ct-brand-dot" aria-hidden="true" />
              <div>
                <p className="eyebrow"><T en="Design history · not a second status source" zh="設計歷史 · 不是另一份狀態來源" /></p>
                <h1><T en="Design evolution" zh="設計演進" /></h1>
              </div>
              <span className="ct-brand-tag"><T en="STAGE 04 · ADR & POLICY ENGINE" zh="階段 04 · 架構演進與決策規則" /></span>
            </div>
          </div>
          <div className="ct-topbar-right">
            <div className="ct-snapshot-pill">
              <span aria-hidden="true">📐</span>
              <T en="4 Generations (Sample A / B / C → Active B+C Hybrid) · 6 Deterministic Fail-Closed Rules" zh="四代架構演進（Sample A / B / C ➔ 現役 B+C 混搭）· 6 條決定論規則" />
            </div>
          </div>
        </div>
        <p className="ct-masthead-sub">
          <T en="The original samples are retired as live dashboards. Their URLs remain available so existing links do not break." zh="原 Samples 已退役，不再作為即時 Dashboard；保留原網址，避免既有連結失效。" />
        </p>
      </header>

      <ControlTowerNav active="dashboard-demo" />

      {/* PART 1 (Option C): 4-Generation Architecture Evolution Board */}
      <div className="ct-section-bar">
        <div className="ct-section-title">
          <span><T en="PART 1 · 4-GENERATION ARCHITECTURE EVOLUTION BOARD (SAMPLE A / B / C → ACTIVE HYBRID)" zh="第一部分 · 四代架構演進看板（從早期視覺樣板走向 B+C 混搭證據控制台）" /></span>
          <code className="ct-section-pill">ADR Evolution</code>
        </div>
        <span className="ct-section-note">
          <T en="What we kept from each prototype and what we eliminated to prevent unverified quality claims" zh="每一代原型保留了什麼核心價值、又剔除了哪些沒有證據支撐的視覺裝飾" />
        </span>
      </div>

      <ol className="decision-timeline ct-trace-board ct-adr-board">
        <li className="ct-stage-col">
          <div>
            <header className="ct-stage-head">
              <div className="ct-stage-step"><span>GEN 01 · SAMPLE A</span><code>RETIRED</code></div>
              <strong>A · Objective Cards</strong>
              <p><T en="Executive summary cards prototype" zh="高階主管目標卡片原型" /></p>
            </header>
            <div className="ct-card-block">
              <p><T en="Kept the clear management questions; removed repeated Ready claims and effort bars from the first screen." zh="保留清楚的管理問題；首頁移除重複的 Ready 主張與測試力度條。" /></p>
            </div>
          </div>
          <footer className="ct-artifact-footer">
            <span className="ct-art-chip">Kept: Management Q&A</span>
            <span className="ct-art-chip">Dropped: Effort % Bars</span>
          </footer>
        </li>

        <li className="ct-stage-col">
          <div>
            <header className="ct-stage-head">
              <div className="ct-stage-step"><span>GEN 02 · SAMPLE B</span><code>RETIRED</code></div>
              <strong>B · Release Gate Flow</strong>
              <p><T en="Sequential G1–G6 checkpoint prototype" zh="G1–G6 順序門檻流程原型" /></p>
            </header>
            <div className="ct-card-block">
              <p><T en="Kept traceability; gates are now explicitly historical, separated from today's eligibility." zh="保留可追溯性；Gate 明確標為歷史記錄，與今天是否有效分開。" /></p>
            </div>
          </div>
          <footer className="ct-artifact-footer">
            <span className="ct-art-chip">Kept: Gate Traceability</span>
            <span className="ct-art-chip">Fixed: Historical vs TTL</span>
          </footer>
        </li>

        <li className="ct-stage-col">
          <div>
            <header className="ct-stage-head">
              <div className="ct-stage-step"><span>GEN 03 · SAMPLE C</span><code>RETIRED</code></div>
              <strong>C · Repo Portfolio Matrix</strong>
              <p><T en="Multi-repository status table prototype" zh="跨專案品質矩陣原型" /></p>
            </header>
            <div className="ct-card-block">
              <p><T en="Kept the per-repository overview; replaced fixed Level 2+ decoration with data-driven coverage in details." zh="保留逐 Repo 總覽；將固定 Level 2+ 圖示改為明細中的資料驅動覆蓋。" /></p>
            </div>
          </div>
          <footer className="ct-artifact-footer">
            <span className="ct-art-chip">Kept: Cross-Repo Matrix</span>
            <span className="ct-art-chip">Fixed: SHA-Bound Proof</span>
          </footer>
        </li>

        <li className="ct-stage-col ct-verdict-col">
          <div>
            <header className="ct-stage-head">
              <div className="ct-stage-step"><span>GEN 04 · ACTIVE HYBRID</span><code>ACTIVE v4.0</code></div>
              <strong><T en="Decision Desk" zh="決策台" /></strong>
              <p><T en="Option B+C Control Tower × Traceability Board" zh="現役 B+C 混搭戰情室 × 四步追溯看板" /></p>
            </header>
            <div className="ct-card-block">
              <p><T en="One policy supplies the current verdict, evidence gap, owner and next action. Replay preserves the distinction between observed history and synthetic teaching scenarios." zh="同一套規則提供目前判定、證據缺口、負責人與下一步。回放清楚區分實際歷史與合成教學情境。" /></p>
            </div>
          </div>
          <footer className="ct-artifact-footer">
            <span className="ct-art-chip">00–08 Traceability</span>
            <a className="ct-art-chip ct-art-link" href={siteHref("/")}><T en="Current Dashboard ↗" zh="目前 Dashboard ↗" /></a>
          </footer>
        </li>
      </ol>

      {/* PART 2 (Option B): 6 Deterministic Fail-Closed Policy Scenarios Matrix */}
      <div className="ct-section-bar">
        <div className="ct-section-title">
          <span><T en="PART 2 · FAIL-CLOSED DECISION ENGINE POLICY MATRIX (6 SYNTHETIC SCENARIOS)" zh="第二部分 · Fail-Closed 決策引擎規則矩陣（6 種合成情境與決定論下一步）" /></span>
          <code className="ct-section-pill">lib/decision-actions.mjs</code>
        </div>
        <span className="ct-section-note">
          <T en="Maps input dataStatus and reasonCodes to deterministic remediation actions" zh="將輸入之資料狀態與原因碼映射為明確的負責人下一步行動" />
        </span>
      </div>

      <section className="decision-dashboard ct-dark-section" id="next-action-examples" aria-labelledby="action-examples-title">
        <h2 id="action-examples-title"><T en="Next-step examples" zh="建議處理方式範例" /></h2>
        <p className="notice"><T en="Six synthetic scenarios, not actual repository statuses. The same suggestion rules are used on the Dashboard; Ready has no remediation prompt." zh="六個合成情境，不代表實際 Repo 狀態。與 Dashboard 使用同一套建議規則；Ready 不顯示處理提示。" /></p>

        <div className="ct-matrix-panel" style={{ marginBottom: "14px" }}>
          <div className="ct-matrix-scroll">
            <table className="ct-sig-table">
              <thead>
                <tr>
                  <th><T en="Scenario State" zh="情境狀態" /></th>
                  <th><T en="Data Freshness" zh="資料新鮮度" /></th>
                  <th><T en="Reason Codes" zh="觸發原因碼 (Reason Codes)" /></th>
                  <th><T en="Trigger Condition" zh="觸發條件說明" /></th>
                  <th><T en="Engine Verdict" zh="引擎裁決" /></th>
                </tr>
              </thead>
              <tbody>
                {actionExamples.map(example => (
                  <tr key={example.id} className={example.status === "blocked" ? "ct-hold-row" : ""}>
                    <td><strong><T {...example.title} /></strong></td>
                    <td><code>{example.dataStatus.toUpperCase()}</code></td>
                    <td><code>{example.codes.length ? example.codes.join(" + ") : "GATE_EVALUATED"}</code></td>
                    <td><T en={example.triggerEn} zh={example.triggerZh} /></td>
                    <td>
                      <span className={`ct-cell-pill ${example.status === "blocked" ? "ct-c-fail" : "ct-c-warn"}`}>
                        {example.badge}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="decision-repositories ct-policy-cards-grid">
          {actionExamples.map(example => {
            const action = suggestedAction({ ...example, reasons: example.codes.map(code => ({ code })) });
            return (
              <article className="decision-repo ct-policy-card" data-status={example.status} key={example.id}>
                <div className="decision-repo-top">
                  <div className="ct-policy-card-head">
                    <h3><span aria-hidden="true">{example.icon} </span><T {...example.title} /></h3>
                    <code>{example.codes.length ? example.codes.join(", ") : example.status.toUpperCase()}</code>
                  </div>
                  {action && <p className="decision-next-action"><strong><T en="Next step" zh="建議處理" /></strong><T {...action} /></p>}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="footer">
        <div className="ct-footer-links">
          <a href="https://sanyoii.github.io/"><T en="← sanyoii.github.io Portfolio" zh="← 返回 sanyoii.github.io 主站" /></a>
          <a href={siteHref("/")}><T en="Current Dashboard" zh="目前 Dashboard" /></a>
          <a href={siteHref("/dashboard-demo/ac")}>A+C</a>
          <a href={siteHref("/dashboard-demo/abc")}>A+B+C</a>
          <a href={siteHref("/run-records/fail-demo")}><T en="Explore decision replay" zh="查看決定回放" /></a>
        </div>
      </footer>
    </main>
  );
}
