import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AppConfigService, NotificationService, PortalService } from '@aas/common-services';
import { IdGenerationUtil } from '@aas/helpers';
import { Component, isDevMode, OnDestroy, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DppAssistantService } from 'battery-passport-assistant';
import { PrimeTemplate, TreeNode } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { AasDesignerVerificationError } from '../../v3-editor/v3-editor/aas-designer-verification-error';
import { buildAssetIdentifier, buildAssetShellIdentifier, normalizeAssetShellIdShort } from '../asset-shell-id.utils';
import { GeneratorFilePreviewState } from '../generator-file-preview.utils';
import { GeneratorNameplateSource } from '../generator-nameplate.builder';
import { GeneratorPageShellComponent } from '../generator-page-shell/generator-page-shell.component';
import { GeneratorDppMetadataInput, GeneratorService } from '../generator.service';

import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Image } from 'primeng/image';
import { Tag } from 'primeng/tag';
import { firstValueFrom } from 'rxjs';
type VerificationError = aas.verification.VerificationError;

interface GeneratorDppSubmodelOption {
  id: string;
  name: string;
  semanticId: string;
  selected: boolean;
}

@Component({
  selector: 'aas-save-and-confirm',
  templateUrl: './save-and-confirm.component.html',
  styleUrl: './save-and-confirm.component.scss',
  host: {
    class: 'flex flex-col flex-1',
  },
  imports: [
    PrimeTemplate,
    TreeTableModule,
    TableModule,
    Image,
    Button,
    Dialog,
    Tag,
    FormsModule,
    TranslateModule,
    GeneratorPageShellComponent,
  ],
})
export class SaveAndConfirmComponent implements OnInit, OnDestroy {
  readonly showDeveloperTools = isDevMode();
  data: TreeNode[] = [];
  loading: boolean = false;
  validationErrors = signal<AasDesignerVerificationError[]>([]);
  validationErrorCount: number = 0;
  displayValidationResult: boolean = false;
  advanced: boolean = false;
  dppMetadata: GeneratorDppMetadataInput | null = null;
  dppSubmodels: GeneratorDppSubmodelOption[] = [];
  private readonly previewState = new GeneratorFilePreviewState();

  constructor(
    private generatorService: GeneratorService,
    private dppAssistantService: DppAssistantService,
    private translate: TranslateService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private notificationService: NotificationService,
    private appConfigService: AppConfigService,
    private portalService: PortalService,
    private http: HttpClient,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadSummaryData();
  }

  ngOnDestroy(): void {
    this.previewState.clearAll();
  }

  private async loadSummaryData(): Promise<void> {
    const currentShell = this.generatorService.getCurrentGeneratorRootShell();
    if (currentShell == null) {
      this.router.navigate(['generator', 'select-type']);
      return;
    }

    this.data = [];
    const nameplateSource = this.generatorService.getCurrentGeneratorNameplateSource();

    const data = [];
    const parent = {} as TreeNode;
    parent.label = 'Verwaltungsschale';

    const assetShellId = normalizeAssetShellIdShort(currentShell.idShort);
    const assetId =
      currentShell.assetInformation?.globalAssetId ?? buildAssetIdentifier(this.portalService.iriPrefix, assetShellId);
    const aasId = currentShell.id ?? buildAssetShellIdentifier(this.portalService.iriPrefix, assetShellId);

    const shellNode = {} as TreeNode;
    shellNode.data = {
      value: aasId || IdGenerationUtil.generateIri('aas', this.portalService.iriPrefix),
      type: 'Text',
      label: this.translate.instant('AAS_ID'),
    };
    data.push(shellNode);
    const shellIdShortNode = {} as TreeNode;
    shellIdShortNode.data = {
      value: assetShellId,
      type: 'Text',
      label: this.translate.instant('ID_SHORT'),
    };
    data.push(shellIdShortNode);
    const assetNode = {} as TreeNode;
    assetNode.data = {
      value: assetId,
      type: 'Text',
      label: this.translate.instant('ASSET_ID'),
    };
    data.push(assetNode);

    const assetImageNode = {} as TreeNode;
    assetImageNode.data = {
      value: await this.resolveAssetThumbnailSummaryUrl(currentShell),
      type: 'Image',
      label: this.translate.instant('ASSET_THUMBNAIL'),
    };
    data.push(assetImageNode);

    if (this.generatorService.vwsTyp !== 'battery-passport') {
      data.push(this.createNameplateNode(nameplateSource));
      data.push(this.createDocumentNode());
    }

    if (
      this.generatorService.vwsTyp === 'dpp-core' ||
      (this.generatorService.vwsTyp === 'battery-passport' &&
        this.generatorService.dppPcfEntries.productCarbonFootprints.length > 0)
    ) {
      data.push(this.createPcfNode());
    }
    this.generatorService.additionalV3Submodels
      .filter(
        (el: any) =>
          !this.generatorService.isStandardGeneratorCoreSubmodel(el) &&
          ((this.generatorService.vwsTyp !== 'dpp-core' && this.generatorService.vwsTyp !== 'battery-passport') ||
            !((el?.semanticId?.keys ?? []) as any[]).some((key: any) =>
              [
                'https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0',
                'https://admin-shell.io/idta/CarbonFootprint/1/0',
              ].some((semanticId) => `${key?.value ?? ''}`.includes(semanticId)),
            )),
      )
      .forEach((el: any) => {
        data.push(this.getTreeNode(el));
      });

    this.data = data;
    await this.loadDppMetadata();
  }

