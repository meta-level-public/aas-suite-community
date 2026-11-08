import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AasConfirmationService, AppConfigService, PortalService } from '@aas/common-services';
import { ShellResult } from '@aas/model';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@openng/optimus-ui/dynamicdialog';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PcfEntryMapperService } from '../../general/pcf-entry-assistant/pcf-entry-mapper.service';
import { V3TreeItem } from '../model/v3-tree-item';
import { V3EditorDataStoreService } from '../v3-editor-data-store.service';
import { V3TreeService } from '../v3-tree/v3-tree.service';
import { V3EditorCapabilityService } from './v3-editor-capability.service';
import { V3EditorPcfService } from './v3-editor-pcf.service';

const T = aas.types;

const CAPABILITY_SUBMODEL_SEMANTIC_ID = 'https://admin-shell.io/idta/CapabilityDescription/1/0/Submodel';
const CAPABILITY_SET_SEMANTIC_ID = 'https://admin-shell.io/idta/CapabilityDescription/CapabilitySet/1/0';
const CAPABILITY_CONTAINER_SEMANTIC_ID = 'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0';
const AID_SUBMODEL_SEMANTIC_ID = 'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/Submodel';
const AID_INTERFACE_SEMANTIC_ID = 'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/Interface';

function withSemanticId<E extends aas.types.IHasSemantics>(element: E, semanticId: string) {
  element.semanticId = new T.Reference(T.ReferenceTypes.ExternalReference, [
    new T.Key(T.KeyTypes.GlobalReference, semanticId),
  ]);
  return element;
}

function submodel(id: string, idShort: string, semanticId?: string, elements: aas.types.ISubmodelElement[] = []) {
  const result = new T.Submodel(id);
  result.idShort = idShort;
  result.submodelElements = elements;
  return semanticId != null ? withSemanticId(result, semanticId) : result;
}

function smc(idShort: string, semanticId?: string, children: aas.types.ISubmodelElement[] = []) {
  const result = new T.SubmodelElementCollection(null, null, idShort);
  result.value = children;
  return semanticId != null ? withSemanticId(result, semanticId) : result;
}

function capabilityContainer(idShort: string, capabilityIdShort: string) {
  return smc(idShort, CAPABILITY_CONTAINER_SEMANTIC_ID, [new T.Capability(null, null, capabilityIdShort)]);
}

let nodeCounter = 0;
function treeItem<C>(content: C, parent?: V3TreeItem<any>) {
  const item = new V3TreeItem<C>();
  item.content = content;
  item.parent = parent;
  item.id = `node-${++nodeCounter}`;
  return item;
}

