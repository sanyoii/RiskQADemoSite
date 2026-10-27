import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import index from "../data/decision-index.json" with { type: "json" };
import risks from "../data/risks.json" with { type: "json" };
import {
  DUE_WHEN_UNSET,
  exclusionScope,
  exitCriteriaByRepo,
  historyRoutes,
  qaTemplateLinks,
  sortRisks,
} from "../lib/p3-pages.mjs";

test("each repository lists EC-1 through EC-4, including approval validity, with run-record anchors", () => {
  const pages = exitCriteriaByRepo(index.repositories);
  assert.equal(pages.length, 2);
  for (const page of pages) {
    assert.deepEqual(page.criteria.map((item) => item.id), ["EC-1", "EC-2", "EC-3", "EC-4"]);
    const approval = page.criteria.find((item) => item.id === "EC-4");
    assert.equal(approval.title.zh, "核准仍在效期內");
    assert.ok(approval.links.length > 0, page.repository);
    for (const link of approval.links) {
      assert.match(link, /^\/run-records\/#RUN-/);
    }
  }
});

test("risks sort S1 then S2 then S3, and an unset due date is the launch-date phrase", () => {
  const sorted = sortRisks(risks.risks);
  assert.deepEqual(sorted.map((risk) => risk.severity), ["S1", "S1", "S2", "S3", "S3", "S3"]);
  assert.equal(sorted[2].id, "RISK-auth-orders-funds");
  for (const risk of sorted) {
    assert.equal(risk.dueLabel.zh, "待上線日決定");
    assert.equal(risk.dueLabel, DUE_WHEN_UNSET);
    assert.equal(risk.synthetic, false);
  }
  assert.equal(sorted.some((risk) => /範例資料/.test(JSON.stringify(risk))), false);
});

test("load testing and non-Chromium browsers stay in the exclusion block without a severity", () => {
  const items = exclusionScope(index.repositories);
  assert.ok(items.some((item) => /load|負載/i.test(`${item.en} ${item.zh}`)));
  assert.ok(items.some((item) => /Chromium/.test(item.en) && /以外/.test(item.zh)));
  for (const item of items) {
    assert.equal(Object.hasOwn(item, "severity"), false);
    assert.equal(/S1|S2|S3/.test(JSON.stringify(item)), false);
  }
});

test("the QA template page has nine links that exist in both languages", async () => {
  const links = qaTemplateLinks();
  assert.equal(links.length, 9);
  const slugs = new Set(links.map((item) => item.slug));
  assert.equal(slugs.size, 9);
  for (const item of links) {
    assert.match(item.hrefEn, new RegExp(`/qa-templates/${item.slug}\\.en\\.html$`));
    assert.match(item.hrefZh, new RegExp(`/qa-templates/${item.slug}\\.html$`));
    await access(new URL(`../public${item.hrefZh}`, import.meta.url));
    await access(new URL(`../public${item.hrefEn}`, import.meta.url));
  }
});

test("design history names the three previous URLs and the later published destination", () => {
  const history = historyRoutes();
  assert.equal(history.archived.zh, "已封存");
  assert.equal(history.destination, "/test-status/history/");
  assert.equal(history.redirectsInThisBuild, false);
  assert.deepEqual(history.previous.map((item) => item.route), [
    "/dashboard-demo",
    "/dashboard-demo/abc",
    "/dashboard-demo/ac",
  ]);
  assert.deepEqual(history.previous.map((item) => item.shortName), ["/dashboard-demo", "/abc", "/ac"]);
  for (const item of history.previous) {
    assert.match(item.published, /^\/test-status\/dashboard-demo\/(abc\/|ac\/)?$/);
    assert.equal(item.redirectsNow, false);
  }
});
