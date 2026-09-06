import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { checkReleaseFile, checkRegistryRelease } from "../lib/release-files.mjs";
import { decisionView } from "../lib/decision-policy.mjs";
import { suggestedAction } from "../lib/decision-actions.mjs";

test("approved owner packets bind artifacts and expire without rewriting historical Pass", async () => {
  const registryPath = fileURLToPath(new URL("../data/repos/index.json", import.meta.url));
  const registry = JSON.parse(await readFile(registryPath,"utf8"));
  const publicRecords = JSON.parse(await readFile(new URL("../data/release-records.json",import.meta.url),"utf8"));
  for (const entry of registry.repositories) {
    const snapshot = JSON.parse(await readFile(resolve(dirname(registryPath),entry.snapshot),"utf8"));
    const packet = JSON.parse(await readFile(resolve(dirname(registryPath),entry.releaseEvidence),"utf8"));
    const now = new Date(Date.parse(snapshot.releaseAssessment.decidedAt) + 1000);
    const review = await checkRegistryRelease(entry,registryPath,snapshot,{now});
    assert.equal(review.eligible,true,JSON.stringify(review.codes));
    assert.equal(packet.review.reviewer,packet.review.decisionOwner);
    assert.equal(packet.review.roleOverlapDisclosed,true);
    const published = publicRecords.find(record => record.repository === snapshot.repository.name);
    assert.equal(published.subjectSha,packet.subject.sha);
    assert.equal(published.expiresAt,packet.review.expiresAt);
    for (const run of packet.runs) {
      const artifactPath = resolve(dirname(resolve(dirname(registryPath),entry.releaseEvidence)),run.artifact.path);
      const artifact = JSON.parse(await readFile(artifactPath,"utf8"));
      const {artifactSha256,...reported} = published.runs.find(item=>item.id===run.id);
      assert.equal(artifactSha256,run.artifact.sha256);
      assert.deepEqual(reported,artifact,"public results must match the verified artifact");
    }
    const ready = decisionView(snapshot,{now,enforceReview:true,releaseReview:review});
    assert.equal(ready.status,"ready");
    assert.equal(suggestedAction(ready),null);
    const expired = decisionView(snapshot,{now:new Date(snapshot.releaseAssessment.expiresAt),enforceReview:true,releaseReview:review});
    assert.equal(expired.status,"unknown");
    assert.equal(expired.historicalStatus,"ready");
    assert.match(suggestedAction(expired).en,/Refresh evidence|Rerun/);
    assert.equal((await checkRegistryRelease(entry,registryPath,snapshot,{now:new Date(snapshot.releaseAssessment.expiresAt)})).eligible,false);
    if (snapshot.repository.name === "sanyoii.github.io") {
      assert.deepEqual(packet.runs.map(r=>r.status),["Blocked","Pass"]);
      assert.deepEqual(packet.runs[1].previousAttemptIds,[packet.runs[0].id]);
    }
  }
});

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

test("current release and archive validation are separate contracts", async () => {
  const cwd = new URL("../", import.meta.url);
  const run = flags => spawnSync(process.execPath, ["scripts/validate-registry.mjs", "data/repos/index.json", ...flags], { cwd, encoding: "utf8" });
  assert.equal(run(["--historical"]).status, 0);
  assert.equal(run(["--release", "--now", "2026-09-06T12:00:00Z"]).status, 1);
  assert.equal(run(["--release", "--historical"]).status, 2);
  const dir = await mkdtemp(join(tmpdir(), "qa-legacy-registry-"));
  try {
    const fixture = JSON.parse(await readFile(new URL("../fixtures/valid-status.json", import.meta.url), "utf8"));
    await writeFile(join(dir, "snapshot.json"), JSON.stringify(fixture));
    await writeFile(join(dir, "index.json"), JSON.stringify({ contractVersion: "1.0.0", repositories: [{ url: fixture.repository.url, snapshot: "snapshot.json" }] }));
    const freshButLegacy = spawnSync(process.execPath, ["scripts/validate-registry.mjs", join(dir, "index.json"), "--release", "--now", fixture.provenance.syncedAt], { cwd, encoding: "utf8" });
    assert.equal(freshButLegacy.status, 1);
    assert.match(freshButLegacy.stderr, /RELEASE_EVIDENCE_REQUIRED/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
