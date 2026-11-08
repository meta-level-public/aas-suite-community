import { SseNotificationService } from '@aas/aas-designer-shared';
import { AppConfigService, NotificationService, PortalService } from '@aas/common-services';
import { ApiException } from '@aas/jwt-auth';
import { ImportPackageResult } from '@aas/webapi-client';
import { EventEmitter } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';
import { GeneratorService } from '../../generator/generator.service';
import { UploadAasDialogComponent } from './upload-aas-dialog.component';

const IMPORT_URL = '/aas-api/Packages/import';

describe('UploadAasDialogComponent', () => {
  let fixture: ComponentFixture<UploadAasDialogComponent>;
  let component: UploadAasDialogComponent;
  let httpMock: HttpTestingController;
  let notificationService: { showMessageAlways: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let sseService: { clientId: string; importProgressUpdated: EventEmitter<any> };
  let generatorService: { vwsTyp: string };

  const file = (name: string) => new File(['content'], name);

  const result = (data: Partial<Record<'okImport' | 'nokImport', any[]>>) =>
    ({ okImport: data.okImport ?? [], nokImport: data.nokImport ?? [] }) as unknown as ImportPackageResult;

  const respond = (req: TestRequest, body: ImportPackageResult) => {
    req.event(new HttpResponse({ body, status: 200 }));
  };

  const startImport = async (files: File[], excluded?: string[]) => {
    component.selectedFiles = files;
    if (excluded) {
      component.pendingPartialImport = { excludedSubmodelIds: excluded, failedSubmodels: [], importableSubmodels: [] };
      await component.confirmPartialImport();
    } else {
      await component.handleUpload();
    }
    return httpMock.expectOne(IMPORT_URL);
  };

  beforeEach(async () => {
    localStorage.setItem('CURRENT_AAS_INFRASTRUCTURE', JSON.stringify({ id: 7 }));
    notificationService = { showMessageAlways: vi.fn() };
    router = { navigate: vi.fn().mockResolvedValue(true) };
    sseService = { clientId: '', importProgressUpdated: new EventEmitter() };
    generatorService = { vwsTyp: '' };

    TestBed.overrideComponent(UploadAasDialogComponent, { set: { template: '', imports: [] } });
    await TestBed.configureTestingModule({
      imports: [UploadAasDialogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TranslateService, useValue: { instant: vi.fn((key: string) => key) } },
        { provide: GeneratorService, useValue: generatorService },
        { provide: PortalService, useValue: {} },
        { provide: AppConfigService, useValue: { config: { aasApiPath: '/aas-api' } } },
        { provide: NotificationService, useValue: notificationService },
        { provide: Router, useValue: router },
        { provide: SseNotificationService, useValue: sseService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadAasDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('importType', 'aasx');
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('CURRENT_AAS_INFRASTRUCTURE');
  });

  describe('request building', () => {
    it('sends selected files with default import options', async () => {
      const req = await startImport([file('a.aasx')]);
      const body = req.request.body as FormData;

      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('ignoreContentType')).toBe('true');
      expect((body.getAll('file[]') as File[]).map((f) => f.name)).toEqual(['a.aasx']);
      expect(body.get('overwrite')).toBe('false');
      expect(body.get('importMode')).toBe('original');
      expect(body.get('importType')).toBe('aasx');
      expect(body.get('operationId')).toBe(component.currentOperationId);
      expect(body.has('sseClientId')).toBe(false);
      expect(body.getAll('excludedSubmodelIds')).toEqual([]);
      expect(component.loading).toBe(true);
      req.event(new HttpResponse({ body: result({ okImport: [{ aasId: 'x' }] }) }));
    });

    it('passes overwrite, import mode, sse client and excluded submodels', async () => {
      sseService.clientId = 'client-1';
      component.overwrite = true;
      component.setImportMode('derived');

      const req = await startImport([file('a.aasx')], ['sm-1', 'sm-2']);
      const body = req.request.body as FormData;

      expect(body.get('overwrite')).toBe('true');
      expect(body.get('importMode')).toBe('derived');
      expect(body.get('sseClientId')).toBe('client-1');
      expect(body.getAll('excludedSubmodelIds')).toEqual(['sm-1', 'sm-2']);
      respond(req, result({ okImport: [{ aasId: 'x' }] }));
    });

    it('does nothing when confirming without a pending partial import', async () => {
      await component.confirmPartialImport();
      httpMock.expectNone(IMPORT_URL);
    });
  });

  describe('single file results', () => {
    it('navigates to the editor of the imported shell on success', async () => {
      const emitted = vi.fn();
      component.loadData.subscribe(emitted);
      const req = await startImport([file('a.aasx')]);

      respond(req, result({ okImport: [{ aasId: 'urn:aas:1' }] }));

      expect(router.navigate).toHaveBeenCalledWith(PortalService.buildRepoEditRoute('urn:aas:1'));
      expect(generatorService.vwsTyp).toBe('vorlage');
      expect(component.loading).toBe(false);
      expect(component.currentOperationId).toBe('');
      expect(emitted).not.toHaveBeenCalled();
    });

    it('prepares a partial import confirmation for recoverable submodel failures', async () => {
      const req = await startImport([file('a.aasx')]);

      respond(
        req,
        result({
          nokImport: [
            {
              requiresConfirmation: true,
              canImportPartially: true,
              excludedSubmodelIds: ['sm-bad', 'sm-cd'],
              failedSubmodels: [
                {
                  submodelId: 'sm-bad',
                  errorMessage: "Saving submodel 'Nameplate' failed via PUT /submodels/x: Value is broken. More text.",
                },
                { submodelId: 'sm-cd', errorMessage: 'preferred name shall be provided at least in English' },
                { submodelId: 'sm-empty', errorMessage: '   ' },
              ],
              importableSubmodels: [{ submodelId: 'sm-ok' }],
            },
          ],
        }),
      );

      expect(component.displayUploadDialog).toBe(true);
      expect(component.pendingPartialImport?.excludedSubmodelIds).toEqual(['sm-bad', 'sm-cd']);
      expect(component.pendingPartialImport?.failedSubmodels.map((s) => s.summary)).toEqual([
        'Value is broken.',
        'IMPORT_WITHOUT_SUBMODELS_REASON_PREFERRED_NAME',
        'IMPORT_WITHOUT_SUBMODELS_GENERIC_REASON',
      ]);
      expect(component.pendingPartialImport?.failedSubmodels[0].technicalDetails).toContain('Saving submodel');
      expect(component.pendingPartialImport?.importableSubmodels).toEqual([{ submodelId: 'sm-ok' }]);
      expect(notificationService.showMessageAlways).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('does not treat failures without excluded submodels as recoverable', async () => {
      const req = await startImport([file('a.aasx')]);

      respond(
        req,
        result({
          nokImport: [{ requiresConfirmation: true, canImportPartially: true, excludedSubmodelIds: [] }],
        }),
      );

      expect(component.pendingPartialImport).toBeUndefined();
      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        'ERROR_IMPORTING_AAS',
        'ERROR',
        'error',
        false,
      );
    });

    it('shows the overwrite hint as big dialog on a 409 conflict', async () => {
      const req = await startImport([file('a.aasx')]);

      respond(req, result({ nokImport: [{ errorMessage: 'Request failed with status 409 Conflict' }] }));

      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        'IMPORT_CONFLICT_OVERWRITE_HINT',
        'ERROR',
        'error',
        true,
      );
      expect(component.displayUploadDialog).toBe(true);
    });

    it('shows the backend error message for other failures', async () => {
      const req = await startImport([file('a.aasx')]);

      respond(req, result({ nokImport: [{ errorMessage: '' }, { errorMessage: 'Invalid package' }] }));

      expect(notificationService.showMessageAlways).toHaveBeenCalledWith('Invalid package', 'ERROR', 'error', false);
    });

    it('treats a missing response body as a generic import error', async () => {
      const req = await startImport([file('a.aasx')]);

      req.event(new HttpResponse({ body: null }));

      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        'ERROR_IMPORTING_AAS',
        'ERROR',
        'error',
        false,
      );
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('bulk results', () => {
    it('closes the dialog and reloads the list when all files were imported', async () => {
      const emitted = vi.fn();
      component.loadData.subscribe(emitted);
      component.displayUploadDialog = true;
      const req = await startImport([file('a.aasx'), file('b.aasx')]);

      respond(req, result({ okImport: [{ aasId: '1' }, { aasId: '2' }] }));

      expect(component.isBulk).toBe(true);
      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        'SUCCESS_IMPORTING_MULTIPLE_AAS',
        'SUCCESS',
        'success',
        false,
      );
      expect(emitted).toHaveBeenCalledWith(true);
      expect(component.displayUploadDialog).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('collects recoverable issues per file and reloads for partial success', async () => {
      const emitted = vi.fn();
      component.loadData.subscribe(emitted);
      const fileA = file('a.aasx');
      const fileB = file('b.aasx');
      const req = await startImport([fileA, fileB]);

      respond(
        req,
        result({
          okImport: [{ aasId: '1' }],
          nokImport: [
            {
              sourceFileName: '  ',
              requiresConfirmation: true,
              canImportPartially: true,
              excludedSubmodelIds: ['sm-1'],
              failedSubmodels: [{ submodelId: 'sm-1', errorMessage: 'HTTP 500 InternalServerError' }],
            },
            {
              sourceFileName: 'b.aasx',
              requiresConfirmation: true,
              canImportPartially: true,
              excludedSubmodelIds: ['sm-2'],
              failedSubmodels: [{ submodelId: 'sm-2', errorMessage: 'HTTP 400 BadRequest' }],
            },
          ],
        }),
      );

      expect(emitted).toHaveBeenCalledWith(true);
      expect(component.displayUploadDialog).toBe(true);
      expect(component.bulkImportIssues?.map((issue) => issue.sourceFileName)).toEqual(['a.aasx', 'b.aasx']);
      expect(component.bulkImportIssues?.[0].originalFile).toBe(fileA);
      expect(component.bulkImportIssues?.[1].originalFile).toBe(fileB);
      expect(component.bulkImportIssues?.map((issue) => issue.failedSubmodels[0].summary)).toEqual([
        'IMPORT_WITHOUT_SUBMODELS_REASON_SERVER_ERROR',
        'IMPORT_WITHOUT_SUBMODELS_REASON_BAD_REQUEST',
      ]);
      expect(notificationService.showMessageAlways).not.toHaveBeenCalled();
    });

    it('shows a short summary for non-recoverable submodel errors in bulk mode', async () => {
      const req = await startImport([file('a.aasx'), file('b.aasx')]);

      respond(
        req,
        result({
          nokImport: [{ errorMessage: 'Saving submodel X failed via POST /submodels: Broken value. Stack trace' }],
        }),
      );

      expect(component.bulkImportIssues).toBeUndefined();
      expect(notificationService.showMessageAlways).toHaveBeenCalledWith('Broken value.', 'ERROR', 'error', false);
    });

    it.each([
      [
        "Saving submodel 'urn:sm:1' failed via PUT http://repo:8081/submodels/abc: 422 UnprocessableEntity. See http://docs/x",
        '422 UnprocessableEntity.',
      ],
      [
        "Saving submodel 'urn:sm:2' failed via POST http://repo/submodels after PUT-miss for AAS 'urn:aas:1': 404 NotFound. Details",
        '404 NotFound.',
      ],
    ])('keeps absolute request urls out of the short summary (%#)', async (errorMessage, summary) => {
      const req = await startImport([file('a.aasx'), file('b.aasx')]);

      respond(req, result({ nokImport: [{ errorMessage }] }));

      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(summary, 'ERROR', 'error', false);
    });
  });

  describe('progress', () => {
    it('switches to indexing once the upload reached 100 percent', async () => {
      const req = await startImport([file('a.aasx')]);

      req.event({ type: HttpEventType.UploadProgress, loaded: 50, total: 200 });
      expect(component.uploadProgress).toBe(25);
      expect(component.indexing).toBe(false);

      req.event({ type: HttpEventType.UploadProgress, loaded: 200, total: 200 });
      expect(component.uploadProgress).toBe(100);
      expect(component.indexing).toBe(true);
      expect(component.processingMessage).toBe('PLEASE_WAIT_IMPORT_PREPARING');
      expect(component.currentProcessingFileName).toBe('a.aasx');

      respond(req, result({ okImport: [{ aasId: '1' }] }));
    });

    it('applies only server-sent progress of the current operation and never decreases it', async () => {
      const req = await startImport([file('a.aasx'), file('b.aasx')]);
      const base = { message: '', completed: false, failed: false, infrastructureId: 7, totalFiles: 2 };

      sseService.importProgressUpdated.emit({
        ...base,
        operationId: 'other',
        progressPercent: 90,
        stage: 'saving',
        processedFiles: 1,
      });
      expect(component.processingProgress).toBe(0);
      expect(component.importProcessing).toBe(false);

      sseService.importProgressUpdated.emit({
        ...base,
        operationId: component.currentOperationId,
        progressPercent: 40,
        stage: 'reading',
        processedFiles: 0,
        currentFileName: 'a.aasx',
      });
      expect(component.processingProgress).toBe(40);
      expect(component.importProcessing).toBe(true);
      expect(component.processingMessage).toBe('PLEASE_WAIT_IMPORT_READING');
      expect(component.currentProcessingFileName).toBe('a.aasx');

      sseService.importProgressUpdated.emit({
        ...base,
        operationId: component.currentOperationId,
        progressPercent: 10,
        stage: 'unknown-stage',
        processedFiles: 1,
      });
      expect(component.processingProgress).toBe(40);
      expect(component.processingMessage).toBe('PLEASE_WAIT_INDEX');

      respond(req, result({ okImport: [{ aasId: '1' }, { aasId: '2' }] }));

      // subscription is released after the import finished
      const progressAfterFinish = component.processingProgress;
      sseService.importProgressUpdated.emit({
        ...base,
        operationId: '',
        progressPercent: 100,
        stage: 'completed',
        processedFiles: 2,
      });
      expect(component.processingProgress).toBe(progressAfterFinish);
      expect(component.importProgressSubscription).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('shows the upload-not-possible message for UploadFailedException', () => {
      const error = new ApiException('bad op');
      error.exceptionType = 'UploadFailedException';
      component.pendingPartialImport = { excludedSubmodelIds: ['x'], failedSubmodels: [], importableSubmodels: [] };

      component.handleError(error);

      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        'UPLOAD_NOT_POSSIBLE_INVALID_OP',
        'ERROR',
        'error',
        true,
      );
      expect(component.displayUploadDialog).toBe(true);
      expect(component.pendingPartialImport).toBeUndefined();
    });

    it('unescapes quotes in other api error messages', () => {
      component.handleError(new ApiException('Shell &quot;A&quot; exists'));

      expect(notificationService.showMessageAlways).toHaveBeenCalledWith('Shell "A" exists', 'ERROR', 'error', true);
    });

    it('resets loading state when the http request fails', async () => {
      const req = await startImport([file('a.aasx')]);

      req.flush('boom', { status: 500, statusText: 'Server Error' });

      expect(component.loading).toBe(false);
      expect(component.displayUploadDialog).toBe(true);
      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        expect.stringContaining('500'),
        'ERROR',
        'error',
        true,
      );
    });
  });

  describe('partial import of single bulk files', () => {
    const issue = (name: string, originalFile?: File) => ({
      sourceFileName: name,
      excludedSubmodelIds: ['sm-1'],
      originalFile,
      hasConflict: false,
      overwrite: false,
      failedSubmodels: [],
      importableSubmodels: [],
    });

    it('removes the issue, reloads and closes the dialog when the last file succeeds', () => {
      const emitted = vi.fn();
      component.loadData.subscribe(emitted);
      component.displayUploadDialog = true;
      const entry = issue('a.aasx', file('a.aasx'));
      component.bulkImportIssues = [entry];

      component.importBulkFilePartially({ ...entry, overwrite: true });
      expect(component.isImportingBulkFile('a.aasx')).toBe(true);

      const req = httpMock.expectOne(IMPORT_URL);
      const body = req.request.body as FormData;
      expect(body.get('overwrite')).toBe('true');
      expect(body.getAll('excludedSubmodelIds')).toEqual(['sm-1']);
      req.flush(result({ okImport: [{ aasId: '1' }] }));

      expect(component.isImportingBulkFile('a.aasx')).toBe(false);
      expect(emitted).toHaveBeenCalledWith(true);
      expect(component.displayUploadDialog).toBe(false);
      expect(component.bulkImportIssues).toBeUndefined();
    });

    it('keeps the dialog open while other issues remain', () => {
      const entryA = issue('a.aasx', file('a.aasx'));
      const entryB = issue('b.aasx', file('b.aasx'));
      component.bulkImportIssues = [entryA, entryB];
      component.displayUploadDialog = true;

      component.importBulkFilePartially(entryA);
      httpMock.expectOne(IMPORT_URL).flush(result({}));

      expect(component.bulkImportIssues?.map((i) => i.sourceFileName)).toEqual(['b.aasx']);
      expect(component.displayUploadDialog).toBe(true);
    });

    it('marks the issue as conflict on a 409 response', () => {
      const entry = issue('a.aasx', file('a.aasx'));
      component.bulkImportIssues = [entry];

      component.importBulkFilePartially(entry);
      httpMock.expectOne(IMPORT_URL).flush(result({ nokImport: [{ errorMessage: 'status 409' }] }));

      expect(component.bulkImportIssues?.[0].hasConflict).toBe(true);
      expect(notificationService.showMessageAlways).not.toHaveBeenCalled();
    });

    it('notifies about remaining errors', () => {
      const entry = issue('a.aasx', file('a.aasx'));
      component.bulkImportIssues = [entry];

      component.importBulkFilePartially(entry);
      httpMock.expectOne(IMPORT_URL).flush(result({ nokImport: [{ errorMessage: 'failed' }] }));

      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        'ERROR_IMPORTING_AAS',
        'ERROR',
        'error',
        false,
      );
      expect(component.bulkImportIssues).toHaveLength(1);
    });

    it('falls back to the selected file with the same name and skips unknown files', () => {
      const selected = file('a.aasx');
      component.selectedFiles = [selected];

      component.importBulkFilePartially(issue('missing.aasx'));
      httpMock.expectNone(IMPORT_URL);

      component.importBulkFilePartially(issue('a.aasx'));
      const req = httpMock.expectOne(IMPORT_URL);
      expect(((req.request.body as FormData).get('file[]') as File).name).toBe(selected.name);
      req.flush(result({}));
    });

    it('handles transport errors', () => {
      const entry = issue('a.aasx', file('a.aasx'));
      component.bulkImportIssues = [entry];

      component.importBulkFilePartially(entry);
      httpMock.expectOne(IMPORT_URL).flush('nope', { status: 500, statusText: 'Server Error' });

      expect(component.isImportingBulkFile('a.aasx')).toBe(false);
      expect(component.bulkImportIssues).toBeUndefined();
      expect(notificationService.showMessageAlways).toHaveBeenCalled();
    });
  });

  describe('dialog state', () => {
    it('resets all import state when the dialog is shown again', () => {
      component.selectedFiles = [file('a.aasx')];
      component.overwrite = true;
      component.setImportMode('derived');
      component.importingFiles.add('a.aasx');
      component.loading = true;

      component.show();

      expect(component.displayUploadDialog).toBe(true);
      expect(component.selectedFiles).toEqual([]);
      expect(component.overwrite).toBe(false);
      expect(component.importMode).toBeUndefined();
      expect(component.importingFiles.size).toBe(0);
      expect(component.loading).toBe(false);
    });

    it('labels the import mode buttons according to the selection', () => {
      component.setImportMode('original');

      expect(component.isImportModeSelected('original')).toBe(true);
      expect(component.importModeButtonLabel('original')).toBe('SELECTED');
      expect(component.importModeButtonLabel('derived')).toBe('CHOOSE');
    });

    it('cancelling a partial import clears pending issues', () => {
      component.pendingPartialImport = { excludedSubmodelIds: ['x'], failedSubmodels: [], importableSubmodels: [] };
      component.bulkImportIssues = [];

      component.cancelPartialImport();

      expect(component.pendingPartialImport).toBeUndefined();
      expect(component.bulkImportIssues).toBeUndefined();
    });

    it('accepts json files when the import type is json', async () => {
      fixture.componentRef.setInput('importType', 'json');
      fixture.detectChanges();
      await Promise.resolve();
      await fixture.whenStable();

      expect(component.acceptableExtion()).toBe('.json');
    });
  });
});
