import { ImportProgressMessage, SelectionCardComponent, SseNotificationService } from '@aas/aas-designer-shared';
import { FileSizePipe } from '@aas/common-pipes';
import { AppConfigService, NotificationService, PortalService } from '@aas/common-services';
import { ApiException } from '@aas/jwt-auth';
import { ImportPackageResult } from '@aas/webapi-client';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Component, effect, EventEmitter, inject, input, Output, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { Subscription } from 'rxjs';
import { GeneratorService } from '../../generator/generator.service';

@Component({
  selector: 'aas-upload-aas-dialog',
  imports: [
    DialogModule,
    ProgressBarModule,
    FileUploadModule,
    TranslateModule,
    FormsModule,
    CheckboxModule,
    ButtonModule,
    FileSizePipe,
    SelectionCardComponent,
  ],
  templateUrl: './upload-aas-dialog.component.html',
})
export class UploadAasDialogComponent {
  @Output() loadData: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('uploader') uploader?: FileUpload;

  translate = inject(TranslateService);
  generatorService = inject(GeneratorService);
  portalService = inject(PortalService);
  appConfigService = inject(AppConfigService);
  http = inject(HttpClient);
  notificationService = inject(NotificationService);
  router = inject(Router);
  sseNotificationService = inject(SseNotificationService);

  importType = input.required<'aasx' | 'json'>();
  acceptableExtion = signal<'.aasx' | '.json'>('.aasx');
  importTypeEffect = effect(() => {
    if (this.importType() === 'aasx') {
      queueMicrotask(() => this.acceptableExtion.set('.aasx'));
    } else {
      queueMicrotask(() => this.acceptableExtion.set('.json'));
    }
  });

  loading: boolean = false;
  indexing: boolean = false;
  importProcessing: boolean = false;
  uploadProgress: number = 0;
  processingProgress: number = 0;
  processingMessage = '';
  currentProcessingFileName = '';
  importMode: 'original' | 'derived' | undefined;
  isBulk: boolean = false;
  overwrite: boolean = false;
  currentOperationId = '';
  importProgressSubscription?: Subscription;

  selectedFiles: File[] = [];
  displayUploadDialog: boolean = false;
  pendingPartialImport:
    | {
        excludedSubmodelIds: string[];
        failedSubmodels: Array<{
          submodelId?: string;
          idShort?: string;
          errorMessage?: string;
          summary?: string;
          technicalDetails?: string;
        }>;
        importableSubmodels: Array<{
          submodelId?: string;
          idShort?: string;
        }>;
      }
    | undefined;
  showTechnicalDetails = false;

  show() {
    this.resetDialogState();
    this.displayUploadDialog = true;
  }

  closeDialog() {
    this.displayUploadDialog = false;
    this.resetDialogState();
  }

  onDialogHide() {
    this.resetDialogState();
  }

  onSelect(event: FileSelectEvent) {
    this.selectedFiles = event.currentFiles;
  }

  async handleUpload() {
    await this.submitImport();
  }

  async confirmPartialImport() {
    if (!this.pendingPartialImport) {
      return;
    }

    await this.submitImport(this.pendingPartialImport.excludedSubmodelIds);
  }

  cancelPartialImport() {
    this.pendingPartialImport = undefined;
    this.showTechnicalDetails = false;
  }

  setImportMode(mode: 'original' | 'derived') {
    this.importMode = mode;
  }

  isImportModeSelected(mode: 'original' | 'derived'): boolean {
    return this.importMode === mode;
  }

  importModeButtonLabel(mode: 'original' | 'derived'): string {
    return this.isImportModeSelected(mode) ? this.translate.instant('SELECTED') : this.translate.instant('CHOOSE');
  }

