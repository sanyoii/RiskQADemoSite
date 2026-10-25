import assert from "node:assert/strict";
import test from "node:test";
import { reviewRelease, evidenceDigest, changeImpact } from "../lib/release-evidence.mjs";

const sha = "a".repeat(40), digest = "b".repeat(64), now = new Date("2026-09-06T12:00:00Z");
const authority = { repository: "fixture/repo", decisionOwners: ["owner"], reviewers: ["reviewer"] };
function packet() {
  const p = { version: "1.0.0", classification: "synthetic", subject: { repository: "fixture/repo", sha, environment: "fixture", configDigest: digest },
    requirements: [{ id: "REQ", sourcePath: "fixture.md", digest }], risks: [{ id: "RISK", required: true, requirementIds: ["REQ"] }],
    designs: [{ id: "DESIGN", riskIds: ["RISK"], method: "state transitions", parameters: "Fail to Pass", coverageClaim: "one transition", exclusions: ["other transitions"], oracle: { status: "approved", reference: "fixture contract", sourcePath: "fixture.md", sourceDigest: digest } }],
    cases: [{ id: "CASE", designId: "DESIGN", required: true }],
    runs: [{ id: "RUN", caseId: "CASE", subjectSha: sha, environment: "fixture", configDigest: digest, kind: "deterministic", status: "Pass", executedAt: "2026-09-06T10:00:00Z", previousAttemptIds: [], artifact: { path: "fixture.log", sha256: digest } }],
    events: [], waivers: [], review: { status: "approved", decision: "Go", reviewer: "reviewer", decisionOwner: "owner", subjectSha: sha, environment: "fixture", decidedAt: "2026-09-06T11:00:00Z", expiresAt: "2026-09-07T11:00:00Z", authorityRef: "fixture receipt", roleOverlapDisclosed: false } };
  p.review.inputDigest = evidenceDigest(p); return p;
}
test("structurally linked fixture permits Go only with matching input and trusted authority", () => {
  const p = packet(); assert.equal(reviewRelease(p, { now, authority }).eligible, true);
  assert.equal(reviewRelease(p, { now }).eligible, false);
  p.designs[0].parameters = "changed";
  assert.ok(reviewRelease(p, { now, authority }).findings.some(f => f.code === "REVIEW_INPUT_CHANGED"));
});

test("uncommitted subjects and different worktree receipts cannot authorize release", () => {
  const p = packet(); p.subject.dirty = true; p.review.inputDigest = evidenceDigest(p);
  assert.ok(reviewRelease(p, { now, authority }).findings.some(f => f.code === "SUBJECT_UNCOMMITTED"));
  p.subject.workspaceDigest = "d".repeat(64); p.runs[0].workspaceDigest = "e".repeat(64);
  assert.ok(reviewRelease(p, { now, authority }).findings.some(f => f.code === "RUN_WORKTREE_MISMATCH"));
});
test("required unknown oracles, absent runs, stale live evidence and invalid links block", () => {
  const mutations = [p => { p.designs[0].oracle.status = "unknown"; }, p => { p.runs = []; },
    p => { p.runs[0].kind = "live"; p.runs[0].validUntil = "2026-09-06T11:00:00Z"; },
    p => { p.cases[0].designId = "orphan"; }, p => { p.subject.sha = "c".repeat(40); },
    p => { p.runs[0].artifact.sha256 = "missing"; }];
  for (const mutate of mutations) { const p = packet(); mutate(p); p.review.inputDigest = evidenceDigest(p); assert.equal(reviewRelease(p, { now, authority }).eligible, false); }
});
test("later pass preserves earlier failures and prior snapshots cannot be rewritten", () => {
  const p = packet(); const failure = { ...p.runs[0], id: "FAILED", status: "Fail", executedAt: "2026-09-06T09:00:00Z" };
  p.runs.unshift(failure); p.runs[1].previousAttemptIds = ["FAILED"]; p.review.inputDigest = evidenceDigest(p);
  assert.equal(reviewRelease(p, { now, authority }).eligible, true);
  const changed = structuredClone(p); changed.runs.shift(); changed.review.inputDigest = evidenceDigest(changed);
  assert.ok(reviewRelease(changed, { now, authority, previous: p }).findings.some(f => f.code === "HISTORY_REWRITTEN"));
  p.runs[1].previousAttemptIds = []; assert.equal(reviewRelease(p, { now, authority }).eligible, false);
});
test("scoped waiver requires valid expiry, accountable owner and bound approval", () => {
  const p = packet(); p.runs = []; p.waivers = [{ id: "W", targetId: "CASE", accepted: true, reason: "fixture exception", compensatingControl: "manual restriction", approver: "owner", expiresAt: "2026-09-07T00:00:00Z" }];
  p.review.inputDigest = evidenceDigest(p); assert.equal(reviewRelease(p, { now, authority }).eligible, true);
  p.waivers[0].expiresAt = "2026-09-06T00:00:00Z"; p.review.inputDigest = evidenceDigest(p);
  assert.equal(reviewRelease(p, { now, authority }).eligible, false);
});
test("change impact is conservative on subject/config changes and follows requirement edges", () => {
  const old = packet(), next = structuredClone(old);
  assert.deepEqual(changeImpact(old, next).mustRun, []);
  next.requirements[0].digest = "d".repeat(64);
  assert.deepEqual(changeImpact(old, next).mustRun, ["CASE"]);
  assert.equal(changeImpact(old, next).reviewRequired, true);
  next.subject.configDigest = "e".repeat(64); assert.equal(changeImpact(old, next).subjectChanged, true);
});

