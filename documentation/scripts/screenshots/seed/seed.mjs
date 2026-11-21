// Legt die Demo-Daten über die APIs des Designers an (nicht per SQL). Läuft im angemeldeten Browser,
// damit Sitzung, CSRF-Schutz, Organisation und gewählte Infrastruktur wie in der Anwendung gelten.
import { expect } from '@playwright/test';
import { api } from '../lib/app.mjs';
import { AAS, ADRESSE, GETEILTER_LINK, PRODUKTBEZEICHNUNG, SCHNIPSEL } from './demo-daten.mjs';

const trim = (path) => path.replace(/\/$/, '');

/**
 * @param {import('@playwright/test').Page} page angemeldet, mit gewählter Infrastruktur
 * @param {{ apiPath: string, aasApiPath: string, aasSharedLinksApiPath: string }} config Laufzeitkonfiguration
 */
export async function seed(page, config, account) {
  const apiPath = trim(config.apiPath);
  const aasApiPath = trim(config.aasApiPath);
  const sharedLinksApiPath = trim(config.aasSharedLinksApiPath);

  for (const { idShort, environment } of Object.values(AAS)) {
    await api(page, `${aasApiPath}/Packages/import`, {
      method: 'POST',
      form: [
        ['file[]', { name: `${idShort}.json`, type: 'application/json', content: JSON.stringify(environment) }],
        ['operationId', `handbuch-seed-${idShort}`],
        ['overwrite', 'true'],
        ['importMode', 'original'],
        ['importType', 'json'],
      ],
    });
  }

  // Demo-Konto darf auf der Infrastruktur lesen, schreiben und im Markt veröffentlichen
  // (wie Organisation › Infrastruktur › Infrastruktur-Zugriffsrechte)
  const { organisationId, infraId } = await page.evaluate(() => ({
    organisationId: sessionStorage.getItem('CURRENT_ORGA_ID'),
    infraId: JSON.parse(localStorage.getItem('CURRENT_AAS_INFRASTRUCTURE') || '{}').id,
  }));
  const users = await api(page, `${apiPath}/InfrastrukturRechte/GetInfraUserRechte?organisationId=${organisationId}&infraId=${infraId}`);
  const me = users.find((u) => u.email === account.email);
  if (!me) throw new Error(`Demo-Konto ${account.email} nicht in den Infrastruktur-Rechten gefunden`);
  if (!me.darfMarktPublizieren || !me.darfSchreiben) {
    await api(
      page,
      `${apiPath}/InfrastrukturRechte/UpsertUserInfraRecht?organisationId=${organisationId}&userId=${me.benutzerId}&infraId=${infraId}`,
      {
        method: 'PUT',
        json: { infrastrukturId: infraId, darfLesen: true, darfSchreiben: true, darfMarktPublizieren: true },
      },
    );
  }

  // Die IDTA-Vorlagen holt ein Hintergrund-Job nach dem Start aus GitHub; warten, bis sie da sind
  await expect
    .poll(
      async () => {
        const tree = await api(page, `${apiPath}/Idta/GetTree`).catch(() => []);
        return Array.isArray(tree) ? tree.length : 0;
      },
      { message: 'IDTA-Vorlagen geladen', timeout: 10 * 60_000, intervals: [5000] },
    )
    .toBeGreaterThan(0);

  // Die folgenden Einträge nur anlegen, wenn sie fehlen: der Seed bleibt auf einem stehenden Stack wiederholbar
  const addresses = await api(page, `${apiPath}/Adresse/GetAdressen`);
  if (!addresses.some((a) => a.name === ADRESSE.name)) {
    await api(page, `${apiPath}/Adresse/Add`, { method: 'PUT', json: ADRESSE });
  }

  const designations = await api(page, `${aasApiPath}/ProductDesignation/GetAllProductDesignations`);
  if (!designations.some((d) => d.name === PRODUKTBEZEICHNUNG.name)) {
    await api(page, `${aasApiPath}/ProductDesignation/AddProductDesignation`, {
      method: 'POST',
      json: PRODUKTBEZEICHNUNG,
    });
  }

  const snippets = await api(page, `${apiPath}/Snippet/GetSnippets?version=V3`);
  if (!snippets.some((sn) => sn.name === SCHNIPSEL.name)) await addSnippet(page, apiPath);

  const links = await api(page, `${sharedLinksApiPath}/SharedLinks/GetMySharedLinks`);
  // Die Liste liefert keine Notiz zurück; ein Link je Demo-AAS genügt
  if (!links.some((l) => l.aasIdentifier === GETEILTER_LINK.aasIdentifier)) {
    await api(page, `${sharedLinksApiPath}/SharedLinks/CreateSharedLink`, {
      method: 'POST',
      json: { ...GETEILTER_LINK, passwort: '', ablaufdatum: null },
    });
  }
}

async function addSnippet(page, apiPath) {
  // Wie der Editor: das Element als JSON-Text, im Formular noch einmal als JSON-Zeichenkette
  const snippetSaved = await api(page, `${apiPath}/Snippet/Add`, {
    method: 'PUT',
    form: [
      ['templateData', JSON.stringify(JSON.stringify(SCHNIPSEL.data, null, 2))],
      ['templateName', SCHNIPSEL.name],
      ['templateDescription', SCHNIPSEL.description],
      ['templateTyp', SCHNIPSEL.typ],
      ['version', 'V3'],
    ],
  });
  if (snippetSaved !== true) throw new Error(`Schnipsel nicht angelegt: ${JSON.stringify(snippetSaved)}`);
}
