// articles.js — Écran "Articles" : liste, création, modification, duplication.
// Toutes les données transitent par DB (IndexedDB, voir db.js).

const ARTICLE_COLORS = [
  { key: "thon", label: "Bleu (Thon)", hex: "#3F7EA6" },
  { key: "gouda", label: "Jaune (Gouda)", hex: "#E8B23D" },
  { key: "dinde", label: "Brun (Dinde)", hex: "#A9764F" },
  { key: "piquant", label: "Violet (Piquant)", hex: "#4A4785" },
  { key: "andalouse", label: "Orange (Andalouse)", hex: "#D9603B" },
];

const DEFAULT_ALLERGENES_FR = "produit dans un atelier qui utilise tous les allergènes.";
const DEFAULT_ALLERGENES_NL = "geproduceerd in een werkplaats waar alle allergenen aanwezig zijn.";
const DEFAULT_CONSERVATION = "TENIR AU FRAIS / KOEL BEWAREN (0-4°C)";
const CATEGORIES = ["Sandwich", "Club", "Wrap", "Salade", "Autre"];

function blankArticle() {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    nom_fr: "",
    nom_nl: "",
    sous_titre_fr: "",
    sous_titre_nl: "",
    categorie: CATEGORIES[0],
    couleur: ARTICLE_COLORS[0].hex,
    halal: false,
    poids_gr: "",
    conservation: DEFAULT_CONSERVATION,
    ingredients_fr: "",
    ingredients_nl: "",
    allergenes_fr: DEFAULT_ALLERGENES_FR,
    allergenes_nl: DEFAULT_ALLERGENES_NL,
    energie_kj: "",
    energie_kcal: "",
    lipides_g: "",
    satures_g: "",
    sucres_g: "",
    sel_g: "",
    ean: "",
    actif: true,
    created_at: now,
    updated_at: now,
  };
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

