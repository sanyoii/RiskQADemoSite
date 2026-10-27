import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { policyErrors, decisionView, safeEvidenceUrl, POLICY_VERSION, EXPIRED_APPROVAL_PRECEDENCE, EXIT_CRITERIA, STATUS_PRECEDENCE_NOTE, isSyntheticExample, requireExpiredApprovalPrecedence } from "../lib/decision-policy.mjs";
import { replayDecision } from "../lib/replay-policy.mjs";
import { suggestedAction } from "../lib/decision-actions.mjs";

const base = JSON.parse(readFileSync(new URL("../fixtures/valid-status.json", import.meta.url)));
const now = new Date("2026-08-20T00:00:00Z");
test("non-Ready suggestions reflect the cause without changing the decision", () => {
  const view = (status, codes = [], dataStatus = "fresh") => ({ status, dataStatus, reasons: codes.map(code => ({code})) });
  assert.equal(suggestedAction(view("ready")), null);
  for (const [state, expected] of [
    [view("unknown", ["EVIDENCE_STALE"]), /Rerun time-sensitive/],
    [view("hold", ["APPROVAL_EXPIRED"]), /Retest/],
    [view("unknown", ["RELEASE_EVIDENCE_REQUIRED"]), /owner review/],
    [view("unknown", ["DATA_NOT_FRESH", "RELEASE_REVIEW_INVALID"]), /Refresh evidence/],
    [view("unknown", ["DATA_NOT_FRESH"], "unreachable"), /Restore the evidence source/],
    [view("blocked"), /release blockers/], [view("at-risk"), /remaining risk/],
    [view("unknown", ["CLOCK_UNCONFIRMED"]), /Verify the current version/],
  ]) {
    const before = structuredClone(state);
    const result = suggestedAction(state);
    assert.match(result.en, expected);
    assert.match(result.zh, /\p{Script=Han}/u);
    assert.deepEqual(state, before);
  }
  const corrective = {en:"Correct the unsafe evidence link.",zh:"修正不安全的證據連結。"};
  assert.deepEqual(suggestedAction({status:"unknown",reasons:[{code:"DATA_NOT_FRESH"},{code:"EVIDENCE_URL_UNSAFE",action:corrective}]}), corrective);
});
test("dashboard requires a reviewed packet even when legacy snapshot says Ready", () => {
  const view = decisionView(base, { now, enforceReview: true });
  assert.equal(view.status, "unknown");
  assert.ok(view.reasons.some(r => r.code === "RELEASE_EVIDENCE_REQUIRED"));
});
test("synthetic replay never invents release approval", () => {
  for (const stage of ["failed", "fix-proposed", "rerun-passed"]) {
    const result = replayDecision(stage);
    assert.equal(result.releaseAuthorized, false);
    assert.notEqual(result.decision, "Go");
    assert.ok(result.action.en && result.action.zh);
  }
});
test("malformed snapshots fail closed without crashing", () => {
  for (const value of [null, {}, { releaseAssessment: {} }, { ...base, productAreas: [null] }, { ...base, productAreas: [{}] }]) {
    assert.equal(decisionView(value, { now }).status, "unknown");
  }
});
test("ready requires complete gates, executions, accessible evidence and coherent time", () => {
  assert.deepEqual(policyErrors(base, { now }), []);
  const mutations = [
    s => { s.dataStatus = "unreachable"; },
    s => { s.gates = []; },
    s => { s.gates.find(g => g.id === "G6").state = "blocked"; },
    s => { s.productAreas[0].executionState = "not-started"; },
    s => { s.runs[0].executedAt = "2026-08-23T00:00:00Z"; },
    s => { s.runs[0].evidenceUrl = "javascript:void(0)"; },
  ];
  for (const mutate of mutations) {
    const candidate = structuredClone(base); mutate(candidate);
    assert.notEqual(decisionView(candidate, { now }).status, "ready");
  }
});
test("expiry boundary preserves historical approval but removes current readiness", () => {
  const at = Date.parse(base.releaseAssessment.expiresAt);
  const current = decisionView(base, { now: new Date(at - 1) });
  assert.equal(current.status, "ready");
  assert.equal(current.approvalValidity.expired, false);
  assert.equal(current.reasons.some(reason => reason.code === "APPROVAL_EXPIRED"), false);
  assert.deepEqual(current.exitCriteria.map(item => item.result), ["met", "met", "unknown", "met"]);
  const expired = decisionView(base, { now: new Date(at) });
  assert.equal(expired.status, "hold");
  assert.equal(expired.historicalStatus, "ready");
  assert.equal(expired.approvalValidity.expired, true);
  assert.equal(expired.reasons[0].code, "APPROVAL_EXPIRED");
  assert.match(expired.reasons[0].action.zh, /重測/);
  assert.equal(policyErrors(base, { now: new Date(at) }).some(error => error.code === "EVIDENCE_STALE"), false);
  assert.deepEqual(policyErrors(base, { now: new Date(at), historical: true }), []);
  assert.equal(decisionView(base, { now, clockConfirmed: false }).status, "unknown");
});
test("public evidence links fail closed on schemes, private hosts and deceptive URLs", () => {
  for (const url of ["javascript:void(0)", "//evil.example/path", "/\\evil", "https://github.com.evil.example/x", "https://user@github.com/x", "https://localhost/x", "/%2fevil"]) assert.equal(safeEvidenceUrl(url), false, url);
  for (const url of ["/run-records/#run", "https://github.com/sanyoii/repo/actions/runs/1"]) assert.equal(safeEvidenceUrl(url), true, url);
});


