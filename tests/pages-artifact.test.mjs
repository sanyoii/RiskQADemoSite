import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("export never deletes an existing output or writes inside its source", async () => {
  const directory = await mkdtemp(join(tmpdir(), "qa-pages-guard-"));
  try {
    const marker = join(directory, "keep.txt");
    await writeFile(marker, "preserve");
    const run = output => spawnSync(process.execPath, ["scripts/prepare-pages-artifact.mjs", "--source", directory, "--output", output], { cwd: new URL("../", import.meta.url), encoding: "utf8" });
    assert.equal(run(directory).status, 1);
    assert.equal(await readFile(marker, "utf8"), "preserve");
    assert.match(run(join(directory, "nested")).stderr, /OUTPUT_INSIDE_SOURCE/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("prepares directory routes and lifts prefixed assets for Pages", async () => {
  const directory = await mkdtemp(join(tmpdir(), "qa-pages-"));
  const source = join(directory, "source");
  const output = join(directory, "output");
  await mkdir(join(source, "dashboard-demo"), { recursive: true });
  await mkdir(join(source, "test-status", "_next"), { recursive: true });
  await writeFile(join(source, "index.html"), "home");
  await writeFile(join(source, "dashboard-demo.html"), "dashboard");
  await writeFile(join(source, "dashboard-demo", "ac.html"), "ac");
  await writeFile(join(source, "test-status", "_next", "app.js"), "asset");

  try {
    const result = spawnSync(process.execPath, ["scripts/prepare-pages-artifact.mjs", "--source", source, "--output", output], {
      cwd: new URL("../", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(await readFile(join(output, "index.html"), "utf8"), "home");
    assert.equal(await readFile(join(output, "dashboard-demo", "index.html"), "utf8"), "dashboard");
    assert.equal(await readFile(join(output, "dashboard-demo", "ac", "index.html"), "utf8"), "ac");
    assert.equal(await readFile(join(output, "_next", "app.js"), "utf8"), "asset");
    await assert.rejects(access(join(output, "dashboard-demo.html")));
    await assert.rejects(access(join(output, "test-status")));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
