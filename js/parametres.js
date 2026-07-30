// parametres.js — Écran "Paramètres" : informations d'entreprise et
// gestion des données (export / import / réinitialisation).

const ParametresView = (() => {
  async function render(outlet) {
    await Settings.load();
    const s = Settings.current;
    const articleCount = await DB.count(DB.STORES.articles).catch(() => 0);

    outlet.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:16px;max-width:520px">

        <div class="card">
          <h2 style="font-size:16px;font-weight:600;margin-bottom:4px">Entreprise</h2>
          <p style="font-size:13px;color:var(--ink-soft);margin:0 0 14px">Ces informations apparaissent dans le pied de page de chaque étiquette.</p>
          <form id="settings-form" style="display:flex;flex-direction:column;gap:12px">
            <label class="field"><span>Nom de l'entreprise</span><input name="nom" value="${escapeHtml(s.nom)}" /></label>
            <label class="field"><span>Site web</span><input name="site_web" value="${escapeHtml(s.site_web)}" /></label>
            <div style="display:flex;align-items:center;gap:10px">
              <button type="submit" class="btn btn-primary">Enregistrer</button>
              <span id="settings-saved" style="font-size:12.5px;color:var(--success);display:none">✓ Enregistré</span>
            </div>
          </form>
        </div>

        <div class="card">
          <h2 style="font-size:16px;font-weight:600;margin-bottom:4px">Données</h2>
          <p style="font-size:13px;color:var(--ink-soft);margin:0 0 14px">
            <strong style="color:var(--ink)">${articleCount}</strong> article${articleCount > 1 ? "s" : ""} enregistré${articleCount > 1 ? "s" : ""} sur cet appareil. Exportez régulièrement une sauvegarde, ou transférez vos données vers un autre appareil.
          </p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
            <button class="btn" id="btn-export">⬇ Exporter (JSON)</button>
            <label class="btn" style="cursor:pointer;margin:0">
              ⬆ Importer
              <input type="file" id="import-file" accept="application/json" style="display:none" />
            </label>
            <button class="btn" id="btn-reset" style="color:var(--danger)">🗑 Réinitialiser</button>
          </div>
        </div>

        <div class="card">
          <h2 style="font-size:16px;font-weight:600;margin-bottom:4px">À propos</h2>
          <p style="font-size:13px;color:var(--ink-soft);margin:0;line-height:1.5">
            <strong style="color:var(--ink)">pauseattitude</strong> — application installable, fonctionne hors-ligne, données stockées uniquement sur cet appareil.
          </p>
        </div>

      </div>
    `;

    outlet.querySelector("#settings-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await Settings.save({ nom: fd.get("nom").trim(), site_web: fd.get("site_web").trim() });
      const msg = outlet.querySelector("#settings-saved");
      msg.style.display = "inline";
      setTimeout(() => {
        msg.style.display = "none";
      }, 2000);
    });

    outlet.querySelector("#btn-export").addEventListener("click", async () => {
      const articles = await DB.getAll(DB.STORES.articles);
      const data = { exported_at: new Date().toISOString(), settings: Settings.current, articles };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pauseattitude-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    outlet.querySelector("#import-file").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data.articles)) throw new Error("Format invalide");

        if (!confirm(`Importer ${data.articles.length} article(s) ? Les articles ayant le même identifiant seront remplacés.`)) {
          e.target.value = "";
          return;
        }

        for (const article of data.articles) {
          await DB.put(DB.STORES.articles, article);
        }
        if (data.settings) await Settings.save(data.settings);

        alert("Import terminé.");
        render(outlet);
      } catch (err) {
        alert("Le fichier sélectionné n'est pas un export valide.");
      }
    });

    outlet.querySelector("#btn-reset").addEventListener("click", async () => {
      if (!confirm("Supprimer TOUS les articles ? Cette action est définitive et ne peut pas être annulée.")) return;
      const all = await DB.getAll(DB.STORES.articles);
      for (const article of all) await DB.delete(DB.STORES.articles, article.id);
      alert("Tous les articles ont été supprimés.");
      render(outlet);
    });
  }

  return { render };
})();

window.ParametresView = ParametresView;
