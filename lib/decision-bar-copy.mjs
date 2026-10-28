// Plain-language copy for the shared release-decision bar.
// Sentences are built from status counts, approval expiry, and the recorded next step.

const STATUS_ORDER = ["blocked", "hold", "at-risk", "unknown", "ready"];

const EN_STATE = {
  hold: "on Hold",
  ready: "Ready",
  blocked: "Blocked",
  "at-risk": "at risk",
  unknown: "Unknown",
};

const ZH_STATE = {
  hold: "暫緩核准",
  ready: "已就緒",
  blocked: "受阻",
  "at-risk": "有風險",
  unknown: "狀態未知",
};

export const LAMP_LEGEND = {
  hold: {
    tone: "warning",
    en: "Hold",
    zh: "暫緩",
    explanation: { en: "Hold: not approved for release for now.", zh: "暫緩：目前不核准發布。" },
  },
  ready: {
    tone: "good",
    en: "Ready",
    zh: "就緒",
    explanation: { en: "Ready: release is approved for now.", zh: "就緒：目前核准發布。" },
  },
  "at-risk": {
    tone: "warning",
    en: "At risk",
    zh: "有風險",
    explanation: { en: "At risk: risk remains, so this is not an approval.", zh: "有風險：還有未處理的風險，先不要當成已核准。" },
  },
  blocked: {
    tone: "bad",
    en: "Blocked",
    zh: "受阻",
    explanation: { en: "Blocked: a recorded problem stops the release.", zh: "受阻：已記錄的問題擋住發布。" },
  },
  unknown: {
    tone: "unknown",
    en: "Unknown",
    zh: "未知",
    explanation: { en: "Unknown: the evidence is not enough to decide on release.", zh: "未知：證據還不足以判斷能不能發布。" },
  },
};

const STATUS_LEAD = {
  hold: { en: "Approval on hold", zh: "暫緩核准" },
  ready: { en: "Recorded as ready", zh: "紀錄為就緒" },
  blocked: { en: "Release is blocked", zh: "發布受阻" },
  "at-risk": { en: "Release is at risk", zh: "發布有風險" },
  unknown: { en: "Release status is unknown", zh: "發布狀態未知" },
};

export function taipeiParts(iso) {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type) => parts.find((part) => part.type === type)?.value ?? "";
  const day = `${read("year")}-${read("month")}-${read("day")}`;
  const stamp = `${day} ${read("hour")}:${read("minute")}`;
  return { day, en: `${stamp} (Taipei time)`, zh: `${stamp}（台北時間）` };
}

export function readApprovalExpired(decision, risks) {
  if (decision?.approvalValidity?.expired === true) return true;
  if ((decision?.reasons ?? []).some((reason) => reason.code === "APPROVAL_EXPIRED")) return true;
  return (risks ?? []).some((risk) => typeof risk?.id === "string" && risk.id.includes("approval-expired") && risk.resolved !== true);
}

function mentionsRevampRetest(step) {
  if (!step?.en || !step?.zh) return false;
  return /revamp/i.test(step.en) && step.zh.includes("改版");
}

function enSubject(count) {
  if (count === 1) return "The project";
  if (count === 2) return "Both projects";
  return `All ${count} projects`;
}

function zhCount(count) {
  return count === 1 ? "目前 1 個專案" : `目前 ${count} 個專案都`;
}

function sameStatusVerdict(repos, status) {
  const count = repos.length;
  const be = count === 1 ? "is" : "are";
  const subject = enSubject(count);
  const state = EN_STATE[status] ?? EN_STATE.unknown;
  const zhState = ZH_STATE[status] ?? ZH_STATE.unknown;
  if (status === "hold") {
    const revamp = repos.every((repo) => mentionsRevampRetest(repo.nextStep));
    const pronoun = count === 1 ? "it" : "they";
    const en = revamp
      ? `${subject} ${be} on Hold: approval is paused, and ${pronoun} will be retested after the revamp launches.`
      : `${subject} ${be} on Hold: approval is paused.`;
    const zh = revamp
      ? `${zhCount(count)}暫緩核准，等改版上線後再重測。`
      : `${zhCount(count)}暫緩核准。`;
    return { en, zh };
  }
  return {
    en: `${subject} ${be} ${state}.`,
    zh: `${zhCount(count)}${zhState}。`,
  };
}

