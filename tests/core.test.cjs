const test = require("node:test");
const assert = require("node:assert/strict");
const { encrypt, decrypt, decode, rot13, getChain, nest } = require("../core.js");

test("recovered A=1 circular-autokey vectors", () => {
  assert.equal(encrypt("A"), "B");
  assert.equal(encrypt("Z"), "Z");
  assert.equal(encrypt("HELLO"), "WMQXA");
  assert.equal(getChain("HELLO")[0].shift, 15);
});
test("preserves the recovered React implementation's ASCII wire outputs", () => {
  const source = require("node:fs").readFileSync(require("node:path").join(__dirname, "../archive/recovered/ouroboros-cipher.tsx"), "utf8");
  const historicalCore = source.slice(source.indexOf("const SNAKE"), source.indexOf("// Ouroboros SVG animation"));
  const historical = require("node:vm").runInNewContext(historicalCore + ";({encrypt,decrypt})");
  for (const plain of ["HELLO", "The Temple shifts", "the snake eats its tail", "A b, C!\nZ", "0123"]) {
    assert.equal(encrypt(plain), historical.encrypt(plain));
    assert.deepEqual(decrypt(encrypt(plain)), Array.from(historical.decrypt(encrypt(plain))));
  }
});
test("every one- and two-letter ring retains its complete solution set", () => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const first of alphabet) {
    const one = decrypt(encrypt(first));
    assert.equal(one.length, 2);
    assert(one.includes(first));
    for (const second of alphabet) {
      const plain = first + second;
      const encrypted = encrypt(plain);
      const solutions = decrypt(encrypted);
      assert.equal(solutions.length, 26);
      assert(solutions.includes(plain));
      for (const solution of solutions) assert.equal(encrypt(solution), encrypted);
    }
  }
});
test("ROT13 twins, mixed case and complete arbitrary Unicode carriers", () => {
  for (const plain of ["The Temple shifts", "🐍 HELLO 🧑🏽‍💻", "é𝓵𝓲𝓵𝔂 A\u0308b\u0301 🏳️‍🌈", "A\n\tB!", "\uE000hello\uE001"]) {
    const encrypted = encrypt(plain);
    assert.equal(encrypt(rot13(plain)), encrypted);
    assert(decrypt(encrypted).includes(plain));
    assert.equal([...encrypted].length, [...plain].length);
    const plainChars = [...plain];
    [...encrypted].forEach((character, index) => {
      if (!/^[A-Za-z]$/.test(plainChars[index])) assert.equal(character, plainChars[index]);
    });
  }
});
test("empty/nonletter data is an exact unchanged record, invalid loops rejected", () => {
  for (const text of ["", "🐍 𝓵𝓲𝓵𝔂 é", "\n\t!"]) {
    assert.equal(decode(text).status, "exact");
    assert.deepEqual(decrypt(text), [text]);
  }
  assert.equal(decode("A").status, "rejected");
  assert.equal(decode("AB").status, "rejected");
});
test("malformed Unicode and invalid nesting parameters fail explicitly", () => {
  assert.throws(() => encrypt("\uD800"), /surrogate/);
  assert.throws(() => decode("\uDC00"), /surrogate/);
  assert.throws(() => encrypt(null), /string/);
  assert.throws(() => nest("hello", -1), /depth/);
  assert.throws(() => nest("hello", 1.5), /depth/);
  assert.deepEqual(nest("hello", 2), ["hello", encrypt("hello"), encrypt(encrypt("hello"))]);
});
