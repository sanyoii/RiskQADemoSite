import type { Metadata } from "next";
import { historyRoutes } from "../../lib/p3-pages.mjs";
import { pageLanguageData, T } from "../_i18n";
import { DecisionBar } from "../_decision-bar";
import { ControlTowerNav } from "../_shared-nav";

const history = historyRoutes();

export const HISTORY_URL = history.destination;
export const HISTORY_CANONICAL = "https://sanyoii.github.io/test-status/history/";

export const redirectMetadata: Metadata = {
  alternates: { canonical: HISTORY_CANONICAL },
};

export function LegacyRedirect({ from }: { from: string }) {
  return (
    <main className="shell decision-desk ct-shell" {...pageLanguageData(
      { en: "This address has moved — QA Decision Desk", zh: "這個網址已搬移 — QA 決策台" },
      { en: `${from} now opens the archived design history.`, zh: `${from} 現在會開啟已封存的設計演進。` },
    )}>
      <meta httpEquiv="refresh" content={`0; url=${HISTORY_URL}`} />
      <header className="masthead decision-masthead ct-topbar">
        <div className="ct-topbar-main">
          <div className="ct-topbar-left">
            <a className="ct-back-btn" href="https://sanyoii.github.io/">
              <T en="← sanyoii.github.io Portfolio" zh="← 返回 sanyoii.github.io 主站" />
            </a>
            <div className="ct-brand">
              <span className="ct-brand-dot" aria-hidden="true" />
              <div>
                <p className="eyebrow"><T en="Moved address" zh="網址已搬移" /></p>
                <h1><T en="Design history" zh="設計演進" /></h1>
              </div>
            </div>
          </div>
        </div>
      </header>
      <DecisionBar />
      <ControlTowerNav active="dashboard-demo" />
      <p>
        <T
          en={`${from} has moved to the archived design history.`}
          zh={`${from} 已搬到已封存的設計演進。`}
        />
      </p>
      <p>
        <a href={HISTORY_URL}>{HISTORY_URL}</a>
      </p>
    </main>
  );
}