function mixedVerdict(repos) {
  const counts = new Map();
  for (const repo of repos) counts.set(repo.status, (counts.get(repo.status) ?? 0) + 1);
  const statuses = STATUS_ORDER.filter((status) => counts.has(status));
  const enParts = statuses.map((status) => {
    const count = counts.get(status);
    const noun = count === 1 ? "project is" : "projects are";
    return `${count} ${noun} ${EN_STATE[status] ?? EN_STATE.unknown}`;
  });
  const zhParts = statuses.map((status) => `${counts.get(status)} 個專案${ZH_STATE[status] ?? ZH_STATE.unknown}`);
  const en = enParts.length === 1
    ? `${enParts[0]}.`
    : `${enParts.slice(0, -1).join(", ")} and ${enParts.at(-1)}.`;
  return {
    en: en.charAt(0).toUpperCase() + en.slice(1),
    zh: `目前 ${zhParts.join("、")}。`,
  };
}

export function decisionVerdict(repos) {
  if (!repos.length) {
    return { en: "No projects have a release decision.", zh: "目前沒有專案的發布決策。" };
  }
  const statuses = new Set(repos.map((repo) => repo.status));
  if (statuses.size === 1) return sameStatusVerdict(repos, repos[0].status);
  return mixedVerdict(repos);
}

export function projectStatusLine({ status, approvalExpired, expiresEn, expiresZh }) {
  const lead = STATUS_LEAD[status] ?? STATUS_LEAD.unknown;
  const dated = Boolean(expiresEn && expiresZh);
  if (approvalExpired && dated && status === "hold") {
    return {
      en: `Approval on hold; the approval expired on ${expiresEn}.`,
      zh: `暫緩核准；核准已於 ${expiresZh}到期。`,
    };
  }
  if (approvalExpired && dated) {
    return {
      en: `${lead.en}; the approval expired on ${expiresEn}.`,
      zh: `${lead.zh}；核准已於 ${expiresZh}到期。`,
    };
  }
  if (approvalExpired) {
    return { en: `${lead.en}; the approval has expired.`, zh: `${lead.zh}；核准已到期。` };
  }
  if (status === "hold" && dated) {
    return { en: `Approval on hold until ${expiresEn}.`, zh: `暫緩核准；核准至 ${expiresZh}。` };
  }
  if (status === "ready" && dated) {
    return { en: `Approved for release until ${expiresEn}.`, zh: `已核准發布，效期至 ${expiresZh}。` };
  }
  return { en: `${lead.en}.`, zh: `${lead.zh}。` };
}

export function lampLegends(repos) {
  const present = new Set(repos.map((repo) => repo.status));
  return STATUS_ORDER.filter((status) => present.has(status) && LAMP_LEGEND[status]).map((status) => ({
    status,
    ...LAMP_LEGEND[status],
  }));
}

export function pinnedSnapshotLine(repos) {
  const shas = repos.map((repo) => repo.shortSha).filter(Boolean);
  const days = repos.map((repo) => taipeiParts(repo.decidedAt)?.day).filter(Boolean).sort();
  const day = days.at(-1) ?? "";
  const selfReview = repos.length > 0 && repos.every((repo) => repo.selfReview);
  const expired = repos.length > 0 && repos.every((repo) => repo.approvalExpired);
  const notGo = repos.length > 0 && repos.every((repo) => repo.status !== "ready");
  let qualifier = { en: "recorded snapshot", zh: "已記錄的快照" };
  if (selfReview && expired && notGo) qualifier = { en: "expired self-review, not a current Go", zh: "自審已過期，不是目前的 Go" };
  else if (expired && notGo) qualifier = { en: "approval expired, not a current Go", zh: "核准已過期，不是目前的 Go" };
  else if (selfReview) qualifier = { en: "self-review, not an independent sign-off", zh: "自我審查，不是獨立簽核" };
  return {
    en: `Pinned snapshot: ${day} · SHA ${shas.join(" & ")} · ${qualifier.en}`,
    zh: `鎖定快照：${day} · SHA ${shas.join(" 與 ")} · ${qualifier.zh}`,
  };
}
