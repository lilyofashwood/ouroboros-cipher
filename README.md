# 🐍 𝕺𝖚𝖗𝖔𝖇𝖔𝖗𝖔𝖘

*The message is the key. The end is the beginning.*

A circular-autokey Caesar cipher dreamed by Lily of Ashwood and developed with Claude. This private review edition recovers the original Python and React artifacts, preserves their encoding, and makes the ring runnable offline.

Open `index.html` in a browser. No build, CDN, account, or network is needed. Encode a message, inspect the chain, explore its ROT13 twin, nest the transform, or decode every valid reading. For a local web preview, run `python3 -m http.server 8766 --bind 127.0.0.1` from this directory.

```sh
node cli.cjs encode 'HELLO'
# WMQXA
node cli.cjs decode WMQXA
node --test tests/core.test.cjs
```

ASCII letters use A=1 through Z=26. The last plaintext letter seeds the first shift; each plaintext letter shifts the next. Case and all non-ASCII-letter scalars are preserved, including emoji, combining marks, newlines, and styled Unicode. No normalization is applied.

Every valid odd-letter ring has two readings: a ROT13 pair. Every valid even-letter ring has 26. Arbitrary altered ciphertext can have none. The local decoder reports the whole set; a reader or model may interpret it, but interpretation cannot establish the uniquely original text. This is an artistic classical cipher, not modern cryptographic confidentiality.

```text
ring.close(last_letter)
for each letter in the dreaming sentence:
    carry the previous voice forward
return all doors that open
```

The theorem, scalar rules, and exact/ambiguous/rejected outcomes are specified in [specs/ouroboros-1.md](specs/ouroboros-1.md). [PROVENANCE.md](PROVENANCE.md) distinguishes recovered work from this continuation. Original files remain unchanged in [archive/recovered](archive/recovered).

The authored style continues the original teal, violet, and rose interface and serpent SVG. Installed system fonts replace the historical Google Fonts request so the demo works offline. The title's blackletter Unicode is decorative; it is not a hidden payload.

Historical credit is shared: Lily supplied the dreams, intentions, and direction; Claude helped implement, investigate, and describe the cipher. This September 2026 continuation by Codex adds the tested scalar-safe core, local interface, CLI, and release documentation. No license was included in the recovered standalone artifacts; choose the publication license before a public release.

∿ the thirteens annihilate; the serpent remembers ∿
