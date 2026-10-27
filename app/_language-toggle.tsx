"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  LANGUAGE_STORAGE_KEY,
  htmlLangFor,
  languageFromHtmlLang,
  parseStoredLanguage,
  type SiteLanguage,
} from "./_i18n";

const LANGUAGE_CHANGE = "qa-language-change";
let memoryLanguage: SiteLanguage | null = null;

function subscribeLanguage(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LANGUAGE_CHANGE, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LANGUAGE_CHANGE, callback);
  };
}

function readLanguage(): SiteLanguage {
  try {
    return parseStoredLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return memoryLanguage ?? "en";
  }
}

function serverLanguage(): SiteLanguage {
  return "en";
}

function applyLanguage(language: SiteLanguage) {
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

  document.querySelectorAll<HTMLAnchorElement>("a[data-href-en][data-href-zh]").forEach((node) => {
    const href = node.dataset[key === "zh" ? "hrefZh" : "hrefEn"];
    if (href !== undefined && node.getAttribute("href") !== href) node.setAttribute("href", href);
  });

  const page = document.querySelector<HTMLElement>("[data-page-title-en][data-page-title-zh]");
  if (page) {
    const title = page.dataset[key === "zh" ? "pageTitleZh" : "pageTitleEn"];
    const description = page.dataset[key === "zh" ? "pageDescriptionZh" : "pageDescriptionEn"];
    if (title) document.title = title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (meta && description) meta.content = description;
  }

  document.documentElement.lang = htmlLangFor(key);
  const enTab = document.getElementById("qaLanguageEn");
  const zhTab = document.getElementById("qaLanguageZh");
  enTab?.setAttribute("aria-pressed", key === "en" ? "true" : "false");
  zhTab?.setAttribute("aria-pressed", key === "zh" ? "true" : "false");
  enTab?.classList.toggle("is-active", key === "en");
  zhTab?.classList.toggle("is-active", key === "zh");
  return key;
}

export function LanguageToggle() {
  const language = useSyncExternalStore(subscribeLanguage, readLanguage, serverLanguage);

  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  useEffect(() => {
    const options = { subtree: true, childList: true, attributes: true, attributeFilter: ["data-en", "data-zh", "data-aria-label-en", "data-aria-label-zh", "data-href-en", "data-href-zh"] };
    const observer = new MutationObserver(() => {
      observer.disconnect();
      applyLanguage(languageFromHtmlLang(document.documentElement.lang));
      observer.observe(document.body, options);
    });
    observer.observe(document.body, options);
    return () => observer.disconnect();
  }, []);

  function selectLanguage(next: SiteLanguage) {
    memoryLanguage = next;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked. The in-memory choice still drives this page.
    }
    applyLanguage(next);
    window.dispatchEvent(new Event(LANGUAGE_CHANGE));
  }

  return (
    <div
      className="qa-language-toggle"
      id="qaLanguageToggle"
      role="group"
      aria-label="Language"
      data-aria-label-en="Language"
      data-aria-label-zh="語言"
    >
      <button type="button" id="qaLanguageEn" aria-pressed={language === "en"} onClick={() => selectLanguage("en")}>
        EN
      </button>
      <span className="qa-language-separator" aria-hidden="true">/</span>
      <button type="button" id="qaLanguageZh" aria-pressed={language === "zh"} onClick={() => selectLanguage("zh")}>
        中文
      </button>
    </div>
  );
}
