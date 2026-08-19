import { siteHref } from "../_site";
import { T, type LocalizedText } from "../_i18n";
import { dashboardRepos, templateRepo, type DashboardRepo, type QualityTone, type SignalTone } from "../dashboard-data";

export { dashboardRepos };

function Signal({ tone, mark, children }: { tone: SignalTone; mark: string; children: React.ReactNode }) {
  return (
    <span className="vs-signal" data-tone={tone}>
      <span className="vs-signal-mark" aria-hidden="true">{mark}</span>
      {children}
    </span>
  );
}

function EffortBars({ compact = false, level = 4, label = { en: "High", zh: "高" } }: { compact?: boolean; level?: number; label?: LocalizedText }) {
  return (
    <span
      className={`vs-effort-bars${compact ? " is-compact" : ""}`}
      role="img"
      aria-label={`Test Effort: ${label.en}, ${level} of 4 bars`}
      data-aria-label-en={`Test Effort: ${label.en}, ${level} of 4 bars`}
      data-aria-label-zh={`Test Effort：${label.zh}，四格中 ${level} 格`}
    >
      {[0, 1, 2, 3].map((index) => <span className={index < level ? "is-active" : ""} key={index} />)}
    </span>
  );
}

function CoverageSegments({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`vs-coverage${compact ? " is-compact" : ""}`} role="img" aria-label="Coverage: Level 2+, common and error paths covered" data-aria-label-en="Coverage: Level 2+, common and error paths covered" data-aria-label-zh="Coverage：Level 2+，常見路徑與錯誤路徑已覆蓋">
      <span className="is-done">0</span>
      <span className="is-done">1</span>
      <span className="is-current">2+</span>
      <span>3</span>
    </span>
  );
}

function QualityLights({ compact = false, tone = "warning", label = { en: "Warning", zh: "警示" } }: { compact?: boolean; tone?: QualityTone; label?: LocalizedText }) {
  const color = tone === "good" ? { en: "green", zh: "綠色" } : tone === "warning" ? { en: "yellow", zh: "黃色" } : { en: "red", zh: "紅色" };
  return (
    <span className={`vs-lights${compact ? " is-compact" : ""}`} role="img" aria-label={`Quality Assessment: ${label.en}, ${color.en} light`} data-aria-label-en={`Quality Assessment: ${label.en}, ${color.en} light`} data-aria-label-zh={`Quality Assessment：${label.zh}，${color.zh}燈號`}>
      <span className={`is-red${tone === "bad" ? " is-on" : ""}`} /><span className={`is-yellow${tone === "warning" ? " is-on" : ""}`} /><span className={`is-green${tone === "good" ? " is-on" : ""}`} />
    </span>
  );
}

export function TemplateHeader({ current }: { current: "ac" | "abc" }) {
  const title = current === "ac"
    ? { en: "A + C · Merged Repo View", zh: "A + C · Repo 合併檢視" }
    : { en: "A + B + C · Merged Repo + Gates", zh: "A + B + C · Repo 合併檢視 + Gates" };
  return (
    <header className="st-header">
      <div className="st-topline">
        <p>Low-Tech Testing Dashboard · Site Template</p>
        <span><T en="Read-only demo" zh="唯讀 Demo" /></span>
      </div>
      <div className="st-title-row">
        <div>
          <p className="st-overline">Repo-Based Quality Decisions</p>
          <h1><T {...title} /></h1>
          <p><T en="Read the decision first, then the status; expand details only when needed." zh="先看決定，再看狀態；需要時才展開細節。" /></p>
        </div>
        <div className="st-release-summary">
          <small><T en="Portfolio status" zh="作品集狀態" /></small>
          <Signal tone="good" mark="✓"><T en="2 releases ready" zh="2 個 release 已就緒" /></Signal>
        </div>
      </div>
      <nav className="st-nav" aria-label="Template navigation" data-aria-label-en="Template navigation" data-aria-label-zh="範本導覽">
        {current === "ac" ? <span aria-current="page">A + C</span> : <a href={siteHref("/dashboard-demo/ac")}>A + C</a>}
        {current === "abc" ? <span aria-current="page">A + B + C</span> : <a href={siteHref("/dashboard-demo/abc")}>A + B + C</a>}
        <a href={siteHref("/dashboard-demo")}><T en="Three Samples" zh="三種 Samples" /></a>
        <a href={siteHref("/")}>Decision Desk</a>
      </nav>
    </header>
  );
}

