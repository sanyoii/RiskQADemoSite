// Generated, sanitized browser input. No authority files or private packets are bundled.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { projectPublicStatus } from "../lib/status-contract.mjs";
import { checkRegistryRelease } from "../lib/release-files.mjs";
import { POLICY_VERSION } from "../lib/decision-policy.mjs";

const registryPath = fileURLToPath(new URL("../data/repos/index.json", import.meta.url));
const registry = JSON.parse(await readFile(registryPath, "utf8"));
const releaseRecords = JSON.parse(await readFile(new URL("../data/release-records.json", import.meta.url), "utf8"));
const repositories = [];
for (const entry of registry.repositories) {
  const snapshot = projectPublicStatus(JSON.parse(await readFile(resolve(dirname(registryPath), entry.snapshot), "utf8")), { historical: true });
  if (entry.url !== snapshot.repository.url) throw new Error("REGISTRY_URL_MISMATCH");
  let releaseReview;
  try { releaseReview = await checkRegistryRelease(entry, registryPath, snapshot); }
  catch { releaseReview = { eligible: false, codes: ["RELEASE_REVIEW_INVALID"] }; }
  const matchedRecord = releaseRecords.find(record => record.repository === snapshot.repository.name);
  if (matchedRecord && matchedRecord.subjectSha !== snapshot.repository.fullSha) {
    throw new Error(`RELEASE_RECORD_SHA_MISMATCH: ${snapshot.repository.name}`);
  }
  const recordRuns = (matchedRecord?.runs ?? []).map(run => ({
    id: run.id,
    status: run.status,
    passed: run.passed,
    total: run.total,
    failures: run.failures,
    errors: run.errors,
    executedAt: run.executedAt,
    rawJUnitSha256: run.rawJUnitSha256,
    anchorUrl: `/run-records/#${run.id}`,
  }));
  const latestSnapshotRuns = snapshot.productAreas.flatMap(area => area.evidenceLinks)
    .map(link => recordRuns.find(run => run.anchorUrl === link))
    .filter(Boolean);
  const runMetrics = {
    subjectSha: matchedRecord?.subjectSha ?? snapshot.repository.fullSha,
    totalRuns: recordRuns.length,
    passingRuns: recordRuns.filter(r => r.status === "Pass").length,
    blockedRuns: recordRuns.filter(r => r.status === "Blocked").length,
    latestChecksPassed: latestSnapshotRuns.reduce((sum, r) => sum + r.passed, 0),
    latestChecksTotal: latestSnapshotRuns.reduce((sum, r) => sum + r.total, 0),
    runs: recordRuns,
  };
  repositories.push({
    snapshot,
    releaseReview,
    runMetrics,
    snapshotDigest: createHash("sha256").update(JSON.stringify(snapshot)).digest("hex"),
  });
}
await writeFile(new URL("../data/decision-index.json", import.meta.url), JSON.stringify({ policyVersion: POLICY_VERSION, repositories }, null, 2) + "\n");
console.log(`PREPARED ${repositories.length} sanitized historical snapshots with unified run metrics; current eligibility is checked again in the browser.`);
