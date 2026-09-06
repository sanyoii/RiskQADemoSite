import { readFile, rename, writeFile, mkdir, unlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { projectPublicStatus } from "../lib/status-contract.mjs";
import { POLICY_VERSION } from "../lib/decision-policy.mjs";

const option = name => { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : undefined; };
const source = option("--source"), output = option("--output"), nowValue = option("--now");
if (!source || !output || resolve(source) === resolve(output)) {
  console.error("Usage: sync-status --source <status.json> --output <distinct snapshot.json> [--now <ISO>] [--historical]");
  process.exit(2);
}
const candidate = `${output}.next-${process.pid}`;
const manifestPath = `${output}.manifest.json`;
const manifestCandidate = `${manifestPath}.next-${process.pid}`;
const lock = `${output}.lock`;
let locked = false;
try {
  await writeFile(lock, "", { flag: "wx" }); locked = true;
  const input = JSON.parse(await readFile(source, "utf8"));
  const historical = process.argv.includes("--historical");
  const projected = projectPublicStatus(input, { now: nowValue ? new Date(nowValue) : new Date(), historical });
  const content = JSON.stringify(projected, null, 2) + "\n";
  const artifactHash = createHash("sha256").update(content).digest("hex");
  const snapshots = join(dirname(resolve(output)), "snapshots");
  await mkdir(snapshots, { recursive: true });
  const immutable = join(snapshots, `${artifactHash}.json`);
  try { await writeFile(immutable, content, { encoding: "utf8", flag: "wx" }); }
  catch (error) {
    if (error.code !== "EEXIST" || await readFile(immutable, "utf8") !== content) throw new Error("SNAPSHOT_INTEGRITY_ERROR");
  }
  const receipt = { policyVersion: POLICY_VERSION, activatedAt: new Date().toISOString(), artifactHash, snapshotId: projected.snapshotId,
    sourceSha: projected.repository.fullSha, snapshot: `snapshots/${artifactHash}.json`,
    mode: historical ? "historical-only" : "snapshot-validation-only", releaseAuthorized: false };
  await writeFile(manifestCandidate, JSON.stringify(receipt, null, 2) + "\n", { flag: "wx" });
  // Manifest is the canonical, atomic pointer. Readers verify artifactHash before use.
  await rename(manifestCandidate, manifestPath);
  // Compatibility alias is not an approval and is never the canonical pointer.
  await writeFile(candidate, content, { flag: "wx" });
  await rename(candidate, output);
  console.log(`SYNCED\t${projected.repository.name}\t${output}\t${artifactHash}`);
} catch (error) {
  if (locked) await writeFile(`${output}.failure.json`, JSON.stringify({
    policyVersion: POLICY_VERSION, failedAt: new Date().toISOString(), currentStatus: "unknown",
    code: /^[A-Z_]+/.exec(error.message)?.[0] ?? "SYNC_FAILED", canonicalManifestRetained: true,
  }, null, 2) + "\n");
  console.error(error.message); process.exitCode = 1;
} finally {
  if (locked) {
    for (const ownedPath of [candidate, manifestCandidate, lock]) await unlink(ownedPath).catch(error => { if (error.code !== "ENOENT") throw error; });
  }
}
