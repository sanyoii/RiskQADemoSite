import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { validateStatus } from "../lib/status-contract.mjs";

const validFixture = JSON.parse(readFileSync(new URL("../fixtures/valid-status.json", import.meta.url), "utf8"));

function validStatus() {
  return structuredClone(validFixture);
}

test("accepts a complete, fresh public repository snapshot", () => {
  const result = validateStatus(validStatus(), { now: new Date("2026-08-19T10:00:00+08:00") });

  assert.deepEqual(result, {
    ok: true,
    dataStatus: "fresh",
    effectiveProductStatus: "ready",
    errors: [],
  });
});

test("rejects unsupported contract versions without guessing fields", () => {
  const status = validStatus();
  status.contractVersion = "2.0.0";

  const result = validateStatus(status, { now: new Date("2026-08-19T10:00:00+08:00") });

  assert.equal(result.ok, false);
  assert.equal(result.dataStatus, "invalid");
  assert.equal(result.effectiveProductStatus, "unknown");
  assert.deepEqual(result.errors, [{ code: "CONTRACT_VERSION_UNSUPPORTED", path: "contractVersion" }]);
});

test("rejects snapshots that cannot identify the exact release subject", () => {
  const status = validStatus();
  delete status.repository.fullSha;

  const result = validateStatus(status, { now: new Date("2026-08-19T10:00:00+08:00") });

  assert.equal(result.ok, false);
  assert.equal(result.effectiveProductStatus, "unknown");
  assert.deepEqual(result.errors, [{ code: "FIELD_REQUIRED", path: "repository.fullSha" }]);
});

test("enforces the complete schema instead of accepting partial projections", () => {
  const status = validStatus();
  delete status.objective;

  const result = validateStatus(status, { now: new Date("2026-08-19T10:00:00+08:00") });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [{ code: "SCHEMA_INVALID", path: "objective" }]);
});

test("rejects non-allowlisted nested fields", () => {
  const status = validStatus();
  status.repository.privateCheckout = "hidden";

  const result = validateStatus(status, { now: new Date("2026-08-19T10:00:00+08:00") });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [{ code: "SCHEMA_INVALID", path: "repository.privateCheckout" }]);
});

test("fails closed when a Ready assessment has expired", () => {
  const status = validStatus();
  status.releaseAssessment.expiresAt = "2026-08-19T09:30:00+08:00";

  const result = validateStatus(status, { now: new Date("2026-08-19T10:00:00+08:00") });

  assert.equal(result.ok, false);
  assert.equal(result.dataStatus, "stale");
  assert.equal(result.effectiveProductStatus, "unknown");
  assert.deepEqual(result.errors, [{ code: "EVIDENCE_STALE", path: "releaseAssessment.expiresAt" }]);
});

test("downgrades Ready when product-area evidence contains a blocker", () => {
  const status = validStatus();
  status.productAreas[0].quality = "bad";
  status.productAreas[0].executionState = "blocked";

  const result = validateStatus(status, { now: new Date("2026-08-19T10:00:00+08:00") });

  assert.equal(result.ok, false);
  assert.equal(result.dataStatus, "invalid");
  assert.equal(result.effectiveProductStatus, "unknown");
  assert.deepEqual(result.errors, [{ code: "STATUS_CONFLICT", path: "releaseAssessment.status" }]);
});

test("downgrades Ready when a product area misses its coverage target", () => {
  const status = validStatus();
  status.productAreas[0].coverage = "1";
  status.productAreas[0].targetCoverage = "2";

  const result = validateStatus(status, { now: new Date("2026-08-19T10:00:00+08:00") });

  assert.equal(result.ok, false);
  assert.equal(result.effectiveProductStatus, "unknown");
  assert.deepEqual(result.errors, [{ code: "COVERAGE_TARGET_NOT_MET", path: "productAreas[0].coverage" }]);
});

test("requires an explanation for warning, bad, paused, or blocked areas", () => {
  const status = validStatus();
  status.releaseAssessment.status = "at-risk";
  status.productAreas[0].quality = "warning";
  status.productAreas[0].comment = "";

  const result = validateStatus(status, { now: new Date("2026-08-19T10:00:00+08:00") });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [{ code: "COMMENT_REQUIRED", path: "productAreas[0].comment" }]);
});

test("rejects duplicate run IDs so later attempts cannot replace chronology", () => {
  const status = validStatus();
  status.runs.push(structuredClone(status.runs[0]));

  const result = validateStatus(status, { now: new Date("2026-08-19T10:00:00+08:00") });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [{ code: "RUN_ID_DUPLICATE", path: "runs[1].runId" }]);
});

test("rejects provenance that points at a different release subject", () => {
  const status = validStatus();
  status.provenance.sourceSha = "f".repeat(40);

  const result = validateStatus(status, { now: new Date("2026-08-19T10:00:00+08:00") });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [{ code: "SUBJECT_SHA_MISMATCH", path: "provenance.sourceSha" }]);
});

test("keeps the public status template example compatible with the validator", () => {
  const markdown = readFileSync(new URL("../Templates/QA/08-dashboard-status-contract.md", import.meta.url), "utf8");
  const jsonBlock = markdown.match(/```json\r?\n([\s\S]*?)\r?\n```/);
  assert.ok(jsonBlock, "missing JSON example in Dashboard Status Contract template");

  const result = validateStatus(JSON.parse(jsonBlock[1]), { now: new Date("2026-08-19T10:00:00+08:00") });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
});
