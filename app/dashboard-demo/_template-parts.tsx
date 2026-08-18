import Link from "next/link";
import { siteHref } from "../_site";

type SignalTone = "good" | "warning" | "unknown";
type GateState = "complete" | "blocked" | "unknown";

type DashboardRepo = {
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
  qualityTone: "good" | "warning";
  qualityLabel: string;
  finalDecision: string;
  finalNote: string;
  gateSummary: string;
  nextAction: string;
  recordsHref: string;
  recordsLabel: string;
  gates: Array<{ id: string; title: string; note: string; state: GateState }>;
};

export const dashboardRepos: DashboardRepo[] = [{
  name: "cex-market-data-quality-lab",
  version: "main · 0.1.0 · 8fd5081",
  objective: "Release Readiness",
  decision: "Ready",
  decisionTone: "good",
  decisionNote: "正式 Go 已核准",
  effort: "High",
  effortBars: 4,
  coverage: "Level 2+",
  coverageLabel: "常見路徑與錯誤路徑已覆蓋",
  quality: "Ready",
  qualityTone: "good",
  qualityLabel: "測試通過，正式 Go 紀錄完成",
  finalDecision: "可以發布",
  finalNote: "Release 已核准",
  gateSummary: "G6 正式紀錄完成",
  nextAction: "Release approved · 保留目前測試與決定紀錄",
  recordsHref: siteHref("/run-records"),
  recordsLabel: "查看測試記錄",
  gates: [
    { id: "G1", title: "範圍已鎖定", note: "Scope complete", state: "complete" },
    { id: "G3", title: "測試已通過", note: "3 類測試完成", state: "complete" },
    { id: "G5", title: "外部檢視完成", note: "回饋已取得", state: "complete" },
    { id: "G6", title: "正式 Go 紀錄完成", note: "Release authorized", state: "complete" },
    { id: "Release", title: "Ready", note: "可以發布", state: "complete" },
  ],
}, {
  name: "sanyoii.github.io",
  version: "deployed · GitHub Pages",
  objective: "Deployment Confidence",
  decision: "Ready",
  decisionTone: "good",
  decisionNote: "17 fresh cases passed",
  effort: "Medium",
  effortBars: 3,
  coverage: "Level 2+",
  coverageLabel: "Static、runtime、responsive 與 bilingual behavior",
  quality: "Healthy",
  qualityTone: "good",
  qualityLabel: "Local 17/17 + release CI pass",
  finalDecision: "可以發布",
  finalNote: "Pages production verified",
  gateSummary: "Fresh local、CI 與 Pages checks 通過",
  nextAction: "Released · 保留目前 checks 與 receipts",
  recordsHref: "https://github.com/sanyoii/sanyoii.github.io/actions/runs/32156748489",
  recordsLabel: "查看 GitHub Actions",
  gates: [
    { id: "G1", title: "測試範圍已定義", note: "TESTPLAN.md · 12 checks", state: "complete" },
    { id: "G3", title: "17 fresh cases passed", note: "Python 3.14 · Chromium", state: "complete" },
    { id: "G5", title: "Release CI passed", note: "Tests workflow · success", state: "complete" },
    { id: "G6", title: "Pages production verified", note: "6 routes · HTTP 200", state: "complete" },
    { id: "Release", title: "Released", note: "Production verified", state: "complete" },
  ],
}];

export const templateRepo = dashboardRepos[0];

function Signal({ tone, mark, children }: { tone: SignalTone; mark: string; children: React.ReactNode }) {
  return (
    <span className="vs-signal" data-tone={tone}>
      <span className="vs-signal-mark" aria-hidden="true">{mark}</span>
      {children}
    </span>
  );
}

function EffortBars({ compact = false, level = 4, label = "High" }: { compact?: boolean; level?: number; label?: string }) {
  return (
    <span className={`vs-effort-bars${compact ? " is-compact" : ""}`} role="img" aria-label={`Test Effort：${label}，四格中 ${level} 格`}>
      {[0, 1, 2, 3].map((index) => <span className={index < level ? "is-active" : ""} key={index} />)}
    </span>
  );
}

