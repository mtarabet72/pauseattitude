// db.js — Accès aux données locales (IndexedDB), fonctionne hors-ligne.
// Schéma pensé pour l'étape 2 (gestion des articles) mais mis en place
// dès maintenant pour que le reste de l'appli puisse s'y brancher.

const DB_NAME = "pause-attitude-db";
const DB_VERSION = 1;

const STORES = {
  articles: "articles",
  settings: "settings",
};

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORES.articles)) {
        const articles = db.createObjectStore(STORES.articles, { keyPath: "id" });
        articles.createIndex("nom_fr", "nom_fr", { unique: false });
        articles.createIndex("categorie", "categorie", { unique: false });
        articles.createIndex("actif", "actif", { unique: false });
        articles.createIndex("ean", "ean", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.settings)) {
        db.createObjectStore(STORES.settings, { keyPath: "key" });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });

  return dbPromise;
}

function tx(storeName, mode = "readonly") {
  return openDB().then((db) => db.transaction(storeName, mode).objectStore(storeName));
}

function promisify(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const DB = {
  STORES,

  async getAll(storeName) {
    const store = await tx(storeName);
    return promisify(store.getAll());
  },

  async get(storeName, key) {
    const store = await tx(storeName);
    return promisify(store.get(key));
  },

  async put(storeName, value) {
    const store = await tx(storeName, "readwrite");
    return promisify(store.put(value));
  },

  async delete(storeName, key) {
    const store = await tx(storeName, "readwrite");
    return promisify(store.delete(key));
  },

  async count(storeName) {
    const store = await tx(storeName);
    return promisify(store.count());
  },

  async getByIndex(storeName, indexName, value) {
    const store = await tx(storeName);
    return promisify(store.index(indexName).getAll(value));
  },
};

window.DB = DB;
