// View-time approval expiry. Callers pass `now`; the build stores only the date it used.
import { decisionView } from "./decision-policy.mjs";

export function taipeiCalendarDate(instant) {
  const date = instant instanceof Date ? instant : new Date(instant);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function computedOnLabel(date) {
  return { en: `computed on ${date}`, zh: `計算於 ${date}` };
}

/** Status after the approval-expiry rule at an injected clock. */
export function approvalExpiryState(snapshot, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date(options.now ?? Date.now());
  const viewOptions = {
    now,
    clockConfirmed: options.clockConfirmed ?? true,
    enforceReview: options.enforceReview ?? false,
    releaseReview: options.releaseReview ?? null,
    risks: options.risks ?? [],
    archived: options.archived ?? false,
  };
  if (Object.hasOwn(options, "precedence")) viewOptions.precedence = options.precedence;
  const view = decisionView(snapshot, viewOptions);
  const ec4 = (view.exitCriteria ?? []).find((item) => item.id === "EC-4");
  return {
    status: view.status,
    expired: view.approvalValidity?.expired === true,
    ec4: ec4?.result ?? "unknown",
    view,
  };
}

export function entryDecisionAt(entry, now) {
  return approvalExpiryState(entry?.snapshot, {
    now,
    clockConfirmed: true,
    enforceReview: true,
    releaseReview: entry?.releaseReview ?? null,
    risks: entry?.risks ?? [],
    archived: entry?.archived === true,
  });
}
