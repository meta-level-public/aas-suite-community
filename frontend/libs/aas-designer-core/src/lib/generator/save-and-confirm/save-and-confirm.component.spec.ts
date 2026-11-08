import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AppConfigService, NotificationService, PortalService } from '@aas/common-services';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TreeNode } from '@openng/optimus-ui/api';
import { DppAssistantService } from 'battery-passport-assistant';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { GeneratorService } from '../generator.service';
import { SaveAndConfirmComponent } from './save-and-confirm.component';

const PCF_SEMANTIC_ID = 'https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0';

function semanticRef(value: string) {
  return new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, value),
  ]);
}

function submodel(id: string, idShort: string, semanticId?: string) {
  const sm = new aas.types.Submodel(id);
  sm.idShort = idShort;
  if (semanticId) {
    sm.semanticId = semanticRef(semanticId);
  }
  return sm;
}

function createShell(options: { globalAssetId?: string; kind?: aas.types.AssetKind; thumbnail?: string } = {}) {
  const assetInformation = new aas.types.AssetInformation(options.kind ?? aas.types.AssetKind.Type);
  assetInformation.globalAssetId = options.globalAssetId ?? null;
  if (options.thumbnail) {
    assetInformation.defaultThumbnail = new aas.types.Resource(options.thumbnail);
  }
  const shell = new aas.types.AssetAdministrationShell('https://example.com/aas/Pump_1', assetInformation);
  shell.idShort = 'Pump 1';
  return shell;
}

