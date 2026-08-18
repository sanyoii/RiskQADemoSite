import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

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

test("server-renders the public QA Decision Desk", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  for (const text of [
    "QA Decision Desk",
    "尚未核准發布（Unknown）",
    "TinTin 的簽核目前只有摘要回報",
    "正式 G6 Go 決定與可核對的簽核紀錄",
    "查看本次測試記錄",
    "較早執行 — 未採用",
    "修正後執行 — 目前採用",
    "四種情境怎麼影響發布",
    "資料無法取得（Unreachable）",
    "sanitized decision summary",
  ]) {
    assert.match(html, new RegExp(text));
  }

  assert.match(html, /href="#test-records"/);
  const repoIndex = html.indexOf(">Repo<");
  const releaseIndex = html.indexOf(">能不能發<");
  const whyIndex = html.indexOf(">為什麼<");
  const evidenceIndex = html.indexOf(">紀錄在哪<");
  assert.ok(repoIndex >= 0);
  assert.ok(repoIndex < releaseIndex && releaseIndex < whyIndex && whyIndex < evidenceIndex);
  assert.match(html, /cex-market-data-quality-lab/);
  assert.match(html, /<summary>完整受測版本<\/summary>/);
  assert.match(html, /class="status release-status" data-state="Unknown"/);
  assert.match(html, /尚未核准發布（Unknown）/);
  assert.equal((html.match(/<details class="evidence-group">/g) ?? []).length, 2);
  assert.match(html, /查看 Test Cases 與執行記錄/);
  assert.match(html, /href="\/run-records#RUN-20260817T015452830Z-8fd5081254b5-DETERMINISTIC"/);
  assert.doesNotMatch(html, /證據在哪|本次測試證據|查看本次測試證據|測試證據/);
  assert.match(html, /<summary class="evidence-group-summary">[\s\S]*較早執行 — 未採用/);
  assert.match(html, /<summary class="evidence-group-summary">[\s\S]*修正後執行 — 目前採用/);
  assert.match(html, /lang="zh-Hant"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|SkeletonPreview/);
  assert.doesNotMatch(html, /protected-evidence|test-records\/pilot-0|current-status\.json/);
});

test("server-renders human-readable Test Case and Run records", async () => {
  const response = await render("/run-records");
  assert.equal(response.status, 200);
  const html = await response.text();

  for (const text of [
    "Test Cases 與執行記錄",
    "39 個自動化檢查",
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
  ]) {
    assert.match(html, new RegExp(text));
  }

  assert.match(html, /id="RUN-20260817T015452830Z-8fd5081254b5-DETERMINISTIC"/);
  assert.match(html, /href="\/"/);
  assert.doesNotMatch(html, /測試證據|本次測試證據/);
});

test("removes starter-only files and keeps public metadata complete", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Portfolio demo/);
  assert.match(page, /data-state=\{state\}/);
  assert.match(layout, /\/og\.png/);
  assert.match(layout, /requestHeaders\.get\("host"\)/);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await access(new URL("../public/og.png", import.meta.url));
  await access(new URL("../.openai/hosting.json", import.meta.url));
  await access(projectRoot);
});
