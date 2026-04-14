import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DocumentItem } from '../model/document-item';

@Component({
  selector: 'aas-handover-documents-step',
  templateUrl: './handover-documents-step.component.html',
  styleUrl: './handover-documents-step.component.scss',
  imports: [Button, TranslateModule],
})
export class HandoverDocumentsStepComponent {
  @Input() stepIndex = 0;
  @Input() stepTitle = 'DOCUMENTS';
  @Input() stepDescription = 'BATTERY_PASSPORT_HANDOVER_DOCUMENTS_EXPL';
  @Input() documents: DocumentItem[] = [];
  @Input() showIdShort = true;

  @Output() addRequested = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<number>();
  @Output() deleteRequested = new EventEmitter<number>();

  get documentCount() {
    return this.documents.length;
  }

  add() {
    this.addRequested.emit();
  }

  edit(index: number) {
    this.editRequested.emit(index);
  }

  delete(index: number) {
    this.deleteRequested.emit(index);
  }

  getDocumentLabel(document: DocumentItem, index: number) {
    const title = document.documentVersion[0]?.title?.trim();
    if (title) {
      return `${index + 1}. ${title}`;
    }

    const valueId = document.documentId[0]?.valueId?.trim();
    if (valueId) {
      return `${index + 1}. ${valueId}`;
    }

    const filename = this.getDocumentFileName(document);
    if (filename) {
      return `${index + 1}. ${filename}`;
    }

    return `${index + 1}`;
  }

  getDocumentFileName(document: DocumentItem) {
    if (document.file?.name != null && document.file.name.trim() !== '') {
      return document.file.name;
    }

    const filePath = `${document.filePath ?? ''}`.replace(/^file:/, '').trim();
    if (filePath === '') {
      return '';
    }

    return (
      filePath
        .split('/')
        .filter((segment) => segment !== '')
        .at(-1) ?? filePath
    );
  }

  getDocumentSubtitle(document: DocumentItem) {
    const version = document.documentVersion[0]?.documentVersionId?.trim();
    return [version].filter((value) => value != null && value !== '').join(' · ');
  }
}
