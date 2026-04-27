import { AppConfigService, NotificationService } from '@aas/common-services';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { showSystemManagementError } from '../shared/system-management-error.util';
import {
  LegalLinksDocumentInfoDto,
  LegalLinksDocumentUploadDto,
  LegalLinksSettingsDto,
  LegalLinksSettingsService,
  UpdateLegalLinksSettingsRequest,
} from './legal-links-settings.service';

export type LegalLinkFieldName =
  | 'datenschutzLinkDe'
  | 'datenschutzLinkEn'
  | 'agbLinkDe'
  | 'agbLinkEn'
  | 'avvLinkDe'
  | 'avvLinkEn'
  | 'imprintLink';

type DocumentAction = 'none' | 'upload' | 'delete';
type DocumentActionsRecord = Record<LegalLinkFieldName, DocumentAction>;
type FieldModeRecord = Record<LegalLinkFieldName, 'url' | 'document'>;
type PendingFilesRecord = Record<LegalLinkFieldName, File | null>;

const LEGAL_LINK_FIELDS: LegalLinkFieldName[] = [
  'datenschutzLinkDe',
  'datenschutzLinkEn',
  'agbLinkDe',
  'agbLinkEn',
  'avvLinkDe',
  'avvLinkEn',
  'imprintLink',
];

const DOCUMENT_KEY_MAP: Record<LegalLinkFieldName, keyof LegalLinksSettingsDto> = {
  datenschutzLinkDe: 'datenschutzLinkDeDocument',
  datenschutzLinkEn: 'datenschutzLinkEnDocument',
  agbLinkDe: 'agbLinkDeDocument',
  agbLinkEn: 'agbLinkEnDocument',
  avvLinkDe: 'avvLinkDeDocument',
  avvLinkEn: 'avvLinkEnDocument',
  imprintLink: 'imprintLinkDocument',
};

export interface LegalLinkFieldConfig {
  field: LegalLinkFieldName;
  icon: string;
  labelKey: string;
  langKey: string | null;
}

export const FIELD_CONFIGS: LegalLinkFieldConfig[] = [
  { field: 'datenschutzLinkDe', icon: 'pi-shield', labelKey: 'PRIVACY', langKey: 'DEUTSCH' },
  { field: 'datenschutzLinkEn', icon: 'pi-shield', labelKey: 'PRIVACY', langKey: 'ENGLISCH' },
  { field: 'agbLinkDe', icon: 'pi-file-edit', labelKey: 'AGB', langKey: 'DEUTSCH' },
  { field: 'agbLinkEn', icon: 'pi-file-edit', labelKey: 'AGB', langKey: 'ENGLISCH' },
  { field: 'avvLinkDe', icon: 'pi-file-check', labelKey: 'AVV_SHORT', langKey: 'DEUTSCH' },
  { field: 'avvLinkEn', icon: 'pi-file-check', labelKey: 'AVV_SHORT', langKey: 'ENGLISCH' },
  { field: 'imprintLink', icon: 'pi-id-card', labelKey: 'IMPRINT', langKey: null },
];

function initFieldRecord<T>(value: T): Record<LegalLinkFieldName, T> {
  return Object.fromEntries(LEGAL_LINK_FIELDS.map((f) => [f, value])) as Record<LegalLinkFieldName, T>;
}