  private async loadDppMetadata(): Promise<void> {
    if (this.generatorService.vwsTyp !== 'battery-passport' && this.generatorService.vwsTyp !== 'dpp-core') {
      this.dppMetadata = null;
      this.dppSubmodels = [];
      return;
    }

    const shell = this.generatorService.getCurrentGeneratorRootShell();
    if (shell == null) return;
    const previousMetadata = this.dppMetadata?.aasId === shell.id ? this.dppMetadata : null;
    const previousSelection = new Map(this.dppSubmodels.map((submodel) => [submodel.semanticId, submodel.selected]));
    const semanticIdOf = (submodel: aas.types.Submodel) => submodel.semanticId?.keys?.at(-1)?.value?.trim() ?? '';
    this.dppSubmodels = this.generatorService.additionalV3Submodels
      .filter(
        (submodel) =>
          submodel.idShort !== 'DppMeta' &&
          submodel.idShort !== 'DppMetadata' &&
          submodel.idShort?.toLowerCase() !== 'aasdesignerchangelog',
      )
      .map((submodel) => ({
        id: submodel.id,
        name: submodel.idShort ?? submodel.id,
        semanticId: semanticIdOf(submodel),
        selected: semanticIdOf(submodel) !== '' && (previousSelection.get(semanticIdOf(submodel)) ?? true),
      }));
    this.dppMetadata = previousMetadata ?? {
      aasId: shell.id,
      uniqueProductIdentifier: shell.assetInformation.globalAssetId ?? '',
      granularity: shell.assetInformation.assetKind === aas.types.AssetKind.Instance ? 'Item' : 'Model',
      dppSchemaVersion: 'EN 18223:2026',
      dppStatus: 'Draft',
      economicOperatorId: '',
      facilityId: null,
      contentSpecificationIds: [],
    };
  }

  get dppMetadataComplete(): boolean {
    return (
      this.dppMetadata == null ||
      (this.dppMetadata.uniqueProductIdentifier.trim() !== '' &&
        this.dppMetadata.dppSchemaVersion.trim() !== '' &&
        this.dppMetadata.economicOperatorId.trim() !== '')
    );
  }

  getTreeNode(submodel: any) {
    const documentNode = {} as TreeNode;
    documentNode.children = [];
    const modelTypeName = this.getModelTypeName(submodel);

    documentNode.data = {
      label: submodel.idShort,
      value: this.getGenericNodeValue(submodel, modelTypeName),
      type: 'GENERIC_' + modelTypeName,
    };
    if (submodel.submodelElements != null) {
      submodel.submodelElements.forEach((s: any) => {
        documentNode.children?.push(this.getTreeNode(s));
      });
    }
    if (modelTypeName === 'SubmodelElementCollection') {
      submodel.value.forEach((s: any) => {
        documentNode.children?.push(this.getTreeNode(s));
      });
    }
    if (modelTypeName === 'SubmodelElementList') {
      submodel.value?.forEach((s: any) => {
        documentNode.children?.push(this.getTreeNode(s));
      });
    }

    return documentNode;
  }

