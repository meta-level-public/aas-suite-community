import { HelpLabelComponent } from '@aas/common-components';
import { NotificationService } from '@aas/common-services';
import { TagHelper } from '@aas/helpers';
import { Clipboard } from '@angular/cdk/clipboard';
import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { Button } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { lastValueFrom } from 'rxjs';
import { ViewerStoreService } from '../viewer-store.service';
import { FramedQrCodeComponent } from './framed-qr-code/framed-qr-code.component';

@Component({
  selector: 'aas-aas-metadata-viewer',
  templateUrl: './aas-metadata-viewer.component.html',
  imports: [
    TableModule,
    Tag,
    FramedQrCodeComponent,
    Button,
    Tabs,
    TabList,
    Ripple,
    Tab,
    TabPanels,
    TabPanel,
    Button,
    NgxJsonViewerModule,
    AsyncPipe,
    TranslateModule,
    InputGroup,
    InputGroupAddon,
    InputText,
    HelpLabelComponent,
  ],
})
export class AasMetadataViewerComponent implements OnChanges {
  viewerStore = inject(ViewerStoreService);

  @Input({ required: true }) selectedViewMode: string = 'formatted';
  @Output() viewerOptions: EventEmitter<{ label: string; value: string }[]> = new EventEmitter<
    { label: string; value: string }[]
  >();
  sanitizer = inject(DomSanitizer);
  thumbnailLoadError = signal(false);

  constructor(
    private clipboard: Clipboard,
    private notificationService: NotificationService,
    private http: HttpClient,
  ) {}

  async ngOnChanges() {
    this.thumbnailLoadError.set(false);
    this.viewerOptions.emit([
      { label: 'FORMATTED_VIEW', value: 'formatted' },
      { label: 'JSON_VIEW', value: 'json' },
    ]);
  }

  onMetadataThumbnailError() {
    this.thumbnailLoadError.set(true);
  }

  onMetadataThumbnailLoad() {
    this.thumbnailLoadError.set(false);
  }

  typeTag = computed(() => {
    const aas = this.viewerStore.aas();
    if (aas == null) return undefined;
    return TagHelper.getAasTypeTag(aas);
  });

  typeTagSeverity = computed(() => {
    const aas = this.viewerStore.aas();
    if (aas == null) return undefined;
    return TagHelper.getAasTypeTagSeverity(aas);
  });

  displayAasUrl = computed(() => {
    const aasUrl = this.viewerStore.aasUrl();
    if (aasUrl == null) return '';
    return aasUrl.split('?target=')[1];
  });

  copyText(text: string) {
    this.clipboard.copy(text);
    this.notificationService.showMessageAlways('COPIED', 'SUCCESS', 'success', false);
  }

  shellString = computed(() => {
    const aas = this.viewerStore.aas();

    if (aas == null) return '';
    return JSON.stringify(aas, null, 2);
  });

  async copyToClipboard() {
    this.clipboard.copy(this.shellString());
    this.notificationService.showMessageAlways('LINK_COPIED', 'SUCCESS', 'success', false);
  }

  thumbnail = computed(async () => {
    const aas = this.viewerStore.aas();
    if (aas?.assetInformation.defaultThumbnail?.path.startsWith('http')) {
      return aas.assetInformation.defaultThumbnail?.path;
    } else {
      try {
        const url = this.viewerStore.aasUrl() + '/asset-information/thumbnail';
        const thumb = await lastValueFrom(
          this.http.get<Blob>(url, {
            responseType: 'blob' as 'json',
            headers: this.viewerStore.headers(),
          }),
        );
        return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(thumb));
      } catch {
        return null;
      }
    }
  });

  thumbFileName = computed(() => {
    const aas = this.viewerStore.aas();
    if (aas != null) {
      return aas.assetInformation.defaultThumbnail?.path.split('/').pop();
    } else {
      return 'thumbnail.png';
    }
  });
}