test("known blockers and accepted risks survive missing review; expiry raises at-risk to Hold", () => {
  for (const status of ["blocked", "at-risk"]) {
    const snapshot = structuredClone(base); snapshot.releaseAssessment.status = status;
    const beforeExpiry = decisionView(snapshot, { now, enforceReview: true });
    assert.equal(beforeExpiry.status, status);
    assert.ok(beforeExpiry.reasons.some(r => r.code === "RELEASE_EVIDENCE_REQUIRED"));
    const expired = decisionView(snapshot, { now: new Date(base.releaseAssessment.expiresAt), enforceReview: true });
    assert.equal(expired.status, status === "blocked" ? "blocked" : "hold");
    assert.ok(expired.reasons.some(r => r.code === "APPROVAL_EXPIRED"));
    assert.ok(expired.reasons.some(r => r.code === "RELEASE_EVIDENCE_REQUIRED"));
    snapshot.provenance.sourceSha = "f".repeat(40);
    assert.equal(decisionView(snapshot, { now }).status, "unknown", "mismatched subject is not trustworthy");
  }
});

test("current residual warning cannot be Ready; historical source remains unchanged", () => {
  const snapshot = structuredClone(base);
  snapshot.productAreas[0].quality = "warning";
  snapshot.productAreas[0].comment = "Known remaining S3 defect with a workaround";
  assert.ok(policyErrors(snapshot, { now }).some(e => e.code === "RESIDUAL_RISK_PRESENT"));
  assert.equal(decisionView(snapshot, { now }).status, "at-risk");
  assert.equal(snapshot.releaseAssessment.status, "ready");
  assert.deepEqual(policyErrors(snapshot, { now, historical: true }), []);
});

function assertActions(view) {
  assert.ok(view.reasons.length > 0);
  for (const reason of view.reasons) {
    assert.equal(typeof reason.action.en, "string");
    assert.match(reason.action.en, /\S/);
    assert.match(reason.action.zh, /\p{Script=Han}/u);
  }
}

test("blocked plus untrusted data is downgraded to Unknown", () => {
  const snapshot = structuredClone(base);
  snapshot.releaseAssessment.status = "blocked";
  snapshot.provenance.sourceSha = "f".repeat(40);
  const view = decisionView(snapshot, { now });
  assert.equal(view.status, "unknown");
  const mismatch = view.reasons.find(reason => reason.code === "SUBJECT_SHA_MISMATCH");
  assert.ok(mismatch);
  assert.match(mismatch.action.en, /\S/);
  assert.match(mismatch.action.zh, /\p{Script=Han}/u);
  assert.equal(view.reasons.some(reason => reason.code === "BLOCKED_RECORDED"), false);
});

test("undefined or invalid EXPIRED_APPROVAL_PRECEDENCE fails closed", () => {
  assert.equal(EXPIRED_APPROVAL_PRECEDENCE, "blocked-first");
  assert.doesNotThrow(() => requireExpiredApprovalPrecedence("blocked-first"));
  for (const value of [undefined, null, "", "ready-first", "blocked"]) {
    assert.throws(() => requireExpiredApprovalPrecedence(value), /EXPIRED_APPROVAL_PRECEDENCE_INVALID/);
    assert.throws(() => decisionView(base, { now, precedence: value }), /EXPIRED_APPROVAL_PRECEDENCE_INVALID/);
  }
});

test("expired approval precedence is blocked-first and lists every reason", () => {
  assert.equal(POLICY_VERSION, "3.0.0");
  assert.equal(EXPIRED_APPROVAL_PRECEDENCE, "blocked-first");
  assert.match(STATUS_PRECEDENCE_NOTE.zh, /優先順序/);
  assert.deepEqual(EXIT_CRITERIA.map(item => item.id), ["EC-1", "EC-2", "EC-3", "EC-4"]);
  const expiry = new Date(base.releaseAssessment.expiresAt);
  for (const [recorded, expected, codes] of [
    ["blocked", "blocked", ["BLOCKED_RECORDED", "APPROVAL_EXPIRED"]],
    ["at-risk", "hold", ["AT_RISK_RECORDED", "APPROVAL_EXPIRED"]],
    ["ready", "hold", ["APPROVAL_EXPIRED", "UNRESOLVED_S1"]],
  ]) {
    const snapshot = structuredClone(base);
    snapshot.releaseAssessment.status = recorded;
    const view = decisionView(snapshot, { now: expiry });
    assert.equal(view.status, expected, recorded);
    for (const code of codes) assert.ok(view.reasons.some(reason => reason.code === code), `${recorded} missing ${code}`);
    assertActions(view);
  }
});