function MergedRepoCells({ repo, withDecision }: { repo: DashboardRepo; withDecision: boolean }) {
  return (
    <>
      <div className="st-merged-cell is-repo" data-label="Repo" data-label-en="Repo" data-label-zh="Repo">
        <strong>{repo.name}</strong>
        <span>{repo.version}</span>
        {!withDecision && <small><T en="Expand Gate Flow ↓" zh="展開 Gate Flow ↓" /></small>}
      </div>
      <div className="st-merged-cell" data-label="Objective" data-label-en="Objective" data-label-zh="目標">
        <strong><T {...repo.objective} /></strong><span><T en="Pre-release assessment" zh="發布前判斷" /></span>
      </div>
      <div className="st-merged-cell" data-label="Release Decision" data-label-en="Release Decision" data-label-zh="發布決定">
        <Signal tone={repo.decisionTone} mark={repo.decisionTone === "good" ? "✓" : repo.decisionTone === "warning" ? "!" : "?"}><T {...repo.decision} /></Signal><span><T {...repo.decisionNote} /></span>
      </div>
      <div className="st-merged-cell" data-label="Test Effort" data-label-en="Test Effort" data-label-zh="測試投入">
        <strong><T {...repo.effort} /></strong><EffortBars compact level={repo.effortBars} label={repo.effort} />
      </div>
      <div className="st-merged-cell" data-label="Coverage" data-label-en="Coverage" data-label-zh="覆蓋">
        <strong>{repo.coverage}</strong><CoverageSegments compact />
      </div>
      <div className="st-merged-cell" data-label="Quality Assessment" data-label-en="Quality Assessment" data-label-zh="品質評估">
        <strong><T {...repo.quality} /></strong><QualityLights compact tone={repo.qualityTone} label={repo.quality} />
      </div>
      {withDecision && (
        <div className="st-merged-cell is-final-decision" data-label="Decision" data-label-en="Decision" data-label-zh="決定">
          <strong><T {...repo.finalDecision} /></strong><span><T {...repo.finalNote} /></span>
        </div>
      )}
    </>
  );
}

function InlineReleaseGates({ repo, formal = false }: { repo: DashboardRepo; formal?: boolean }) {
  return (
    <div className="st-inline-gates">
      <header>
        <div><p>{formal ? "Release Gate Flow" : "B · Release Gate Flow"}</p><h3><T en="How were the release conditions completed?" zh="發布條件如何完成？" /></h3></div>
        <Signal tone="good" mark="✓"><T {...repo.gateSummary} /></Signal>
      </header>
      <ol className="vs-gates" aria-label={`${repo.name} release gate status`} data-aria-label-en={`${repo.name} release gate status`} data-aria-label-zh={`${repo.name} release gate 狀態`}>
        {repo.gates.map((gate) => (
          <li data-state={gate.state} key={gate.id}><span className="vs-gate-node" aria-hidden="true">{gate.state === "complete" ? "✓" : gate.state === "blocked" ? "!" : "?"}</span><div><small>{gate.id}</small><strong><T {...gate.title} /></strong><span><T {...gate.note} /></span></div></li>
        ))}
      </ol>
      <div className="st-area-table" role="region" aria-label={`${repo.name} Product Areas`}>
        <div className="st-area-head" aria-hidden="true"><span>Product Area</span><span>Effort</span><span>Coverage</span><span>Quality</span><span>Comments</span></div>
        {repo.productAreas.map((area) => (
          <article className="st-area-row" key={area.id}>
            <strong data-label="Product Area" data-label-en="Product Area" data-label-zh="產品區域"><T {...area.name} /></strong>
            <span data-label="Effort" data-label-en="Effort" data-label-zh="投入"><T {...area.effortLevel} /> / <T {...area.executionState} /></span>
            <span data-label="Coverage" data-label-en="Coverage" data-label-zh="覆蓋"><T en={`${area.coverage} / target ${area.targetCoverage}`} zh={`${area.coverage} / 目標 ${area.targetCoverage}`} /></span>
            <span data-label="Quality" data-label-en="Quality" data-label-zh="品質"><T {...area.quality} /></span>
            <span data-label="Comments" data-label-en="Comments" data-label-zh="說明"><T {...area.comment} /></span>
          </article>
        ))}
      </div>
      <div className="st-inline-next">
        <div><small><T en="Next action" zh="下一步" /></small><strong><T {...repo.nextAction} /></strong></div>
        <a href={formal ? repo.recordsHref : siteHref("/")}><T {...(formal ? repo.recordsLabel : { en: "View release decision", zh: "查看發布判斷" })} /></a>
      </div>
    </div>
  );
}

