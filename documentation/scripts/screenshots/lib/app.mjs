// Gemeinsame Abläufe gegen den Designer im Wegwerf-Stack: Anmelden, Voreinstellungen, API-Aufrufe.
import { expect } from '@playwright/test';
import { CONTEXT_OPTIONS } from './capture-options.mjs';
import { readStackInfo } from './stack-info.mjs';

// Angemeldete Sitzung für eine Gruppe von Aufnahmen (beforeAll); anonym für öffentliche Seiten
export async function newSession(browser, { anonymous = false } = {}) {
  const context = await browser.newContext({
    ...CONTEXT_OPTIONS,
    baseURL: readStackInfo().designerUrl,
    // Ausdrücklich leer: Playwright übernimmt sonst storageState aus der Projekt-Konfiguration
    storageState: anonymous ? { cookies: [], origins: [] } : readStackInfo().authFile,
  });
  await applyPreferences(context);
  const page = await context.newPage();
  // Feste Browserzeit: Datumsvorgaben in Formularen (z. B. Herstellungsdatum) sind in jedem Lauf gleich
  await page.clock.setFixedTime(new Date('2026-06-15T09:30:00+02:00'));
  return page;
}

// Voreinstellungen, die vor jedem Seitenaufbau gelten: Deutsch, helles Design, kleine Schrift
export async function applyPreferences(context) {
  await context.addInitScript(() => {
    // Gespeicherte Tabellen- und Baumzustände (Spaltenbreiten, Aufklappen) hängen vom Zeitpunkt früherer
    // Seitenaufrufe ab; ohne sie sieht jede Aufnahme den Ausgangszustand (stateKey="…" im Frontend)
    for (const key of Object.keys(localStorage)) {
      if (/^(aasTree|cds-list|mappings-list|marktFreigabenTree|myOrgaTree|profileTree|registryCorrectionLayout|shells-list|submodelEditorTree|submodelsTree|systemManagementTree)$/.test(key)) {
        localStorage.removeItem(key);
      }
    }
    localStorage.setItem('aasportal_currentLanguage', 'de');
    localStorage.setItem('designer-darkMode', 'false');
    localStorage.setItem('designer-fontSize', 'small');
  });
}

// Anmeldung über die Keycloak-Seite des Stacks. Endet, sobald der Designer eine Seite nach dem Login zeigt.
export async function login(page, account) {
  await page.goto('');
  await page.getByRole('button', { name: 'Einloggen' }).click();
  // Besteht noch eine Keycloak-Sitzung, entfällt das Anmeldeformular
  const username = page.locator('#username');
  const menu = page.getByRole('button', { name: 'Benutzermenü' });
  await expect(username.or(menu).first()).toBeVisible({ timeout: 60_000 });
  if (await username.isVisible()) {
    await username.fill(account.email);
    await page.locator('#password').fill(account.password);
    await page.locator('#kc-login').click();
  }
  // Beim ersten Login eines frischen Kontos: Datenschutzhinweise anerkennen (Einmal-Dialog)
  const privacy = page.getByRole('button', { name: 'Anzeigen', exact: true });
  await expect(privacy.or(menu).first()).toBeVisible({ timeout: 60_000 });
  if (await privacy.isVisible()) {
    await privacy.click();
    // Der Dialog öffnet sich hier zweimal übereinander; der obere (zuletzt geöffnete) nimmt die Klicks an
    await page
      .getByRole('button', { name: 'Ich erkenne die Datenschutzhinweise an und möchte mich einloggen' })
      .last()
      .click();
  }
  await expect(menu).toBeVisible({ timeout: 60_000 });
}

