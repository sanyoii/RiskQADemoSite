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

test("server-renders the public QA Decision Desk", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  for (const text of [
    "QA Decision Desk",
    "Low-Tech Testing Dashboard",
    "Repository Quality Dashboard",
    "2 releases ready",
    "cex-market-data-quality-lab",
    "sanyoii.github.io",
    "17 fresh cases passed",
    "Pages production verified",
    "Released",
    "正式 Go 紀錄完成",
    "Release Readiness",
    "Ready",
    "High",
    "Medium",
    "Level 2+",
    "Healthy",
    "Deployment Confidence",
    "展開 Repo 查看 Gate Flow",
    "Release Gate Flow",
    "Product Areas",
    "Order-book synchronization",
    "Document integrity and privacy",
    "測試已通過",
    "外部檢視完成",
    "New Repo",
    "正式 Go 已核准",
    "不代表零缺陷，也不是品質保證",
    "不是產品故障，也不是即時監控",
    "Sanitized public projection",
  ]) {
    assert.ok(html.includes(text), `missing rendered text: ${text}`);
  }

  assert.match(html, /class="st-merged-head has-gates"/);
  assert.match(html, /<details class="st-merged-repo">/);
  assert.doesNotMatch(html, /data-state="blocked"/);
  assert.match(html, /href="\/run-records\/"/);
  assert.match(html, /href="\/run-records\/fail-demo\/"/);
  assert.match(html, /href="\/dashboard-demo\/"/);
  assert.match(html, /actions\/runs\/32241879480/);
  assert.match(html, /main · GitHub Pages production · fd337bd/);
  assert.equal((html.match(/class="st-area-table"/g) ?? []).length, 2);
  assert.equal((html.match(/<details class="st-merged-repo">/g) ?? []).length, 2);
  assert.doesNotMatch(html, /1 decision pending/);
  assert.doesNotMatch(html, /正式紀錄未完成|缺 G6 正式紀錄/);
  assert.doesNotMatch(html, /<details class="evidence-group">/);
  assert.doesNotMatch(html, /142 Total Bugs|92%|85\/100|1\.2s/);
  assert.match(html, /lang="en"/);
  assert.match(html, /class="qa-language-toggle"/);
  assert.match(html, /data-en="Test Cases and Run Records" data-zh="Test Cases 與執行記錄"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|SkeletonPreview/);
  assert.doesNotMatch(html, /test-records\/pilot-0|current-status\.json/);
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

test("server-renders three truthful visual dashboard samples", async () => {
  const response = await render("/dashboard-demo");
  assert.equal(response.status, 200);
  const html = await response.text();

  for (const text of [
    "Low-Tech Testing Dashboard",
    "同一份 CEX 狀態，三種更直觀的視覺化方式",
    "Sample A",
    "Sample B",
    "Sample C",
    "Objective Cards",
    "Release Gate Flow",
    "Repo Portfolio Matrix",
    "Release Readiness",
    "Release Decision",
    "Test Effort",
    "Coverage",
    "Quality Assessment",
    "cex-market-data-quality-lab",
    "正式 Go 已核准",
    "High",
    "Level 2+",
    "Ready",
    "G3",
    "測試已通過",
    "G5",
    "外部檢視完成",
    "G6",
    "正式 Go 紀錄完成",
    "正式 Go 已核准",
    "不顯示虛構數字",
  ]) {
    assert.match(html, new RegExp(text.replace(/[+]/g, "\\+")));
  }

  assert.ok(html.indexOf("Sample A") < html.indexOf("Sample B"));
  assert.ok(html.indexOf("Sample B") < html.indexOf("Sample C"));
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/run-records\/"/);
  assert.match(html, /href="#sample-cards"/);
  assert.match(html, /href="#sample-gates"/);
  assert.match(html, /href="#sample-portfolio"/);
  assert.match(html, /<details>/);
  assert.match(html, /aria-label="Test Effort: High, 4 of 4 bars"/);
  assert.match(html, /data-aria-label-zh="Test Effort：高，四格中 4 格"/);
  assert.match(html, /aria-label="Coverage: Level 2\+, common and error paths covered"/);
  assert.match(html, /data-aria-label-zh="Coverage：Level 2\+，常見路徑與錯誤路徑已覆蓋"/);
  assert.match(html, /aria-label="Quality Assessment: Ready, green light"/);
  assert.match(html, /data-aria-label-zh="Quality Assessment：就緒，綠色燈號"/);
  assert.doesNotMatch(html, /data-state="blocked"/);
  assert.doesNotMatch(html, /142|85\/100|1\.2s|92%/);
  assert.doesNotMatch(html, /Ship<\//);
});

test("server-renders the A+C dashboard site template", async () => {
  const response = await render("/dashboard-demo/ac");
  assert.equal(response.status, 200);
  const html = await response.text();

  for (const text of [
    "A + C · Merged Repo View",
    "Merged Repo Dashboard",
    "Repo",
    "Objective",
    "Release Decision",
    "Test Effort",
    "Coverage",
    "Quality Assessment",
    "Decision",
    "cex-market-data-quality-lab",
    "Release Readiness",
    "Ready",
    "sanyoii.github.io",
    "17 fresh cases passed",
    "New Repo",
    "A + C",
    "A + B + C",
  ]) {
    assert.match(html, new RegExp(text.replace(/[+]/g, "\\+")));
  }

  assert.match(html, /class="st-merged-head has-decision"/);
  assert.match(html, /class="st-merged-grid has-decision"/);
  assert.doesNotMatch(html, /<details class="st-merged-repo">/);
  assert.doesNotMatch(html, /B · Release Gate Flow/);
  assert.match(html, /href="\/dashboard-demo\/abc\/"/);
  assert.match(html, /href="\/run-records\/"/);
  assert.doesNotMatch(html, /142|85\/100|1\.2s|92%/);
});

test("server-renders the A+B+C dashboard site template", async () => {
  const response = await render("/dashboard-demo/abc");
  assert.equal(response.status, 200);
  const html = await response.text();

  for (const text of [
    "A + B + C · Merged Repo + Gates",
    "Merged Repo Dashboard",
    "Repo",
    "Objective",
    "Release Decision",
    "Test Effort",
    "Coverage",
    "Quality Assessment",
    "B · Release Gate Flow",
    "G3",
    "測試已通過",
    "G5",
    "外部檢視完成",
    "G6",
    "正式 Go 紀錄完成",
    "sanyoii.github.io",
    "17 fresh cases passed",
    "New Repo",
  ]) {
    assert.match(html, new RegExp(text.replace(/[+]/g, "\\+")));
  }

  assert.match(html, /class="st-merged-head has-gates"/);
  assert.match(html, /<details class="st-merged-repo">/);
  assert.match(html, /<summary class="st-merged-grid has-gates"/);
  assert.match(html, /href="\/dashboard-demo\/ac\/"/);
  assert.doesNotMatch(html, /data-state="blocked"/);
  assert.doesNotMatch(html, /142|85\/100|1\.2s|92%/);
});

test("removes starter-only files and keeps public metadata complete", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Read-only portfolio/);
  assert.match(page, /MergedRepoDashboard includeGates formal/);
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
