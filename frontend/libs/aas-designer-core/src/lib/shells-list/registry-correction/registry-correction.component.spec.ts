import { buildShellRegistryCorrectionRoute, buildShellsListRoute, NotificationService } from '@aas/common-services';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { vi } from 'vitest';
import { RegistryCorrectionComponent } from './registry-correction.component';
import { RegistryAasDescriptor, RegistryCorrectionService } from './registry-correction.service';

describe('RegistryCorrectionComponent', () => {
  let component: RegistryCorrectionComponent;
  let service: {
    getAasDescriptor: ReturnType<typeof vi.fn>;
    getSubmodelDescriptor: ReturnType<typeof vi.fn>;
    saveAasDescriptor: ReturnType<typeof vi.fn>;
    saveSubmodelDescriptor: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let notificationService: { showMessageAlways: ReturnType<typeof vi.fn> };

  const descriptor = (): RegistryAasDescriptor => ({
    id: 'urn:aas:1',
    idShort: 'Pump',
    endpoints: [{ interface: 'AAS-3.0', protocolInformation: { href: 'http://repo/shells/1' } }],
    submodelDescriptors: [
      { id: 'urn:sm:1', idShort: 'Nameplate', endpoints: [] },
      { id: 'urn:sm:2', idShort: '' },
      { idShort: 'Broken' },
    ],
  });

  beforeEach(async () => {
    service = {
      getAasDescriptor: vi.fn().mockImplementation(async () => descriptor()),
      getSubmodelDescriptor: vi.fn().mockImplementation(async (id: string) => ({ id, idShort: `loaded:${id}` })),
      saveAasDescriptor: vi.fn().mockResolvedValue(undefined),
      saveSubmodelDescriptor: vi.fn().mockResolvedValue(undefined),
    };
    router = { navigate: vi.fn().mockResolvedValue(true) };
    notificationService = { showMessageAlways: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: RegistryCorrectionService, useValue: service },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { aasId: 'urn:aas:1' } } } },
        { provide: NotificationService, useValue: notificationService },
      ],
    });
    TestBed.overrideComponent(RegistryCorrectionComponent, { set: { template: '', imports: [] } });
    component = TestBed.createComponent(RegistryCorrectionComponent).componentInstance;
    await component.ngOnInit();
  });

  describe('loading', () => {
    it('loads the shell descriptor and builds the navigation tree', () => {
      expect(service.getAasDescriptor).toHaveBeenCalledWith('urn:aas:1');
      expect(component.selectedNodeKey()).toBe('aas');
      expect(component.loading()).toBe(false);

      const [root] = component.navigationItems();
      expect(root.data.descriptorId).toBe('urn:aas:1');
      expect(root.children?.map((child) => [child.key, child.label, child.selectable])).toEqual([
        ['submodel:urn:sm:1', 'Nameplate', true],
        ['submodel:urn:sm:2', 'urn:sm:2', true],
        ['submodel:', 'Broken', false],
      ]);
      expect(component.selectedDescriptor()?.id).toBe('urn:aas:1');
    });

    it('returns to the shell list when the descriptor cannot be loaded', async () => {
      service.getAasDescriptor.mockRejectedValue(new Error('404'));

      await component.reloadDescriptor();

      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        'REGISTRY_CORRECTION_LOAD_FAILED',
        'ERROR',
        'error',
        false,
      );
      expect(router.navigate).toHaveBeenCalledWith(buildShellsListRoute());
      expect(component.loading()).toBe(false);
    });

    it('falls back to the aas node and drops cached submodels that no longer exist', async () => {
      await component.selectDescriptor({ key: 'submodel:urn:sm:2' });
      expect(component.submodelDescriptor('urn:sm:2')).not.toBeNull();

      service.getAasDescriptor.mockResolvedValue({ ...descriptor(), submodelDescriptors: [{ id: 'urn:sm:1' }] });
      await component.reloadDescriptor();

      expect(component.selectedNodeKey()).toBe('aas');
      expect(component.submodelDescriptor('urn:sm:2')).toBeNull();
    });
  });

  describe('selection', () => {
    it('loads a submodel descriptor once when it is selected', async () => {
      await component.selectDescriptor({ key: 'submodel:urn:sm:1' });
      await component.selectDescriptor({ key: 'aas' });
      await component.selectDescriptor({ key: 'submodel:urn:sm:1' });

      expect(service.getSubmodelDescriptor).toHaveBeenCalledTimes(1);
      expect(component.selectedSubmodelId()).toBe('urn:sm:1');
      expect(component.isAasSelected()).toBe(false);
      expect(component.selectedDescriptor()?.idShort).toBe('loaded:urn:sm:1');
      expect(component.selectedDescriptorTitle()).toBe('REGISTRY_CORRECTION_SUBMODEL_DESCRIPTOR_TITLE');
      expect(component.isSubmodelLoading('urn:sm:1')).toBe(false);
    });

    it('ignores nodes without key', async () => {
      await component.selectDescriptor({ key: undefined });
      await component.selectDescriptor({ key: 'submodel:' });

      expect(service.getSubmodelDescriptor).not.toHaveBeenCalled();
    });

    it('uses the nested descriptor from the shell when the submodel registry fails', async () => {
      service.getSubmodelDescriptor.mockRejectedValue(new Error('down'));

      await component.selectDescriptor({ key: 'submodel:urn:sm:1' });

      expect(component.submodelDescriptor('urn:sm:1')?.idShort).toBe('Nameplate');
      expect(notificationService.showMessageAlways).not.toHaveBeenCalled();
    });

    it('reports an error when neither registry nor shell know the submodel', async () => {
      service.getSubmodelDescriptor.mockRejectedValue(new Error('down'));

      await component.selectDescriptor({ key: 'submodel:urn:sm:unknown' });

      expect(component.submodelDescriptor('urn:sm:unknown')).toBeNull();
      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        'REGISTRY_CORRECTION_LOAD_FAILED',
        'ERROR',
        'error',
        false,
      );
    });

    it('discards running edits when another descriptor is selected', async () => {
      component.startEditingSelected();
      expect(component.isSelectedDescriptorEditing()).toBe(true);

      await component.selectDescriptor({ key: 'submodel:urn:sm:1' });

      expect(component.editingAas()).toBe(false);
      expect(component.aasDraft()).toBeNull();

      component.startEditingSelected();
      expect(component.editingSubmodelId()).toBe('urn:sm:1');

      await component.selectDescriptor({ key: 'aas' });
      expect(component.editingSubmodelId()).toBeNull();
      expect(component.submodelDraft('urn:sm:1')).toBeNull();
    });
  });

  describe('editing the shell descriptor', () => {
    beforeEach(() => component.startEditAas());

    it('creates an independent draft with expanded endpoint panels', () => {
      expect(component.editingAas()).toBe(true);
      expect(JSON.parse(component.aasDraftJson())).toEqual(descriptor());
      expect(component.aasExpandedEndpointPanels()).toEqual([0]);

      component.updateAasEndpointHref(0, 'http://new/shells/1');

      expect(component.aasDraft()?.endpoints?.[0].protocolInformation?.href).toBe('http://new/shells/1');
      expect(component.aasDescriptor()?.endpoints?.[0].protocolInformation?.href).toBe('http://repo/shells/1');
      expect(JSON.parse(component.aasDraftJson()).endpoints[0].protocolInformation.href).toBe('http://new/shells/1');
    });

    it('adds endpoints and pads missing ones when editing by index', () => {
      component.addAasEndpoint();
      expect(component.getEndpoints(component.aasDraft())).toHaveLength(2);
      expect(component.aasExpandedEndpointPanels()).toEqual([0, 1]);

      component.updateAasEndpointProtocol(3, 'HTTPS');
      component.updateAasEndpointInterface(3, 'AAS-REPOSITORY-3.0');

      const endpoints = component.getEndpoints(component.aasDraft());
      expect(endpoints).toHaveLength(4);
      expect(endpoints[2]).toEqual({ interface: '', protocolInformation: { href: '', endpointProtocol: '' } });
      expect(endpoints[3]).toEqual({
        interface: 'AAS-REPOSITORY-3.0',
        protocolInformation: { href: '', endpointProtocol: 'HTTPS' },
      });
    });

    it('flags invalid json and blocks saving until it is fixed', async () => {
      component.onAasJsonChanged('{ invalid');

      expect(component.aasDraftJsonError()).toBe('REGISTRY_CORRECTION_JSON_INVALID');
      await component.saveSelectedDescriptor();
      expect(service.saveAasDescriptor).not.toHaveBeenCalled();

      component.onAasJsonChanged(JSON.stringify({ id: 'urn:aas:1', endpoints: [{}, {}] }));
      expect(component.aasDraftJsonError()).toBeNull();
      expect(component.aasExpandedEndpointPanels()).toEqual([0, 1]);
    });

    it('normalizes accordion values to numeric panel indexes', () => {
      component.onAasEndpointPanelsChanged(['1', 'x', '2']);
      expect(component.aasExpandedEndpointPanels()).toEqual([1, 2]);

      component.onAasEndpointPanelsChanged('3');
      expect(component.aasExpandedEndpointPanels()).toEqual([3]);

      component.onAasEndpointPanelsChanged('abc');
      expect(component.aasExpandedEndpointPanels()).toEqual([]);

      component.onAasEndpointPanelsChanged(null);
      expect(component.aasExpandedEndpointPanels()).toEqual([]);
    });

    it('saves under the original id and reloads when the id is unchanged', async () => {
      component.updateAasEndpointHref(0, 'http://new');

      await component.saveSelectedDescriptor();

      expect(service.saveAasDescriptor).toHaveBeenCalledWith(
        'urn:aas:1',
        expect.objectContaining({ id: 'urn:aas:1', endpoints: [expect.objectContaining({ interface: 'AAS-3.0' })] }),
      );
      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        'REGISTRY_CORRECTION_SAVE_SUCCESS',
        'SUCCESS',
        'success',
        false,
      );
      expect(component.editingAas()).toBe(false);
      expect(service.getAasDescriptor).toHaveBeenCalledTimes(2);
      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.savingAas()).toBe(false);
    });

    it('navigates to the new id after renaming the shell descriptor', async () => {
      component.onAasJsonChanged(JSON.stringify({ ...descriptor(), id: 'urn:aas:renamed' }));

      await component.saveAasDescriptor();

      expect(service.saveAasDescriptor).toHaveBeenCalledWith(
        'urn:aas:1',
        expect.objectContaining({ id: 'urn:aas:renamed' }),
      );
      expect(router.navigate).toHaveBeenCalledWith(buildShellRegistryCorrectionRoute('urn:aas:renamed'));
      expect(service.getAasDescriptor).toHaveBeenCalledTimes(1);
    });

    it('keeps the draft when saving fails', async () => {
      service.saveAasDescriptor.mockRejectedValue(new Error('500'));

      await component.saveAasDescriptor();

      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        'REGISTRY_CORRECTION_SAVE_FAILED',
        'ERROR',
        'error',
        false,
      );
      expect(component.editingAas()).toBe(true);
      expect(component.aasDraft()).not.toBeNull();
      expect(component.savingAas()).toBe(false);
    });

    it('cancelling restores the read-only state', () => {
      component.cancelEditingSelected();

      expect(component.editingAas()).toBe(false);
      expect(component.aasDraftJson()).toBe('');
      expect(component.aasExpandedEndpointPanels()).toEqual([]);
    });
  });

  describe('editing submodel descriptors', () => {
    beforeEach(async () => {
      await component.selectDescriptor({ key: 'submodel:urn:sm:1' });
      component.startEditingSelected();
    });

    it('edits endpoints only in the draft', () => {
      component.addSubmodelEndpoint('urn:sm:1');
      component.updateSubmodelEndpointHref('urn:sm:1', 0, 'http://sm');
      component.updateSubmodelEndpointInterface('urn:sm:1', 0, 'SUBMODEL-3.0');
      component.updateSubmodelEndpointProtocol('urn:sm:1', 0, 'HTTP');

      expect(component.submodelDraft('urn:sm:1')?.endpoints).toEqual([
        { interface: 'SUBMODEL-3.0', protocolInformation: { href: 'http://sm', endpointProtocol: 'HTTP' } },
      ]);
      expect(component.submodelExpandedPanels('urn:sm:1')).toEqual([0]);
      expect(JSON.parse(component.submodelDraftJsonValue('urn:sm:1')).endpoints).toHaveLength(1);
      expect(component.submodelDescriptor('urn:sm:1')?.endpoints).toBeUndefined();
    });

    it('ignores endpoint edits for submodels that are not being edited', () => {
      component.addSubmodelEndpoint('urn:sm:2');
      component.updateSubmodelEndpointHref('urn:sm:2', 0, 'x');

      expect(component.submodelDraft('urn:sm:2')).toBeNull();
    });

    it('blocks saving with invalid json', async () => {
      component.onSubmodelJsonChanged('urn:sm:1', 'nope');

      await component.saveSelectedDescriptor();

      expect(component.submodelDraftError('urn:sm:1')).toBe('REGISTRY_CORRECTION_JSON_INVALID');
      expect(service.saveSubmodelDescriptor).not.toHaveBeenCalled();
    });

    it('saves a renamed submodel and selects it under the new id', async () => {
      service.getAasDescriptor.mockResolvedValue({
        ...descriptor(),
        submodelDescriptors: [{ id: 'urn:sm:renamed', idShort: 'Nameplate' }],
      });
      component.onSubmodelJsonChanged('urn:sm:1', JSON.stringify({ id: 'urn:sm:renamed', idShort: 'Nameplate' }));
      service.getSubmodelDescriptor.mockClear();

      await component.saveSelectedDescriptor();

      expect(service.saveSubmodelDescriptor).toHaveBeenCalledWith('urn:sm:1', {
        id: 'urn:sm:renamed',
        idShort: 'Nameplate',
      });
      expect(component.selectedNodeKey()).toBe('submodel:urn:sm:renamed');
      expect(component.editingSubmodelId()).toBeNull();
      expect(component.submodelDraft('urn:sm:1')).toBeNull();
      expect(component.submodelDescriptor('urn:sm:renamed')?.id).toBe('urn:sm:renamed');
      expect(component.isSavingSubmodel('urn:sm:1')).toBe(false);
      expect(service.getSubmodelDescriptor).toHaveBeenCalledTimes(1);
      expect(service.getSubmodelDescriptor).toHaveBeenCalledWith('urn:sm:renamed');
    });

    it('reloads the saved submodel descriptor once when the id is unchanged', async () => {
      component.onSubmodelJsonChanged('urn:sm:1', JSON.stringify({ id: 'urn:sm:1', idShort: 'Typeplate' }));
      service.getSubmodelDescriptor.mockClear();
      service.getSubmodelDescriptor.mockResolvedValue({ id: 'urn:sm:1', idShort: 'Typeplate' });

      await component.saveSelectedDescriptor();

      expect(service.getSubmodelDescriptor).toHaveBeenCalledTimes(1);
      expect(component.submodelDescriptor('urn:sm:1')?.idShort).toBe('Typeplate');
      expect(component.selectedNodeKey()).toBe('submodel:urn:sm:1');
    });

    it('keeps the draft and reports failures when saving fails', async () => {
      service.saveSubmodelDescriptor.mockRejectedValue(new Error('500'));

      await component.saveSubmodelDescriptor('urn:sm:1');

      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        'REGISTRY_CORRECTION_SAVE_FAILED',
        'ERROR',
        'error',
        false,
      );
      expect(component.editingSubmodelId()).toBe('urn:sm:1');
      expect(component.isSavingSubmodel('urn:sm:1')).toBe(false);
    });

    it('cancelling removes all draft state of the submodel', () => {
      component.onSubmodelEndpointPanelsChanged('urn:sm:1', [0, 1]);
      component.cancelEditingSelected();

      expect(component.submodelDraft('urn:sm:1')).toBeNull();
      expect(component.submodelDraftJsonValue('urn:sm:1')).toBe('');
      expect(component.submodelExpandedPanels('urn:sm:1')).toEqual([]);
      expect(component.isSelectedDescriptorEditing()).toBe(false);
    });
  });

  describe('display helpers', () => {
    it('formats localized texts, endpoints and administration values', () => {
      expect(component.displayLocalizedTexts([{ language: 'de', text: 'Pumpe' }, { text: 'x' }])).toEqual([
        'de: Pumpe',
        '-: x',
      ]);
      expect(component.displayLocalizedTexts(undefined)).toEqual([]);
      expect(component.endpointTitle({}, 1)).toBe('Endpoint 2');
      expect(component.endpointTitle({ protocolInformation: { href: 'http://x' } }, 0)).toBe('http://x');
      expect(component.administrationValue({ administration: { version: '1' } }, 'version')).toBe('1');
      expect(component.administrationValue({ administration: null }, 'revision')).toBe('');
    });
  });
});
