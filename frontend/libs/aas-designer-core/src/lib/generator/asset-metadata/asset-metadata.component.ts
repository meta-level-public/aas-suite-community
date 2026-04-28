import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HelpLabelComponent } from '@aas/common-components';
import { PortalService } from '@aas/common-services';
import { FilenameHelper } from '@aas/helpers';
import { ApiException } from '@aas/jwt-auth';
import { MultiLanguagePropertyValue } from '@aas/model';
import { ShellsClient } from '@aas/webapi-client';
import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, TreeNode } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { KeyFilter } from 'primeng/keyfilter';
import { Tag } from 'primeng/tag';
import { lastValueFrom } from 'rxjs';
import { Info } from '../../general/model/info-item';
import { SidebarTreeNavComponent } from '../../general/sidebar-tree-nav/sidebar-tree-nav.component';
import { MultilanguagePropertyComponent } from '../../general/structural-elements/multilanguage-property/multilanguage-property.component';
import {
  buildAssetIdentifier,
  buildAssetShellIdentifier,
  buildAssetShellIdShortSuggestion,
  buildNextAssetShellIdShortCandidate,
  normalizeAssetShellIdShort,
} from '../asset-shell-id.utils';
import { buildGeneratorFilePreviewBlob, isGeneratorFilePreviewable } from '../generator-file-preview.utils';
import {
  GeneratorFileUploadCardComponent,
  type GeneratorFileUploadCardState,
} from '../generator-file-upload-card/generator-file-upload-card.component';
import { GeneratorPageShellComponent } from '../generator-page-shell/generator-page-shell.component';
import { GeneratorStateStore } from '../generator-state.store';
import { GeneratorService } from '../generator.service';

interface AssetMetadataStep {
  key: string;
  labelKey: string;
  descriptionKey: string;
  focusTargetId: string;
}

interface AssetMetadataViewModel {
  assetId: string;
  assetShellId: string;
  assetShellIdentifier: string;
  assetShellDescription: MultiLanguagePropertyValue[];
  assetThumbnailFile: File | undefined;
  assetThumbnailFilename: string;
  packageThumbnailFile: File | undefined;
  packageThumbnailFilename: string;
}

@Component({
  selector: 'aas-asset-metadata',
  templateUrl: './asset-metadata.component.html',
  styleUrl: './asset-metadata.component.scss',
  host: {
    class: 'flex flex-col flex-1',
  },
  imports: [
    HelpLabelComponent,
    FormsModule,
    InputText,
    KeyFilter,
    MultilanguagePropertyComponent,
    GeneratorFileUploadCardComponent,
    Button,
    Tag,
    TranslateModule,
    GeneratorPageShellComponent,
    SidebarTreeNavComponent,
  ],
})
export class AssetMetadataComponent implements OnInit, DoCheck, OnDestroy {
  info = Info;

  idShortRegex = /[a-z0-9_-]/i;
  generatedAssetShellId = '';
  generatedAssetId = '';
  generatedAssetShellIdentifier = '';
  assetThumbnailPreviewUrl = '';
  assetThumbnailPreviewUnavailable = false;
  assetShellIdCorrectionSuggestion = '';
  activeStepIndex = 0;
  isCheckingAssetShellIdAvailability = false;
  hasAssetShellIdCollision = false;
  private lastDescriptionFingerprint = '';
  private lastAppliedSuggestion = '';
  private lastAppliedIdentifierSuggestion = '';
  private hasManualAssetShellIdOverride = false;
  private assetShellIdAvailabilityRequestId = 0;
  private assetShellIdAvailabilityPromise: Promise<void> = Promise.resolve();
  private assetThumbnailPreviewRequestId = 0;
  private assetShellDescriptionBuffer: MultiLanguagePropertyValue[] = [];
  private assetShellDescriptionBufferFingerprint = '';
  private readonly assetMetadataSteps: AssetMetadataStep[] = [
    {
      key: 'description',
      labelKey: 'ASSET_METADATA_DESCRIPTION_STEP',
      descriptionKey: 'ASSET_METADATA_DESCRIPTION_STEP_EXPL',
      focusTargetId: 'assetShellDescription',
    },
    {
      key: 'identifiers',
      labelKey: 'ASSET_METADATA_IDENTIFIERS_STEP',
      descriptionKey: 'ASSET_METADATA_IDENTIFIERS_STEP_EXPL',
      focusTargetId: 'assetShellId',
    },
    {
      key: 'image',
      labelKey: 'ASSET_METADATA_IMAGE_STEP',
      descriptionKey: 'ASSET_METADATA_IMAGE_STEP_EXPL',
      focusTargetId: 'assetThumbnailUpload',
    },
  ];

