// Bedienhilfen für den Designer. Selektoren bevorzugt über Rollen und sichtbare Beschriftungen
// (frontend/libs/translations/i18n/de.json); wo die Oberfläche keine Rolle bietet, über stabile Klassen.
import { expect } from '@playwright/test';

// Genau diese Beschriftung; davor und dahinter dürfen Leerraum und Icon-Zeichen (Icon-Fonts) stehen
const exact = (text) =>
  new RegExp(`^[^\\p{L}\\p{N}]*${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\p{L}\\p{N}]*$`, 'u');

/** Sichtbarer Button mit genau dieser Beschriftung */
export const button = (page, name) => page.getByRole('button', { name: exact(name) }).filter({ visible: true });

/** Eintrag in einem geöffneten Menü (Kontextmenü, TieredMenu) */
export const menuItem = (page, name) =>
  page.getByRole('menuitem', { name: exact(name) }).filter({ visible: true }).first();

/** Sichtbarer Dialog, optional über seinen Titel */
export const dialog = (page, title) =>
  (title ? page.getByRole('dialog', { name: title }) : page.getByRole('dialog')).filter({ visible: true }).last();

/** Knoten im AAS-Baum des Editors über seine Beschriftung */
export const treeItem = (page, label) =>
  page
    .getByRole('treeitem')
    .filter({ has: page.locator('.aas-treenode-label', { hasText: exact(label) }) })
    .first();

/** Zeile einer Tabelle, die den Text enthält */
export const row = (page, text) => page.locator('table tbody tr').filter({ hasText: text }).first();

export async function expandTreeItem(page, label) {
  const item = treeItem(page, label);
  await expect(item).toBeVisible();
  if ((await item.getAttribute('aria-expanded')) !== 'true') {
    await item.locator('button').first().click();
    await expect(item).toHaveAttribute('aria-expanded', 'true');
  }
}

export async function openTreeMenu(page, label) {
  await treeItem(page, label).locator('aas-v3-tree-context-menu button').click();
}

/** Menü „Weitere Aktionen" einer Zeile in der Liste der Verwaltungsschalen öffnen */
export async function openShellRowMenu(page, text) {
  await page.goto('shells-list');
  await expect(row(page, text)).toBeVisible();
  await row(page, text).getByRole('button', { name: 'Weitere Aktionen' }).click();
}

/** Offene Menüs und Dialoge schließen und warten, bis sie weg sind */
export async function closeOverlays(page) {
  const open = page.getByRole('dialog').or(page.getByRole('menu')).filter({ visible: true });
  await page.keyboard.press('Escape');
  if (await expect(open).toHaveCount(0, { timeout: 3000 }).then(() => true, () => false)) return;
  // Dialoge, die nicht auf Escape reagieren: Schließen-Symbol bzw. „Abbrechen"
  const dialog = page.getByRole('dialog').filter({ visible: true }).last();
  const close = dialog
    .locator('.p-dialog-close-button, .p-dialog-header-close')
    .or(dialog.getByRole('button', { name: exact('Abbrechen') }))
    .or(dialog.getByRole('button', { name: exact('Schließen') }))
    .filter({ visible: true });
  if (await close.count()) await close.first().click();
  else await page.keyboard.press('Escape');
  await expect(open).toHaveCount(0);
}

/** Zeilen einer Tabelle, die nicht zum Demo-Konto gehören (keep = null: alle Zeilen) */
export const rowsExcept = (page, selector, keep) =>
  keep ? page.locator(selector).filter({ hasNotText: keep }) : page.locator(selector);
