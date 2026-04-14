import { FilenameHelper } from '@aas/helpers';
import { FileResult } from '@aas/model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { clone } from 'lodash-es';
import { TreeNode } from 'primeng/api';
import { lastValueFrom } from 'rxjs';
import { ZipViewerService } from './zip-viewer/zip-viewer.service';

import { TranslateModule } from '@ngx-translate/core';
import { Skeleton } from 'primeng/skeleton';
import { Tree } from 'primeng/tree';

@Component({
  selector: 'aas-file-viewer',
  templateUrl: './file-viewer.component.html',
  imports: [Tree, Skeleton, TranslateModule],
})
export class FileViewerComponent implements OnChanges {
  @Input() value: string | undefined;
  @Input() aasId: number | undefined;
  @Input() apiUrl: string = '/api';
  @Input() localFiles: FileResult[] | any[] = [];
  fileData: Blob | null = null;
  fileUrl: SafeResourceUrl | null = null;
  loading = false;
  FilenameHelper = FilenameHelper;
  treeFile: TreeNode[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private zipViewerService: ZipViewerService,
  ) {}

  async ngOnChanges() {
    this.loadData();
  }

  async loadData() {
    if (this.value != null && this.aasId != null) {
      if (FilenameHelper.isZip(this.value)) {
        try {
          this.loading = true;
          const fileResponse = await this.getZipFiles(clone(this.aasId).toString(), clone(this.value));
          if (fileResponse != null) {
            this.treeFile = this.zipViewerService.initTree(this.value, fileResponse);
          }
        } finally {
          this.loading = false;
        }
      } else {
        try {
          this.loading = true;
          this.fileUrl = null;
          this.fileData = await this.getFile(this.value);
          if (this.fileData != null)
            this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.fileData));
        } finally {
          this.loading = false;
        }
      }
    }
  }

  async getZipFiles(aasId: string, filename: string) {
    if (filename === '') {
      filename = '_';
    }

    const params = new HttpParams().set('id', aasId ?? '').set('filename', filename);

    return lastValueFrom(this.http.get<any>(`${this.apiUrl}/Aas/GetZipFilesFromAas`, { params: params }));
  }

  async getFile(fileName: string) {
    const localFile = this.localFiles.find(
      (f) =>
        f.filePath === FilenameHelper.replaceFileUri(fileName) || f.path === FilenameHelper.replaceFileUri(fileName),
    );
    if (localFile?.file != null) {
      return new Blob([new Uint8Array(await localFile.file.arrayBuffer())], { type: localFile.contentType });
    } else {
      if (fileName !== '') {
        const url = `${this.apiUrl}/Aas/GetFileFromAas`;
        return lastValueFrom(
          this.http.get<Blob>(url, {
            params: new HttpParams().set('id', this.aasId ?? -1).set('filename', fileName),
            responseType: 'blob' as 'json',
          }),
        );
      } else {
        return null;
      }
    }
  }
}