  constructor(
    private router: Router,
    private generatorService: GeneratorService,
    private generatorStateStore: GeneratorStateStore,
    private confirmationService: ConfirmationService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private portalService: PortalService,
    private shellsClient: ShellsClient,
  ) {}

  get data(): AssetMetadataViewModel | null {
    const rootShell = this.generatorService.getCurrentGeneratorRootShell();
    if (rootShell == null) {
      return null;
    }

    const getAssetShellDescriptionBuffer = this.getAssetShellDescriptionBuffer.bind(this);
    const setAssetShellDescriptionBuffer = this.setAssetShellDescriptionBuffer.bind(this);
    const getAssetThumbnailFilename = this.getAssetThumbnailFilename.bind(this);
    const setAssetThumbnailFilename = this.setAssetThumbnailFilename.bind(this);
    const generatorService = this.generatorService;
    const generatorStateStore = this.generatorStateStore;

    rootShell.description ??= [];

    return {
      get assetId() {
        return rootShell.assetInformation.globalAssetId ?? '';
      },
      set assetId(value: string) {
        rootShell.assetInformation.globalAssetId = `${value ?? ''}`;
      },
      get assetShellId() {
        return rootShell.idShort ?? '';
      },
      set assetShellId(value: string) {
        rootShell.idShort = `${value ?? ''}`;
      },
      get assetShellIdentifier() {
        return rootShell.id ?? '';
      },
      set assetShellIdentifier(value: string) {
        rootShell.id = `${value ?? ''}`;
      },
      get assetShellDescription() {
        return getAssetShellDescriptionBuffer(rootShell);
      },
      set assetShellDescription(value: MultiLanguagePropertyValue[]) {
        setAssetShellDescriptionBuffer(rootShell, value);
      },
      get assetThumbnailFile() {
        return generatorService.getCurrentGeneratorAssetThumbnailFile() ?? undefined;
      },
      set assetThumbnailFile(value: File | undefined) {
        generatorStateStore.setFileAttachment('assetThumbnail', value ?? null);
      },
      get assetThumbnailFilename() {
        return getAssetThumbnailFilename();
      },
      set assetThumbnailFilename(value: string) {
        setAssetThumbnailFilename(value);
      },
      get packageThumbnailFile() {
        return generatorService.getCurrentGeneratorPackageThumbnailFile() ?? undefined;
      },
      set packageThumbnailFile(value: File | undefined) {
        generatorStateStore.setPackageThumbnail(
          value ?? null,
          generatorService.getCurrentGeneratorPackageThumbnailFilename(),
        );
      },
      get packageThumbnailFilename() {
        return generatorService.getCurrentGeneratorPackageThumbnailFilename();
      },
      set packageThumbnailFilename(value: string) {
        generatorStateStore.setPackageThumbnail(generatorService.getCurrentGeneratorPackageThumbnailFile(), value);
      },
    };
  }

  get steps() {
    return this.assetMetadataSteps;
  }

  get currentStep() {
    return this.steps[this.activeStepIndex] ?? this.steps[0];
  }

  get activeStepKey() {
    return this.currentStep?.key ?? null;
  }

  get stepNodes(): TreeNode[] {
    return this.steps.map((step, index) => ({
      key: step.key,
      label: step.labelKey,
      data: {
        description: step.descriptionKey,
        descriptionTranslate: true,
        disabled: !this.isStepUnlocked(index),
      },
      selectable: true,
    }));
  }

  get isLastStep() {
    return this.activeStepIndex >= this.steps.length - 1;
  }

  get canProceedFromCurrentStep() {
    return this.isStepComplete(this.activeStepIndex);
  }

