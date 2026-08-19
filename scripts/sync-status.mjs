import { readFile, rename, writeFile } from "node:fs/promises";
import process from "node:process";

import { projectPublicStatus } from "../lib/status-contract.mjs";

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const source = option("--source");
const output = option("--output");
const nowValue = option("--now");
if (!source || !output) {
  console.error("Usage: node scripts/sync-status.mjs --source <status.json> --output <snapshot.json> [--now <ISO-8601>]");
  process.exit(2);
}

const candidate = `${output}.next-${process.pid}`;
try {
  const input = JSON.parse(await readFile(source, "utf8"));
  const projected = projectPublicStatus(input, { now: nowValue ? new Date(nowValue) : new Date() });
  await writeFile(candidate, `${JSON.stringify(projected, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  await rename(candidate, output);
  console.log(`SYNCED\t${projected.repository.name}\t${output}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
