import { HelpLabelComponent } from '@aas/common-components';
import { Component, input, output, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';

export interface GeneratorFileUploadCardState {
  filename?: string | null;
  contentType?: string | null;
  fileReference?: string | null;
  hasSelection?: boolean;
  previewUrl?: string | null;
  showPreviewFallback?: boolean;
  previewAlt?: string;
}

@Component({
  selector: 'aas-generator-file-upload-card',
  templateUrl: './generator-file-upload-card.component.html',
  styleUrl: './generator-file-upload-card.component.scss',
  imports: [HelpLabelComponent, Button, FileUpload, TranslateModule],
})
export class GeneratorFileUploadCardComponent {
  dropZoneHovered = signal(false);

  state = input<GeneratorFileUploadCardState | null>(null);
  titleKey = input('FILE');
  helpTag = input('');
  iconClass = input('');
  filename = input<string | null>(null);
  emptyTextKey = input('BATTERY_PASSPORT_FILE_NONE_SELECTED');
  contentType = input<string | null>(null);
  fileReference = input<string | null>(null);
  selectTextKey = input('BATTERY_PASSPORT_FILE_SELECT');
  replaceTextKey = input('BATTERY_PASSPORT_FILE_REPLACE');
  removeTextKey = input('BATTERY_PASSPORT_FILE_REMOVE');
  accept = input('');
  inputId = input('');
  allowRemove = input(true);
  hasSelection = input(false);
  previewUrl = input<string | null>(null);
  showPreviewFallback = input(false);
  previewAlt = input('');
  previewUnavailableTextKey = input('GENERATOR_FILE_PREVIEW_UNAVAILABLE');

  fileSelected = output<FileSelectEvent>();
  removeRequested = output<void>();

  onFileSelected(event: FileSelectEvent) {
    this.fileSelected.emit(event);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer != null) {
      event.dataTransfer.dropEffect = 'copy';
    }

    this.dropZoneHovered.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.dropZoneHovered.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.dropZoneHovered.set(false);

    const file = this.getFirstAcceptedFile(event.dataTransfer?.files);
    if (file == null) {
      return;
    }

    this.fileSelected.emit({
      originalEvent: event,
      files: [file],
      currentFiles: [file],
    } as FileSelectEvent);
  }

  onRemoveRequested() {
    this.removeRequested.emit();
  }

  get uploadLabelKey() {
    return this.resolvedHasSelection ? this.replaceTextKey() : this.selectTextKey();
  }

  get resolvedAccept() {
    const accept = this.accept().trim();
    return accept === '' ? undefined : accept;
  }

  get hasFilename() {
    const filename = this.resolvedFilename;
    return filename != null && filename !== '';
  }

  get resolvedFilename() {
    return this.state()?.filename ?? this.filename();
  }

  get resolvedContentType() {
    return this.state()?.contentType ?? this.contentType();
  }

  get resolvedFileReference() {
    return this.state()?.fileReference ?? this.fileReference();
  }

  get resolvedHasSelection() {
    return this.state()?.hasSelection ?? this.hasSelection();
  }

  get resolvedPreviewUrl() {
    return this.state()?.previewUrl ?? this.previewUrl();
  }

  get resolvedPreviewFallback() {
    return this.state()?.showPreviewFallback ?? this.showPreviewFallback();
  }

  get showRemoveButton() {
    return this.allowRemove() && this.resolvedHasSelection;
  }

  get resolvedTitleKey() {
    return this.titleKey();
  }

  get resolvedPreviewAlt() {
    const previewAlt = this.state()?.previewAlt ?? this.previewAlt();
    if (previewAlt !== '') {
      return previewAlt;
    }

    if (this.resolvedFilename != null) {
      return this.resolvedFilename;
    }

    return this.resolvedTitleKey;
  }

  private getFirstAcceptedFile(fileList: FileList | File[] | null | undefined) {
    const files = Array.from(fileList ?? []);

    for (const file of files) {
      if (this.matchesAccept(file)) {
        return file;
      }
    }

    return null;
  }

  private matchesAccept(file: File) {
    const accept = this.resolvedAccept;
    if (accept == null) {
      return true;
    }

    const normalizedType = `${file.type ?? ''}`.trim().toLowerCase();
    const normalizedName = `${file.name ?? ''}`.trim().toLowerCase();

    return accept
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter((entry) => entry !== '')
      .some((entry) => {
        if (entry === '*/*') {
          return true;
        }

        if (entry.startsWith('.')) {
          return normalizedName.endsWith(entry);
        }

        if (entry.endsWith('/*')) {
          const prefix = entry.slice(0, -1);
          return normalizedType.startsWith(prefix);
        }

        return normalizedType === entry;
      });
  }
}