function CoverageSegments({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`vs-coverage${compact ? " is-compact" : ""}`} role="img" aria-label="Coverage：Level 2+，常見路徑與錯誤路徑已覆蓋">
      <span className="is-done">0</span>
      <span className="is-done">1</span>
      <span className="is-current">2+</span>
      <span>3</span>
    </span>
  );
}

function QualityLights({ compact = false, tone = "warning", label = "Warning" }: { compact?: boolean; tone?: "good" | "warning"; label?: string }) {
  return (
    <span className={`vs-lights${compact ? " is-compact" : ""}`} role="img" aria-label={`Quality Assessment：${label}，${tone === "good" ? "綠色" : "黃色"}燈號`}>
      <span className="is-red" /><span className={`is-yellow${tone === "warning" ? " is-on" : ""}`} /><span className={`is-green${tone === "good" ? " is-on" : ""}`} />
    </span>
  );
}

export function TemplateHeader({ current }: { current: "ac" | "abc" }) {
  const title = current === "ac" ? "A + C · Merged Repo View" : "A + B + C · Merged Repo + Gates";
  return (
    <header className="st-header">
      <div className="st-topline">
        <p>Low-Tech Testing Dashboard · Site Template</p>
        <span>Read-only demo</span>
      </div>
      <div className="st-title-row">
        <div>
          <p className="st-overline">Repo-Based Quality Decisions</p>
          <h1>{title}</h1>
          <p>先看決定，再看狀態；需要時才展開細節。</p>
        </div>
        <div className="st-release-summary">
          <small>Portfolio status</small>
          <Signal tone="good" mark="✓">2 releases ready</Signal>
        </div>
      </div>
      <nav className="st-nav" aria-label="Template navigation">
        {current === "ac" ? <span aria-current="page">A + C</span> : <Link href={siteHref("/dashboard-demo/ac")}>A + C</Link>}
        {current === "abc" ? <span aria-current="page">A + B + C</span> : <Link href={siteHref("/dashboard-demo/abc")}>A + B + C</Link>}
        <Link href={siteHref("/dashboard-demo")}>三種 Samples</Link>
        <Link href={siteHref("/")}>Decision Desk</Link>
      </nav>
    </header>
  );
}

function MergedRepoCells({ repo, withDecision }: { repo: DashboardRepo; withDecision: boolean }) {
  return (
    <>
      <div className="st-merged-cell is-repo" data-label="Repo">
        <strong>{repo.name}</strong>
        <span>{repo.version}</span>
        {!withDecision && <small>展開 Gate Flow ↓</small>}
      </div>
      <div className="st-merged-cell" data-label="Objective">
        <strong>{repo.objective}</strong><span>發布前判斷</span>
      </div>
      <div className="st-merged-cell" data-label="Release Decision">
        <Signal tone={repo.decisionTone} mark={repo.decisionTone === "good" ? "✓" : repo.decisionTone === "warning" ? "!" : "?"}>{repo.decision}</Signal><span>{repo.decisionNote}</span>
      </div>
      <div className="st-merged-cell" data-label="Test Effort">
        <strong>{repo.effort}</strong><EffortBars compact level={repo.effortBars} label={repo.effort} />
      </div>
      <div className="st-merged-cell" data-label="Coverage">
        <strong>{repo.coverage}</strong><CoverageSegments compact />
      </div>
      <div className="st-merged-cell" data-label="Quality Assessment">
        <strong>{repo.quality}</strong><QualityLights compact tone={repo.qualityTone} label={repo.quality} />
      </div>
      {withDecision && (
        <div className="st-merged-cell is-final-decision" data-label="Decision">
          <strong>{repo.finalDecision}</strong><span>{repo.finalNote}</span>
        </div>
      )}
    </>
  );
}

