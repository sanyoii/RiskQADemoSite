import { readFileSync } from "node:fs";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schema = JSON.parse(readFileSync(new URL("../schema/test-status.schema.json", import.meta.url), "utf8"));
const ajv = new Ajv2020({ allErrors: false });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

function invalid(errors, dataStatus = "invalid") {
  return {
    ok: false,
    dataStatus,
    effectiveProductStatus: "unknown",
    errors,
  };
}

const coverageRank = new Map(["0", "1", "1+", "2", "2+", "3"].map((level, index) => [level, index]));
const publicFields = [
  "contractVersion",
  "snapshotId",
  "repository",
  "objective",
  "environment",
  "testedScope",
  "excludedScope",
  "releaseAssessment",
  "summary",
  "productAreas",
  "gates",
  "runs",
  "provenance",
  "dataStatus",
  "publicDisclosure",
];

function schemaErrorPath(error) {
  const segments = error.instancePath
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~"));
  const property = error.keyword === "required"
    ? error.params.missingProperty
    : error.keyword === "additionalProperties"
      ? error.params.additionalProperty
      : null;
  if (property) segments.push(property);
  return segments.join(".") || "$";
}

const sensitiveKey = /(token|secret|password|credential|cookie)/i;
const privateUrl = /https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?::\d+)?(?:\/|$)/i;

function findSensitiveValue(value, path = "", key = "") {
  if (key && sensitiveKey.test(key)) {
    return path;
  }
  if (typeof value === "string" && (/\b[A-Za-z]:\\/.test(value) || privateUrl.test(value) || value.startsWith("file://"))) {
    return path;
  }
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      const found = findSensitiveValue(item, `${path}[${index}]`);
      if (found) return found;
    }
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      const found = findSensitiveValue(item, path ? `${path}.${key}` : key, key);
      if (found) return found;
    }
  }
  return null;
}

export function validateStatus(status, { now = new Date() } = {}) {
  if (status.contractVersion !== "1.0.0") {
    return invalid([{ code: "CONTRACT_VERSION_UNSUPPORTED", path: "contractVersion" }]);
  }

  if (!status.repository?.fullSha) {
    return invalid([{ code: "FIELD_REQUIRED", path: "repository.fullSha" }]);
  }

  if (!validateSchema(status)) {
    return invalid([{ code: "SCHEMA_INVALID", path: schemaErrorPath(validateSchema.errors[0]) }]);
  }

  if (status.provenance?.sourceSha !== status.repository.fullSha) {
    return invalid([{ code: "SUBJECT_SHA_MISMATCH", path: "provenance.sourceSha" }]);
  }

  const seenRunIds = new Set();
  const duplicateRunIndex = status.runs?.findIndex((run) => {
    if (seenRunIds.has(run.runId)) return true;
    seenRunIds.add(run.runId);
    return false;
  }) ?? -1;
  if (duplicateRunIndex >= 0) {
    return invalid([{ code: "RUN_ID_DUPLICATE", path: `runs[${duplicateRunIndex}].runId` }]);
  }

  const expiresAt = Date.parse(status.releaseAssessment?.expiresAt ?? "");
  if (Number.isFinite(expiresAt) && expiresAt <= now.getTime()) {
    return invalid([{ code: "EVIDENCE_STALE", path: "releaseAssessment.expiresAt" }], "stale");
  }

  const hasBlockingArea = status.productAreas?.some(
    (area) => area.quality === "bad" || area.executionState === "blocked",
  );
  if (status.releaseAssessment?.status === "ready" && hasBlockingArea) {
    return invalid([{ code: "STATUS_CONFLICT", path: "releaseAssessment.status" }]);
  }

  const missedCoverageIndex = status.productAreas?.findIndex(
    (area) => (coverageRank.get(area.coverage) ?? -1) < (coverageRank.get(area.targetCoverage) ?? Number.POSITIVE_INFINITY),
  ) ?? -1;
  if (status.releaseAssessment?.status === "ready" && missedCoverageIndex >= 0) {
    return invalid([{ code: "COVERAGE_TARGET_NOT_MET", path: `productAreas[${missedCoverageIndex}].coverage` }]);
  }

  const unexplainedAreaIndex = status.productAreas?.findIndex(
    (area) => (
      area.quality === "warning"
      || area.quality === "bad"
      || area.executionState === "paused"
      || area.executionState === "blocked"
    ) && !area.comment?.trim(),
  ) ?? -1;
  if (unexplainedAreaIndex >= 0) {
    return invalid([{ code: "COMMENT_REQUIRED", path: `productAreas[${unexplainedAreaIndex}].comment` }]);
  }

  return {
    ok: true,
    dataStatus: status.dataStatus,
    effectiveProductStatus: status.releaseAssessment.status,
    errors: [],
  };
}

export function projectPublicStatus(status, options) {
  const sensitivePath = findSensitiveValue(status);
  if (sensitivePath) {
    throw new Error(`SENSITIVE_VALUE:${sensitivePath}`);
  }

  const projected = Object.fromEntries(publicFields.map((field) => [field, structuredClone(status[field])]));
  const result = validateStatus(projected, options);
  if (!result.ok) {
    throw new Error(result.errors.map((error) => `${error.code}:${error.path}`).join(","));
  }

  return projected;
}
