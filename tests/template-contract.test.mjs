import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
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


test("Case templates link to Runs without maintaining a second actual-result record", async () => {
  const content = await readTemplate("04-test-case.md");
  const links = content.split("## Execution links")[1]?.split("## Review")[0];
  assert.ok(links);
  assert.match(links, /Run Record links/);
  assert.doesNotMatch(links, /^- (Status|Actual result|Executed by|Executed at)[：:]/m);
});

test("all twenty bilingual offline pages have valid sibling links, anchors and synthetic disclosure", async () => {
  const baseNames = ["index.html", "qa-test-request.html", "quality-risk-assessment.html", "test-spec-template.html", "test-scenario-template.html", "test-case-template.html", "run-log.html", "bug-report-template.html", "quality-report.html", "dashboard-status-contract.html"];
  const names = baseNames.flatMap(name => [name, name.replace(".html", ".en.html")]);
  const pages = new Map(await Promise.all(names.map(async name => [name, await readFile(new URL(`../public/qa-templates/${name}`, import.meta.url), "utf8")])));
  const ids = new Map();
  for (const [name, html] of pages) {
    const all = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    ids.set(name, new Set(all));
    assert.equal(all.length, ids.get(name).size, `${name}: duplicate IDs`);
    if (name.endsWith(".en.html")) {
      assert.match(html, /<html lang="en"/);
      assert.match(html, /not a real exchange test/);
      assert.doesNotMatch(html.replaceAll("繁體中文", ""), /\p{Script=Han}/u);
    } else {
      assert.match(html, /<html lang="zh-Hant-TW"/);
      assert.match(html, /非真實交易所實測/);
    }
    assert.doesNotMatch(html, /(?:src|href)=["'](?:https?:|\/\/|file:)|[A-Z]:\\|<script\b/i);
  }
  for (const [name, html] of pages) {
    for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
      const [file, anchor] = href.split("#");
      const target = decodeURIComponent(file || name);
      assert.ok(pages.has(target), `${name}: missing ${href}`);
      if (anchor) assert.ok(ids.get(target).has(decodeURIComponent(anchor)), `${name}: missing anchor ${href}`);
    }
  }
  assert.ok(!ids.get("test-case-template.html").has("DEMO-RUN-FAIL-001"));
  assert.ok(ids.get("run-log.html").has("DEMO-RUN-FAIL-001"));
  assert.doesNotMatch(pages.get("bug-report-template.html"), /推導摘要/);
  assert.match(pages.get("quality-report.html"), /推導摘要（僅示例）：Blocked/);
});


test("Order Book samples retain the site's synthetic failure and remove billing assumptions", async () => {
  const read = name => readFile(new URL(`../public/qa-templates/${name}.html`, import.meta.url), "utf8");
  const [spec, cases, runs, bug, report, demo] = await Promise.all([
    read("test-spec-template"), read("test-case-template"), read("run-log"), read("bug-report-template"), read("quality-report"),
    readFile(new URL("../app/run-records/fail-demo/page.tsx", import.meta.url), "utf8"),
  ]);
  for (const id of ["TC-MDQ-016", "TC-MDQ-017", "TC-MDQ-018"]) {
    assert.ok(demo.includes(id));
    assert.ok(cases.includes(id));
    assert.ok(runs.includes(id));
  }
  for (const html of [spec, cases, runs, bug, report]) {
    assert.doesNotMatch(html, /FinMAS|扣點|餘額|DEMO-TASK|DEMO-LEDGER|DEMO-TC-0/);
    assert.match(html, /合成/);
  }
  assert.match(spec, /incoming.*103.*current.*104|current.*104.*incoming.*103/s);
  assert.match(cases, /預期.*104/s);
  assert.match(runs, /實際.*103/s);
  assert.ok(demo.includes("DEF-MDQ-004"));
  assert.ok(bug.includes('id="DEF-MDQ-004"'));
  assert.match(report, /2.*Pass.*1.*Fail/s);
  assert.match(report, /3.*3.*100%/s);
  assert.match(report, /推導摘要（僅示例）：Blocked/);
});


test("all nine templates have bilingual blanks, examples and README mappings", async () => {
  const mapping = [
    ["00-qa-test-request.md", "qa-test-request"],
    ["01-quality-risk-assessment.md", "quality-risk-assessment"],
    ["02-test-spec.md", "test-spec-template"],
    ["03-test-scenario.md", "test-scenario-template"],
    ["04-test-case.md", "test-case-template"],
    ["05-test-run-record.md", "run-log"],
    ["06-defect-report.md", "bug-report-template"],
    ["07-release-quality-summary.md", "quality-report"],
    ["08-dashboard-status-contract.md", "dashboard-status-contract"],
  ];
  const docs = await Promise.all(["../README.md", "../README.zh-TW.md", "../Templates/QA/README.md"].map(path => readFile(new URL(path, import.meta.url), "utf8")));
  for (const [md, stem] of mapping) {
    for (const doc of docs) {
      assert.ok(doc.includes(md), `missing canonical ${md}`);
      assert.ok(doc.includes(`${stem}.html`), `missing Chinese ${stem}`);
      assert.ok(doc.includes(`${stem}.en.html`), `missing English ${stem}`);
    }
    const [zh, en] = await Promise.all([".html", ".en.html"].map(suffix => readFile(new URL(`../public/qa-templates/${stem}${suffix}`, import.meta.url), "utf8")));
    for (const html of [zh, en]) {
      assert.match(html, /<pre class="template">[\s\S]+?<\/pre>/);
      assert.match(html, /id="sample"/);
    }
    assert.ok(zh.includes(`href="${stem}.en.html"`));
    assert.ok(en.includes(`href="${stem}.html"`));
    assert.deepEqual([...zh.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]), [...en.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]), `${stem}: anchor parity`);
  }
  for (const doc of docs) assert.doesNotMatch(doc, /seven-page|七頁|QA-Lite.*one short document/);
});


