import { dashboardData } from "./dashboard-data";
import { DecisionBarDetails } from "./_decision-bar-details";
import { T, type LocalizedText } from "./_i18n";
import { StatusLamp, type LampTone } from "./_status-lamp";

type DecisionStatus = "ready" | "at-risk" | "hold" | "blocked" | "unknown";

const STATUS_LAMP: Record<DecisionStatus, { tone: LampTone } & LocalizedText> = {
  ready: { tone: "good", en: "Ready", zh: "就緒" },
  "at-risk": { tone: "warning", en: "At risk", zh: "有風險" },
  hold: { tone: "warning", en: "Hold", zh: "暫緩" },
  blocked: { tone: "bad", en: "Blocked", zh: "受阻" },
  unknown: { tone: "unknown", en: "Unknown", zh: "未知" },
};

type BarRepo = {
  name: string;
  archived: boolean;
  decisionOwner: string;
  decidedAt: string;
  expiresAt: string;
  status: string;
  nextStep: LocalizedText | null;
};

function formatTaipei(iso: string): LocalizedText {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const stamp = `${read("year")}-${read("month")}-${read("day")} ${read("hour")}:${read("minute")}`;
  return { en: `${stamp} (Taipei time)`, zh: `${stamp}（台北時間）` };
}

function statusLamp(status: string) {
  if (status in STATUS_LAMP) return STATUS_LAMP[status as DecisionStatus];
  return STATUS_LAMP.unknown;
}

function barSummary(repos: BarRepo[]): LocalizedText {
  const count = repos.length;
  const allHold = repos.every((repo) => repo.status === "hold");
  const allArchived = repos.every((repo) => repo.archived);
  if (allHold && allArchived) {
    return {
      en: `Hold · Archived demo · ${count}`,
      zh: `暫緩 · 封存展示 · ${count}`,
    };
  }
  return {
    en: `${count} repos · release decisions`,
    zh: `${count} 個 repo · 發布決策`,
  };
}

function DecisionRows({ repos }: { repos: BarRepo[] }) {
  return (
    <ol className="decision-bar-rows">
      {repos.map((repo) => {
        const lamp = statusLamp(repo.status);
        const decided = formatTaipei(repo.decidedAt);
        const expires = formatTaipei(repo.expiresAt);
        return (
          <li className="decision-bar-row" data-status={repo.status} key={repo.name}>
            <StatusLamp tone={lamp.tone} label={{ en: lamp.en, zh: lamp.zh }} />
            {repo.archived ? (
              <span className="archived-demo" data-marker="archived-demo">
                <T en="Archived demo" zh="封存展示" />
              </span>
            ) : null}
            <span className="decision-bar-repo">{repo.name}</span>
            <span className="decision-bar-field">
              <span className="decision-bar-kicker"><T en="Decision maker" zh="決策人" /></span>
              <strong>{repo.decisionOwner}</strong>
            </span>
            <span className="decision-bar-field">
              <span className="decision-bar-kicker"><T en="Decision date" zh="決策日" /></span>
              <time dateTime={repo.decidedAt}><T en={decided.en} zh={decided.zh} /></time>
            </span>
            <span className="decision-bar-field">
              <span className="decision-bar-kicker"><T en="Expiry" zh="到期日" /></span>
              <time dateTime={repo.expiresAt}><T en={expires.en} zh={expires.zh} /></time>
            </span>
            <span className="decision-bar-field decision-bar-next">
              <span className="decision-bar-kicker"><T en="Next step" zh="下一步" /></span>
              {repo.nextStep ? <T en={repo.nextStep.en} zh={repo.nextStep.zh} /> : <T en="No further action." zh="沒有後續動作。" />}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function LampKey() {
  return (
    <div className="decision-bar-legend">
      <span className="decision-bar-kicker"><T en="Lamp key" zh="燈號對照" /></span>
      <StatusLamp tone="good" />
      <StatusLamp tone="warning" />
      <StatusLamp tone="bad" />
      <StatusLamp tone="unknown" />
    </div>
  );
}

export function DecisionBar() {
  const repos: BarRepo[] = dashboardData.repositories.map((entry) => ({
    name: entry.snapshot.repository.name,
    archived: entry.archived === true,
    decisionOwner: entry.decisionBar.decisionOwner,
    decidedAt: entry.decisionBar.decidedAt,
    expiresAt: entry.decisionBar.expiresAt,
    status: entry.decisionBar.status,
    nextStep: entry.decisionBar.nextStep,
  }));
  const summary = barSummary(repos);

  return (
    <section
      className="decision-bar-shell"
      aria-label="Release decisions"
      data-aria-label-en="Release decisions"
      data-aria-label-zh="發布決策"
    >
      <h2 className="decision-bar-title"><T en="Release decisions" zh="發布決策" /></h2>
      <div className="decision-bar-full">
        <LampKey />
        <DecisionRows repos={repos} />
      </div>
      <DecisionBarDetails>
        <summary className="decision-bar-summary" role="button" aria-expanded="false">
          <T en={summary.en} zh={summary.zh} />
        </summary>
        <div className="decision-bar-compact-body">
          <LampKey />
          <DecisionRows repos={repos} />
        </div>
      </DecisionBarDetails>
    </section>
  );
}
