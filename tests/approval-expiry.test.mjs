import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { approvalExpiryState, computedOnLabel, taipeiCalendarDate } from "../lib/approval-expiry.mjs";

const base = JSON.parse(readFileSync(new URL("../fixtures/valid-status.json", import.meta.url)));

test("approval expiry uses the injected clock on both sides of expiresAt", () => {
  const at = Date.parse(base.releaseAssessment.expiresAt);
  const open = approvalExpiryState(base, { now: new Date(at - 1) });
  assert.equal(open.expired, false);
  assert.equal(open.ec4, "met");
  assert.equal(open.status, "ready");
  assert.equal(open.view.reasons.some((reason) => reason.code === "APPROVAL_EXPIRED"), false);

  const expired = approvalExpiryState(base, { now: new Date(at) });
  assert.equal(expired.expired, true);
  assert.equal(expired.ec4, "not-met");
  assert.equal(expired.status, "hold");
  assert.equal(expired.view.reasons.some((reason) => reason.code === "APPROVAL_EXPIRED"), true);
  assert.equal(expired.view.reasons.some((reason) => reason.code === "EVIDENCE_STALE"), false);
});

test("computed-on label is the Taipei calendar date", () => {
  assert.equal(taipeiCalendarDate(new Date("2026-10-27T15:30:00Z")), "2026-10-27");
  assert.equal(taipeiCalendarDate(new Date("2026-10-27T16:30:00Z")), "2026-10-28");
  assert.deepEqual(computedOnLabel("2026-10-27"), {
    en: "computed on 2026-10-27",
    zh: "計算於 2026-10-27",
  });
});
