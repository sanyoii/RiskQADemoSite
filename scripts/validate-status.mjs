import { readFile } from "node:fs/promises";
import process from "node:process";

import { validateStatus } from "../lib/status-contract.mjs";

const [file, nowFlag, nowValue] = process.argv.slice(2);
if (!file) {
  console.error("Usage: node scripts/validate-status.mjs <status.json> [--now <ISO-8601>]");
  process.exit(2);
}

try {
  const status = JSON.parse(await readFile(file, "utf8"));
  const now = nowFlag === "--now" && nowValue ? new Date(nowValue) : new Date();
  const result = validateStatus(status, { now });
  if (!result.ok) {
    for (const error of result.errors) console.error(`${error.code}\t${error.path}`);
    process.exit(1);
  }
  console.log(`VALID\t${status.repository.name}\t${status.repository.fullSha}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
