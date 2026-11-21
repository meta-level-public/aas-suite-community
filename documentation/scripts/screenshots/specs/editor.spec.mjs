// Aufnahmen für designer/editor.md
import { expect, test } from '@playwright/test';
import { infrastructureId, paths, useSession } from '../lib/app.mjs';
import { shot } from '../lib/shot.mjs';
import { button, closeOverlays, dialog, expandTreeItem, menuItem, openTreeMenu, treeItem } from '../lib/ui.mjs';
import { AAS } from '../seed/demo-daten.mjs';

const DEMO = AAS.kreiselpumpe;

test.describe('Editor', () => {
  const s = useSession(test);

  test.beforeEach(async () => {
    await s.page.goto('shells-list');
    await s.page.goto(paths.editor(await infrastructureId(s.page), DEMO.aasId));
    await expect(treeItem(s.page, DEMO.idShort)).toBeVisible();
  });

  test('editor-uebersicht', async () => {
    await treeItem(s.page, DEMO.idShort).click();
    await shot(s.page, 'designer/editor-uebersicht');
  });

  test('editor-menue-hinzufuegen, teilmodell-einfuegen, teilmodell-einfuegen-idta', async () => {
    await openTreeMenu(s.page, DEMO.idShort);
    await menuItem(s.page, 'Hinzufügen').click();
    await expect(menuItem(s.page, 'Teilmodelle')).toBeVisible();
    await shot(s.page, 'designer/editor-menue-hinzufuegen');

    await menuItem(s.page, 'Teilmodelle').click();
    const insert = dialog(s.page);
    await expect(insert.getByText('Teilmodell einfügen')).toBeVisible();
    await shot(s.page, 'designer/teilmodell-einfuegen');

    await insert.locator('tr').filter({ hasText: 'IDTA (live aus dem Repository)' }).getByRole('button').first().click();
    await s.page.getByPlaceholder('Durchsuchen').last().fill('TechnicalData');
    await expect(insert.locator('tr').filter({ hasText: 'TechnicalData' }).first()).toBeVisible();
    await shot(s.page, 'designer/teilmodell-einfuegen-idta');
    await button(s.page, 'Schließen').click();
  });

  test('editor-wert-bearbeiten', async () => {
    await expandTreeItem(s.page, 'TechnicalData');
    await expandTreeItem(s.page, 'GeneralInformation');
    await treeItem(s.page, 'ManufacturerName').click();
    await expect(s.page.getByText('Inhalt', { exact: true })).toBeVisible();
    await shot(s.page, 'designer/editor-wert-bearbeiten');
  });

  test('editor-menue-element', async () => {
    await expandTreeItem(s.page, 'TechnicalData');
    await openTreeMenu(s.page, 'GeneralInformation');
    await menuItem(s.page, 'Hinzufügen').click();
    await shot(s.page, 'designer/editor-menue-element');
    await closeOverlays(s.page);
  });

  test('editor-weitere-aktionen', async () => {
    await s.page.locator('button[aria-label="Weitere Aktionen"]:not(aas-v3-tree-context-menu button)').click();
    await expect(menuItem(s.page, 'Export *.aasx')).toBeVisible();
    await shot(s.page, 'designer/editor-weitere-aktionen');
    await closeOverlays(s.page);
  });

  test('editor-teilmodell-ansicht, teilmodell-bearbeiten', async () => {
    await treeItem(s.page, 'TechnicalData').click();
    await expect(s.page.getByText('Technical Data', { exact: true }).first()).toBeVisible();
    await shot(s.page, 'designer/editor-teilmodell-ansicht');

    const technicalData = DEMO.environment.submodels.find((sm) => sm.idShort === 'TechnicalData');
    await s.page.goto(paths.submodelEditor(await infrastructureId(s.page), technicalData.id));
    await expect(treeItem(s.page, 'TechnicalData')).toBeVisible();
    await expandTreeItem(s.page, 'GeneralInformation');
    await treeItem(s.page, 'ManufacturerName').click();
    await expect(s.page.getByText('Inhalt', { exact: true })).toBeVisible();
    await shot(s.page, 'designer/teilmodell-bearbeiten');
  });

  test('editor-speichern-menue', async () => {
    await expandTreeItem(s.page, 'TechnicalData');
    await expandTreeItem(s.page, 'GeneralInformation');
    await treeItem(s.page, 'ManufacturerOrderCode').click();
    const value = s.page.getByRole('region', { name: 'Inhalt' }).getByRole('textbox').first();
    await expect(value).toHaveValue('KP-200-B');
    await value.fill('KP-200-B-DEMO');
    // Zweiter Splitbutton der Werkzeugleiste: Speichern (der erste ist Validieren)
    await s.page.locator('.p-splitbutton-dropdown').filter({ visible: true }).nth(1).click();
    await expect(menuItem(s.page, 'Mit Kommentar speichern')).toBeVisible();
    await shot(s.page, 'designer/editor-speichern-menue');
    await closeOverlays(s.page);
    // Änderung verwerfen
    await button(s.page, 'Reset').click();
    await expect(s.page.getByText('Sollen wirklich alle Daten zurückgesetzt werden?')).toBeVisible();
    await button(s.page, 'Ja').click();
    await expect(button(s.page, 'Reset')).toBeDisabled();
  });
});
