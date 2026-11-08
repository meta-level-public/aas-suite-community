import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@openng/optimus-ui/dynamicdialog';
import { DppPcfEntry } from 'battery-passport-assistant';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PcfEntryMapperService } from '../../general/pcf-entry-assistant/pcf-entry-mapper.service';
import { V3TreeItem } from '../model/v3-tree-item';
import { V3TreeService } from '../v3-tree/v3-tree.service';
import { V3EditorPcfService } from './v3-editor-pcf.service';

const T = aas.types;
const PRODUCT_LIST_SEMANTIC_ID = 'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprints/1/0';
const SECTOR_LIST_SEMANTIC_ID =
  'https://admin-shell.io/idta/CarbonFootprint/ProductOrSectorSpecificCarbonFootprints/1/0';

function externalReference(value: string) {
  return new T.Reference(T.ReferenceTypes.ExternalReference, [new T.Key(T.KeyTypes.GlobalReference, value)]);
}

function pcfList(idShort: string, semanticId?: string, entries: aas.types.ISubmodelElement[] = []) {
  const list = new T.SubmodelElementList(T.AasSubmodelElements.SubmodelElementCollection, null, null, idShort);
  if (semanticId != null) {
    list.semanticId = externalReference(semanticId);
  }
  list.value = entries;
  return list;
}

function entryCollection(idShort: string, co2eq: string) {
  const co2 = new T.Property(T.DataTypeDefXsd.Decimal, null, null, 'PcfCo2eq');
  co2.value = co2eq;
  const collection = new T.SubmodelElementCollection(null, null, idShort);
  collection.value = [co2];
  return collection;
}

function treeItem<C>(content: C, parent?: V3TreeItem<any>) {
  const item = new V3TreeItem<C>();
  item.content = content;
  item.parent = parent;
  item.id = `node-${Math.random()}`;
  return item;
}

const productEntry: DppPcfEntry = {
  id: 'new',
  type: 'product-carbon-footprint',
  values: { 'pcf-co2eq': '17.8', 'pcf-reference-impact-unit': 'kg' },
};

