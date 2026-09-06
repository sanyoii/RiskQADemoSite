// Browser-safe semantic policy shared by CLI, exporter and presentation.
export const POLICY_VERSION = "2.0.0";
export const REQUIRED_GATES = ["G3", "G6"];
export const coverageLevels = ["0", "1", "1+", "2", "2+", "3"];

export function safeEvidenceUrl(value) {
  if (typeof value !== "string" || /[\s\\]/u.test(value) || [...value].some(char => char.charCodeAt(0) < 32)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return !/%(?:2f|5c|0[ad])/i.test(value);
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      && (url.hostname === "github.com" || url.hostname === "sanyoii.github.io")
      && !/%(?:0[ad])/i.test(value);
  } catch { return false; }
}

export function policyErrors(status, { now = new Date(), historical = false } = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, path });
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) return [{ code: "CLOCK_INVALID", path: "now" }];
  const assessment = status?.releaseAssessment;
  if (!assessment || !["ready", "at-risk", "blocked", "unknown"].includes(assessment.status)
      || !["runs", "productAreas", "gates"].every(key => Array.isArray(status[key]) && status[key].every(item => item && typeof item === "object"))
      || status.productAreas.some(area => !Array.isArray(area.evidenceLinks))) {
    return [{ code: "STRUCTURE_INVALID", path: "$" }];
  }
  const decided = Date.parse(assessment.decidedAt);
  const expiry = Date.parse(assessment.expiresAt);
  const generated = Date.parse(status.provenance?.generatedAt);
  const synced = Date.parse(status.provenance?.syncedAt);
  if (![decided, expiry, generated, synced].every(Number.isFinite)
      || expiry <= decided || generated < decided || synced < generated) add("TIME_ORDER_INVALID", "releaseAssessment");
  if (!historical && Math.max(decided, generated, synced) > now.getTime()) add("EVIDENCE_FROM_FUTURE", "provenance");
  if (status.provenance?.sourceSha !== status.repository?.fullSha) add("SUBJECT_SHA_MISMATCH", "provenance.sourceSha");
  for (const key of ["runs", "productAreas", "gates"]) {
    const seen = new Set();
    status[key].forEach((item, i) => {
      const id = key === "runs" ? item.runId : item.id;
      if (seen.has(id)) add(key === "runs" ? "RUN_ID_DUPLICATE" : "ID_DUPLICATE", `${key}[${i}].${key === "runs" ? "runId" : "id"}`);
      seen.add(id);
    });
  }
  status.runs.forEach((run, i) => {
    const at = Date.parse(run.executedAt);
    if (!Number.isFinite(at) || at > decided) add("RUN_AFTER_DECISION", `runs[${i}].executedAt`);
    if (!safeEvidenceUrl(run.evidenceUrl)) add("EVIDENCE_URL_UNSAFE", `runs[${i}].evidenceUrl`);
  });
  status.productAreas.forEach((area, i) => {
    if (!area.evidenceLinks.every(safeEvidenceUrl)) add("EVIDENCE_URL_UNSAFE", `productAreas[${i}].evidenceLinks`);
    if ((["warning", "bad"].includes(area.quality) || ["paused", "blocked"].includes(area.executionState)) && !area.comment?.trim()) {
      add("COMMENT_REQUIRED", `productAreas[${i}].comment`);
    }
  });
  if (assessment.status === "ready") {
    if (status.productAreas.some(area => area.quality === "bad" || area.executionState === "blocked")) {
      add("STATUS_CONFLICT", "releaseAssessment.status");
    }
    status.productAreas.forEach((area, i) => {
      if (area.executionState !== "complete") add("EXECUTION_INCOMPLETE", `productAreas[${i}].executionState`);
      if (!coverageLevels.includes(area.coverage) || !coverageLevels.includes(area.targetCoverage)) add("COVERAGE_INVALID", `productAreas[${i}].coverage`);
      if (coverageLevels.indexOf(area.coverage) < coverageLevels.indexOf(area.targetCoverage)) add("COVERAGE_TARGET_NOT_MET", `productAreas[${i}].coverage`);
      if (!area.evidenceLinks.length) add("EVIDENCE_MISSING", `productAreas[${i}].evidenceLinks`);
    });
    for (const gateId of REQUIRED_GATES) {
      if (!status.gates.some(gate => gate.id === gateId && gate.state === "complete")) add("REQUIRED_GATE_INCOMPLETE", `gates.${gateId}`);
    }
    if (status.gates.some(gate => gate.state !== "complete")) add("GATE_CONFLICT", "gates");
  }
  if (!historical) {
    if (expiry <= now.getTime()) add("EVIDENCE_STALE", "releaseAssessment.expiresAt");
    if (status.dataStatus !== "fresh") add("DATA_NOT_FRESH", "dataStatus");
  }
  return errors;
}

