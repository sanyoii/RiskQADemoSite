import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const runIds = [
  "RUN-20260817T013741977Z-8fd5081254b5-DETERMINISTIC",
  "RUN-20260817T013741977Z-8fd5081254b5-LIVE",
  "RUN-20260817T013741977Z-8fd5081254b5-MANUAL",
  "RUN-20260817T015452830Z-8fd5081254b5-DETERMINISTIC",
  "RUN-20260817T015452830Z-8fd5081254b5-LIVE",
  "RUN-20260817T015452830Z-8fd5081254b5-MANUAL",
];

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the bilingual contract on every public route", async () => {
  const routes = ["/", "/dashboard-demo", "/dashboard-demo/ac", "/dashboard-demo/abc", "/run-records", "/run-records/fail-demo"];

  for (const route of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.match(html, /class="qa-language-toggle"/, route);
    assert.match(html, /data-page-title-en="[^"]+"/, route);
    assert.match(html, /data-page-title-zh="[^"]+"/, route);
    assert.match(html, /data-page-description-en="[^"]+"/, route);
    assert.match(html, /data-page-description-zh="[^"]+"/, route);
    assert.match(html, /data-en="[^"]+" data-zh="[^"]+"/, route);
  }
});

test("server-renders a bilingual not-found page", async () => {
  const response = await render("/missing-page");
  assert.equal(response.status, 404);
  const html = await response.text();
  assert.match(html, /data-en="Page not found" data-zh="找不到頁面"/);
  assert.match(html, /href="\/"/);
  assert.match(html, /class="qa-language-toggle"/);
});

test("English page content has no untranslated Chinese, including collapsed evidence", async () => {
  for (const route of ["/", "/dashboard-demo", "/dashboard-demo/ac", "/dashboard-demo/abc", "/run-records", "/run-records/fail-demo"]) {
    const html = await (await render(route)).text();
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
    assert.ok(main, `missing main content: ${route}`);
    const text = main.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<[^>]*>/g, "");
    assert.doesNotMatch(text, /\p{Script=Han}/u, `untranslated English content: ${route}`);
  }
});

test("server-rendering fails closed and separates current state from historical approvals", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const text of ["QA Decision Desk", "Release overview", "2 repositories", "cex-market-data-quality-lab", "sanyoii.github.io",
    "CLOCK_UNCONFIRMED", "What prevents a current Go?", "Owner", "Historical decision replay", "Original validity boundary",
    "Source SHA", "SHA-256", "Coverage", "Target", "Unreachable", "不是產品故障", "Sanitized public projection"]) {
    assert.ok(html.includes(text), `missing ${text}`);
  }
  assert.equal((html.match(/class="decision-current" data-status="unknown"/g) ?? []).length, 2);
  assert.equal((html.match(/class="decision-repo" data-status="unknown"/g) ?? []).length, 2);
  assert.equal((html.match(/class="decision-status-icon" aria-hidden="true"/g) ?? []).length, 2);
  assert.match(html, /data-en="Unknown" data-zh="待確認"/);
  assert.match(html, /Last recorded test/);
  const cards = html.split('<article class="decision-repo"').slice(1);
  for (const card of cards) {
    const [overview, details] = card.split('<details class="decision-details">');
    assert.doesNotMatch(overview, /decision-actions|CLOCK_UNCONFIRMED|RELEASE_EVIDENCE_REQUIRED|Historical decision replay/);
    assert.match(overview, /class="decision-next-action"/);
    assert.match(overview, /data-en="Next step" data-zh="建議處理"/);
    assert.ok(details?.includes('class="decision-actions"'), "required actions remain in collapsed evidence");
  }
  assert.doesNotMatch(html, /<details class="decision-details" open/);
  for (const href of ["/run-records/", "/run-records/fail-demo/", "/dashboard-demo/"]) assert.ok(html.includes(`href="${href}"`));
  assert.doesNotMatch(html, /2 releases ready|st-merged|effort-bars|142 Total Bugs|92%|85\/100/);
  assert.ok(!html.split('<details class="decision-details">')[0].includes("17 fresh cases passed"));
  assert.doesNotMatch(html, /test-records\/pilot-0|current-status\.json|authorityRef|internalNotes/);
  assert.match(html, /run-records\/#RUN-20260906-/);
});

test("current record links resolve and retain the blocked Portfolio attempt", async () => {
  const html = await (await render("/run-records")).text();
  const records = JSON.parse(await readFile(new URL("../data/release-records.json", import.meta.url), "utf8"));
  for (const record of records) for (const run of record.runs) {
    assert.ok(html.includes(`id="${run.id}"`), run.id);
    assert.ok(html.includes(run.rawJUnitSha256));
    assert.equal(run.tests.length, run.total);
  }
  assert.match(html, /Owner self-review/);
  assert.match(html, /Post-fix execution — Historical/);
  assert.match(html, /RUN-20260906-portfolio-chromium-initial/);
  assert.match(html, /Blocked/);
  assert.doesNotMatch(html, /Abao-ThinkPadX1|C:\\\\Users|D:\\\\Codex|authorityRef/);
});

