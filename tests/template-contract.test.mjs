import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readTemplate = (name) =>
  readFile(new URL(`../Templates/QA/${name}`, import.meta.url), "utf8");

test("QA templates expose a reviewable test-design decision contract", async () => {
  const [spec, testCase, readme] = await Promise.all([
    readTemplate("02-test-spec.md"),
    readTemplate("04-test-case.md"),
    readTemplate("README.md"),
  ]);

  for (const field of [
    "Target risk／failure mode",
    "Spec characteristic",
    "Selected technique",
    "Technique parameters",
    "Oracle／source",
    "Coverage claim",
    "Exclusions／residual risk",
    "Reviewer",
  ]) {
    assert.match(spec, new RegExp(field), `Test Spec is missing ${field}`);
  }

  assert.match(spec, /Observability／testability gap/);
  assert.match(spec, /Stopping rule/);
  assert.match(spec, /Run／Defect／Escape feedback/);

  for (const field of [
    "Design decision",
    "Selected technique",
    "Technique parameters",
    "Oracle／source",
    "Coverage claim",
    "Residual risk",
  ]) {
    assert.match(testCase, new RegExp(field), `Test Case is missing ${field}`);
  }

  assert.match(readme, /不新增第十個核心模板/);
  assert.match(readme, /Risk.*Failure mode.*Method.*Oracle.*Execution evidence.*Decision/s);
  assert.match(readme, /Assumption.*Unknown/s);
});