function InlineReleaseGates({ repo, formal = false }: { repo: DashboardRepo; formal?: boolean }) {
  return (
    <div className="st-inline-gates">
      <header>
        <div><p>{formal ? "Release Gate Flow" : "B · Release Gate Flow"}</p><h3>發布條件如何完成？</h3></div>
        <Signal tone="good" mark="✓">{repo.gateSummary}</Signal>
      </header>
      <ol className="vs-gates" aria-label={`${repo.name} release gate 狀態`}>
        {repo.gates.map((gate) => (
          <li data-state={gate.state} key={gate.id}><span className="vs-gate-node" aria-hidden="true">{gate.state === "complete" ? "✓" : gate.state === "blocked" ? "!" : "?"}</span><div><small>{gate.id}</small><strong>{gate.title}</strong><span>{gate.note}</span></div></li>
        ))}
      </ol>
      <div className="st-inline-next">
        <div><small>Next action</small><strong>{repo.nextAction}</strong></div>
        <Link href={formal ? repo.recordsHref : siteHref("/")}>{formal ? repo.recordsLabel : "查看發布判斷"}</Link>
      </div>
    </div>
  );
}

export function MergedRepoDashboard({ includeGates, formal = false }: { includeGates: boolean; formal?: boolean }) {
  const labels = includeGates
    ? ["Repo", "Objective", "Release Decision", "Test Effort", "Coverage", "Quality Assessment"]
    : ["Repo", "Objective", "Release Decision", "Test Effort", "Coverage", "Quality Assessment", "Decision"];

  return (
    <section className="st-section" aria-labelledby="merged-dashboard-heading">
      <header className="st-section-heading">
        <div>
          <span className="st-section-letter">{formal ? "QA" : includeGates ? "ABC" : "AC"}</span>
          <div><p>{formal ? "Repository portfolio" : "Two repositories · One row each"}</p><h2 id="merged-dashboard-heading">{formal ? "Repository Quality Dashboard" : "Merged Repo Dashboard"}</h2></div>
        </div>
        <span>{formal || includeGates ? "展開 Repo 查看 Gate Flow" : "7 個決策欄位"}</span>
      </header>

      <div className="st-merged-board">
        <div className={`st-merged-head ${includeGates ? "has-gates" : "has-decision"}`} aria-hidden="true">
          {labels.map((label) => <span key={label}>{label}</span>)}
        </div>

        {dashboardRepos.map((repo) => includeGates ? (
          <details className="st-merged-repo" key={repo.name}>
            <summary className="st-merged-grid has-gates" aria-label={`${repo.name}，展開 Release Gate Flow`}>
              <MergedRepoCells repo={repo} withDecision={false} />
            </summary>
            <InlineReleaseGates repo={repo} formal={formal} />
          </details>
        ) : (
          <article className="st-merged-grid has-decision" aria-label={`${repo.name} 的合併測試狀態`} key={repo.name}>
            <MergedRepoCells repo={repo} withDecision />
          </article>
        ))}

        <div className="st-new-repo" role="note" aria-label="New Repo 接入位置">
          <span aria-hidden="true">＋</span>
          <div><strong>New Repo</strong><p>接入後依相同欄位新增一列；不改變 Dashboard 的閱讀方式。</p></div>
        </div>
      </div>
    </section>
  );
}

export function ObjectiveCards() {
  const repo = templateRepo;
  return (
    <section className="st-section" aria-labelledby="objective-cards-heading">
      <header className="st-section-heading">
        <div><span className="st-section-letter">A</span><div><p>Management snapshot</p><h2 id="objective-cards-heading">Objective Cards</h2></div></div>
        <span>1 Repo · Release Readiness</span>
      </header>
      <div className="vs-board vs-card-board">
        <div className="vs-repo-line">
          <div><strong>{repo.name}</strong><span>{repo.version}</span></div>
          <span>Primary objective · {repo.objective}</span>
        </div>
        <div className="vs-objective-cards">
          <article className="vs-objective-card is-decision">
            <p>Release Decision</p>
            <div className="vs-decision-orbit" aria-label="Release Decision：Ready，正式核准"><span>✓</span></div>
            <strong>{repo.decision}</strong><small>{repo.decisionNote}</small>
          </article>
          <article className="vs-objective-card is-effort">
            <p>Test Effort</p><strong>{repo.effort}</strong><EffortBars level={repo.effortBars} label={repo.effort} /><small>三類測試已執行</small>
          </article>
          <article className="vs-objective-card is-coverage">
            <p>Coverage</p><strong>{repo.coverage}</strong><CoverageSegments /><small>常見路徑 + 錯誤路徑</small>
          </article>
          <article className="vs-objective-card is-quality">
            <p>Quality Assessment</p><strong>{repo.quality}</strong><QualityLights tone={repo.qualityTone} label={repo.quality} /><small>{repo.qualityLabel}</small>
          </article>
        </div>
        <div className="vs-board-answer">
          <span>現在能不能發？</span>
          <strong><Signal tone="good" mark="✓">可以。G6 正式 Go 紀錄已完成。</Signal></strong>
        </div>
      </div>
    </section>
  );
}

