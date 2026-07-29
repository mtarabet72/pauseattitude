# pauseattitude

Application PWA (Progressive Web App) pour la gestion des articles et
l'édition des étiquettes Pause Attitude — 100% front-end, aucune
dépendance serveur, données stockées localement (IndexedDB) sur
l'appareil de l'utilisateur.

## Développement local

Comme l'application enregistre un Service Worker, elle doit être servie
via HTTP (pas en ouvrant directement `index.html` avec `file://`) :

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

## Déploiement sur GitHub Pages

1. Créez un dépôt GitHub (public ou privé) et poussez ce dossier :

```bash
   git init
   git add .
   git commit -m "Squelette PWA — étape 1"
   git branch -M main
   git remote add origin https://github.com/<votre-utilisateur>/pauseattitude.git
   git push -u origin main
```

   → nommez le dépôt GitHub **`pauseattitude`** pour que l'URL finale reste cohérente avec le nom de l'application.

2. Sur GitHub : **Settings → Pages → Build and deployment**
   - Source : `Deploy from a branch`
   - Branch : `main` / dossier `/ (root)`
   - Enregistrez.

3. L'application sera disponible à :
   `https://<votre-utilisateur>.github.io/pauseattitude/`

   (le premier déploiement peut prendre 1 à 2 minutes)

4. Ouvrez cette URL sur mobile ou desktop : le navigateur proposera
   d'**installer l'application** (icône, écran d'accueil, mode
   plein écran).

### Après chaque mise à jour

Le Service Worker met le contenu en cache. Pour forcer la prise en
compte d'une nouvelle version après un déploiement, incrémentez la
constante `CACHE_VERSION` dans `sw.js` (ex. `pa-shell-v2`) — cela
invalide automatiquement l'ancien cache chez les visiteurs.

## Structure
