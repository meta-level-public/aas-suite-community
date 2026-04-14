import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HandoverSemantics } from '@aas/helpers';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

import { DocumentItem } from '../../../generator/model/document-item';
import { EditorTypeOption } from '../../model/editor-type-option';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { V3SubmodelElementListEditorComponent } from './v3-submodel-element-list-editor.component';

function createDialogServiceMock() {
  const close$ = new Subject<DocumentItem | null>();

  return {
    open: vi.fn(() => ({ onClose: close$.asObservable() })),
    emitClose(value: DocumentItem | null) {
      close$.next(value);
    },
  };
}

function createDocumentItem() {
  const documentItem = DocumentItem.ensureDefaults(new DocumentItem(), 'en');
  documentItem.documentVersion[0].title = 'Operation manual';
  documentItem.documentVersion[0].documentVersionId = 'v1';
  documentItem.filePath = 'file:/aasx/files/operation-manual.pdf';
  documentItem.vdi2770FileFileName = 'operation-manual.pdf';
  documentItem.mimeType = 'application/pdf';
  return documentItem;
}

function createHandoverSubmodelList() {
  const submodel = new aas.types.Submodel('handover-submodel');
  submodel.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, '0173-1#01-AHF578#003'),
  ]);

  const list = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.SubmodelElementCollection);
  list.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, '0173-1#02-ABI500#003'),
  ]);
  list.semanticIdListElement = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, HandoverSemantics.DOCUMENT_V2),
  ]);
  list.idShort = 'Documents';
  list.value = [];

  const submodelNode = new V3TreeItem<aas.types.Submodel>();
  submodelNode.content = submodel;
  submodelNode.editorType = EditorTypeOption.Submodel;

  const listNode = new V3TreeItem<aas.types.SubmodelElementList>();
  listNode.content = list;
  listNode.editorType = EditorTypeOption.SubmodelElementList;
  listNode.parent = submodelNode;

  return listNode;
}

describe('V3SubmodelElementListEditorComponent', () => {
  let component: V3SubmodelElementListEditorComponent;
  let fixture: ComponentFixture<V3SubmodelElementListEditorComponent>;
  let dialogService: ReturnType<typeof createDialogServiceMock>;
  let treeService: { refreshSml: ReturnType<typeof vi.fn>; addFileNode: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogService = createDialogServiceMock();
    treeService = {
      refreshSml: vi.fn(),
      addFileNode: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        V3SubmodelElementListEditorComponent,
      ],
      providers: [
        { provide: OAuthService, useValue: { hasValidAccessToken: () => false } },
        { provide: ConfirmationService, useValue: { confirm: vi.fn() } },
        { provide: DialogService, useValue: dialogService },
        { provide: V3TreeService, useValue: treeService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(V3SubmodelElementListEditorComponent);
    component = fixture.componentInstance;
    component.shellResult = {
      supplementalFiles: [],
      addedFiles: [],
    } as never;
    component.repositoryUrl = '';
    component.idShortPath = '';
  });

  it('recognizes the handover document list and derives document rows', () => {
    const listNode = createHandoverSubmodelList();
    listNode.content.value = [new aas.types.SubmodelElementCollection(null, null, 'Ignored')];
    listNode.content.value[0].value = [];
    listNode.content.value[0].semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, HandoverSemantics.DOCUMENT_V2),
    ]);
    const version = new aas.types.SubmodelElementCollection(null, null, 'DocumentVersion');
    version.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, '0173-1#02-ABI503#001/0173-1#01-AHF582#001'),
    ]);
    const title = new aas.types.MultiLanguageProperty();
    title.idShort = 'Title';
    title.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, '0173-1#02-ABH998#001'),
    ]);
    title.value = [new aas.types.LangStringTextType('en', 'Operation manual')];

    const fileList = new aas.types.SubmodelElementList(
      aas.types.AasSubmodelElements.File,
      null,
      null,
      'File_List_V2',
      null,
      null,
      new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(aas.types.KeyTypes.GlobalReference, HandoverSemantics.FILE_LIST_V2),
      ]),
      null,
      null,
      null,
      true,
      null,
      null,
      [] as any,
    );
    const digitalFile = new aas.types.File();
    digitalFile.idShort = 'DigitalFile';
    digitalFile.contentType = 'application/pdf';
    digitalFile.value = 'file:/aasx/files/operation-manual.pdf';
    fileList.value = [digitalFile] as any;

    version.value = [title, fileList];
    (listNode.content.value[0] as aas.types.SubmodelElementCollection).value?.push(version);

    component.submodelElementList = listNode;

    component.ngOnChanges({});

    expect(component.isHandoverDocumentList).toBe(true);
    expect(component.handoverDocuments).toHaveLength(1);
    expect(component.handoverDocuments[0].label).toBe('Operation manual');
    expect(component.handoverDocuments[0].secondaryLabel).toBe('operation-manual.pdf');
  });

  it('adds a created document directly to the selected handover SML', () => {
    component.submodelElementList = createHandoverSubmodelList();
    component.ngOnChanges({});

    component.addHandoverDocument();
    dialogService.emitClose(createDocumentItem());

    expect(component.submodelElementList.content.value).toHaveLength(1);
    expect(component.submodelElementList.content.value?.[0]).toBeInstanceOf(aas.types.SubmodelElementCollection);
    expect(component.submodelElementList.content.value?.[0].idShort).toBe('Document00');
    expect(component.submodelElementList.content.value?.[0].semanticId?.keys[0].value).toBe(
      HandoverSemantics.DOCUMENT_V2,
    );
    expect(treeService.refreshSml).toHaveBeenCalled();
  });
});
