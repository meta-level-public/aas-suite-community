import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { PortalService } from '@aas/common-services';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { afterAll, beforeEach, vi } from 'vitest';
import { AssetMetadataComponent } from './asset-metadata.component';

const heicToMock = vi.fn(async ({ blob }: { blob: Blob }) => new Blob([blob], { type: 'image/jpeg' }));

vi.mock('heic-to/csp', () => ({
  heicTo: heicToMock,
}));

describe('AssetMetadataComponent', () => {
  const historyBackSpy = vi.spyOn(history, 'back').mockImplementation(() => undefined);
  const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:asset-preview');
  const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

  beforeEach(() => {
    heicToMock.mockClear();
    historyBackSpy.mockClear();
    createObjectUrlSpy.mockReset();
    createObjectUrlSpy.mockImplementation(() => 'blob:asset-preview');
    revokeObjectUrlSpy.mockReset();
    revokeObjectUrlSpy.mockImplementation(() => undefined);
  });

  afterAll(() => {
    historyBackSpy.mockRestore();
    createObjectUrlSpy.mockRestore();
    revokeObjectUrlSpy.mockRestore();
  });

  async function flushAvailabilityCheck(component: AssetMetadataComponent) {
    await (component as any).assetShellIdAvailabilityPromise;
    await Promise.resolve();
  }

  function createComponent(initialState: any, existingAasIds: string[] = []) {
    const router = {
      navigate: vi.fn(),
    } as unknown as Router;
    const rootShell = {
      idShort: initialState.assetShellId ?? '',
      id: initialState.assetShellIdentifier ?? '',
      description: initialState.assetShellDescription ?? [],
      assetInformation: {
        globalAssetId: initialState.assetId ?? '',
        assetKind: 'Type',
        defaultThumbnail:
          `${initialState.assetThumbnailFilename ?? ''}`.trim() !== ''
            ? { path: `file:/aasx/files/${initialState.assetThumbnailFilename}` }
            : null,
      },
    };
    const attachmentState = {
      assetThumbnailFile: initialState.assetThumbnailFile as File | undefined,
      packageThumbnailFile: initialState.packageThumbnailFile as File | undefined,
      packageThumbnailFilename: `${initialState.packageThumbnailFilename ?? ''}`,
    };
    const generatorService = {
      vwsTyp: 'battery-passport',
      getCurrentGeneratorRootShell: vi.fn(() => rootShell),
      getCurrentGeneratorAssetThumbnailFile: vi.fn(() => attachmentState.assetThumbnailFile ?? null),
      getCurrentGeneratorPackageThumbnailFile: vi.fn(() => attachmentState.packageThumbnailFile ?? null),
      getCurrentGeneratorPackageThumbnailFilename: vi.fn(() => attachmentState.packageThumbnailFilename),
    };
    const confirmationService = {};
    const generatorStateStore = {
      updateAssetMetadata: vi.fn((input: any) => {
        rootShell.idShort = `${input?.assetShellId ?? rootShell.idShort ?? ''}`;
        rootShell.id = `${input?.assetShellIdentifier ?? rootShell.id ?? ''}`;
        rootShell.description = (input?.assetShellDescription ?? rootShell.description ?? []).map(
          (entry: { language?: string; text?: string }) =>
            new aas.types.LangStringTextType(`${entry?.language ?? ''}`, `${entry?.text ?? ''}`),
        );
        rootShell.assetInformation.globalAssetId = `${input?.assetId ?? rootShell.assetInformation.globalAssetId ?? ''}`;

        const assetThumbnailFilename = `${input?.assetThumbnailFilename ?? ''}`.trim();
        rootShell.assetInformation.defaultThumbnail =
          assetThumbnailFilename !== '' ? { path: `file:/aasx/files/${assetThumbnailFilename}` } : null;
      }),
      setFileAttachment: vi.fn((key: string, file: File | null) => {
        if (key === 'assetThumbnail') {
          attachmentState.assetThumbnailFile = file ?? undefined;
        }
      }),
      setPackageThumbnail: vi.fn((file: File | null, filename: string | null | undefined) => {
        attachmentState.packageThumbnailFile = file ?? undefined;
        attachmentState.packageThumbnailFilename = `${filename ?? ''}`;
      }),
    };
    const translate = {
      currentLang: 'de',
      getDefaultLang: () => 'en',
    } as unknown as TranslateService;
    const route = {} as ActivatedRoute;
    const portalService = {
      iriPrefix: 'https://orga.example',
    } as PortalService;
    const shellsClient = {
      shells_GetShellPlain: vi.fn(),
    };

    const component = new AssetMetadataComponent(
      router,
      generatorService as never,
      generatorStateStore as never,
      confirmationService as never,
      translate,
      route,
      portalService,
      shellsClient as never,
    );

    vi.spyOn(component, 'focusnext').mockImplementation(() => undefined);
    vi.spyOn(component as any, 'aasIdentifierExists').mockImplementation(async (...args: unknown[]) => {
      return existingAasIds.includes(`${args[0] ?? ''}`);
    });

    return { component, router, generatorService, generatorStateStore, shellsClient, rootShell, attachmentState };
  }

  it('prefills the asset shell id from the description', async () => {
    const { component, rootShell, generatorStateStore } = createComponent({
      assetId: 'new',
      assetShellId: '',
      assetShellDescription: [{ language: 'de', text: 'Förderband Öl Pumpe' }],
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);

    expect(component.generatedAssetId).toBe('https://orga.example/ids/asset/foerderbandOelPumpe');
    expect(rootShell.assetInformation.globalAssetId).toBe('https://orga.example/ids/asset/foerderbandOelPumpe');
    expect(component.generatedAssetShellId).toBe('foerderbandOelPumpe');
    expect(component.generatedAssetShellIdentifier).toBe('https://orga.example/ids/aas/foerderbandOelPumpe');
    expect(rootShell.idShort).toBe('foerderbandOelPumpe');
    expect(rootShell.id).toBe('https://orga.example/ids/aas/foerderbandOelPumpe');
    expect(generatorStateStore.updateAssetMetadata).toHaveBeenCalled();
  });

  it('updates the auto-filled id when the description changes', async () => {
    const { component, rootShell } = createComponent({
      assetId: '',
      assetShellId: '',
      assetShellDescription: [{ language: 'de', text: 'Batterie Modul' }],
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    rootShell.description[0].text = 'Batterie Modul Alpha';

    component.ngDoCheck();
    await flushAvailabilityCheck(component);

    expect(component.generatedAssetId).toBe('https://orga.example/ids/asset/batterieModulAlpha');
    expect(rootShell.assetInformation.globalAssetId).toBe('https://orga.example/ids/asset/batterieModulAlpha');
    expect(component.generatedAssetShellId).toBe('batterieModulAlpha');
    expect(rootShell.idShort).toBe('batterieModulAlpha');
    expect(rootShell.id).toBe('https://orga.example/ids/aas/batterieModulAlpha');
  });

  it('replaces the initial placeholder id with a value derived from the english description', async () => {
    const { component, rootShell } = createComponent({
      assetId: 'https://orga.example/ids/asset/aa',
      assetShellId: 'aa',
      assetShellIdentifier: 'https://orga.example/ids/aas/aa',
      assetShellDescription: [
        { language: 'en', text: '' },
        { language: 'de', text: '' },
      ],
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);

    rootShell.description[0].text = 'Battery Module';

    component.ngDoCheck();
    await flushAvailabilityCheck(component);

    expect(component.generatedAssetShellId).toBe('batteryModule');
    expect(rootShell.idShort).toBe('batteryModule');
    expect(rootShell.assetInformation.globalAssetId).toBe('https://orga.example/ids/asset/batteryModule');
    expect(rootShell.id).toBe('https://orga.example/ids/aas/batteryModule');
  });

  it('does not overwrite a manual asset shell id when the description changes', async () => {
    const { component, rootShell } = createComponent({
      assetId: '',
      assetShellId: '',
      assetShellDescription: [{ language: 'de', text: 'Roboter Arm' }],
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    rootShell.idShort = 'customAssetShell';
    rootShell.description[0].text = 'Roboter Arm Gen2';

    component.ngDoCheck();
    await flushAvailabilityCheck(component);

    expect(component.generatedAssetShellId).toBe('roboterArmGen2');
    expect(component.generatedAssetId).toBe('https://orga.example/ids/asset/customAssetShell');
    expect(rootShell.assetInformation.globalAssetId).toBe('https://orga.example/ids/asset/customAssetShell');
    expect(rootShell.idShort).toBe('customAssetShell');
    expect(rootShell.id).toBe('https://orga.example/ids/aas/customAssetShell');
    expect(component.hasAlternativeSuggestion()).toBe(true);
  });

  it('applies the current suggestion on demand', async () => {
    const { component, rootShell } = createComponent({
      assetId: '',
      assetShellId: 'customAssetShell',
      assetShellDescription: [{ language: 'en', text: 'Cooling Unit 7' }],
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    component.applySuggestedAssetShellId();
    await flushAvailabilityCheck(component);

    expect(component.generatedAssetShellId).toBe('coolingUnit7');
    expect(rootShell.assetInformation.globalAssetId).toBe('https://orga.example/ids/asset/coolingUnit7');
    expect(rootShell.idShort).toBe('coolingUnit7');
    expect(rootShell.id).toBe('https://orga.example/ids/aas/coolingUnit7');
  });

  it('updates the real aas id when the idShort is edited manually', async () => {
    const { component, rootShell } = createComponent({
      assetId: '',
      assetShellId: 'batteryModule',
      assetShellIdentifier: '',
      assetShellDescription: [{ language: 'en', text: 'Battery Module' }],
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    component.onAssetShellIdChanged('batteryModuleV2');
    await flushAvailabilityCheck(component);

    expect(rootShell.assetInformation.globalAssetId).toBe('https://orga.example/ids/asset/batteryModuleV2');
    expect(component.generatedAssetShellIdentifier).toBe('https://orga.example/ids/aas/batteryModuleV2');
    expect(rootShell.id).toBe('https://orga.example/ids/aas/batteryModuleV2');
  });

  it('appends a running number until a generated aas id is free in the repository', async () => {
    const { component, rootShell } = createComponent(
      {
        assetId: '',
        assetShellId: '',
        assetShellDescription: [{ language: 'de', text: 'Batterie Modul' }],
      },
      ['https://orga.example/ids/aas/batterieModul', 'https://orga.example/ids/aas/batterieModul1'],
    );

    component.ngOnInit();
    await flushAvailabilityCheck(component);

    expect(rootShell.idShort).toBe('batterieModul2');
    expect(rootShell.id).toBe('https://orga.example/ids/aas/batterieModul2');
    expect(component.hasAssetShellIdCollision).toBe(false);
  });

  it('warns when a manually entered aas id already exists and offers a corrected id', async () => {
    const { component, rootShell } = createComponent(
      {
        assetId: '',
        assetShellId: 'batteryModule',
        assetShellIdentifier: '',
        assetShellDescription: [{ language: 'en', text: 'Battery Module' }],
      },
      ['https://orga.example/ids/aas/batteryModuleV2'],
    );

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    component.onAssetShellIdChanged('batteryModuleV2');
    await flushAvailabilityCheck(component);

    expect(component.hasAssetShellIdCollision).toBe(true);
    expect(component.assetShellIdCorrectionSuggestion).toBe('batteryModuleV3');
    expect(component.assetShellIdentifierStatusKey).toBe('ASSET_SHELL_ID_STATUS_EXISTS');
    expect(rootShell.id).toBe('https://orga.example/ids/aas/batteryModuleV2');
  });

  it('applies the corrected id and checks it again on demand', async () => {
    const { component, rootShell } = createComponent(
      {
        assetId: '',
        assetShellId: 'batteryModule',
        assetShellIdentifier: '',
        assetShellDescription: [{ language: 'en', text: 'Battery Module' }],
      },
      ['https://orga.example/ids/aas/batteryModule1'],
    );

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    component.onAssetShellIdChanged('batteryModule1');
    await flushAvailabilityCheck(component);
    component.applyCorrectedAssetShellId();
    await flushAvailabilityCheck(component);

    expect(component.hasAssetShellIdCollision).toBe(false);
    expect(rootShell.idShort).toBe('batteryModule2');
    expect(rootShell.id).toBe('https://orga.example/ids/aas/batteryModule2');
    expect(component.assetShellIdentifierStatusKey).toBe('ASSET_SHELL_ID_STATUS_AVAILABLE');
  });

  it('shows an available status when the generated aas id is free', async () => {
    const { component } = createComponent({
      assetId: '',
      assetShellId: '',
      assetShellDescription: [{ language: 'de', text: 'Ladegeraet' }],
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);

    expect(component.assetShellIdentifierStatusKey).toBe('ASSET_SHELL_ID_STATUS_AVAILABLE');
    expect(component.assetShellIdentifierStatusSeverity).toBe('success');
  });

  it('shows a checking status while the repository lookup is still running', () => {
    const { component } = createComponent({
      assetId: '',
      assetShellId: 'ladegeraet',
      assetShellIdentifier: 'https://orga.example/ids/aas/ladegeraet',
      assetShellDescription: [{ language: 'de', text: 'Ladegeraet' }],
    });

    component.isCheckingAssetShellIdAvailability = true;

    expect(component.assetShellIdentifierStatusKey).toBe('ASSET_SHELL_ID_STATUS_CHECKING');
    expect(component.assetShellIdentifierStatusSeverity).toBe('info');
    expect(component.assetShellIdentifierStatusIcon).toBe('pi pi-spin pi-spinner');
  });

  it('moves through internal steps before navigating to the next page', async () => {
    const { component, router } = createComponent({
      assetId: '',
      assetShellId: '',
      assetShellDescription: [{ language: 'de', text: 'Ladegeraet' }],
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    await component.nextPage();
    await component.nextPage();

    expect(component.activeStepIndex).toBe(2);
    expect(router.navigate).not.toHaveBeenCalled();

    await component.nextPage();

    expect(router.navigate).toHaveBeenCalledWith(['generator', 'nameplate']);
  });

  it('does not leave the description step without content', async () => {
    const { component, router } = createComponent({
      assetId: '',
      assetShellId: '',
      assetShellDescription: [{ language: 'de', text: '   ' }],
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    await component.nextPage();

    expect(component.activeStepIndex).toBe(0);
    expect(component.canProceedFromCurrentStep).toBe(false);
    expect(component.currentStepValidationMessageKey).toBe('ASSET_METADATA_DESCRIPTION_REQUIRED_HINT');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('does not unlock future steps while the current prerequisite is missing', async () => {
    const { component } = createComponent({
      assetId: '',
      assetShellId: '',
      assetShellDescription: [{ language: 'de', text: '' }],
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    component.selectStep(1);

    expect(component.activeStepIndex).toBe(0);
    expect(component.isStepUnlocked(1)).toBe(false);
  });

  it('does not leave the description step with only one character', async () => {
    const { component, router } = createComponent({
      assetId: '',
      assetShellId: '',
      assetShellDescription: [{ language: 'de', text: 'A' }],
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    await component.nextPage();

    expect(component.activeStepIndex).toBe(0);
    expect(component.canProceedFromCurrentStep).toBe(false);
    expect(component.currentStepValidationMessageKey).toBe('ASSET_METADATA_DESCRIPTION_MIN_LENGTH_HINT');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('does not leave the identifier step without an idShort', async () => {
    const { component } = createComponent({
      assetId: '',
      assetShellId: '',
      assetShellDescription: [{ language: 'de', text: 'Ladegeraet' }],
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    await component.nextPage();
    component.onAssetShellIdChanged('');
    await flushAvailabilityCheck(component);
    await component.nextPage();

    expect(component.activeStepIndex).toBe(1);
    expect(component.canProceedFromCurrentStep).toBe(false);
    expect(component.currentStepValidationMessageKey).toBe('ASSET_METADATA_ID_SHORT_REQUIRED_HINT');
  });

  it('normalizes manually entered idShort values to a valid referable idShort', async () => {
    const { component, rootShell } = createComponent({
      assetId: '',
      assetShellId: 'batteryModule',
      assetShellIdentifier: '',
      assetShellDescription: [{ language: 'en', text: 'Battery Module' }],
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    component.onAssetShellIdChanged('1-');
    await flushAvailabilityCheck(component);

    expect(rootShell.idShort).toBe('a1');
    expect(rootShell.id).toBe('https://orga.example/ids/aas/a1');
  });

  it('auto-corrects a generated duplicate before leaving the identifier step', async () => {
    const { component } = createComponent(
      {
        assetId: '',
        assetShellId: '',
        assetShellDescription: [{ language: 'de', text: 'Ladegeraet' }],
      },
      ['https://orga.example/ids/aas/ladegeraet'],
    );

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    await component.nextPage();
    await component.nextPage();

    expect(component.activeStepIndex).toBe(2);
    expect(component.hasAssetShellIdCollision).toBe(false);
    expect(component.data?.assetShellId).toBe('ladegeraet1');
  });

  it('moves back within internal steps before leaving the page', async () => {
    const { component } = createComponent({
      assetId: '',
      assetShellId: '',
      assetShellDescription: [{ language: 'de', text: 'Ladegeraet' }],
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    component.selectStep(2);
    component.prevPage();

    expect(component.activeStepIndex).toBe(1);
    expect(historyBackSpy).not.toHaveBeenCalled();

    component.selectStep(0);
    component.prevPage();

    expect(historyBackSpy).toHaveBeenCalled();
  });

  it('creates an image preview after selecting an asset thumbnail', async () => {
    const { component, attachmentState, generatorStateStore } = createComponent({
      assetId: '',
      assetShellId: '',
      assetShellDescription: [{ language: 'de', text: 'Ladegeraet' }],
      assetThumbnailFile: undefined,
      assetThumbnailFilename: '',
    });

    const file = new File(['preview'], 'preview.png', { type: 'image/png' });

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    await component.setAssetThumbnail({ files: [file] });

    expect(createObjectUrlSpy).toHaveBeenCalledWith(file);
    expect(component.assetThumbnailPreviewUrl).toBe('blob:asset-preview');
    expect(component.hasAssetThumbnailPreview).toBe(true);
    expect(attachmentState.assetThumbnailFile).toBe(file);
    expect(component.data?.assetThumbnailFilename).toBe('preview.png');
    expect(generatorStateStore.setFileAttachment).toHaveBeenCalledWith('assetThumbnail', file);
  });

  it('converts heic thumbnails before creating the preview', async () => {
    const { component, attachmentState } = createComponent({
      assetId: '',
      assetShellId: '',
      assetShellDescription: [{ language: 'de', text: 'Ladegeraet' }],
      assetThumbnailFile: undefined,
      assetThumbnailFilename: '',
    });

    const heicFile = new File(['preview'], 'preview.heic', { type: 'image/heic' });

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    await component.setAssetThumbnail({ files: [heicFile] });

    expect(heicToMock).toHaveBeenCalledWith({
      blob: heicFile,
      type: 'image/jpeg',
      quality: 0.9,
    });
    expect(createObjectUrlSpy).toHaveBeenCalledWith(expect.any(Blob));
    expect(component.hasAssetThumbnailPreview).toBe(true);
    expect(component.hasAssetThumbnailPreviewFallback).toBe(false);
    expect(attachmentState.assetThumbnailFile).toBe(heicFile);
    expect(component.data?.assetThumbnailFilename).toBe('preview.heic');
  });

  it('ignores empty thumbnail selection events without clearing the current state', async () => {
    const existingFile = new File(['preview'], 'existing.png', { type: 'image/png' });
    const { component, attachmentState } = createComponent({
      assetId: '',
      assetShellId: '',
      assetShellDescription: [{ language: 'de', text: 'Ladegeraet' }],
      assetThumbnailFile: existingFile,
      assetThumbnailFilename: 'existing.png',
      packageThumbnailFile: existingFile,
      packageThumbnailFilename: 'existing.png',
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    await component.setAssetThumbnail({ files: [] });
    component.setPackageThumbnail({ files: [] });

    expect(attachmentState.assetThumbnailFile).toBe(existingFile);
    expect(component.data?.assetThumbnailFilename).toBe('existing.png');
    expect(attachmentState.packageThumbnailFile).toBe(existingFile);
    expect(component.data?.packageThumbnailFilename).toBe('existing.png');
  });

  it('stores package thumbnails in the generator file store', () => {
    const { component, attachmentState, generatorStateStore } = createComponent({
      assetId: '',
      assetShellId: '',
      assetShellDescription: [{ language: 'de', text: 'Ladegeraet' }],
      packageThumbnailFile: undefined,
      packageThumbnailFilename: '',
    });

    const file = new File(['package'], 'package.png', { type: 'image/png' });

    component.setPackageThumbnail({ files: [file] });

    expect(attachmentState.packageThumbnailFile).toBe(file);
    expect(attachmentState.packageThumbnailFilename).toBe('package.png');
    expect(generatorStateStore.setPackageThumbnail).toHaveBeenCalledWith(file, 'package.png');
  });

  it('revokes the previous preview URL when a new asset thumbnail is selected', async () => {
    createObjectUrlSpy.mockReturnValueOnce('blob:first-preview').mockReturnValueOnce('blob:second-preview');

    const { component } = createComponent({
      assetId: '',
      assetShellId: '',
      assetShellDescription: [{ language: 'de', text: 'Ladegeraet' }],
      assetThumbnailFile: undefined,
      assetThumbnailFilename: '',
    });

    component.ngOnInit();
    await flushAvailabilityCheck(component);
    await component.setAssetThumbnail({ files: [new File(['one'], 'first.png', { type: 'image/png' })] });
    await component.setAssetThumbnail({ files: [new File(['two'], 'second.png', { type: 'image/png' })] });

    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:first-preview');
    expect(component.assetThumbnailPreviewUrl).toBe('blob:second-preview');
  });
});
