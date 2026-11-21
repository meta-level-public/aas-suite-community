// Aufnahmen für designer/mein-bereich.md
import { expect, test } from '@playwright/test';
import { useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';
import { button, closeOverlays, dialog, row } from '../lib/ui.mjs';
import { ADRESSE, PRODUKTBEZEICHNUNG } from '../seed/demo-daten.mjs';

test.describe('Mein Bereich', () => {
  const s = useSession(test);

  test('mein-profil', async () => {
    await s.page.goto('my-space/profile');
    await expect(s.page.getByText('Persönliche Informationen')).toBeVisible();
    await shot(s.page, 'designer/mein-profil');
  });

  test('meine-organisationen', async () => {
    await s.page.goto('my-space/organisations');
    await expect(s.page.getByText('Meine Organisationen')).toBeVisible();
    await shot(s.page, 'designer/meine-organisationen');
  });

  test('adressen, adresse-hinzufuegen', async () => {
    await s.page.goto('my-space/addresses');
    await expect(row(s.page, ADRESSE.name)).toBeVisible();
    await shot(s.page, 'designer/adressen');
    await button(s.page, 'Hinzufügen').click();
    await expect(dialog(s.page).getByText('Adresse hinzufügen')).toBeVisible();
    await shot(s.page, 'designer/adresse-hinzufuegen');
    await closeOverlays(s.page);
  });

  test('produktbezeichnungen, produktbezeichnung-hinzufuegen', async () => {
    await s.page.goto('my-space/product-designation');
    await expect(row(s.page, PRODUKTBEZEICHNUNG.name)).toBeVisible();
    await shot(s.page, 'designer/produktbezeichnungen');
    await button(s.page, 'Hinzufügen').click();
    await expect(dialog(s.page)).toBeVisible();
    await shot(s.page, 'designer/produktbezeichnung-hinzufuegen');
    await closeOverlays(s.page);
  });
});
