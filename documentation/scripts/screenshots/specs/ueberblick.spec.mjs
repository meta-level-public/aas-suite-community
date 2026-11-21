// Aufnahmen für designer/index.md (Aufbau der Oberfläche)
import { expect, test } from '@playwright/test';
import { useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';
import { button, closeOverlays } from '../lib/ui.mjs';

test.describe('Überblick', () => {
  const s = useSession(test);

  test('hauptmenue', async () => {
    await s.page.goto('shells-list');
    await button(s.page, 'Ausklappen').click();
    await expect(s.page.getByRole('link', { name: /Mein Bereich/ })).toBeVisible();
    await shot(s.page, 'designer/hauptmenue');
    await button(s.page, 'Zusammenklappen').click();
  });

  test('benutzermenue', async () => {
    await s.page.goto('shells-list');
    await s.page.getByRole('button', { name: 'Benutzermenü' }).click();
    const menu = s.page.getByRole('menu').filter({ visible: true }).last();
    await expect(menu.getByRole('menuitem', { name: 'Mein Profil' })).toBeVisible();
    await shot(s.page, 'designer/benutzermenue');
    await closeOverlays(s.page);
  });
});
