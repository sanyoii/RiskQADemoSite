import { readFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

import { projectPublicStatus } from "../lib/status-contract.mjs";

const [registryArgument, ...argumentsAfterRegistry] = process.argv.slice(2);
const nowIndex = argumentsAfterRegistry.indexOf("--now");
const now = nowIndex >= 0 ? new Date(argumentsAfterRegistry[nowIndex + 1]) : new Date();

if (!registryArgument || Number.isNaN(now.getTime())) {
  console.error("Usage: node scripts/validate-registry.mjs <registry.json> [--now <ISO date-time>]");
  process.exit(2);
}

try {
  const registryPath = resolve(registryArgument);
  const registry = JSON.parse(await readFile(registryPath, "utf8"));
  if (registry.contractVersion !== "1.0.0" || !Array.isArray(registry.repositories)) {
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
    projectPublicStatus(snapshot, { now });
    if (snapshot.repository.url !== entry.url) {
      throw new Error(`REGISTRY_URL_MISMATCH:repositories[${index}].url`);
    }
    names.push(snapshot.repository.name);
  }

  console.log(`VALID\t${names.length} repositories\t${names.join(", ")}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
