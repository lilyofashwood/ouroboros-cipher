(function (root) {
  "use strict";
  // Presentation-only voices from Lily's Font Garden: chaos-noodle-II,
  // MonoTerminal, GlassTheorem Double-Struck and Lacepath Script.
  // Never apply these maps to cipher inputs, outputs or protocol examples.
  const script = [..."𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏"];
  function lettering(text, voice = "house") {
    return text.replace(/[A-Za-z]/g, (letter) => {
      const lower = letter.toLowerCase(), offset = lower.charCodeAt(0) - 97;
      if (voice === "mono") return String.fromCodePoint(0x1D68A + offset);
      if (voice === "double") return String.fromCodePoint(0x1D552 + offset);
      if (voice === "script") return script[offset];
      return String.fromCodePoint(("aeiou".includes(lower) ? 0x1D41A : 0x1D5BA) + offset);
    });
  }
  function dress(element) {
    const document = element.ownerDocument;
    const walker = document.createTreeWalker(element, 4); // SHOW_TEXT
    const pending = [];
    while (walker.nextNode()) {
      const text = walker.currentNode;
      if (!/[A-Za-z]/.test(text.data) || text.parentElement.closest("script,style,code,pre,textarea,input,output,.literal,.sr-only,.voice-visible,[aria-hidden=true]")) continue;
      pending.push(text);
    }
    for (const text of pending) {
      const voice = text.parentElement.closest("[data-voice]")?.dataset.voice || "house";
      const visible = document.createElement("span"), accessible = document.createElement("span");
      visible.className = "voice-visible";
      visible.setAttribute("aria-hidden", "true");
      visible.textContent = lettering(text.data, voice);
      accessible.className = "sr-only";
      accessible.textContent = text.data;
      text.replaceWith(visible, accessible);
    }
  }
  const api = Object.freeze({ lettering, dress });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.OuroborosTypography = api;
})(globalThis);
