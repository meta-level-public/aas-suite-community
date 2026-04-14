import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HandoverSemantics } from '@aas/helpers';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { ViewerStoreService } from '../../viewer-store.service';
import { HandoverDocumentationService } from './handover-documentation.service';
import { HandoverStructureMode } from './structure-mode';

// Minimal stubs for semantic id helper expectations
// We rely on real class instances from aas-core types to keep instanceof checks working.

function mkSubmodel(
  opts: Partial<aas.types.Submodel> & { elements?: aas.types.ISubmodelElement[] } = {},
): aas.types.Submodel {
  const administration = (opts as any).administration
    ? new aas.types.AdministrativeInformation(
        null,
        (opts as any).administration.version ?? null,
        (opts as any).administration.revision ?? null,
      )
    : null;

  return new aas.types.Submodel(
    opts.id || 'test-sm',
    null,
    null,
    opts.idShort || 'TestSm',
    null,
    null,
    administration,
    aas.types.ModellingKind.Instance,
    (opts.semanticId as any) ?? null,
    null,
    null,
    null,
    (opts.elements as any) ?? null,
  );
}

function file(idShort: string, value: string): aas.types.File {
  return new aas.types.File(null, null, idShort, null, null, null, null, null, null, value, null);
}

function semanticRef(value: string) {
  return new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, value),
  ]);
}

function _mlp(idShort: string, text: string, lang = 'en'): aas.types.MultiLanguageProperty {
  return new aas.types.MultiLanguageProperty(
    null,
    null,
    idShort,
    null,
    null,
    null,
    null,
    null,
    null,
    [new aas.types.LangStringTextType(lang, text)],
    null,
  );
}

function smc(
  idShort: string,
  value: aas.types.ISubmodelElement[] = [],
  semanticId?: string,
): aas.types.SubmodelElementCollection {
  return new aas.types.SubmodelElementCollection(
    null,
    null,
    idShort,
    null,
    null,
    semanticId ? semanticRef(semanticId) : null,
    null,
    null,
    null,
    value as any,
  );
}

