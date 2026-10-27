// Browser-safe semantic policy shared by CLI, exporter and presentation.
export const POLICY_VERSION = "3.0.0";
export const REQUIRED_GATES = ["G3", "G6"];
export const coverageLevels = ["0", "1", "1+", "2", "2+", "3"];

// Q3 定案：William 2026-10-27 16:59（台北時間）
// 優先順序由重到輕：blocked > hold = unknown > at-risk > ready
// Hold 與 Unknown 同一級。兩者同時成立時，原因都列出，顯示狀態用 unknown。
export const EXPIRED_APPROVAL_PRECEDENCE = "blocked-first";

export const STATUS_PRECEDENCE_NOTE = {
  en: "When several conditions apply, the most severe state wins: Blocked, then Hold or Unknown, then At Risk, then Ready.",
  zh: "多個條件同時成立時，依優先順序取最嚴重的狀態：Blocked，其次 Hold 或 Unknown，再來 At Risk，最後 Ready。",
};

export const EXIT_CRITERIA_LABEL = { zh: "結束條件", en: "Exit criteria" };

export const EXIT_CRITERIA = [
  { id: "EC-1", title: { zh: "有效執行證據", en: "Valid execution evidence" } },
  { id: "EC-2", title: { zh: "無未解決 S1", en: "No unresolved S1" } },
  { id: "EC-3", title: { zh: "追溯矩陣", en: "Traceability matrix" } },
  { id: "EC-4", title: { zh: "核准仍在效期內", en: "Approval still within its validity period" } },
];

const RECORDED_STATUSES = ["ready", "at-risk", "blocked", "hold", "unknown"];

// Corrupt, unsafe or mismatched records are not trusted facts and stay Unknown.
const TRUST_FAILURE = new Set([
  "CLOCK_INVALID",
  "STRUCTURE_INVALID",
  "TIME_ORDER_INVALID",
  "EVIDENCE_FROM_FUTURE",
  "SUBJECT_SHA_MISMATCH",
  "RUN_ID_DUPLICATE",
  "ID_DUPLICATE",
  "RUN_AFTER_DECISION",
  "EVIDENCE_URL_UNSAFE",
  "COMMENT_REQUIRED",
  "STATUS_CONFLICT",
  "EXECUTION_INCOMPLETE",
  "COVERAGE_INVALID",
  "COVERAGE_TARGET_NOT_MET",
  "EVIDENCE_MISSING",
  "REQUIRED_GATE_INCOMPLETE",
  "GATE_CONFLICT",
]);

const AVAILABILITY = new Set([
  "CLOCK_UNCONFIRMED",
  // Run-evidence freshness only. Approval expiry uses APPROVAL_EXPIRED.
  "EVIDENCE_STALE",
  "DATA_NOT_FRESH",
  "RELEASE_EVIDENCE_REQUIRED",
  "RELEASE_REVIEW_INVALID",
]);

export function isSyntheticExample(record) {
  return record?.synthetic === true;
}

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
  if (!assessment || !RECORDED_STATUSES.includes(assessment.status)
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
    // Preserve the original archive decision; apply the stronger rule to current use.
    if (!historical && (status.summary?.quality === "warning" || status.productAreas.some(area => area.quality === "warning"))) {
      add("RESIDUAL_RISK_PRESENT", "releaseAssessment.status");
    }
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
    // Approval expiry is APPROVAL_EXPIRED (at least Hold). Do not emit EVIDENCE_STALE here.
    if (expiry <= now.getTime()) add("APPROVAL_EXPIRED", "releaseAssessment.expiresAt");
    if (status.dataStatus !== "fresh") add("DATA_NOT_FRESH", "dataStatus");
  }
  return errors;
}