  private getModelTypeName(submodel: any): string {
    if (typeof submodel?.modelType === 'string') {
      return submodel.modelType;
    }
    return submodel?.modelType?.name ?? 'Unknown';
  }

  private getGenericNodeValue(submodel: any, modelTypeName: string): any {
    switch (modelTypeName) {
      case 'Property':
        return submodel?.value ?? '';
      case 'File':
        return {
          value: submodel?.value ?? '',
          mimeType: submodel?.contentType ?? submodel?.mimeType ?? '',
        };
      case 'MultiLanguageProperty':
        return submodel?.value ?? [];
      case 'Submodel':
      case 'SubmodelElementCollection':
      case 'SubmodelElementList':
        return '';
      default:
        return this.normalizeGenericValue(submodel?.value);
    }
  }

  private normalizeGenericValue(value: any): any {
    if (value == null) {
      return '';
    }
    if (Array.isArray(value)) {
      // Arrays in the tree are usually represented as child rows.
      if (value.some((entry) => typeof entry === 'object' && entry != null)) {
        return '';
      }
      return value.join(', ');
    }
    if (typeof value === 'object') {
      return '';
    }
    return value;
  }

  stringify(val: any) {
    return JSON.stringify(val);
  }

  createDocumentNode() {
    const documentNode = {} as TreeNode;

    documentNode.data = { label: this.translate.instant('DOCUMENTS') };
    documentNode.children = [];

    this.generatorService.getCurrentGeneratorDocumentItems(this.translate.currentLang || 'en').forEach((item) => {
      const childNode = {} as TreeNode;
      childNode.data = {
        label: this.getLabel(item),
        value: item,
        type: 'DocumentItem',
      };

      documentNode.children?.push(childNode);
    });

    return documentNode;
  }

  getLabel(item: any) {
    if (item.idShort.length > 0) return item.idShort;
    if (item.documentVersion[0].title.length > 0) return item.documentVersion[0].title;
    if (item.documentId[0].valueId.length > 0) return item.documentId[0].valueId;
    return item.documentVersion[0].digitalFile?.name;
  }

  createNameplateNode(nameplateSource: GeneratorNameplateSource | null) {
    const nameplateNode = {} as TreeNode;
    const nameplate = nameplateSource?.nameplate;

    nameplateNode.data = { label: this.translate.instant('NAMEPLATE') };
    nameplateNode.children = [];

    let childNode = {} as TreeNode;
    childNode.data = {
      value: nameplate?.manufacturer,
      label: this.translate.instant('MANUFACTURER_NAME'),
      type: 'MLP',
    };
    nameplateNode.children.push(childNode);

    childNode = {} as TreeNode;
    childNode.data = { label: this.translate.instant('ADDRESS') };
    childNode.children = [];

    let childChildNode = {} as TreeNode;
    childChildNode.data = {
      label: this.translate.instant('STREET'),
      value: nameplate?.address?.street,
      type: 'MLP',
    };
    childNode.children.push(childChildNode);

    childChildNode = {} as TreeNode;
    childChildNode.data = {
      label: this.translate.instant('ZIP'),
      value: nameplate?.address?.zip,
      type: 'MLP',
    };
    childNode.children.push(childChildNode);

    childChildNode = {} as TreeNode;
    childChildNode.data = {
      label: this.translate.instant('CITY_TOWN'),
      value: nameplate?.address?.cityTown,
      type: 'MLP',
    };
    childNode.children.push(childChildNode);

    childChildNode = {} as TreeNode;
    childChildNode.data = {
      label: this.translate.instant('STATE_COUNTY'),
      value: nameplate?.address?.stateCounty,
      type: 'MLP',
    };
    childNode.children.push(childChildNode);

    childChildNode = {} as TreeNode;
    childChildNode.data = {
      label: this.translate.instant('COUNTRY_CODE'),
      value: nameplate?.address?.countryCode,
      type: 'MLP',
    };
    childNode.children.push(childChildNode);

    nameplateNode.children.push(childNode);

    childNode = {} as TreeNode;
    childNode.data = {
      value: nameplate?.productDesignation,
      label: this.translate.instant('MANUFACTURER_PRODUCT_DESIGNATION'),
      type: 'MLP',
    };
    nameplateNode.children.push(childNode);

    childNode = {} as TreeNode;
    childNode.data = {
      value: nameplate?.productFamily,
      label: this.translate.instant('PRODUCT_FAMILY'),
      type: 'MLP',
    };
    nameplateNode.children.push(childNode);

    childNode = {} as TreeNode;
    if (this.generatorService.showStandardGeneratorSerialNumber) {
      childNode = {} as TreeNode;
      childNode.data = {
        value: nameplate?.serialNumber,
        label: this.translate.instant('SERIAL_NUMBER'),
      };
      nameplateNode.children.push(childNode);
    }

    if (this.generatorService.showStandardGeneratorManufacturingDate) {
      childNode = {} as TreeNode;
      childNode.data = {
        value: nameplate?.yearOfConstruction,
        label: this.translate.instant('YEAR_OF_CONSTRUCTION'),
      };
      nameplateNode.children.push(childNode);
    }

    // TODO: Attach markings
    childNode = {} as TreeNode;
    childNode.data = { label: this.translate.instant('KENNZEICHEN') };
    childNode.children = [];
    (nameplate?.markings ?? []).forEach((marking) => {
      childChildNode = {} as TreeNode;
      childChildNode.data = {
        value:
          marking.file != null
            ? this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(marking.file))
            : this.getUrl(marking.filename),
        type: 'Image',

        label: `${marking.name} / ${marking.additionalText}`,
      };
      childNode.children?.push(childChildNode);
    });
    nameplateNode.children.push(childNode);

