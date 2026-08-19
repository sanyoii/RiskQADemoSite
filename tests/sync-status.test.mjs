import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { projectPublicStatus } from "../lib/status-contract.mjs";

const fixture = JSON.parse(readFileSync(new URL("../fixtures/valid-status.json", import.meta.url), "utf8"));

test("projects only approved public status fields", () => {
  const source = structuredClone(fixture);
  source.internalNotes = "reviewed in private workspace";

  const projected = projectPublicStatus(source, { now: new Date("2026-08-19T10:00:00+08:00") });

  assert.equal(Object.hasOwn(projected, "internalNotes"), false);
  assert.deepEqual(Object.keys(projected), [
    "contractVersion",
    "snapshotId",
    "repository",
    "objective",
    "environment",
    "testedScope",
    "excludedScope",
    "releaseAssessment",
    "summary",
    "productAreas",
    "gates",
    "runs",
    "provenance",
    "dataStatus",
    "publicDisclosure",
  ]);
});

test("fails closed when any source field contains a local path", () => {
  const source = structuredClone(fixture);
  source.internalNotes = "receipt at D:\\private\\run.xml";

  assert.throws(
    () => projectPublicStatus(source, { now: new Date("2026-08-19T10:00:00+08:00") }),
    /SENSITIVE_VALUE:internalNotes/,
  );
});

test("fails closed on secret-shaped fields before applying the public allowlist", () => {
  const source = structuredClone(fixture);
  source.apiToken = "should-never-be-projected";

  assert.throws(
    () => projectPublicStatus(source, { now: new Date("2026-08-19T10:00:00+08:00") }),
    /SENSITIVE_VALUE:apiToken/,
  );
});

test("fails closed on private or local evidence URLs", () => {
  const source = structuredClone(fixture);
  source.runs[0].evidenceUrl = "http://localhost:3000/private-run";

  assert.throws(
    () => projectPublicStatus(source, { now: new Date("2026-08-19T10:00:00+08:00") }),
    /SENSITIVE_VALUE:runs\[0\]\.evidenceUrl/,
  );
});

test("sync-status writes an allowlisted snapshot", async () => {
  const directory = await mkdtemp(join(tmpdir(), "qa-status-"));
  const sourcePath = join(directory, "source.json");
  const outputPath = join(directory, "output.json");
  const source = structuredClone(fixture);
  source.internalNotes = "private review note";
  await writeFile(sourcePath, JSON.stringify(source), "utf8");

  try {
    const result = spawnSync(process.execPath, ["scripts/sync-status.mjs", "--source", sourcePath, "--output", outputPath, "--now", "2026-08-19T10:00:00+08:00"], {
      cwd: new URL("../", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(await readFile(outputPath, "utf8"));
    assert.equal(Object.hasOwn(output, "internalNotes"), false);
    assert.equal(output.repository.fullSha, fixture.repository.fullSha);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
