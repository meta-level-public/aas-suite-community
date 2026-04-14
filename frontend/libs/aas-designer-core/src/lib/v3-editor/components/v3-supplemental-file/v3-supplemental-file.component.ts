import { HelpLabelComponent } from '@aas/common-components';
import { FilenameHelper } from '@aas/helpers';
import { ShellResult, SupplementalFile } from '@aas/model';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { saveAs } from 'file-saver-es';
import { ButtonModule } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { InputText } from 'primeng/inputtext';
import { lastValueFrom } from 'rxjs';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3ComponentBase } from '../v3-component-base';

type PreviewType = 'image' | 'pdf' | 'video' | 'xml' | 'unknown';

@Component({
  selector: 'aas-v3-supplemental-file',
  templateUrl: './v3-supplemental-file.component.html',
  imports: [Fieldset, HelpLabelComponent, FormsModule, InputText, ButtonModule, TranslateModule],
})
export class V3SupplementalFileComponent extends V3ComponentBase implements OnChanges {
  @Input({ required: true }) file: V3TreeItem<SupplementalFile> | undefined | null;

  @Input({ required: true }) aasId: number | undefined | null;
  @Input({ required: true }) shellResult: ShellResult | undefined | null;

  FilenameHelper = FilenameHelper;
  showPreview: boolean = false;
  previewText: string | null = null;

  supplementalFile: SupplementalFile | undefined;
  loading: boolean = false;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {
    super();
  }

  ngOnChanges(): void {
    this.supplementalFile = this.resolveSupplementalFile();
    this.showPreview = false;
    this.previewText = null;
  }

  async loadFile() {
    if (!this.canPreview() || this.supplementalFile == null) {
      return;
    }

    if (this.previewAvailable()) {
      this.showPreview = true;
      return;
    }

    try {
      this.loading = true;
      this.previewText = null;

      const fileBlob = await this.resolveFileBlob();
      if (fileBlob == null) {
        return;
      }

      await this.applyPreview(fileBlob);
      this.supplementalFile.isLoaded = true;
      this.showPreview = true;
    } finally {
      this.loading = false;
    }
  }

  async downloadFile() {
    if (this.supplementalFile?.fileData != null) {
      const l = (this.supplementalFile.filename as string).split('/');
      saveAs(this.supplementalFile.fileData, l[l.length - 1]);
    } else if (this.supplementalFile?.isLocal === true && this.supplementalFile.file != null) {
      const l = (this.supplementalFile.filename as string).split('/');
      saveAs(this.supplementalFile.file, l[l.length - 1]);
    } else if (this.supplementalFile?.fileApiUrl) {
      try {
        this.loading = true;
        const fileData = await this.fetchFileBlob(this.supplementalFile.fileApiUrl);
        if (fileData != null) {
          this.supplementalFile.fileData = fileData;
          const l = this.getFilename().split('/');
          saveAs(fileData, l[l.length - 1]);
        }
      } finally {
        this.loading = false;
      }
    }
  }

  canPreview(): boolean {
    return this.getPreviewType() !== 'unknown';
  }

  previewAvailable(): boolean {
    return this.getPreviewType() === 'xml' ? this.previewText != null : this.supplementalFile?.fileUrl != null;
  }

  getPreviewType(): PreviewType {
    const path = this.supplementalFile?.path ?? this.file?.content?.path;
    const contentType = this.supplementalFile?.contentType ?? this.file?.content?.contentType;

    if (FilenameHelper.isImage(path) || FilenameHelper.isImageContentType(contentType)) {
      return 'image';
    }
    if (FilenameHelper.isPdf(path) || FilenameHelper.isPdfContentType(contentType)) {
      return 'pdf';
    }
    if (FilenameHelper.isVideo(path) || FilenameHelper.isVideoContentType(contentType)) {
      return 'video';
    }
    if (FilenameHelper.isXmlType(path) || FilenameHelper.isXmlContentType(contentType)) {
      return 'xml';
    }

    return 'unknown';
  }

  private resolveSupplementalFile(): SupplementalFile | undefined {
    const path = this.file?.content?.path;
    const fileApiUrl = this.file?.content?.fileApiUrl;

    return this.shellResult?.supplementalFiles.find(
      (supplementalFile) => supplementalFile.path === path || supplementalFile.fileApiUrl === fileApiUrl,
    );
  }

  private async resolveFileBlob(): Promise<Blob | File | null> {
    if (this.supplementalFile?.fileData != null) {
      return this.supplementalFile.fileData;
    }

    if (this.supplementalFile?.file != null) {
      this.supplementalFile.fileData = this.supplementalFile.file;
      return this.supplementalFile.file;
    }

    if (this.supplementalFile?.fileApiUrl) {
      this.supplementalFile.fileData = await this.fetchFileBlob(this.supplementalFile.fileApiUrl);
      return this.supplementalFile.fileData;
    }

    return null;
  }

  private async applyPreview(fileBlob: Blob | File) {
    if (this.supplementalFile == null) {
      return;
    }

    const previewType = this.getPreviewType();
    if (previewType === 'xml') {
      this.previewText = await this.readBlobText(fileBlob);
      this.supplementalFile.fileUrl = null;
      return;
    }

    const typedFile =
      fileBlob instanceof File
        ? fileBlob
        : new File([fileBlob], this.getFilename(), {
            type: fileBlob.type || this.supplementalFile.contentType || 'application/octet-stream',
          });
    const previewBlob = previewType === 'image' ? await FilenameHelper.buildPreviewImageBlob(typedFile) : typedFile;

    this.supplementalFile.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(previewBlob));
  }

  private getFilename(): string {
    const filename =
      this.supplementalFile?.filename ?? this.supplementalFile?.path ?? this.file?.content?.path ?? 'file';
    const parts = filename.split('/');
    return parts[parts.length - 1];
  }

  private async fetchFileBlob(fileApiUrl: string): Promise<Blob> {
    return lastValueFrom(
      this.http.get<Blob>(fileApiUrl, {
        responseType: 'blob' as 'json',
      }),
    );
  }

  private async readBlobText(fileBlob: Blob | File): Promise<string> {
    if (typeof fileBlob.text === 'function') {
      return fileBlob.text();
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    return new TextDecoder('utf-8').decode(arrayBuffer);
  }
}
