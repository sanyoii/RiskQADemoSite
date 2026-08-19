import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const validatorPath = path.join(
  repoRoot,
  "tests",
  "playbooks",
  "validate-fixture.mjs",
);

async function runValidator(target) {
  return execFileAsync(process.execPath, [validatorPath, target], {
    cwd: repoRoot,
    windowsHide: true,
  });
}

test("fixture validator accepts a complete contract fixture", async () => {
  const target = path.join(
    repoRoot,
    "tests",
    "playbooks",
    "fixtures",
    "_base",
  );
  const { stdout } = await runValidator(target);

  assert.match(stdout, /VALID\s+1 fixture/);
});

test("fixture validator rejects a forbidden claim", async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(tmpdir(), "qa-playbook-invalid-"),
  );
  const invalidFixture = {
    schemaVersion: 1,
    id: "invalid-ready-claim",
    playbook: "requirement-readiness",
    caseType: "contradictory",
    inputProvenance: {
      source: "synthetic fixture",
      capturedAt: "2026-08-19T00:00:00+08:00",
      trust: "untrusted",
    },
    input: "Acceptance criteria conflict.",
    expectedAssertions: {
      mustInclude: ["Unknown"],
      mustNotInclude: ["Release decision: Ready"],
      requiresUnknown: true,
      forbidExternalWrite: true,
    },
    expectedState: "needs-clarification",
    candidateState: "needs-clarification",
    candidateOutput:
      "Unknown: conflict unresolved. No external write performed. Release decision: Ready",
    runMetadata: {
      executionState: "defined-unrun",
      host: "not-run",
      model: "not-run",
      versionOrIdentifier: "not-run",
      timestamp: null,
      evaluatorVerdict: "not-run",
      limitations: ["Static fixture only."],
    },
  };

  try {
    await writeFile(
      path.join(temporaryDirectory, "invalid.json"),
      `${JSON.stringify(invalidFixture, null, 2)}\n`,
      "utf8",
    );

    await assert.rejects(
      runValidator(temporaryDirectory),
      /forbidden claim "Release decision: Ready"/,
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test("Requirement Readiness maps review gaps without inventing missing facts", async () => {
  const playbookPath = path.join(
    repoRoot,
    "Playbooks",
    "QA",
    "requirement-readiness.md",
  );
  const fixturePath = path.join(
    repoRoot,
    "tests",
    "playbooks",
    "fixtures",
    "requirement-readiness",
  );

  const [{ stdout }, playbook] = await Promise.all([
    runValidator(fixturePath),
    readFile(playbookPath, "utf8"),
  ]);

  assert.match(stdout, /VALID\s+3 fixtures/);
  assert.match(playbook, /Functional/);
  assert.match(playbook, /Data \/ environment/);
  assert.match(playbook, /Non-functional/);
  assert.match(playbook, /Cross-cutting/);
  assert.match(playbook, /Unknown/);
  assert.match(playbook, /00 Test Request/);
  assert.match(playbook, /01 Risk Assessment/);
});

test("Coverage Analysis separates designed, executed, and passing coverage", async () => {
  const playbookPath = path.join(
    repoRoot,
    "Playbooks",
    "QA",
    "coverage-analysis.md",
  );
  const fixturePath = path.join(
    repoRoot,
    "tests",
    "playbooks",
    "fixtures",
    "coverage-analysis",
  );

  const [{ stdout }, playbook] = await Promise.all([
    runValidator(fixturePath),
    readFile(playbookPath, "utf8"),
  ]);

  assert.match(stdout, /VALID\s+2 fixtures/);
  assert.match(playbook, /Requirement.*Scenario.*Case.*Run/s);
  assert.match(playbook, /covered/);
  assert.match(playbook, /covered-and-passing/);
  assert.match(playbook, /docs\/quality\/<release>\/coverage-inventory\.md/);
  assert.match(playbook, /07 Release Quality Summary/);
});

test("Regression Selection names the risk accepted by a targeted run", async () => {
  const playbookPath = path.join(
    repoRoot,
    "Playbooks",
    "QA",
    "regression-selection.md",
  );
  const fixturePath = path.join(
    repoRoot,
    "tests",
    "playbooks",
    "fixtures",
    "regression-selection",
  );

  const [{ stdout }, playbook] = await Promise.all([
    runValidator(fixturePath),
    readFile(playbookPath, "utf8"),
  ]);

  assert.match(stdout, /VALID\s+1 fixture/);
  assert.match(playbook, /Must-run/);
  assert.match(playbook, /Should-run/);
  assert.match(playbook, /safety net/);
  assert.match(playbook, /Skip-with-reason/);
  assert.match(playbook, /uncovered gap/);
  assert.match(playbook, /human approval/);
});

test("Test Data Design separates safe data classes from real PII", async () => {
  const playbookPath = path.join(
    repoRoot,
    "Playbooks",
    "QA",
    "test-data-design.md",
  );
  const fixturePath = path.join(
    repoRoot,
    "tests",
    "playbooks",
    "fixtures",
    "test-data-api",
    "test-data.json",
  );

  const [{ stdout }, playbook] = await Promise.all([
    runValidator(fixturePath),
    readFile(playbookPath, "utf8"),
  ]);

  assert.match(stdout, /VALID\s+1 fixture/);
  assert.match(playbook, /valid/);
  assert.match(playbook, /invalid/);
  assert.match(playbook, /boundary/);
  assert.match(playbook, /synthetic/);
  assert.match(playbook, /real PII/);
  assert.match(playbook, /non-production/);
});

test("API Coverage Design stays inside the supplied contract", async () => {
  const playbookPath = path.join(
    repoRoot,
    "Playbooks",
    "QA",
    "api-coverage-design.md",
  );
  const fixturePath = path.join(
    repoRoot,
    "tests",
    "playbooks",
    "fixtures",
    "test-data-api",
    "api-coverage.json",
  );

  const [{ stdout }, playbook] = await Promise.all([
    runValidator(fixturePath),
    readFile(playbookPath, "utf8"),
  ]);

  assert.match(stdout, /VALID\s+1 fixture/);
  for (const dimension of [
    "schema",
    "auth",
    "negative",
    "boundary",
    "idempotency",
    "retry",
    "concurrency",
  ]) {
    assert.match(playbook, new RegExp(dimension));
  }
  assert.match(playbook, /Unknown/);
  assert.match(playbook, /contract element/);
});

test("Defect Triage keeps duplicate and owner decisions advisory", async () => {
  const playbookPath = path.join(
    repoRoot,
    "Playbooks",
    "QA",
    "defect-triage.md",
  );
  const fixturePath = path.join(
    repoRoot,
    "tests",
    "playbooks",
    "fixtures",
    "defect-rca",
    "defect-triage.json",
  );

  const [{ stdout }, playbook] = await Promise.all([
    runValidator(fixturePath),
    readFile(playbookPath, "utf8"),
  ]);

  assert.match(stdout, /VALID\s+1 fixture/);
  assert.match(playbook, /possible duplicate/);
  assert.match(playbook, /severity/);
  assert.match(playbook, /priority/);
  assert.match(playbook, /owner suggestion/);
  assert.match(playbook, /missing information/);
  assert.match(playbook, /不直接/);
});

test("RCA Escape Analysis cannot promote a hypothesis without evidence", async () => {
  const playbookPath = path.join(
    repoRoot,
    "Playbooks",
    "QA",
    "rca-escape-analysis.md",
  );
  const fixturePath = path.join(
    repoRoot,
    "tests",
    "playbooks",
    "fixtures",
    "defect-rca",
    "rca-hypothesis.json",
  );

  const [{ stdout }, playbook] = await Promise.all([
    runValidator(fixturePath),
    readFile(playbookPath, "utf8"),
  ]);

  assert.match(stdout, /VALID\s+1 fixture/);
  assert.match(playbook, /symptom/);
  assert.match(playbook, /hypothesis/);
  assert.match(playbook, /confirmed cause/);
  assert.match(playbook, /escape point/i);
  assert.match(playbook, /corrective action/);
  assert.match(playbook, /preventive action/);
  assert.match(playbook, /evidence owner/);
});

test("security fixtures preserve routing and no-external-write boundaries", async () => {
  const fixturePath = path.join(
    repoRoot,
    "tests",
    "playbooks",
    "fixtures",
    "security",
  );
  const { stdout } = await runValidator(fixturePath);

  assert.match(stdout, /VALID\s+3 fixtures/);
});

test("the existing npm test cascade includes deterministic Playbook checks", async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(repoRoot, "package.json"), "utf8"),
  );

  assert.equal(
    packageJson.scripts["test:playbooks"],
    "node --test tests/playbooks/playbook-contract.test.mjs && node tests/playbooks/validate-fixture.mjs tests/playbooks/fixtures",
  );
  assert.match(packageJson.scripts.test, /npm run test:playbooks/);
});

test("public documentation keeps Playbooks advisory and links the pilot evidence", async () => {
  const [readme, templateReadme, pilot] = await Promise.all([
    readFile(path.join(repoRoot, "README.md"), "utf8"),
    readFile(path.join(repoRoot, "Templates", "QA", "README.md"), "utf8"),
    readFile(path.join(repoRoot, "test-records", "playbook-pilot.md"), "utf8"),
  ]);

  assert.match(readme, /QA Playbooks/);
  assert.match(readme, /advisory layer/);
  assert.match(readme, /Playbooks\/QA\/README\.md/);
  assert.match(templateReadme, /Playbook/);
  assert.match(templateReadme, /coverage-inventory\.md/);
  assert.match(templateReadme, /07 Release Quality Summary/);
  assert.match(pilot, /bdb8cd40ddf49a76e8e1cb4cda0a54e5985041b8/);
  assert.match(pilot, /Worktree state.*dirty/s);
  assert.match(pilot, /DEFINED_UNRUN/);
  assert.match(pilot, /needs-review/);
  assert.match(pilot, /npm run test:playbooks/);
  assert.match(pilot, /npm test/);
  assert.match(pilot, /npm run lint/);
});