test("server-renders human-readable Test Case and Run records", async () => {
  const response = await render("/run-records");
  assert.equal(response.status, 200);
  const html = await response.text();

  for (const text of [
    "Test Cases 與執行記錄",
    "39 個自動化檢查",
    "涵蓋 34 個 logical Test Case IDs",
    "5 個 Live market-data 檢查",
    "2 個人工檢查",
    "OB-001",
    "REST-009",
    "WS-012",
    "DOC-004",
    "LIVE-SYNC-001",
    "MTC-SAFE-001",
    "MTC-EVID-001",
    "沒有逐項 raw output",
    "Test Fail 在 Run Records 的呈現",
    "DEMO-RUN-FAIL-001",
    "3 Test Cases · 2 Pass · 1 Fail",
    "過期 sequence 應被拒絕",
    "DEF-MDQ-004 · High · Open",
  ]) {
    assert.match(html, new RegExp(text));
  }

  for (const runId of runIds) {
    assert.match(html, new RegExp(`id="${runId}"`));
  }
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/run-records\/fail-demo\/"/);
  assert.match(html, /href="\/run-records\/fail-demo\/#execution-log"/);
  assert.match(html, /開啟 Fail Demo/);
  assert.doesNotMatch(html, /測試證據|本次測試證據/);
});

test("server-renders the synthetic failed Test Case and Run demo", async () => {
  const response = await render("/run-records/fail-demo");
  assert.equal(response.status, 200);
  const html = await response.text();

  for (const text of [
    "Test Case Fail Demo",
    "這是合成示範，不是目前產品的測試結果",
    "Run Result",
    "Product Status",
    "Release Decision",
    "No-Go",
    "3 Cases · 2 Pass · 1 Fail",
    "TC-MDQ-016",
    "TC-MDQ-017",
    "TC-MDQ-018",
    "Expected",
    "Actual",
    "過期 update 被接受",
    "DEF-MDQ-004",
    "High · Release blocking",
    "修正 → targeted rerun → release re-assessment",
    "Execution Log",
    "Exit code 1",
    "python -m pytest tests/test_order_book.py::test_rejects_stale_update -q",
    "expected=reject actual=accepted incoming_sequence=103",
    "stale update replaced current order-book state",
    "查看 raw log excerpt",
    "1 failed, 2 passed in 0.83s",
  ]) {
    assert.match(html, new RegExp(text));
  }

  assert.match(html, /<details class="failed-case-detail" open=""/);
  assert.match(html, /id="execution-log"/);
  assert.match(html, /<details class="raw-log" open=""/);
  assert.match(html, /data-state="Fail"/);
  assert.match(html, /href="\/run-records\/"/);
  assert.doesNotMatch(html, /RUN-20260817/);
});

test("failure result icon styles do not constrain localized text", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.doesNotMatch(css, /\.fail-result\s*>\s*span\s*\{/);
  assert.match(css, /\.fail-result\s*>\s*span\[aria-hidden="true"\]\s*\{/);
});

test("design evolution is secondary and contains no duplicated current status", async () => {
  const response = await render("/dashboard-demo");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const value of ["Design evolution", "Objective Cards", "Release Gate Flow", "Repo Portfolio Matrix", "retired as live dashboards"]) assert.ok(html.includes(value));
  assert.doesNotMatch(html, /cex-market-data-quality-lab|Formal Go approved|aria-label="Coverage: Level 2/);
  assert.match(html,/Six synthetic scenarios/);
  assert.equal((html.match(/class="decision-next-action"/g) ?? []).length,6);
});

test("legacy A+C URL remains compatible without a duplicate dashboard", async () => {
  const response = await render("/dashboard-demo/ac");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /A \+ C/);
  assert.match(html, /Retired sample/);
  assert.match(html, /href="\/"/);
  assert.doesNotMatch(html, /st-merged|17 fresh cases|data-status="ready"/);
});

test("legacy A+B+C URL remains compatible without a duplicate dashboard", async () => {
  const response = await render("/dashboard-demo/abc");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes("A + B + C"));
  assert.match(html, /Retired sample/);
  assert.match(html, /href="\/dashboard-demo\/"/);
  assert.doesNotMatch(html, /st-merged|17 fresh cases|data-status="ready"/);
});

test("removes starter-only files and keeps public metadata complete", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Read-only portfolio/);
  assert.match(page, /DecisionDashboard/);
  assert.match(layout, /\/og\.png/);
  assert.match(layout, /https:\/\/sanyoii\.github\.io\/test-status/);
  assert.doesNotMatch(layout, /from "next\/headers"/);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await access(new URL("../public/og.png", import.meta.url));
  await access(new URL("../.openai/hosting.json", import.meta.url));
  await access(projectRoot);
});