  private async submitImport(excludedSubmodelIds: string[] = []) {
    this.loading = true;
    this.indexing = false;
    this.importProcessing = false;
    this.uploadProgress = 0;
    this.processingProgress = 0;
    this.processingMessage = '';
    this.currentProcessingFileName = '';
    this.pendingPartialImport = undefined;
    this.isBulk = this.selectedFiles.length > 1;
    this.currentOperationId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
    this.subscribeToImportProgress();

    const formData = new FormData();
    this.selectedFiles.forEach((file) => {
      formData.append('file[]', file, file.name);
    });
    formData.append('operationId', this.currentOperationId);
    if (this.sseNotificationService.clientId) {
      formData.append('sseClientId', this.sseNotificationService.clientId);
    }
    formData.append('overwrite', this.overwrite.toString());
    formData.append('importMode', this.importMode ?? 'original');
    formData.append('importType', this.importType());
    excludedSubmodelIds.forEach((submodelId) => {
      formData.append('excludedSubmodelIds', submodelId);
    });

    const headers = new HttpHeaders().append('ignoreContentType', 'true');

    this.http
      .post<ImportPackageResult>(`${this.appConfigService.config.aasApiPath}/Packages/import`, formData, {
        headers,
        reportProgress: true,
        observe: 'events',
      })
      .subscribe({
        next: (progressEvent) => this.handleUploadProgress(progressEvent),
        error: (err) => this.handleError(err),
      });
  }

  private subscribeToImportProgress() {
    this.importProgressSubscription?.unsubscribe();
    this.importProgressSubscription = this.sseNotificationService.importProgressUpdated.subscribe((message) => {
      this.handleImportProgress(message);
    });
  }

  private handleUploadProgress(progressEvent: any) {
    if (progressEvent.type === HttpEventType.UploadProgress) {
      const total = progressEvent.total ?? progressEvent.loaded ?? 1;
      this.uploadProgress = Math.round((100 * progressEvent.loaded) / total);
      if (this.uploadProgress === 100) {
        this.indexing = true;
        this.processingMessage = this.translate.instant('PLEASE_WAIT_IMPORT_PREPARING');
        this.currentProcessingFileName = this.selectedFiles[0]?.name ?? '';
      }
    }

    if (progressEvent.type === HttpEventType.Response) {
      this.handleImportResult(progressEvent.body);
    }
  }

  private handleImportProgress(message: ImportProgressMessage) {
    if (message.operationId !== this.currentOperationId) {
      return;
    }

    this.indexing = true;
    this.importProcessing = true;
    this.processingProgress = Math.max(this.processingProgress, message.progressPercent ?? 0);
    this.processingMessage = this.resolveProcessingMessage(message);
    this.currentProcessingFileName = message.currentFileName ?? '';
  }

  private handleImportResult(res: ImportPackageResult | undefined) {
    this.generatorService.vwsTyp = 'vorlage';
    this.loading = true;
    this.indexing = true;
    this.importProcessing = true;
    this.processingProgress = 100;
    this.processingMessage = this.translate.instant('PLEASE_WAIT_IMPORT_FINISHING');

    const hasErrors = (res?.nokImport?.length ?? 0) > 0;
    const hasSuccess = (res?.okImport?.length ?? 0) > 0;

    if (this.isBulk) {
      if (hasErrors) {
        this.displayUploadDialog = true;
        if (hasSuccess) {
          this.loadData.emit(true);
        }
        this.showImportError(res);
      } else {
        this.notificationService.showMessageAlways('SUCCESS_IMPORTING_MULTIPLE_AAS', 'SUCCESS', 'success', false);
        this.loadData.emit(true);
        this.displayUploadDialog = false;
      }
    } else {
      if ((res?.okImport?.length ?? 0) === 1 && !hasErrors) {
        const aasId = res?.okImport?.[0]?.aasId;

        this.router.navigate(PortalService.buildRepoEditRoute(aasId ?? ''));
      } else if (this.tryPreparePartialImport(res)) {
        this.displayUploadDialog = true;
      } else {
        this.displayUploadDialog = true;
        this.showImportError(res);
      }
    }

    this.resetLoading();
  }

