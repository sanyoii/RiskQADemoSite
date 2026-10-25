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

export type ActivePageId = "dashboard" | "run-records" | "fail-demo" | "dashboard-demo";

export function ControlTowerNav({ active }: { active: ActivePageId }) {
  return (
    <nav className="decision-nav ct-nav ct-hybrid-nav" aria-label="Primary navigation" data-aria-label-en="Primary navigation" data-aria-label-zh="主要導覽">
      <div className="ct-nav-pills">
        {active === "dashboard" ? (
          <span className="ct-nav-pill is-active" aria-current="page">
            <span className="ct-nav-step">00</span>
            <strong><T en="Low-Tech Board" zh="主控白板" /></strong>
            <code className="ct-nav-badge ct-nb-blue">2 Unknown · 1 Hold</code>
          </span>
        ) : (
          <a className="ct-nav-pill" href={siteHref("/")}>
            <span className="ct-nav-step">00</span>
            <strong><T en="Low-Tech Board" zh="主控白板" /></strong>
            <code className="ct-nav-badge ct-nb-blue">2 Unknown · 1 Hold</code>
          </a>
        )}

        {active === "run-records" ? (
          <span className="ct-nav-pill is-active" aria-current="page">
            <span className="ct-nav-step">01</span>
            <strong><T en="Test Cases and Run Records" zh="Test Cases 與執行記錄" /></strong>
            <code className="ct-nav-badge ct-nb-green">67 Checks · 34 Cases</code>
          </span>
        ) : (
          <a className="ct-nav-pill" href={siteHref("/run-records")}>
            <span className="ct-nav-step">01</span>
            <strong><T en="Test Cases and Run Records" zh="Test Cases 與執行記錄" /></strong>
            <code className="ct-nav-badge ct-nb-green">67 Checks · 34 Cases</code>
          </a>
        )}

        {active === "fail-demo" ? (
          <span className="ct-nav-pill is-active" aria-current="page">
            <span className="ct-nav-step">02</span>
            <strong><T en="Failure and Decision Replay" zh="失敗案例與決定回放" /></strong>
            <code className="ct-nav-badge ct-nb-red">DEF-MDQ-004 · Hold</code>
          </span>
        ) : (
          <a className="ct-nav-pill" href={siteHref("/run-records/fail-demo")}>
            <span className="ct-nav-step">02</span>
            <strong><T en="Failure and Decision Replay" zh="失敗案例與決定回放" /></strong>
            <code className="ct-nav-badge ct-nb-red">DEF-MDQ-004 · Hold</code>
          </a>
        )}

        {active === "dashboard-demo" ? (
          <span className="ct-nav-pill is-active" aria-current="page">
            <span className="ct-nav-step">03</span>
            <strong><T en="Design evolution" zh="設計演進" /></strong>
            <code className="ct-nav-badge ct-nb-purple">Low-Tech v3 · 6 Rules</code>
          </span>
        ) : (
          <a className="ct-nav-pill" href={siteHref("/dashboard-demo")}>
            <span className="ct-nav-step">03</span>
            <strong><T en="Design evolution" zh="設計演進" /></strong>
            <code className="ct-nav-badge ct-nb-purple">Low-Tech v3 · 6 Rules</code>
          </a>
        )}
      </div>
      <ControlTowerThemeSwitch />
    </nav>
  );
}
