(function (root) {
  "use strict";
  const isLetter = (character) => /^[A-Za-z]$/.test(character);
  const value = (character) => character.toUpperCase().charCodeAt(0) - 64;
  function characters(text) {
    if (typeof text !== "string") throw new TypeError("Expected a string.");
    const result = [...text];
    if (result.some((character) => { const cp = character.codePointAt(0); return cp >= 0xD800 && cp <= 0xDFFF; })) {
      throw new TypeError("Unpaired UTF-16 surrogates are not valid Unicode scalar text.");
    }
    return result;
  }
  function shift(character, amount) {
    const base = character <= "Z" ? 65 : 97;
    return String.fromCharCode(((character.charCodeAt(0) - base + amount) % 26 + 26) % 26 + base);
  }
  function encrypt(text) {
    const chars = characters(text);
    const letters = chars.filter(isLetter);
    if (!letters.length) return text;
    let previous = value(letters.at(-1));
    return chars.map((character) => {
      if (!isLetter(character)) return character;
      const encoded = shift(character, previous);
      previous = value(character);
      return encoded;
    }).join("");
  }
  function decode(text) {
    const chars = characters(text);
    const letterCount = chars.filter(isLetter).length;
    if (!letterCount) return { status: "exact", letterCount, candidates: [{ seed: null, text }] };
    const candidates = [];
    for (let seed = 1; seed <= 26; seed += 1) {
      let previous = seed;
      const result = chars.map((character) => {
        if (!isLetter(character)) return character;
        const plain = shift(character, -previous);
        previous = value(plain);
        return plain;
      }).join("");
      if (previous === seed) candidates.push({ seed, text: result });
    }
    return { status: candidates.length ? "ambiguous" : "rejected", letterCount, candidates };
  }
  const decrypt = (text) => decode(text).candidates.map((candidate) => candidate.text);
  const rot13 = (text) => characters(text).map((character) => isLetter(character) ? shift(character, 13) : character).join("");
  function getChain(text) {
    const chars = characters(text);
    const letters = chars.filter(isLetter);
    if (!letters.length) return [];
    let previous = value(letters.at(-1));
    const chain = [];
    chars.forEach((character, position) => {
      if (!isLetter(character)) return;
      chain.push({ position, plain: character, value: value(character), shift: previous, result: shift(character, previous) });
      previous = value(character);
    });
    return chain;
  }
  function nest(text, depth) {
    characters(text);
    if (!Number.isInteger(depth) || depth < 0 || depth > 100) throw new RangeError("Nesting depth must be an integer from 0 to 100.");
    const layers = [text];
    for (let i = 0; i < depth; i += 1) layers.push(encrypt(layers.at(-1)));
    return layers;
  }
  const api = Object.freeze({ version: "1.1.0", encrypt, decrypt, decode, rot13, getChain, nest });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Ouroboros = api;
})(globalThis);