  get currentStepValidationMessageKey() {
    if (this.canProceedFromCurrentStep) {
      return null;
    }

    if (this.activeStepIndex === 0) {
      return this.hasAnyDescriptionContent()
        ? 'ASSET_METADATA_DESCRIPTION_MIN_LENGTH_HINT'
        : 'ASSET_METADATA_DESCRIPTION_REQUIRED_HINT';
    }

    if (this.activeStepIndex === 1) {
      if (this.hasAssetShellIdCollision) {
        return 'ASSET_SHELL_ID_ALREADY_EXISTS_HINT';
      }

      if (this.isCheckingAssetShellIdAvailability) {
        return 'ASSET_SHELL_ID_CHECKING_HINT';
      }

      return 'ASSET_METADATA_ID_SHORT_REQUIRED_HINT';
    }

    return null;
  }

  get assetShellIdentifierStatusKey() {
    if (this.isCheckingAssetShellIdAvailability) {
      return 'ASSET_SHELL_ID_STATUS_CHECKING';
    }

    if (this.hasAssetShellIdCollision) {
      return 'ASSET_SHELL_ID_STATUS_EXISTS';
    }

    if (this.generatedAssetShellIdentifier !== '') {
      return 'ASSET_SHELL_ID_STATUS_AVAILABLE';
    }

    return '';
  }

  get assetShellIdentifierStatusSeverity() {
    if (this.isCheckingAssetShellIdAvailability) {
      return 'info';
    }

    if (this.hasAssetShellIdCollision) {
      return 'warn';
    }

    if (this.generatedAssetShellIdentifier !== '') {
      return 'success';
    }

    return undefined;
  }

  get assetShellIdentifierStatusIcon() {
    if (this.isCheckingAssetShellIdAvailability) {
      return 'pi pi-spin pi-spinner';
    }

    if (this.hasAssetShellIdCollision) {
      return 'pi pi-exclamation-triangle';
    }

    if (this.generatedAssetShellIdentifier !== '') {
      return 'pi pi-check-circle';
    }

    return '';
  }

  ngOnInit(): void {
    if (this.generatorService.getCurrentGeneratorRootShell() == null) {
      this.router.navigate(['generator', 'select-type']);
      return;
    }

    this.focusCurrentStep();
    if (this.data && this.data.assetId === 'new') {
      this.data.assetId = '';
    }
    this.refreshAssetShellSuggestions();
    this.syncStoreFromCurrentData();
    this.syncAssetThumbnailPreview();
  }

  ngOnDestroy(): void {
    this.clearAssetThumbnailPreview();
  }

  ngDoCheck(): void {
    this.syncAssetShellDescriptionBufferToShell();

    const descriptionFingerprint = this.getDescriptionFingerprint(this.data?.assetShellDescription);
    if (descriptionFingerprint === this.lastDescriptionFingerprint) {
      return;
    }

    this.refreshAssetShellSuggestions();
  }

  async nextPage() {
    if (this.activeStepIndex === 1) {
      await this.assetShellIdAvailabilityPromise;
    }

    if (!this.canProceedFromCurrentStep) {
      return;
    }

    if (!this.isLastStep) {
      this.activeStepIndex++;
      this.focusCurrentStep();
      return;
    }

    this.router.navigate(['generator', 'nameplate']);
  }

  prevPage() {
    if (this.activeStepIndex > 0) {
      this.activeStepIndex--;
      this.focusCurrentStep();
      return;
    }

    history.back();
  }

  selectStep(index: number) {
    if (index < 0 || index >= this.steps.length) {
      return;
    }

    if (!this.isStepUnlocked(index)) {
      return;
    }

    this.activeStepIndex = index;
    this.focusCurrentStep();
  }

  selectStepNode(node: TreeNode) {
    const nodeKey = `${node.key ?? ''}`;
    const index = this.steps.findIndex((step) => step.key === nodeKey);

    if (index === -1) {
      return;
    }

    this.selectStep(index);
  }

