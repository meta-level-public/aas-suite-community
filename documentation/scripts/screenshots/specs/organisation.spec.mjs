// Aufnahmen für designer/organisation.md. Es sind nur Demo-Konto und Demo-Organisation im Bild.
// Tokens werden nie gespeichert, damit kein Schlüssel im Bild steht.
import { expect, test } from '@playwright/test';
import { infrastructureId, useSession } from '../lib/app.mjs';
import { readStackInfo } from '../lib/stack-info.mjs';
import { shot } from '../lib/shot.mjs';
import { button, closeOverlays, dialog, menuItem } from '../lib/ui.mjs';

const account = readStackInfo().account.email;

test.describe('Organisation', () => {
  const s = useSession(test);

  test('organisation-details', async () => {
    await s.page.goto('my-organization/details');
    await expect(s.page.getByText('Organisationsdetails').first()).toBeVisible();
    await shot(s.page, 'designer/organisation-details');
  });

  test('organisation-benutzer, organisation-rollen-bearbeiten', async () => {
    await s.page.goto('my-organization/users');
    const user = s.page.locator('aas-organisation-user-list table tbody tr').filter({ hasText: account });
    await expect(user).toBeVisible();
    await shot(s.page, 'designer/organisation-benutzer');
    await user.getByRole('button').first().click();
    await menuItem(s.page, 'Rollen bearbeiten').click();
    await expect(dialog(s.page)).toBeVisible();
    await shot(s.page, 'designer/organisation-rollen-bearbeiten');
    await closeOverlays(s.page);
  });

  test('organisation-eclass', async () => {
    await s.page.goto('my-organization/eclass');
    await expect(s.page.getByText('ECLASS Webservice Zertifikat')).toBeVisible();
    await shot(s.page, 'designer/organisation-eclass');
  });

  test('organisation-token', async () => {
    await s.page.goto('my-organization/token');
    await button(s.page, 'Token hinzufügen').click();
    const create = dialog(s.page);
    await create.locator('textarea').first().fill('Demo-Backup für das Handbuch');
    await create.locator('p-select').first().click();
    await s.page.getByRole('option').first().click();
    await shot(s.page, 'designer/organisation-token');
    await closeOverlays(s.page);
  });

  test('organisation-infrastruktur', async () => {
    await s.page.goto('shells-list');
    await s.page.goto(`my-organization/infrastructure/${await infrastructureId(s.page)}`);
    await expect(s.page.getByText('Infrastruktur-Zugriffsrechte').first()).toBeVisible();
    await shot(s.page, 'designer/organisation-infrastruktur');
  });

  test('organisation-benutzer-einladen', async () => {
    await s.page.goto('my-organization/users');
    await button(s.page, 'Benutzer hinzufügen').click();
    await s.page.locator('#lastName').fill('Beispiel');
    await s.page.locator('#firstname').fill('Kim');
    await s.page.locator('#email').fill('kim.beispiel@demo-pumpen.example');
    await s.page.getByRole('checkbox', { name: 'Benutzer', exact: true }).check();
    await shot(s.page, 'designer/organisation-benutzer-einladen');
    // Nicht speichern: keine Einladung verschicken
    await button(s.page, 'Abbrechen').click();
  });
});
