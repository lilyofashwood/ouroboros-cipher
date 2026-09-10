const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs/promises");
const { pathToFileURL } = require("node:url");
(async () => {
  const browser = await chromium.launch({ channel: "chromium", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [], external = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => { if (/^https?:/.test(request.url())) external.push(request.url()); });
    await page.goto(pathToFileURL(path.resolve(__dirname, "../index.html")).href);
    await page.locator("#input").fill("HELLO 🧑🏽‍💻");
    assert.equal(await page.locator(".output").textContent(), "WMQXA 🧑🏽‍💻");
    await page.getByRole("button", { name: "Decode", exact: true }).click();
    await page.locator("#input").fill("WMQXA 🧑🏽‍💻");
    assert.equal(await page.locator(".solutions li").count(), 2);
    assert((await page.locator(".solutions").textContent()).includes("HELLO 🧑🏽‍💻"));
    await page.locator("#input").fill("AB");
    assert((await page.locator("#status").textContent()).includes("REJECTED"));
    await page.getByRole("button", { name: "Encode", exact: true }).click();
    await page.locator("#input").fill("The snake eats its tail 🐍");
    await fs.mkdir(path.resolve(__dirname, "../output"), { recursive: true });
    await page.screenshot({ path: path.resolve(__dirname, "../output/demo-desktop.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.resolve(__dirname, "../output/demo-mobile.png"), fullPage: true });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    console.log(`PASS Ouroboros offline file demo: encode, Unicode-preserving ambiguity, invalid ring, desktop/mobile; no external requests or page errors. Chrome ${browser.version()}`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