const reasonText = {
  RESIDUAL_RISK_PRESENT: ["Remaining risk is recorded", "仍有已記錄的風險", "Resolve or explicitly disposition the risk; acceptance does not make it risk-free.", "處理或明確記錄風險處置；接受風險不代表風險已消失。"],
  EVIDENCE_STALE: ["Run evidence expired", "執行證據已過期", "Refresh the expired run evidence and retain the historical result.", "更新已過期的執行證據，並保留歷史結果。"],
  APPROVAL_EXPIRED: ["Approval expired", "核准已過期", "Do not re-approve in this revision. Retest after the revamp launches and record a new approval period; keep the historical approval.", "本次不重新核准。改版上線後重測，並重新記錄核准與效期；保留歷史核准。"],
  UNRESOLVED_S1: ["Unresolved S1", "有未解決的 S1", "Resolve the S1 before a Ready decision. An expired approval is an unresolved S1.", "在可發布之前處理這項 S1。核准過期就是未解決的 S1。"],
  ARCHIVED: ["Archived display", "封存展示", "Keep the archived display. Do not re-approve it in this revision; retest after the revamp launches.", "維持封存展示。本次不重新核准，改版上線後重測。"],
  BLOCKED_RECORDED: ["Recorded blocker", "已記錄阻擋", "Resolve the recorded release blockers, rerun the affected checks, then reassess.", "處理已記錄的發布阻擋、重跑受影響檢查，再重新評估。"],
  AT_RISK_RECORDED: ["Recorded residual risk", "已記錄剩餘風險", "Review the remaining risk and record mitigation or a scoped owner acceptance.", "確認剩餘風險，記錄改善措施或負責人限定範圍的風險接受。"],
  HOLD_RECORDED: ["Recorded hold", "已記錄暫緩", "Keep the hold until the triggering condition is cleared, then retest and reassess.", "在觸發條件解除前維持暫緩，之後重測並重新評估。"],
  UNKNOWN_RECORDED: ["Recorded unknown", "已記錄待確認", "Correct the unknown record before treating it as a release fact.", "先修正這筆待確認紀錄，再把它當作發布事實。"],
  SUBJECT_SHA_MISMATCH: ["Subject SHA does not match", "受測版本 SHA 不符", "Correct the snapshot so the source SHA matches the repository subject before using it.", "修正快照，讓來源 SHA 與受測版本一致後再採用。"],
  DATA_NOT_FRESH: ["Current evidence unavailable", "目前證據不可用", "Restore the evidence source and verify the retrieved snapshot.", "恢復證據來源並驗證取得的 snapshot。"],
  REQUIRED_GATE_INCOMPLETE: ["Required review missing", "缺少必要審查", "Complete the identified gate with the designated decision owner.", "由指定決策負責人完成指出的 gate。"],
  GATE_CONFLICT: ["Gate conflicts with approval", "Gate 與核准矛盾", "Resolve the gate and reassess the release.", "處理 gate 後重新評估發布。"],
  COVERAGE_TARGET_NOT_MET: ["Coverage target unmet", "未達覆蓋目標", "Execute the missing planned coverage or obtain a scoped risk disposition.", "完成缺少的計畫覆蓋，或取得限定範圍的風險處置。"],
  EXECUTION_INCOMPLETE: ["Required execution incomplete", "必要執行未完成", "Complete the required checks and preserve every attempt.", "完成必要檢查並保留每次嘗試。"],
  CLOCK_UNCONFIRMED: ["Current validity not checked", "尚未確認目前有效性", "Check evidence at the current time before a release decision.", "發布決定前以目前時間檢查證據。"],
  RELEASE_EVIDENCE_REQUIRED: ["Evidence-chain review required", "證據鏈尚待審查", "Link the versioned requirement, design, cases, artifacts and owner approval before a current Go.", "目前 Go 前，連結版本化需求、設計、案例、artifact 與負責人核准。"],
  RELEASE_REVIEW_INVALID: ["Release review is not current", "發布審查目前無效", "Resolve the release-packet findings and obtain an approval for the exact subject.", "處理發布證據包問題，並取得針對此受測版本的核准。"],
};

function describe(code, path, snapshot, overrides = {}) {
  const [en, zh, actionEn, actionZh] = reasonText[code] ?? ["Evidence needs correction", "證據需要修正", "Correct the identified evidence inconsistency before approval.", "核准前修正指出的證據矛盾。"];
  const action = overrides.action?.en && overrides.action?.zh ? overrides.action : { en: actionEn, zh: actionZh };
  return {
    code,
    path,
    title: overrides.title?.en && overrides.title?.zh ? overrides.title : { en, zh },
    action,
    owner: overrides.owner || snapshot?.releaseAssessment?.decisionOwner || "Unassigned",
  };
}

export function requireExpiredApprovalPrecedence(value) {
  if (value !== "blocked-first") throw new Error("EXPIRED_APPROVAL_PRECEDENCE_INVALID");
  return value;
}

function selectStatus({ blocked, hold, unknown, atRisk, availabilityUnknown, hasErrors, recorded }) {
  requireExpiredApprovalPrecedence(EXPIRED_APPROVAL_PRECEDENCE);
  if (blocked) return "blocked";
  if (hold && unknown) return "unknown";
  if (hold) return "hold";
  if (unknown) return "unknown";
  if (atRisk) return "at-risk";
  if (availabilityUnknown || hasErrors) return "unknown";
  return recorded ?? "unknown";
}

