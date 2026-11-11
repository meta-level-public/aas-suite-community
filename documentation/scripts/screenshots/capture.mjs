#!/usr/bin/env node
// Erzeugt die Screenshots des Handbuchs (static/img/designer/) gegen einen laufenden Designer.
// Voraussetzung: einmal `npm run screenshots:login` ausgeführt.
// Aufruf: npm run screenshots  (optional: npm run screenshots -- dashboard editor  für einzelne Abschnitte)
//
// Datenschutz: Die Screenshots verwenden nur Demo-Daten mit erfundenen Werten (Demo-AAS, Demo-Typ-AAS,
// Demo-Adresse, Demo-Schnipsel). Profilbild und Organisationslogo werden unkenntlich gemacht. Profil und
// Organisationen nur mit einem Demo-Konto aufnehmen (z. B. "Demo Admin"), nie mit einem persönlichen Konto.
// In Benutzer- und Rechtetabellen werden alle Zeilen außer denen des Demo-Kontos unkenntlich gemacht;
// Einladungen, Organisationsliste, Infrastrukturstatus und Mail-Einstellungen werden nicht aufgenommen,
// CORS-Einträge sind unkenntlich. Tokens werden nie gespeichert, damit kein Schlüssel im Bild steht.
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { AUTH_FILE, BASE_URL, IMG_DIR, VIEWPORT } from './config.mjs';

const DEMO = {
  descriptionEn: 'Demo centrifugal pump KP-200',
  descriptionDe: 'Demo-Kreiselpumpe KP-200',
  idShort: 'demoKreiselpumpeKp200',
  aasId: 'https://example.com/ids/aas/demoKreiselpumpeKp200',
  manufacturer: 'Demo Pumpen GmbH',
};
// Nur für die Bilder des Assistenten; wird nie gespeichert, damit die ID-Prüfung "verfügbar" meldet
const WIZARD_DEMO = { descriptionEn: 'Demo dosing pump DP-50', descriptionDe: 'Demo-Dosierpumpe DP-50' };
// Typ-AAS für "Instanz erstellen"; wird bei Bedarf über den geführten Modus angelegt
const TYPE_DEMO = {
  descriptionEn: 'Demo centrifugal pump type KP-200',
  descriptionDe: 'Demo-Kreiselpumpe Typ KP-200',
  match: 'demoKreiselpumpeTyp',
};
// Erfundene Adresse für den Adresskatalog in "Mein Bereich"
const DEMO_ADDRESS = { name: 'Demo Pumpen GmbH', street: 'Musterstraße 1', zip: '12345', city: 'Musterstadt' };
const DEMO_SNIPPET = { name: 'Demo-Allgemeine Angaben', description: 'Beispiel für das Handbuch' };
// Konzeptbeschreibung aus dem Digital Nameplate, die in jeder Installation mit IDTA-Vorlagen vorkommt
const DEMO_CD_ID = '0112/2///61360_7#AAS006';
// Kennung des Demo-Kontos; Tabellenzeilen anderer Personen werden unkenntlich gemacht
const DEMO_ACCOUNT = process.env.DEMO_ACCOUNT || '@initial.orga';
const INFRASTRUCTURE_ID = process.env.INFRASTRUCTURE_ID || '1';
const editorUrl = `aas/v3/repo-edit/${INFRASTRUCTURE_ID}/${encodeURIComponent(DEMO.aasId)}`;
const viewerUrl = `viewer/aas-view/${INFRASTRUCTURE_ID}/${encodeURIComponent(DEMO.aasId)}`;
const outDir = join(IMG_DIR, 'designer');

// Personenbezogene Bilder und Inhalte in der Kopfleiste unkenntlich machen
const PRIVACY_CSS = `
  .user-avatar img, p-avatar img, lib-app-topbar p-button img { filter: blur(12px) !important; }
  .p-toast { display: none !important; }
`;

if (!existsSync(AUTH_FILE)) {
  console.error('Keine gespeicherte Sitzung gefunden. Bitte zuerst `npm run screenshots:login` ausführen.');
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: process.env.HEADED !== '1' });
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 1,
  locale: 'de-DE',
  storageState: AUTH_FILE,
});
await context.addInitScript(() => {
  localStorage.setItem('aasportal_currentLanguage', 'de');
  localStorage.setItem('designer-darkMode', 'false');
  localStorage.setItem('designer-fontSize', 'small');
});
const page = await context.newPage();
page.setDefaultTimeout(30_000);

