export type LocalizedText = {
  en: string;
  zh: string;
};

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