function criterion(id, result, evidence) {
  const defined = EXIT_CRITERIA.find(item => item.id === id);
  return { id, title: defined.title, result, evidence };
}

function buildExitCriteria(snapshot, { clockOk, trustFailure, approvalExpired, s1, releaseReview, expiry }) {
  const runs = Array.isArray(snapshot?.runs) ? snapshot.runs : [];
  const areas = Array.isArray(snapshot?.productAreas) ? snapshot.productAreas : [];
  const links = runs.map(run => run?.evidenceUrl).filter(link => typeof link === "string");
  const runStale = Array.isArray(releaseReview?.codes) && releaseReview.codes.includes("RUN_STALE");
  const executionExpired = runStale || (approvalExpired && !releaseReview);
  const incomplete = areas.some(area => area?.executionState !== "complete") || runs.length === 0;
  let execution = "met";
  if (!clockOk || trustFailure) execution = "unknown";
  else if (executionExpired || incomplete) execution = "not-met";
  let s1Result = "met";
  if (!clockOk && !s1.length) s1Result = "unknown";
  else if (approvalExpired || s1.length) s1Result = "not-met";
  let approval = "met";
  if (!clockOk || !Number.isFinite(expiry)) approval = "unknown";
  else if (approvalExpired) approval = "not-met";
  const expiresAt = snapshot?.releaseAssessment?.expiresAt ?? null;
  return [
    criterion("EC-1", execution, {
      zh: execution === "met" ? "記錄的執行位於有效期限內，這項結束條件已滿足。" : execution === "not-met" ? "執行證據已超過有效期限，或必要執行未完成，不能滿足這項結束條件。" : "執行證據目前是否有效尚未確認，這項結束條件待確認。",
      en: execution === "met" ? "Recorded execution is inside its validity window, so this exit criterion is met." : execution === "not-met" ? "Execution evidence is outside its validity window or required execution is incomplete, so this exit criterion is not met." : "Current validity of the execution evidence is not confirmed, so this exit criterion is unknown.",
      links,
    }),
    criterion("EC-2", s1Result, {
      zh: s1Result === "met" ? "沒有未解決的 S1，這項結束條件已滿足。" : s1Result === "not-met" ? "仍有未解決的 S1，這項結束條件未滿足。" : "是否仍有未解決的 S1 尚未確認，這項結束條件待確認。",
      en: s1Result === "met" ? "No unresolved S1 is recorded, so this exit criterion is met." : s1Result === "not-met" ? "An unresolved S1 remains, so this exit criterion is not met." : "Whether an S1 remains unresolved is not confirmed, so this exit criterion is unknown.",
      links,
    }),
    criterion("EC-3", "unknown", {
      zh: "本輪沒有逐條核對追溯矩陣，這項結束條件待確認。",
      en: "This round did not check the traceability matrix line by line, so this exit criterion is unknown.",
      links,
    }),
    criterion("EC-4", approval, {
      zh: approval === "met" ? "核准仍在效期內，這項結束條件已滿足。" : approval === "not-met" ? `核准到期時間 ${expiresAt ?? ""} 已過，結束條件「核准仍在效期內」未滿足。` : "尚未以確認過的時間檢查核准效期，這項結束條件待確認。",
      en: approval === "met" ? "The approval is still inside expiresAt, so this exit criterion is met." : approval === "not-met" ? `Approval expiresAt ${expiresAt ?? ""} is no longer in the future, so this exit criterion is not met.` : "Approval validity was not checked against a confirmed clock, so this exit criterion is unknown.",
      links,
    }),
  ];
}

/** @param {object} snapshot
 * @param {{now?: Date, clockConfirmed?: boolean, enforceReview?: boolean, risks?: object[], archived?: boolean, releaseReview?: {eligible: boolean, codes?: string[], policyVersion?: string, sourceSha?: string, expiresAt?: string | null} | null}} options
 */