describe('HandoverDocumentationService', () => {
  let service: HandoverDocumentationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HandoverDocumentationService,
        { provide: HttpClient, useValue: {} },
        { provide: TranslateService, useValue: {} },
        { provide: DomSanitizer, useValue: { bypassSecurityTrustResourceUrl: (value: string) => value } },
        { provide: ViewerStoreService, useValue: {} },
      ],
    });

    service = TestBed.inject(HandoverDocumentationService);
  });

  it('detects V2 via administration.version', () => {
    const doc1 = smc('Doc_V2_main', [], HandoverSemantics.DOCUMENT_V2);
    const container = smc('Container_V2', [doc1], HandoverSemantics.CONTAINER_V2);
    const sm = mkSubmodel({ administration: { version: '2', revision: '0' }, elements: [container] });
    const res = service.analyze(sm);
    expect(res.mode).toBe(HandoverStructureMode.V2);
    expect(res.documents.length).toBe(1);
  });

  it('detects V2 document collections by semantic structure without administration.version', () => {
    const doc1 = smc('Doc_V2_main', [], HandoverSemantics.DOCUMENT_V2);
    const container = smc('Container_V2', [doc1], HandoverSemantics.CONTAINER_V2);
    const sm = mkSubmodel({ elements: [container] });

    const res = service.analyze(sm);

    expect(res.mode).toBe(HandoverStructureMode.V2);
    expect(res.documents).toHaveLength(1);
  });

  it('detects V1 via administration.version', () => {
    const docLegacy = smc('Doc_V1A_root', [], HandoverSemantics.DOCUMENT_V1_A);
    const sm = mkSubmodel({ administration: { version: '1', revision: '2' }, elements: [docLegacy] });
    const res = service.analyze(sm);
    expect(res.mode).toBe(HandoverStructureMode.V1);
    expect(res.documents.length).toBe(1);
  });

  it('falls back to UNKNOWN without elements', () => {
    const sm = mkSubmodel({});
    const res = service.analyze(sm);
    expect(res.mode).toBe(HandoverStructureMode.UNKNOWN);
    expect(res.documents.length).toBe(0);
  });

  it('builds simple file group for V2 version list', async () => {
    // Document with version list and one version containing a file list
    const fileEl = file('myFile', 'internal/path/doc.pdf');
    const fileList = new aas.types.SubmodelElementList(
      aas.types.AasSubmodelElements.File,
      null,
      null,
      'File_List_V2',
      null,
      null,
      semanticRef(HandoverSemantics.FILE_LIST_V2),
      null,
      null,
      null,
      true,
      null,
      null,
      [fileEl] as any,
    );
    const versionEntry = smc('VersionA', [fileList]);
    const versionList = new aas.types.SubmodelElementList(
      aas.types.AasSubmodelElements.SubmodelElementCollection,
      null,
      null,
      'Versions',
      null,
      null,
      semanticRef(HandoverSemantics.VERSION_LIST_V2),
      null,
      null,
      null,
      true,
      null,
      null,
      [versionEntry] as any,
    );
    const doc = smc('Doc_V2_main', [versionList], HandoverSemantics.DOCUMENT_V2);
    const container = smc('Container_V2', [doc], HandoverSemantics.CONTAINER_V2);
    const sm = mkSubmodel({ administration: { version: '2', revision: '0' }, elements: [container] });

    const { mode, documents } = service.analyze(sm);
    const groups = await service.buildFileGroups(sm, documents, mode, 'en');
    expect(groups.length).toBe(1);
    expect(groups[0].files.length).toBe(1);
    expect(groups[0].files[0].name).toContain('doc.pdf');
  });

  it('uses the first previewable file from File_List_V2 as group preview', async () => {
    const previewImage = file('PreviewImage', 'internal/path/doc-preview.png');
    previewImage.contentType = 'image/png';
    const documentPdf = file('DigitalFile', 'internal/path/doc.pdf');
    documentPdf.contentType = 'application/pdf';

    const fileList = new aas.types.SubmodelElementList(
      aas.types.AasSubmodelElements.File,
      null,
      null,
      'File_List_V2',
      null,
      null,
      semanticRef(HandoverSemantics.FILE_LIST_V2),
      null,
      null,
      null,
      true,
      null,
      null,
      [documentPdf, previewImage] as any,
    );
    const versionEntry = smc('VersionA', [fileList]);
    const versionList = new aas.types.SubmodelElementList(
      aas.types.AasSubmodelElements.SubmodelElementCollection,
      null,
      null,
      'Versions',
      null,
      null,
      semanticRef(HandoverSemantics.VERSION_LIST_V2),
      null,
      null,
      null,
      true,
      null,
      null,
      [versionEntry] as any,
    );
    const doc = smc('Doc_V2_main', [versionList], HandoverSemantics.DOCUMENT_V2);
    const container = smc('Container_V2', [doc], HandoverSemantics.CONTAINER_V2);
    const sm = mkSubmodel({ administration: { version: '2', revision: '0' }, elements: [container] });

    const { mode, documents } = service.analyze(sm);
    const groups = await service.buildFileGroups(sm, documents, mode, 'en');

    expect(groups[0].previewType).toBe('image');
    expect(groups[0].previewOriginalValue).toBe('internal/path/doc-preview.png');
    expect(groups[0].previewIdPath).toContain('File_List_V2[1]');
  });

  it('detects preview files by content type when the file value has no extension', async () => {
    const documentPdf = file('DigitalFile', 'internal/path/document-preview');
    documentPdf.contentType = 'application/pdf';

    const fileList = new aas.types.SubmodelElementList(
      aas.types.AasSubmodelElements.File,
      null,
      null,
      'File_List_V2',
      null,
      null,
      semanticRef(HandoverSemantics.FILE_LIST_V2),
      null,
      null,
      null,
      true,
      null,
      null,
      [documentPdf] as any,
    );
    const versionEntry = smc('VersionA', [fileList]);
    const versionList = new aas.types.SubmodelElementList(
      aas.types.AasSubmodelElements.SubmodelElementCollection,
      null,
      null,
      'Versions',
      null,
      null,
      semanticRef(HandoverSemantics.VERSION_LIST_V2),
      null,
      null,
      null,
      true,
      null,
      null,
      [versionEntry] as any,
    );
    const doc = smc('Doc_V2_main', [versionList], HandoverSemantics.DOCUMENT_V2);
    const container = smc('Container_V2', [doc], HandoverSemantics.CONTAINER_V2);
    const sm = mkSubmodel({ administration: { version: '2', revision: '0' }, elements: [container] });

    const { mode, documents } = service.analyze(sm);
    const groups = await service.buildFileGroups(sm, documents, mode, 'en');

    expect(groups[0].previewType).toBe('pdf');
    expect(groups[0].previewContentType).toBe('application/pdf');
    expect(groups[0].files[0].contentType).toBe('application/pdf');
  });

  it('detects tiff previews by extension and derives the tiff mime type', async () => {
    const previewImage = file('PreviewImage', 'internal/path/doc-preview.tiff');
    const documentPdf = file('DigitalFile', 'internal/path/doc.pdf');
    documentPdf.contentType = 'application/pdf';

    const fileList = new aas.types.SubmodelElementList(
      aas.types.AasSubmodelElements.File,
      null,
      null,
      'File_List_V2',
      null,
      null,
      semanticRef(HandoverSemantics.FILE_LIST_V2),
      null,
      null,
      null,
      true,
      null,
      null,
      [documentPdf, previewImage] as any,
    );
    const versionEntry = smc('VersionA', [fileList]);
    const versionList = new aas.types.SubmodelElementList(
      aas.types.AasSubmodelElements.SubmodelElementCollection,
      null,
      null,
      'Versions',
      null,
      null,
      semanticRef(HandoverSemantics.VERSION_LIST_V2),
      null,
      null,
      null,
      true,
      null,
      null,
      [versionEntry] as any,
    );
    const doc = smc('Doc_V2_main', [versionList], HandoverSemantics.DOCUMENT_V2);
    const container = smc('Container_V2', [doc], HandoverSemantics.CONTAINER_V2);
    const sm = mkSubmodel({ administration: { version: '2', revision: '0' }, elements: [container] });

    const { mode, documents } = service.analyze(sm);
    const groups = await service.buildFileGroups(sm, documents, mode, 'en');

    expect(groups[0].previewType).toBe('image');
    expect(groups[0].previewOriginalValue).toBe('internal/path/doc-preview.tiff');
    expect(service.deriveMimeFromName('doc-preview.tiff', 'image')).toBe('image/tiff');
    expect(service.deriveMimeFromName('doc-preview.tif', 'image')).toBe('image/tiff');
  });
});
