import type { Metadata } from "next";
import { siteHref } from "../_site";
import { pageLanguageData, T } from "../_i18n";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Low-Tech Testing Dashboard — Visual Samples",
  description: "Three visualizations of the same repository test status: Objective Cards, Release Gate Flow, and Repo Portfolio Matrix.",
};

const repo = {
  name: "cex-market-data-quality-lab",
  version: "main · 0.1.0 · 8fd5081",
  objective: "Release Readiness",
  decision: "Ready",
  effort: "High",
  coverage: "Level 2+",
  quality: "Ready",
} as const;

function Signal({ tone, mark, children }: { tone: "good" | "warning" | "unknown"; mark: string; children: React.ReactNode }) {
  return (
    <span className="vs-signal" data-tone={tone}>
      <span className="vs-signal-mark" aria-hidden="true">{mark}</span>
      {children}
    </span>
  );
}

function EffortBars({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`vs-effort-bars${compact ? " is-compact" : ""}`} role="img" aria-label="Test Effort: High, 4 of 4 bars" data-aria-label-en="Test Effort: High, 4 of 4 bars" data-aria-label-zh="Test Effort：高，四格中 4 格">
      <span className="is-active" /><span className="is-active" /><span className="is-active" /><span className="is-active" />
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

function QualityLights({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`vs-lights${compact ? " is-compact" : ""}`} role="img" aria-label="Quality Assessment: Ready, green light" data-aria-label-en="Quality Assessment: Ready, green light" data-aria-label-zh="Quality Assessment：就緒，綠色燈號">
      <span className="is-red" /><span className="is-yellow" /><span className="is-green is-on" />
    </span>
  );
}