  isStepUnlocked(index: number) {
    if (index <= this.activeStepIndex) {
      return true;
    }

    for (let stepIndex = 0; stepIndex < index; stepIndex++) {
      if (!this.isStepComplete(stepIndex)) {
        return false;
      }
    }

    return true;
  }

  focusnext(elementId: string) {
    setTimeout(() => document.getElementById(elementId)?.focus());
  }

  applySuggestedAssetShellId() {
    if (this.data == null || this.generatedAssetShellId === '') {
      return;
    }

    this.data.assetShellId = this.generatedAssetShellId;
    this.hasManualAssetShellIdOverride = false;
    this.lastAppliedSuggestion = this.generatedAssetShellId;
    this.syncAssetIdentifier();
    this.syncAssetShellIdentifier();
    this.syncStoreFromCurrentData();
    this.scheduleAssetShellIdAvailabilityCheck(true);
  }

  applyCorrectedAssetShellId() {
    if (this.data == null || this.assetShellIdCorrectionSuggestion === '') {
      return;
    }

    this.data.assetShellId = this.assetShellIdCorrectionSuggestion;
    this.hasManualAssetShellIdOverride = false;
    this.lastAppliedSuggestion = this.assetShellIdCorrectionSuggestion;
    this.syncAssetIdentifier();
    this.syncAssetShellIdentifier();
    this.syncStoreFromCurrentData();
    this.scheduleAssetShellIdAvailabilityCheck(false);
  }

  hasAlternativeSuggestion() {
    if (this.data == null || this.generatedAssetShellId === '') {
      return false;
    }

    return this.data.assetShellId.trim() !== this.generatedAssetShellId;
  }

  onAssetShellIdChanged(value: string | number | null) {
    if (this.data == null) {
      return;
    }

    this.data.assetShellId = normalizeAssetShellIdShort(value == null ? '' : `${value}`);
    this.hasManualAssetShellIdOverride = true;
    this.syncAssetIdentifier();
    this.syncAssetShellIdentifier();
    this.syncStoreFromCurrentData();
    this.scheduleAssetShellIdAvailabilityCheck(false);
  }

  get organisationPrefix() {
    return this.portalService.iriPrefix;
  }

  get hasAssetThumbnailPreview() {
    return this.assetThumbnailPreviewUrl !== '';
  }

  get hasAssetThumbnailPreviewFallback() {
    return this.assetThumbnailPreviewUnavailable && this.data?.assetThumbnailFile != null;
  }

  get assetThumbnailUploadCardState(): GeneratorFileUploadCardState {
    return {
      filename: this.data?.assetThumbnailFilename || null,
      contentType: this.data?.assetThumbnailFile?.type ?? null,
      hasSelection: !!this.data?.assetThumbnailFilename,
      previewUrl: this.assetThumbnailPreviewUrl || null,
      showPreviewFallback: this.hasAssetThumbnailPreviewFallback,
      previewAlt: this.data?.assetThumbnailFilename || 'ASSET_THUMBNAIL',
    };
  }

  setPackageThumbnail(event: { files: File[] }) {
    const file = event.files[0];
    if (file == null) {
      return;
    }

    if (this.data != null) {
      this.data.packageThumbnailFile = file;
      this.data.packageThumbnailFilename = FilenameHelper.sanitizeFilename(file.name);
    }
  }

  async setAssetThumbnail(event: { files: File[] }) {
    const file = event.files[0];
    if (file == null) {
      return;
    }

    if (this.data != null) {
      this.data.assetThumbnailFile = file;
      this.data.assetThumbnailFilename = FilenameHelper.sanitizeFilename(file.name);
      this.syncStoreFromCurrentData();
      await this.syncAssetThumbnailPreview();
    }
  }

  private async syncAssetThumbnailPreview() {
    const file = this.data?.assetThumbnailFile;
    const requestId = ++this.assetThumbnailPreviewRequestId;

    this.clearAssetThumbnailPreview();
    this.assetThumbnailPreviewUnavailable = false;

    if (file == null) {
      return;
    }

    try {
      if (!isGeneratorFilePreviewable(file)) {
        return;
      }

      const previewBlob = await buildGeneratorFilePreviewBlob(file);
      if (requestId !== this.assetThumbnailPreviewRequestId) {
        return;
      }

      this.assetThumbnailPreviewUrl = URL.createObjectURL(previewBlob);
    } catch {
      if (requestId !== this.assetThumbnailPreviewRequestId) {
        return;
      }

      this.assetThumbnailPreviewUnavailable = true;
    }
  }

