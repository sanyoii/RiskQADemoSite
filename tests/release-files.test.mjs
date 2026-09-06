import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { checkReleaseFile, checkRegistryRelease } from "../lib/release-files.mjs";

test("artifact file verification rejects tampering and paths outside packet", async () => {
  const dir = await mkdtemp(join(tmpdir(), "qa-release-"));
  try {
    const packet = { runs: [{ id: "run", artifact: { path: "artifact.txt", sha256: createHash("sha256").update("actual").digest("hex") } }] };
    await writeFile(join(dir, "artifact.txt"), "actual");
    await writeFile(join(dir, "packet.json"), JSON.stringify(packet));
    let checked = await checkReleaseFile(join(dir, "packet.json"));
    assert.ok(!checked.result.findings.some(f => f.code === "ARTIFACT_UNVERIFIED"));
    await writeFile(join(dir, "artifact.txt"), "tampered");
    checked = await checkReleaseFile(join(dir, "packet.json"));
    assert.ok(checked.result.findings.some(f => f.code === "ARTIFACT_UNVERIFIED"));
    packet.runs[0].artifact.path = "../outside.txt";
    await writeFile(join(dir, "packet.json"), JSON.stringify(packet));
    assert.equal((await checkReleaseFile(join(dir, "packet.json"))).result.eligible, false);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("legacy snapshots are never approved without a release packet", async () => {
  const review = await checkRegistryRelease({}, "registry.json", {});
  assert.equal(review.eligible, false);
  assert.deepEqual(review.codes, ["RELEASE_EVIDENCE_REQUIRED"]);
});

test("failed sync retains immutable last-known-good and publishes a failure receipt", async () => {
  const dir = await mkdtemp(join(tmpdir(), "qa-sync-history-"));
  try {
    const fixture = JSON.parse(await readFile(new URL("../fixtures/valid-status.json", import.meta.url), "utf8"));
    const input = join(dir, "input.json"), output = join(dir, "output.json");
    const run = () => spawnSync(process.execPath, ["scripts/sync-status.mjs", "--source", input, "--output", output, "--historical"], { cwd: new URL("../", import.meta.url), encoding: "utf8" });
    await writeFile(input, JSON.stringify(fixture));
    assert.equal(run().status, 0);
    const original = await readFile(output, "utf8");
    const manifest = await readFile(output + ".manifest.json", "utf8");
    const receipt = JSON.parse(manifest);
    assert.equal(receipt.releaseAuthorized, false);
    assert.equal(createHash("sha256").update(await readFile(join(dir, receipt.snapshot))).digest("hex"), receipt.artifactHash);
    fixture.gates = [];
    await writeFile(input, JSON.stringify(fixture));
    assert.equal(run().status, 1);
    assert.equal(await readFile(output, "utf8"), original);
    assert.equal(await readFile(output + ".manifest.json", "utf8"), manifest);
    assert.equal(JSON.parse(await readFile(output + ".failure.json", "utf8")).currentStatus, "unknown");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("current release and archive validation are separate contracts", () => {
  const cwd = new URL("../", import.meta.url);
  const run = flags => spawnSync(process.execPath, ["scripts/validate-registry.mjs", "data/repos/index.json", ...flags], { cwd, encoding: "utf8" });
  assert.equal(run(["--historical"]).status, 0);
  assert.equal(run(["--release", "--now", "2026-09-06T12:00:00Z"]).status, 1);
  assert.equal(run(["--release", "--historical"]).status, 2);
  const freshButLegacy = run(["--release", "--now", "2026-08-20T00:00:00Z"]);
  assert.equal(freshButLegacy.status, 1);
  assert.match(freshButLegacy.stderr, /RELEASE_EVIDENCE_REQUIRED/);
});
