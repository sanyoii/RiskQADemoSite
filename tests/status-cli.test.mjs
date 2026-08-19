import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("validate-status accepts a valid public snapshot", () => {
  const result = spawnSync(process.execPath, ["scripts/validate-status.mjs", "fixtures/valid-status.json", "--now", "2026-08-19T10:00:00+08:00"], {
    cwd: new URL("../", import.meta.url),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /VALID.*sanyoii\.github\.io/);
});

test("validate-status exits non-zero for an expired Ready snapshot", () => {
  const result = spawnSync(process.execPath, ["scripts/validate-status.mjs", "fixtures/stale-ready-status.json", "--now", "2026-08-19T10:00:00+08:00"], {
    cwd: new URL("../", import.meta.url),
    encoding: "utf8",
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /EVIDENCE_STALE\treleaseAssessment\.expiresAt/);
});
