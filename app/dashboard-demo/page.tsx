import { siteHref } from "../_site";
import { pageLanguageData, T } from "../_i18n";
import { ControlTowerNav } from "../_shared-nav";
import { suggestedAction } from "../../lib/decision-actions.mjs";

const actionExamples = [
  { id: "expired", status: "unknown", dataStatus: "stale", codes: ["EVIDENCE_STALE"], icon: "?", badge: "? UNKNOWN", triggerEn: "Evidence TTL window expired (Pinned historical snapshot preserved)", triggerZh: "證據有效期已過（仍保留鎖定之歷史通過快照）", title: { en: "Unknown · Evidence expired", zh: "待確認 · 證據到期" } },
  { id: "approval", status: "unknown", dataStatus: "fresh", codes: ["RELEASE_EVIDENCE_REQUIRED"], icon: "?", badge: "? UNKNOWN", triggerEn: "Missing linked release packet or undisclosed self-review overlap", triggerZh: "缺少已連結之發布證據包或未揭露自審重疊", title: { en: "Unknown · Approval pending", zh: "待確認 · 核准待完成" } },
  { id: "unreachable", status: "unknown", dataStatus: "unreachable", codes: ["DATA_NOT_FRESH"], icon: "?", badge: "? UNKNOWN", triggerEn: "Source repository or artifact endpoint currently unreachable", triggerZh: "目前無法連上來源專案或證據端點", title: { en: "Unknown · Source unreachable", zh: "待確認 · 無法取得來源" } },
  { id: "both", status: "unknown", dataStatus: "stale", codes: ["EVIDENCE_STALE", "RELEASE_EVIDENCE_REQUIRED"], icon: "?", badge: "? UNKNOWN", triggerEn: "Stale evidence AND unlinked owner review packet", triggerZh: "證據已過期且尚未完成負責人審查證據包", title: { en: "Unknown · Evidence and review needed", zh: "待確認 · 缺少有效證據與審查" } },
  { id: "blocked", status: "blocked", dataStatus: "fresh", codes: [], icon: "×", badge: "× NO-GO", triggerEn: "Unresolved S1, unaccepted S2, or a confirmed Fail", triggerZh: "未解決的 S1、未接受的 S2，或已確認的 Fail", title: { en: "No-Go · Blocking issue", zh: "不可發布 · 存在阻擋問題" } },
  { id: "risk", status: "at-risk", dataStatus: "fresh", codes: [], icon: "!", badge: "! AT RISK", triggerEn: "No blocker, but a remaining defect or accepted risk is still recorded", triggerZh: "沒有阻擋，但仍有剩餘缺陷或已接受的風險", title: { en: "At Risk · Residual risk", zh: "有風險 · 存在剩餘風險" } },
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
              <T en="Evolution to Low-Tech Whiteboard v3 (James Bach 1997) · 6 Deterministic Fail-Closed Rules" zh="演進至 Low-Tech 五欄決策白板 v3（James Bach 1997）· 6 條確定性規則" />
            </div>
          </div>
        </div>
        <p className="ct-masthead-sub">
          <T en="The original samples are retired as live dashboards. Their URLs remain available so existing links do not break." zh="原 Samples 已退役，不再作為即時 Dashboard；保留原網址，避免既有連結失效。" />
        </p>
      </header>

      <ControlTowerNav active="dashboard-demo" />

      {/* PART 1: Architecture Evolution Board */}
      <div className="ct-section-bar">
        <div className="ct-section-title">
          <span><T en="PART 1 · ARCHITECTURE EVOLUTION TO LOW-TECH TESTING DASHBOARD v3" zh="第一部分 · 架構演進看板（從早期視覺樣板、高密度戰情室走向 Low-Tech 減法白板 v3）" /></span>
          <code className="ct-section-pill">James Bach (1997) Philosophy</code>
        </div>
        <span className="ct-section-note">
          <T en="Why we stripped away duplicate tables and cryptic 0–3 codes in favor of a 30-second Low-Tech Whiteboard" zh="為何我們砍除重複矩陣與難懂的 0~3 代號，回歸 30 秒一眼抓到重點的 Low-Tech 五欄白板" />
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
              <p><T en="Kept the clear management questions (Q1–Q3); removed repeated Ready claims and effort bars from the first screen." zh="保留清楚的管理三問（Q1–Q3）；首頁移除重複的 Ready 主張與百分比進度條。" /></p>
            </div>
          </div>
          <footer className="ct-artifact-footer">
            <span className="ct-art-chip">Kept: Management Q1–Q3</span>
            <span className="ct-art-chip">Dropped: Vanity % Bars</span>
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
              <p><T en="Kept traceability; gates are now explicitly historical and moved into the secondary Engineering Evidence view." zh="保留可追溯性；將 G1–G6 與 00–08 模板收納至第二視角「工程證據模式」，不干擾首屏閱讀。" /></p>
            </div>
          </div>
          <footer className="ct-artifact-footer">
            <span className="ct-art-chip">Kept: Gate Traceability</span>
            <span className="ct-art-chip">Moved: 2nd Mode Toggle</span>
          </footer>
        </li>

        <li className="ct-stage-col">
          <div>
            <header className="ct-stage-head">
              <div className="ct-stage-step"><span>GEN 03 · SAMPLE C &amp; B+C</span><code>RETIRED</code></div>
              <strong>C · Repo Portfolio Matrix</strong>
              <p><T en="Multi-table Control Tower prototype" zh="跨專案大矩陣與多表堆疊原型" /></p>
            </header>
            <div className="ct-card-block">
              <p><T en="Stacking 4-stage cards + 9-column matrix + cryptic 0,1,1+,2,2+,3 codes caused cognitive overload and triple duplication." zh="同時堆疊四步看板＋九欄矩陣＋0,1,1+,2,2+,3 密碼表造成資訊過載與三次重複，偏離低科技白板本意。" /></p>
            </div>
          </div>
          <footer className="ct-artifact-footer">
            <span className="ct-art-chip">Lesson: Too Much Info</span>
            <span className="ct-art-chip">Dropped: Cryptic 0–3 Scale</span>
          </footer>
        </li>

        <li className="ct-stage-col ct-verdict-col">
          <div>
            <header className="ct-stage-head">
              <div className="ct-stage-step"><span>GEN 04 · ACTIVE LOW-TECH v3</span><code>ACTIVE</code></div>
              <strong><T en="Low-Tech Whiteboard v3" zh="Low-Tech 五欄決策白板 v3" /></strong>
              <p><T en="5-Column Board × 3-Stage Milestones × Progressive Disclosure" zh="五欄評估表 × 三階段白話里程碑 × 預設收合漸進揭露" /></p>
            </header>
            <div className="ct-card-block">
              <p><T en="Inspired by James Bach (1997), The Liberators & QA Sphere: collapsible Q1–Q3 headers, 3-stage plain-language coverage milestones, and 1-click switch to raw JUnit receipts." zh="融合 James Bach (1997)、The Liberators 與 QA Sphere：頂部與左欄長文預設收合、三格白話里程碑取代代號，並支援一鍵切換工程證據。" /></p>
            </div>
          </div>
          <footer className="ct-artifact-footer">
            <span className="ct-art-chip">3-Stage Milestones</span>
            <a className="ct-art-chip ct-art-link" href={siteHref("/")}><T en="Current Whiteboard ↗" zh="回到主控白板 ↗" /></a>
          </footer>
        </li>
      </ol>

      {/* PART 2 (Option B): 6 Deterministic Fail-Closed Policy Scenarios Matrix */}
      <div className="ct-section-bar">
        <div className="ct-section-title">
          <span><T en="PART 2 · FAIL-CLOSED DECISION ENGINE POLICY MATRIX (6 SYNTHETIC SCENARIOS)" zh="第二部分 · Fail-Closed 決策引擎規則矩陣（6 種合成情境與確定性下一步）" /></span>
          <code className="ct-section-pill">lib/decision-actions.mjs</code>
        </div>
        <span className="ct-section-note">
          <T en="Maps input dataStatus and reasonCodes to deterministic remediation actions" zh="將輸入之資料狀態與原因碼映射為明確的負責人下一步行動" />
        </span>
      </div>

      <div id="next-action-examples">
        <div className="ct-matrix-panel" style={{ marginBottom: "14px" }}>
          <div className="ct-matrix-scroll">
            <table className="ct-sig-table ct-policy-matrix-table">
              <thead>
                <tr>
                  <th><T en="Scenario State" zh="情境狀態" /></th>
                  <th><T en="Data Freshness" zh="資料新鮮度" /></th>
                  <th><T en="Reason Codes" zh="觸發原因碼 (Reason Codes)" /></th>
                  <th><T en="Trigger Condition" zh="觸發條件說明" /></th>
                  <th><T en="Deterministic Next Step" zh="確定性下一步行動（建議處理）" /></th>
                  <th><T en="Engine Verdict" zh="引擎裁決" /></th>
                </tr>
              </thead>
              <tbody>
                {actionExamples.map(example => {
                  const action = suggestedAction({ ...example, reasons: example.codes.map(code => ({ code })) });
                  return (
                    <tr key={example.id} className={example.status === "blocked" ? "ct-hold-row" : ""}>
                      <td><strong><T {...example.title} /></strong></td>
                      <td><code>{example.dataStatus.toUpperCase()}</code></td>
                      <td><code>{example.codes.length ? example.codes.join(" + ") : "GATE_EVALUATED"}</code></td>
                      <td><T en={example.triggerEn} zh={example.triggerZh} /></td>
                      <td>{action ? <T {...action} /> : "—"}</td>
                      <td>
                        <span className={`ct-cell-pill ${example.status === "blocked" ? "ct-c-fail" : "ct-c-warn"}`}>
                          {example.badge}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="ct-sr-compat" aria-hidden="true">
        <h2 id="action-examples-title"><T en="Next-step examples" zh="建議處理方式範例" /></h2>
        <p className="notice"><T en="Six synthetic scenarios, not actual repository statuses. The same suggestion rules are used on the Dashboard; Ready has no remediation prompt." zh="六個合成情境，不代表實際 Repo 狀態。與 Dashboard 使用同一套建議規則；Ready 不顯示處理提示。" /></p>
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
        <a href={siteHref("/dashboard-demo/ac")}>A+C</a>
        <a href={siteHref("/dashboard-demo/abc")}>A+B+C</a>
      </div>

      <footer className="footer">
        <span><T en="Architecture evolution & deterministic policy rules · QA Decision Desk" zh="架構演進與確定性規則庫 · QA Decision Desk" /></span>
        <div className="ct-footer-links">
          <a href="https://sanyoii.github.io/"><T en="← sanyoii.github.io Portfolio" zh="← 返回 sanyoii.github.io 主站" /></a>
          <a href={siteHref("/")}><T en="← Current Dashboard" zh="← 回到目前 Dashboard" /></a>
          <a href={siteHref("/run-records/fail-demo")}><T en="Explore decision replay →" zh="查看決定回放 →" /></a>
        </div>
      </footer>
    </main>
  );
}