const ArticlesView = (() => {
  let mode = "liste"; // "liste" | "formulaire"
  let editingId = null;
  let searchTerm = "";
  let outletRef = null;

  // Point d'entrée appelé par le routeur : toujours la liste.
  async function render(outlet) {
    outletRef = outlet;
    mode = "liste";
    editingId = null;
    await renderList(outlet);
  }

  async function renderList(outlet) {
    const all = await DB.getAll(DB.STORES.articles);
    all.sort((a, b) => a.nom_fr.localeCompare(b.nom_fr, "fr"));

    const filtered = searchTerm
      ? all.filter((a) =>
          `${a.nom_fr} ${a.nom_nl} ${a.categorie}`.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : all;

    outlet.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px;flex-wrap:wrap">
        <input type="search" id="article-search" placeholder="Rechercher un article…" value="${escapeHtml(searchTerm)}"
          style="flex:1;min-width:220px;max-width:340px;padding:8px 12px;border:1px solid var(--line-strong);border-radius:var(--radius-sm);font-size:13.5px" />
        <button class="btn btn-primary" data-action="nouveau">+ Nouvel article</button>
      </div>

      ${
        all.length === 0
          ? `<div class="empty-state">
              <span class="emoticon">}&lt;(((°&gt;</span>
              <h2 style="font-size:16px;font-weight:600;color:var(--ink)">Aucun article pour l'instant</h2>
              <p style="margin:0;font-size:13.5px;max-width:44ch">Créez votre premier article pour commencer à générer des étiquettes.</p>
              <button class="btn btn-primary" data-action="nouveau" style="margin-top:6px">+ Nouvel article</button>
            </div>`
          : filtered.length === 0
          ? `<div class="empty-state"><p style="margin:0;font-size:13.5px">Aucun résultat pour « ${escapeHtml(searchTerm)} ».</p></div>`
          : `<div class="card" style="padding:0;overflow:auto">
              <table style="width:100%;border-collapse:collapse;font-size:13.5px">
                <thead>
                  <tr style="text-align:left;border-bottom:1px solid var(--line)">
                    <th style="padding:12px 16px;width:24px"></th>
                    <th style="padding:12px 16px">Article</th>
                    <th style="padding:12px 16px">Catégorie</th>
                    <th style="padding:12px 16px">Poids</th>
                    <th style="padding:12px 16px">EAN</th>
                    <th style="padding:12px 16px">Statut</th>
                    <th style="padding:12px 16px"></th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map(rowTemplate).join("")}
                </tbody>
              </table>
            </div>`
      }
    `;

    outlet.querySelector("#article-search")?.addEventListener("input", (e) => {
      searchTerm = e.target.value;
      renderList(outlet);
    });

    outlet.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", onListAction));
  }

  function rowTemplate(a) {
    return `
      <tr style="border-bottom:1px solid var(--line)">
        <td style="padding:12px 16px"><span class="swatch" style="background:${escapeHtml(a.couleur)}"></span></td>
        <td style="padding:12px 16px">
          <div style="font-weight:600">${escapeHtml(a.nom_fr) || "(sans nom)"}</div>
          <div style="color:var(--ink-soft);font-size:12.5px">${escapeHtml(a.nom_nl)}</div>
        </td>
        <td style="padding:12px 16px">${escapeHtml(a.categorie)}${a.halal ? ' <span class="badge">Halal</span>' : ""}</td>
        <td style="padding:12px 16px;font-family:var(--font-mono)">${a.poids_gr ? escapeHtml(a.poids_gr) + " g" : "—"}</td>
        <td style="padding:12px 16px;font-family:var(--font-mono)">${escapeHtml(a.ean) || "—"}</td>
        <td style="padding:12px 16px"><span class="badge" style="${a.actif ? "" : "opacity:.6"}">${a.actif ? "Actif" : "Inactif"}</span></td>
        <td style="padding:12px 16px;white-space:nowrap;text-align:right">
          <button class="btn" data-action="modifier" data-id="${a.id}">Modifier</button>
          <button class="btn" data-action="dupliquer" data-id="${a.id}">Dupliquer</button>
          <button class="btn" data-action="supprimer" data-id="${a.id}" style="color:var(--danger)">Supprimer</button>
        </td>
      </tr>
    `;
  }

  async function onListAction(e) {
    const action = e.currentTarget.dataset.action;
    const id = e.currentTarget.dataset.id;

    if (action === "nouveau") {
      editingId = null;
      mode = "formulaire";
      await renderForm(outletRef);
    } else if (action === "modifier") {
      editingId = id;
      mode = "formulaire";
      await renderForm(outletRef);
    } else if (action === "dupliquer") {
      const original = await DB.get(DB.STORES.articles, id);
      if (!original) return;
      const now = Date.now();
      const copy = { ...original, id: crypto.randomUUID(), nom_fr: `${original.nom_fr} (copie)`, created_at: now, updated_at: now };
      await DB.put(DB.STORES.articles, copy);
      await renderList(outletRef);
    } else if (action === "supprimer") {
      const article = await DB.get(DB.STORES.articles, id);
      if (article && confirm(`Supprimer « ${article.nom_fr} » ? Cette action est définitive.`)) {
        await DB.delete(DB.STORES.articles, id);
        await renderList(outletRef);
      }
    }
  }

  async function renderForm(outlet) {
    const article = editingId ? await DB.get(DB.STORES.articles, editingId) : blankArticle();
    const isNew = !editingId;
    const isPreset = ARTICLE_COLORS.some((c) => c.hex.toLowerCase() === (article.couleur || "").toLowerCase());

    outlet.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">
        <button class="btn" data-action="retour">← Retour</button>
        <h2 style="font-size:17px;font-weight:600">${isNew ? "Nouvel article" : "Modifier l'article"}</h2>
      </div>

      <form id="article-form" style="display:flex;flex-direction:column;gap:16px;max-width:880px">

        <div class="card">
          <h3 style="font-size:14px;font-weight:600;margin-bottom:14px">Identité</h3>
          <div class="form-grid-2">
            <label class="field"><span>Nom (FR) *</span><input required name="nom_fr" value="${escapeHtml(article.nom_fr)}" placeholder="Ex. Thon" /></label>
            <label class="field"><span>Naam (NL) *</span><input required name="nom_nl" value="${escapeHtml(article.nom_nl)}" placeholder="Ex. Tonijn" /></label>
            <label class="field"><span>Sous-titre (FR)</span><input name="sous_titre_fr" value="${escapeHtml(article.sous_titre_fr)}" placeholder="Ex. salade + tomates" /></label>
            <label class="field"><span>Ondertitel (NL)</span><input name="sous_titre_nl" value="${escapeHtml(article.sous_titre_nl)}" placeholder="Ex. sla + tomaten" /></label>
            <label class="field"><span>Catégorie</span>
              <select name="categorie">
                ${CATEGORIES.map((c) => `<option ${article.categorie === c ? "selected" : ""}>${c}</option>`).join("")}
              </select>
            </label>
            <label class="field"><span>Poids (gr) *</span><input required type="number" min="0" name="poids_gr" value="${escapeHtml(article.poids_gr)}" /></label>
            <label class="field"><span>Code-barres (EAN)</span><input name="ean" value="${escapeHtml(article.ean)}" style="font-family:var(--font-mono)" /></label>
            <label class="field"><span>Conservation</span><input name="conservation" value="${escapeHtml(article.conservation)}" /></label>
          </div>

          <div style="display:flex;align-items:center;gap:20px;margin-top:14px;flex-wrap:wrap">
            <label style="display:flex;align-items:center;gap:8px;font-size:13.5px">
              <input type="checkbox" name="halal" ${article.halal ? "checked" : ""} /> Base d'ingrédients HALAL
            </label>
            <label style="display:flex;align-items:center;gap:8px;font-size:13.5px">
              <input type="checkbox" name="actif" ${article.actif ? "checked" : ""} /> Article actif
            </label>
          </div>

          <div style="margin-top:14px">
            <span style="font-size:12.5px;color:var(--ink-soft);display:block;margin-bottom:8px">Couleur de l'étiquette</span>
            <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
              ${ARTICLE_COLORS.map((c) => `
                <label style="display:flex;align-items:center;gap:6px;font-
