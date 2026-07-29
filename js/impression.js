// impression.js — Écran "Impression" : choisir combien d'étiquettes
// imprimer par article, puis générer la ou les planches A4 (4×3).

const ImpressionView = (() => {
  const quantities = {}; // articleId -> quantité
  let outletRef = null;
  let articlesRef = [];

  async function render(outlet) {
    outletRef = outlet;
    articlesRef = await DB.getAll(DB.STORES.articles);
    articlesRef.sort((a, b) => a.nom_fr.localeCompare(b.nom_fr, "fr"));

    if (articlesRef.length === 0) {
      outlet.innerHTML = `
        <div class="empty-state">
          <span class="emoticon">[ ▤ ]</span>
          <h2 style="font-size:16px;font-weight:600;color:var(--ink)">Aucun article à imprimer</h2>
          <p style="margin:0;font-size:13.5px;max-width:44ch">Créez d'abord des articles pour pouvoir générer une planche d'étiquettes.</p>
          <a class="btn btn-primary" href="#/articles" style="margin-top:6px;text-decoration:none">Aller aux articles</a>
        </div>
      `;
      return;
    }

    articlesRef.forEach((a) => {
      if (!(a.id in quantities)) quantities[a.id] = 0;
    });

    draw();
  }

  function totalCount() {
    return Object.values(quantities).reduce((s, n) => s + (n || 0), 0);
  }

  function buildInstances() {
    const list = [];
    articlesRef.forEach((a) => {
      const qty = quantities[a.id] || 0;
      for (let i = 0; i < qty; i++) list.push(a);
    });
    return list;
  }

  function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  function rowTemplate(a) {
    const qty = quantities[a.id] || 0;
    return `
      <div style="display:flex;align-items:center;gap:8px">
        <span class="swatch" style="background:${escapeHtml(a.couleur)};flex-shrink:0"></span>
        <span style="flex:1;font-size:13px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(a.nom_fr)}</span>
        <button class="btn" type="button" data-step="-1" data-id="${a.id}" style="padding:4px 10px">−</button>
        <input data-qty="${a.id}" type="number" min="0" value="${qty}" style="width:48px;text-align:center;padding:4px 2px;border:1px solid var(--line-strong);border-radius:var(--radius-sm)" />
        <button class="btn" type="button" data-step="1" data-id="${a.id}" style="padding:4px 10px">+</button>
      </div>
    `;
  }

  function pageTemplate(instances, pageIndex) {
    const cells = instances.map((a) => buildLabelHTML(a)).join("");
    const emptyCount = 12 - instances.length;
    const filler = emptyCount > 0 ? "<div></div>".repeat(emptyCount) : "";
    return `
      <div class="print-sheet"><div class="print-grid">${cells}${filler}</div></div>
      <div class="print-page-label">Planche ${pageIndex + 1}</div>
    `;
  }

  function draw() {
    const outlet = outletRef;
    const total = totalCount();
    const pages = chunk(buildInstances(), 12);

    outlet.innerHTML = `
      <div class="grid" id="impression-layout" style="grid-template-columns:340px 1fr;gap:20px;align-items:start">
        <div class="card">
          <h3 style="font-size:14px;font-weight:600;margin-bottom:4px">Sélection des articles</h3>
          <p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 14px">Indiquez combien d'étiquettes imprimer pour chaque article.</p>

          <div style="display:flex;flex-direction:column;gap:10px;max-height:420px;overflow:auto">
            ${articlesRef.map(rowTemplate).join("")}
          </div>

          <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:10px">
            <div style="font-size:13px;color:var(--ink-soft)">
              <strong style="color:var(--ink)">${total}</strong> étiquette${total > 1 ? "s" : ""} sélectionnée${total > 1 ? "s" : ""}
              — <strong style="color:var(--ink)">${pages.length}</strong> planche${pages.length > 1 ? "s" : ""} A4
            </div>
            <button class="btn btn-primary" id="btn-print" ${total === 0 ? "disabled" : ""}>🖨️ Imprimer</button>
          </div>
        </div>

        <div id="print-area">
          ${
            pages.length === 0
              ? `<div class="empty-state"><p style="margin:0;font-size:13.5px">Sélectionnez au moins un article pour voir l'aperçu de la planche.</p></div>`
              : pages.map(pageTemplate).join("")
          }
        </div>
      </div>
    `;

    outlet.querySelectorAll("[data-qty]").forEach((input) => {
      input.addEventListener("input", (e) => {
        quantities[e.target.dataset.qty] = Math.max(0, parseInt(e.target.value, 10) || 0);
        draw();
      });
    });

    outlet.querySelectorAll("[data-step]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        const delta = Number(e.currentTarget.dataset.step);
        quantities[id] = Math.max(0, (quantities[id] || 0) + delta);
        draw();
      });
    });

    outlet.querySelector("#btn-print")?.addEventListener("click", () => window.print());

    const layout = document.getElementById("impression-layout");
    if (layout && window.innerWidth < 760) {
      layout.style.gridTemplateColumns = "1fr";
    }
  }

  return { render };
})();

window.ImpressionView = ImpressionView;