  private clearAssetThumbnailPreview() {
    if (this.assetThumbnailPreviewUrl === '') {
      return;
    }

    URL.revokeObjectURL(this.assetThumbnailPreviewUrl);
    this.assetThumbnailPreviewUrl = '';
  }

  private refreshAssetShellSuggestions() {
    this.lastDescriptionFingerprint = this.getDescriptionFingerprint(this.data?.assetShellDescription);
    this.generatedAssetShellId = buildAssetShellIdShortSuggestion(this.data?.assetShellDescription, [
      this.translate.currentLang,
      this.translate.getDefaultLang?.(),
      'de',
      'en',
    ]);

    if (this.data == null || this.generatedAssetShellId === '') {
      this.hasAssetShellIdCollision = false;
      this.assetShellIdCorrectionSuggestion = '';
      this.generatedAssetId = buildAssetIdentifier(this.portalService.iriPrefix, this.data?.assetShellId);
      if (this.data != null) {
        this.data.assetId = this.generatedAssetId;
      }
      this.generatedAssetShellIdentifier = buildAssetShellIdentifier(
        this.portalService.iriPrefix,
        this.data?.assetShellId,
      );
      this.syncStoreFromCurrentData();
      return;
    }

    const currentValue = normalizeAssetShellIdShort(this.data.assetShellId);
    const shouldApplySuggestedId =
      currentValue === '' ||
      currentValue === this.lastAppliedSuggestion ||
      (!this.hasManualAssetShellIdOverride && this.isPlaceholderAssetShellId(currentValue));

    if (shouldApplySuggestedId) {
      this.data.assetShellId = this.generatedAssetShellId;
      this.hasManualAssetShellIdOverride = false;
      this.lastAppliedSuggestion = this.generatedAssetShellId;
    }

    this.syncAssetIdentifier();
    this.syncAssetShellIdentifier();
    this.syncStoreFromCurrentData();
    this.scheduleAssetShellIdAvailabilityCheck(shouldApplySuggestedId);
  }

  private syncAssetIdentifier() {
    if (this.data == null) {
      this.generatedAssetId = '';
      return;
    }

    this.generatedAssetId = buildAssetIdentifier(this.portalService.iriPrefix, this.data.assetShellId);
    this.data.assetId = this.generatedAssetId;
  }

  private getDescriptionFingerprint(descriptionValues: MultiLanguagePropertyValue[] | undefined) {
    return (descriptionValues ?? []).map((entry) => `${entry?.language ?? ''}:${entry?.text ?? ''}`).join('|');
  }

  private isPlaceholderAssetShellId(value: string) {
    return value === 'aa' || value === 'TypeAssetAdministrationShell' || value === 'InstanceAssetAdministrationShell';
  }

  private syncAssetShellIdentifier() {
    if (this.data == null) {
      this.generatedAssetShellIdentifier = '';
      return;
    }

    this.generatedAssetShellIdentifier = buildAssetShellIdentifier(
      this.portalService.iriPrefix,
      this.data.assetShellId,
    );
    this.data.assetShellIdentifier = this.generatedAssetShellIdentifier;
    this.lastAppliedIdentifierSuggestion = this.generatedAssetShellIdentifier;
  }

  private syncStoreFromCurrentData() {
    this.syncAssetShellDescriptionBufferToShell();
    this.generatorStateStore.updateAssetMetadata(this.data, this.portalService.iriPrefix);
  }

  private getAssetShellDescriptionBuffer(rootShell: aas.types.AssetAdministrationShell) {
    const shellDescription = this.toMultiLanguagePropertyValues(rootShell.description);
    const shellFingerprint = this.getDescriptionFingerprint(shellDescription);

    if (shellFingerprint !== this.assetShellDescriptionBufferFingerprint) {
      this.assetShellDescriptionBuffer = shellDescription;
      this.assetShellDescriptionBufferFingerprint = shellFingerprint;
    }

    return this.assetShellDescriptionBuffer;
  }