test("hold and unknown together list both reasons and display unknown", () => {
  const snapshot = structuredClone(base);
  snapshot.provenance.sourceSha = "f".repeat(40);
  const view = decisionView(snapshot, { now: new Date(base.releaseAssessment.expiresAt) });
  assert.equal(view.status, "unknown");
  assert.ok(view.reasons.some(reason => reason.code === "SUBJECT_SHA_MISMATCH"));
  assert.ok(view.reasons.some(reason => reason.code === "APPROVAL_EXPIRED"));
  assertActions(view);
});

test("unresolved S1 cannot be Ready while a resolved S1 or an S2 cannot invent Hold", () => {
  const inside = new Date(Date.parse(base.releaseAssessment.expiresAt) - 1);
  const open = decisionView(base, { now: inside, risks: [{ id: "RISK-s1", severity: "S1", owner: "William", handling: { en: "Retest after the revamp launches.", zh: "改版上線後重測。" } }] });
  assert.equal(open.status, "hold");
  assert.equal(open.approvalValidity.expired, false);
  assert.equal(open.exitCriteria.find(item => item.id === "EC-2").result, "not-met");
  assert.match(open.reasons.find(reason => reason.code === "UNRESOLVED_S1").action.zh, /重測/);
  const resolved = decisionView(base, { now: inside, risks: [{ id: "RISK-s1", severity: "S1", resolved: true }] });
  assert.equal(resolved.status, "ready");
  const lower = decisionView(base, { now: inside, risks: [{ id: "RISK-s2", severity: "S2" }, { id: "RISK-s3", severity: "S3" }] });
  assert.equal(lower.status, "ready");
});

test("historical snapshots still validate and both current repositories are Hold", () => {
  const evaluatedAt = new Date("2026-10-27T12:00:00+08:00");
  const registry = JSON.parse(readFileSync(new URL("../data/repos/index.json", import.meta.url)));
  const catalog = JSON.parse(readFileSync(new URL("../data/risks.json", import.meta.url)));
  assert.equal(isSyntheticExample({ synthetic: true }), true);
  assert.equal(isSyntheticExample({ synthetic: false }), false);
  const accounts = catalog.risks.find(risk => risk.id === "RISK-auth-orders-funds");
  assert.equal(accounts.repository, "cex-market-data-quality-lab");
  assert.equal(accounts.severity, "S2");
  assert.equal(accounts.owner, "William");
  assert.equal(accounts.dueAt, null);
  assert.equal(accounts.relatedExitCriterion, null);
  assert.equal(accounts.handling.zh, "改版上線後跟封存的兩個 repo 一起重測");
  assert.equal(accounts.handling.en, "Retest together with the two archived repos after the revamp launches.");
  assert.equal(catalog.risks.length, 6);
  assert.equal(catalog.risks.some(risk => isSyntheticExample(risk) || /範例資料/.test(JSON.stringify(risk))), false);
  const s2 = catalog.risks.filter(risk => risk.severity === "S2");
  assert.deepEqual(s2.map(risk => risk.repository), ["cex-market-data-quality-lab"]);
  for (const risk of catalog.risks.filter(item => item.severity === "S3")) {
    assert.equal(risk.owner, "William");
    assert.equal(risk.dueAt, null);
    assert.match(risk.handling.zh, /重測/);
    assert.match(risk.handling.en, /Retest together with the two archived repos/);
  }
  for (const entry of registry.repositories) {
    const snapshot = JSON.parse(readFileSync(new URL(`../data/repos/${entry.snapshot}`, import.meta.url)));
    assert.equal(snapshot.contractVersion, "1.0.0");
    assert.equal(Object.hasOwn(snapshot, "archived"), false);
    assert.deepEqual(policyErrors(snapshot, { now: evaluatedAt, historical: true }), []);
    assert.equal(entry.archived, true);
    assert.match(entry.archivedNote.zh, /封存展示/);
    const repoRisks = catalog.risks.filter(risk => risk.repository === snapshot.repository.name);
    const view = decisionView(snapshot, {
      now: evaluatedAt,
      enforceReview: true,
      releaseReview: { eligible: false, codes: ["RUN_STALE", "REVIEW_TIME_INVALID"], policyVersion: "2.1.0", sourceSha: snapshot.repository.fullSha, expiresAt: snapshot.releaseAssessment.expiresAt },
      risks: repoRisks,
      archived: true,
    });
    assert.equal(view.policyVersion, "3.0.0");
    assert.equal(view.status, "hold");
    assert.equal(view.approvalValidity.expired, true);
    assert.ok(view.reasons.some(reason => reason.code === "APPROVAL_EXPIRED"));
    assert.ok(view.reasons.some(reason => reason.code === "ARCHIVED"));
    assert.deepEqual(view.exitCriteria.map(item => [item.id, item.result]), [
      ["EC-1", "not-met"],
      ["EC-2", "not-met"],
      ["EC-3", "unknown"],
      ["EC-4", "not-met"],
    ]);
    for (const item of view.exitCriteria) assert.match(item.evidence.zh, /結束條件/);
    assertActions(view);
  }
});