export function ReleaseGateFlow() {
  const repo = templateRepo;
  return (
    <section className="st-section" aria-labelledby="release-gates-heading">
      <header className="st-section-heading">
        <div><span className="st-section-letter is-orange">B</span><div><p>Selected repository</p><h2 id="release-gates-heading">Release Gate Flow</h2></div></div>
        <span>全部 Gate 已完成</span>
      </header>
      <div className="vs-board vs-gate-board">
        <div className="vs-gate-summary">
          <div><p>{repo.name}</p><h3>Release Readiness</h3></div>
          <div className="vs-release-lock"><span aria-hidden="true">✓</span><div><small>Release Decision</small><strong>Ready</strong></div></div>
        </div>
        <ol className="vs-gates" aria-label="Release gate 狀態">
          {repo.gates.map((gate) => <li data-state={gate.state} key={gate.id}><span className="vs-gate-node" aria-hidden="true">✓</span><div><small>{gate.id}</small><strong>{gate.title}</strong><span>{gate.note}</span></div></li>)}
        </ol>
        <div className="vs-blocker-callout">
          <span className="vs-callout-icon" aria-hidden="true">✓</span>
          <div><small>Release state</small><strong>{repo.nextAction}</strong></div>
          <Link href={siteHref("/")}>查看發布判斷</Link>
        </div>
      </div>
    </section>
  );
}

export function RepoPortfolio() {
  return (
    <section className="st-section" aria-labelledby="repo-portfolio-heading">
      <header className="st-section-heading">
        <div><span className="st-section-letter is-violet">C</span><div><p>All repositories</p><h2 id="repo-portfolio-heading">Repo Portfolio Matrix</h2></div></div>
        <span>新增 Repo 就新增一列</span>
      </header>
      <div className="vs-board vs-portfolio-board">
        <div className="vs-portfolio-head" aria-hidden="true">
          <span>Repository</span><span>Objective</span><span>Effort</span><span>Coverage</span><span>Quality</span><span>Decision</span>
        </div>
        {dashboardRepos.map((repo) => <article className="vs-repo-strip" aria-label={`${repo.name} 的測試狀態`} key={repo.name}>
          <div className="vs-repo-cell is-name" data-label="Repository"><strong>{repo.name}</strong><span>{repo.version}</span></div>
          <div className="vs-repo-cell" data-label="Objective"><strong>{repo.objective}</strong><span>發布前判斷</span></div>
          <div className="vs-repo-cell" data-label="Effort"><strong>{repo.effort}</strong><EffortBars compact level={repo.effortBars} label={repo.effort} /></div>
          <div className="vs-repo-cell" data-label="Coverage"><strong>{repo.coverage}</strong><CoverageSegments compact /></div>
          <div className="vs-repo-cell" data-label="Quality"><strong>{repo.quality}</strong><QualityLights compact tone={repo.qualityTone} label={repo.quality} /></div>
          <div className="vs-repo-cell is-decision" data-label="Decision"><Signal tone={repo.decisionTone} mark="✓">{repo.decision}</Signal><span>{repo.finalNote}</span></div>
        </article>)}
        <div className="vs-future-row"><span aria-hidden="true">＋</span><p><strong>下一個 Repo 接入後，新增一列。</strong>管理者仍使用同一套欄位閱讀。</p></div>
      </div>
    </section>
  );
}

export function TemplateFooter() {
  return (
    <footer className="st-footer">
      <div><strong>資料邊界</strong><span>Defect、UX、Performance、Security 未納入本次 Pilot，不顯示虛構數字。</span></div>
      <nav aria-label="Record links"><Link href={siteHref("/run-records")}>Test Cases 與執行記錄</Link><Link href={siteHref("/")}>正式發布判斷</Link></nav>
    </footer>
  );
}
