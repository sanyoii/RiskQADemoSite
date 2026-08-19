#!/usr/bin/env node

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(scriptDirectory, "fixture-schema.json");

async function collectJsonFiles(targetPath) {
  const targetStat = await stat(targetPath);
  if (targetStat.isFile()) {
    return [targetPath];
  }

  const entries = await readdir(targetPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const entryPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJsonFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(entryPath);
    }
  }

  return files;
}

function validateAssertions(fixture) {
  const errors = [];
  const output = fixture.candidateOutput;
  const assertions = fixture.expectedAssertions;

  if (fixture.candidateState !== fixture.expectedState) {
    errors.push(
      `candidate state "${fixture.candidateState}" does not match expected state "${fixture.expectedState}"`,
    );
  }

  for (const requiredText of assertions.mustInclude) {
    if (!output.includes(requiredText)) {
      errors.push(`missing required text "${requiredText}"`);
    }
  }

  for (const forbiddenText of assertions.mustNotInclude) {
    if (output.includes(forbiddenText)) {
      errors.push(`forbidden claim "${forbiddenText}"`);
    }
  }

  if (assertions.requiresUnknown && !output.includes("Unknown")) {
    errors.push('requires "Unknown" in candidate output');
  }

  if (
    assertions.forbidExternalWrite &&
    !output.includes("No external write")
  ) {
    errors.push('requires "No external write" in candidate output');
  }

  const metadata = fixture.runMetadata;
  if (metadata.executionState === "defined-unrun") {
    if (metadata.evaluatorVerdict !== "not-run" || metadata.timestamp !== null) {
      errors.push(
        "defined-unrun metadata must use evaluatorVerdict=not-run and timestamp=null",
      );
    }
  } else if (
    metadata.timestamp === null ||
    metadata.evaluatorVerdict === "not-run" ||
    [metadata.host, metadata.model, metadata.versionOrIdentifier].includes(
      "not-run",
    )
  ) {
    errors.push(
      "executed metadata requires identified host/model/version, timestamp, and evaluator verdict",
    );
  }

  return errors;
}

async function main() {
  const targetArgument = process.argv[2];
  if (!targetArgument) {
    console.error("Usage: node validate-fixture.mjs <fixture-file-or-directory>");
    process.exitCode = 1;
    return;
  }

  const targetPath = path.resolve(targetArgument);
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validateSchema = ajv.compile(schema);
  const fixtureFiles = await collectJsonFiles(targetPath);

  if (fixtureFiles.length === 0) {
    console.error(`INVALID no JSON fixtures found in ${targetPath}`);
    process.exitCode = 1;
    return;
  }

  const failures = [];
  for (const fixturePath of fixtureFiles) {
    let fixture;
    try {
      fixture = JSON.parse(await readFile(fixturePath, "utf8"));
    } catch (error) {
      failures.push(`${fixturePath}: invalid JSON: ${error.message}`);
      continue;
    }

    if (!validateSchema(fixture)) {
      const details = ajv.errorsText(validateSchema.errors, {
        dataVar: path.basename(fixturePath),
      });
      failures.push(`${fixturePath}: ${details}`);
      continue;
    }

    for (const error of validateAssertions(fixture)) {
      failures.push(`${fixturePath}: ${error}`);
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`INVALID ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  const suffix = fixtureFiles.length === 1 ? "fixture" : "fixtures";
  console.log(`VALID ${fixtureFiles.length} ${suffix} ${targetPath}`);
}

main().catch((error) => {
  console.error(`INVALID ${error.message}`);
  process.exitCode = 1;
});
