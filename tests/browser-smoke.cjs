const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs/promises");
const { pathToFileURL } = require("node:url");
(async () => {
  const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : { channel: "chromium" }), headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [], external = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => { if (/^https?:/.test(request.url())) external.push(request.url()); });
    await page.goto(pathToFileURL(path.resolve(__dirname, "../index.html")).href);
    const assertNarrative = async () => {
      const leaks = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT), found = [];
        while (walker.nextNode()) {
          const text = walker.currentNode;
          if (/[A-Za-z]/.test(text.data) && !text.parentElement.closest('code,pre,textarea,input,output,.literal,.sr-only,[hidden]')) found.push(text.data);
        }
        return found;
      });
      assert.deepEqual(leaks, [], "Visible narrative uses garden lettering; cipher data stays literal.");
    };
    assert.equal(await page.getByRole("heading", { name: "Ouroboros", exact: true }).count(), 1);
    assert.equal(await page.locator("h1 .voice-visible").textContent(), "𝐨𝐮𝗋𝐨𝖻𝐨𝗋𝐨𝗌");
    assert.equal(await page.locator(".theorem code").textContent(), "encrypt(ROT13(P)) = encrypt(P)");
    await page.locator("#input").fill("HELLO 🧑🏽‍💻");
    assert.equal(await page.locator(".output").textContent(), "WMQXA 🧑🏽‍💻");
    await assertNarrative();
    await page.getByRole("button", { name: "Decode", exact: true }).click();
    await page.locator("#input").fill("WMQXA 🧑🏽‍💻");
    assert.equal(await page.locator(".solutions li").count(), 2);
    assert((await page.locator(".solutions").textContent()).includes("HELLO 🧑🏽‍💻"));
    assert.deepEqual(await page.locator(".solutions li > .literal").allTextContents(), ["URYYB 🧑🏽‍💻", "HELLO 🧑🏽‍💻"]);
    await assertNarrative();
    await page.locator("#input").fill("AB");
    assert((await page.locator("#status").textContent()).includes("REJECTED"));
    await assertNarrative();
    await page.getByRole("button", { name: "ROT13 twin", exact: true }).click();
    await page.getByLabel("Plaintext", { exact: true }).fill("HELLO 🧑🏽‍💻");
    assert.equal(await page.locator("div.output.literal").textContent(), "URYYB 🧑🏽‍💻");
    assert.equal(await page.locator("p.output .literal").textContent(), "WMQXA 🧑🏽‍💻");
    await assertNarrative();
    await page.getByRole("button", { name: "Nesting", exact: true }).click();
    assert.deepEqual(await page.locator(".solutions li > .literal").allTextContents(), require("../core.js").nest("HELLO 🧑🏽‍💻", 3));
    await assertNarrative();
    await page.locator("#depth").focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await page.locator("#depth").inputValue(), "4");
    assert.equal(await page.locator(".solutions li").count(), 5);
    await page.getByRole("button", { name: "Encode", exact: true }).click();
    await page.locator("#input").fill("The snake eats its tail 🐍");
    await assertNarrative();
    await fs.mkdir(path.resolve(__dirname, "../output"), { recursive: true });
    await page.screenshot({ path: path.resolve(__dirname, "../output/demo-desktop.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.resolve(__dirname, "../output/demo-mobile.png"), fullPage: true });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    console.log(`PASS Ouroboros offline file demo: all four modes, exact scalar outputs, invalid ring, full narrative typography, plaintext accessible names, keyboard depth, desktop/mobile; no external requests or page errors. Chrome ${browser.version()}`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
