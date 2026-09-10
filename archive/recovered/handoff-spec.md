# Ouroboros · recovered implementation

Primary source: sources/ouroboros/ouroboros-cipher.tsx. This is executable cipher logic inside a React UI, not merely the earlier conceptual “recursive puzzle-object” description.

- Operates on ASCII A–Z/a–z, with A=1 through Z=26.
- Seeds the first Caesar shift with the value of the last plaintext letter.
- Each subsequent letter is shifted by the value of the previous plaintext letter, closing the ring.
- Preserves letter case and passes nonletters through during encoding.
- Decoding tries seeds 1–26, reconstructs the chain, and keeps candidates whose final plaintext value equals the seed.
- The UI exposes the chain and multiple solutions. For valid encodings, odd-length letter rings produce a ROT13 pair; even-length rings have 26 candidates. Preserve ambiguity instead of silently selecting the original.
- Static inspection found mixed indexing in decrypt: the buffer/alpha positions use spread code points while its loop indexes the original string by UTF-16 code units. Non-BMP carrier punctuation/emoji should be tested and this mismatch resolved before claiming Unicode preservation.
- The implementation includes the visual interface and an Ouroboros SVG. There is no complete package/build scaffold in this recovered single file.

Destination observed: https://github.com/lilyofashwood/ouroboros-cipher, public and empty on 2026-09-10. Preserve the recovered implementation, extract a tested core and publish a runnable app. This is an artistic classical cipher with multiple valid readings; its name is not a promise of modern cryptographic confidentiality.