describe('V3EditorCapabilityService', () => {
  let service: V3EditorCapabilityService;
  let dataStore: V3EditorDataStoreService;
  let dialogService: { open: ReturnType<typeof vi.fn> };
  let dialogClose$: Subject<aas.types.SubmodelElementCollection | null>;
  let dialogRef: { onClose: Subject<aas.types.SubmodelElementCollection | null>; close: ReturnType<typeof vi.fn> };
  let confirmationService: { confirm: ReturnType<typeof vi.fn> };
  let treeService: { refreshWholeTree: ReturnType<typeof vi.fn>; selectNodeByElement: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.useFakeTimers();
    dialogClose$ = new Subject();
    dialogRef = { onClose: dialogClose$, close: vi.fn() };
    dialogService = { open: vi.fn(() => dialogRef) };
    confirmationService = { confirm: vi.fn(async () => true) };
    treeService = { refreshWholeTree: vi.fn(), selectNodeByElement: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        V3EditorCapabilityService,
        V3EditorPcfService,
        PcfEntryMapperService,
        V3EditorDataStoreService,
        { provide: DialogService, useValue: dialogService },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: AasConfirmationService, useValue: confirmationService },
        { provide: PortalService, useValue: { currentLanguage: 'de' } },
        { provide: AppConfigService, useValue: { config: { aasViewerProxyPath: '/aas-proxy/' } } },
        { provide: V3TreeService, useValue: treeService },
      ],
    });

    service = TestBed.inject(V3EditorCapabilityService);
    dataStore = TestBed.inject(V3EditorDataStoreService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('selection classification', () => {
    it('treats a capability description submodel as capability context but not as generic submodel', () => {
      service.selectedElement = treeItem(
        submodel('urn:sm:cap', 'CapabilityDescription', CAPABILITY_SUBMODEL_SEMANTIC_ID),
      );

      expect(service.isCapabilityDescriptionSubmodelSelection()).toBe(true);
      expect(service.isGenericSubmodelSelection()).toBe(false);
      expect(service.isCapabilityContextSelection()).toBe(true);
    });

    it('treats any other submodel as generic submodel with viewer toggle', () => {
      service.selectedElement = treeItem(
        submodel('urn:sm:nameplate', 'Nameplate', 'https://admin-shell.io/zvei/nameplate/2/0/Nameplate'),
      );

      expect(service.isGenericSubmodelSelection()).toBe(true);
      expect(service.isViewerToggleSelection()).toBe(true);
    });

    it('recognizes asset interfaces description submodels and interfaces', () => {
      const httpInterface = smc('InterfaceHTTP', AID_INTERFACE_SEMANTIC_ID);
      const aid = submodel('urn:sm:aid', 'AssetInterfacesDescription', AID_SUBMODEL_SEMANTIC_ID, [httpInterface]);

      service.selectedElement = treeItem(aid);
      expect(service.isAssetInterfacesDescriptionSubmodelSelection()).toBe(true);
      expect(service.isAssetInterfacesContextSelection()).toBe(true);

      service.selectedElement = treeItem(httpInterface, treeItem(aid));
      expect(service.isAssetInterfacesDescriptionInterfaceSelection()).toBe(true);
      expect(service.isAssetInterfacesContextSelection()).toBe(true);
    });

    it('does not offer a viewer toggle for ordinary submodel elements', () => {
      const property = new T.Property(T.DataTypeDefXsd.String, null, null, 'SerialNumber');
      service.selectedElement = treeItem(property, treeItem(submodel('urn:sm:nameplate', 'Nameplate')));

      expect(service.isViewerToggleSelection()).toBe(false);
      expect(service.isCapabilityEditMode()).toBe(true);
    });

    it('offers a viewer toggle for PCF lists', () => {
      const list = new T.SubmodelElementList(
        T.AasSubmodelElements.SubmodelElementCollection,
        null,
        null,
        'ProductCarbonFootprints',
      );
      TestBed.inject(V3EditorPcfService).selectedElement = treeItem(list);
      service.selectedElement = treeItem(list);
      service.syncCapabilityDetailMode();

      expect(service.isViewerToggleSelection()).toBe(true);
      expect(service.isPcfViewerMode()).toBe(true);
    });
  });

  describe('syncCapabilityDetailMode', () => {
    it('switches to viewer for viewer-capable selections and to edit otherwise', () => {
      const capabilitySet = smc('CapabilitySet', CAPABILITY_SET_SEMANTIC_ID);
      const property = new T.Property(T.DataTypeDefXsd.String, null, null, 'Note');

      service.selectedElement = treeItem(capabilitySet);
      service.syncCapabilityDetailMode();
      expect(service.capabilityDetailMode).toBe('viewer');
      expect(service.isCapabilityViewerMode()).toBe(true);

      service.selectedElement = treeItem(property);
      service.syncCapabilityDetailMode();
      expect(service.capabilityDetailMode).toBe('edit');
      expect(service.isCapabilityViewerMode()).toBe(false);
    });

    it('keeps a manually chosen mode while the selection does not change', () => {
      service.selectedElement = treeItem(smc('CapabilitySet', CAPABILITY_SET_SEMANTIC_ID));
      service.syncCapabilityDetailMode();

      service.showCapabilityEditor();
      service.syncCapabilityDetailMode();

      expect(service.capabilityDetailMode).toBe('edit');
      expect(service.isCapabilityEditMode()).toBe(true);
    });

    it('opens the next selection in edit mode once when requested', () => {
      service.requestEditModeForNextSelection();

      service.selectedElement = treeItem(smc('CapabilitySet', CAPABILITY_SET_SEMANTIC_ID));
      service.syncCapabilityDetailMode();
      expect(service.capabilityDetailMode).toBe('edit');

      service.selectedElement = treeItem(smc('CapabilitySet2', CAPABILITY_SET_SEMANTIC_ID));
      service.syncCapabilityDetailMode();
      expect(service.capabilityDetailMode).toBe('viewer');
    });
  });

  describe('viewer data', () => {
    it('resolves submodel, capability set and container from a selected container', () => {
      const container = capabilityContainer('DrillingContainer', 'Drilling');
      const capabilitySet = smc('CapabilitySet', CAPABILITY_SET_SEMANTIC_ID, [container]);
      const capabilitySubmodel = submodel('urn:sm:cap', 'CapabilityDescription', CAPABILITY_SUBMODEL_SEMANTIC_ID, [
        capabilitySet,
      ]);
      const submodelNode = treeItem(capabilitySubmodel);
      const setNode = treeItem(capabilitySet, submodelNode);
      service.selectedElement = treeItem(container, setNode);

      expect(service.capabilityViewerSubmodel).toBe(capabilitySubmodel);
      expect(service.capabilityViewerSet).toBe(capabilitySet);
      expect(service.capabilityViewerContainer).toBe(container);
    });

    it('returns no set or container for unrelated selections', () => {
      service.selectedElement = treeItem(smc('Other'));

      expect(service.capabilityViewerSet).toBeUndefined();
      expect(service.capabilityViewerContainer).toBeUndefined();
      expect(service.capabilityViewerSubmodel).toBeUndefined();
    });

    it('builds the proxied viewer url from the registered submodel endpoint', () => {
      service.selectedElement = treeItem(submodel('urn:sm:cap', 'CapabilityDescription'));
      dataStore.editorDescriptor.set({
        submodelDescriptorEntries: [
          { oldId: 'urn:sm:other', endpoint: 'https://repo.example.com/submodels/b3RoZXI' },
          { oldId: 'urn:sm:cap', endpoint: 'https://repo.example.com/submodels/dXJuOnNtOmNhcA' },
        ],
      } as never);

      expect(service.capabilityViewerSubmodelUrl).toBe(
        `/aas-proxy/call?target=${encodeURIComponent('https://repo.example.com/submodels/dXJuOnNtOmNhcA')}`,
      );
    });

    it('returns an empty viewer url when the submodel has no registered endpoint', () => {
      service.selectedElement = treeItem(submodel('urn:sm:cap', 'CapabilityDescription'));
      dataStore.editorDescriptor.set({ submodelDescriptorEntries: [] } as never);

      expect(service.capabilityViewerSubmodelUrl).toBe('');
    });

    it('lists all submodels of the loaded environment', () => {
      const environment = new T.Environment();
      environment.submodels = [submodel('urn:sm:a', 'A'), submodel('urn:sm:b', 'B')];
      service.shellResult = new ShellResult();
      service.shellResult.v3Shell = environment;

      expect(service.capabilityViewerSubmodels.map((sm) => sm.id)).toEqual(['urn:sm:a', 'urn:sm:b']);
    });
  });

  describe('capability assistant', () => {
    it('adds a capability container to the selected set with the known capability names', () => {
      const capabilitySet = smc('CapabilitySet', CAPABILITY_SET_SEMANTIC_ID, [
        capabilityContainer('DrillingContainer', 'Drilling'),
        capabilityContainer('MillingContainer', ' Milling '),
        smc('Unrelated'),
      ]);
      const capabilitySubmodel = submodel('urn:sm:cap', 'CapabilityDescription', CAPABILITY_SUBMODEL_SEMANTIC_ID, [
        capabilitySet,
      ]);
      service.selectedElement = treeItem(capabilitySet, treeItem(capabilitySubmodel));

      service.openAddCapabilityAddonForSet();

      expect(dialogService.open.mock.calls[0][1]).toMatchObject({
        header: 'ADD_CAPABILITY',
        data: {
          count: 2,
          currentLanguage: 'de',
          currentSubmodelId: 'urn:sm:cap',
          availableCapabilityRefs: ['Drilling', 'Milling'],
        },
      });

      const created = capabilityContainer('WeldingContainer', 'Welding');
      dialogClose$.next(created);

      expect(capabilitySet.value?.at(-1)).toBe(created);
      expect(treeService.refreshWholeTree).toHaveBeenCalled();
      vi.runAllTimers();
      expect(treeService.selectNodeByElement).toHaveBeenCalledWith(capabilitySet);
    });

    it('updates the selected container in place after editing', () => {
      const container = capabilityContainer('DrillingContainer', 'Drilling');
      const capabilitySet = smc('CapabilitySet', CAPABILITY_SET_SEMANTIC_ID, [container]);
      service.selectedElement = treeItem(container, treeItem(capabilitySet));

      service.openCapabilityContainerAddon();

      const data = dialogService.open.mock.calls[0][1].data;
      expect(data.count).toBe(1);
      expect(data.availableCapabilityRefs).toEqual(['Drilling']);
      expect(data.existingCapabilityContainer).not.toBe(container);

      dialogClose$.next(capabilityContainer('DrillingContainer', 'PrecisionDrilling'));

      expect(capabilitySet.value?.[0]).toBe(container);
      expect((container.value?.[0] as aas.types.Capability).idShort).toBe('PrecisionDrilling');
    });

    it('does not open the assistant for non capability selections', () => {
      service.selectedElement = treeItem(smc('Other'));

      service.openAddCapabilityAddonForSet();
      service.openCapabilityContainerAddon();

      expect(dialogService.open).not.toHaveBeenCalled();
    });
  });

  describe('asset interfaces assistant', () => {
    it('adds a new interface to the selected AID submodel', () => {
      const aid = submodel('urn:sm:aid', 'AssetInterfacesDescription', AID_SUBMODEL_SEMANTIC_ID, [
        smc('InterfaceHTTP', AID_INTERFACE_SEMANTIC_ID),
      ]);
      service.selectedElement = treeItem(aid);

      service.openAddAssetInterfacesDescriptionInterfaceAddon();

      expect(dialogService.open.mock.calls[0][1]).toMatchObject({ header: 'AID_INTERFACE_ADD', data: { count: 1 } });

      const modbus = smc('InterfaceMODBUS', AID_INTERFACE_SEMANTIC_ID);
      dialogClose$.next(modbus);

      expect(aid.submodelElements?.map((el) => el.idShort)).toEqual(['InterfaceHTTP', 'InterfaceMODBUS']);
      vi.runAllTimers();
      expect(treeService.selectNodeByElement).toHaveBeenCalledWith(modbus);
    });

    it('edits the selected interface with the number of sibling interfaces', () => {
      const httpInterface = smc('InterfaceHTTP', AID_INTERFACE_SEMANTIC_ID);
      const aid = submodel('urn:sm:aid', 'AssetInterfacesDescription', AID_SUBMODEL_SEMANTIC_ID, [
        httpInterface,
        smc('InterfaceMQTT', AID_INTERFACE_SEMANTIC_ID),
      ]);
      service.selectedElement = treeItem(httpInterface, treeItem(aid));

      service.openEditAssetInterfacesDescriptionInterfaceAddon();

      const config = dialogService.open.mock.calls[0][1];
      expect(config.header).toBe('AID_INTERFACE_EDIT_WITH_ASSISTANT');
      expect(config.data.count).toBe(2);
      expect(config.data.existingInterface).not.toBe(httpInterface);

      dialogClose$.next(smc('InterfaceHTTPS', AID_INTERFACE_SEMANTIC_ID));

      expect(aid.submodelElements?.[0]).toBe(httpInterface);
      expect(httpInterface.idShort).toBe('InterfaceHTTPS');
    });

    it('deletes the selected interface after confirmation', async () => {
      const httpInterface = smc('InterfaceHTTP', AID_INTERFACE_SEMANTIC_ID);
      const mqttInterface = smc('InterfaceMQTT', AID_INTERFACE_SEMANTIC_ID);
      const aid = submodel('urn:sm:aid', 'AssetInterfacesDescription', AID_SUBMODEL_SEMANTIC_ID, [
        httpInterface,
        mqttInterface,
      ]);
      service.selectedElement = treeItem(httpInterface, treeItem(aid));

      await service.deleteAssetInterfacesDescriptionInterface();

      expect(confirmationService.confirm).toHaveBeenCalledWith({ message: 'AID_INTERFACE_DELETE_Q' });
      expect(aid.submodelElements).toEqual([mqttInterface]);
      vi.runAllTimers();
      expect(treeService.selectNodeByElement).toHaveBeenCalledWith(aid);
    });

    it('keeps the interface when the deletion is not confirmed', async () => {
      confirmationService.confirm.mockResolvedValue(false);
      const httpInterface = smc('InterfaceHTTP', AID_INTERFACE_SEMANTIC_ID);
      const aid = submodel('urn:sm:aid', 'AssetInterfacesDescription', AID_SUBMODEL_SEMANTIC_ID, [httpInterface]);
      service.selectedElement = treeItem(httpInterface, treeItem(aid));

      await service.deleteAssetInterfacesDescriptionInterface();

      expect(aid.submodelElements).toEqual([httpInterface]);
      expect(treeService.refreshWholeTree).not.toHaveBeenCalled();
    });

    it('closes the open assistant on destroy', () => {
      service.selectedElement = treeItem(submodel('urn:sm:aid', 'AID', AID_SUBMODEL_SEMANTIC_ID));
      service.openAddAssetInterfacesDescriptionInterfaceAddon();

      service.destroy();

      expect(dialogRef.close).toHaveBeenCalled();
    });
  });
});
