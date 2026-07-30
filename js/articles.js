// articles.js — Écran "Articles" : liste, création, modification, duplication.
// Toutes les données transitent par DB (IndexedDB, voir db.js).

const ARTICLE_COLORS = [
  { key: "thon", label: "Bleu (Thon)", hex: "#3F7EA6" },
  { key: "gouda", label: "Jaune (Gouda)", hex: "#E8B23D" },
  { key: "dinde", label: "Brun (Dinde)", hex: "#A9764F" },
  { key: "piquant", label: "Violet (Piquant)", hex: "#4A4785" },
  { key: "andalouse", label: "Orange (Andalouse)", hex: "#D9603B" },
  { key: "boeuf", label: "Rouge (Bœuf)", hex: "#C23B32" },
];

const DEFAULT_ALLERGENES_FR = "produit dans un atelier qui utilise tous les allergènes.";
const DEFAULT_ALLERGENES_AR = "منتج مُصنّع في ورشة تُستخدم فيها جميع مسببات الحساسية.";
const DEFAULT_CONSERVATION = "TENIR AU FRAIS (0-4°C)";
const CATEGORIES = ["Sandwich", "Club", "Wrap", "Salade", "Autre"];

function blankArticle() {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    nom_fr: "",
    nom_ar: "",
    sous_titre_fr: "",
    sous_titre_ar: "",
    categorie: CATEGORIES[0],
    couleur: ARTICLE_COLORS[0].hex,
    icone_entete: "",
    halal: false,
    poids_gr: "",
    conservation: DEFAULT_CONSERVATION,
    ingredients_fr: "",
    ingredients_ar: "",
    allergenes_fr: DEFAULT_ALLERGENES_FR,
    allergenes_ar: DEFAULT_ALLERGENES_AR,
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

function resizeImageToDataURL(file, maxSize = 240) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
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
          `${a.nom_fr} ${a.nom_ar} ${a.categorie}`.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div dir="rtl" style="color:var(--ink-soft);font-size:12.5px">${escapeHtml(a.nom_ar)}</div>
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
            <label class="field"><span>الاسم (AR) *</span><input required dir="rtl" name="nom_ar" value="${escapeHtml(article.nom_ar)}" placeholder="مثال: تونة" /></label>
            <label class="field"><span>Sous-titre (FR)</span><input name="sous_titre_fr" value="${escapeHtml(article.sous_titre_fr)}" placeholder="Ex. salade + tomates" /></label>
            <label class="field"><span>العنوان الفرعي (AR)</span><input dir="rtl" name="sous_titre_ar" value="${escapeHtml(article.sous_titre_ar)}" placeholder="مثال: سلطة + طماطم" /></label>
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
                <label style="display:flex;align-items:center;gap:6px;font-size:12.5px;cursor:pointer">
                  <input type="radio" name="couleur_choice" value="${c.key}" ${isPreset && article.couleur.toLowerCase() === c.hex.toLowerCase() ? "checked" : ""} />
                  <span class="swatch" style="background:${c.hex}"></span> ${c.label}
                </label>
              `).join("")}
              <label style="display:flex;align-items:center;gap:6px;font-size:12.5px;cursor:pointer">
                <input type="radio" name="couleur_choice" value="custom" ${!isPreset ? "checked" : ""} />
                Personnalisée
                <input type="color" name="couleur_custom" value="${!isPreset ? article.couleur : "#3F7EA6"}" />
              </label>
            </div>
          </div>

          <div style="margin-top:14px">
            <span style="font-size:12.5px;color:var(--ink-soft);display:block;margin-bottom:8px">Icône d'en-tête (optionnel — remplace le symbole par défaut)</span>
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
              <div id="icon-preview-wrap" style="display:flex;align-items:center;gap:8px">
                ${article.icone_entete ? `<img id="icon-preview" src="${article.icone_entete}" style="height:40px;background:${article.couleur};padding:4px;border-radius:6px" /><button type="button" class="btn" id="icon-remove">Retirer</button>` : `<span id="icon-preview-empty" style="font-size:12.5px;color:var(--ink-soft)">Aucune icône — symbole par défaut utilisé</span>`}
              </div>
              <label class="btn" style="cursor:pointer;margin:0">
                📷 Choisir une image
                <input type="file" id="icon-upload" accept="image/*" style="display:none" />
              </label>
            </div>
            <input type="hidden" name="icone_entete" id="icone_entete_input" value="${escapeHtml(article.icone_entete || "")}" />
          </div>
        </div>
            <label class="field"><span>Ingrédients (FR)</span><textarea name="ingredients_fr" rows="6" placeholder="Pain (farine de BLE...), ...">${escapeHtml(article.ingredients_fr)}</textarea></label>
            <label class="field"><span>المكونات (AR)</span><textarea dir="rtl" name="ingredients_ar" rows="6" placeholder="خبز (دقيق القمح...)، ...">${escapeHtml(article.ingredients_ar)}</textarea></label>
          </div>
        </div>

        <div class="card">
          <h3 style="font-size:14px;font-weight:600;margin-bottom:14px">Allergènes</h3>
          <div class="form-grid-2">
            <label class="field"><span>Allergènes (FR)</span><textarea name="allergenes_fr" rows="2">${escapeHtml(article.allergenes_fr)}</textarea></label>
            <label class="field"><span>مسببات الحساسية (AR)</span><textarea dir="rtl" name="allergenes_ar" rows="2">${escapeHtml(article.allergenes_ar)}</textarea></label>
          </div>
        </div>

        <div class="card">
          <h3 style="font-size:14px;font-weight:600;margin-bottom:14px">Valeurs énergétiques <span style="font-weight:400;color:var(--ink-soft)">(par portion)</span></h3>
          <div class="form-grid-3">
            <label class="field"><span>Énergie (kJ)</span><input type="number" step="any" name="energie_kj" value="${escapeHtml(article.energie_kj)}" /></label>
            <label class="field"><span>Énergie (kcal)</span><input type="number" step="any" name="energie_kcal" value="${escapeHtml(article.energie_kcal)}" /></label>
            <label class="field"><span>Lipides (g)</span><input type="number" step="any" name="lipides_g" value="${escapeHtml(article.lipides_g)}" /></label>
            <label class="field"><span>Saturés (g)</span><input type="number" step="any" name="satures_g" value="${escapeHtml(article.satures_g)}" /></label>
            <label class="field"><span>Sucres (g)</span><input type="number" step="any" name="sucres_g" value="${escapeHtml(article.sucres_g)}" /></label>
            <label class="field"><span>Sel (g)</span><input type="number" step="any" name="sel_g" value="${escapeHtml(article.sel_g)}" /></label>
          </div>
        </div>

        <div style="display:flex;gap:10px;align-items:center">
          <button type="submit" class="btn btn-primary">Enregistrer</button>
          <button type="button" class="btn" data-action="retour">Annuler</button>
          ${!isNew ? `<button type="button" class="btn" data-action="supprimer-form" data-id="${article.id}" style="color:var(--danger);margin-left:auto">Supprimer cet article</button>` : ""}
        </div>
      </form>
    `;

    outlet.querySelectorAll('[data-action="retour"]').forEach((btn) =>
      btn.addEventListener("click", async () => {
        mode = "liste";
        await renderList(outletRef);
      })
    );

    outlet.querySelector('input[name="couleur_custom"]')?.addEventListener("input", () => {
      outlet.querySelector('input[name="couleur_choice"][value="custom"]').checked = true;
    });

    outlet.querySelector("#icon-upload")?.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const dataUrl = await resizeImageToDataURL(file);
        outlet.querySelector("#icone_entete_input").value = dataUrl;
        const currentColor = outlet.querySelector('input[name="couleur_choice"]:checked')?.value;
        const preset = ARTICLE_COLORS.find((c) => c.key === currentColor);
        const previewColor = preset ? preset.hex : outlet.querySelector('input[name="couleur_custom"]').value;
        outlet.querySelector("#icon-preview-wrap").innerHTML = `
          <img id="icon-preview" src="${dataUrl}" style="height:40px;background:${previewColor};padding:4px;border-radius:6px" />
          <button type="button" class="btn" id="icon-remove">Retirer</button>
        `;
        outlet.querySelector("#icon-remove").addEventListener("click", clearIcon);
      } catch (err) {
        alert("Impossible de charger cette image.");
      }
    });

    function clearIcon() {
      outlet.querySelector("#icone_entete_input").value = "";
      outlet.querySelector("#icon-upload").value = "";
      outlet.querySelector("#icon-preview-wrap").innerHTML = `<span id="icon-preview-empty" style="font-size:12.5px;color:var(--ink-soft)">Aucune icône — symbole par défaut utilisé</span>`;
    }

    outlet.querySelector("#icon-remove")?.addEventListener("click", clearIcon);

    outlet.querySelector('[data-action="supprimer-form"]')?.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      const current = await DB.get(DB.STORES.articles, id);
      if (current && confirm(`Supprimer « ${current.nom_fr} » ? Cette action est définitive.`)) {
        await DB.delete(DB.STORES.articles, id);
        mode = "liste";
        await renderList(outletRef);
      }
    });

    outlet.querySelector("#article-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);

      const choice = fd.get("couleur_choice");
      const preset = ARTICLE_COLORS.find((c) => c.key === choice);
      const couleur = preset ? preset.hex : fd.get("couleur_custom") || article.couleur;

      const updated = {
        ...article,
        nom_fr: fd.get("nom_fr").trim(),
        nom_ar: fd.get("nom_ar").trim(),
        sous_titre_fr: fd.get("sous_titre_fr").trim(),
        sous_titre_ar: fd.get("sous_titre_ar").trim(),
        categorie: fd.get("categorie"),
        poids_gr: fd.get("poids_gr") ? Number(fd.get("poids_gr")) : "",
        ean: fd.get("ean").trim(),
        conservation: fd.get("conservation").trim(),
        halal: fd.get("halal") === "on",
        actif: fd.get("actif") === "on",
        couleur,
        icone_entete: fd.get("icone_entete") || "",
        ingredients_fr: fd.get("ingredients_fr").trim(),
        ingredients_ar: fd.get("ingredients_ar").trim(),
        allergenes_fr: fd.get("allergenes_fr").trim(),
        allergenes_ar: fd.get("allergenes_ar").trim(),
        energie_kj: fd.get("energie_kj") ? Number(fd.get("energie_kj")) : "",
        energie_kcal: fd.get("energie_kcal") ? Number(fd.get("energie_kcal")) : "",
        lipides_g: fd.get("lipides_g") ? Number(fd.get("lipides_g")) : "",
        satures_g: fd.get("satures_g") ? Number(fd.get("satures_g")) : "",
        sucres_g: fd.get("sucres_g") ? Number(fd.get("sucres_g")) : "",
        sel_g: fd.get("sel_g") ? Number(fd.get("sel_g")) : "",
        updated_at: Date.now(),
      };

      await DB.put(DB.STORES.articles, updated);
      mode = "liste";
      editingId = null;
      await renderList(outletRef);
    });
  }

  return { render };
})();

window.ArticlesView = ArticlesView;