  private setAssetShellDescriptionBuffer(
    rootShell: aas.types.AssetAdministrationShell,
    value: MultiLanguagePropertyValue[] | undefined,
  ) {
    const nextBuffer = this.toMultiLanguagePropertyValues(value);
    this.assetShellDescriptionBuffer = nextBuffer;
    this.assetShellDescriptionBufferFingerprint = this.getDescriptionFingerprint(nextBuffer);
    rootShell.description = this.toLangStrings(nextBuffer);
  }

  private syncAssetShellDescriptionBufferToShell() {
    const rootShell = this.generatorService.getCurrentGeneratorRootShell();
    if (rootShell == null) {
      return;
    }

    const currentBufferFingerprint = this.getDescriptionFingerprint(this.assetShellDescriptionBuffer);

    if (currentBufferFingerprint !== this.assetShellDescriptionBufferFingerprint) {
      // Buffer was mutated by user input — persist changes to the shell.
      rootShell.description = this.toLangStrings(this.assetShellDescriptionBuffer);
      this.assetShellDescriptionBufferFingerprint = currentBufferFingerprint;
      return;
    }

    const shellDescription = this.toMultiLanguagePropertyValues(rootShell.description);
    const shellFingerprint = this.getDescriptionFingerprint(shellDescription);

    if (shellFingerprint !== this.assetShellDescriptionBufferFingerprint) {
      // Shell was modified externally (e.g. by suggestions) — update buffer from shell.
      this.assetShellDescriptionBuffer = shellDescription;
      this.assetShellDescriptionBufferFingerprint = shellFingerprint;
    }
  }

  private toMultiLanguagePropertyValues(
    value: Array<{ language?: string | null; text?: string | null }> | undefined | null,
  ): MultiLanguagePropertyValue[] {
    return (value ?? []).map((entry) => ({
      language: `${entry?.language ?? ''}`,
      text: `${entry?.text ?? ''}`,
    }));
  }

  private toLangStrings(value: MultiLanguagePropertyValue[] | undefined) {
    return (value ?? [])
      .filter((entry) => `${entry?.language ?? ''}` !== '' || `${entry?.text ?? ''}` !== '')
      .map((entry) => new aas.types.LangStringTextType(`${entry?.language ?? ''}`, `${entry?.text ?? ''}`));
  }

  private getAssetThumbnailFilename() {
    const normalizedPath =
      `${this.generatorService.getCurrentGeneratorRootShell()?.assetInformation?.defaultThumbnail?.path ?? ''}`
        .replace(/^file:/, '')
        .trim();

    if (normalizedPath === '') {
      return '';
    }

    return (
      normalizedPath
        .split('/')
        .filter((segment) => segment !== '')
        .at(-1) ?? normalizedPath
    );
  }

  private setAssetThumbnailFilename(filename: string) {
    const rootShell = this.generatorService.getCurrentGeneratorRootShell();
    if (rootShell == null) {
      return;
    }

    const normalizedFilename = `${filename ?? ''}`.trim();
    if (normalizedFilename === '') {
      rootShell.assetInformation.defaultThumbnail = null;
      return;
    }

    rootShell.assetInformation.defaultThumbnail = new aas.types.Resource(
      `file:/aasx/files/${normalizedFilename}`,
      this.generatorService.getCurrentGeneratorAssetThumbnailFile()?.type,
    );
  }

  private scheduleAssetShellIdAvailabilityCheck(autoCorrect: boolean) {
    this.assetShellIdAvailabilityPromise = this.updateAssetShellIdAvailability(autoCorrect);
  }

