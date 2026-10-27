import { T, type LocalizedText } from "./_i18n";

export type LampTone = "good" | "warning" | "bad" | "unknown";

const TONE_TEXT: Record<LampTone, { symbol: string } & LocalizedText> = {
  good: { symbol: "✓", en: "Good", zh: "良好" },
  warning: { symbol: "!", en: "Attention", zh: "注意" },
  bad: { symbol: "✕", en: "Poor", zh: "差" },
  unknown: { symbol: "?", en: "Unknown", zh: "未知" },
};

export function StatusLamp({ tone, label }: { tone: LampTone; label?: LocalizedText }) {
  const toneText = TONE_TEXT[tone];
  const text = label ?? { en: toneText.en, zh: toneText.zh };
  return (
    <span className={`status-lamp status-lamp--${tone}`} data-tone={tone}>
      <span className="status-lamp-symbol" aria-hidden="true">{toneText.symbol}</span>
      <span className="status-lamp-text"><T en={text.en} zh={text.zh} /></span>
    </span>
  );
}
