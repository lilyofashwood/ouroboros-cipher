import { useState, useCallback, useEffect, useRef } from "react";

const SNAKE = "🐍";

// Core cipher functions
const charValue = (c) => c.toUpperCase().charCodeAt(0) - 64; // A=1..Z=26
const isAlpha = (c) => /[a-zA-Z]/.test(c);
const shiftForward = (c, shift) => {
  if (!isAlpha(c)) return c;
  const base = c === c.toUpperCase() ? 65 : 97;
  return String.fromCharCode(((c.toUpperCase().charCodeAt(0) - 65 + shift) % 26) + base);
};
const shiftBackward = (c, shift) => {
  if (!isAlpha(c)) return c;
  const base = c === c.toUpperCase() ? 65 : 97;
  return String.fromCharCode((((c.toUpperCase().charCodeAt(0) - 65 - shift) % 26 + 26) % 26) + base);
};

const getAlpha = (text) => [...text].filter(isAlpha);

function encrypt(plaintext) {
  const alpha = getAlpha(plaintext);
  if (!alpha.length) return plaintext;
  let prev = charValue(alpha[alpha.length - 1]);
  return [...plaintext].map(c => {
    if (!isAlpha(c)) return c;
    const enc = shiftForward(c, prev);
    prev = charValue(c);
    return enc;
  }).join("");
}

function decrypt(ciphertext) {
  const alphaIdx = [];
  [...ciphertext].forEach((c, i) => { if (isAlpha(c)) alphaIdx.push(i); });
  if (!alphaIdx.length) return [ciphertext];
  const solutions = [];
  for (let seed = 1; seed <= 26; seed++) {
    const result = [...ciphertext];
    let prev = seed;
    let lastVal = null;
    for (let i = 0; i < ciphertext.length; i++) {
      if (isAlpha(ciphertext[i])) {
        const dec = shiftBackward(ciphertext[i], prev);
        prev = charValue(dec);
        result[i] = dec;
        if (i === alphaIdx[alphaIdx.length - 1]) lastVal = charValue(dec);
      }
    }
    if (lastVal === seed) solutions.push(result.join(""));
  }
  return solutions;
}

function getChain(plaintext) {
  const alpha = getAlpha(plaintext);
  if (!alpha.length) return [];
  const seed = charValue(alpha[alpha.length - 1]);
  let prev = seed;
  const chain = [];
  for (const c of plaintext) {
    if (isAlpha(c)) {
      const enc = shiftForward(c, prev);
      chain.push({ plain: c, value: charValue(c), shift: prev, result: enc });
      prev = charValue(c);
    }
  }
  return chain;
}

const rot13 = (t) => t.replace(/[a-zA-Z]/g, c => {
  const base = c <= 'Z' ? 65 : 97;
  return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base);
});

// Ouroboros SVG animation
function OuroborosSVG({ size = 120, animated = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="snakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="40" fill="none" stroke="url(#snakeGrad)" strokeWidth="6"
        strokeDasharray="8 4" strokeLinecap="round"
        style={animated ? { animation: "spin 20s linear infinite" } : {}} />
      <circle cx="60" cy="20" r="8" fill="#2dd4bf" />
      <circle cx="56" cy="18" r="1.5" fill="#0f0f0f" />
      <circle cx="64" cy="18" r="1.5" fill="#0f0f0f" />
      <path d="M55 23 L60 28 L65 23" fill="none" stroke="#0f0f0f" strokeWidth="1.2" />
      <circle cx="60" cy="100" r="5" fill="#f472b6" opacity="0.6" />
    </svg>
  );
}

// Glowing text input
function GlowInput({ value, onChange, placeholder, large }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={large ? 4 : 2}
      style={{
        width: "100%",
        background: "#1a1a2e",
        border: "1px solid #2a2a4a",
        borderRadius: 12,
        color: "#e2e8f0",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: large ? 18 : 15,
        padding: "14px 18px",
        outline: "none",
        resize: "vertical",
        transition: "border-color 0.3s, box-shadow 0.3s",
        boxShadow: "0 0 0 0 transparent",
        letterSpacing: 1,
      }}
      onFocus={e => {
        e.target.style.borderColor = "#7c3aed";
        e.target.style.boxShadow = "0 0 20px rgba(124,58,237,0.25)";
      }}
      onBlur={e => {
        e.target.style.borderColor = "#2a2a4a";
        e.target.style.boxShadow = "0 0 0 0 transparent";
      }}
    />
  );
}

