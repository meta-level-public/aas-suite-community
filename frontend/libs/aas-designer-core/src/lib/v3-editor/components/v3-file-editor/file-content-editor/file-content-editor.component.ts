import { Reference } from '@aas-core-works/aas-core3.1-typescript/types';
import { HelpLabelComponent } from '@aas/common-components';
import { SafePipe } from '@aas/common-pipes';
import { NotificationService } from '@aas/common-services';
import { FilenameHelper } from '@aas/helpers';
import { ShellResult, SupplementalFile } from '@aas/model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, inject, input, model, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { saveAs } from 'file-saver-es';
import mime from 'mime';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Popover, PopoverModule } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import 'prismjs';
import { lastValueFrom } from 'rxjs';
import { V3TreeService } from '../../../v3-tree/v3-tree.service';

@Component({
  selector: 'aas-file-content-editor',
  standalone: true,
  templateUrl: './file-content-editor.component.html',
  providers: [provideMarkdown()],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ToolbarModule,
    ButtonModule,
    FileUploadModule,
    PopoverModule,
    InputTextModule,
    InputGroupAddonModule,
    InputGroupModule,
    HelpLabelComponent,
    TooltipModule,
    MarkdownModule,
    DialogModule,
    TableModule,
    MessageModule,
    SafePipe,
  ],
})
export class FileContentEditorComponent {
  updateFileValue(val: string) {
    this.fileValueOutgoing.emit(val);
  }
  updateFileContentType(val: string) {
    this.fileContentTypeOutgoing.emit(val);
  }
  sanitizer = inject(DomSanitizer);
  treeService = inject(V3TreeService);
  http = inject(HttpClient);
  notificationService = inject(NotificationService);

  currentFileValue = signal<string | null>(null);
  currentFileContentType = signal<string | null>(null);

  shellResult = input.required<ShellResult | undefined | null>();
  semanticId = input.required<Reference | undefined | null>();
  thumbnailEditor = input(false);
  fileValueIncoming = input.required<string | null>();
  fileContentTypeIncoming = input.required<string>();
  fileValueOutgoing = output<string | null>();
  fileContentTypeOutgoing = output<string>();
  showPathType = input(false);

  newUrl = model<string>();

  uploader = viewChild<FileUpload>('uploader');

  previewLoaded = signal(false);

  fileResourceUrl = signal<string>('');

  displayFileSelectionDialog = model(false);

  loadingError = signal<boolean | null>(null);

  constructor() {
    effect(() => {
      this.currentFileValue.set(this.fileValueIncoming());
    });
    effect(() => {
      this.currentFileContentType.set(this.fileContentTypeIncoming());
    });
  }

  loadedEffect = effect(async () => {
    this.fileValueIncoming();
    this.fileContentTypeIncoming();
    if (this.thumbnailEditor() === false) {
      this.previewLoaded.set(false);
    } else {
      await this.loadFile();
      this.previewLoaded.set(true);
    }
  });

  isPreviewable = computed(() => {
    const fileValue = this.currentFileValue() ?? this.fileValueIncoming();
    const fileContentType = this.currentFileContentType() ?? this.fileContentTypeIncoming();

    if (fileValue != null)
      return FilenameHelper.isPreviewable(fileValue) || FilenameHelper.isPreviewableContentType(fileContentType);
    else return false;
  });

  isHttpFile = computed(() => {
    return (this.currentFileValue() ?? this.fileValueIncoming())?.startsWith('http');
  });

  supplementalFile = computed(() => {
    if (this.shellResult() == null) return null;
    const fileValue = this.currentFileValue() ?? this.fileValueIncoming();
    if (fileValue == null) return null;

    // this.recalculationTrigger();

    const shellResult = this.shellResult();

    const x = shellResult?.supplementalFiles.find(
      (f) => f.filename === fileValue || f.filename === this.getLastPart(fileValue),
    );
    return x;
  });

  getLastPart(fileValue: string | null): string | null {
    if (fileValue == null) return null;
    const parts = fileValue.split('/');
    return parts.length > 0 ? parts[parts.length - 1] : null;
  }

  previewType = computed(() => {
    const fileValue = this.currentFileValue() ?? this.fileValueIncoming();
    const fileContentType = this.currentFileContentType() ?? this.fileContentTypeIncoming();
    if (FilenameHelper.isImage(fileValue) || FilenameHelper.isImageContentType(fileContentType)) {
      return 'image';
    } else if (FilenameHelper.isPdf(fileValue) || FilenameHelper.isPdfContentType(fileContentType)) {
      return 'pdf';
    } else if (FilenameHelper.isVideo(fileValue) || FilenameHelper.isVideoContentType(fileContentType)) {
      return 'video';
    } else if (FilenameHelper.isXmlType(fileValue) || FilenameHelper.isXmlContentType(fileContentType)) {
      return 'xml';
    } else {
      return 'unknown';
    }
  });

