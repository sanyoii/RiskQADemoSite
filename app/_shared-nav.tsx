"use client";
import { useEffect } from "react";
import { siteHref } from "./_site";
import { T } from "./_i18n";

export type ThemeMode = "dark" | "light";
const THEME_STORE = "qa-control-tower-theme";

export function applyControlTowerTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.querySelectorAll(".ct-theme-dark-btn").forEach(el => el.classList.toggle("is-on", mode === "dark"));
  document.querySelectorAll(".ct-theme-light-btn").forEach(el => el.classList.toggle("is-on", mode === "light"));
}

export function ControlTowerThemeSwitch() {
  useEffect(() => {
    let saved: ThemeMode = "dark";
    try {
      const stored = localStorage.getItem(THEME_STORE);
      if (stored === "light" || stored === "dark") saved = stored;
    } catch {
      saved = "dark";
    }
    applyControlTowerTheme(saved);
  }, []);

  function switchTheme(next: ThemeMode) {
    applyControlTowerTheme(next);
    try {
      localStorage.setItem(THEME_STORE, next);
    } catch {
      return;
    }
  }

  return (
    <div className="ct-theme-switch" role="group" aria-label="Theme mode" data-aria-label-en="Theme mode" data-aria-label-zh="主題模式">
      <button type="button" id="ctThemeDark" className="ct-theme-dark-btn is-on" onClick={() => switchTheme("dark")}>
        <T en="🌙 Dark" zh="🌙 深色模式" />
      </button>
      <button type="button" id="ctThemeLight" className="ct-theme-light-btn" onClick={() => switchTheme("light")}>
        <T en="☀️ Whiteboard" zh="☀️ 淺色白板" />
      </button>
    </div>
  );
}

export type ActivePageId = "dashboard" | "exit-criteria" | "risks" | "run-records" | "fail-demo" | "templates" | "dashboard-demo";

const NAV_ITEMS: Array<{
  id: ActivePageId;
  en: string;
  zh: string;
  path: string;
  /** Flip to true when that page is part of the build. Hidden items are not rendered. */
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

export function ControlTowerNav({ active }: { active: ActivePageId }) {
  const items = NAV_ITEMS.filter((item) => item.enabled).map((item) => {
    if (item.bilingualTemplates) {
      const hrefEn = `${siteHref(item.path)}index.en.html`;
      return { ...item, href: hrefEn, hrefEn, hrefZh: siteHref(item.path) };
    }
    return { ...item, href: siteHref(item.path), hrefEn: undefined, hrefZh: undefined };
  });
  return (
    <nav className="decision-nav ct-nav ct-hybrid-nav" aria-label="Primary navigation" data-aria-label-en="Primary navigation" data-aria-label-zh="主要導覽">
      <div className="ct-nav-pills">
        {items.map((item) => {
          const label = <strong><T en={item.en} zh={item.zh} /></strong>;
          if (item.id === active) {
            return (
              <span className="ct-nav-pill is-active" aria-current="page" key={item.id}>
                {label}
              </span>
            );
          }
          if (item.hrefEn && item.hrefZh) {
            return (
              <a className="ct-nav-pill" href={item.href} data-href-en={item.hrefEn} data-href-zh={item.hrefZh} key={item.id}>
                {label}
              </a>
            );
          }
          return (
            <a className="ct-nav-pill" href={item.href} key={item.id}>
              {label}
            </a>
          );
        })}
      </div>
      <ControlTowerThemeSwitch />
    </nav>
  );
}
