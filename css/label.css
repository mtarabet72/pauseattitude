/* label.css — Gabarit visuel de l'étiquette (50×80mm).
   Toutes les tailles utilisent var(--mm, 1mm) : par défaut l'étiquette
   est à sa taille réelle d'impression ; un conteneur parent peut
   redéfinir --mm (ex. en px) pour l'agrandir à l'écran sans dupliquer
   la feuille de style. */

.label {
  width: calc(50 * var(--mm, 1mm));
  height: calc(80 * var(--mm, 1mm));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: calc(1.2 * var(--mm, 1mm));
  color: #fff;
  font-family: "Inter", sans-serif;
}

.label-preview-frame {
  --mm: 3.6px;
  display: inline-block;
  border-radius: calc(1.2 * var(--mm, 1mm));
  box-shadow: 0 1px 2px rgba(28, 27, 25, 0.08), 0 8px 24px rgba(28, 27, 25, 0.12);
}

.label-header {
  padding: calc(2 * var(--mm, 1mm)) calc(3 * var(--mm, 1mm)) calc(1.4 * var(--mm, 1mm));
  text-align: center;
  flex-shrink: 0;
}

.label-emoticon {
  font-family: "IBM Plex Mono", monospace;
  font-size: calc(2.6 * var(--mm, 1mm));
  line-height: 1;
}

.label-name {
  font-family: "Space Grotesk", sans-serif;
  font-weight: 700;
  font-size: calc(3.4 * var(--mm, 1mm));
  line-height: 1.08;
  margin-top: calc(0.6 * var(--mm, 1mm));
}

.label-name .sep {
  opacity: 0.7;
  font-weight: 400;
  padding: 0 calc(0.3 * var(--mm, 1mm));
}

.label-subtitle {
  font-size: calc(1.7 * var(--mm, 1mm));
  margin-top: calc(0.7 * var(--mm, 1mm));
  opacity: 0.92;
}

.label-halal {
  display: inline-block;
  margin-top: calc(1 * var(--mm, 1mm));
  font-size: calc(1.3 * var(--mm, 1mm));
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 999px;
  padding: calc(0.3 * var(--mm, 1mm)) calc(1.6 * var(--mm, 1mm));
}

.label-body {
  flex: 1;
  background: #fff;
  color: #1c1b19;
  padding: calc(1.6 * var(--mm, 1mm)) calc(2.6 * var(--mm, 1mm));
  display: flex;
  flex-direction: column;
  gap: calc(1.1 * var(--mm, 1mm));
  overflow: hidden;
}

.label-nutrition {
  display: flex;
  align-items: center;
  gap: calc(1.6 * var(--mm, 1mm));
  flex-shrink: 0;
}

.label-logo {
  width: calc(8 * var(--mm, 1mm));
  height: calc(8 * var(--mm, 1mm));
  border-radius: 50%;
  border: 1px solid var(--label-color, #3f7ea6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.label-logo img {
  width: 82%;
  height: 82%;
  object-fit: contain;
}

.label-nutrition-table {
  flex: 1;
  font-size: calc(1.25 * var(--mm, 1mm));
}

.label-nutrition-table div {
  display: flex;
  justify-content: space-between;
  gap: calc(0.5 * var(--mm, 1mm));
  border-bottom: 1px solid #eee;
  padding: calc(0.12 * var(--mm, 1mm)) 0;
}

.label-nutrition-table div:last-child {
  border-bottom: none;
}

.label-ingredients {
  font-size: calc(1.25 * var(--mm, 1mm));
  line-height: 1.28;
}

.label-ingredients .lbl {
  font-weight: 700;
  font-size: calc(1.35 * var(--mm, 1mm));
  display: block;
  margin-bottom: calc(0.2 * var(--mm, 1mm));
}

.label-ingredients.rtl {
  direction: rtl;
  text-align: right;
}

.label-allergenes {
  font-size: calc(1.05 * var(--mm, 1mm));
  color: #4a473f;
  line-height: 1.25;
  border-top: 1px solid #e4dfd5;
  padding-top: calc(0.8 * var(--mm, 1mm));
}

.label-meta-row {
  display: flex;
  align-items: center;
  gap: calc(1.4 * var(--mm, 1mm));
  flex-shrink: 0;
  margin-top: calc(0.4 * var(--mm, 1mm));
}

.label-conservation {
  font-size: calc(0.95 * var(--mm, 1mm));
  color: #1c1b19;
  border: 1.2px solid var(--label-color, #3f7ea6);
  border-radius: calc(0.5 * var(--mm, 1mm));
  padding: calc(0.5 * var(--mm, 1mm));
  text-align: center;
  line-height: 1.2;
  flex-shrink: 0;
}

.label-weight {
  font-family: "IBM Plex Mono", monospace;
  font-weight: 600;
  font-size: calc(1.5 * var(--mm, 1mm));
  display: block;
  margin-top: calc(0.3 * var(--mm, 1mm));
  color: #1c1b19;
}

.label-fresh {
  width: calc(8.5 * var(--mm, 1mm));
  height: calc(8.5 * var(--mm, 1mm));
  border-radius: 50%;
  border: 1.4px dashed var(--label-color, #3f7ea6);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: "Space Grotesk", sans-serif;
  font-weight: 600;
  font-size: calc(1.1 * var(--mm, 1mm));
  line-height: 1.05;
  color: #1c1b19;
  flex-shrink: 0;
}

.label-barcode-wrap {
  flex: 1;
  background: #fff;
  padding: calc(0.4 * var(--mm, 1mm));
  min-width: 0;
}

.label-barcode-wrap svg {
  display: block;
}

.label-ean-text {
  font-family: "IBM Plex Mono", monospace;
  font-size: calc(0.9 * var(--mm, 1mm));
  text-align: center;
  margin-top: calc(0.2 * var(--mm, 1mm));
  color: #1c1b19;
}

.label-no-barcode {
  font-size: calc(1 * var(--mm, 1mm));
  color: #9a9488;
  text-align: center;
}

.label-footer-band {
  flex-shrink: 0;
  color: #fff;
  padding: calc(1.1 * var(--mm, 1mm)) calc(2.2 * var(--mm, 1mm));
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: calc(0.1 * var(--mm, 1mm));
}

.label-footer-made {
  font-size: calc(0.9 * var(--mm, 1mm));
  opacity: 0.85;
}

.label-footer-brand {
  font-family: "Space Grotesk", sans-serif;
  font-weight: 700;
  font-size: calc(1.3 * var(--mm, 1mm));
}

.label-footer-url {
  font-size: calc(0.9 * var(--mm, 1mm));
  opacity: 0.9;
}
