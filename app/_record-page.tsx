import type { ReactNode } from "react";
import { siteHref } from "./_site";
import { pageLanguageData, T, type LocalizedText } from "./_i18n";
import { DecisionBar } from "./_decision-bar";
import { ControlTowerNav, type ActivePageId } from "./_shared-nav";

export function RecordPage({
  active,
  title,
  description,
  heading,
  eyebrow,
  children,
}: {
  active: ActivePageId;
  title: LocalizedText;
  description: LocalizedText;
  heading: LocalizedText;
  eyebrow: LocalizedText;
  children: ReactNode;
}) {
  return (
    <main className="shell decision-desk ct-shell" {...pageLanguageData(title, description)}>
      <header className="masthead decision-masthead ct-topbar">
        <div className="ct-topbar-main">
          <div className="ct-topbar-left">
            <a className="ct-back-btn" href="https://sanyoii.github.io/">
              <T en="← sanyoii.github.io Portfolio" zh="← 返回 sanyoii.github.io 主站" />
            </a>
            <div className="ct-brand">
              <span className="ct-brand-dot" aria-hidden="true" />
              <div>
                <p className="eyebrow"><T en={eyebrow.en} zh={eyebrow.zh} /></p>
                <h1><T en={heading.en} zh={heading.zh} /></h1>
              </div>
            </div>
          </div>
        </div>
      </header>
      <DecisionBar />
      <ControlTowerNav active={active} />
      <div className="record-page">{children}</div>
      <footer className="footer">
        <span><T en="Sanitized public projection" zh="已隱去敏感資訊的公開版" /></span>
        <div className="ct-footer-links">
          <a href={siteHref("/")}><T en="← Decision" zh="← 決策" /></a>
        </div>
      </footer>
    </main>
  );
}