describe('V3EditorPcfService', () => {
  let service: V3EditorPcfService;
  let dialogService: { open: ReturnType<typeof vi.fn> };
  let dialogClose$: Subject<DppPcfEntry | null>;
  let dialogRef: { onClose: Subject<DppPcfEntry | null>; close: ReturnType<typeof vi.fn> };
  let treeService: { refreshWholeTree: ReturnType<typeof vi.fn>; selectNodeByElement: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.useFakeTimers();
    dialogClose$ = new Subject();
    dialogRef = { onClose: dialogClose$, close: vi.fn() };
    dialogService = { open: vi.fn(() => dialogRef) };
    treeService = { refreshWholeTree: vi.fn(), selectNodeByElement: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        V3EditorPcfService,
        PcfEntryMapperService,
        { provide: DialogService, useValue: dialogService },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: V3TreeService, useValue: treeService },
      ],
    });

    service = TestBed.inject(V3EditorPcfService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getPcfListType', () => {
    it('detects product and sector lists by semantic id', () => {
      expect(service.getPcfListType(pcfList('Footprints', PRODUCT_LIST_SEMANTIC_ID))).toBe('product-carbon-footprint');
      expect(service.getPcfListType(pcfList('Footprints', SECTOR_LIST_SEMANTIC_ID))).toBe(
        'product-or-sector-specific-carbon-footprint',
      );
    });

    it('falls back to the template idShort when no semantic id is set', () => {
      expect(service.getPcfListType(pcfList('ProductCarbonFootprints'))).toBe('product-carbon-footprint');
      expect(service.getPcfListType(pcfList('ProductOrSectorSpecificCarbonFootprints'))).toBe(
        'product-or-sector-specific-carbon-footprint',
      );
    });

    it('returns null for unrelated lists', () => {
      expect(service.getPcfListType(pcfList('Markings', 'https://admin-shell.io/zvei/nameplate/1/0/Markings'))).toBe(
        null,
      );
    });
  });

  describe('selection detection', () => {
    it('recognizes a selected product carbon footprint list', () => {
      service.selectedElement = treeItem(pcfList('ProductCarbonFootprints', PRODUCT_LIST_SEMANTIC_ID));

      expect(service.isPcfListSelection()).toBe(true);
      expect(service.isProductCarbonFootprintListSelection()).toBe(true);
      expect(service.isProductOrSectorSpecificCarbonFootprintListSelection()).toBe(false);
      expect(service.isPcfEntrySelection()).toBe(false);
      expect(service.isPcfAssistantContextSelection()).toBe(true);
    });

    it('recognizes a selected entry inside a sector specific list', () => {
      const entry = entryCollection('Element_0', '3.2');
      const list = pcfList('ProductOrSectorSpecificCarbonFootprints', SECTOR_LIST_SEMANTIC_ID, [entry]);
      service.selectedElement = treeItem(entry, treeItem(list));

      expect(service.isPcfEntrySelection()).toBe(true);
      expect(service.isProductOrSectorSpecificCarbonFootprintEntrySelection()).toBe(true);
      expect(service.isProductCarbonFootprintEntrySelection()).toBe(false);
      expect(service.isPcfListSelection()).toBe(false);
      expect(service.pcfSelectedStep).toBe(entry);
    });

    it('ignores collections that are not part of a PCF list', () => {
      const entry = entryCollection('Element_0', '3.2');
      service.selectedElement = treeItem(entry, treeItem(pcfList('Markings', undefined, [entry])));

      expect(service.isPcfAssistantContextSelection()).toBe(false);
      expect(service.pcfSelectedStep).toBeUndefined();
    });

    it('treats an empty selection as no PCF context', () => {
      service.selectedElement = undefined;

      expect(service.isPcfAssistantContextSelection()).toBe(false);
      expect(service.pcfListViewerSubmodel).toBeUndefined();
    });
  });

  describe('pcfListViewerSubmodel', () => {
    it('wraps a copy of the selected list in a temporary carbon footprint submodel', () => {
      const entry = entryCollection('Element_0', '12.5');
      const list = pcfList('ProductCarbonFootprints', undefined, [entry]);
      service.selectedElement = treeItem(list);

      const submodel = service.pcfListViewerSubmodel;

      expect(submodel?.idShort).toBe('ProductCarbonFootprints');
      expect(submodel?.semanticId?.keys[0].value).toBe(
        'https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0',
      );
      const wrappedList = submodel?.submodelElements?.[0] as aas.types.SubmodelElementList;
      expect(wrappedList).not.toBe(list);
      expect(wrappedList.semanticId?.keys[0].value).toBe(PRODUCT_LIST_SEMANTIC_ID);
      expect(wrappedList.value).toHaveLength(1);
      expect(list.semanticId).toBeNull();
    });
  });

  describe('openAddPcfEntryAddon', () => {
    it('opens the assistant for the list type and appends the created entry', () => {
      const list = pcfList('ProductCarbonFootprints', PRODUCT_LIST_SEMANTIC_ID, [entryCollection('Element_0', '1')]);
      service.selectedElement = treeItem(list);

      service.openAddPcfEntryAddon();

      expect(dialogService.open.mock.calls[0][1]).toMatchObject({
        header: 'PCF_ADD_ENTRY',
        data: { entryType: 'product-carbon-footprint', entryIndex: 1 },
      });

      dialogClose$.next(productEntry);

      expect(list.value).toHaveLength(2);
      const added = list.value?.[1] as aas.types.SubmodelElementCollection;
      const co2 = added.value?.find((element) => element.idShort === 'PcfCo2eq') as aas.types.Property;
      expect(co2.value).toBe('17.8');
      expect(treeService.refreshWholeTree).toHaveBeenCalled();

      vi.runAllTimers();
      expect(treeService.selectNodeByElement).toHaveBeenCalledWith(list);
    });

    it('creates the list value when the list was empty', () => {
      const list = pcfList('ProductCarbonFootprints');
      list.value = null;
      service.selectedElement = treeItem(list);

      service.openAddPcfEntryAddon();
      dialogClose$.next(productEntry);

      expect(list.value).toHaveLength(1);
    });

    it('keeps the list unchanged when the dialog is cancelled', () => {
      const list = pcfList('ProductCarbonFootprints');
      service.selectedElement = treeItem(list);

      service.openAddPcfEntryAddon();
      dialogClose$.next(null);

      expect(list.value).toEqual([]);
      expect(treeService.refreshWholeTree).not.toHaveBeenCalled();
    });

    it('does nothing when the selection is not a PCF list', () => {
      service.selectedElement = treeItem(pcfList('Markings'));

      service.openAddPcfEntryAddon();

      expect(dialogService.open).not.toHaveBeenCalled();
    });
  });

  describe('openEditPcfEntryAddon', () => {
    it('edits the selected entry in place with a copy passed to the assistant', () => {
      const first = entryCollection('Element_0', '1');
      const selected = entryCollection('Element_1', '2');
      const list = pcfList('ProductCarbonFootprints', PRODUCT_LIST_SEMANTIC_ID, [first, selected]);
      service.selectedElement = treeItem(selected, treeItem(list));

      service.openEditPcfEntryAddon();

      const dialogConfig = dialogService.open.mock.calls[0][1];
      expect(dialogConfig.header).toBe('PCF_EDIT_WITH_ASSISTANT');
      expect(dialogConfig.data.entryType).toBe('product-carbon-footprint');
      expect(dialogConfig.data.entryIndex).toBe(1);
      expect(dialogConfig.data.existingElement).not.toBe(selected);
      expect(dialogConfig.data.existingElement.idShort).toBe('Element_1');

      dialogClose$.next(productEntry);

      expect(list.value?.[1]).toBe(selected);
      const co2 = selected.value?.find((element) => element.idShort === 'PcfCo2eq') as aas.types.Property;
      expect(co2.value).toBe('17.8');
      vi.runAllTimers();
      expect(treeService.selectNodeByElement).toHaveBeenCalledWith(selected);
    });

    it('edits an entry by index when the list itself is selected', () => {
      const entry = entryCollection('Element_0', '1');
      const list = pcfList('ProductCarbonFootprints', undefined, [entry]);
      service.selectedElement = treeItem(list);

      service.openEditPcfEntryAddonByIndex(0);

      expect(dialogService.open.mock.calls[0][1].data.entryIndex).toBe(0);
    });

    it('does not open the assistant for an index without entry', () => {
      service.selectedElement = treeItem(pcfList('ProductCarbonFootprints'));

      service.openEditPcfEntryAddonByIndex(3);
      service.openEditPcfEntryAddonByIndex();

      expect(dialogService.open).not.toHaveBeenCalled();
    });

    it('closes the open assistant on destroy', () => {
      service.selectedElement = treeItem(pcfList('ProductCarbonFootprints'));
      service.openAddPcfEntryAddon();

      service.destroy();

      expect(dialogRef.close).toHaveBeenCalled();
    });
  });
});
