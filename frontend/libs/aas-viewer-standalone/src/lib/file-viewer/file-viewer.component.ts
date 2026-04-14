import { File, ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { FilenameHelper, SubmodelElementUtil } from '@aas/helpers';
import { FileResult } from '@aas/model';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { TreeNode } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { lastValueFrom, Subscription } from 'rxjs';
import { ViewerStoreService } from '../viewer-store.service';
import { ZipViewerService } from './zip-viewer/zip-viewer.service';

import { MarkdownComponent } from 'ngx-markdown';
import { Message } from 'primeng/message';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'aas-v3-file-viewer',
  templateUrl: './file-viewer.component.html',
  imports: [
    Accordion,
    AccordionPanel,
    Ripple,
    AccordionHeader,
    AccordionContent,
    InputGroup,
    InputGroupAddon,
    FormsModule,
    InputText,
    Button,
    Skeleton,
    Message,
    MarkdownComponent,
    TranslateModule,
  ],
})
export class V3FileViewerComponent implements OnDestroy {
  @Input() idShortPath: string | undefined;
  @Input() submodelId: string | undefined;
  @Input() idShort: string | undefined;
  @Input() aasId: number | undefined;
  @Input() localFiles: FileResult[] = [];

  @Input() fileObj: File | null = null;

  fileData: Blob | null = null;
  fileUrl: SafeResourceUrl | null = null;
  loading = false;
  FilenameHelper = FilenameHelper;
  treeFile: TreeNode[] = [];
  loadError: boolean = false;
  xmlString: string | undefined;
  showPreview = false;

  translate = inject(TranslateService);
  subscriptions: Subscription[] = [];

  currentLang = 'de';
  viewerStore = inject(ViewerStoreService);

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private zipViewerService: ZipViewerService,
  ) {
    this.subscriptions.push(
      this.translate.onLangChange.subscribe((event) => {
        this.currentLang = event.lang;
      }),
    );
    this.currentLang = this.translate.currentLang;
  }

  async togglePreview() {
    this.showPreview = !this.showPreview;
    const filePath = this.fileObj?.value;
    if (this.showPreview && this.fileUrl == null) {
      if (filePath != null && filePath.startsWith('http')) {
        this.fileUrl = filePath;
      } else if (filePath != null) {
        if (FilenameHelper.isPreviewable(filePath)) {
          try {
            this.loading = true;
            const loaded = await this.getFile();
            if (loaded != null) {
              if (loaded instanceof Blob) {
                this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(loaded));

                if (FilenameHelper.isXmlType(filePath)) {
                  this.xmlString = await loaded.text();
                }
              } else {
                this.fileUrl = loaded;
              }
            }
          } finally {
            this.loading = false;
          }
        }
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  getLabel(element: ISubmodelElement) {
    return SubmodelElementUtil.getLabel(element, this.currentLang);
  }

  async getFile() {
    if (this.fileObj == null) {
      return null;
    }

    const filePath = this.fileObj.value;
    const loadedImage = this.viewerStore
      .currentlyloadedFiles()
      .find((f) => f.submodelId === this.viewerStore.currentSubmodelId() && f.idShortPath === this.idShortPath);
    if (loadedImage?.blob != null) {
      return loadedImage.blob;
    } else {
      if (filePath != null) {
        if (filePath.startsWith('http')) {
          return filePath;
        } else {
          try {
            const url =
              (await this.viewerStore.currentSmUrl()) +
              `/submodel-elements/${encodeURIComponent(this.idShortPath ?? '')}/attachment`;
            const response = await lastValueFrom(
              this.http.get<any>(url, {
                responseType: 'blob' as any,
                observe: 'response',
                headers: this.viewerStore.headers(),
              }),
            );
            let blob: Blob | null = null;
            if (FilenameHelper.isPdf(filePath)) {
              blob = new Blob([response.body], { type: 'application/pdf' });
            } else {
              blob = response.body;
            }

            if (blob != null) {
              this.viewerStore.addFileToCurrentlyLoadedFiles({
                submodelId: this.viewerStore.currentSubmodelId(),
                idShortPath: this.idShortPath ?? '',
                path: filePath,
                blob: blob,
              });
            }

            return blob;
          } catch {
            return null;
          }
        }
      }
      return null;
    }
  }

  objectLoadError() {
    this.loadError = true;
  }
}
