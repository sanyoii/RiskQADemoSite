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
const repositories = [];
for (const entry of registry.repositories) {
  const snapshot = projectPublicStatus(JSON.parse(await readFile(resolve(dirname(registryPath), entry.snapshot), "utf8")), { historical: true });
  if (entry.url !== snapshot.repository.url) throw new Error("REGISTRY_URL_MISMATCH");
  let releaseReview;
  try { releaseReview = await checkRegistryRelease(entry, registryPath, snapshot); }
  catch { releaseReview = { eligible: false, codes: ["RELEASE_REVIEW_INVALID"] }; }
  repositories.push({ snapshot, releaseReview, snapshotDigest: createHash("sha256").update(JSON.stringify(snapshot)).digest("hex") });
}
await writeFile(new URL("../data/decision-index.json", import.meta.url), JSON.stringify({ policyVersion: POLICY_VERSION, repositories }, null, 2) + "\n");
console.log(`PREPARED ${repositories.length} sanitized historical snapshots; current eligibility is checked again in the browser.`);
