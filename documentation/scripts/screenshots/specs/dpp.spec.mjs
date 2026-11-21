// Aufnahmen für designer/dpp.md
import { expect, test } from '@playwright/test';
import { infrastructureId, paths, useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';
import { button, closeOverlays, dialog, treeItem } from '../lib/ui.mjs';
import { AAS } from '../seed/demo-daten.mjs';

const DEMO = AAS.kreiselpumpe;

test.describe('Digitaler Produktpass', () => {
  const s = useSession(test);

  test('dpp-metadaten-anlegen', async () => {
    await s.page.goto('shells-list');
    await s.page.goto(paths.editor(await infrastructureId(s.page), DEMO.aasId));
    await treeItem(s.page, DEMO.idShort).click();
    await button(s.page, 'DPP-Metadaten anlegen').click();
    await expect(dialog(s.page).getByText('DPP-Teilmodelle')).toBeVisible();
    await shot(s.page, 'designer/dpp-metadaten-anlegen');
    // Nicht anlegen: keine Änderung an den Demo-Daten
    await closeOverlays(s.page);
  });
});