  private async updateAssetShellIdAvailability(autoCorrect: boolean) {
    const requestId = ++this.assetShellIdAvailabilityRequestId;
    const currentIdShort = normalizeAssetShellIdShort(this.data?.assetShellId);

    if (currentIdShort === '' || this.data == null) {
      this.isCheckingAssetShellIdAvailability = false;
      this.hasAssetShellIdCollision = false;
      this.assetShellIdCorrectionSuggestion = '';
      return;
    }

    this.isCheckingAssetShellIdAvailability = true;

    try {
      const availability = await this.resolveAssetShellIdAvailability(currentIdShort);
      if (requestId !== this.assetShellIdAvailabilityRequestId || this.data == null) {
        return;
      }

      if (autoCorrect && availability.exists && availability.nextAvailableId !== '') {
        this.data.assetShellId = availability.nextAvailableId;
        this.lastAppliedSuggestion = availability.nextAvailableId;
        this.syncAssetIdentifier();
        this.syncAssetShellIdentifier();
        this.hasAssetShellIdCollision = false;
        this.assetShellIdCorrectionSuggestion = '';
        return;
      }

      this.hasAssetShellIdCollision = availability.exists;
      this.assetShellIdCorrectionSuggestion = availability.exists ? availability.nextAvailableId : '';
    } catch {
      if (requestId !== this.assetShellIdAvailabilityRequestId) {
        return;
      }

      this.hasAssetShellIdCollision = false;
      this.assetShellIdCorrectionSuggestion = '';
    } finally {
      if (requestId === this.assetShellIdAvailabilityRequestId) {
        this.isCheckingAssetShellIdAvailability = false;
      }
    }
  }

  private async resolveAssetShellIdAvailability(idShort: string) {
    const normalizedIdShort = normalizeAssetShellIdShort(idShort);
    const currentIdentifier = buildAssetShellIdentifier(this.portalService.iriPrefix, normalizedIdShort);

    if (currentIdentifier === '') {
      return { exists: false, nextAvailableId: '' };
    }

    const currentExists = await this.aasIdentifierExists(currentIdentifier);
    if (!currentExists) {
      return { exists: false, nextAvailableId: normalizedIdShort };
    }

    let nextCandidate = buildNextAssetShellIdShortCandidate(normalizedIdShort);
    let safetyCounter = 0;

    while (nextCandidate !== '' && safetyCounter < 100) {
      const nextIdentifier = buildAssetShellIdentifier(this.portalService.iriPrefix, nextCandidate);
      if (nextIdentifier === '' || !(await this.aasIdentifierExists(nextIdentifier))) {
        return { exists: true, nextAvailableId: nextCandidate };
      }

      nextCandidate = buildNextAssetShellIdShortCandidate(nextCandidate);
      safetyCounter++;
    }

    return { exists: true, nextAvailableId: nextCandidate };
  }

  private async aasIdentifierExists(aasIdentifier: string) {
    try {
      await lastValueFrom(this.shellsClient.shells_GetShellPlain(aasIdentifier));
      return true;
    } catch (error) {
      if (this.isMissingAasError(error)) {
        return false;
      }

      throw error;
    }
  }

  private isMissingAasError(error: unknown) {
    if (error instanceof ApiException) {
      const apiError = error as ApiException & {
        status?: number;
        stacktrace?: unknown;
      };

      if (apiError.status === 404) {
        return true;
      }

      const message = `${apiError.message ?? ''}`;
      if (message.includes('404') || message.includes('AAS not found')) {
        return true;
      }

      const stacktrace = apiError.stacktrace as unknown as object | null | undefined;
      if (stacktrace instanceof Blob) {
        return false;
      }
    }

    const message = `${(error as { message?: string } | null)?.message ?? error ?? ''}`;
    return message.includes('404') || message.includes('AAS not found');
  }

  private focusCurrentStep() {
    this.focusnext(this.currentStep.focusTargetId);
  }

  private isStepComplete(index: number) {
    if (index === 0) {
      return this.hasDescriptionContent();
    }

    if (index === 1) {
      return (
        normalizeAssetShellIdShort(this.data?.assetShellId) !== '' &&
        !this.hasAssetShellIdCollision &&
        !this.isCheckingAssetShellIdAvailability
      );
    }

    return true;
  }

  private hasDescriptionContent() {
    return (this.data?.assetShellDescription ?? []).some((entry) => `${entry?.text ?? ''}`.trim().length >= 2);
  }

  private hasAnyDescriptionContent() {
    return (this.data?.assetShellDescription ?? []).some((entry) => `${entry?.text ?? ''}`.trim() !== '');
  }
}
