import type { Metadata } from "next";
import Link from "next/link";
import { siteHref } from "../_site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Low-Tech Testing Dashboard — Visual Samples",
  description: "用同一份 repository 測試狀態，比較 Objective Cards、Release Gate Flow 與 Repo Portfolio Matrix 三種視覺化。",
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
    <span className={`vs-effort-bars${compact ? " is-compact" : ""}`} role="img" aria-label="Test Effort：High，四格中 4 格">
      <span className="is-active" /><span className="is-active" /><span className="is-active" /><span className="is-active" />
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

function QualityLights({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`vs-lights${compact ? " is-compact" : ""}`} role="img" aria-label="Quality Assessment：Ready，綠色燈號">
      <span className="is-red" /><span className="is-yellow" /><span className="is-green is-on" />
    </span>
  );
}

export default function DashboardDemo() {
  return (
    <main className="visual-samples">
      <a className="vs-skip" href="#samples">跳到三種 Dashboard sample</a>

      <header className="vs-header">
        <div className="vs-kicker">Repo-Based QA · Read-only visual study</div>
        <div className="vs-header-row">
          <div>
            <h1>Low-Tech Testing Dashboard</h1>
            <p>同一份 CEX 狀態，三種更直觀的視覺化方式。</p>
          </div>
          <div className="vs-demo-badge">Demo samples · 01–03</div>
        </div>
        <nav className="vs-nav" aria-label="Sample navigation">
          <a href="#sample-cards"><span>A</span> Objective Cards</a>
          <a href="#sample-gates"><span>B</span> Release Gate Flow</a>
          <a href="#sample-portfolio"><span>C</span> Repo Portfolio</a>
          <Link href={siteHref("/dashboard-demo/ac")}>A+C Template</Link>
          <Link href={siteHref("/dashboard-demo/abc")}>A+B+C Template</Link>
          <Link href={siteHref("/")}>正式 Decision Desk</Link>
        </nav>
      </header>

      <div className="vs-samples" id="samples">
        <section className="vs-sample" id="sample-cards" aria-labelledby="cards-title">
          <header className="vs-sample-heading">
            <div className="vs-sample-index">Sample A</div>
            <div>
              <h2 id="cards-title">Objective Cards</h2>
              <p>最像參考圖：四張卡片，各回答一個管理問題。</p>
            </div>
            <span className="vs-fit">適合單一 Repo</span>
          </header>

          <div className="vs-board vs-card-board">
            <div className="vs-repo-line">
              <div><strong>{repo.name}</strong><span>{repo.version}</span></div>
              <span>Primary objective · {repo.objective}</span>
            </div>

            <div className="vs-objective-cards">
              <article className="vs-objective-card is-decision">
                <p>Release Decision</p>
                <div className="vs-decision-orbit" aria-label="Release Decision：Ready，正式核准">
                  <span>✓</span>
                </div>
                <strong>{repo.decision}</strong>
                <small>正式 Go 已核准</small>
              </article>

              <article className="vs-objective-card is-effort">
                <p>Test Effort</p>
                <strong>{repo.effort}</strong>
                <EffortBars />
                <small>三類測試已執行</small>
              </article>

              <article className="vs-objective-card is-coverage">
                <p>Coverage</p>
                <strong>{repo.coverage}</strong>
                <CoverageSegments />
                <small>常見路徑 + 錯誤路徑</small>
              </article>

              <article className="vs-objective-card is-quality">
                <p>Quality Assessment</p>
                <strong>{repo.quality}</strong>
                <QualityLights />
                <small>測試通過，正式 Go 紀錄完成</small>
              </article>
            </div>

            <div className="vs-board-answer">
              <span>現在能不能發？</span>
              <strong><Signal tone="good" mark="✓">可以。G6 正式 Go 紀錄已完成。</Signal></strong>
            </div>
          </div>
        </section>

        <section className="vs-sample" id="sample-gates" aria-labelledby="gates-title">
          <header className="vs-sample-heading">
            <div className="vs-sample-index">Sample B</div>
            <div>
              <h2 id="gates-title">Release Gate Flow</h2>
              <p>把「卡在哪一關」放到畫面正中央。</p>
            </div>
            <span className="vs-fit">最容易解釋發布狀態</span>
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

            <ol className="vs-gates" aria-label="Release gate 狀態">
              <li data-state="complete">
                <span className="vs-gate-node" aria-hidden="true">✓</span>
                <div><small>G1</small><strong>範圍已鎖定</strong><span>Scope complete</span></div>
              </li>
              <li data-state="complete">
                <span className="vs-gate-node" aria-hidden="true">✓</span>
                <div><small>G3</small><strong>測試已通過</strong><span>3 類測試完成</span></div>
              </li>
              <li data-state="complete">
                <span className="vs-gate-node" aria-hidden="true">✓</span>
                <div><small>G5</small><strong>外部檢視完成</strong><span>回饋已取得</span></div>
              </li>
              <li data-state="complete">
                <span className="vs-gate-node" aria-hidden="true">✓</span>
                <div><small>G6</small><strong>正式 Go 紀錄完成</strong><span>Release authorized</span></div>
              </li>
              <li data-state="complete">
                <span className="vs-gate-node" aria-hidden="true">✓</span>
                <div><small>Release</small><strong>Ready</strong><span>可以發布</span></div>
              </li>
            </ol>

            <div className="vs-blocker-callout">
              <span className="vs-callout-icon" aria-hidden="true">✓</span>
              <div><small>Release state</small><strong>正式 Go 已核准；保留目前測試與決定紀錄</strong></div>
              <Link href={siteHref("/")}>查看發布判斷</Link>
            </div>
          </div>
        </section>

        <section className="vs-sample" id="sample-portfolio" aria-labelledby="portfolio-title">
          <header className="vs-sample-heading">
            <div className="vs-sample-index">Sample C</div>
            <div>
              <h2 id="portfolio-title">Repo Portfolio Matrix</h2>
              <p>每個 Repo 一列，未來接入多個專案時可直接橫向比較。</p>
            </div>
            <span className="vs-fit">適合多 Repo</span>
          </header>

          <div className="vs-board vs-portfolio-board">
            <div className="vs-portfolio-head" aria-hidden="true">
              <span>Repository</span><span>Objective</span><span>Effort</span><span>Coverage</span><span>Quality</span><span>Decision</span>
            </div>

            <article className="vs-repo-strip" aria-label={`${repo.name} 的測試狀態`}>
              <div className="vs-repo-cell is-name" data-label="Repository">
                <strong>{repo.name}</strong><span>{repo.version}</span>
              </div>
              <div className="vs-repo-cell" data-label="Objective">
                <strong>{repo.objective}</strong><span>發布前判斷</span>
              </div>
              <div className="vs-repo-cell" data-label="Effort">
                <strong>{repo.effort}</strong><EffortBars compact />
              </div>
              <div className="vs-repo-cell" data-label="Coverage">
                <strong>{repo.coverage}</strong><CoverageSegments compact />
              </div>
              <div className="vs-repo-cell" data-label="Quality">
                <strong>{repo.quality}</strong><QualityLights compact />
              </div>
              <div className="vs-repo-cell is-decision" data-label="Decision">
                <Signal tone="good" mark="✓">Ready</Signal><span>正式 Go 已核准</span>
              </div>
            </article>

            <div className="vs-future-row">
              <span aria-hidden="true">＋</span>
              <p><strong>下一個 Repo 接入後，新增一列。</strong>不需要改變管理者的閱讀方式。</p>
            </div>

            <div className="vs-legend" aria-label="狀態圖例">
              <span><i data-tone="good" />Complete</span>
              <span><i data-tone="warning" />Needs action</span>
              <span><i data-tone="unknown" />Unknown</span>
              <small>燈號同時附文字，不只靠顏色判斷。</small>
            </div>
          </div>
        </section>
      </div>

      <section className="vs-shared-details" aria-labelledby="shared-details-title">
        <div>
          <p className="vs-label">Shared source</p>
          <h2 id="shared-details-title">三種 sample 使用同一份資料</h2>
        </div>
        <details>
          <summary>查看判斷依據與測試記錄</summary>
          <div>
            <p><strong>判斷：</strong>G3 測試已通過；外部檢視與 G6 正式 Go 紀錄已完成，所以目前為 Ready。</p>
            <p><strong>未量測：</strong>Defect Finding、UX、Performance 與 Security 不在本次 Pilot 範圍，不顯示虛構數字。</p>
            <nav aria-label="Shared record links"><Link href={siteHref("/")}>正式發布判斷</Link><Link href={siteHref("/run-records")}>Test Cases 與執行記錄</Link></nav>
          </div>
        </details>
      </section>

      <footer className="vs-footer">
        <span>Demo only · 尚未取代正式首頁</span>
        <span>Different objectives, different measurements.</span>
      </footer>
    </main>
  );
}
