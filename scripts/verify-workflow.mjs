// Reproducible local verification. Records every attempt; never approves a release.
import { spawn, execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { platform, release } from "node:os";
import { POLICY_VERSION } from "../lib/decision-policy.mjs";

const npm = process.env.npm_execpath;
if (!npm) throw new Error("Run through npm run verify:workflow so the existing npm executable is used.");
const id = new Date().toISOString().replaceAll(/[:.]/g, "-");
const directory = join("test-records", "decision-workflow", "artifacts", id);
await mkdir(directory, { recursive: true });
const sourceSha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const paths = [...new Set(execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" }).split("\0"))]
  .filter(path => /^(app\/|lib\/|schema\/|scripts\/|tests\/|fixtures\/|worker\/|build\/|data\/repos\/|package(-lock)?\.json$|vite\.config\.ts$|tsconfig\.json$)/.test(path)).sort();
const sourceHash = createHash("sha256");
for (const path of paths) {
  try { sourceHash.update(path + "\0").update(await readFile(path)); }
  catch (error) { if (error.code !== "ENOENT") throw error; sourceHash.update(path + "\0DELETED"); }
}
const workspaceDigest = sourceHash.digest("hex");
const checks = [
  ["software", [npm, "test"]],
  ["lint", [npm, "run", "lint"]],
  ["types", ["node_modules/typescript/bin/tsc", "--noEmit", "--incremental", "false"]],
  ["pages-build", [npm, "run", "build"], { GITHUB_PAGES: "true" }],
  ["pages-export", ["scripts/prepare-pages-artifact.mjs", "--source", "dist/client", "--output", `out/pages-${id}`]],
  ["release-gate", [npm, "run", "gate:release"]],
];
const receipt = { id, policyVersion: POLICY_VERSION, sourceSha, workspaceDigest,
  subjectNote: "Uncommitted worktree; sourceSha is the base commit, workspaceDigest identifies tested source bytes.",
  environment: `${platform()} ${release()}; Node ${process.version}`, releaseAuthorized: false, checks: [] };
for (const [name, args, extraEnv] of checks) {
  const startedAt = new Date().toISOString();
  console.log(`CHECK ${name} ${startedAt}`);
  const result = await new Promise(resolve => {
    let output = "";
    const child = spawn(process.execPath, args, { env: { ...process.env, ...extraEnv }, stdio: ["ignore", "pipe", "pipe"] });
    const collect = chunk => { output += chunk; process.stdout.write(chunk); };
    child.stdout.on("data", collect); child.stderr.on("data", collect);
    child.on("error", error => resolve({ exitCode: null, output: output + error.message, status: "Blocked" }));
    child.on("close", exitCode => resolve({ exitCode, output, status: exitCode === 0 ? "Pass" : "Fail" }));
  });
  const log = `${name}.log`;
  await writeFile(join(directory, log), result.output, { flag: "wx" });
  receipt.checks.push({ name, command: [process.execPath, ...args], startedAt, executedAt: new Date().toISOString(),
    status: result.status, exitCode: result.exitCode, artifact: { path: `${id}/${log}`, sha256: createHash("sha256").update(result.output).digest("hex") } });
  console.log(`RESULT ${name}: ${result.status} (exit ${result.exitCode})`);
  await writeFile(join(directory, "receipt.json"), JSON.stringify(receipt, null, 2) + "\n");
}
console.log(`RECEIPT ${directory}/receipt.json`);
// A blocked current release is reported separately; it does not turn software failure into success.
process.exitCode = Number(receipt.checks.some(check => check.name !== "release-gate" && check.status !== "Pass"));
