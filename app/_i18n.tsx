export type LocalizedText = {
  en: string;
  zh: string;
};

export const LANGUAGE_STORAGE_KEY = "wl-lang";

export type SiteLanguage = "en" | "zh";

export function parseStoredLanguage(value: string | null | undefined): SiteLanguage {
  return value === "zh" ? "zh" : "en";
}

export function htmlLangFor(language: SiteLanguage): "en" | "zh-Hant" {
  return language === "zh" ? "zh-Hant" : "en";
}

export function languageFromHtmlLang(lang: string | null | undefined): SiteLanguage {
  return lang === "zh-Hant" ? "zh" : "en";
}

export function T({ en, zh }: LocalizedText) {
  return <span data-en={en} data-zh={zh}>{en}</span>;
}

export function pageLanguageData(title: LocalizedText, description: LocalizedText) {
  return {
    "data-page-title-en": title.en,
    "data-page-title-zh": title.zh,
    "data-page-description-en": description.en,
    "data-page-description-zh": description.zh,
  };
}
