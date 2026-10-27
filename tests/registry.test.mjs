import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("registry validates every public snapshot and repository mapping", () => {
  const result = spawnSync(process.execPath, ["scripts/validate-registry.mjs", "data/repos/index.json", "--historical"], {
    cwd: new URL("../", import.meta.url),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /VALID\t2 repositories/);
  assert.match(result.stdout, /cex-market-data-quality-lab/);
  assert.match(result.stdout, /sanyoii\.github\.io/);
});

test("registry archive flags and the generated decision index stay on settled risks", () => {
  const registry = JSON.parse(readFileSync(new URL("../data/repos/index.json", import.meta.url), "utf8"));
  const catalog = JSON.parse(readFileSync(new URL("../data/risks.json", import.meta.url), "utf8"));
  const index = JSON.parse(readFileSync(new URL("../data/decision-index.json", import.meta.url), "utf8"));
  assert.equal(index.policyVersion, "3.0.0");
  assert.equal(catalog.risks.length, 6);
  assert.equal(catalog.risks.filter(risk => risk.severity === "S1").length, 2);
  assert.equal(catalog.risks.some(risk => risk.synthetic === true), false);
  for (const entry of registry.repositories) {
    const snapshot = JSON.parse(readFileSync(new URL(`../data/repos/${entry.snapshot}`, import.meta.url), "utf8"));
    assert.equal(entry.archived, true);
    assert.equal(entry.risks, `../risks.json#${snapshot.repository.name}`);
    assert.equal(JSON.stringify(snapshot).includes("\"archived\""), false);
    const prepared = index.repositories.find(item => item.snapshot.repository.name === snapshot.repository.name);
    assert.equal(prepared.archived, true);
    assert.equal(prepared.decision.status, "hold");
    assert.equal(prepared.decision.approvalValidity.expired, true);
    assert.equal(prepared.risks.some(risk => risk.synthetic === true), false);
    assert.equal(prepared.snapshotDigest.length, 64);
  }
  const portfolio = index.repositories.find(item => item.snapshot.repository.name === "sanyoii.github.io");
  assert.equal(portfolio.risks.some(risk => risk.severity === "S2"), false);
  const regenerated = spawnSync(process.execPath, ["scripts/prepare-decision-data.mjs"], {
    cwd: new URL("../", import.meta.url),
    encoding: "utf8",
  });
  assert.equal(regenerated.status, 0, regenerated.stderr);
  assert.equal(readFileSync(new URL("../data/decision-index.json", import.meta.url), "utf8"), JSON.stringify(index, null, 2) + "\n");
});