export default function DashboardDemo() {
  return (
    <main className="visual-samples" {...pageLanguageData(
      { en: "Low-Tech Testing Dashboard — Visual Samples", zh: "Low-Tech Testing Dashboard — 視覺 Samples" },
      { en: "Three visualizations of the same repository test status: Objective Cards, Release Gate Flow, and Repo Portfolio Matrix.", zh: "用同一份 repository 測試狀態，比較 Objective Cards、Release Gate Flow 與 Repo Portfolio Matrix 三種視覺化。" },
    )}>
      <a className="vs-skip" href="#samples"><T en="Skip to the three Dashboard samples" zh="跳到三種 Dashboard sample" /></a>

      <header className="vs-header">
        <div className="vs-kicker">Repo-Based QA · Read-only visual study</div>
        <div className="vs-header-row">
          <div>
            <h1>Low-Tech Testing Dashboard</h1>
            <p><T en="Three clearer visualizations of the same CEX status." zh="同一份 CEX 狀態，三種更直觀的視覺化方式。" /></p>
          </div>
          <div className="vs-demo-badge">Demo samples · 01–03</div>
        </div>
        <nav className="vs-nav" aria-label="Sample navigation">
          <a href="#sample-cards"><span>A</span> Objective Cards</a>
          <a href="#sample-gates"><span>B</span> Release Gate Flow</a>
          <a href="#sample-portfolio"><span>C</span> Repo Portfolio</a>
          <a href={siteHref("/dashboard-demo/ac")}>A+C Template</a>
          <a href={siteHref("/dashboard-demo/abc")}>A+B+C Template</a>
          <a href={siteHref("/")}><T en="Formal Decision Desk" zh="正式 Decision Desk" /></a>
        </nav>
      </header>

      <div className="vs-samples" id="samples">
        <section className="vs-sample" id="sample-cards" aria-labelledby="cards-title">
          <header className="vs-sample-heading">
            <div className="vs-sample-index">Sample A</div>
            <div>
              <h2 id="cards-title">Objective Cards</h2>
              <p><T en="Closest to the reference: four cards, each answering one management question." zh="最像參考圖：四張卡片，各回答一個管理問題。" /></p>
            </div>
            <span className="vs-fit"><T en="Best for one repo" zh="適合單一 Repo" /></span>
          </header>

          <div className="vs-board vs-card-board">
            <div className="vs-repo-line">
              <div><strong>{repo.name}</strong><span>{repo.version}</span></div>
              <span>Primary objective · {repo.objective}</span>
            </div>

            <div className="vs-objective-cards">
              <article className="vs-objective-card is-decision">
                <p>Release Decision</p>
                <div className="vs-decision-orbit" aria-label="Release Decision: Ready, formally approved" data-aria-label-en="Release Decision: Ready, formally approved" data-aria-label-zh="Release Decision：就緒，正式核准">
                  <span>✓</span>
                </div>
                <strong>{repo.decision}</strong>
                <small><T en="Formal Go approved" zh="正式 Go 已核准" /></small>
              </article>

              <article className="vs-objective-card is-effort">
                <p>Test Effort</p>
                <strong>{repo.effort}</strong>
                <EffortBars />
                <small><T en="Three test categories executed" zh="三類測試已執行" /></small>
              </article>

              <article className="vs-objective-card is-coverage">
                <p>Coverage</p>
                <strong>{repo.coverage}</strong>
                <CoverageSegments />
                <small><T en="Common paths + error paths" zh="常見路徑 + 錯誤路徑" /></small>
              </article>

              <article className="vs-objective-card is-quality">
                <p>Quality Assessment</p>
                <strong>{repo.quality}</strong>
                <QualityLights />
                <small><T en="Tests passed and the formal Go was recorded" zh="測試通過，正式 Go 紀錄完成" /></small>
              </article>
            </div>

            <div className="vs-board-answer">
              <span><T en="Can this release now?" zh="現在能不能發？" /></span>
              <strong><Signal tone="good" mark="✓"><T en="Yes. The formal G6 Go record is complete." zh="可以。G6 正式 Go 紀錄已完成。" /></Signal></strong>
            </div>
          </div>
        </section>

        <section className="vs-sample" id="sample-gates" aria-labelledby="gates-title">
          <header className="vs-sample-heading">
            <div className="vs-sample-index">Sample B</div>
            <div>
              <h2 id="gates-title">Release Gate Flow</h2>
              <p><T en="Put the blocked gate at the center of the screen." zh="把「卡在哪一關」放到畫面正中央。" /></p>
            </div>
            <span className="vs-fit"><T en="Easiest release status to explain" zh="最容易解釋發布狀態" /></span>
          </header>

          <div className="vs-board vs-gate-board">
            <div className="vs-gate-summary">
              <div>
                <p>{repo.name}</p>
                <h3>Release Readiness</h3>
              </div>
              <div className="vs-release-lock">
                <span aria-hidden="true">✓</span>
                <div><small>Release Decision</small><strong>Ready</strong></div>
              </div>
            </div>

            <ol className="vs-gates" aria-label="Release gate status" data-aria-label-en="Release gate status" data-aria-label-zh="Release gate 狀態">
              <li data-state="complete">
                <span className="vs-gate-node" aria-hidden="true">✓</span>
                <div><small>G1</small><strong><T en="Scope locked" zh="範圍已鎖定" /></strong><span><T en="Scope complete" zh="範圍完成" /></span></div>
              </li>
              <li data-state="complete">
                <span className="vs-gate-node" aria-hidden="true">✓</span>
                <div><small>G3</small><strong><T en="Tests passed" zh="測試已通過" /></strong><span><T en="3 test categories complete" zh="3 類測試完成" /></span></div>
              </li>
              <li data-state="complete">
                <span className="vs-gate-node" aria-hidden="true">✓</span>
                <div><small>G5</small><strong><T en="External review complete" zh="外部檢視完成" /></strong><span><T en="Feedback received" zh="回饋已取得" /></span></div>
              </li>
              <li data-state="complete">
                <span className="vs-gate-node" aria-hidden="true">✓</span>
                <div><small>G6</small><strong><T en="Formal Go recorded" zh="正式 Go 紀錄完成" /></strong><span><T en="Release authorized" zh="發布已核准" /></span></div>
              </li>
              <li data-state="complete">
                <span className="vs-gate-node" aria-hidden="true">✓</span>
                <div><small>Release</small><strong><T en="Ready" zh="就緒" /></strong><span><T en="Release allowed" zh="可以發布" /></span></div>
              </li>
            </ol>

            <div className="vs-blocker-callout">
              <span className="vs-callout-icon" aria-hidden="true">✓</span>
              <div><small>Release state</small><strong><T en="Formal Go approved; retain the current test and decision records" zh="正式 Go 已核准；保留目前測試與決定紀錄" /></strong></div>
              <a href={siteHref("/")}><T en="View release decision" zh="查看發布判斷" /></a>
            </div>
          </div>
        </section>

        <section className="vs-sample" id="sample-portfolio" aria-labelledby="portfolio-title">
          <header className="vs-sample-heading">
            <div className="vs-sample-index">Sample C</div>
            <div>
              <h2 id="portfolio-title">Repo Portfolio Matrix</h2>
              <p><T en="One row per repo for direct comparison as more projects are onboarded." zh="每個 Repo 一列，未來接入多個專案時可直接橫向比較。" /></p>
            </div>
            <span className="vs-fit"><T en="Best for multiple repos" zh="適合多 Repo" /></span>
          </header>

          <div className="vs-board vs-portfolio-board">
            <div className="vs-portfolio-head" aria-hidden="true">
              <span>Repository</span><span>Objective</span><span>Effort</span><span>Coverage</span><span>Quality</span><span>Decision</span>
            </div>

            <article className="vs-repo-strip" aria-label={`${repo.name} test status`} data-aria-label-en={`${repo.name} test status`} data-aria-label-zh={`${repo.name} 的測試狀態`}>
              <div className="vs-repo-cell is-name" data-label="Repository" data-label-en="Repository" data-label-zh="Repository">
                <strong>{repo.name}</strong><span>{repo.version}</span>
              </div>
              <div className="vs-repo-cell" data-label="Objective" data-label-en="Objective" data-label-zh="目標">
                <strong><T en={repo.objective} zh="發布就緒度" /></strong><span><T en="Pre-release assessment" zh="發布前判斷" /></span>
              </div>
              <div className="vs-repo-cell" data-label="Effort" data-label-en="Effort" data-label-zh="投入">
                <strong>{repo.effort}</strong><EffortBars compact />
              </div>
              <div className="vs-repo-cell" data-label="Coverage" data-label-en="Coverage" data-label-zh="覆蓋">
                <strong>{repo.coverage}</strong><CoverageSegments compact />
              </div>
              <div className="vs-repo-cell" data-label="Quality" data-label-en="Quality" data-label-zh="品質">
                <strong>{repo.quality}</strong><QualityLights compact />
              </div>
              <div className="vs-repo-cell is-decision" data-label="Decision" data-label-en="Decision" data-label-zh="決定">
                <Signal tone="good" mark="✓"><T en="Ready" zh="就緒" /></Signal><span><T en="Formal Go approved" zh="正式 Go 已核准" /></span>
              </div>
            </article>

            <div className="vs-future-row">
              <span aria-hidden="true">＋</span>
              <p><strong><T en="Add one row when the next repo is onboarded." zh="下一個 Repo 接入後，新增一列。" /></strong><T en=" The management reading pattern stays the same." zh="不需要改變管理者的閱讀方式。" /></p>
            </div>

            <div className="vs-legend" aria-label="Status legend" data-aria-label-en="Status legend" data-aria-label-zh="狀態圖例">
              <span><i data-tone="good" />Complete</span>
              <span><i data-tone="warning" />Needs action</span>
              <span><i data-tone="unknown" />Unknown</span>
              <small><T en="Every signal includes text and never relies on color alone." zh="燈號同時附文字，不只靠顏色判斷。" /></small>
            </div>
          </div>
        </section>
      </div>

      <section className="vs-shared-details" aria-labelledby="shared-details-title">
        <div>
          <p className="vs-label">Shared source</p>
          <h2 id="shared-details-title"><T en="All three samples use the same data" zh="三種 sample 使用同一份資料" /></h2>
        </div>
        <details>
          <summary><T en="View decision basis and test records" zh="查看判斷依據與測試記錄" /></summary>
          <div>
            <p><T en="Decision: G3 tests passed; external review and the formal G6 Go record are complete, so the current status is Ready." zh="判斷：G3 測試已通過；外部檢視與 G6 正式 Go 紀錄已完成，所以目前為 Ready。" /></p>
            <p><T en="Not measured: Defect Finding, UX, Performance, and Security are outside this pilot; no fabricated metrics are shown." zh="未量測：Defect Finding、UX、Performance 與 Security 不在本次 Pilot 範圍，不顯示虛構數字。" /></p>
            <nav aria-label="Shared record links"><a href={siteHref("/")}><T en="Formal release decision" zh="正式發布判斷" /></a><a href={siteHref("/run-records")}><T en="Test Cases and Run Records" zh="Test Cases 與執行記錄" /></a></nav>
          </div>
        </details>
      </section>

      <footer className="vs-footer">
        <span><T en="Demo only · does not replace the formal home page" zh="Demo only · 尚未取代正式首頁" /></span>
        <span>Different objectives, different measurements.</span>
      </footer>
    </main>
  );
}
