import { ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';

import { SafePipe } from '@aas/common-pipes';
import { FilenameHelper } from '@aas/helpers';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownComponent } from 'ngx-markdown';
import { ButtonModule } from 'primeng/button';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { SelectDocumentFile } from '../select-document-file';

@Component({
  selector: 'aas-handover-documentation-file',
  templateUrl: './handover-documentation-file.component.html',
  imports: [Select, FormsModule, ButtonModule, MarkdownComponent, Message, TranslateModule, SafePipe],
})
export class HandoverDocumentationFileComponent implements OnChanges {
  @Input({ required: true }) documentFiles: SelectDocumentFile[] = [];
  @Input({ required: true }) fileMap: Map<string, string> = new Map<string, string>();
  @Input({ required: true }) fileDataMap: Map<string, string> = new Map<string, string>();

  @Output() loadPreview: EventEmitter<SelectDocumentFile> = new EventEmitter<SelectDocumentFile>();
  @Output() download: EventEmitter<SelectDocumentFile> = new EventEmitter<SelectDocumentFile>();

  FilenameHelper = FilenameHelper;
  fileSrc: string | undefined;

  selectedFile: SelectDocumentFile | null = null;
  loadError: boolean = false;

  xmlString: string | undefined;

  ngOnChanges(): void {
    const preview = this.documentFiles.find(
      (f) => f.idShort?.toLowerCase().includes('preview') || f.label?.toLowerCase().includes('preview'),
    );
    this.selectedFile = preview ?? null;
    setTimeout(() => {
      if (this.selectedFile != null) this.selectedFileChanged();
    });
  }

  selectedFileChanged() {
    this.loadError = false;
    if (this.selectedFile != null) {
      if (this.selectedFile.path.startsWith('http')) {
        this.fileSrc = this.selectedFile.path;
      } else {
        this.loadPreview.emit(this.selectedFile);
        if (this.fileMap.has(this.selectedFile.path)) {
          this.fileSrc = this.fileMap.get(this.selectedFile.path);
        }
      }

      this.xmlString = this.fileDataMap.get(this.selectedFile.path);
    }
  }

  get isPreview() {
    return (
      this.selectedFile?.label?.toLowerCase().includes('preview') ||
      this.selectedFile?.idShort?.toLowerCase().includes('preview')
    );
  }

  getSemanticId(sme: ISubmodelElement, semanticId: string) {
    return sme.semanticId?.keys.find((k) => k.value.startsWith(semanticId));
  }

  objectLoadError() {
    this.loadError = true;
  }
}