describe('SaveAndConfirmComponent', () => {
  let component: SaveAndConfirmComponent;
  let generatorService: any;
  let router: { navigate: ReturnType<typeof vi.fn> };
  let notificationService: { showMessageAlways: ReturnType<typeof vi.fn> };
  let http: { get: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };
  let dppAssistantService: { getPcfEntryDefinition: ReturnType<typeof vi.fn> };
  let shell: aas.types.AssetAdministrationShell | null;

  const labels = (nodes: TreeNode[]) => nodes.map((node) => node.data?.label);

  beforeEach(() => {
    localStorage.setItem('CURRENT_AAS_INFRASTRUCTURE', JSON.stringify({ id: 3 }));
    shell = createShell({ globalAssetId: 'https://example.com/asset/Pump_1', thumbnail: 'file:/aasx/files/pump.png' });

    generatorService = {
      vwsTyp: 'vorlage',
      currentId: 42,
      additionalV3Submodels: [],
      dppPcfEntries: { productCarbonFootprints: [], productOrSectorSpecificCarbonFootprints: [] },
      showStandardGeneratorSerialNumber: false,
      showStandardGeneratorManufacturingDate: false,
      getCurrentGeneratorRootShell: vi.fn(() => shell),
      getCurrentGeneratorNameplateSource: vi.fn(() => null),
      getCurrentGeneratorAssetThumbnailFile: vi.fn(() => null),
      getCurrentGeneratorDocumentItems: vi.fn(() => []),
      getAdditionalSubmodelsIncludedInExport: vi.fn(() => []),
      isStandardGeneratorCoreSubmodel: vi.fn(() => false),
      saveShell: vi.fn().mockResolvedValue({ aasId: 'https://example.com/aas/Pump_1' }),
      getSaveShellErrorMessage: vi.fn(() => 'SAVE_FAILED'),
      getVerifiableEnvironmentV3: vi.fn(),
      applyCurrentExportFixes: vi.fn().mockResolvedValue(undefined),
    };
    router = { navigate: vi.fn() };
    notificationService = { showMessageAlways: vi.fn() };
    http = { get: vi.fn(() => of('csrf')), put: vi.fn(() => of({})) };
    dppAssistantService = {
      getPcfEntryDefinition: vi.fn(() => ({
        groups: [
          {
            labelKey: 'GROUP',
            fields: [
              { id: 'pcfCalculationMethods', labelKey: 'METHODS', fieldType: 'text' },
              { id: 'description', labelKey: 'DESCRIPTION', fieldType: 'multilanguage' },
            ],
          },
        ],
      })),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: GeneratorService, useValue: generatorService },
        { provide: DppAssistantService, useValue: dppAssistantService },
        { provide: TranslateService, useValue: { instant: vi.fn((key: string) => key), currentLang: 'de' } },
        { provide: Router, useValue: router },
        { provide: NotificationService, useValue: notificationService },
        { provide: AppConfigService, useValue: { config: { apiPath: '/api' } } },
        { provide: PortalService, useValue: { iriPrefix: 'https://example.com/' } },
        { provide: HttpClient, useValue: http },
      ],
    });
    TestBed.overrideComponent(SaveAndConfirmComponent, { set: { template: '', imports: [] } });
    component = TestBed.createComponent(SaveAndConfirmComponent).componentInstance;
  });

  afterEach(() => {
    localStorage.removeItem('CURRENT_AAS_INFRASTRUCTURE');
  });

  describe('summary', () => {
    it('redirects to the type selection when no generator shell exists', async () => {
      shell = null;

      await component.ngOnInit();

      expect(router.navigate).toHaveBeenCalledWith(['generator', 'select-type']);
      expect(component.data).toEqual([]);
    });

    it('lists shell identifiers, thumbnail url, nameplate and documents', async () => {
      await component.ngOnInit();

      expect(component.data[0].data.value).toBe('https://example.com/aas/Pump_1');
      expect(component.data[1].data.value).toBe('Pump_1');
      expect(component.data[2].data.value).toBe('https://example.com/asset/Pump_1');
      expect(component.data[3].data).toEqual({
        value: '/api/Aas/getFileFromAas?id=42&filename=pump.png',
        type: 'Image',
        label: 'ASSET_THUMBNAIL',
      });
      expect(labels(component.data)).toEqual([
        'AAS_ID',
        'ID_SHORT',
        'ASSET_ID',
        'ASSET_THUMBNAIL',
        'NAMEPLATE',
        'DOCUMENTS',
      ]);
      expect(generatorService.getCurrentGeneratorDocumentItems).toHaveBeenCalledWith('de');
    });

    it('builds the asset id from the iri prefix when the shell has none', async () => {
      shell = createShell();

      await component.ngOnInit();

      expect(component.data[2].data.value).toContain('Pump_1');
      expect(component.data[2].data.value.startsWith('https://example.com')).toBe(true);
      expect(component.data[3].data.value).toBe('');
    });

    it('shows serial number and year of construction only when enabled', async () => {
      generatorService.getCurrentGeneratorNameplateSource.mockReturnValue({
        nameplate: {
          manufacturer: [{ language: 'de', text: 'ACME' }],
          serialNumber: 'SN-1',
          yearOfConstruction: '2024',
          markings: [{ name: 'CE', additionalText: 'EU', filename: 'ce.png' }],
        },
      });

      const disabled = component.createNameplateNode(generatorService.getCurrentGeneratorNameplateSource());
      generatorService.showStandardGeneratorSerialNumber = true;
      generatorService.showStandardGeneratorManufacturingDate = true;
      const enabled = component.createNameplateNode(generatorService.getCurrentGeneratorNameplateSource());

      expect(labels(disabled.children ?? [])).not.toContain('SERIAL_NUMBER');
      expect(labels(enabled.children ?? [])).toEqual(expect.arrayContaining(['SERIAL_NUMBER', 'YEAR_OF_CONSTRUCTION']));
      const markings = enabled.children?.find((node) => node.data.label === 'KENNZEICHEN');
      expect(markings?.children?.[0].data).toEqual({
        value: '/api/Aas/getFileFromAas?id=42&filename=ce.png',
        type: 'Image',
        label: 'CE / EU',
      });
    });

    it('omits nameplate and documents for battery passports without carbon footprints', async () => {
      generatorService.vwsTyp = 'battery-passport';

      await component.ngOnInit();

      expect(labels(component.data)).toEqual(['AAS_ID', 'ID_SHORT', 'ASSET_ID', 'ASSET_THUMBNAIL']);
    });

    it('adds the carbon footprint entries for dpp-core', async () => {
      generatorService.vwsTyp = 'dpp-core';
      generatorService.dppPcfEntries.productCarbonFootprints = [
        {
          values: {
            pcfCalculationMethods: ['ISO 14067', ' ', 'GHG'],
            description: [{ language: 'en', text: 'Cradle to gate' }],
          },
        },
      ];

      await component.ngOnInit();

      const pcf = component.data.find((node) => node.data.label === 'PRODUCT_CARBON_FOOTPRINT');
      expect(labels(pcf?.children ?? [])).toEqual(['DPP_PCF_TYPE_PRODUCT', 'DPP_PCF_TYPE_PRODUCT_OR_SECTOR']);
      const fields = pcf?.children?.[0].children?.[0].children?.[0].children ?? [];
      expect(fields.map((field) => field.data)).toEqual([
        { label: 'METHODS', value: 'ISO 14067, GHG', type: 'Text' },
        { label: 'DESCRIPTION', value: [{ language: 'en', text: 'Cradle to gate' }], type: 'MLP' },
      ]);
      expect(pcf?.children?.[1].children).toEqual([]);
    });

    it('lists additional submodels but hides core submodels and duplicate carbon footprints for dpp', async () => {
      const core = submodel('urn:sm:core', 'Nameplate');
      const custom = submodel('urn:sm:custom', 'Custom');
      const pcf = submodel('urn:sm:pcf', 'CarbonFootprint', PCF_SEMANTIC_ID);
      generatorService.additionalV3Submodels = [core, custom, pcf];
      generatorService.isStandardGeneratorCoreSubmodel.mockImplementation((sm: aas.types.Submodel) => sm === core);

      await component.ngOnInit();
      expect(labels(component.data)).toEqual(expect.arrayContaining(['Custom', 'CarbonFootprint']));
      expect(labels(component.data)).not.toContain('Nameplate');

      generatorService.vwsTyp = 'dpp-core';
      await component.ngOnInit();
      expect(labels(component.data)).toContain('Custom');
      expect(labels(component.data)).not.toContain('CarbonFootprint');
    });
  });

  describe('generic tree nodes', () => {
    it('maps jsonized submodel elements recursively with typed values', () => {
      const sm = submodel('urn:sm:1', 'Technical');
      const property = new aas.types.Property(aas.types.DataTypeDefXsd.String);
      property.idShort = 'Weight';
      property.value = '12';
      const file = new aas.types.File();
      file.value = '/manual.pdf';
      file.contentType = 'application/pdf';
      const collection = new aas.types.SubmodelElementCollection();
      collection.idShort = 'Group';
      collection.value = [property];
      const list = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.File);
      list.idShort = 'Files';
      list.value = [file];
      sm.submodelElements = [collection, list];

      const node = component.getTreeNode(aas.jsonization.toJsonable(sm));

      expect(node.data).toEqual({ label: 'Technical', value: '', type: 'GENERIC_Submodel' });
      const [groupNode, filesNode] = node.children ?? [];
      expect(groupNode.data.type).toBe('GENERIC_SubmodelElementCollection');
      expect(groupNode.children?.[0].data).toEqual({ label: 'Weight', value: '12', type: 'GENERIC_Property' });
      expect(filesNode.data.type).toBe('GENERIC_SubmodelElementList');
      expect(filesNode.children?.[0].data).toEqual({
        label: undefined,
        value: { value: '/manual.pdf', mimeType: 'application/pdf' },
        type: 'GENERIC_File',
      });
    });

    it('maps aas-core instances recursively including collection, list and multi language children', () => {
      const sm = submodel('urn:sm:1', 'Technical');
      const property = new aas.types.Property(aas.types.DataTypeDefXsd.String);
      property.idShort = 'Weight';
      property.value = '12';
      const mlp = new aas.types.MultiLanguageProperty();
      mlp.idShort = 'Name';
      mlp.value = [new aas.types.LangStringTextType('de', 'Pumpe')];
      const collection = new aas.types.SubmodelElementCollection();
      collection.idShort = 'Group';
      collection.value = [property, mlp];
      const emptyCollection = new aas.types.SubmodelElementCollection();
      emptyCollection.idShort = 'Empty';
      const file = new aas.types.File();
      file.idShort = 'Manual';
      file.value = '/manual.pdf';
      file.contentType = 'application/pdf';
      const list = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.File);
      list.idShort = 'Files';
      list.value = [file];
      sm.submodelElements = [collection, emptyCollection, list];

      const node = component.getTreeNode(sm);

      expect(node.data).toEqual({ label: 'Technical', value: '', type: 'GENERIC_Submodel' });
      const [groupNode, emptyNode, filesNode] = node.children ?? [];
      expect(groupNode.data.type).toBe('GENERIC_SubmodelElementCollection');
      expect(groupNode.children?.map((child) => child.data)).toEqual([
        { label: 'Weight', value: '12', type: 'GENERIC_Property' },
        { label: 'Name', value: mlp.value, type: 'GENERIC_MultiLanguageProperty' },
      ]);
      expect(emptyNode.data.type).toBe('GENERIC_SubmodelElementCollection');
      expect(emptyNode.children).toEqual([]);
      expect(filesNode.data.type).toBe('GENERIC_SubmodelElementList');
      expect(filesNode.children?.[0].data).toEqual({
        label: 'Manual',
        value: { value: '/manual.pdf', mimeType: 'application/pdf' },
        type: 'GENERIC_File',
      });
    });

    it('lists the elements of additional instance submodels in the summary', async () => {
      const custom = submodel('urn:sm:custom', 'Custom');
      const property = new aas.types.Property(aas.types.DataTypeDefXsd.String);
      property.idShort = 'Color';
      property.value = 'blue';
      custom.submodelElements = [property];
      generatorService.additionalV3Submodels = [custom];

      await component.ngOnInit();

      const customNode = component.data.find((node) => node.data.label === 'Custom');
      expect(customNode?.data.type).toBe('GENERIC_Submodel');
      expect(customNode?.children?.[0].data).toEqual({ label: 'Color', value: 'blue', type: 'GENERIC_Property' });
    });

    it('normalizes unknown values to displayable text', () => {
      expect(component.getTreeNode({ idShort: 'A', modelType: 'Range', value: ['a', 'b'] }).data.value).toBe('a, b');
      expect(component.getTreeNode({ idShort: 'B', modelType: 'Range', value: [{ x: 1 }] }).data.value).toBe('');
      expect(component.getTreeNode({ idShort: 'C', modelType: 'Range', value: { x: 1 } }).data.value).toBe('');
      expect(component.getTreeNode({ idShort: 'D', value: 5 }).data).toEqual({
        label: 'D',
        value: 5,
        type: 'GENERIC_Unknown',
      });
    });

    it('chooses the best available document label', () => {
      const version = (title: string, name?: string) => [{ title, digitalFile: name ? { name } : undefined }];

      expect(component.getLabel({ idShort: 'Doc', documentVersion: version('T') })).toBe('Doc');
      expect(component.getLabel({ idShort: '', documentVersion: version('Title') })).toBe('Title');
      expect(component.getLabel({ idShort: '', documentVersion: version(''), documentId: [{ valueId: 'ID-1' }] })).toBe(
        'ID-1',
      );
      expect(
        component.getLabel({ idShort: '', documentVersion: version('', 'file.pdf'), documentId: [{ valueId: '' }] }),
      ).toBe('file.pdf');
    });

    it('returns no file url without a generator id or filename', () => {
      expect(component.getUrl(null)).toBe('');
      generatorService.currentId = null;
      expect(component.getUrl('a.png')).toBe('');
    });
  });

  describe('dpp metadata', () => {
    beforeEach(() => {
      generatorService.vwsTyp = 'dpp-core';
      shell = createShell({ globalAssetId: 'urn:asset:1', kind: aas.types.AssetKind.Instance });
      generatorService.getAdditionalSubmodelsIncludedInExport.mockReturnValue([
        submodel('urn:sm:meta', 'DppMetadata', 'urn:sem:meta'),
        submodel('urn:sm:log', 'AasDesignerChangelog', 'urn:sem:log'),
        submodel('urn:sm:nameplate', 'Nameplate', 'urn:sem:nameplate'),
        submodel('urn:sm:nameplate2', 'Nameplate2', 'urn:sem:nameplate'),
        submodel('urn:sm:nosem', 'NoSemantic'),
      ]);
    });

    it('is not used for regular shells and counts as complete', async () => {
      generatorService.vwsTyp = 'vorlage';

      await component.ngOnInit();

      expect(component.dppMetadata).toBeNull();
      expect(component.dppSubmodels).toEqual([]);
      expect(component.dppMetadataComplete).toBe(true);
    });

    it('prefills metadata from the shell and preselects submodels with semantic id', async () => {
      await component.ngOnInit();

      expect(component.dppMetadata).toEqual(
        expect.objectContaining({
          aasId: 'https://example.com/aas/Pump_1',
          uniqueProductIdentifier: 'urn:asset:1',
          granularity: 'Item',
          dppStatus: 'Draft',
          economicOperatorId: '',
        }),
      );
      expect(component.dppSubmodels.map((sm) => [sm.name, sm.selected])).toEqual([
        ['Nameplate', true],
        ['Nameplate2', true],
        ['NoSemantic', false],
      ]);
      expect(component.dppMetadataComplete).toBe(false);
    });

    it('keeps user edits and selections when the summary is reloaded', async () => {
      await component.ngOnInit();
      component.dppMetadata!.economicOperatorId = 'ACME';
      component.dppSubmodels[1].selected = false;

      await component.applyCurrentExportFixes();

      expect(component.dppMetadata?.economicOperatorId).toBe('ACME');
      // submodels sharing a semantic id keep their own selection
      expect(component.dppSubmodels.map((sm) => sm.selected)).toEqual([true, false, false]);
      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        'GENERATOR_TEMPLATE_FIXES_APPLIED',
        'SUCCESS',
        'success',
        false,
      );
    });

    it('does not save while required metadata is missing', async () => {
      await component.ngOnInit();

      await component.saveAndContinueV3();

      expect(generatorService.saveShell).not.toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });

    it('saves shell and metadata with deduplicated content specifications', async () => {
      await component.ngOnInit();
      component.dppMetadata!.economicOperatorId = 'ACME';
      component.dppMetadata!.facilityId = '   ';

      await component.saveAndContinueV3();

      const metadata = generatorService.saveShell.mock.calls[0][0];
      expect(metadata.facilityId).toBeNull();
      expect(metadata.contentSpecificationIds).toEqual(['urn:sem:nameplate']);
      expect(http.get).toHaveBeenCalledWith('/bff/csrf', { responseType: 'text', withCredentials: true });
      expect(http.put).toHaveBeenCalledWith('/aas-proxy/dpp/metadata', metadata, { withCredentials: true });
      expect(router.navigate).toHaveBeenCalledWith(PortalService.buildRepoEditRoute('https://example.com/aas/Pump_1'));
      expect(notificationService.showMessageAlways).toHaveBeenCalledWith('VWS_SAVED', 'SUCCESS', 'success', false);
    });

    it('reports a failing metadata upload as save error', async () => {
      await component.ngOnInit();
      component.dppMetadata!.economicOperatorId = 'ACME';
      http.put.mockReturnValue(throwError(() => new Error('proxy down')));

      await component.saveAndContinueV3();

      expect(router.navigate).not.toHaveBeenCalled();
      expect(notificationService.showMessageAlways).toHaveBeenCalledWith('SAVE_FAILED', 'ERROR', 'error', true);
      expect(component.loading).toBe(false);
    });
  });

  describe('saving regular shells', () => {
    it('saves without metadata upload and opens the editor', async () => {
      await component.ngOnInit();

      await component.saveAndContinueV3();

      expect(generatorService.saveShell).toHaveBeenCalledWith(undefined);
      expect(http.get).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('shows the translated save error and resets loading', async () => {
      const error = new Error('conflict');
      generatorService.saveShell.mockRejectedValue(error);
      await component.ngOnInit();

      await component.saveAndContinueV3();

      expect(generatorService.getSaveShellErrorMessage).toHaveBeenCalledWith(error);
      expect(notificationService.showMessageAlways).toHaveBeenCalledWith('SAVE_FAILED', 'ERROR', 'error', true);
      expect(component.loading).toBe(false);
    });

    it('shows an error when applying export fixes fails', async () => {
      generatorService.applyCurrentExportFixes.mockRejectedValue(new Error('x'));

      await component.applyCurrentExportFixes();

      expect(notificationService.showMessageAlways).toHaveBeenCalledWith('SAVE_FAILED', 'ERROR', 'error', true);
      expect(component.loading).toBe(false);
    });
  });

  describe('debug validation', () => {
    it('numbers verification errors and falls back to the raw message', async () => {
      const invalid = new aas.types.Submodel('urn:sm:invalid');
      invalid.idShort = '1 invalid idShort';
      generatorService.getVerifiableEnvironmentV3.mockResolvedValue(new aas.types.Environment(null, [invalid]));

      await component.debugValidateGeneratedAas();

      const errors = component.validationErrors();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.map((error) => error.number)).toEqual(errors.map((_, index) => index + 1));
      expect(errors[0].messageTranslated).toBe(errors[0].message);
      expect(component.validationErrorCount).toBe(errors.length);
      expect(component.displayValidationResult).toBe(true);
    });

    it('reports an empty result for a valid environment', async () => {
      generatorService.getVerifiableEnvironmentV3.mockResolvedValue(
        new aas.types.Environment(null, [submodel('urn:sm:ok', 'Ok')]),
      );

      await component.debugValidateGeneratedAas();

      expect(component.validationErrors()).toEqual([]);
      expect(component.displayValidationResult).toBe(true);
    });
  });
});
