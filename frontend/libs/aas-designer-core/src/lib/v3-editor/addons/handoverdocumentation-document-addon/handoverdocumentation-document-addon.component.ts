import { LanguageIsoMap, LanguageService } from '@aas/aas-designer-shared';
import { HelpLabelComponent } from '@aas/common-components';
import { PortalService } from '@aas/common-services';
import { FilenameHelper } from '@aas/helpers';
import { CommonModule } from '@angular/common';
import { Component, inject, model, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DocumentItem } from '../../../generator/model/document-item';
import { V3ComponentBase } from '../../components/v3-component-base';

@Component({
  selector: 'aas-handoverdocumentation-document-addon',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    HelpLabelComponent,
    InputTextModule,
    ButtonModule,
    FileUploadModule,
    InputGroupModule,
    InputGroupAddonModule,
    SelectModule,
  ],
  templateUrl: './handoverdocumentation-document-addon.component.html',
})
export class HandoverdocumentationDocumentAddonComponent extends V3ComponentBase implements OnInit {
  document = model<DocumentItem>(new DocumentItem());
  isoLanguages: LanguageIsoMap[] = [];
  classificationSystems: string[] = [];

  langService = inject(LanguageService);
  portalService = inject(PortalService);
  ref: DynamicDialogRef = inject(DynamicDialogRef);
  dialogService = inject(DialogService);
  translate = inject(TranslateService);

  currentCount = 0;
  initialDocument: DocumentItem | null = null;

  constructor() {
    super();
    const instance = this.dialogService.getInstance(this.ref);
    this.currentCount = instance?.data?.count ?? 0;
    this.initialDocument = instance?.data?.document ? structuredClone(instance.data.document) : null;
  }

  async ngOnInit() {
    this.document.set(this.createDocument(this.initialDocument));
    this.classificationSystems = ['VDI2770 Blatt 1:2020', 'IEC61355-1:2008'];
    this.isoLanguages = this.langService.getLanguageNamesAndIsoAlpha2();
    const document = this.document();
    if (document?.documentVersion != null && document.documentVersion[0].language.length === 0) {
      document.documentVersion[0].language = this.portalService.currentLanguage;
    }
  }

  createDocument(initialDocument: DocumentItem | null = null) {
    const doc = initialDocument ?? new DocumentItem();
    return DocumentItem.ensureDefaults(doc, this.portalService.currentLanguage);
  }

  setFile(event: { files: File[] }) {
    const document = this.document();

    if (document != null) {
      document.file = event.files[0];
      document.mimeType = event.files[0].type;
      document.vdi2770FileFileName = FilenameHelper.sanitizeFilename(event.files[0].name);
      document.vdi2770FileFormat = event.files[0].type;
      document.filePath = `${FilenameHelper.sanitizeFilename(event.files[0].name)}`;
      if (document.documentVersion[0].title.trim() === '') {
        document.documentVersion[0].title = event.files[0].name.replace(/\.[^.]+$/, '');
      }
    }
  }

  apply() {
    if (this.isApplyDisabled()) {
      return;
    }

    this.ref.close(this.document());
  }

  cancel() {
    this.ref.close(null);
  }

  isApplyDisabled() {
    const document = this.document();
    const primaryVersion = document.documentVersion[0];
    const primaryId = document.documentId[0];
    const primaryClassification = document.documentClassification[0];
    const className = primaryClassification?.className?.[0]?.text ?? '';

    return [
      document.filePath,
      primaryVersion?.language,
      primaryVersion?.title,
      primaryId?.valueId,
      primaryId?.documentDomainId,
      primaryClassification?.classificationSystem,
      primaryClassification?.classId,
      className,
    ].some((value) => `${value ?? ''}`.trim() === '');
  }
}
