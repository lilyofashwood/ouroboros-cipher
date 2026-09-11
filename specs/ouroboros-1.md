# Ouroboros / recovered ring format 1

This identifier documents the recovered unframed algorithm; no version prefix is added to historical ciphertext. Core version 1.1.0 fixes implementation behavior without changing ASCII wire outputs.

## Alphabet and scalar contract

Only ASCII A-Z and a-z participate. Let each letter value be in 1..26. The first letter's previous value is the last plaintext letter's value. Each subsequent previous value comes from the preceding plaintext letter. Add that value using a 26-letter Caesar shift. Preserve the plaintext letter's case.

Every other Unicode scalar passes through at the same scalar position. Text is not normalized: decomposed `e + U+0301` has an ASCII e in the ring, whereas precomposed é does not. Emoji ZWJ sequences, variation selectors and existing combining marks are retained exactly. Isolated UTF-16 surrogate units are rejected. Nonletters do not advance the key chain.

Example: HELLO uses previous values 15, 8, 5, 12, 12 and produces WMQXA.

## Decode and ambiguity

Try every seed in 1..26. Subtract the running previous value from each ASCII ciphertext letter; update the previous value from the decoded letter. Retain a candidate only if its final letter value equals the assumed seed. Emit candidates ordered by seed.

- No participating letters: `exact`, one unchanged text, seed null.
- One or more candidates: `ambiguous`, all candidates returned. Valid odd rings have exactly two candidates; valid even rings have 26.
- Zero candidates: `rejected`. Parity alone never proves a supplied ciphertext valid.

The original ROT13 theorem follows because adding 13 to both consecutive plaintext values adds 26 to the cipher sum, leaving the ciphertext unchanged modulo 26. Even rings admit an alternating offset across all 26 seeds; odd rings require twice that offset to vanish, leaving the offsets 0 and 13.

## Transport and interpretation

The ring is keyless and unframed: the source supplies its own shifts. Editing, normalizing or losing an ASCII letter changes the ring; nonletters pass through without integrity checking. Multiple encryption passes retain multiple readings on decoding. The decoder supplies the full candidate set, and human or model interpretation selects among those readings. The format includes no checksum or authentication.

This continuation fixes the recovered TSX decoder's UTF-16/code-point indexing mismatch and avoids Python `.isalpha()` treating non-ASCII letters as members of a 26-letter alphabet. Original artifacts remain unmodified as historical evidence.
