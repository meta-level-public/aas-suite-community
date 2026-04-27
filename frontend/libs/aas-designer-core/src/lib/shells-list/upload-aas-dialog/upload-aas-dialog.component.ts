import { ImportProgressMessage, SelectionCardComponent, SseNotificationService } from '@aas/aas-designer-shared';
import { FileSizePipe } from '@aas/common-pipes';
import { AppConfigService, NotificationService, PortalService } from '@aas/common-services';
import { ApiException } from '@aas/jwt-auth';
import { ImportPackageResult, SingleImportResult } from '@aas/webapi-client';
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
  private readonly unnamedFileLabel = 'File';

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
  bulkImportIssues:
    | Array<{
        sourceFileName: string;
        excludedSubmodelIds: string[];
        originalFile: File | undefined;
        hasConflict: boolean;
        overwrite: boolean;
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
      }>
    | undefined;
  importingFiles = new Set<string>();
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
    this.bulkImportIssues = undefined;
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
    this.bulkImportIssues = undefined;
    this.showTechnicalDetails = false;
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
        if (!this.tryPrepareBulkImportIssues(res)) {
          this.showImportError(res);
        }
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
    this.bulkImportIssues = undefined;
    this.showTechnicalDetails = false;

    if (err instanceof ApiException && err.exceptionType === 'UploadFailedException') {
      this.notificationService.showMessageAlways(
        this.translate.instant('UPLOAD_NOT_POSSIBLE_INVALID_OP', { exDetail: err.message }),
        'ERROR',
        'error',
        true,
      );
      return;
    }

    const message = err instanceof ApiException ? err.message : `${err?.message ?? err}`;
    this.notificationService.showMessageAlways(this.messageFormatter(message), 'ERROR', 'error', true);
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

    if (this.isBulk && nokImport.some((item: any) => this.isRecoverablePartialImport(item))) {
      return 'IMPORT_WITHOUT_SUBMODELS_BULK_HINT';
    }

    const backendErrorMessage = nokImport.find((item: any) => !!item?.errorMessage)?.errorMessage;
    if (backendErrorMessage) {
      if (this.isBulk && this.isSubmodelImportError(backendErrorMessage)) {
        return this.formatSubmodelImportError(backendErrorMessage).summary;
      }

      return backendErrorMessage;
    }

    return 'ERROR_IMPORTING_AAS';
  }

  private showImportError(res: any): void {
    const errorMessage = this.resolveImportErrorMessage(res);
    const showAsBigErrorDialog = errorMessage === 'IMPORT_CONFLICT_OVERWRITE_HINT';
    this.notificationService.showMessageAlways(errorMessage, 'ERROR', 'error', showAsBigErrorDialog);
  }

  private tryPrepareBulkImportIssues(res: ImportPackageResult | undefined): boolean {
    if (!this.isBulk) {
      return false;
    }

    const recoverableImports = (res?.nokImport ?? []).filter((item) => this.isRecoverablePartialImport(item));
    if (recoverableImports.length === 0) {
      return false;
    }

    this.bulkImportIssues = recoverableImports.map((item, index) => {
      const resolvedName = this.resolveSourceFileName(item, index);
      return {
        sourceFileName: resolvedName,
        excludedSubmodelIds: item.excludedSubmodelIds ?? [],
        originalFile: this.selectedFiles.find((f) => f.name === resolvedName),
        hasConflict: false,
        overwrite: false,
        failedSubmodels: (item.failedSubmodels ?? []).map((submodel) => {
          const formatted = this.formatSubmodelImportError(submodel?.errorMessage);
          return {
            ...submodel,
            summary: formatted.summary,
            technicalDetails: formatted.technicalDetails,
          };
        }),
        importableSubmodels: item.importableSubmodels ?? [],
      };
    });
    this.pendingPartialImport = undefined;
    this.showTechnicalDetails = false;

    return true;
  }

  private tryPreparePartialImport(res: any): boolean {
    if (this.isBulk) {
      return false;
    }

    const recoverableImport = (res?.nokImport ?? []).find((item: any) => this.isRecoverablePartialImport(item));

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
    this.bulkImportIssues = undefined;
    this.showTechnicalDetails = false;

    return true;
  }

  protected toggleTechnicalDetails(): void {
    this.showTechnicalDetails = !this.showTechnicalDetails;
  }

  isImportingBulkFile(fileName: string): boolean {
    return this.importingFiles.has(fileName);
  }

  importBulkFilePartially(issue: {
    sourceFileName: string;
    excludedSubmodelIds: string[];
    originalFile: File | undefined;
    overwrite: boolean;
  }): void {
    const file = issue.originalFile ?? this.selectedFiles.find((f) => f.name === issue.sourceFileName);
    if (!file) {
      return;
    }

    this.importingFiles.add(issue.sourceFileName);

    const formData = new FormData();
    formData.append('file[]', file, file.name);
    const operationId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
    formData.append('operationId', operationId);
    if (this.sseNotificationService.clientId) {
      formData.append('sseClientId', this.sseNotificationService.clientId);
    }
    formData.append('overwrite', issue.overwrite.toString());
    formData.append('importMode', this.importMode ?? 'original');
    formData.append('importType', this.importType());
    issue.excludedSubmodelIds.forEach((id) => formData.append('excludedSubmodelIds', id));

    const headers = new HttpHeaders().append('ignoreContentType', 'true');

    this.http
      .post<ImportPackageResult>(`${this.appConfigService.config.aasApiPath}/Packages/import`, formData, {
        headers,
        observe: 'response',
      })
      .subscribe({
        next: (response) => {
          this.importingFiles.delete(issue.sourceFileName);
          const res = response.body;
          const nokItems = res?.nokImport ?? [];
          const conflictItem = nokItems.find((item) => this.containsConflictStatus(item?.errorMessage));
          if (conflictItem) {
            const entry = this.bulkImportIssues?.find((i) => i.sourceFileName === issue.sourceFileName);
            if (entry) {
              entry.hasConflict = true;
            }
            return;
          }
          const hasErrors = nokItems.length > 0;
          if (!hasErrors) {
            this.bulkImportIssues = this.bulkImportIssues?.filter((i) => i.sourceFileName !== issue.sourceFileName);
            this.loadData.emit(true);
            if ((this.bulkImportIssues?.length ?? 0) === 0) {
              this.closeDialog();
            }
          } else {
            this.notificationService.showMessageAlways('ERROR_IMPORTING_AAS', 'ERROR', 'error', false);
          }
        },
        error: (err: unknown) => {
          this.importingFiles.delete(issue.sourceFileName);
          this.handleError(err);
        },
      });
  }

  protected get isPartialImportConfirmation(): boolean {
    return !!this.pendingPartialImport;
  }

  protected get isBulkImportIssueSummary(): boolean {
    return (this.bulkImportIssues?.length ?? 0) > 0;
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

  protected get bulkIssueAffectedFileCount(): number {
    return this.bulkImportIssues?.length ?? 0;
  }

  protected get bulkIssueAffectedSubmodelCount(): number {
    return this.bulkImportIssues?.reduce((sum, item) => sum + item.failedSubmodels.length, 0) ?? 0;
  }

  protected get bulkIssueFiles(): Array<{
    sourceFileName: string;
    excludedSubmodelIds: string[];
    originalFile: File | undefined;
    hasConflict: boolean;
    overwrite: boolean;
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
  }> {
    return this.bulkImportIssues ?? [];
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

  private isRecoverablePartialImport(item: any): boolean {
    return (
      item?.requiresConfirmation &&
      item?.canImportPartially &&
      Array.isArray(item?.excludedSubmodelIds) &&
      item.excludedSubmodelIds.length > 0
    );
  }

  private isSubmodelImportError(errorMessage: string | undefined): boolean {
    return !!errorMessage && /Saving submodel/i.test(errorMessage);
  }

  private resolveSourceFileName(item: SingleImportResult | any, index: number): string {
    const sourceFileName = item?.sourceFileName?.trim();
    if (sourceFileName) {
      return sourceFileName;
    }

    return this.selectedFiles[index]?.name ?? `${this.unnamedFileLabel} ${index + 1}`;
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
    this.bulkImportIssues = undefined;
    this.importingFiles.clear();
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
