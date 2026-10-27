import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { detailsIsOpen } from "../lib/details-expanded.mjs";

test("collapsed details stay aria-expanded false when open is still the previous value", () => {
  assert.equal(detailsIsOpen({ open: true }, { newState: "closed" }), false);
  assert.equal(detailsIsOpen({ open: false }, { newState: "open" }), true);
  assert.equal(detailsIsOpen({ open: false }, {}), false);
  assert.equal(detailsIsOpen({ open: true }, undefined), true);
});

function chromeBin() {
  const candidates = [process.env.CHROME_PATH, "/usr/local/bin/google-chrome", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].filter(Boolean);
  return candidates.find((path) => existsSync(path)) ?? null;
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

async function waitForPage(port) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const pages = await response.json();
      const page = pages.find((item) => item.type === "page" && item.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Chrome debugging port did not open");
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });
  return new Promise((resolve, reject) => {
    ws.addEventListener("open", () => {
      resolve(async (method, params = {}) => {
        const id = ++nextId;
        const result = new Promise((done, fail) => pending.set(id, { resolve: done, reject: fail }));
        ws.send(JSON.stringify({ id, method, params }));
        return result;
      });
    });
    ws.addEventListener("error", () => reject(new Error("Chrome websocket failed")));
  });
}

async function press(send, key, code, keyCode, text) {
  await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, text, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
  await send("Runtime.evaluate", {
    expression: "new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
    awaitPromise: true,
  });
}

async function readState(send) {
  const evaluated = await send("Runtime.evaluate", {
    expression: `JSON.stringify({ open: document.querySelector("details").open, expanded: document.querySelector("summary").getAttribute("aria-expanded") })`,
    returnByValue: true,
  });
  return JSON.parse(evaluated.result.value);
}

test("decision bar summary aria-expanded follows open for Enter and Space", { timeout: 30_000 }, async (t) => {
  const bin = chromeBin();
  if (!bin) {
    t.skip("Chrome is not installed");
    return;
  }
  const html = `<!doctype html><meta charset="utf-8"><title>decision bar</title>
<details class="decision-bar-compact">
  <summary class="decision-bar-summary" aria-expanded="false">Hold · Archived demo · 2</summary>
  <div><p>rows</p></div>
</details>
<script type="module">
  import { bindDetailsExpanded } from "/details-expanded.mjs";
  bindDetailsExpanded(document.querySelector("details"));
  window.__bound = true;
</script>`;
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url, "http://127.0.0.1").pathname;
    if (pathname === "/details-expanded.mjs") {
      response.setHeader("content-type", "text/javascript");
      response.end(await readFile(new URL("../lib/details-expanded.mjs", import.meta.url)));
      return;
    }
    response.setHeader("content-type", "text/html; charset=utf-8");
    response.end(html);
  });
  const pagePort = await listen(server);
  const userData = await mkdtemp(join(tmpdir(), "decision-bar-"));
  const debugPort = 20000 + Math.floor(Math.random() * 20000);
  const chrome = spawn(bin, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userData}`,
    "about:blank",
  ], { stdio: "ignore" });
  try {
    const send = await connect(await waitForPage(debugPort));
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Emulation.setFocusEmulationEnabled", { enabled: true });
    await send("Page.navigate", { url: `http://127.0.0.1:${pagePort}/` });
    await send("Runtime.evaluate", {
      expression: `new Promise((resolve, reject) => {
        const start = Date.now();
        const timer = setInterval(() => {
          if (window.__bound) { clearInterval(timer); resolve(true); }
          else if (Date.now() - start > 4000) { clearInterval(timer); reject(new Error("binder did not run")); }
        }, 20);
      })`,
      awaitPromise: true,
    });
    await send("Runtime.evaluate", { expression: `document.querySelector("summary").focus()` });
    assert.deepEqual(await readState(send), { open: false, expanded: "false" });

    await press(send, "Enter", "Enter", 13, "\r");
    assert.deepEqual(await readState(send), { open: true, expanded: "true" }, "Enter opens");
    await press(send, "Enter", "Enter", 13, "\r");
    assert.deepEqual(await readState(send), { open: false, expanded: "false" }, "Enter collapses");

    for (let cycle = 0; cycle < 5; cycle += 1) {
      await press(send, " ", "Space", 32, " ");
      assert.deepEqual(await readState(send), { open: true, expanded: "true" }, `Space opens ${cycle}`);
      await press(send, " ", "Space", 32, " ");
      assert.deepEqual(await readState(send), { open: false, expanded: "false" }, `Space collapses ${cycle}`);
    }
  } finally {
    chrome.kill();
    server.close();
    await new Promise((resolve) => {
      chrome.once("exit", resolve);
      setTimeout(resolve, 1000);
    });
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        await rm(userData, { recursive: true, force: true });
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }
});