test("optional uncertainty is visible without blocking unrelated required cases", () => {
  const p = packet();
  p.risks.push({ id: "OPTIONAL-RISK", required: false, requirementIds: ["REQ"] });
  p.designs.push({ ...p.designs[0], id: "OPTIONAL-DESIGN", riskIds: ["OPTIONAL-RISK"], oracle: { status: "unknown" } });
  p.cases.push({ id: "OPTIONAL-CASE", designId: "OPTIONAL-DESIGN", required: false });
  p.review.inputDigest = evidenceDigest(p);
  const result = reviewRelease(p, { now, authority });
  assert.equal(result.eligible, true);
  assert.ok(result.findings.some(f => f.code === "ORACLE_UNRESOLVED" && !f.blocking));
  const previous = structuredClone(p); p.risks[1].required = true;
  assert.equal(reviewRelease(p, { now, authority }).eligible, false);
  assert.equal(changeImpact(previous, p).scopeChanged, true);
  assert.equal(changeImpact(previous, p).mustRun.length, 2);
});

test("expired old live attempt stays historical after a matching current rerun", () => {
  const p = packet();
  const old = { ...p.runs[0], id: "OLD", subjectSha: "c".repeat(40), kind: "live", status: "Fail", executedAt: "2026-09-05T10:00:00Z", validUntil: "2026-09-05T11:00:00Z" };
  p.runs.unshift(old); p.runs[1].previousAttemptIds = ["OLD"]; p.review.inputDigest = evidenceDigest(p);
  assert.equal(reviewRelease(p, { now, authority }).eligible, true);
  p.runs[1].kind = "live"; p.runs[1].validUntil = now.toISOString(); p.review.inputDigest = evidenceDigest(p);
  assert.ok(reviewRelease(p, { now, authority }).findings.some(f => f.code === "RUN_STALE"));
});

test("self review requires explicit overlap disclosure and a scoped waiver cannot waive all risk implicitly", () => {
  const p = packet(); p.review.reviewer = "owner"; p.review.roleOverlapDisclosed = false;
  assert.ok(reviewRelease(p, { now, authority: { ...authority, reviewers: ["owner"] } }).findings.some(f => f.code === "REVIEW_DISCLOSURE_MISSING"));
  p.waivers = [{ id: "W", targetId: "RISK", accepted: true, reason: "broad waiver", compensatingControl: "none", approver: "owner", expiresAt: "2026-09-07T00:00:00Z" }];
  assert.ok(reviewRelease(p, { now, authority }).findings.some(f => f.code === "WAIVER_INVALID"));
});


test("changed requirement or oracle requires a new affected Run even after re-review", () => {
  for (const mutate of [p => { p.requirements[0].digest = "c".repeat(64); }, p => { p.designs[0].oracle.sourceDigest = "c".repeat(64); }, p => { p.cases[0].version = "2"; }]) {
    const previous = packet(), candidate = structuredClone(previous);
    mutate(candidate); candidate.review.inputDigest = evidenceDigest(candidate);
    assert.deepEqual(changeImpact(previous, candidate).mustRun, ["CASE"]);
    assert.ok(reviewRelease(candidate, { now, authority, previous }).findings.some(f => f.code === "CHANGED_CASE_REQUIRES_RUN"));
    candidate.runs.push({ ...candidate.runs[0], id: "NEW", executedAt: "2026-09-06T11:15:00Z", previousAttemptIds: ["RUN"] });
    candidate.review.decidedAt = "2026-09-06T11:30:00Z";
    candidate.review.inputDigest = evidenceDigest(candidate);
    assert.equal(reviewRelease(candidate, { now, authority, previous }).eligible, true);
    assert.deepEqual(candidate.runs[0], previous.runs[0]);
  }
});

test("a renamed old Run and waiver cannot bypass a changed case rerun", () => {
  const previous = packet(), candidate = structuredClone(previous);
  candidate.designs[0].parameters = "new boundary";
  candidate.runs.push({ ...candidate.runs[0], id: "RENAMED", previousAttemptIds: ["RUN"] });
  candidate.waivers = [{ id: "W", targetId: "CASE", accepted: true, reason: "accepted risk", compensatingControl: "restriction", approver: "owner", expiresAt: "2026-09-07T00:00:00Z" }];
  candidate.review.inputDigest = evidenceDigest(candidate);
  assert.ok(reviewRelease(candidate, { now, authority, previous }).findings.some(f => f.code === "CHANGED_CASE_REQUIRES_RUN"));
});
