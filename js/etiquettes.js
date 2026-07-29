// etiquettes.js — Écran "Étiquettes" : choisir un article et prévisualiser
// son étiquette telle qu'elle sera imprimée.

const EtiquettesView = (() => {
  let selectedId = null;

  async function render(outlet) {
    const articles = await DB.getAll(DB.STORES.articles);
    articles.sort((a, b) => a.nom_fr.localeCompare(b.nom_fr, "fr"));

    if (articles.length === 0) {
      outlet.innerHTML = `
        <div class="empty-state">
          <span class="emoticon">}&lt;(((°&gt;</span>
          <h2 style="font-size:16px;font-weight:600;color:var(--ink)">Aucun article à prévisualiser</h2>
          <p style="margin:0;font-size:13.5px;max-width:44ch">Créez d'abord un article pour générer son étiquette.</p>
          <a class="btn btn-primary" href="#/articles" style="margin-top:6px;text-decoration:none">Aller aux articles</a>
        </div>
      `;
      return;
    }

    if (!selectedId || !articles.some((a) => a.id === selectedId)) {
      selectedId = articles[0].id;
    }

    renderScreen(outlet, articles);
  }

  function renderScreen(outlet, articles) {
    const article = articles.find((a) => a.id === selectedId);

    outlet.innerHTML = `
      <div style="margin-bottom:18px;max-width:360px">
        <label class="field">
          <span>Article à prévisualiser</span>
          <select id="etiquette-select">
            ${articles
              .map((a) => `<option value="${a.id}" ${a.id === selectedId ? "selected" : ""}>${escapeHtml(a.nom_fr)}${a.actif ? "" : " (inactif)"}</option>`)
              .join("")}
          </select>
        </label>
      </div>

      <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start">
        <div class="card" style="padding:28px;display:flex;justify-content:center">
          <div class="label-preview-frame">${buildLabelHTML(article)}</div>
        </div>

        <div class="card" style="flex:1;min-width:240px;max-width:360px">
          <h3 style="font-size:14px;font-weight:600;margin-bottom:10px">À propos de cet aperçu</h3>
          <p style="font-size:13px;color:var(--ink-soft);line-height:1.5;margin:0 0 10px">
            Format réel : <strong>50 × 80 mm</strong>. Cet aperçu est agrandi pour la lisibilité à l'écran ; l'impression (étape 4) utilisera la taille exacte.
          </p>
          <p style="font-size:13px;color:var(--ink-soft);line-height:1.5;margin:0">
            Pour modifier le contenu (ingrédients, allergènes, valeurs nutritionnelles, couleur…), rendez-vous dans <a href="#/articles" style="color:var(--ink);text-decoration:underline">Articles</a>.
          </p>
        </div>
      </div>
    `;

    outlet.querySelector("#etiquette-select").addEventListener("change", (e) => {
      selectedId = e.target.value;
      renderScreen(outlet, articles);
    });
  }

  return { render };
})();

window.EtiquettesView = EtiquettesView;
