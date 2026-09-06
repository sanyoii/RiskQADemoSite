import { readFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

import { projectPublicStatus } from "../lib/status-contract.mjs";
import { checkRegistryRelease } from "../lib/release-files.mjs";

const [registryArgument, ...argumentsAfterRegistry] = process.argv.slice(2);
const nowIndex = argumentsAfterRegistry.indexOf("--now");
const now = nowIndex >= 0 ? new Date(argumentsAfterRegistry[nowIndex + 1]) : new Date();
const historical = argumentsAfterRegistry.includes("--historical");
const release = argumentsAfterRegistry.includes("--release");

if (!registryArgument || Number.isNaN(now.getTime()) || (historical && release)) {
  console.error("Usage: node scripts/validate-registry.mjs <registry.json> [--now <ISO date-time>]");
  process.exit(2);
}

try {
  const registryPath = resolve(registryArgument);
  const registry = JSON.parse(await readFile(registryPath, "utf8"));
  if (registry.contractVersion !== "1.0.0" || !Array.isArray(registry.repositories) || !registry.repositories.length) {
    throw new Error("REGISTRY_INVALID");
  }

  const seenUrls = new Set();
  const seenSnapshots = new Set();
  const names = [];
  for (const [index, entry] of registry.repositories.entries()) {
    if (!entry?.url || !entry?.snapshot || basename(entry.snapshot) !== entry.snapshot) {
      throw new Error(`REGISTRY_ENTRY_INVALID:repositories[${index}]`);
    }
    if (seenUrls.has(entry.url) || seenSnapshots.has(entry.snapshot)) {
      throw new Error(`REGISTRY_ENTRY_DUPLICATE:repositories[${index}]`);
    }
    seenUrls.add(entry.url);
    seenSnapshots.add(entry.snapshot);

    const snapshotPath = join(dirname(registryPath), entry.snapshot);
    const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
    projectPublicStatus(snapshot, { now, historical });
    if (release) {
      const review = await checkRegistryRelease(entry, registryPath, snapshot, { now });
      if (!review.eligible || snapshot.releaseAssessment.status !== "ready") throw new Error(`RELEASE_BLOCKED:${review.codes.join(",") || "NOT_READY"}`);
    }
    if (snapshot.repository.url !== entry.url) {
      throw new Error(`REGISTRY_URL_MISMATCH:repositories[${index}].url`);
    }
    names.push(snapshot.repository.name);
  }

  console.log(`VALID\t${names.length} repositories\t${names.join(", ")}\t${historical ? "HISTORICAL_ONLY_NOT_RELEASE_APPROVAL" : release ? "RELEASE_GATE" : "SNAPSHOT_ONLY_NOT_RELEASE_APPROVAL"}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