export function decisionView(snapshot, options = {}) {
  const precedence = Object.hasOwn(options, "precedence") ? options.precedence : EXPIRED_APPROVAL_PRECEDENCE;
  requireExpiredApprovalPrecedence(precedence);
  const { now = new Date(), clockConfirmed = true, enforceReview = false, releaseReview = null, risks = [], archived = false } = options;
  const errors = policyErrors(snapshot, { now, historical: !clockConfirmed });
  if (!clockConfirmed) errors.unshift({ code: "CLOCK_UNCONFIRMED", path: "now" });
  if (enforceReview) {
    if (!releaseReview?.eligible) errors.push({ code: releaseReview?.codes?.[0] === "RELEASE_EVIDENCE_REQUIRED" || !releaseReview ? "RELEASE_EVIDENCE_REQUIRED" : "RELEASE_REVIEW_INVALID", path: "releaseEvidence" });
    else if (releaseReview.policyVersion !== POLICY_VERSION || releaseReview.sourceSha !== snapshot?.repository?.fullSha
        || !Number.isFinite(Date.parse(releaseReview.expiresAt)) || Date.parse(releaseReview.expiresAt) <= now.getTime()) errors.push({ code: "RELEASE_REVIEW_INVALID", path: "releaseEvidence" });
  }
  const clockOk = clockConfirmed && now instanceof Date && Number.isFinite(now.getTime());
  const expiry = Date.parse(snapshot?.releaseAssessment?.expiresAt);
  const approvalExpired = clockOk && Number.isFinite(expiry) && expiry <= now.getTime();
  const s1 = (Array.isArray(risks) ? risks : []).filter(risk => risk && risk.severity === "S1" && risk.resolved !== true);
  const recorded = RECORDED_STATUSES.includes(snapshot?.releaseAssessment?.status) ? snapshot.releaseAssessment.status : null;
  const trustFailure = errors.some(error => TRUST_FAILURE.has(error.code));
  const blocked = recorded === "blocked" && !trustFailure;
  const hold = approvalExpired || s1.length > 0 || (recorded === "hold" && !trustFailure);
  const unknown = trustFailure || recorded === "unknown";
  const atRisk = !trustFailure && (recorded === "at-risk" || errors.some(error => error.code === "RESIDUAL_RISK_PRESENT"));
  const availabilityUnknown = errors.some(error => AVAILABILITY.has(error.code));
  const status = selectStatus({ blocked, hold, unknown, atRisk, availabilityUnknown, hasErrors: errors.length > 0, recorded });

  const reasons = [];
  const push = (code, path, overrides) => {
    if (reasons.some(reason => reason.code === code && reason.path === path)) return;
    reasons.push(describe(code, path, snapshot, overrides));
  };
  if (blocked) push("BLOCKED_RECORDED", "releaseAssessment.status");
  for (const error of errors) if (TRUST_FAILURE.has(error.code)) push(error.code, error.path);
  if (approvalExpired) push("APPROVAL_EXPIRED", "releaseAssessment.expiresAt");
  if (s1.length) {
    for (const risk of s1) {
      push("UNRESOLVED_S1", `risks.${risk.id ?? "s1"}`, {
        title: { en: `Unresolved S1: ${risk.id ?? "S1"}`, zh: `未解決的 S1：${risk.id ?? "S1"}` },
        action: risk.handling,
        owner: risk.owner,
      });
    }
  } else if (approvalExpired) push("UNRESOLVED_S1", "risks");
  if (recorded === "hold" && !trustFailure) push("HOLD_RECORDED", "releaseAssessment.status");
  if (archived === true) push("ARCHIVED", "registry.archived");
  if (recorded === "at-risk" && !trustFailure && !errors.some(error => error.code === "RESIDUAL_RISK_PRESENT")) push("AT_RISK_RECORDED", "releaseAssessment.status");
  for (const error of errors) if (!TRUST_FAILURE.has(error.code) && error.code !== "APPROVAL_EXPIRED") push(error.code, error.path);
  if (recorded === "unknown" && !trustFailure) push("UNKNOWN_RECORDED", "releaseAssessment.status");

  const stale = approvalExpired || errors.some(error => error.code === "EVIDENCE_STALE" || error.code === "APPROVAL_EXPIRED");
  return {
    policyVersion: POLICY_VERSION,
    status,
    historicalStatus: snapshot?.releaseAssessment?.status ?? "unknown",
    dataStatus: snapshot?.dataStatus === "unreachable" ? "unreachable" : stale ? "stale" : errors.length ? "unverified" : snapshot?.dataStatus,
    reasons,
    checkedAt: clockOk ? now.toISOString() : null,
    exitCriteria: buildExitCriteria(snapshot, { clockOk, trustFailure, approvalExpired, s1, releaseReview, expiry }),
    approvalValidity: { expiresAt: snapshot?.releaseAssessment?.expiresAt ?? null, expired: approvalExpired },
    archived: archived === true,
  };
}
