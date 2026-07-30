// settings.js — Paramètres de l'entreprise, utilisés notamment dans le
// pied de page des étiquettes (nom + site web).

const Settings = (() => {
  const DEFAULTS = { key: "entreprise", nom: "Pause Attitude", site_web: "pauseattitude.ma" };
  let current = { ...DEFAULTS };

  async function load() {
    try {
      const row = await DB.get(DB.STORES.settings, "entreprise");
      if (row) current = { ...DEFAULTS, ...row };
    } catch (e) {
      console.warn("Impossible de charger les paramètres :", e);
    }
    return current;
  }

  async function save(partial) {
    current = { ...current, ...partial, key: "entreprise" };
    await DB.put(DB.STORES.settings, current);
    return current;
  }

  return {
    get current() {
      return current;
    },
    load,
    save,
  };
})();

window.Settings = Settings;
