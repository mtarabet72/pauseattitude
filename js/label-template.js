// label-template.js — Construit le HTML d'une étiquette à partir des
// données d'un article. Utilisé par l'écran "Étiquettes" (aperçu) et,
// à l'étape 4, par la planche d'impression.

function labelEmoticon(article) {
  return article.halal ? ">>( ° >° )<<" : "}<(((°>";
}

function buildLabelHTML(article) {
  const color = article.couleur || "#3F7EA6";

  const halalBadge = article.halal ? `<div class="label-halal">A base d'ingrédients HALAL<br />على أساس مكونات حلال</div>` : "";

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

      <div class="label-columns">
        <div class="label-col-ingredients">
          <span class="lbl">Ingrédients (FR)</span>${escapeHtml(article.ingredients_fr) || "—"}
        </div>

        <div class="label-col-center" style="position:relative;z-index:3">
          <div class="label-logo" style="position:relative;z-index:3;background:${escapeHtml(color)};width:calc(9 * var(--mm, 1mm));height:calc(9 * var(--mm, 1mm));border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">
            <img src="icons/brand-mark.png" alt="" style="width:82%;height:82%;object-fit:contain;display:block" />
          </div>
          <div class="label-nutrition-title">Valeurs<br />énergétiques</div>
          <div class="label-nutrition-pills">
            <div class="label-nutrition-pill" style="background:${escapeHtml(color)}">Énergie</div>
            <div class="label-nutrition-value">${article.energie_kj || "—"}KJ/${article.energie_kcal || "—"}Kcal</div>
            <div class="label-nutrition-pill" style="background:${escapeHtml(color)}">Lipides</div>
            <div class="label-nutrition-value">${article.lipides_g || "—"} g</div>
            <div class="label-nutrition-pill" style="background:${escapeHtml(color)}">Saturés</div>
            <div class="label-nutrition-value">${article.satures_g || "—"} g</div>
            <div class="label-nutrition-pill" style="background:${escapeHtml(color)}">Sucres</div>
            <div class="label-nutrition-value">${article.sucres_g || "—"} g</div>
            <div class="label-nutrition-pill" style="background:${escapeHtml(color)}">Sel</div>
            <div class="label-nutrition-value">${article.sel_g || "—"} g</div>
          </div>
        </div>

        <div class="label-col-ingredients rtl">
          <span class="lbl">المكونات (AR)</span>${escapeHtml(article.ingredients_ar) || "—"}
        </div>
      </div>

      <div class="label-allergenes-row">
        <div><strong>Allergènes :</strong> ${escapeHtml(article.allergenes_fr) || "—"}</div>
        <div class="rtl"><strong>الحساسية:</strong> ${escapeHtml(article.allergenes_ar) || "—"}</div>
      </div>

      <div class="label-meta-row">
        <div class="label-conservation" style="border-color:${escapeHtml(color)}">
          ${escapeHtml(article.conservation || "")}
          <span class="label-weight">${article.poids_gr ? escapeHtml(article.poids_gr) + " g" : ""}</span>
        </div>
        <div class="label-fresh" style="background:${escapeHtml(color)}">Fresh<br />Daily</div>
        <div class="label-barcode-wrap">${barcodeBlock}</div>
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
