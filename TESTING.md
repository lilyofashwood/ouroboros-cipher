# Review verification · September 10, 2026

`node --test tests/core.test.cjs`: 6/6 tests passed. Includes compatibility with the archived React core on ASCII inputs, all 26 one-letter and 676 two-letter rings with every candidate re-encrypted, ROT13 invariance, Unicode scalar preservation, invalid loops, malformed surrogates and nesting boundaries.

`node tests/browser-smoke.cjs`: passed using development-only Playwright and Chrome for Testing 151.0.7922.34. The demo opened directly from `file://`, encoded and decoded emoji-bearing text, showed both valid readings, rejected an invalid ring, and rendered at 1280px and 390px. No external HTTP requests or uncaught page errors occurred. Both screenshots were visually inspected for clipping and legibility.

Only the browser smoke needs Playwright; the core suite uses Node's standard library. Screenshots are in ignored `output/`. No model selection of a preferred decoding is included or presented as exact recovery.
