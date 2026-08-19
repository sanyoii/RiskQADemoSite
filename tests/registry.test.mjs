import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("registry validates every public snapshot and repository mapping", () => {
  const result = spawnSync(process.execPath, ["scripts/validate-registry.mjs", "data/repos/index.json", "--now", "2026-08-19T10:00:00+08:00"], {
    cwd: new URL("../", import.meta.url),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /VALID\t2 repositories/);
  assert.match(result.stdout, /cex-market-data-quality-lab/);
  assert.match(result.stdout, /sanyoii\.github\.io/);
});