  acceptTypes = computed(() => {
    if (this.isPreviewFile() === true) {
      return 'image/*';
    } else {
      return undefined;
    }
  });

  isPreviewFile = computed(() => {
    // 0173-1#02-ABI504#001/0173-1#01-AHF583#001
    return (
      this.semanticId()?.keys.find((k) => k.value?.trim().startsWith('0173-1#02-ABI505#001 /0173-1#01-AHF584#001')) !=
        null ||
      this.semanticId()?.keys.find((k) => k.value?.trim().startsWith('0173-1#02-ABI505#001/0173-1#01-AHF584#001')) !=
        null ||
      this.semanticId()?.keys.find((k) =>
        k.value?.trim().startsWith('https://admin-shell.io/vdi/2770/1/0/StoredDocumentRepresentation/PreviewFile'),
      ) != null ||
      this.thumbnailEditor()
    );
  });

  xmlContent = computed(async () => {
    if (this.previewType() === 'xml') {
      const text = await this.fileData()?.text();
      return text;
    } else {
      return '';
    }
  });
  fileData = signal<Blob | null>(null);

  reset() {
    this.uploader()?.clearInputElement();
    this.uploader()?.clearIEInput();
    this.uploader()?.clear();
  }

  openFileSelectionDialog(): void {
    this.uploader()?.clearInputElement();
    this.uploader()?.clearIEInput();
    this.uploader()?.clear();
    setTimeout(() => {
      const fileInput: HTMLInputElement = this.uploader()?.basicFileInput?.nativeElement;
      fileInput.click();
    });
  }

  applyUrl(op: Popover) {
    const newUrl = this.newUrl() ?? null;
    if (this.newUrl != null) {
      this.fileValueOutgoing.emit(newUrl);

      const extension = FilenameHelper.getExtension(newUrl);
      const mimeType = mime.getType(extension);
      if (mimeType != null) {
        this.fileContentTypeOutgoing.emit(mimeType);
      } else if (extension === '.vec' || extension === '.kbl') {
        this.fileContentTypeOutgoing.emit('application/xml');
      } else {
        this.fileContentTypeOutgoing.emit('application/octet-stream');
      }
    }

    this.newUrl.set('');
    op.hide();
  }

  delete() {
    const fileValue = this.fileValueIncoming();
    const shellResult = this.shellResult();
    if (fileValue != null && shellResult != null) {
      if (fileValue?.startsWith('http')) {
        this.fileValueOutgoing.emit(null);
        this.fileContentTypeOutgoing.emit('');
      } else {
        // TODO: prüfen, ob die Datei noch irgendwo anders referenziert wird ...
        this.fileValueOutgoing.emit(null);
        this.fileContentTypeOutgoing.emit('');
        const supplFile = this.supplementalFile();
        if (supplFile != null) {
          this.shellResult()?.deletedFiles.push(supplFile);
        }
      }
    }
  }

  async loadPreview() {
    if (this.isHttpFile()) {
      this.previewLoaded.set(true);
    } else {
      this.loadFile();
    }
  }

  async loadFile() {
    const supplementalFile = this.supplementalFile();
    if (supplementalFile != null) {
      if (supplementalFile.isLocal) {
        const localFile = supplementalFile.fileData ?? supplementalFile.file;
        if (localFile != null) {
          await this.setPreviewResourceUrl(localFile, supplementalFile.filename, supplementalFile.contentType);
          this.fileData.set(supplementalFile.fileData ?? supplementalFile.file);
          this.previewLoaded.set(true);
        } else if (supplementalFile.fileResourceUrl != null) {
          this.fileResourceUrl.set(supplementalFile.fileResourceUrl);
          this.previewLoaded.set(true);
        }
      } else {
        try {
          await this.loadFileData();
          this.previewLoaded.set(true);
        } catch (_error) {
          this.notificationService.showMessageAlways('ERROR_LOADING_FILE', 'ERROR', 'error', false);
        }
      }
    }
  }

  async loadFileData() {
    const supplementalFile = this.supplementalFile();
    if (supplementalFile == null) return;
    try {
      const res = await lastValueFrom(
        this.http.get<Blob>(supplementalFile.fileApiUrl, {
          responseType: 'blob' as 'json',
        }),
      );
      this.fileData.set(res);
      const previewType = this.previewType();
      if (previewType === 'pdf') {
        const newBlob = new Blob([res], { type: 'application/pdf' });
        this.fileResourceUrl.set(URL.createObjectURL(newBlob));
      } else {
        await this.setPreviewResourceUrl(res, supplementalFile.filename, supplementalFile.contentType);
      }
    } catch (_error) {
      this.loadingError.set(true);
    }
  }

