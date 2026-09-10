#!/usr/bin/env node
const cipher = require("./core.js");
const fs = require("node:fs");
const [mode, ...parts] = process.argv.slice(2);
try {
  const text = parts.length ? parts.join(" ") : fs.readFileSync(0, "utf8");
  if (mode === "encode") process.stdout.write(cipher.encrypt(text));
  else if (mode === "decode") process.stdout.write(JSON.stringify(cipher.decode(text), null, 2) + "\n");
  else if (mode === "twin") process.stdout.write(cipher.rot13(text));
  else throw new Error("Usage: node cli.cjs encode|decode|twin [text]; omitted text is read exactly from stdin.");
} catch (error) { console.error(error.message); process.exitCode = 1; }
