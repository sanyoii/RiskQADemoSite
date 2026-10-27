import assert from "node:assert/strict";
import test from "node:test";
import index from "../data/decision-index.json" with { type: "json" };
import registry from "../data/repos/index.json" with { type: "json" };
import risks from "../data/risks.json" with { type: "json" };
import previous from "../test-records/releases/2026-09-06/cex/release-evidence.json" with { type: "json" };
import current from "../test-records/releases/2026-09-07/cex/release-evidence.json" with { type: "json" };
import {
  boardQualityTone,
  comparisonRows,
  comparisonTone,
  previousComparisonUrls,
  summarizeExitCriteria,
  summarizeRisks,
} from "../lib/homepage-brief.mjs";

const later = new Date("2026-10-27T00:00:00+08:00");

test("comparison lamp color follows the row text, and the postponed expiry is red", () => {
  const rows = comparisonRows(previous, current, later);
  const expiry = rows.find((row) => row.id === "expiry");
  assert.equal(expiry.label.zh, "↑ 延後，但已過期");
  assert.equal(expiry.tone, "bad");
  assert.equal(comparisonTone("↑ 延後，但已過期"), "bad");
  for (const row of rows) assert.equal(row.tone, comparisonTone(row.label.zh), row.label.zh);
  assert.equal(rows.find((row) => row.id === "revision").tone, "good");
  assert.equal(rows.find((row) => row.id === "runs").label.zh, "↑ 已追加重測");
  assert.equal(rows.find((row) => row.id === "runs").tone, "good");
  assert.equal(rows.find((row) => row.id === "results").tone, "good");
});

test("a postponed expiry that is still within its validity period is not the red phrase", () => {
  const rows = comparisonRows(previous, current, new Date("2026-09-08T12:00:00+08:00"));
  const expiry = rows.find((row) => row.id === "expiry");
  assert.equal(expiry.label.en, "↑ Postponed, still within its validity period");
  assert.equal(expiry.label.zh, "↑ 延後，仍在效期內");
  assert.equal(expiry.tone, "good");
  assert.equal(expiry.tone, comparisonTone(expiry.label.zh));
});

test("only a registry entry with previous release evidence is compared", () => {
  assert.deepEqual(previousComparisonUrls(registry), ["https://github.com/sanyoii/cex-market-data-quality-lab"]);
});

test("exit criteria summary counts EC-1 through EC-4 and names unmet repositories", () => {
  const summary = summarizeExitCriteria(index.repositories.map((repo) => ({
    repository: repo.snapshot.repository.name,
    exitCriteria: repo.decision.exitCriteria,
  })));
  assert.deepEqual(summary.byId.map((item) => item.id), ["EC-1", "EC-2", "EC-3", "EC-4"]);
  assert.deepEqual(summary.counts, { met: 0, notMet: 6, unknown: 2 });
  assert.equal(summary.unmet.length, 6);
  for (const name of ["cex-market-data-quality-lab", "sanyoii.github.io"]) {
    assert.ok(summary.unmet.some((item) => item.repository === name), name);
  }
  assert.equal(/G1|G3|G6|V1/.test(JSON.stringify(summary)), false);
});

test("homepage risks keep S1 and count the rest", () => {
  const summary = summarizeRisks(risks.risks);
  assert.equal(summary.s1.length, 2);
  assert.ok(summary.s1.every((risk) => risk.severity === "S1"));
  assert.equal(summary.otherCount, 4);
  assert.equal(summary.total, 6);
});

test("board quality tones are the shared lamp colors", () => {
  assert.equal(boardQualityTone("good"), "good");
  assert.equal(boardQualityTone("warn"), "warning");
  assert.equal(boardQualityTone("bad"), "bad");
  assert.equal(boardQualityTone("oos"), "unknown");
});