  private async setPreviewResourceUrl(blob: Blob, fileName?: string | null, contentType?: string | null) {
    const previewType = this.previewType();
    const typedBlob = new File([blob], fileName ?? this.getLastPart(this.fileValueIncoming()) ?? 'preview', {
      type: blob.type || contentType || this.fileContentTypeIncoming() || 'application/octet-stream',
    });
    const previewBlob = previewType === 'image' ? await FilenameHelper.buildPreviewImageBlob(typedBlob) : typedBlob;
    this.fileResourceUrl.set(URL.createObjectURL(previewBlob));
  }

  async onSelect(event: FileSelectEvent) {
    const selectedFile = event.files?.[0];
    if (selectedFile == null) {
      return;
    }

    const supplFile = this.supplementalFile();
    // prüfen ob es eine bestehende gibt
    if (supplFile != null) {
      // TODO: prüfen, ob die Datei noch irgendwo anders referenziert wird ...
      this.shellResult()?.deletedFiles.push(supplFile);
    }

    let newFileName = selectedFile.name;
    let santitizedFilename = FilenameHelper.sanitizeFilename(newFileName);

    // überprüfen ob es bereits eine Datei mit diesem Namen gibt
    let existing = this.shellResult()?.supplementalFiles.filter(
      (f) => f.path === FilenameHelper.replaceFileUri(santitizedFilename),
    );
    if (existing != null && existing.length !== 0) {
      let isUnique = false;
      let i = 1;
      while (!isUnique) {
        const testFilename = `${FilenameHelper.getNameWithoutExt(newFileName)}${i}${FilenameHelper.getExtension(
          newFileName,
        )}`;
        const testFilePath = `file:/aasx/files/${FilenameHelper.sanitizeFilename(testFilename)}`;
        existing = this.shellResult()?.supplementalFiles.filter(
          (file) => file.path === FilenameHelper.replaceFileUri(testFilePath),
        );
        if (existing != null && existing.length !== 0) {
          i++;
        } else {
          isUnique = true;
          newFileName = `${FilenameHelper.getNameWithoutExt(newFileName)}${i}${FilenameHelper.getExtension(
            newFileName,
          )}`;
          santitizedFilename = FilenameHelper.sanitizeFilename(newFileName);
        }
      }
    }

    this.fileValueOutgoing.emit(santitizedFilename);
    const extension = FilenameHelper.getExtension(santitizedFilename);
    const mimeType = mime.getType(extension);
    const resolvedContentType =
      mimeType != null
        ? mimeType
        : extension === '.vec' || extension === '.kbl'
          ? 'application/xml'
          : 'application/octet-stream';

    this.currentFileValue.set(santitizedFilename);
    this.currentFileContentType.set(resolvedContentType);

    if (mimeType != null) {
      this.fileContentTypeOutgoing.emit(mimeType);
    } else if (extension === '.vec' || extension === '.kbl') {
      this.fileContentTypeOutgoing.emit('application/xml');
    } else {
      this.fileContentTypeOutgoing.emit('application/octet-stream');
    }

    const previewBlob = await FilenameHelper.buildPreviewImageBlob(selectedFile);
    const previewUrl = URL.createObjectURL(previewBlob);
    this.fileResourceUrl.set(previewUrl);
    this.fileData.set(selectedFile);
    this.loadingError.set(false);
    this.previewLoaded.set(true);

    const newSupplFile: SupplementalFile = {
      path: santitizedFilename,
      filename: santitizedFilename,
      fileApiUrl: '',
      fileUrl: null,
      fileResourceUrl: previewUrl,
      contentType: FilenameHelper.getContentType(selectedFile),
      file: selectedFile,
      isLoaded: true,
      isLoading: false,
      isLocal: true,
      fileData: selectedFile,
      id: null,
      isThumbnail: this.thumbnailEditor(),
    };
    this.shellResult()?.supplementalFiles.push(newSupplFile);

    this.shellResult()?.addedFiles.push(newSupplFile);
    this.treeService.addFileNode(newSupplFile);

    this.reset();
  }

  async downloadFile() {
    const filename = this.fileValueIncoming()?.split('/').pop() ?? 'file';
    if (this.isHttpFile()) {
      try {
        const url = this.fileValueIncoming();
        if (url == null) return;

        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(downloadUrl);
      } catch (_error) {
        this.notificationService.showMessageAlways('ERROR_LOADING_REMOTE_FILE', 'ERROR', 'error', false);
      }
    } else {
      if (this.fileData() == null) {
        try {
          await this.loadFileData();
        } catch (_error) {
          this.notificationService.showMessageAlways('ERROR_LOADING_REMOTE_FILE', 'ERROR', 'error', false);
          return;
        }
      }
      const fileData = this.fileData();
      if (fileData == null) return;
      saveAs(fileData, filename);
    }
  }

  applyFile(file: SupplementalFile) {
    this.fileValueOutgoing.emit(file.filename);
    this.fileContentTypeOutgoing.emit(file.contentType);
    this.displayFileSelectionDialog.set(false);
  }
}