function ChainViz({ chain }) {
  if (!chain.length) return null;
  return (
    <div style={{ overflowX: "auto", padding: "12px 0" }}>
      <div style={{ display: "flex", gap: 4, alignItems: "center", minWidth: "max-content" }}>
        {chain.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              background: "linear-gradient(135deg, #1e1b4b, #2a1a4a)",
              border: "1px solid #3b2a6b",
              borderRadius: 10,
              padding: "8px 10px",
              textAlign: "center",
              minWidth: 56,
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 16 }}>{step.plain}</div>
              <div style={{ color: "#64748b", fontSize: 10 }}>val={step.value}</div>
              <div style={{ color: "#f472b6", fontSize: 10 }}>+{step.shift}</div>
              <div style={{ color: "#2dd4bf", fontWeight: 700, fontSize: 16, marginTop: 2 }}>{step.result}</div>
            </div>
            {i < chain.length - 1 && (
              <span style={{ color: "#4a3a6a", fontSize: 14 }}>→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SolutionsList({ solutions, original }) {
  const n = getAlpha(solutions[0] || "").length;
  const isOdd = n % 2 !== 0;
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
      }}>
        <span style={{
          background: isOdd ? "#1a2e1a" : "#2e1a1a",
          color: isOdd ? "#4ade80" : "#fb923c",
          padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
        }}>
          {n} letters ({isOdd ? "odd" : "even"}) → {solutions.length} solution{solutions.length !== 1 ? "s" : ""}
        </span>
        {isOdd && <span style={{ color: "#64748b", fontSize: 11 }}>ROT13 pair</span>}
        {!isOdd && <span style={{ color: "#64748b", fontSize: 11 }}>all 26 seeds valid — math gives up</span>}
      </div>
      <div style={{
        maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3,
        padding: "4px 0",
      }}>
        {solutions.map((s, i) => {
          const isOrig = original && s === original;
          const isTwin = original && s === rot13(original);
          return (
            <div key={i} style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
              padding: "6px 12px", borderRadius: 8,
              background: isOrig ? "rgba(45,212,191,0.1)" : isTwin ? "rgba(244,114,182,0.08)" : "rgba(30,30,50,0.5)",
              border: isOrig ? "1px solid rgba(45,212,191,0.3)" : "1px solid transparent",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ color: "#4a4a6a", fontSize: 11, minWidth: 28 }}>[{i + 1}]</span>
              <span style={{ color: isOrig ? "#2dd4bf" : isTwin ? "#f472b6" : "#94a3b8", letterSpacing: 1 }}>{s}</span>
              {isOrig && <span style={{ color: "#2dd4bf", fontSize: 10, marginLeft: "auto" }}>← original</span>}
              {isTwin && !isOrig && <span style={{ color: "#f472b6", fontSize: 10, marginLeft: "auto" }}>← ROT13 twin</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TAB_STYLE = (active) => ({
  padding: "10px 24px",
  background: active ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "transparent",
  border: active ? "none" : "1px solid #2a2a4a",
  borderRadius: 10,
  color: active ? "#fff" : "#64748b",
  cursor: "pointer",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13,
  fontWeight: active ? 700 : 400,
  transition: "all 0.3s",
  letterSpacing: 0.5,
});

export default function OuroborosCipher() {
  const [tab, setTab] = useState("encode");
  const [encInput, setEncInput] = useState("");
  const [decInput, setDecInput] = useState("");
  const [nestInput, setNestInput] = useState("");
  const [nestDepth, setNestDepth] = useState(3);

  const encResult = encInput ? encrypt(encInput) : "";
  const encChain = encInput ? getChain(encInput) : [];
  const encTwin = encInput ? rot13(encInput) : "";
  const encTwinCt = encTwin ? encrypt(encTwin) : "";

  const decSolutions = decInput ? decrypt(decInput) : [];

  // Nesting
  const nestResults = (() => {
    if (!nestInput) return [];
    const results = [{ depth: 0, text: nestInput }];
    let current = nestInput;
    for (let i = 1; i <= nestDepth; i++) {
      current = encrypt(current);
      results.push({ depth: i, text: current });
    }
    return results;
  })();

  // Fixed point search (just for display)
  const [fpSearch, setFpSearch] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e2e8f0",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');
        @keyframes spin { from { transform-origin: 60px 60px; transform: rotate(0deg); } to { transform-origin: 60px 60px; transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%, 100% { text-shadow: 0 0 10px rgba(124,58,237,0.3); } 50% { text-shadow: 0 0 25px rgba(124,58,237,0.6); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #2a2a4a; border-radius: 3px; }
        textarea::-webkit-scrollbar { width: 4px; }
      `}</style>

      {/* Header */}
      <div style={{
        textAlign: "center", padding: "40px 20px 20px",
        background: "radial-gradient(ellipse at top, rgba(124,58,237,0.08) 0%, transparent 60%)",
      }}>
        <OuroborosSVG size={100} animated />
        <h1 style={{
          fontSize: 28, fontWeight: 700, margin: "16px 0 4px",
          background: "linear-gradient(135deg, #2dd4bf, #a78bfa, #f472b6)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          animation: "glow 3s ease-in-out infinite",
          letterSpacing: 2,
        }}>
          THE OUROBOROS CIPHER
        </h1>
        <p style={{ color: "#64748b", fontSize: 12, letterSpacing: 3, margin: 0 }}>
          THE MESSAGE IS THE KEY · THE END IS THE BEGINNING
        </p>
        <p style={{ color: "#4a4a6a", fontSize: 10, marginTop: 6, fontStyle: "italic" }}>
          Dreamed by M. · Built with Claude · February 2026
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: "16px 20px", flexWrap: "wrap" }}>
        {[
          ["encode", "Encode"],
          ["decode", "Decode"],
          ["twin", "ROT13 Twin"],
          ["nest", "Nesting"],
        ].map(([key, label]) => (
          <button key={key} style={TAB_STYLE(tab === key)} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "8px 20px 60px" }}>

        {tab === "encode" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <label style={{ color: "#a78bfa", fontSize: 11, letterSpacing: 2, display: "block", marginBottom: 8 }}>
              PLAINTEXT
            </label>
            <GlowInput value={encInput} onChange={setEncInput} placeholder="Type a message..." large />

            {encResult && (
              <>
                <div style={{ marginTop: 20 }}>
                  <label style={{ color: "#2dd4bf", fontSize: 11, letterSpacing: 2, display: "block", marginBottom: 8 }}>
                    CIPHERTEXT
                  </label>
                  <div style={{
                    background: "#1a1a2e", border: "1px solid #2a4a4a", borderRadius: 12,
                    padding: "14px 18px", fontSize: 18, letterSpacing: 2, color: "#2dd4bf",
                    fontWeight: 600,
                  }}>
                    {encResult}
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <label style={{ color: "#64748b", fontSize: 11, letterSpacing: 2, display: "block", marginBottom: 8 }}>
                    ENCRYPTION CHAIN {SNAKE}
                  </label>
                  <ChainViz chain={encChain} />
                </div>

                <div style={{
                  marginTop: 16, padding: "12px 16px", borderRadius: 10,
                  background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.15)",
                  fontSize: 12, color: "#94a3b8",
                }}>
                  <div><span style={{ color: "#a78bfa" }}>Alpha length:</span> {getAlpha(encInput).length} ({getAlpha(encInput).length % 2 ? "odd → 2 solutions" : "even → 26 solutions"})</div>
                  <div><span style={{ color: "#a78bfa" }}>Seed:</span> '{getAlpha(encInput).slice(-1)[0]}' = {charValue(getAlpha(encInput).slice(-1)[0])}</div>
                  <div style={{ marginTop: 4 }}><span style={{ color: "#f472b6" }}>ROT13 twin:</span> <span style={{ color: "#f472b6", letterSpacing: 1 }}>{encTwin}</span></div>
                  <div><span style={{ color: "#f472b6" }}>Twin encrypts to:</span> <span style={{ color: "#2dd4bf", letterSpacing: 1 }}>{encTwinCt}</span> {encResult === encTwinCt ? "✓ identical" : "✗ mismatch"}</div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "decode" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <label style={{ color: "#2dd4bf", fontSize: 11, letterSpacing: 2, display: "block", marginBottom: 8 }}>
              CIPHERTEXT
            </label>
            <GlowInput value={decInput} onChange={setDecInput} placeholder="Paste ciphertext..." large />
            {decSolutions.length > 0 && <SolutionsList solutions={decSolutions} />}
            {decInput && decSolutions.length === 0 && (
              <div style={{ color: "#fb923c", marginTop: 12, fontSize: 13 }}>
                No valid ouroboros loops found. Check your ciphertext.
              </div>
            )}
          </div>
        )}

        {tab === "twin" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <label style={{ color: "#f472b6", fontSize: 11, letterSpacing: 2, display: "block", marginBottom: 8 }}>
              ENTER ANY MESSAGE
            </label>
            <GlowInput value={encInput} onChange={setEncInput} placeholder="Type anything..." large />
            {encInput && (
              <div style={{ marginTop: 20 }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
                }}>
                  <div style={{
                    background: "#1a1a2e", border: "1px solid #3b2a6b", borderRadius: 12, padding: 16,
                  }}>
                    <div style={{ color: "#a78bfa", fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>ORIGINAL</div>
                    <div style={{ color: "#e2e8f0", fontSize: 16, letterSpacing: 1, wordBreak: "break-all" }}>{encInput}</div>
                    <div style={{ marginTop: 12, color: "#64748b", fontSize: 10, letterSpacing: 2 }}>ENCRYPTS TO</div>
                    <div style={{ color: "#2dd4bf", fontSize: 14, letterSpacing: 1, marginTop: 4, wordBreak: "break-all" }}>{encResult}</div>
                  </div>
                  <div style={{
                    background: "#1a1a2e", border: "1px solid #4a1a3a", borderRadius: 12, padding: 16,
                  }}>
                    <div style={{ color: "#f472b6", fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>ROT13 TWIN</div>
                    <div style={{ color: "#e2e8f0", fontSize: 16, letterSpacing: 1, wordBreak: "break-all" }}>{encTwin}</div>
                    <div style={{ marginTop: 12, color: "#64748b", fontSize: 10, letterSpacing: 2 }}>ENCRYPTS TO</div>
                    <div style={{ color: "#2dd4bf", fontSize: 14, letterSpacing: 1, marginTop: 4, wordBreak: "break-all" }}>{encTwinCt}</div>
                  </div>
                </div>
                <div style={{
                  textAlign: "center", marginTop: 16, padding: "10px 16px",
                  background: encResult === encTwinCt ? "rgba(45,212,191,0.08)" : "rgba(251,146,60,0.08)",
                  border: `1px solid ${encResult === encTwinCt ? "rgba(45,212,191,0.2)" : "rgba(251,146,60,0.2)"}`,
                  borderRadius: 10, fontSize: 13,
                  color: encResult === encTwinCt ? "#2dd4bf" : "#fb923c",
                }}>
                  {encResult === encTwinCt
                    ? `${SNAKE} Identical ciphertext. The thirteens annihilate. 13+13=26≡0`
                    : "Mismatch — this shouldn't happen!"}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "nest" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <label style={{ color: "#fb923c", fontSize: 11, letterSpacing: 2, display: "block", marginBottom: 8 }}>
              MESSAGE TO NEST-ENCRYPT
            </label>
            <GlowInput value={nestInput} onChange={setNestInput} placeholder="What happens when the snake eats itself repeatedly?" />
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ color: "#64748b", fontSize: 12 }}>Depth:</label>
              <input type="range" min={1} max={26} value={nestDepth} onChange={e => setNestDepth(+e.target.value)}
                style={{ flex: 1, accentColor: "#a78bfa" }} />
              <span style={{ color: "#a78bfa", fontWeight: 600, minWidth: 24, textAlign: "right" }}>{nestDepth}</span>
            </div>

            {nestResults.length > 1 && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                {nestResults.map((r, i) => {
                  const isOriginal = i === 0;
                  const matchesOriginal = !isOriginal && r.text === nestResults[0].text;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 12px", borderRadius: 8,
                      background: matchesOriginal ? "rgba(45,212,191,0.1)" : isOriginal ? "rgba(167,139,250,0.08)" : "rgba(30,30,50,0.5)",
                      border: matchesOriginal ? "1px solid rgba(45,212,191,0.3)" : "1px solid transparent",
                    }}>
                      <span style={{
                        color: isOriginal ? "#a78bfa" : matchesOriginal ? "#2dd4bf" : "#4a4a6a",
                        fontSize: 11, minWidth: 60,
                      }}>
                        {isOriginal ? "plain" : `×${i}`}
                      </span>
                      <span style={{
                        color: isOriginal ? "#e2e8f0" : matchesOriginal ? "#2dd4bf" : "#94a3b8",
                        fontSize: 14, letterSpacing: 1, fontWeight: matchesOriginal ? 700 : 400,
                        wordBreak: "break-all",
                      }}>
                        {r.text}
                      </span>
                      {matchesOriginal && (
                        <span style={{ color: "#2dd4bf", fontSize: 10, marginLeft: "auto", whiteSpace: "nowrap" }}>
                          {SNAKE} CYCLE! Period={i}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Theorem box */}
        <div style={{
          marginTop: 40, padding: "20px 24px", borderRadius: 14,
          background: "linear-gradient(135deg, rgba(30,27,75,0.6), rgba(42,26,74,0.4))",
          border: "1px solid #3b2a6b",
        }}>
          <div style={{ color: "#a78bfa", fontSize: 11, letterSpacing: 3, marginBottom: 10 }}>
            THE OUROBOROS THEOREM
          </div>
          <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7 }}>
            <span style={{ color: "#2dd4bf" }}>encrypt(ROT13(P)) = encrypt(P)</span> for all P.
            Each step sums two consecutive values; ROT13 adds 13 to both; 13+13=26≡0 mod 26.
            The symmetry is <span style={{ color: "#f472b6" }}>ineradicable</span>.
          </div>
          <div style={{ color: "#64748b", fontSize: 12, marginTop: 10 }}>
            Odd length → 2 solutions (ROT13 pair) · Even length → 26 solutions (constraint collapses)
          </div>
        </div>
      </div>
    </div>
  );
}
