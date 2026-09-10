#!/usr/bin/env python3
"""
🐍 THE OUROBOROS CIPHER 🐍
Enigma Caesar with Circular Autokey
Designed by Lily of Ashwood in a dream, February 2026

The message IS the key. The last letter seeds the first.
Each plaintext letter shifts the next. The snake eats its tail.

RULES:
  - A=1, B=2, ... Z=26 (1-indexed, not 0)
  - Each letter is shifted forward by the PREVIOUS plaintext letter's value
  - The "previous" of the first letter = the LAST letter (ouroboros closure)
  - Non-alpha characters pass through unchanged; case preserved

THE OUROBOROS THEOREM:
  encrypt(ROT13(P)) = encrypt(P) for ALL plaintexts P.

  Proof: Each Cᵢ = Pᵢ + P(i-1) mod 26. ROT13 adds 13 to both terms,
  and 13+13 = 26 ≡ 0. The cipher has an inherent Z₂ symmetry under ROT13.

  Corollary 1: Odd-length messages → exactly 2 valid decryptions (ROT13 pair)
  Corollary 2: Even-length messages → ALL 26 seeds valid (constraint vanishes)
"""

def char_value(c):
    """A=1, B=2, ... Z=26"""
    return ord(c.upper()) - ord('A') + 1

def shift_forward(c, shift):
    if not c.isalpha():
        return c
    base = ord('A') if c.isupper() else ord('a')
    return chr((ord(c.upper()) - ord('A') + shift) % 26 + base)

def shift_backward(c, shift):
    if not c.isalpha():
        return c
    base = ord('A') if c.isupper() else ord('a')
    return chr((ord(c.upper()) - ord('A') - shift) % 26 + base)

def get_alpha_chars(text):
    return [c for c in text if c.isalpha()]

def encrypt(plaintext):
    """Encrypt: last letter's value seeds the first, each plaintext letter shifts the next."""
    alpha = get_alpha_chars(plaintext)
    if not alpha:
        return plaintext
    seed = char_value(alpha[-1])
    result = []
    prev_shift = seed
    for c in plaintext:
        if c.isalpha():
            enc = shift_forward(c, prev_shift)
            prev_shift = char_value(c)
            result.append(enc)
        else:
            result.append(c)
    return ''.join(result)

def decrypt(ciphertext):
    """Try all 26 seeds. The ouroboros constraint filters: recovered last letter must equal assumed seed."""
    alpha_indices = [i for i, c in enumerate(ciphertext) if c.isalpha()]
    if not alpha_indices:
        return [ciphertext]
    solutions = []
    for candidate_seed in range(1, 27):
        result = list(ciphertext)
        prev_shift = candidate_seed
        last_plain_value = None
        for i in range(len(ciphertext)):
            c = ciphertext[i]
            if c.isalpha():
                dec = shift_backward(c, prev_shift)
                prev_shift = char_value(dec)
                result[i] = dec
                if i == alpha_indices[-1]:
                    last_plain_value = char_value(dec)
        if last_plain_value == candidate_seed:
            solutions.append(''.join(result))
    return solutions

def decrypt_smart(ciphertext):
    """Use the theorem: odd-length → 2 solutions (ROT13 pair), even-length → all 26."""
    alpha = get_alpha_chars(ciphertext)
    n = len(alpha)
    if n == 0:
        return [ciphertext]
    if n % 2 == 0:
        return decrypt(ciphertext)
    else:
        for s in range(1, 27):
            result = list(ciphertext)
            prev = s
            last_val = None
            for i in range(len(ciphertext)):
                c = ciphertext[i]
                if c.isalpha():
                    dec = shift_backward(c, prev)
                    prev = char_value(dec)
                    result[i] = dec
                    last_val = char_value(dec)
            if last_val == s:
                sol1 = ''.join(result)
                sol2 = rot13(sol1)
                return [sol1, sol2]
        return []

def rot13(text):
    return text.translate(str.maketrans(
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm'))

def twin(plaintext):
    """Find the ROT13 twin that shares the same ciphertext."""
    r = rot13(plaintext)
    assert encrypt(plaintext) == encrypt(r), "Theorem violated!"
    return r

def analyze(plaintext):
    """Full chain analysis with theorem verification."""
    alpha = get_alpha_chars(plaintext)
    if not alpha:
        return
    n = len(alpha)
    seed = char_value(alpha[-1])
    parity = "odd" if n % 2 else "even"
    expected = 2 if n % 2 else 26
    print(f"🐍 OUROBOROS ANALYSIS")
    print(f"{'═' * 55}")
    print(f"  Plaintext  : {plaintext}")
    print(f"  Alpha len  : {n} ({parity}) → {expected} solutions expected")
    print(f"  Seed       : '{alpha[-1]}' = {seed}")
    print(f"{'─' * 55}")
    prev_shift = seed
    cipher_chars = []
    for c in plaintext:
        if c.isalpha():
            enc = shift_forward(c, prev_shift)
            print(f"  {c:>7} val={char_value(c):>2}  shift={prev_shift:>2}  → {enc}")
            prev_shift = char_value(c)
            cipher_chars.append(enc)
        else:
            cipher_chars.append(c)
    ct = ''.join(cipher_chars)
    print(f"{'─' * 55}")
    print(f"  Ciphertext : {ct}")
    solutions = decrypt(ct)
    print(f"  Solutions  : {len(solutions)} {'✓' if len(solutions) == expected else '✗'}")
    if n % 2:
        for s in solutions:
            tag = "original" if s == plaintext else "ROT13 twin"
            print(f"    → {s}  ({tag})")


if __name__ == "__main__":
    print("🐍" * 25)
    print("  THE OUROBOROS CIPHER")
    print("  The message is the key. The end is the beginning.")
    print("  Dreamed by Lily of Ashwood, February 2026")
    print("🐍" * 25)
    print()
    for pt in ["HELLO", "The Temple shifts", "OUROBOROS", "the snake eats its tail"]:
        analyze(pt)
        print()
    print("═" * 55)
    msg = "the snake eats its tail"
    print(f"  Message    : {msg}")
    print(f"  ROT13 twin : {twin(msg)}")
    print(f"  Both encrypt to: {encrypt(msg)}")
    print(f"  Verified: {encrypt(msg) == encrypt(twin(msg))} 🐍")
