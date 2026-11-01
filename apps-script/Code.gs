/**
 * Panier Malin — liste de courses qui apprend la consommation.
 * Script lié à un Google Sheet : les données sont rangées dans 3 onglets
 *   - Produits   : un produit suivi par ligne
 *   - Ponctuels  : articles à acheter une seule fois
 *   - Réglages   : nombre de jours de rappel avant la fin
 */

var SHEET_PRODUITS = 'Produits';
var SHEET_PONCTUELS = 'Ponctuels';
var SHEET_REGLAGES = 'Réglages';

var HEAD_PRODUITS = ['id', 'Produit', 'Catégorie', 'Durée d\'un paquet (jours)', 'Durée de départ (jours)',
  'Contenu du paquet', 'Unité', 'Dernier achat', 'Ajouté à la main', 'Fini le', 'Durées réelles (jours)'];
var HEAD_PONCTUELS = ['id', 'Article'];

/** Ouvre l'appli web. */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Panier Malin')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Crée les onglets si besoin (lancer une fois à la main pour autoriser le script). */
function setup() {
  var ss = SpreadsheetApp.getActive();
  prepare_(ss, SHEET_PRODUITS, HEAD_PRODUITS);
  prepare_(ss, SHEET_PONCTUELS, HEAD_PONCTUELS);
  var r = prepare_(ss, SHEET_REGLAGES, ['Réglage', 'Valeur']);
  if (r.getLastRow() < 2) r.getRange(2, 1, 1, 2).setValues([['Rappel (jours avant la fin)', 3]]);
}

function prepare_(ss, name, head) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
  sh.setFrozenRows(1);
  sh.getRange('A:Z').setNumberFormat('@'); // tout en texte : pas de conversion de dates ni de fuseau
  return sh;
}

/** Lit tout et renvoie l'état au format de la page (JSON). */
function getState() {
  setup();
  var ss = SpreadsheetApp.getActive();
  var products = [];
  var shP = ss.getSheetByName(SHEET_PRODUITS);
  if (shP.getLastRow() > 1) {
    var rows = shP.getRange(2, 1, shP.getLastRow() - 1, HEAD_PRODUITS.length).getDisplayValues();
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (!r[0]) continue;
      var hist = String(r[10] || '').split(',').map(function (x) { return parseInt(x, 10); })
        .filter(function (x) { return x > 0; });
      var p = {
        id: r[0], name: r[1], cat: r[2] || 'Autre',
        days: parseInt(r[3], 10) || 30, declared: parseInt(r[4], 10) || parseInt(r[3], 10) || 30,
        last: r[7], manual: r[8] === 'oui', finished: r[9] || null, history: hist
      };
      if (r[5]) { p.qty = parseFloat(String(r[5]).replace(',', '.')); p.unit = r[6]; }
      products.push(p);
    }
  }
  var extras = [];
  var shX = ss.getSheetByName(SHEET_PONCTUELS);
  if (shX.getLastRow() > 1) {
    shX.getRange(2, 1, shX.getLastRow() - 1, 2).getDisplayValues().forEach(function (r) {
      if (r[0]) extras.push({ id: r[0], name: r[1] });
    });
  }
  var remind = parseInt(ss.getSheetByName(SHEET_REGLAGES).getRange(2, 2).getDisplayValue(), 10);
  return JSON.stringify({ products: products, extras: extras, remind: isNaN(remind) ? 3 : remind });
}

/** Réécrit les onglets à partir de l'état envoyé par la page. */
function saveState(json) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    setup();
    var s = JSON.parse(json);
    var ss = SpreadsheetApp.getActive();

    var rowsP = (s.products || []).map(function (p) {
      return [p.id, p.name, p.cat, String(p.days), String(p.declared || p.days),
        p.qty ? String(p.qty) : '', p.unit || '', p.last, p.manual ? 'oui' : '', p.finished || '',
        (p.history || []).join(',')];
    });
    write_(ss.getSheetByName(SHEET_PRODUITS), rowsP, HEAD_PRODUITS.length);

    var rowsX = (s.extras || []).map(function (x) { return [x.id, x.name]; });
    write_(ss.getSheetByName(SHEET_PONCTUELS), rowsX, 2);

    ss.getSheetByName(SHEET_REGLAGES).getRange(2, 2).setValue(String(s.remind));
    return true;
  } finally {
    lock.releaseLock();
  }
}

function write_(sh, rows, width) {
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, width).clearContent();
  if (rows.length) sh.getRange(2, 1, rows.length, width).setValues(rows);
}