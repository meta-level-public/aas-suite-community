// Aufnahmen für designer/konzeptbeschreibungen.md
import { expect, test } from '@playwright/test';
import { infrastructureId, paths, useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';
import { KONZEPTBESCHREIBUNG } from '../seed/demo-daten.mjs';

test.describe('Konzeptbeschreibungen', () => {
  const s = useSession(test);

  test('konzeptbeschreibung-bearbeiten, konzeptbeschreibung-datendefinition', async () => {
    await s.page.goto('shells-list');
    await s.page.goto(paths.cdEditor(await infrastructureId(s.page), KONZEPTBESCHREIBUNG.id));
    await expect(s.page.getByText('Beschreibung bearbeiten')).toBeVisible();
    await shot(s.page, 'designer/konzeptbeschreibung-bearbeiten');

    const heading = s.page.getByText('Datendefinition', { exact: true });
    await heading.click();
    await expect(s.page.getByText('Bevorzugter Name').first()).toBeVisible();
    await heading.evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await shot(s.page, 'designer/konzeptbeschreibung-datendefinition');
  });
});
