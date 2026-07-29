// app.js — Bootstrap de l'application.

const APP_STEPS = {
  articles: "Étape 2 — Gestion des articles",
  etiquettes: "Étape 3 — Éditeur visuel d'étiquette",
  impression: "Étape 4 — Mise en page impression A4 (4×3)",
};

function emptyStateView(emoticon, title, description) {
  return `
    <div class="empty-state">
      <span class="emoticon">${emoticon}</span>
      <h2 style="font-size:16px;font-weight:600;color:var(--ink)">${title}</h2>
      <p style="margin:0;font-size:13.5px;max-width:44ch">${description}</p>
    </div>
  `;
}

async function renderDashboard(outlet) {
  let articleCount = 0;
  try {
    articleCount = await DB.count(DB.STORES.articles);
  } catch (e) {
    console.warn("DB indisponible pour le moment :", e);
  }

  outlet.innerHTML = `
    <div class="grid grid-stats" style="margin-bottom:20px">
      <div class="card stat-card">
        <div class="stat-label">Articles enregistrés</div>
        <div class="stat-value">${articleCount}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Étiquettes / feuille A4</div>
        <div class="stat-value">12</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Format étiquette</div>
        <div class="stat-value">50×80</div>
      </div>
    </div>
    ${emptyStateView(
      "}&lt;(((°&gt;",
      "Squelette technique en place",
      "Stockage local (hors-ligne), navigation et thème sont opérationnels. La gestion des articles arrive à la prochaine étape."
    )}
  `;
}

function renderPlaceholder(key, emoticon, title, description) {
  return async (outlet) => {
    outlet.innerHTML = emptyStateView(emoticon, title, `${description}<br><span class="badge" style="margin-top:8px">${APP_STEPS[key]}</span>`);
  };
}

function updateNetworkStatus() {
  const pill = document.getElementById("network-status");
  if (!pill) return;
  const online = navigator.onLine;
  pill.classList.toggle("is-offline", !online);
  pill.querySelector("span:last-child").textContent = online ? "En ligne" : "Hors-ligne";
}

async function initApp() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (e) {
      console.warn("Enregistrement du service worker impossible :", e);
    }
  }

  await DB.getAll(DB.STORES.settings).catch(() => []);

  Router.register("/tableau-de-bord", renderDashboard);
  Router.register(
    "/articles",
    renderPlaceholder("articles", ">&gt;( ° &gt;° )&lt;&lt;", "Gestion des articles", "Créer, modifier et classer vos articles (ingrédients FR/NL, allergènes, valeurs nutritionnelles, poids, code-barres).")
  );
  Router.register(
    "/etiquettes",
    renderPlaceholder("etiquettes", "}&lt;(((°&gt;", "Éditeur d'étiquette", "Aperçu fidèle au modèle Pause Attitude, avec la couleur propre à chaque produit.")
  );
  Router.register(
    "/impression",
    renderPlaceholder("impression", "[ ▤ ]", "Mise en page impression", "Générer une planche A4 de 12 étiquettes (4×3, 50×80mm, marges 27mm / 5mm) prête à imprimer.")
  );
  Router.register("/parametres", async (outlet) => {
    outlet.innerHTML = `
      <div class="card" style="max-width:520px">
        <h2 style="font-size:16px;font-weight:600;margin-bottom:4px">Paramètres</h2>
        <p style="font-size:13.5px;color:var(--ink-soft);margin-top:0">Nom de l'entreprise, site web et préférences d'impression seront configurables ici.</p>
      </div>
    `;
  });

  Router.start();

  updateNetworkStatus();
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
}

document.addEventListener("DOMContentLoaded", initApp);
