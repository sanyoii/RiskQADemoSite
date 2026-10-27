import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";

const schema = JSON.parse(readFileSync(new URL("../schema/risks.schema.json", import.meta.url), "utf8"));
const catalog = JSON.parse(readFileSync(new URL("../data/risks.json", import.meta.url), "utf8"));

function validator() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  return ajv.compile(schema);
}

test("data/risks.json matches the public risk schema", () => {
  const validate = validator();
  const ok = validate(catalog);
  assert.equal(ok, true, JSON.stringify(validate.errors));
  assert.equal(schema.properties.risks.items.properties.relatedExitCriterion.anyOf[0].enum.join(","), "EC-1,EC-2,EC-3,EC-4");
  assert.equal(schema.properties.risks.items.properties.relatedExitCriterion.anyOf[1].type, "null");
});

test("relatedExitCriterion accepts EC-1 through EC-4 or null and rejects anything else", () => {
  const validate = validator();
  const base = structuredClone(catalog.risks[0]);
  for (const value of ["EC-1", "EC-2", "EC-3", "EC-4", null]) {
    assert.equal(validate({ risks: [{ ...base, relatedExitCriterion: value }] }), true, String(value));
  }
  for (const value of ["EC-5", "EC-0", "G1", "", "ec-1"]) {
    assert.equal(validate({ risks: [{ ...base, relatedExitCriterion: value }] }), false, value);
  }
});