const reasonText = {
  EVIDENCE_STALE: ["Evidence expired", "證據已過期", "Obtain current evidence and request a new decision; retain the historical approval.", "取得有效證據並重新請求決定；保留歷史核准。"],
  DATA_NOT_FRESH: ["Current evidence unavailable", "目前證據不可用", "Restore the evidence source and verify the retrieved snapshot.", "恢復證據來源並驗證取得的 snapshot。"],
  REQUIRED_GATE_INCOMPLETE: ["Required review missing", "缺少必要審查", "Complete the identified gate with the designated decision owner.", "由指定決策負責人完成指出的 gate。"],
  GATE_CONFLICT: ["Gate conflicts with approval", "Gate 與核准矛盾", "Resolve the gate and reassess the release.", "處理 gate 後重新評估發布。"],
  COVERAGE_TARGET_NOT_MET: ["Coverage target unmet", "未達覆蓋目標", "Execute the missing planned coverage or obtain a scoped risk disposition.", "完成缺少的計畫覆蓋，或取得限定範圍的風險處置。"],
  EXECUTION_INCOMPLETE: ["Required execution incomplete", "必要執行未完成", "Complete the required checks and preserve every attempt.", "完成必要檢查並保留每次嘗試。"],
  CLOCK_UNCONFIRMED: ["Current validity not checked", "尚未確認目前有效性", "Check evidence at the current time before a release decision.", "發布決定前以目前時間檢查證據。"],
  RELEASE_EVIDENCE_REQUIRED: ["Evidence-chain review required", "證據鏈尚待審查", "Link the versioned requirement, design, cases, artifacts and owner approval before a current Go.", "目前 Go 前，連結版本化需求、設計、案例、artifact 與負責人核准。"],
  RELEASE_REVIEW_INVALID: ["Release review is not current", "發布審查目前無效", "Resolve the release-packet findings and obtain an approval for the exact subject.", "處理發布證據包問題，並取得針對此受測版本的核准。"],
};

/** @param {object} snapshot
 * @param {{now?: Date, clockConfirmed?: boolean, enforceReview?: boolean, releaseReview?: {eligible: boolean, codes?: string[], policyVersion?: string, sourceSha?: string, expiresAt?: string | null} | null}} options
 */
export function decisionView(snapshot, { now = new Date(), clockConfirmed = true, enforceReview = false, releaseReview = null } = {}) {
  const errors = policyErrors(snapshot, { now, historical: !clockConfirmed });
  if (!clockConfirmed) errors.unshift({ code: "CLOCK_UNCONFIRMED", path: "now" });
  if (enforceReview) {
    if (!releaseReview?.eligible) errors.push({ code: releaseReview?.codes?.[0] === "RELEASE_EVIDENCE_REQUIRED" || !releaseReview ? "RELEASE_EVIDENCE_REQUIRED" : "RELEASE_REVIEW_INVALID", path: "releaseEvidence" });
    else if (releaseReview.policyVersion !== POLICY_VERSION || releaseReview.sourceSha !== snapshot?.repository?.fullSha
        || !Number.isFinite(Date.parse(releaseReview.expiresAt)) || Date.parse(releaseReview.expiresAt) <= now.getTime()) errors.push({ code: "RELEASE_REVIEW_INVALID", path: "releaseEvidence" });
  }
  const reasons = errors.map(({ code, path }) => {
    const [en, zh, actionEn, actionZh] = reasonText[code] ?? ["Evidence needs correction", "證據需要修正", "Correct the identified evidence inconsistency before approval.", "核准前修正指出的證據矛盾。"];
    return { code, path, title: { en, zh }, action: { en: actionEn, zh: actionZh }, owner: snapshot?.releaseAssessment?.decisionOwner ?? "Unassigned" };
  });
  return {
    policyVersion: POLICY_VERSION,
    status: errors.length ? "unknown" : snapshot.releaseAssessment.status,
    historicalStatus: snapshot?.releaseAssessment?.status ?? "unknown",
    dataStatus: snapshot?.dataStatus === "unreachable" ? "unreachable" : errors.some(e => e.code === "EVIDENCE_STALE") ? "stale" : errors.length ? "unverified" : snapshot.dataStatus,
    reasons,
    checkedAt: clockConfirmed && Number.isFinite(now.getTime()) ? now.toISOString() : null,
  };
}