@Component({
  selector: 'aas-legal-links-settings',
  imports: [
    TranslateModule,
    FormsModule,
    Button,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    TooltipModule,
  ],
  templateUrl: './legal-links-settings.component.html',
})
export class LegalLinksSettingsComponent implements OnInit {
  private readonly legalLinksSettingsService = inject(LegalLinksSettingsService);
  private readonly appConfigService = inject(AppConfigService);
  private readonly notificationService = inject(NotificationService);
  private readonly messageService = inject(MessageService);
  private readonly translateService = inject(TranslateService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly legalLinksSettings = signal<LegalLinksSettingsDto | null>(null);
  readonly fieldMode = signal<FieldModeRecord>(initFieldRecord<'url'>('url'));
  readonly pendingFiles = signal<PendingFilesRecord>(initFieldRecord<null>(null));
  readonly documentActions = signal<DocumentActionsRecord>(initFieldRecord<DocumentAction>('none'));

  readonly fieldConfigs = FIELD_CONFIGS;

  /** Tracks the original document infos from the last successful load/save. */
  private originalDocuments: Record<LegalLinkFieldName, LegalLinksDocumentInfoDto | null> = initFieldRecord(null);

  readonly documentDisplayInfos = computed(() => {
    const settings = this.legalLinksSettings();
    const files = this.pendingFiles();
    const actions = this.documentActions();
    if (!settings) return null;

    const result: Record<LegalLinkFieldName, LegalLinksDocumentInfoDto | null> = initFieldRecord(null);
    for (const field of LEGAL_LINK_FIELDS) {
      const action = actions[field];
      const pendingFile = files[field];
      if (action === 'upload' && pendingFile) {
        result[field] = { fileName: pendingFile.name, contentType: pendingFile.type };
      } else if (action === 'delete') {
        result[field] = null;
      } else {
        const docKey = DOCUMENT_KEY_MAP[field];
        result[field] = (settings[docKey] as LegalLinksDocumentInfoDto | undefined | null) ?? null;
      }
    }
    return result;
  });

  ngOnInit(): void {
    void this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      this.loading.set(true);
      const settings = await this.legalLinksSettingsService.getLegalLinksSettings();
      this.initStateFromSettings(settings);
      this.legalLinksSettings.set(this.applyRuntimeFallback(settings));
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    const settings = this.legalLinksSettings();
    if (settings == null) return;

    try {
      this.saving.set(true);
      const request = await this.buildUpdateRequest(settings);
      const updatedSettings = await this.legalLinksSettingsService.updateLegalLinksSettings(request);
      this.updateStateAfterSave(updatedSettings);
      this.appConfigService.updateLegalLinksInMemory(updatedSettings);
      this.legalLinksSettings.set(updatedSettings);
      this.notificationService.showMessageAlways('SUCCESS', 'SUCCESS', 'success', false);
    } catch (error) {
      await showSystemManagementError(error, this.notificationService, this.messageService, this.translateService);
    } finally {
      this.saving.set(false);
    }
  }

  toggleMode(field: LegalLinkFieldName): void {
    const currentMode = this.fieldMode()[field];
    const newMode = currentMode === 'url' ? 'document' : 'url';

    if (newMode === 'url') {
      // Cancel pending upload if switching away from document mode
      if (this.documentActions()[field] === 'upload') {
        this.documentActions.update((current) => ({ ...current, [field]: 'none' }));
        this.pendingFiles.update((current) => ({ ...current, [field]: null }));
      }
      // If there was an original document, mark it for deletion on save
      if (this.originalDocuments[field] != null) {
        this.documentActions.update((current) => ({ ...current, [field]: 'delete' }));
        // Clear the serving URL so the URL input shows empty for user to fill in
        const settings = this.legalLinksSettings();
        if (settings) {
          this.legalLinksSettings.set({
            ...settings,
            [field]: '',
            [DOCUMENT_KEY_MAP[field]]: undefined,
          });
        }
      }
    }

    this.fieldMode.update((current) => ({ ...current, [field]: newMode }));
  }

  onUrlChange(field: LegalLinkFieldName, value: string): void {
    const settings = this.legalLinksSettings();
    if (settings) {
      this.legalLinksSettings.set({ ...settings, [field]: value });
    }
  }

  onFileSelected(event: Event, field: LegalLinkFieldName): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    this.pendingFiles.update((current) => ({ ...current, [field]: file }));
    this.documentActions.update((current) => ({ ...current, [field]: 'upload' }));
    // Reset the input so the same file can be selected again if needed
    input.value = '';
  }

  removeDocument(field: LegalLinkFieldName): void {
    this.pendingFiles.update((current) => ({ ...current, [field]: null }));
    this.documentActions.update((current) => ({ ...current, [field]: 'delete' }));
    const settings = this.legalLinksSettings();
    if (settings) {
      this.legalLinksSettings.set({
        ...settings,
        [field]: '',
        [DOCUMENT_KEY_MAP[field]]: undefined,
      });
    }
  }

  getUrlValue(settings: LegalLinksSettingsDto, field: LegalLinkFieldName): string {
    return settings[field];
  }

  private initStateFromSettings(settings: LegalLinksSettingsDto): void {
    const modes: FieldModeRecord = initFieldRecord<'url'>('url');
    for (const field of LEGAL_LINK_FIELDS) {
      const docKey = DOCUMENT_KEY_MAP[field];
      const docInfo = settings[docKey] as LegalLinksDocumentInfoDto | undefined | null;
      modes[field] = docInfo ? 'document' : 'url';
      this.originalDocuments[field] = docInfo ?? null;
    }
    this.fieldMode.set(modes);
    this.pendingFiles.set(initFieldRecord(null));
    this.documentActions.set(initFieldRecord('none'));
  }

  private updateStateAfterSave(settings: LegalLinksSettingsDto): void {
    for (const field of LEGAL_LINK_FIELDS) {
      const docKey = DOCUMENT_KEY_MAP[field];
      const docInfo = settings[docKey] as LegalLinksDocumentInfoDto | undefined | null;
      this.originalDocuments[field] = docInfo ?? null;
    }
    this.pendingFiles.set(initFieldRecord(null));
    this.documentActions.set(initFieldRecord('none'));
  }

