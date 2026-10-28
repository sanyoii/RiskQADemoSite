import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  decisionVerdict,
  lampLegends,
  pinnedSnapshotLine,
  projectStatusLine,
  readApprovalExpired,
  taipeiParts,
} from "../lib/decision-bar-copy.mjs";

const index = JSON.parse(await readFile(new URL("../data/decision-index.json", import.meta.url), "utf8"));

function repoFrom(entry, overrides = {}) {
  const assessment = entry.snapshot.releaseAssessment;
  const expires = taipeiParts(entry.decisionBar.expiresAt);
  return {
    status: entry.decisionBar.status,
    nextStep: entry.decisionBar.nextStep,
    approvalExpired: readApprovalExpired(entry.decision, entry.risks),
    expiresEn: expires?.en ?? "",
    expiresZh: expires?.zh ?? "",
    shortSha: entry.snapshot.repository.fullSha.slice(0, 7),
    decidedAt: entry.decisionBar.decidedAt,
    selfReview: assessment.reviewer === assessment.decisionOwner,
    ...overrides,
  };
}

const recorded = index.repositories.map((entry) => repoFrom(entry));

test("current decision data produces the approved hold verdict and status lines", () => {
  assert.deepEqual(decisionVerdict(recorded), {
    en: "Both projects are on Hold: approval is paused, and they will be retested after the revamp launches.",
    zh: "目前 2 個專案都暫緩核准，等改版上線後再重測。",
  });
  assert.equal(recorded.every((repo) => repo.approvalExpired), true);
  assert.deepEqual(projectStatusLine(recorded[0]), {
    en: "Approval on hold; the approval expired on 2026-09-08 23:59 (Taipei time).",
    zh: "暫緩核准；核准已於 2026-09-08 23:59（台北時間）到期。",
  });
  assert.deepEqual(projectStatusLine(recorded[1]), {
    en: "Approval on hold; the approval expired on 2026-09-13 20:40 (Taipei time).",
    zh: "暫緩核准；核准已於 2026-09-13 20:40（台北時間）到期。",
  });
  assert.deepEqual(lampLegends(recorded).map((item) => item.status), ["hold"]);
  assert.equal(lampLegends(recorded)[0].explanation.zh, "暫緩：目前不核准發布。");
  assert.equal(lampLegends(recorded)[0].explanation.en, "Hold: not approved for release for now.");
  assert.deepEqual(pinnedSnapshotLine(recorded), {
    en: "Pinned snapshot: 2026-09-07 · SHA fc1e060 & 643b017 · expired self-review, not a current Go",
    zh: "鎖定快照：2026-09-07 · SHA fc1e060 與 643b017 · 自審已過期，不是目前的 Go",
  });
});

test("verdict follows the count, status, and next step instead of one fixed sentence", () => {
  const one = recorded.slice(0, 1);
  assert.equal(
    decisionVerdict(one).en,
    "The project is on Hold: approval is paused, and it will be retested after the revamp launches.",
  );
  assert.equal(decisionVerdict(one).zh, "目前 1 個專案暫緩核准，等改版上線後再重測。");

  const three = [...recorded, { ...recorded[0], status: "hold" }];
  assert.match(decisionVerdict(three).en, /^All 3 projects are on Hold:/);
  assert.match(decisionVerdict(three).zh, /^目前 3 個專案都暫緩核准/);

  const held = recorded.map((repo) => ({
    ...repo,
    nextStep: { en: "Keep the hold until the triggering condition is cleared.", zh: "在觸發條件解除前維持暫緩。" },
  }));
  assert.equal(decisionVerdict(held).en, "Both projects are on Hold: approval is paused.");
  assert.equal(decisionVerdict(held).zh, "目前 2 個專案都暫緩核准。");
  assert.doesNotMatch(decisionVerdict(held).en, /revamp/);

  const ready = recorded.map((repo) => ({ ...repo, status: "ready", approvalExpired: false, nextStep: null }));
  assert.equal(decisionVerdict(ready).en, "Both projects are Ready.");
  assert.equal(decisionVerdict(ready).zh, "目前 2 個專案都已就緒。");
  assert.deepEqual(lampLegends(ready).map((item) => item.status), ["ready"]);

  const mixed = [
    { ...recorded[0], status: "blocked" },
    { ...recorded[1], status: "ready", approvalExpired: false },
  ];
  assert.equal(decisionVerdict(mixed).en, "1 project is Blocked and 1 project is Ready.");
  assert.equal(decisionVerdict(mixed).zh, "目前 1 個專案受阻、1 個專案已就緒。");
  assert.deepEqual(lampLegends(mixed).map((item) => item.status), ["blocked", "ready"]);
});

test("a hold that has not expired does not say the approval already ended", () => {
  const open = { ...recorded[0], approvalExpired: false };
  assert.equal(projectStatusLine(open).en, "Approval on hold until 2026-09-08 23:59 (Taipei time).");
  assert.equal(projectStatusLine(open).zh, "暫緩核准；核准至 2026-09-08 23:59（台北時間）。");
  assert.doesNotMatch(projectStatusLine(open).zh, /到期/);
});