  handleError(err: any) {
    this.resetLoading();
    this.displayUploadDialog = true;
    this.pendingPartialImport = undefined;
    this.showTechnicalDetails = false;

    if (err instanceof ApiException && err.exceptionType === 'UploadFailedException') {
      this.notificationService.showMessageAlways(
        this.translate.instant('UPLOAD_NOT_POSSIBLE_INVALID_OP', { exDetail: err.message }),
        'ERROR',
        'error',
        true,
      );
      return;
    } else {
      const message = err instanceof ApiException ? err.message : `${err?.message ?? err}`;
      this.notificationService.showMessageAlways(this.messageFormatter(message), 'ERROR', 'error', true);
    }
  }

  resetLoading() {
    this.loading = false;
    this.indexing = false;
    this.importProcessing = false;
    this.importProgressSubscription?.unsubscribe();
    this.importProgressSubscription = undefined;
    this.currentOperationId = '';
  }

  onClear(_event: Event) {
    this.selectedFiles = [];
  }

  private resolveImportErrorMessage(res: any): string {
    const nokImport = res?.nokImport ?? [];
    const hasConflict = nokImport.some((item: any) => this.containsConflictStatus(item?.errorMessage));
    if (hasConflict) {
      return 'IMPORT_CONFLICT_OVERWRITE_HINT';
    }

    const backendErrorMessage = nokImport.find((item: any) => !!item?.errorMessage)?.errorMessage;
    if (backendErrorMessage) {
      return backendErrorMessage;
    }

    return 'ERROR_IMPORTING_AAS';
  }

  private showImportError(res: any): void {
    const errorMessage = this.resolveImportErrorMessage(res);
    const showAsBigErrorDialog = errorMessage === 'IMPORT_CONFLICT_OVERWRITE_HINT';
    this.notificationService.showMessageAlways(errorMessage, 'ERROR', 'error', showAsBigErrorDialog);
  }

  private tryPreparePartialImport(res: any): boolean {
    if (this.isBulk) {
      return false;
    }

    const recoverableImport = (res?.nokImport ?? []).find(
      (item: any) =>
        item?.requiresConfirmation &&
        item?.canImportPartially &&
        Array.isArray(item?.excludedSubmodelIds) &&
        item.excludedSubmodelIds.length > 0,
    );

    if (!recoverableImport) {
      return false;
    }

    this.pendingPartialImport = {
      excludedSubmodelIds: recoverableImport.excludedSubmodelIds,
      failedSubmodels: (recoverableImport.failedSubmodels ?? []).map((submodel: any) => {
        const formatted = this.formatSubmodelImportError(submodel?.errorMessage);
        return {
          ...submodel,
          summary: formatted.summary,
          technicalDetails: formatted.technicalDetails,
        };
      }),
      importableSubmodels: recoverableImport.importableSubmodels ?? [],
    };
    this.showTechnicalDetails = false;

    return true;
  }

  protected toggleTechnicalDetails(): void {
    this.showTechnicalDetails = !this.showTechnicalDetails;
  }

  protected get isPartialImportConfirmation(): boolean {
    return !!this.pendingPartialImport;
  }

  protected get partialImportAffectedCount(): number {
    return this.pendingPartialImport?.failedSubmodels.length ?? 0;
  }

  protected get selectedFileName(): string {
    return this.selectedFiles[0]?.name ?? '';
  }

  protected get hasSelectedFiles(): boolean {
    return this.selectedFiles.length > 0;
  }

  protected get failedPartialImportSubmodels(): Array<{
    submodelId?: string;
    idShort?: string;
    errorMessage?: string;
    summary?: string;
    technicalDetails?: string;
  }> {
    return this.pendingPartialImport?.failedSubmodels ?? [];
  }

  protected get importablePartialImportSubmodels(): Array<{
    submodelId?: string;
    idShort?: string;
  }> {
    return this.pendingPartialImport?.importableSubmodels ?? [];
  }