async function open(path) {
  await page.goto(new URL(path, BASE_URL).toString());
  await page.waitForLoadState('networkidle');
  await page.addStyleTag({ content: PRIVACY_CSS });
  if (page.url().includes('/login')) {
    throw new Error('Sitzung abgelaufen. Bitte `npm run screenshots:login` erneut ausführen.');
  }
}

async function shot(name, options = {}) {
  await page.waitForTimeout(600);
  const path = join(outDir, `${name}.png`);
  await page.screenshot({ path, animations: 'disabled', ...options });
  console.log(`  ${name}.png`);
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const button = (name) =>
  page.locator('button').filter({ visible: true, hasText: new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`) });
const menuItem = (name) =>
  page.locator('.p-tieredmenu-item-content, .p-menu-item-content').filter({ visible: true, hasText: new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`) });
const treeItem = (label) =>
  page.locator('[role=treeitem]').filter({ has: page.locator('.aas-treenode-label', { hasText: new RegExp(`^\\s*${escapeRegExp(label)}\\s*$`) }) });

async function expandTreeItem(label) {
  const item = treeItem(label).first();
  if ((await item.getAttribute('aria-expanded')) !== 'true') {
    await item.locator('button').first().click();
  }
}

async function openTreeMenu(label) {
  await treeItem(label).first().locator('aas-v3-tree-context-menu button').click();
}

// Zeilen unkenntlich machen, die nicht zum Demo-Konto gehören (keep = null: alle Zeilen)
async function blurRows(selector, keep = DEMO_ACCOUNT) {
  await page.locator(selector).evaluateAll(
    (rows, keepText) =>
      rows
        .filter((row) => !keepText || !row.textContent.includes(keepText))
        .forEach((row) => (row.style.filter = 'blur(6px)')),
    keep,
  );
}

