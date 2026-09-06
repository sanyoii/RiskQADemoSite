import { readFileSync } from "node:fs";
import { policyErrors } from "./decision-policy.mjs";

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

export function validateStatus(status, options = {}) {
  if (!status || status.contractVersion !== "1.0.0") {
    return invalid([{ code: "CONTRACT_VERSION_UNSUPPORTED", path: "contractVersion" }]);
  }
  if (!status.repository?.fullSha) return invalid([{ code: "FIELD_REQUIRED", path: "repository.fullSha" }]);
  if (!validateSchema(status)) return invalid([{ code: "SCHEMA_INVALID", path: schemaErrorPath(validateSchema.errors[0]) }]);
  const errors = policyErrors(status, options);
  if (errors.length) {
    const first = errors[0];
    return invalid([first], errors.some(error => error.code === "EVIDENCE_STALE") ? "stale" : "invalid");
  }
  return { ok: true, dataStatus: status.dataStatus, effectiveProductStatus: status.releaseAssessment.status, errors: [] };
}

export function projectPublicStatus(status, options) {
  const sensitivePath = findSensitiveValue(status);
  if (sensitivePath) throw new Error(`SENSITIVE_VALUE:${sensitivePath}`);
  const projected = Object.fromEntries(publicFields.map(field => [field, structuredClone(status[field])]));
  const result = validateStatus(projected, options);
  if (!result.ok) throw new Error(result.errors.map(error => `${error.code}:${error.path}`).join(","));
  return projected;
}