test("bilingual examples retain numeric facts, blank fields and canonical order", async () => {
  const translations = JSON.parse(await readFile(new URL("../Templates/QA/samples/translations_en.json", import.meta.url), "utf8"));
  const numbers = text => (text.replace(/零/g, "0").replace(/\bzero\b/gi, "0").match(/\d+(?:\.\d+)?/g) ?? []).sort();
  for (const [zh, en] of Object.entries(translations)) {
    if (!/^\d{4} 年/.test(zh)) assert.deepEqual(numbers(en), numbers(zh), `numeric drift: ${zh.slice(0, 60)}`);
    if (zh.includes("[ ]")) {
      assert.equal(en.split("[ ]").length, zh.split("[ ]").length, `missing blank field: ${zh.slice(0, 40)}`);
      assert.equal(en.split("\n").length, zh.split("\n").length, `missing form row: ${zh.slice(0, 40)}`);
    }
  }
  for (const name of ["index.html", "index.en.html"]) {
    const html = await readFile(new URL(`../public/qa-templates/${name}`, import.meta.url), "utf8");
    const ids = [...html.matchAll(/<td data-label="(?:文件|Documents)">(\d{2}) /g)].map(m => m[1]);
    assert.deepEqual(ids, ["00", "01", "02", "03", "04", "05", "06", "07", "08"]);
  }
});


test("sample source and generated pages use current QA terminology", async () => {
  const source = await readTemplate("samples/build_samples.py");
  const translations = await readTemplate("samples/translations_en.json");
  const canonical = (await readdir(new URL("../Templates/QA/", import.meta.url))).filter(name => /^\d{2}-.*\.md$/.test(name));
  for (const name of canonical) assert.doesNotMatch(await readTemplate(name), /複測|出場/, name);
  const triage = await readFile(new URL("../Playbooks/QA/defect-triage.md", import.meta.url), "utf8");
  assert.doesNotMatch(triage, /複測|出場/);
  const root = new URL("../public/qa-templates/", import.meta.url);
  const names = (await readdir(root)).filter(name => name.endsWith(".html"));
  for (const [name, content] of [
    ["generator", source], ["translations", translations],
    ...await Promise.all(names.map(async name => [name, await readFile(new URL(name, root), "utf8")])),
  ]) assert.doesNotMatch(content, /複測|出場/, `${name}: outdated QA terminology`);
});

test("README version and generator reference match the delivered template library", async () => {
  const readme = await readTemplate("README.md");
  const version = readme.match(/九份 Markdown v(\d+\.\d+\.\d+)/)?.[1];
  assert.ok(version, "README must state the canonical template version");
  const names = (await readdir(new URL("../Templates/QA/", import.meta.url))).filter(name => /^\d{2}-.*\.md$/.test(name));
  assert.equal(names.length, 9);
  for (const name of names) {
    const content = await readTemplate(name);
    assert.equal(content.match(/^templateVersion: (.+)$/m)?.[1], version, `${name}: README version drift`);
  }
  assert.match(readme, /\[產生器說明\]\(samples\/README\.md\)/);
  const guide = await readTemplate("samples/README.md");
  assert.match(guide, /build_samples\.py/);
  assert.match(guide, /translations_en\.json/);
  for (const name of ["build_samples.py", "translations_en.json"]) {
    assert.ok((await readTemplate(`samples/${name}`)).length > 0);
  }
});
