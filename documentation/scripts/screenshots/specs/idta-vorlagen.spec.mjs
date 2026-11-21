// Aufnahmen für designer/idta-vorlagen.md. Die Vorlagen lädt der Designer live aus dem GitHub der IDTA.
import { expect, test } from '@playwright/test';
import { useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';

test.describe('IDTA-Vorlagen', () => {
  const s = useSession(test);

  test('idta-submodels', async () => {
    await s.page.goto('idta-submodels');
    const node = (label) =>
      s.page
        .locator('.sidebar-tree-item')
        .filter({ has: s.page.locator('.sidebar-tree-label', { hasText: new RegExp(`^\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`) }) })
        .first();
    for (const label of ['Carbon Footprint', '1', '0', 'IDTA 02023 _Template_CarbonFootprint.json']) {
      await node(label).click();
    }
    await expect(s.page.getByText('CarbonFootprint').filter({ visible: true }).first()).toBeVisible();
    await shot(s.page, 'designer/idta-submodels');
  });
});
