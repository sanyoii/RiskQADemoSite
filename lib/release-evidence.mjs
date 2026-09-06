import { createHash } from "node:crypto";
import { POLICY_VERSION } from "./decision-policy.mjs";

const canonical = value => Array.isArray(value) ? value.map(canonical)
  : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
export function evidenceDigest(packet) {
  const { review: _review, ...input } = packet;
  void _review;
  return createHash("sha256").update(JSON.stringify(canonical(input))).digest("hex");
}
const hash = value => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const text = value => typeof value === "string" && value.trim().length > 0;
const time = value => Number.isFinite(Date.parse(value));
const object = value => value && typeof value === "object" && !Array.isArray(value);

export function reviewRelease(packet, { now = new Date(), previous, authority } = {}) {
  const findings = [];
  const add = (code, path, action, blocking = true) => findings.push({ code, path, action, blocking });
  const finish = () => ({ policyVersion: POLICY_VERSION, valid: !findings.some(f => f.code === "STRUCTURE_INVALID"),
    eligible: !findings.some(f => f.blocking), reviewState: findings.some(f => f.blocking) ? "needs-review" : "approved",
    inputDigest: object(packet) ? evidenceDigest(packet) : null, findings });
  if (!object(packet) || packet.version !== "1.0.0" || !object(packet.subject)
      || !["real", "synthetic"].includes(packet.classification)
      || !text(packet.subject.repository) || !/^[a-f0-9]{40}$/.test(packet.subject.sha)
      || !text(packet.subject.environment) || !hash(packet.subject.configDigest)
      || !["requirements", "risks", "designs", "cases", "runs", "waivers", "events"].every(key => Array.isArray(packet[key]) && packet[key].every(object))) {
    add("STRUCTURE_INVALID", "$", "Supply a versioned release packet with subject and typed evidence arrays."); return finish();
  }
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) { add("STRUCTURE_INVALID", "now", "Supply a valid clock."); return finish(); }
  if (packet.subject.dirty === true) add("SUBJECT_UNCOMMITTED", "subject", "Commit the intended release subject and rerun/review the bound evidence before release.");
  const indices = {};
  for (const key of ["requirements", "risks", "designs", "cases", "runs", "waivers", "events"]) {
    indices[key] = new Map();
    for (const item of packet[key]) {
      if (!text(item.id) || indices[key].has(item.id)) add("ID_INVALID", key, "Use nonempty, unique stable IDs.");
      indices[key].set(item.id, item);
    }
  }
  for (const requirement of packet.requirements) if (!hash(requirement.digest) || !text(requirement.sourcePath)) add("REQUIREMENT_DIGEST_MISSING", requirement.id, "Bind the requirement to its versioned source file and content hash.");
  if (!packet.risks.length || !packet.cases.length) add("DESIGN_EMPTY", "$", "Declare the release risks and required checks.");
  const refs = (values, target, path) => {
    if (!Array.isArray(values) || !values.length || values.some(id => !indices[target].has(id))) add("REFERENCE_MISSING", path, `Link existing ${target} IDs.`);
  };
  for (const risk of packet.risks) {
    refs(risk.requirementIds, "requirements", risk.id);
    if (typeof risk.required !== "boolean") add("RISK_SCOPE_UNDEFINED", risk.id, "Declare whether the risk is required for this release.");
    if (risk.required && !packet.designs.some(d => d.riskIds?.includes(risk.id))) add("RISK_UNCOVERED", risk.id, "Design coverage for this required risk.");
  }
  const oracleCheck = (oracle, path, blocking) => {
    if (!object(oracle) || !["approved", "assumption", "unknown", "characterization"].includes(oracle.status)) {
      add("ORACLE_INVALID", path, "Declare approved, assumption, unknown or characterization.", blocking); return;
    }
    if (oracle.status !== "approved" || !text(oracle.reference) || !text(oracle.sourcePath) || !hash(oracle.sourceDigest)) add("ORACLE_UNRESOLVED", path, "Resolve the oracle source or obtain a scoped, time-bounded risk disposition.", blocking);
  };
  const reviewed = object(packet.review) && packet.review.status === "approved";
  const waiverCovers = target => packet.waivers.some(w => w.targetId === target && w.accepted === true && text(w.reason)
    && text(w.compensatingControl) && w.approver === packet.review?.decisionOwner
    && time(w.expiresAt) && Date.parse(w.expiresAt) > now.getTime() && reviewed);
  for (const waiver of packet.waivers) {
    if (!indices.cases.has(waiver.targetId) || !text(waiver.reason)
        || !text(waiver.compensatingControl) || !time(waiver.expiresAt) || Date.parse(waiver.expiresAt) <= now.getTime()
        || waiver.approver !== packet.review?.decisionOwner || waiver.accepted !== true) add("WAIVER_INVALID", waiver.id, "Renew or correct this scoped risk disposition with the decision owner.");
  }
  for (const design of packet.designs) {
    refs(design.riskIds, "risks", design.id);
    if (![design.method, design.parameters, design.coverageClaim].every(text) || !Array.isArray(design.exclusions)) add("DESIGN_INCOMPLETE", design.id, "Record method, parameters, coverage claim and exclusions.");
    const required = packet.risks.some(r => r.required && design.riskIds?.includes(r.id));
    const requiredCases = packet.cases.filter(c => c.designId === design.id && c.required);
    oracleCheck(design.oracle, design.id, required && !(requiredCases.length && requiredCases.every(c => waiverCovers(c.id))));
    if (required && !packet.cases.some(c => c.designId === design.id && c.required)) add("DESIGN_WITHOUT_REQUIRED_CASE", design.id, "Map this required design to an executable required case.");
  }
  for (const testCase of packet.cases) {
    if (!indices.designs.has(testCase.designId) || typeof testCase.required !== "boolean") add("CASE_REFERENCE_INVALID", testCase.id, "Link a design and explicitly declare required status.");
    oracleCheck(testCase.oracle ?? indices.designs.get(testCase.designId)?.oracle, testCase.id, testCase.required && !waiverCovers(testCase.id));
    const attempts = packet.runs.filter(run => run.caseId === testCase.id);
    const last = attempts.at(-1);
    if (testCase.required && (!last || last.status !== "Pass") && !waiverCovers(testCase.id)) add("REQUIRED_CASE_UNPROVEN", testCase.id, "Run this case; retain earlier failed, blocked and skipped attempts.");
  }
  const seenRuns = new Map();
  for (const run of packet.runs) {
    const currentRequired = indices.cases.get(run.caseId)?.required && packet.runs.filter(r => r.caseId === run.caseId).at(-1)?.id === run.id && !waiverCovers(run.caseId);
    if (!indices.cases.has(run.caseId) || !["Pass", "Fail", "Blocked", "Skipped"].includes(run.status)
        || !["deterministic", "live", "manual"].includes(run.kind) || !time(run.executedAt)
        || Date.parse(run.executedAt) > now.getTime()) add("RUN_INVALID", run.id, "Supply a real case, execution status, kind and timestamp.");
    if (currentRequired && (run.subjectSha !== packet.subject.sha || run.environment !== packet.subject.environment || run.configDigest !== packet.subject.configDigest)) add("RUN_SUBJECT_MISMATCH", run.id, "Rerun for the exact subject, environment and configuration.");
    if (currentRequired && packet.subject.workspaceDigest && run.workspaceDigest !== packet.subject.workspaceDigest) add("RUN_WORKTREE_MISMATCH", run.id, "Rerun against the same recorded worktree digest.");
    if (!object(run.artifact) || !text(run.artifact.path) || !hash(run.artifact.sha256)) add("ARTIFACT_MISSING", run.id, "Save the execution artifact and its SHA-256 digest.");
    if (currentRequired && run.kind !== "deterministic" && (!time(run.validUntil) || Date.parse(run.validUntil) <= now.getTime() || Date.parse(run.validUntil) <= Date.parse(run.executedAt))) add("RUN_STALE", run.id, "Refresh time-sensitive evidence; do not just extend its timestamp.");
    const prior = [...seenRuns.values()].filter(r => r.caseId === run.caseId);
    if (prior.some(r => Date.parse(r.executedAt) > Date.parse(run.executedAt))
        || !Array.isArray(run.previousAttemptIds) || run.previousAttemptIds.some(id => !seenRuns.has(id) || seenRuns.get(id).caseId !== run.caseId)
        || prior.filter(r => ["Fail", "Blocked"].includes(r.status)).some(r => !run.previousAttemptIds.includes(r.id))) add("ATTEMPT_CHRONOLOGY_INVALID", run.id, "Preserve ordered attempts and link earlier Fail/Blocked results.");
    seenRuns.set(run.id, run);
  }
  const seenEvents = new Set(); let lastEventAt = -Infinity;
  for (const event of packet.events) {
    if (!time(event.at) || Date.parse(event.at) < lastEventAt || Date.parse(event.at) > now.getTime() || !text(event.type) || !text(event.reason)
        || !Array.isArray(event.previousEventIds) || event.previousEventIds.some(id => !seenEvents.has(id))
        || !Array.isArray(event.runIds) || event.runIds.some(id => !indices.runs.has(id))) add("EVENT_CHRONOLOGY_INVALID", event.id, "Keep ordered, linked events with evidence and a reason.");
    seenEvents.add(event.id); lastEventAt = Date.parse(event.at);
  }
  if (previous) {
    for (const key of ["runs", "events"]) {
      if (!Array.isArray(previous[key]) || previous[key].some((item, i) => JSON.stringify(canonical(item)) !== JSON.stringify(canonical(packet[key][i])))) add("HISTORY_REWRITTEN", key, "Append corrections/replacements instead of editing or removing historical records.");
    }
  }
  const review = packet.review;
  if (!reviewed) add("HUMAN_REVIEW_REQUIRED", "review", "Have the designated owner review the evidence and record Go/No-Go/Hold.");
  else {
    if (!authority || authority.repository !== packet.subject.repository || !authority.decisionOwners?.includes(review.decisionOwner)
        || !authority.reviewers?.includes(review.reviewer)) add("AUTHORITY_UNTRUSTED", "review", "Use the separately controlled authority configuration.");
    if (review.inputDigest !== evidenceDigest(packet) || review.subjectSha !== packet.subject.sha || review.environment !== packet.subject.environment) add("REVIEW_INPUT_CHANGED", "review", "Re-review the changed subject or evidence; the old approval remains historical.");
    if (!time(review.decidedAt) || !time(review.expiresAt) || Date.parse(review.decidedAt) > now.getTime()
        || Date.parse(review.expiresAt) <= now.getTime() || Date.parse(review.expiresAt) <= Date.parse(review.decidedAt)
        || packet.runs.some(r => Date.parse(r.executedAt) > Date.parse(review.decidedAt))) add("REVIEW_TIME_INVALID", "review", "Record a current, chronologically consistent human decision.");
    if (!text(review.authorityRef) || typeof review.roleOverlapDisclosed !== "boolean"
        || (review.reviewer === review.decisionOwner && !review.roleOverlapDisclosed)) add("REVIEW_DISCLOSURE_MISSING", "review", "Link the approval receipt and disclose overlapping roles.");
    if (review.decision !== "Go") add("RELEASE_NOT_APPROVED", "review.decision", "Respect the owner's No-Go/Hold decision.");
  }
  return finish();
}

