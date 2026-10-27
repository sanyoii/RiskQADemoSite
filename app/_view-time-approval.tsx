"use client";

import { useEffect, useState } from "react";
import { entryDecisionAt } from "../lib/approval-expiry.mjs";
import { exitCriteriaByRepo } from "../lib/p3-pages.mjs";
import { dashboardData, homepagePreviousComparisons } from "./dashboard-data";
import { T, type LocalizedText } from "./_i18n";
import { siteHref } from "./_site";
import { StatusLamp, type LampTone } from "./_status-lamp";

type DecisionStatus = "ready" | "at-risk" | "hold" | "blocked" | "unknown";

const STATUS_LAMP: Record<DecisionStatus, { tone: LampTone } & LocalizedText> = {
  ready: { tone: "good", en: "Ready", zh: "就緒" },
  "at-risk": { tone: "warning", en: "At risk", zh: "有風險" },
  hold: { tone: "warning", en: "Hold", zh: "暫緩" },
  blocked: { tone: "bad", en: "Blocked", zh: "受阻" },
  unknown: { tone: "unknown", en: "Unknown", zh: "未知" },
};

function lampFor(status: string) {
  if (status in STATUS_LAMP) return STATUS_LAMP[status as DecisionStatus];
  return STATUS_LAMP.unknown;
}

function runId(link: string) {
  return link.split("#")[1] ?? link;
}

export function ApprovalComputedNote({ computedOn }: { computedOn: string }) {
  const [live, setLive] = useState(false);
  useEffect(() => {
    setLive(true);
  }, []);
  if (live) return null;
  return (
    <p className="approval-computed-on" data-computed-on={computedOn}>
      <T en={`computed on ${computedOn}`} zh={`計算於 ${computedOn}`} />
    </p>
  );
}

export function LiveDecisionLamp({ repositoryName, buildStatus }: { repositoryName: string; buildStatus: string }) {
  const [status, setStatus] = useState(buildStatus);
  useEffect(() => {
    const entry = dashboardData.repositories.find((item) => item.snapshot.repository.name === repositoryName);
    if (!entry) return;
    setStatus(entryDecisionAt(entry, new Date()).status);
  }, [repositoryName]);
  const lamp = lampFor(status);
  return <StatusLamp tone={lamp.tone} label={{ en: lamp.en, zh: lamp.zh }} />;
}

export function LiveExpiryComparison({
  repository,
  initial,
}: {
  repository: string;
  initial: { tone: LampTone; label: LocalizedText };
}) {
  const [row, setRow] = useState(initial);
  useEffect(() => {
    const section = homepagePreviousComparisons(new Date()).find((item) => item.repository === repository);
    const expiry = section?.rows.find((item) => item.id === "expiry");
    if (!expiry) return;
    setRow({ tone: expiry.tone as LampTone, label: expiry.label });
  }, [repository]);
  return <StatusLamp tone={row.tone} label={row.label} />;
}

type CriterionItem = {
  id: string;
  title: LocalizedText;
  resultLabel: LocalizedText;
  tone: LampTone;
  evidence: LocalizedText;
  links: string[];
  anchorId: string;
};

export function ExitCriterionArticle({ repository, item }: { repository: string; item: CriterionItem }) {
  const [view, setView] = useState({ tone: item.tone, label: item.resultLabel, evidence: item.evidence });
  useEffect(() => {
    const entry = dashboardData.repositories.find((row) => row.snapshot.repository.name === repository);
    if (!entry) return;
    const pages = exitCriteriaByRepo([{
      repository,
      decision: entryDecisionAt(entry, new Date()).view,
    }]);
    const criterion = pages[0]?.criteria.find((row: { id: string }) => row.id === item.id);
    if (!criterion) return;
    setView({
      tone: criterion.tone as LampTone,
      label: criterion.resultLabel,
      evidence: criterion.evidence,
    });
  }, [repository, item.id]);

  return (
    <article className="exit-criteria-row" data-criterion={item.id} id={item.anchorId}>
      <div className="exit-criteria-criterion">
        <code>{item.id}</code>
        <h3><T en={item.title.en} zh={item.title.zh} /></h3>
        <StatusLamp tone={view.tone} label={view.label} />
      </div>
      <div className="exit-criteria-evidence">
        <p><T en={view.evidence.en} zh={view.evidence.zh} /></p>
        <ul>
          {item.links.map((link) => (
            <li key={link}>
              <a href={siteHref(link)}>
                <T en="Run record" zh="執行紀錄" /> {runId(link)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
