"use client";

import { useEffect } from "react";

type Language = "en" | "zh";

const STORE = "wl-lang";

function applyLanguage(language: Language) {
  const key = language === "zh" ? "zh" : "en";

  document.querySelectorAll<HTMLElement>("[data-en][data-zh]").forEach((node) => {
    const value = node.dataset[key];
    if (value !== undefined && node.textContent !== value) node.textContent = value;
  });

  document.querySelectorAll<HTMLElement>("[data-aria-label-en][data-aria-label-zh]").forEach((node) => {
    const value = node.dataset[key === "zh" ? "ariaLabelZh" : "ariaLabelEn"];
    if (value !== undefined) node.setAttribute("aria-label", value);
  });

  document.querySelectorAll<HTMLElement>("[data-label-en][data-label-zh]").forEach((node) => {
    const value = node.dataset[key === "zh" ? "labelZh" : "labelEn"];
    if (value !== undefined) node.dataset.label = value;
  });

  const page = document.querySelector<HTMLElement>("[data-page-title-en][data-page-title-zh]");
  if (page) {
    const title = page.dataset[key === "zh" ? "pageTitleZh" : "pageTitleEn"];
    const description = page.dataset[key === "zh" ? "pageDescriptionZh" : "pageDescriptionEn"];
    if (title) document.title = title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (meta && description) meta.content = description;
  }

  document.documentElement.lang = key === "zh" ? "zh-Hant" : "en";
  const button = document.getElementById("qaLanguageToggle");
  const enTab = document.getElementById("qaLanguageEn");
  const zhTab = document.getElementById("qaLanguageZh");
  enTab?.classList.toggle("is-active", key === "en");
  zhTab?.classList.toggle("is-active", key === "zh");
  button?.setAttribute("aria-label", key === "en" ? "Switch to Chinese / 切換為中文" : "切換為英文 / Switch to English");
  return key;
}

export function LanguageToggle() {
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORE);
    } catch {
      saved = null;
    }
    const initial = saved === "zh" ? "zh" : "en";
    applyLanguage(initial);
    // Dynamic clock/replay updates must keep the selected language too.
    const options = { subtree: true, childList: true, attributes: true, attributeFilter: ["data-en", "data-zh", "data-aria-label-en", "data-aria-label-zh"] };
    const observer = new MutationObserver(() => {
      observer.disconnect();
      applyLanguage(document.documentElement.lang === "zh-Hant" ? "zh" : "en");
      observer.observe(document.body, options);
    });
    observer.observe(document.body, options);
    return () => observer.disconnect();
  }, []);

  function toggleLanguage() {
    const next = document.documentElement.lang === "zh-Hant" ? "en" : "zh";
    applyLanguage(next);
    try {
      localStorage.setItem(STORE, next);
    } catch {
      return;
    }
  }

  return (
    <button
      className="qa-language-toggle"
      id="qaLanguageToggle"
      type="button"
      onClick={toggleLanguage}
      aria-label="Switch to Chinese / 切換為中文"
    >
      <span className="is-active" id="qaLanguageEn">EN</span>
      <span className="qa-language-separator" aria-hidden="true">/</span>
      <span id="qaLanguageZh">中</span>
    </button>
  );
}