export function MergedRepoDashboard({ includeGates, formal = false }: { includeGates: boolean; formal?: boolean }) {
  const labels = includeGates
    ? [{ en: "Repo", zh: "Repo" }, { en: "Objective", zh: "目標" }, { en: "Release Decision", zh: "發布決定" }, { en: "Test Effort", zh: "測試投入" }, { en: "Coverage", zh: "覆蓋" }, { en: "Quality Assessment", zh: "品質評估" }]
    : [{ en: "Repo", zh: "Repo" }, { en: "Objective", zh: "目標" }, { en: "Release Decision", zh: "發布決定" }, { en: "Test Effort", zh: "測試投入" }, { en: "Coverage", zh: "覆蓋" }, { en: "Quality Assessment", zh: "品質評估" }, { en: "Decision", zh: "決定" }];

  return (
    <section className="st-section" aria-labelledby="merged-dashboard-heading">
      <header className="st-section-heading">
        <div>
          <span className="st-section-letter">{formal ? "QA" : includeGates ? "ABC" : "AC"}</span>
          <div><p><T {...(formal ? { en: "Repository portfolio", zh: "Repository 作品集" } : { en: "Two repositories · One row each", zh: "兩個 repositories · 各一列" })} /></p><h2 id="merged-dashboard-heading"><T {...(formal ? { en: "Repository Quality Dashboard", zh: "Repository 品質 Dashboard" } : { en: "Merged Repo Dashboard", zh: "Repo 合併 Dashboard" })} /></h2></div>
        </div>
        <span><T {...(formal || includeGates ? { en: "Expand a repo to view its Gate Flow", zh: "展開 Repo 查看 Gate Flow" } : { en: "7 decision fields", zh: "7 個決策欄位" })} /></span>
      </header>

      <div className="st-merged-board">
        <div className={`st-merged-head ${includeGates ? "has-gates" : "has-decision"}`} aria-hidden="true">
          {labels.map((label) => <span key={label.en}><T {...label} /></span>)}
        </div>

        {dashboardRepos.map((repo) => includeGates ? (
          <details className="st-merged-repo" key={repo.name}>
            <summary className="st-merged-grid has-gates" aria-label={`${repo.name}, expand Release Gate Flow`} data-aria-label-en={`${repo.name}, expand Release Gate Flow`} data-aria-label-zh={`${repo.name}，展開 Release Gate Flow`}>
              <MergedRepoCells repo={repo} withDecision={false} />
            </summary>
            <InlineReleaseGates repo={repo} formal={formal} />
          </details>
        ) : (
          <article className="st-merged-grid has-decision" aria-label={`${repo.name} merged test status`} data-aria-label-en={`${repo.name} merged test status`} data-aria-label-zh={`${repo.name} 的合併測試狀態`} key={repo.name}>
            <MergedRepoCells repo={repo} withDecision />
          </article>
        ))}

        <div className="st-new-repo" role="note" aria-label="New Repo onboarding position" data-aria-label-en="New Repo onboarding position" data-aria-label-zh="New Repo 接入位置">
          <span aria-hidden="true">＋</span>
          <div><strong>New Repo</strong><p><T en="Add one row with the same fields after onboarding; the Dashboard reading pattern stays the same." zh="接入後依相同欄位新增一列；不改變 Dashboard 的閱讀方式。" /></p></div>
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
          <span>Primary objective · <T {...repo.objective} /></span>
        </div>
        <div className="vs-objective-cards">
          <article className="vs-objective-card is-decision">
            <p>Release Decision</p>
            <div className="vs-decision-orbit" aria-label="Release Decision: Ready, formally approved" data-aria-label-en="Release Decision: Ready, formally approved" data-aria-label-zh="Release Decision：就緒，正式核准"><span>✓</span></div>
            <strong><T {...repo.decision} /></strong><small><T {...repo.decisionNote} /></small>
          </article>
          <article className="vs-objective-card is-effort">
            <p>Test Effort</p><strong><T {...repo.effort} /></strong><EffortBars level={repo.effortBars} label={repo.effort} /><small><T en="Three test categories executed" zh="三類測試已執行" /></small>
          </article>
          <article className="vs-objective-card is-coverage">
            <p>Coverage</p><strong>{repo.coverage}</strong><CoverageSegments /><small><T en="Common paths + error paths" zh="常見路徑 + 錯誤路徑" /></small>
          </article>
          <article className="vs-objective-card is-quality">
            <p>Quality Assessment</p><strong><T {...repo.quality} /></strong><QualityLights tone={repo.qualityTone} label={repo.quality} /><small><T {...repo.qualityLabel} /></small>
          </article>
        </div>
        <div className="vs-board-answer">
          <span><T en="Can this release now?" zh="現在能不能發？" /></span>
          <strong><Signal tone="good" mark="✓"><T en="Yes. The formal G6 Go record is complete." zh="可以。G6 正式 Go 紀錄已完成。" /></Signal></strong>
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
        <span><T en="All gates complete" zh="全部 Gate 已完成" /></span>
      </header>
      <div className="vs-board vs-gate-board">
        <div className="vs-gate-summary">
          <div><p>{repo.name}</p><h3>Release Readiness</h3></div>
          <div className="vs-release-lock"><span aria-hidden="true">✓</span><div><small>Release Decision</small><strong>Ready</strong></div></div>
        </div>
        <ol className="vs-gates" aria-label="Release gate status" data-aria-label-en="Release gate status" data-aria-label-zh="Release gate 狀態">
        {repo.gates.map((gate) => <li data-state={gate.state} key={gate.id}><span className="vs-gate-node" aria-hidden="true">✓</span><div><small>{gate.id}</small><strong><T {...gate.title} /></strong><span><T {...gate.note} /></span></div></li>)}
        </ol>
        <div className="vs-blocker-callout">
          <span className="vs-callout-icon" aria-hidden="true">✓</span>
          <div><small>Release state</small><strong><T {...repo.nextAction} /></strong></div>
          <a href={siteHref("/")}><T en="View release decision" zh="查看發布判斷" /></a>
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
        <span><T en="One new row per repo" zh="新增 Repo 就新增一列" /></span>
      </header>
      <div className="vs-board vs-portfolio-board">
        <div className="vs-portfolio-head" aria-hidden="true">
          <span>Repository</span><span>Objective</span><span>Effort</span><span>Coverage</span><span>Quality</span><span>Decision</span>
        </div>
        {dashboardRepos.map((repo) => <article className="vs-repo-strip" aria-label={`${repo.name} test status`} data-aria-label-en={`${repo.name} test status`} data-aria-label-zh={`${repo.name} 的測試狀態`} key={repo.name}>
          <div className="vs-repo-cell is-name" data-label="Repository" data-label-en="Repository" data-label-zh="Repository"><strong>{repo.name}</strong><span>{repo.version}</span></div>
          <div className="vs-repo-cell" data-label="Objective" data-label-en="Objective" data-label-zh="目標"><strong><T {...repo.objective} /></strong><span><T en="Pre-release assessment" zh="發布前判斷" /></span></div>
          <div className="vs-repo-cell" data-label="Effort" data-label-en="Effort" data-label-zh="投入"><strong><T {...repo.effort} /></strong><EffortBars compact level={repo.effortBars} label={repo.effort} /></div>
          <div className="vs-repo-cell" data-label="Coverage" data-label-en="Coverage" data-label-zh="覆蓋"><strong>{repo.coverage}</strong><CoverageSegments compact /></div>
          <div className="vs-repo-cell" data-label="Quality" data-label-en="Quality" data-label-zh="品質"><strong><T {...repo.quality} /></strong><QualityLights compact tone={repo.qualityTone} label={repo.quality} /></div>
          <div className="vs-repo-cell is-decision" data-label="Decision" data-label-en="Decision" data-label-zh="決定"><Signal tone={repo.decisionTone} mark="✓"><T {...repo.decision} /></Signal><span><T {...repo.finalNote} /></span></div>
        </article>)}
        <div className="vs-future-row"><span aria-hidden="true">＋</span><p><strong><T en="Add one row when the next repo is onboarded." zh="下一個 Repo 接入後，新增一列。" /></strong><T en=" Reviewers keep using the same fields." zh="管理者仍使用同一套欄位閱讀。" /></p></div>
      </div>
    </section>
  );
}

export function TemplateFooter() {
  return (
    <footer className="st-footer">
      <div><strong><T en="Data boundary" zh="資料邊界" /></strong><span><T en="Defect, UX, Performance, and Security are outside this pilot; no fabricated metrics are shown." zh="Defect、UX、Performance、Security 未納入本次 Pilot，不顯示虛構數字。" /></span></div>
      <nav aria-label="Record links"><a href={siteHref("/run-records")}><T en="Test Cases and Run Records" zh="Test Cases 與執行記錄" /></a><a href={siteHref("/")}><T en="Formal release decision" zh="正式發布判斷" /></a></nav>
    </footer>
  );
}