  private async buildUpdateRequest(settings: LegalLinksSettingsDto): Promise<UpdateLegalLinksSettingsRequest> {
    const apiPath = this.appConfigService.config.aasSystemManagementApiPath;
    const servingBaseUrl = apiPath.startsWith('http') ? apiPath : `${window.location.origin}${apiPath}`;

    const [
      datenschutzLinkDeDocument,
      datenschutzLinkEnDocument,
      agbLinkDeDocument,
      agbLinkEnDocument,
      avvLinkDeDocument,
      avvLinkEnDocument,
      imprintLinkDocument,
    ] = await Promise.all(LEGAL_LINK_FIELDS.map((field) => this.buildDocumentUpload(field)));

    return {
      datenschutzLinkDe: this.resolveUrlValue('datenschutzLinkDe', settings),
      datenschutzLinkEn: this.resolveUrlValue('datenschutzLinkEn', settings),
      agbLinkDe: this.resolveUrlValue('agbLinkDe', settings),
      agbLinkEn: this.resolveUrlValue('agbLinkEn', settings),
      avvLinkDe: this.resolveUrlValue('avvLinkDe', settings),
      avvLinkEn: this.resolveUrlValue('avvLinkEn', settings),
      imprintLink: this.resolveUrlValue('imprintLink', settings),
      datenschutzLinkDeDocument: datenschutzLinkDeDocument ?? null,
      datenschutzLinkEnDocument: datenschutzLinkEnDocument ?? null,
      agbLinkDeDocument: agbLinkDeDocument ?? null,
      agbLinkEnDocument: agbLinkEnDocument ?? null,
      avvLinkDeDocument: avvLinkDeDocument ?? null,
      avvLinkEnDocument: avvLinkEnDocument ?? null,
      imprintLinkDocument: imprintLinkDocument ?? null,
      servingBaseUrl,
    };
  }

  private resolveUrlValue(field: LegalLinkFieldName, settings: LegalLinksSettingsDto): string {
    if (this.documentActions()[field] === 'upload') {
      return ''; // backend computes serving URL
    }
    return settings[field] ?? '';
  }

  private async buildDocumentUpload(field: LegalLinkFieldName): Promise<LegalLinksDocumentUploadDto | null> {
    const action = this.documentActions()[field];
    const pendingFile = this.pendingFiles()[field];

    if (action === 'upload' && pendingFile) {
      const contentBase64 = await this.fileToBase64(pendingFile);
      return {
        fileName: pendingFile.name,
        contentType: pendingFile.type || 'application/octet-stream',
        contentBase64,
      };
    }

    if (action === 'delete') {
      return { fileName: '', contentType: '', contentBase64: '' };
    }

    return null;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1] ?? '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private applyRuntimeFallback(settings: LegalLinksSettingsDto): LegalLinksSettingsDto {
    const runtimeConfig = this.appConfigService.config;
    const modes = this.fieldMode();

    return {
      ...settings,
      datenschutzLinkDe:
        modes.datenschutzLinkDe === 'url'
          ? this.chooseVisibleValue(settings.datenschutzLinkDe, runtimeConfig.datenschutzLinkDe)
          : settings.datenschutzLinkDe,
      datenschutzLinkEn:
        modes.datenschutzLinkEn === 'url'
          ? this.chooseVisibleValue(settings.datenschutzLinkEn, runtimeConfig.datenschutzLinkEn)
          : settings.datenschutzLinkEn,
      agbLinkDe:
        modes.agbLinkDe === 'url'
          ? this.chooseVisibleValue(settings.agbLinkDe, runtimeConfig.agbLinkDe)
          : settings.agbLinkDe,
      agbLinkEn:
        modes.agbLinkEn === 'url'
          ? this.chooseVisibleValue(settings.agbLinkEn, runtimeConfig.agbLinkEn)
          : settings.agbLinkEn,
      avvLinkDe:
        modes.avvLinkDe === 'url'
          ? this.chooseVisibleValue(settings.avvLinkDe, runtimeConfig.avvLinkDe)
          : settings.avvLinkDe,
      avvLinkEn:
        modes.avvLinkEn === 'url'
          ? this.chooseVisibleValue(settings.avvLinkEn, runtimeConfig.avvLinkEn)
          : settings.avvLinkEn,
      imprintLink:
        modes.imprintLink === 'url'
          ? this.chooseVisibleValue(settings.imprintLink, runtimeConfig.imprintLink)
          : settings.imprintLink,
    };
  }

  private chooseVisibleValue(primaryValue: string | undefined, fallbackValue: string | undefined): string {
    const normalizedPrimaryValue = primaryValue?.trim() ?? '';
    if (normalizedPrimaryValue !== '') {
      return normalizedPrimaryValue;
    }

    return fallbackValue?.trim() ?? '';
  }
}
