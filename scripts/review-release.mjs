import { readFile } from "node:fs/promises";
import { changeImpact } from "../lib/release-evidence.mjs";
import { checkReleaseFile } from "../lib/release-files.mjs";

const option = name => { const i = process.argv.indexOf(name); return i < 0 ? undefined : process.argv[i + 1]; };
const input = process.argv[2];
try {
  if (!input || input.startsWith("--")) throw new Error("Usage: node scripts/review-release.mjs <packet.json> [--previous <packet.json>] [--authority <authority.json>] [--design-only]");
  const previous = option("--previous") ? JSON.parse(await readFile(option("--previous"), "utf8")) : undefined;
  const authority = option("--authority") ? JSON.parse(await readFile(option("--authority"), "utf8")) : undefined;
  const { packet, result } = await checkReleaseFile(input, { previous, authority });
  if (previous && result.valid) result.impact = changeImpact(previous, packet);
  console.log(JSON.stringify(result, null, 2));
  const pending = new Set(["HUMAN_REVIEW_REQUIRED", "ORACLE_UNRESOLVED", "REQUIRED_CASE_UNPROVEN", "SUBJECT_UNCOMMITTED"]);
  process.exitCode = process.argv.includes("--design-only")
    ? Number(!result.valid || result.findings.some(f => f.blocking && !pending.has(f.code)))
    : Number(!result.eligible || packet.classification !== "real");
} catch (error) { console.error(error.message); process.exitCode = 2; }