export function changeImpact(previous, candidate) {
  const scopeChanged = JSON.stringify(canonical(previous.risks)) !== JSON.stringify(canonical(candidate.risks))
    || previous.requirements.some(r => !candidate.requirements.some(c => c.id === r.id))
    || previous.designs.some(d => !candidate.designs.some(c => c.id === d.id))
    || previous.cases.some(c => !candidate.cases.some(n => n.id === c.id));
  const changedRequirements = candidate.requirements.filter(r => previous.requirements.find(p => p.id === r.id)?.digest !== r.digest).map(r => r.id);
  const subjectChanged = ["repository", "sha", "environment", "configDigest"].some(key => previous.subject[key] !== candidate.subject[key]);
  const risks = candidate.risks.filter(r => r.requirementIds.some(id => changedRequirements.includes(id))).map(r => r.id);
  const designs = candidate.designs.filter(d => d.riskIds.some(id => risks.includes(id)) || JSON.stringify(canonical(d)) !== JSON.stringify(canonical(previous.designs.find(p => p.id === d.id)))).map(d => d.id);
  const mustRun = candidate.cases.filter(c => subjectChanged || scopeChanged || designs.includes(c.designId) || JSON.stringify(canonical(c)) !== JSON.stringify(canonical(previous.cases.find(p => p.id === c.id)))).map(c => c.id);
  return { subjectChanged, scopeChanged, changedRequirements, mustRun, reviewRequired: evidenceDigest(previous) !== evidenceDigest(candidate),
    retainedCandidates: candidate.cases.filter(c => !mustRun.includes(c.id)).map(c => c.id),
    limitation: "Dependency-based recommendation only. Unmapped changes require full scoped regression; retained candidates still need freshness and human review." };
}