// Ruft die Designer-API mit den Kopfzeilen auf, die auch das Frontend setzt (CSRF, Organisation,
// Infrastruktur, Sprache). Läuft im Browser, damit Sitzungs-Cookies und Speicher der Anwendung gelten.
export async function api(page, path, { method = 'GET', json, form } = {}) {
  const result = await page.evaluate(
    async ({ path, method, json, form }) => {
      const cookie = (name) =>
        document.cookie
          .split(';')
          .map((c) => c.trim())
          .find((c) => c.startsWith(`${name}=`))
          ?.slice(name.length + 1);
      const infra = JSON.parse(localStorage.getItem('CURRENT_AAS_INFRASTRUCTURE') || '{}');
      const headers = {
        'X-Gui-Language': 'de',
        'X-Infrastructure-ID': String(infra?.id ?? -1),
      };
      const orgaId = sessionStorage.getItem('CURRENT_ORGA_ID');
      if (orgaId) headers['X-Organisation-ID'] = orgaId;
      const csrf = cookie('vws-csrf-request');
      if (csrf && method !== 'GET') headers['X-CSRF-TOKEN'] = decodeURIComponent(csrf);
      let body;
      if (json !== undefined) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(json);
      } else if (form) {
        body = new FormData();
        // form: Liste aus [Name, Wert]; Dateien als { name, type, content }
        for (const [key, value] of form) {
          if (typeof value === 'string') body.append(key, value);
          else body.append(key, new Blob([value.content], { type: value.type }), value.name);
        }
      }
      const response = await fetch(path, { method, headers, body, credentials: 'include' });
      const text = await response.text();
      return { status: response.status, text };
    },
    { path, method, json, form },
  );
  if (result.status >= 400) {
    throw new Error(`${method} ${path} → ${result.status}: ${result.text.slice(0, 500)}`);
  }
  try {
    return JSON.parse(result.text);
  } catch {
    return result.text;
  }
}

/**
 * Gemeinsame angemeldete Sitzung für alle Tests eines describe-Blocks (beforeAll/afterAll).
 * Gibt ein Objekt zurück, dessen Eigenschaft page in den Tests gilt.
 */
export function useSession(test, options = {}) {
  const session = { /** @type {import('@playwright/test').Page} */ page: undefined };
  test.beforeAll(async ({ browser }) => {
    session.page = await newSession(browser, options);
  });
  test.afterAll(async () => {
    await session.page?.context().close();
  });
  return session;
}

/** ID der im Designer gewählten AAS-Infrastruktur */
export async function infrastructureId(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('CURRENT_AAS_INFRASTRUCTURE') || '{}').id);
}

/** Pfade im Designer (relativ zu designer-ui/) */
export const paths = {
  editor: (infra, aasId) => `aas/v3/repo-edit/${infra}/${encodeURIComponent(aasId)}`,
  viewer: (infra, aasId) => `viewer/aas-view/${infra}/${encodeURIComponent(aasId)}`,
  submodelEditor: (infra, smId) => `submodel-edit/${infra}/${encodeURIComponent(smId)}`,
  cdEditor: (infra, cdId) => `cd-edit/${infra}/${encodeURIComponent(cdId)}`,
};

/**
 * Meldet das Demo-Konto neu an und überschreibt die gespeicherte Sitzung. Nötig nach dem Öffnen eines
 * geteilten Links im öffentlichen Viewer: Das beendet derzeit die Sitzung des Demo-Kontos auch in
 * anderen Browserkontexten (beobachtet im Wegwerf-Stack, Ursache im Server noch offen).
 */
export async function loginAgain(browser) {
  const stack = readStackInfo();
  const context = await browser.newContext({ ...CONTEXT_OPTIONS, baseURL: stack.designerUrl });
  await applyPreferences(context);
  const page = await context.newPage();
  await login(page, stack.account);
  await refreshSession(page);
  await context.storageState({ path: stack.authFile });
  await context.close();
}

/**
 * Wartet, bis der Designer eine AAS-Infrastruktur gewählt hat, und frischt dann die Sitzung auf, damit sie die
 * Rechte auf dieser Infrastruktur enthält (z. B. „Marktplatz veröffentlichen"). Wie die Anwendung über
 * /bff/session/refresh.
 */
export async function refreshSession(page) {
  await page.goto('shells-list');
  await expect
    .poll(() => infrastructureId(page), { message: 'gewählte AAS-Infrastruktur' })
    .toBeGreaterThan(0);
  await api(page, '/bff/session/refresh', { method: 'POST' });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Benutzermenü' })).toBeVisible();
}
