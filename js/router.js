// router.js — Routeur SPA léger, sans dépendance.
// Chaque écran s'enregistre avec Router.register(chemin, fonctionRender).

const Router = (() => {
  const routes = {};
  let currentPath = null;

  function register(path, renderFn) {
    routes[path] = renderFn;
  }

  function normalize(hash) {
    const path = (hash || "").replace(/^#/, "");
    return path && routes[path] ? path : "/tableau-de-bord";
  }

  async function render() {
    const path = normalize(window.location.hash);
    currentPath = path;

    document.querySelectorAll("[data-nav-link]").forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${path}`);
    });

    const outlet = document.getElementById("view-outlet");
    outlet.setAttribute("aria-busy", "true");

    const renderFn = routes[path];
    if (renderFn) {
      await renderFn(outlet);
    } else {
      outlet.innerHTML = `<div class="empty-state">Page introuvable.</div>`;
    }

    outlet.setAttribute("aria-busy", "false");
    outlet.focus({ preventScroll: true });
  }

  function start() {
    window.addEventListener("hashchange", render);
    render();
  }

  return { register, start, get currentPath() { return currentPath; } };
})();

window.Router = Router;
