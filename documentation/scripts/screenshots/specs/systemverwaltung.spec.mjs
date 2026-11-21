// Aufnahmen für designer/systemverwaltung.md. Eingaben in Dialogen werden nie gespeichert.
import { expect, test } from '@playwright/test';
import { useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';
import { button, closeOverlays, dialog } from '../lib/ui.mjs';

test.describe('Systemverwaltung', () => {
  const s = useSession(test);

  test('system-templates', async () => {
    await s.page.goto('system-management/template-management');
    await expect(s.page.getByText('Teilmodell-Vorlagen').first()).toBeVisible();
    await shot(s.page, 'designer/system-templates');
  });

  test('system-cors', async () => {
    await s.page.goto('system-management/cors-config');
    await expect(s.page.locator('aas-cors-list')).toBeVisible();
    await button(s.page, 'Hinzufügen').click();
    const add = dialog(s.page);
    await add.locator('input').first().fill('https://shop.demo-pumpen.example');
    await add.locator('textarea').first().fill('Demo-Shop mit eingebetteten Web Components');
    await shot(s.page, 'designer/system-cors');
    await closeOverlays(s.page);
  });

  test('system-news', async () => {
    await s.page.goto('system-management/news-management/new');
    await s.page.locator('aas-news-management-editor input').first().fill('Neue Funktion: Digitaler Produktpass');
    await s.page
      .locator('aas-news-management-editor .ql-editor')
      .fill('Ab sofort lassen sich DPP-Metadaten direkt im Editor anlegen.');
    await shot(s.page, 'designer/system-news');
  });

  test('system-jobs', async () => {
    await s.page.goto('system-management/job-settings/idta-crawler');
    await expect(s.page.getByText('Ausführungsintervall').first()).toBeVisible();
    await shot(s.page, 'designer/system-jobs');
  });

  test('system-mail', async () => {
    await s.page.goto('system-management/mail-settings');
    await expect(s.page.getByRole('heading', { name: 'Anwendungs-Mails' })).toBeVisible();
    await shot(s.page, 'designer/system-mail');
  });

  test('system-rechtslinks', async () => {
    await s.page.goto('system-management/legal-links-settings');
    await expect(s.page.getByRole('button', { name: 'Auf Dokument-Upload wechseln' }).first()).toBeVisible();
    await shot(s.page, 'designer/system-rechtslinks');
  });
});