    return nameplateNode;
  }

  private getFilenameFromFileReference(reference: string | null | undefined) {
    const normalizedReference = `${reference ?? ''}`.replace(/^file:/, '').trim();
    if (normalizedReference === '') {
      return null;
    }

    return (
      normalizedReference
        .split('/')
        .filter((segment) => segment !== '')
        .at(-1) ?? normalizedReference
    );
  }

  private async resolveAssetThumbnailSummaryUrl(currentShell: aas.types.AssetAdministrationShell) {
    const assetThumbnailFile = this.generatorService.getCurrentGeneratorAssetThumbnailFile();
    if (assetThumbnailFile != null) {
      await this.previewState.syncPreview('asset-thumbnail-summary', assetThumbnailFile);

      const previewUrl = this.previewState.getPreviewUrl('asset-thumbnail-summary');
      if (previewUrl != null) {
        return this.sanitizer.bypassSecurityTrustUrl(previewUrl);
      }
    }

    return this.getUrl(this.getFilenameFromFileReference(currentShell.assetInformation?.defaultThumbnail?.path));
  }

  getUrl(filename: string | null | undefined) {
    if (this.data != null && this.generatorService.currentId != null && filename != null) {
      return `${this.appConfigService.config.apiPath}/Aas/getFileFromAas?id=${
        this.generatorService.currentId
      }&filename=${encodeURIComponent(filename)}`;
    } else {
      return '';
    }
  }

  prev() {
    history.back();
  }

  private createPcfNode() {
    const rootNode = {} as TreeNode;
    rootNode.data = { label: this.translate.instant('PRODUCT_CARBON_FOOTPRINT') };
    rootNode.children = [];

    const appendEntries = (labelKey: string, definitionType: any, entries: any[]) => {
      const sectionNode = {} as TreeNode;
      sectionNode.data = { label: this.translate.instant(labelKey) };
      sectionNode.children = [];

      const definition = this.dppAssistantService.getPcfEntryDefinition(definitionType);

      entries.forEach((entry, index) => {
        const entryNode = {} as TreeNode;
        entryNode.data = { label: `${index + 1}` };
        entryNode.children = [];

        definition.groups.forEach((group) => {
          const groupNode = {} as TreeNode;
          groupNode.data = { label: this.translate.instant(group.labelKey) };
          groupNode.children = [];

          group.fields.forEach((field) => {
            const fieldNode = {} as TreeNode;
            const rawValue = entry.values[field.id];
            const value =
              Array.isArray(rawValue) && (rawValue.length === 0 || typeof rawValue[0] === 'string')
                ? (rawValue as string[]).filter((item) => item.trim() !== '').join(', ')
                : rawValue;
            fieldNode.data = {
              label: this.translate.instant(field.labelKey),
              value,
              type: field.fieldType === 'multilanguage' ? 'MLP' : 'Text',
            };
            groupNode.children?.push(fieldNode);
          });

          entryNode.children?.push(groupNode);
        });

        sectionNode.children?.push(entryNode);
      });

      rootNode.children?.push(sectionNode);
    };

    appendEntries(
      'DPP_PCF_TYPE_PRODUCT',
      'product-carbon-footprint',
      this.generatorService.dppPcfEntries.productCarbonFootprints,
    );
    appendEntries(
      'DPP_PCF_TYPE_PRODUCT_OR_SECTOR',
      'product-or-sector-specific-carbon-footprint',
      this.generatorService.dppPcfEntries.productOrSectorSpecificCarbonFootprints,
    );

    return rootNode;
  }

  async saveAndContinueV3() {
    try {
      this.loading = true;
      if (!this.dppMetadataComplete) return;
      const metadata = this.buildDppMetadataInput();
      const res = await this.generatorService.saveShell(metadata);
      if (metadata != null) {
        await firstValueFrom(this.http.get('/bff/csrf', { responseType: 'text', withCredentials: true }));
        await firstValueFrom(this.http.put('/aas-proxy/dpp/metadata', metadata, { withCredentials: true }));
      }

      this.notificationService.showMessageAlways('VWS_SAVED', 'SUCCESS', 'success', false);
      this.router.navigate(PortalService.buildRepoEditRoute(res.aasId ?? ''));
    } catch (error) {
      this.notificationService.showMessageAlways(
        this.generatorService.getSaveShellErrorMessage(error),
        'ERROR',
        'error',
        true,
      );
    } finally {
      this.loading = false;
    }
  }

  async debugValidateGeneratedAas() {
    try {
      this.loading = true;
      if (!this.dppMetadataComplete) return;
      const environment = await this.generatorService.getVerifiableEnvironmentV3(this.buildDppMetadataInput());
      const validationErrors = this.mapValidationErrors(aas.verification.verify(environment));

      this.validationErrors.set(validationErrors);
      this.validationErrorCount = validationErrors.length;
      this.showValidationResult();
    } catch (error) {
      this.notificationService.showMessageAlways(
        this.generatorService.getSaveShellErrorMessage(error),
        'ERROR',
        'error',
        true,
      );
    } finally {
      this.loading = false;
    }
  }

  private buildDppMetadataInput(): GeneratorDppMetadataInput | undefined {
    if (this.dppMetadata == null) return undefined;

    return {
      ...this.dppMetadata,
      facilityId: this.dppMetadata.facilityId?.trim() || null,
      contentSpecificationIds: [
        ...new Set(
          this.dppSubmodels
            .filter((submodel) => submodel.selected && submodel.semanticId)
            .map((submodel) => submodel.semanticId),
        ),
      ],
    };
  }

  async applyCurrentExportFixes() {
    try {
      this.loading = true;
      await this.generatorService.applyCurrentExportFixes();
      await this.loadSummaryData();
      this.notificationService.showMessageAlways('GENERATOR_TEMPLATE_FIXES_APPLIED', 'SUCCESS', 'success', false);
    } catch (error) {
      this.notificationService.showMessageAlways(
        this.generatorService.getSaveShellErrorMessage(error),
        'ERROR',
        'error',
        true,
      );
    } finally {
      this.loading = false;
    }
  }

  showValidationResult() {
    this.displayValidationResult = true;
  }

  private mapValidationErrors(errors: Iterable<VerificationError>) {
    const validationErrors: AasDesignerVerificationError[] = [];
    let number = 1;

    for (const error of errors) {
      if (error.message.includes('RFC 8089')) {
        continue;
      }

      const mappedError = new AasDesignerVerificationError(error);
      const translated = this.translate.instant('errorMessages.' + error.message);

      mappedError.messageTranslated = translated !== 'errorMessages.' + error.message ? translated : error.message;
      mappedError.number = number++;
      validationErrors.push(mappedError);
    }

    return validationErrors;
  }
}