  protected get partialImportHeadlineKey(): string {
    return this.partialImportAffectedCount === 1
      ? 'IMPORT_WITHOUT_SUBMODELS_TITLE_SINGLE'
      : 'IMPORT_WITHOUT_SUBMODELS_TITLE_MULTI';
  }

  private formatSubmodelImportError(errorMessage: string | undefined): {
    summary: string;
    technicalDetails: string;
  } {
    const details = errorMessage?.trim() ?? '';

    if (!details) {
      return {
        summary: this.translate.instant('IMPORT_WITHOUT_SUBMODELS_GENERIC_REASON'),
        technicalDetails: '',
      };
    }

    const normalizedDetails = details
      .replace(/^Saving submodel '.*?' failed via (PUT|POST) .*?:\s*/i, '')
      .replace(/^Saving submodel .*? failed via (PUT|POST) .*?:\s*/i, '')
      .trim();

    const knownSummaries = [
      {
        pattern: /preferred name shall be provided at least in English/i,
        key: 'IMPORT_WITHOUT_SUBMODELS_REASON_PREFERRED_NAME',
      },
      {
        pattern: /\b500\b|InternalServerError/i,
        key: 'IMPORT_WITHOUT_SUBMODELS_REASON_SERVER_ERROR',
      },
      {
        pattern: /\b400\b|BadRequest/i,
        key: 'IMPORT_WITHOUT_SUBMODELS_REASON_BAD_REQUEST',
      },
    ];

    const knownSummary = knownSummaries.find((candidate) => candidate.pattern.test(normalizedDetails));
    if (knownSummary) {
      return {
        summary: this.translate.instant(knownSummary.key),
        technicalDetails: details,
      };
    }

    const firstSentence = normalizedDetails
      .split(/(?<=[.!?])\s+/)
      .find((part) => part.trim().length > 0)
      ?.trim();

    return {
      summary: firstSentence ?? this.translate.instant('IMPORT_WITHOUT_SUBMODELS_GENERIC_REASON'),
      technicalDetails: details,
    };
  }

  private containsConflictStatus(errorMessage: string | undefined): boolean {
    return !!errorMessage && /\b409\b/.test(errorMessage);
  }

  private messageFormatter(message: string): string {
    return message.replace(/&quot;/gm, '"');
  }

  private resolveProcessingMessage(message: ImportProgressMessage): string {
    switch (message.stage) {
      case 'preparing':
        return this.translate.instant('PLEASE_WAIT_IMPORT_PREPARING');
      case 'reading':
        return this.translate.instant('PLEASE_WAIT_IMPORT_READING', {
          current: Math.max(message.processedFiles + 1, 1),
          total: message.totalFiles,
        });
      case 'overwriting':
        return this.translate.instant('PLEASE_WAIT_IMPORT_OVERWRITING', {
          current: Math.max(message.processedFiles + 1, 1),
          total: message.totalFiles,
        });
      case 'transforming':
        return this.translate.instant('PLEASE_WAIT_IMPORT_TRANSFORMING', {
          current: Math.max(message.processedFiles + 1, 1),
          total: message.totalFiles,
        });
      case 'processing':
        return this.translate.instant('PLEASE_WAIT_IMPORT_PREPARING');
      case 'saving':
        return this.translate.instant('PLEASE_WAIT_IMPORT_SAVING', {
          current: Math.max(message.processedFiles, 1),
          total: message.totalFiles,
        });
      case 'completed':
        return this.translate.instant('PLEASE_WAIT_IMPORT_FINISHING');
      default:
        return this.translate.instant('PLEASE_WAIT_INDEX');
    }
  }

  private resetDialogState() {
    this.selectedFiles = [];
    this.pendingPartialImport = undefined;
    this.showTechnicalDetails = false;
    this.importMode = undefined;
    this.overwrite = false;
    this.uploadProgress = 0;
    this.processingProgress = 0;
    this.processingMessage = '';
    this.currentProcessingFileName = '';
    this.isBulk = false;
    this.resetLoading();
    this.uploader?.clear();
  }
}
