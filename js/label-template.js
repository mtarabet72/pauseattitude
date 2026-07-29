// label-template.js — Construit le HTML d'une étiquette à partir des
// données d'un article. Utilisé par l'écran "Étiquettes" (aperçu) et,
// à l'étape 4, par la planche d'impression.

function labelEmoticon(article) {
  return article.halal ? ">>( ° >° )<<" : "}<(((°>";
}

function buildLabelHTML(article) {
  const color = article.couleur || "#3F7EA6";

  const halalBadge = article.halal ? `<div class="label-halal">HALAL / حلال</div>` : "";

  const subtitle =
    article.sous_titre_fr || article.sous_titre_ar
      ? `<div class="label-subtitle">${escapeHtml(article.sous_titre_fr)}${
          article.sous_titre_fr && article.sous_titre_ar ? " • " : ""
        }${escapeHtml(article.sous_titre_ar)}</div>`
      : "";

  const eanNormalized = EAN13.normalize(article.ean);
  const barcodeSvg = eanNormalized ? EAN13.renderSVG(article.ean, { width: 32, height: 9 }) : "";

  const barcodeBlock = barcodeSvg
    ? `${barcodeSvg}<div class="label-ean-text">${eanNormalized}</div>`
    : `<div class="label-no-barcode">Pas de code-barres</div>`;

  return `
    <div class="label" style="background:${escapeHtml(color)}">
      <div class="label-header">
        <div class="label-emoticon">${escapeHtml(labelEmoticon(article))}</div>
        <div class="label-name">${escapeHtml(article.nom_fr) || "…"}<span class="sep">•</span>${escapeHtml(article.nom_ar) || "…"}</div>
        ${subtitle}
        ${halalBadge}
      </div>

      <div class="label-body">
        <div class="label-nutrition">
          <div class="label-logo" style="border-color:${escapeHtml(color)}"><img src="icons/brand-mark.png" alt="" /></div>
          <div class="label-nutrition-table">
            <div><span>Énergie</span><span>${article.energie_kj || "—"} kJ / ${article.energie_kcal || "—"} kcal</span></div>
            <div><span>Lipides</span><span>${article.lipides_g || "—"} g</span></div>
            <div><span>Saturés</span><span>${article.satures_g || "—"} g</span></div>
            <div><span>Sucres</span><span>${article.sucres_g || "—"} g</span></div>
            <div><span>Sel</span><span>${article.sel_g || "—"} g</span></div>
          </div>
        </div>

        <div class="label-ingredients">
          <span class="lbl">Ingrédients (FR)</span>${escapeHtml(article.ingredients_fr) || "—"}
        </div>

        <div class="label-ingredients rtl">
          <span class="lbl">المكونات (AR)</span>${escapeHtml(article.ingredients_ar) || "—"}
        </div>

        <div class="label-allergenes">
          <strong>Allergènes :</strong> ${escapeHtml(article.allergenes_fr) || "—"}
          <div dir="rtl" style="margin-top:calc(0.3 * var(--mm, 1mm))"><strong>الحساسية:</strong> ${escapeHtml(article.allergenes_ar) || "—"}</div>
        </div>

        <div class="label-meta-row">
          <div class="label-conservation" style="border-color:${escapeHtml(color)}">
            ${escapeHtml(article.conservation || "")}
            <span class="label-weight">${article.poids_gr ? escapeHtml(article.poids_gr) + " g" : ""}</span>
          </div>
          <div class="label-fresh" style="border-color:${escapeHtml(color)}">Fresh<br />Daily</div>
          <div class="label-barcode-wrap">${barcodeBlock}</div>
        </div>
      </div>

      <div class="label-footer-band" style="background:${escapeHtml(color)}">
        <span class="label-footer-made">Made by</span>
        <span class="label-footer-brand">Pause Attitude</span>
        <span class="label-footer-url">pauseattitude.ma</span>
      </div>
    </div>
  `;
}

window.buildLabelHTML = buildLabelHTML;
window.labelEmoticon = labelEmoticon;
