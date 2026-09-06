import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { policyErrors, decisionView, safeEvidenceUrl } from "../lib/decision-policy.mjs";
import { replayDecision } from "../lib/replay-policy.mjs";
import { suggestedAction } from "../lib/decision-actions.mjs";

const base = JSON.parse(readFileSync(new URL("../fixtures/valid-status.json", import.meta.url)));
const now = new Date("2026-08-20T00:00:00Z");
test("non-Ready suggestions reflect the cause without changing the decision", () => {
  const view = (status, codes = [], dataStatus = "fresh") => ({ status, dataStatus, reasons: codes.map(code => ({code})) });
  assert.equal(suggestedAction(view("ready")), null);
  for (const [state, expected] of [
    [view("unknown", ["EVIDENCE_STALE"]), /Rerun time-sensitive/],
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
  assert.equal(decisionView(base, { now: new Date(at - 1) }).status, "ready");
  const expired = decisionView(base, { now: new Date(at) });
  assert.equal(expired.status, "unknown");
  assert.equal(expired.historicalStatus, "ready");
  assert.equal(expired.reasons[0].code, "EVIDENCE_STALE");
  assert.deepEqual(policyErrors(base, { now: new Date(at), historical: true }), []);
  assert.equal(decisionView(base, { now, clockConfirmed: false }).status, "unknown");
});
test("public evidence links fail closed on schemes, private hosts and deceptive URLs", () => {
  for (const url of ["javascript:void(0)", "//evil.example/path", "/\\evil", "https://github.com.evil.example/x", "https://user@github.com/x", "https://localhost/x", "/%2fevil"]) assert.equal(safeEvidenceUrl(url), false, url);
  for (const url of ["/run-records/#run", "https://github.com/sanyoii/repo/actions/runs/1"]) assert.equal(safeEvidenceUrl(url), true, url);
});
