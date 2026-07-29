// barcode.js — Générateur de code-barres EAN-13 (SVG), sans dépendance.

const EAN13 = (() => {
  const L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
  const G = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
  const R = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"];
  const PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];

  function checkDigit(digits12) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const d = Number(digits12[i]);
      sum += i % 2 === 0 ? d : d * 3;
    }
    return (10 - (sum % 10)) % 10;
  }

  // Accepte 12 chiffres (calcule la clé) ou 13 (vérifie juste le format). Renvoie null si invalide.
  function normalize(code) {
    const digitsOnly = String(code || "").replace(/\D/g, "");
    if (digitsOnly.length === 13) return digitsOnly;
    if (digitsOnly.length === 12) return digitsOnly + String(checkDigit(digitsOnly));
    return null;
  }

  function pattern(code) {
    const full = normalize(code);
    if (!full) return null;

    const parity = PARITY[Number(full[0])];
    let bits = "101"; // garde de début

    for (let i = 1; i <= 6; i++) {
      const d = Number(full[i]);
      bits += parity[i - 1] === "L" ? L[d] : G[d];
    }

    bits += "01010"; // garde du milieu

    for (let i = 7; i <= 12; i++) {
      bits += R[Number(full[i])];
    }

    bits += "101"; // garde de fin

    return { bits, full };
  }

  function renderSVG(code, { width = 32, height = 9, barColor = "#1c1b19" } = {}) {
    const result = pattern(code);
    if (!result) return "";

    const moduleWidth = width / result.bits.length;
    let rects = "";
    let x = 0;

    for (const bit of result.bits) {
      if (bit === "1") {
        rects += `<rect x="${x.toFixed(3)}" y="0" width="${moduleWidth.toFixed(3)}" height="${height}" fill="${barColor}" />`;
      }
      x += moduleWidth;
    }

    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
  }

  return { renderSVG, normalize };
})();

window.EAN13 = EAN13;