async function closeOverlays() {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function startGuidedMode(cardIndex) {
  await open('aas');
  await button('Auswählen').nth(cardIndex).click();
  await page.waitForURL(/generator\/asset-metadata/);
  await page.waitForLoadState('networkidle');
}

async function fillDescription(demo) {
  const inputs = page.locator('aas-multilanguage-property textarea').filter({ visible: true });
  await inputs.nth(0).fill(demo.descriptionEn);
  await inputs.nth(1).fill(demo.descriptionDe);
}

async function ensureDemoAas() {
  await open(editorUrl);
  const found = await treeItem(DEMO.idShort)
    .first()
    .waitFor({ timeout: 20_000 })
    .then(() => true)
    .catch(() => false);
  if (found) return;
  console.log('  Demo-AAS fehlt, wird über den geführten Modus angelegt');
  await startGuidedMode(0);
  await fillDescription(DEMO);
  for (let i = 0; i < 60 && !page.url().includes('confirmation'); i++) {
    await button('Weiter').click();
    await page.waitForTimeout(400);
  }
  await button('Speichern').click();
  await page.waitForURL(/repo-edit/);
  await treeItem(DEMO.idShort).waitFor();
}

const shellRow = (text) => page.locator('table tbody tr').filter({ hasText: text });

async function openShellRowMenu(text) {
  await open('shells-list');
  await shellRow(text).first().waitFor();
  await shellRow(text).first().locator('button[aria-label="Weitere Aktionen"]').click();
}

async function ensureDemoTypeAas() {
  await open('shells-list');
  await page.locator('table tbody tr').first().waitFor();
  if (await shellRow(TYPE_DEMO.match).count()) return;
  console.log('  Demo-Typ-AAS fehlt, wird über den geführten Modus angelegt');
  await startGuidedMode(1);
  await fillDescription(TYPE_DEMO);
  for (let i = 0; i < 60 && !page.url().includes('confirmation'); i++) {
    await button('Weiter').click();
    await page.waitForTimeout(400);
  }
  await button('Speichern').click();
  await page.waitForURL(/repo-edit/);
}

async function ensureDemoAddress() {
  await open('my-space/addresses');
  await page.locator('table').first().waitFor();
  if (await page.locator('table tbody tr').filter({ hasText: DEMO_ADDRESS.name }).count()) return;
  console.log('  Demo-Adresse fehlt, wird angelegt');
  await button('Hinzufügen').click();
  const dialog = page.locator('.p-dialog');
  const texts = dialog.locator('textarea').filter({ visible: true });
  await texts.nth(0).waitFor();
  // Reihenfolge der Textfelder: Name en/de, Straße en/de, Ort en/de, Bundesland en/de
  await texts.nth(0).fill(DEMO_ADDRESS.name);
  await texts.nth(1).fill(DEMO_ADDRESS.name);
  await texts.nth(2).fill(DEMO_ADDRESS.street);
  await texts.nth(3).fill(DEMO_ADDRESS.street);
  await dialog.getByPlaceholder('z.B. 10115').fill(DEMO_ADDRESS.zip);
  await texts.nth(4).fill(DEMO_ADDRESS.city);
  await texts.nth(5).fill(DEMO_ADDRESS.city);
  await dialog.locator('p-select').filter({ hasText: 'Bitte ein Land auswählen.' }).click();
  await page.locator('.p-select-option').filter({ hasText: /Deutschland|Germany/ }).first().click();
  await texts.nth(6).fill('Berlin');
  await texts.nth(7).fill('Berlin');
  await dialog.locator('button').filter({ hasText: 'Speichern' }).click();
  await page.locator('table tbody tr').filter({ hasText: DEMO_ADDRESS.name }).waitFor();
}

async function ensureDemoSnippet() {
  await open('my-space/snippets');
  await page.locator('table').first().waitFor();
  if (await page.locator('table tbody tr').filter({ hasText: DEMO_SNIPPET.name }).count()) return;
  console.log('  Demo-Schnipsel fehlt, wird aus GeneralInformation gespeichert');
  await ensureDemoAas();
  await expandTreeItem('TechnicalData');
  await openTreeMenu('GeneralInformation');
  await menuItem('Speichern als...').click();
  await menuItem('Als Schnipsel speichern').click();
  const dialog = page.locator('.p-dialog');
  await dialog.locator('input').filter({ visible: true }).first().fill(DEMO_SNIPPET.name);
  await dialog.locator('textarea').filter({ visible: true }).first().fill(DEMO_SNIPPET.description);
  await dialog.locator('button').filter({ hasText: /Speichern|Erstellen/ }).last().click();
  await page.waitForTimeout(1500);
}

const sections = {
  async dashboard() {
    await open('dashboard');
    const choose = button('Auswählen');
    if (await choose.count()) {
      await shot('dashboard-seite-waehlen');
      await choose.first().click();
    }
    await page.getByText('Zuletzt bearbeitete AAS').waitFor();
    await shot('dashboard-uebersicht');
    await button('Layout bearbeiten').click();
    await page.getByText('Builder', { exact: true }).waitFor();
    await shot('dashboard-layout-bearbeiten');
    await button('Abbrechen').click();
  },

  async listen() {
    await open('shells-list');
    await page.locator('table tbody tr').first().waitFor();
    await shot('shells-liste');
    await button('Hinzufügen').click();
    await shot('shells-hinzufuegen');
    await closeOverlays();
    await open('submodels');
    await page.locator('table tbody tr').first().waitFor();
    await shot('teilmodelle-liste');
    await open('cds-list');
    await page.locator('table tbody tr').first().waitFor();
    await shot('konzeptbeschreibungen-liste');
  },

  async gefuehrt() {
    await open('aas');
    await page.getByText('Spezialisierte Assistenten').waitFor();
    await shot('gefuehrter-modus');

    await startGuidedMode(0);
    await fillDescription(WIZARD_DEMO);
    await shot('assistent-basisdaten');
    await button('Weiter').click();
    await page.getByText('Prüfe die erzeugten Kennungen').first().waitFor();
    await page.getByText('Verfügbar', { exact: true }).waitFor();
    await shot('assistent-kennungen');
    await button('Weiter').click();
    await button('Weiter').click();
    await page.waitForURL(/generator\/nameplate/);
    await shot('assistent-typenschild');
    for (let i = 0; i < 60 && !page.url().includes('generator/document'); i++) {
      await button('Weiter').click();
      await page.waitForTimeout(300);
    }
    await shot('assistent-dokumente');
    await button('Weiter').click();
    await page.waitForURL(/confirmation/);
    // Nicht speichern: die Demo-AAS existiert bereits
    await shot('assistent-zusammenfassung');

    await startGuidedMode(3);
    await shot('assistent-batteriepass');
    await startGuidedMode(4);
    await shot('assistent-dpp');
  },

  async editor() {
    await ensureDemoAas();
    await treeItem(DEMO.idShort).first().click();
    await shot('editor-uebersicht');

    await openTreeMenu(DEMO.idShort);
    await menuItem('Hinzufügen').click();
    await shot('editor-menue-hinzufuegen');
    await menuItem('Teilmodelle').click();
    await page.getByText('Teilmodell einfügen').waitFor();
    await shot('teilmodell-einfuegen');
    await page.locator('.p-dialog tr').filter({ hasText: 'IDTA (live aus dem Repository)' }).locator('button').first().click();
    const search = page.getByPlaceholder('Durchsuchen').last();
    await search.fill('TechnicalData');
    await page.waitForTimeout(800);
    await shot('teilmodell-einfuegen-idta');
    await button('Schließen').click();

    if (!(await treeItem('TechnicalData').count())) {
      throw new Error('Die Demo-AAS enthält kein Teilmodell TechnicalData. Bitte einmal im Editor aus den IDTA-Vorlagen einfügen.');
    }
    await expandTreeItem('TechnicalData');
    await expandTreeItem('GeneralInformation');
    await treeItem('ManufacturerName').first().click();
    await page.getByText('Inhalt', { exact: true }).waitFor();
    await shot('editor-wert-bearbeiten');

    await openTreeMenu('GeneralInformation');
    await menuItem('Hinzufügen').click();
    await shot('editor-menue-element');
    await closeOverlays();

    await page.locator('button[aria-label="Weitere Aktionen"]:not(aas-v3-tree-context-menu button)').click();
    await shot('editor-weitere-aktionen');
    await closeOverlays();
  },

  async viewer() {
    await open(viewerUrl);
    await page.getByText('Formatierte Anzeige', { exact: true }).waitFor();
    await shot('viewer-typenschild');
    await page.getByText('TechnicalData', { exact: true }).filter({ visible: true }).first().click();
    await page.waitForTimeout(1000);
    await shot('viewer-technische-daten');
    await page.getByText('JSON Ansicht', { exact: true }).click();
    await shot('viewer-json');
  },

  async typinstanz() {
    await ensureDemoTypeAas();
    await openShellRowMenu(TYPE_DEMO.match);
    await menuItem('Erweitert').click();
    await menuItem('Instanz erstellen').waitFor();
    await shot('shells-menue-erweitert');
    await menuItem('Instanz erstellen').click();
    const dialog = page.locator('.p-dialog');
    await dialog.getByText('Seriennummer').waitFor();
    await dialog.locator('input').filter({ visible: true }).first().fill('SN-DEMO-0001');
    await shot('instanz-erstellen');
    await dialog.locator('button').filter({ hasText: 'Abbrechen' }).click();
  },

  async importexport() {
    await openShellRowMenu(DEMO.idShort);
    await menuItem('Exportieren').click();
    await menuItem('Export *.aasx').waitFor();
    await shot('shells-menue-exportieren');
    await menuItem('Export *.aasx').click();
    await page.locator('.p-dialog').getByText('Aasx Exportformat').waitFor();
    await shot('export-aasx');
    await closeOverlays();

    await open('shells-list');
    await button('Hinzufügen').click();
    await menuItem('AASX hochladen').click();
    await page.locator('.p-dialog').getByText('Importmodus wählen').waitFor();
    await shot('import-aasx');
    await closeOverlays();
  },

  async konzeptbeschreibung() {
    await open(`cd-edit/${INFRASTRUCTURE_ID}/${encodeURIComponent(DEMO_CD_ID)}`);
    await page.getByText('Beschreibung bearbeiten').waitFor();
    await shot('konzeptbeschreibung-bearbeiten');
    await page.getByText('Datendefinition', { exact: true }).click();
    await page.getByText('Definition 1').first().scrollIntoViewIfNeeded();
    await page.getByText('Bevorzugter Name').first().waitFor();
    await page.getByText('Datendefinition', { exact: true }).evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await shot('konzeptbeschreibung-datendefinition');
  },

  async validierung() {
    await ensureDemoAas();
    await page.locator('.p-splitbutton-dropdown').filter({ visible: true }).first().click();
    await menuItem('IDs validieren').waitFor();
    await shot('validierung-menue');
    await menuItem('Validieren').click();
    const dialog = page.locator('.p-dialog').filter({ hasText: 'Validierungsergebnisse' });
    const hasErrors = await dialog
      .waitFor({ timeout: 8000 })
      .then(() => true)
      .catch(() => false);
    if (hasErrors) {
      await shot('validierung-ergebnis');
      await closeOverlays();
    } else {
      console.log('  Keine Validierungsfehler, Bild validierung-ergebnis wird nicht erneuert');
    }
  },

  async teilmodell() {
    await ensureDemoAas();
    await treeItem('TechnicalData').first().click();
    await page.getByText('Technische Daten', { exact: true }).first().waitFor();
    await shot('editor-teilmodell-ansicht');
    await button('Bearbeiten').click();
    await page.waitForTimeout(1000);
    const submodelId = await page
      .locator('input')
      .filter({ visible: true })
      .evaluateAll((inputs) => inputs.map((i) => i.value).find((v) => v.includes('/ids/sm/')));
    if (!submodelId) throw new Error('ID des Teilmodells TechnicalData nicht gefunden');
    await open(`submodel-edit/${INFRASTRUCTURE_ID}/${encodeURIComponent(submodelId)}`);
    await treeItem('TechnicalData').first().waitFor();
    await expandTreeItem('GeneralInformation');
    await treeItem('ManufacturerName').first().click();
    await page.getByText('Inhalt', { exact: true }).waitFor();
    await shot('teilmodell-bearbeiten');
  },

  async dpp() {
    await ensureDemoAas();
    await treeItem(DEMO.idShort).first().click();
    const create = button('DPP-Metadaten anlegen');
    if (!(await create.count())) {
      console.log('  Kein DPP-Gateway konfiguriert oder Metadaten bereits vorhanden, übersprungen');
      return;
    }
    await create.click();
    await page.locator('.p-dialog').getByText('DPP-Teilmodelle').waitFor();
    await shot('dpp-metadaten-anlegen');
    await closeOverlays();
  },

  async teilen() {
    await openShellRowMenu(DEMO.idShort);
    await menuItem('Link zum Teilen erzeugen').click();
    const dialog = page.locator('.p-dialog');
    await dialog.locator('textarea').fill('Demo-Link für das Handbuch');
    await shot('geteilter-link-erzeugen');
    await dialog.locator('button').filter({ hasText: 'Abbrechen' }).click();

    await open('my-space/shared-links');
    const row = page.locator('table tbody tr').filter({ hasText: DEMO.idShort }).first();
    await row.waitFor();
    await shot('geteilte-links');
    const link = await row.locator('a').first().getAttribute('href');

    // Der öffentliche Viewer läuft ohne Anmeldung, deshalb in einem eigenen Kontext
    const anonymous = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, locale: 'de-DE' });
    await anonymous.addInitScript(() => localStorage.setItem('aasportal_currentLanguage', 'de'));
    const viewer = await anonymous.newPage();
    const accessCode = new URL(link, BASE_URL).searchParams.get('accesscode');
    await viewer.goto(new URL(`public-viewer?accesscode=${accessCode}`, BASE_URL).toString());
    await viewer.getByText('Formatierte Anzeige', { exact: true }).waitFor();
    await viewer.waitForLoadState('networkidle');
    await viewer.waitForTimeout(800);
    await viewer.screenshot({ path: join(outDir, 'public-viewer.png'), animations: 'disabled' });
    console.log('  public-viewer.png');
    await anonymous.close();
  },

  async meinbereich() {
    await open('my-space/profile');
    await page.getByText('Persönliche Informationen').waitFor();
    await shot('mein-profil');
    await open('my-space/organisations');
    await page.getByText('Meine Organisationen').waitFor();
    await shot('meine-organisationen');

    await ensureDemoAddress();
    await shot('adressen');
    await button('Hinzufügen').click();
    await page.locator('.p-dialog').getByText('Adresse hinzufügen').waitFor();
    await shot('adresse-hinzufuegen');
    await closeOverlays();

    await open('my-space/product-designation');
    await page.locator('table tbody tr').first().waitFor();
    await shot('produktbezeichnungen');
    await button('Hinzufügen').click();
    await page.locator('.p-dialog').waitFor();
    await shot('produktbezeichnung-hinzufuegen');
    await closeOverlays();
  },

  async schnipsel() {
    await ensureDemoSnippet();
    await open('my-space/snippets');
    await page.locator('table tbody tr').filter({ hasText: DEMO_SNIPPET.name }).waitFor();
    await shot('schnipsel-liste');

    await ensureDemoAas();
    await expandTreeItem('TechnicalData');
    await openTreeMenu('GeneralInformation');
    await menuItem('Speichern als...').click();
    await menuItem('Als Schnipsel speichern').click();
    await page.locator('.p-dialog').getByText('Schnipsel erstellen').waitFor();
    await page.locator('.p-dialog input').filter({ visible: true }).first().fill(DEMO_SNIPPET.name);
    await shot('schnipsel-speichern');
    await closeOverlays();

    await openTreeMenu('TechnicalData');
    await menuItem('Hinzufügen').click();
    await menuItem('Schnipsel').click();
    await page.locator('.p-dialog').getByText('Schnipsel einfügen').waitFor();
    await page.waitForTimeout(800);
    await shot('schnipsel-einfuegen');
    await closeOverlays();
  },

  async organisation() {
    await open('my-organization/details');
    await page.getByText('Organisationsdetails').first().waitFor();
    await shot('organisation-details');

    await open('my-organization/users');
    const rows = page.locator('aas-organisation-user-list table tbody tr');
    await rows.first().waitFor();
    await blurRows('aas-organisation-user-list table tbody tr');
    await shot('organisation-benutzer');
    await rows.filter({ hasText: DEMO_ACCOUNT }).first().locator('button').first().click();
    await menuItem('Rollen bearbeiten').click();
    await page.locator('.p-dialog').filter({ visible: true }).waitFor();
    await shot('organisation-rollen-bearbeiten');
    await closeOverlays();

    await open('my-organization/eclass');
    await page.getByText('ECLASS Webservice Zertifikat').waitFor();
    await shot('organisation-eclass');

    await open('my-organization/token');
    await button('Token hinzufügen').click();
    const dialog = page.locator('.p-dialog').filter({ visible: true });
    await dialog.waitFor();
    await dialog.locator('textarea').first().fill('Demo-Backup für das Handbuch');
    await dialog.locator('p-select').first().click();
    await page.locator('.p-select-option').first().click();
    await shot('organisation-token');
    await closeOverlays();

    await open(`my-organization/infrastructure/${INFRASTRUCTURE_ID}`);
    await page.getByText('Infrastruktur-Zugriffsrechte').first().waitFor();
    await blurRows('aas-infrastruktur-rechte table tbody tr');
    await shot('organisation-infrastruktur');
  },

  async system() {
    await open('system-management/template-management');
    await page.getByText('Teilmodell-Vorlagen').first().waitFor();
    await shot('system-templates');

    await open('system-management/cors-config');
    await page.locator('aas-cors-list').waitFor();
    // Vorhandene Einträge können Adressen von Kunden enthalten
    await blurRows('aas-cors-list table tbody tr:has(td:nth-child(2))', null);
    await button('Hinzufügen').click();
    const corsDialog = page.locator('.p-dialog').filter({ visible: true });
    await corsDialog.locator('input').first().fill('https://shop.example.com');
    await corsDialog.locator('textarea').first().fill('Demo-Shop mit eingebetteten Web Components');
    await shot('system-cors');
    await closeOverlays();

    // News-Editor mit Demo-Text; wird nicht gespeichert
    await open('system-management/news-management/new');
    await page.locator('aas-news-management-editor input').first().fill('Neue Funktion: Digitaler Produktpass');
    await page.locator('aas-news-management-editor .ql-editor').fill('Ab sofort lassen sich DPP-Metadaten direkt im Editor anlegen.');
    await shot('system-news');

    await open('system-management/job-settings/idta-crawler');
    await page.getByText('Ausführungsintervall').first().waitFor();
    await shot('system-jobs');
  },

  async idta() {
    await open('idta-submodels');
    const node = (label) =>
      page.locator('.sidebar-tree-item').filter({ has: page.locator('.sidebar-tree-label', { hasText: new RegExp(`^\\s*${escapeRegExp(label)}\\s*$`) }) });
    await node('Carbon Footprint').first().click();
    await node('1').first().click();
    await node('0').first().click();
    await node('IDTA 02023 _Template_CarbonFootprint.json').first().click();
    await page.waitForTimeout(1500);
    await shot('idta-submodels');
  },

  // Nur Enterprise: veröffentlicht die Demo-AAS im Markt der lokalen Installation (Bilder unter img/markt/).
  // Voraussetzung: Das Demo-Konto hat auf der Infrastruktur das Recht "Marktplatz veröffentlichen".
  async markt() {
    const marktDir = join(IMG_DIR, 'markt');
    mkdirSync(marktDir, { recursive: true });
    const marktShot = async (target, name) => {
      await target.waitForTimeout(800);
      await target.screenshot({ path: join(marktDir, `${name}.png`), animations: 'disabled' });
      console.log(`  markt/${name}.png`);
    };

    await ensureDemoAas();
    await openShellRowMenu(DEMO.idShort);
    await menuItem('Erweitert').click();
    await menuItem('Im Marktplatz veröffentlichen').click();
    const dialog = page.locator('.p-dialog').filter({ visible: true });
    await dialog.locator('input').first().fill(DEMO.descriptionDe);
    await dialog.locator('textarea').first().fill('Kreiselpumpe für Kühlkreisläufe, Beispiel für das Handbuch.');
    await marktShot(page, 'veroeffentlichen');
    await button('Veröffentlichen').click();
    await page.waitForTimeout(1500);

    await open('markt-freigaben/einzeln');
    await page.locator('table tbody tr').filter({ hasText: DEMO.descriptionDe }).first().waitFor();
    await marktShot(page, 'einzelfreigaben');

    // Regel nur testen, nicht speichern
    await open('markt-freigaben/regex');
    await button('Neue Regel').click();
    const rule = page.locator('.p-dialog').filter({ visible: true });
    await rule.locator('input').first().fill('Demo-Kreiselpumpen');
    await rule.locator('p-select').nth(0).click();
    await page.locator('.p-select-option').first().click();
    await rule.locator('p-select').nth(1).click();
    await page.locator('.p-select-option').filter({ hasText: 'IdShort' }).first().click();
    await rule.locator('input').filter({ visible: true }).last().fill('^demoKreiselpumpe.*');
    await rule.locator('button').filter({ hasText: 'Testen (Dry Run)' }).click();
    await page.waitForTimeout(2000);
    await marktShot(page, 'regel');
    await closeOverlays();

    // Der Markt selbst ist öffentlich, deshalb ohne Anmeldung
    const anonymous = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, locale: 'de-DE' });
    await anonymous.addInitScript(() => localStorage.setItem('aasportal_currentLanguage', 'de'));
    const markt = await anonymous.newPage();
    const marktUrl = new URL('../markt-ui/', BASE_URL);
    await markt.goto(new URL('browse', marktUrl).toString());
    await markt.getByText(DEMO.descriptionDe).first().waitFor();
    await markt.waitForLoadState('networkidle');
    await marktShot(markt, 'durchsuchen');
    await markt.getByText('Details anzeigen').first().click();
    await markt.waitForURL(/listing/);
    await markt.waitForLoadState('networkidle');
    await markt.waitForTimeout(2500);
    await marktShot(markt, 'detail');
    await anonymous.close();
  },
};

const selected = process.argv.slice(2);
try {
  for (const [name, run] of Object.entries(sections)) {
    if (selected.length > 0 && !selected.includes(name)) continue;
    console.log(name);
    await run();
  }
} finally {
  await browser.close();
}
