import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HandoverSemantics } from '@aas/helpers';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { ViewerStoreService } from '../../viewer-store.service';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { HandoverDocumentationService, HandoverFileGroup, isHtmlFile } from './handover-documentation.service';
import { HandoverStructureMode } from './structure-mode';

// Minimal stubs for semantic id helper expectations
// We rely on real class instances from aas-core types to keep instanceof checks working.

interface SubmodelStubOptions {
  id?: string;
  idShort?: string;
  semanticId?: aas.types.Reference;
  administration?: { version?: string; revision?: string };
  elements?: aas.types.ISubmodelElement[];
}

function mkSubmodel(opts: SubmodelStubOptions = {}): aas.types.Submodel {
  const administration = opts.administration
    ? new aas.types.AdministrativeInformation(
        null,
        opts.administration.version ?? null,
        opts.administration.revision ?? null,
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
    opts.semanticId ?? null,
    null,
    null,
    null,
    opts.elements ?? null,
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

function prop(idShort: string, value: string, semanticId?: string): aas.types.Property {
  const element = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, idShort);
  element.value = value;
  if (semanticId) element.semanticId = semanticRef(semanticId);
  return element;
}

function semMlp(idShort: string, semanticId: string, texts: Record<string, string>): aas.types.MultiLanguageProperty {
  const element = _mlp(idShort, '');
  element.value = Object.entries(texts).map(([lang, text]) => new aas.types.LangStringTextType(lang, text));
  element.semanticId = semanticRef(semanticId);
  return element;
}

function smList(
  idShort: string,
  semanticId: string,
  typeValueListElement: aas.types.AasSubmodelElements,
  value: aas.types.ISubmodelElement[],
): aas.types.SubmodelElementList {
  const element = new aas.types.SubmodelElementList(typeValueListElement, null, null, idShort);
  element.semanticId = semanticRef(semanticId);
  element.value = value;
  return element;
}

function classification(className: Record<string, string>, system: string, semanticId?: string) {
  return smc(
    'DocumentClassification',
    [
      prop('ClassId', '02-01', '0173-1#02-ABH996#001'),
      semMlp('ClassName', '0173-1#02-AAO102#003', className),
      prop('ClassificationSystem', system, '0173-1#02-ABH997#001'),
    ],
    semanticId,
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
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustResourceUrl: (value: string) => value,
            bypassSecurityTrustHtml: (value: string) => value,
          },
        },
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

  it('recognizes HTML documents by content type or extension', () => {
    expect(isHtmlFile('docs/maintenance.html')).toBe(true);
    expect(isHtmlFile('docs/maintenance.HTM')).toBe(true);
    expect(isHtmlFile('docs/maintenance', 'text/html; charset=utf-8')).toBe(true);
    expect(isHtmlFile('docs/maintenance.pdf', 'application/pdf')).toBe(false);
  });

  it('uses an HTML document as group preview when no preview file is set', async () => {
    const documentHtml = file('DigitalFile', 'internal/path/sandkasten-wartung.html');
    documentHtml.contentType = 'text/html';
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
      [documentHtml] as any,
    );
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
      [smc('VersionA', [fileList])] as any,
    );
    const doc = smc('Doc_V2_main', [versionList], HandoverSemantics.DOCUMENT_V2);
    const container = smc('Container_V2', [doc], HandoverSemantics.CONTAINER_V2);
    const sm = mkSubmodel({ administration: { version: '2', revision: '0' }, elements: [container] });

    const { mode, documents } = service.analyze(sm);
    const groups = await service.buildFileGroups(sm, documents, mode, 'en');

    expect(groups[0].previewType).toBe('html');
    expect(groups[0].previewOriginalValue).toBe('internal/path/sandkasten-wartung.html');
  });

  it('loads the content of HTML previews as text for the sandboxed frame', async () => {
    const http = TestBed.inject(HttpClient) as unknown as { get: ReturnType<typeof vi.fn> };
    http.get = vi.fn(() => of('<h1>Wartungshandbuch</h1>'));
    vi.spyOn(service, 'buildAttachmentUrl').mockResolvedValue('https://repo/attachment');
    const group = {
      groupId: 'g',
      title: 'Wartungshandbuch',
      docIndex: 0,
      files: [],
      previewType: 'html',
      previewIdPath: 'Doc.File',
      previewOriginalValue: 'internal/path/sandkasten-wartung.html',
    } as HandoverFileGroup;

    await service.loadPreviewBlobs([group]);

    expect(http.get).toHaveBeenCalledWith('https://repo/attachment', expect.objectContaining({ responseType: 'text' }));
    expect(group.previewHtml).toBe('<h1>Wartungshandbuch</h1>');
    expect(group.previewLoading).toBe(false);
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

  it('extracts V2 classifications in the current language', () => {
    const classes = smList(
      'DocumentClassifications',
      '0173-1#02-ABI502#003',
      aas.types.AasSubmodelElements.SubmodelElementCollection,
      [classification({ en: 'Technical specification', de: 'Technische Spezifikation' }, 'VDI2770:2018')],
    );
    const doc = smc('Doc', [classes], HandoverSemantics.DOCUMENT_V2);

    expect(service.extractClassifications(doc, HandoverStructureMode.V2, 'de')).toEqual([
      {
        collectionIdShort: 'DocumentClassification',
        classId: '02-01',
        className: 'Technische Spezifikation',
        classificationSystem: 'VDI2770:2018',
      },
    ]);
  });

  it('summarizes V2 documents with VDI 2770 classes and languages', () => {
    const versionList = (languages: string[]) =>
      smList(
        'DocumentVersions',
        HandoverSemantics.VERSION_LIST_V2,
        aas.types.AasSubmodelElements.SubmodelElementCollection,
        [
          smc('Version', [
            smList(
              'Languages',
              '0173-1#02-AAN468#008',
              aas.types.AasSubmodelElements.Property,
              languages.map((language) => prop('Language', language)),
            ),
          ]),
        ],
      );
    const classList = (...entries: aas.types.SubmodelElementCollection[]) =>
      smList(
        'DocumentClassifications',
        '0173-1#02-ABI502#003',
        aas.types.AasSubmodelElements.SubmodelElementCollection,
        entries,
      );
    const docA = smc(
      'DocA',
      [
        classList(classification({ en: 'Operation' }, 'VDI2770:2018'), classification({ en: 'Manual' }, 'IEC61355')),
        versionList(['de', 'en']),
      ],
      HandoverSemantics.DOCUMENT_V2,
    );
    const docB = smc(
      'DocB',
      [
        classList(
          classification({ en: 'Certificate' }, 'VDI 2770'),
          classification({ en: 'Operation' }, 'VDI2770:2018'),
        ),
        versionList(['en']),
      ],
      HandoverSemantics.DOCUMENT_V2,
    );

    expect(service.summarize([docA, docB], 'en')).toEqual({
      documentCount: 2,
      classNames: ['Operation', 'Certificate'],
      languages: ['DE', 'EN'],
    });
  });

  it('summarizes V1 documents and falls back to other classification systems', () => {
    const doc = smc(
      'Document01',
      [
        classification({ en: 'Drawing' }, 'Custom', '0173-1#02-ABI502#001/0173-1#01-AHF581#001'),
        smc('DocumentVersion01', [prop('Language01', 'fr', '0173-1#02-AAN468#006'), prop('Title', 'Plan')]),
      ],
      HandoverSemantics.DOCUMENT_V1_A,
    );

    expect(service.summarize([doc], 'en')).toEqual({ documentCount: 1, classNames: ['Drawing'], languages: ['FR'] });
  });
});
