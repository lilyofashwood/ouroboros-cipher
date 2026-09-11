const test = require("node:test");
const assert = require("node:assert/strict");
const { lettering } = require("../typography.js");

test("house lettering uses the original chaos-noodle-II vowel/consonant map", () => {
  assert.equal(lettering("Ouroboros"), "𝐨𝐮𝗋𝐨𝖻𝐨𝗋𝐨𝗌");
  assert.equal(lettering("ABC XYZ"), "𝐚𝖻𝖼 𝗑𝗒𝗓");
});
test("Font Garden heading voices use their exact scalar alphabets", () => {
  assert.equal(lettering("ABC xyz", "mono"), "𝚊𝚋𝚌 𝚡𝚢𝚣");
  assert.equal(lettering("ABC xyz", "double"), "𝕒𝕓𝕔 𝕩𝕪𝕫");
  assert.equal(lettering("Abceglo", "script"), "𝒶𝒷𝒸ℯℊ𝓁ℴ");
  for (const voice of ["house", "mono", "double", "script"]) {
    const original = "The ring · 26 🐍";
    assert.equal(lettering(original, voice).normalize("NFKC"), original.toLowerCase());
  }
});
test("presentation never normalizes existing non-ASCII scalar text", () => {
  const untouched = "é e\u0301 🧑🏽‍💻 \uE000 𝓛 𝖱 \uFE0F";
  for (const voice of ["house", "mono", "double", "script"]) {
    assert.equal(lettering(untouched, voice).replace(lettering("e", voice), "e"), untouched);
  }
});
