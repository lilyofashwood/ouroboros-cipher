(function () {
  "use strict";
  let mode = "encode";
  const input = document.querySelector("#input");
  const result = document.querySelector("#result");
  const status = document.querySelector("#status");
  const depth = document.querySelector("#depth");
  const node = (tag, text, className) => { const element = document.createElement(tag); element.textContent = text; if (className) element.className = className; return element; };
  function render() {
    result.replaceChildren();
    document.querySelector("#input-label").textContent = mode === "decode" ? "Ciphertext" : "Plaintext";
    document.querySelector("#depth-control").hidden = mode !== "nest";
    document.querySelector("#depth-value").textContent = depth.value;
    try {
      const text = input.value;
      if (text.length > 20_000) throw new Error("This visual demo supports up to 20,000 UTF-16 units; use the local core for larger inputs.");
      if (mode === "decode") {
        const decoded = Ouroboros.decode(text);
        status.textContent = `${decoded.status.toUpperCase()} · ${decoded.letterCount} ASCII letters · ${decoded.candidates.length} valid reading${decoded.candidates.length === 1 ? "" : "s"}`;
        const list = node("ol", "", "solutions");
        for (const candidate of decoded.candidates) { const item = node("li", ""); item.append(node("small", candidate.seed === null ? "Unchanged nonletter text" : `Closure seed ${candidate.seed}`), document.createTextNode(candidate.text)); list.append(item); }
        result.append(list);
        if (!decoded.candidates.length) result.append(node("p", "No seed closes this ring. The ciphertext may be malformed or altered.", "output"));
      } else if (mode === "nest") {
        const layers = Ouroboros.nest(text, Number(depth.value));
        const list = node("ol", "", "solutions");
        layers.forEach((value, index) => { const item = node("li", ""); item.append(node("small", index ? `Pass ${index}${value === text ? " · returned to the original" : ""}` : "Original"), document.createTextNode(value)); list.append(item); });
        result.append(list); status.textContent = "Repeated forward transforms. Nesting does not resolve decoder ambiguity.";
      } else {
        const encrypted = Ouroboros.encrypt(text);
        const twin = Ouroboros.rot13(text);
        result.append(node("div", mode === "twin" ? twin : encrypted, "output"));
        const chain = Ouroboros.getChain(text);
        status.textContent = chain.length ? `${chain.length} ASCII letters · last-letter seed ${chain[0].shift} · ${chain.length % 2 ? "2" : "26"} valid readings · ROT13 twin shares this ciphertext` : "No ASCII letters: all text is preserved unchanged.";
        if (mode === "twin") result.append(node("p", `Both encrypt to: ${encrypted}`, "output"));
        else { const display = node("div", "", "chain"); for (const step of chain.slice(0, 150)) { const item = node("div", "", "step"); item.append(node("strong", step.plain), node("small", `+${step.shift}`), node("b", step.result)); display.append(item); } result.append(display); if (chain.length > 150) result.append(node("p", "Showing the first 150 chain steps; ciphertext above is complete.")); }
      }
    } catch (error) { status.textContent = `Rejected: ${error.message}`; }
  }
  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { mode = button.dataset.mode; document.querySelectorAll("[data-mode]").forEach((other) => other.setAttribute("aria-pressed", String(other === button))); render(); }));
  input.addEventListener("input", render); depth.addEventListener("input", render); render();
})();
