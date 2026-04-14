import {
  Component,
  computed,
  effect,
  HostListener,
  inject,
  input,
  Input,
  OnChanges,
  OnInit,
  Optional,
  signal,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { NotificationService } from '@aas/common-services';
import { TagHelper } from '@aas/helpers';
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';

import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { ViewerDescriptor } from '@aas/webapi-client';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ScrollTop } from 'primeng/scrolltop';
import { SelectButton } from 'primeng/selectbutton';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { lastValueFrom } from 'rxjs';
import { AasMetadataViewerComponent } from '../aas-metadata-viewer/aas-metadata-viewer.component';
import { AasModelViewerComponent } from '../aas-model-viewer/aas-model-viewer.component';
import { SearchInAasDialogComponent } from '../search/search-in-aas-dialog.component';
import { ViewerStoreService } from '../viewer-store.service';

@Component({
  selector: 'aas-aas-viewer-standalone',
  templateUrl: './aas-viewer-standalone.component.html',
  providers: [DialogService],
  host: { class: 'block w-full' },
  imports: [
    Button,
    SelectButton,
    FormsModule,
    Card,
    Skeleton,
    Tag,
    AasModelViewerComponent,
    AasMetadataViewerComponent,
    ScrollTop,
    AsyncPipe,
    TranslateModule,
    Tooltip,
  ],
})
export class AasViewerStandaloneComponent implements OnChanges, OnInit {
  @Input() currentLanguage = 'de';

  @Input({ required: true }) viewerDescriptor: ViewerDescriptor | null = null;

  apiKey = input('');

  viewMetadata = signal(false);
  viewSubmodels = signal(true);

  viewModeOptions: { label: string; value: string }[] = [];
  selectedViewMode: string = 'formatted';
  ref: DynamicDialogRef | undefined | null;

  constructor(
    private sanitizer: DomSanitizer,
    private clipboard: Clipboard,
    private notificationService: NotificationService,
    private http: HttpClient,
    private dialogService: DialogService,
    @Optional() private config: DynamicDialogConfig | null,
    private translate: TranslateService,
  ) {
    if (this.config?.data != null) {
      this.viewerDescriptor = this.config.data.viewerDescriptor;
      this.init();
    }
  }

  viewerStore = inject(ViewerStoreService);
  thumbnailLoadError = signal(false);

  ngOnInit(): void {
    // no-op
  }

  async ngOnChanges() {
    this.init();
  }

  async init() {
    this.viewerStore.apiKey.set(this.apiKey());
    this.viewerStore.viewerDescriptor.set(this.viewerDescriptor);
    this.thumbnailLoadError.set(false);
  }

  onOverviewThumbnailError() {
    this.thumbnailLoadError.set(true);
  }

  onOverviewThumbnailLoad() {
    this.thumbnailLoadError.set(false);
  }

  async reloadSubmodel() {
    this.viewerStore.reloadSubmodel();
  }

  convertStringToSubmodel(text: string) {
    const jsonable = JSON.parse(text);

    const instanceOrError = aas.jsonization.submodelFromJsonable(jsonable);
    if (instanceOrError.error != null) {
      // eslint-disable-next-line no-console
      console.log('De-serialization failed: ' + `${instanceOrError.error.path}: ` + `${instanceOrError.error.message}`);
    }

    return instanceOrError.value;
  }

  thumbnail = computed(async () => {
    const loadedThumb = this.viewerStore
      .currentlyloadedFiles()
      .find((f) => f.submodelId === 'thumbnail' && f.idShortPath === 'thumbnail');
    if (loadedThumb != null) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(loadedThumb.blob));
    }

    const shell = this.viewerStore.aas();
    if (
      shell != null &&
      shell.assetInformation.defaultThumbnail?.path != null &&
      shell.assetInformation.defaultThumbnail?.path !== ''
    ) {
      if (shell?.assetInformation.defaultThumbnail?.path.startsWith('http')) {
        return shell.assetInformation.defaultThumbnail?.path;
      } else {
        try {
          const url = this.viewerStore.aasUrl() + '/asset-information/thumbnail';
          const thumb = await lastValueFrom(
            this.http.get<Blob>(url, {
              responseType: 'blob' as 'json',
              headers: this.viewerStore.headers(),
            }),
          );

          this.viewerStore.addFileToCurrentlyLoadedFiles({
            submodelId: 'thumbnail',
            idShortPath: 'thumbnail',
            path: shell.assetInformation.defaultThumbnail?.path ?? 'thumbnail',
            blob: thumb,
          });

          return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(thumb));
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  get manufacturer() {
    return this.findElementText('ManufacturerName');
  }

  globalAssetId = computed(() => {
    const shell = this.viewerStore.aas();
    return shell?.assetInformation.globalAssetId;
  });

  async copyGlobalAssetId() {
    const globalAssetId = this.globalAssetId();
    if (globalAssetId != null) {
      this.clipboard.copy(globalAssetId);
      this.notificationService.showMessageAlways('COPIED', 'SUCCESS', 'success', false);
    }
  }

  get productDesignation() {
    return this.findElementText('ManufacturerProductDesignation');
  }

  findElementText(_type: string) {
    const result = '';
    // if (this.shellEnvironment != null) {
    //   const nameplate = this.shell?.submodels?.find((sm: any) => sm.idShort === 'Nameplate');
    //   if (nameplate != null) {
    //     const el = (
    //       nameplate.submodelElements?.find((sme: any) => sme.idShort?.toLowerCase() === type.toLowerCase()) as any
    //     )?.value;
    //     const userLang = this.currentLanguage;

    //     try {
    //       const found = el.find((e: any) => e.language.toLowerCase() === userLang.toLowerCase());
    //       if (found != null) {
    //         result = found.text;
    //       } else {
    //         result = el[0].text;
    //       }
    //     } catch {
    //       if (typeof el === 'string') result = el;
    //     }
    //   }
    // }
    return result;
  }

  typeTag = computed(() => {
    const shell = this.viewerStore.aas();
    if (shell == null) return undefined;
    return TagHelper.getAasTypeTag(shell);
  });

  typeTagSeverity = computed(() => {
    const shell = this.viewerStore.aas();
    if (shell == null) return 'secondary';
    return TagHelper.getAasTypeTagSeverity(shell);
  });

  lowerize = (obj: any) =>
    Object.keys(obj).reduce((acc: any, k) => {
      acc[k.toLowerCase()] = obj[k];
      return acc;
    }, {});

  @HostListener('window:openViewer', ['$event'])
  openViewer(event: Event) {
    this.ref = this.dialogService.open(AasViewerStandaloneComponent, {
      header: 'AAS Viewer',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: {
        viewerDescriptor: (event as CustomEvent).detail.viewerDescriptor,
      },
    });
  }

  smLoadedEffect = effect(() => {
    const sms = this.viewerStore.submodels();

    // Ensure at least one item is selected (preferably Nameplate, otherwise first submodel)
    const currentId = this.viewerStore.currentSubmodelId();
    const hasCurrentSubmodel = sms.find((sm) => sm.id === currentId);

    if (!hasCurrentSubmodel) {
      const np = sms.find((sm) => sm.idShort.includes('Nameplate'));
      if (np != null) {
        this.selectSubmodel(np.id);
      } else if (sms.length > 0) {
        this.selectSubmodel(sms[0].id);
      }
    }
  });

  setSelectedViewMode(event: { label: string; value: string }[]) {
    setTimeout(() => (this.viewModeOptions = event));
  }

  selectSubmodel(submodelId: string) {
    this.viewerStore.currentSubmodelId.set(submodelId);
    this.selectedViewMode = this.viewModeOptions[0]?.value ?? 'formatted';
    this.viewMetadata.set(false);
    this.viewSubmodels.set(true);
  }

  selectMetadata() {
    this.selectedViewMode = this.viewModeOptions[0]?.value ?? 'formatted';
    this.viewMetadata.set(true);
    this.viewSubmodels.set(false);
  }

  viewMetadataSelected() {
    this.selectMetadata();
  }

  viewSubmodelsSelected() {
    this.selectedViewMode = this.viewModeOptions[0]?.value ?? 'formatted';
    this.viewMetadata.set(false);
    this.viewSubmodels.set(true);
  }

  openSearch() {
    this.ref = this.dialogService.open(SearchInAasDialogComponent, {
      header: this.translate.instant('SEARCH_IN_AAS'),
      width: '70%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: {},
      resizable: true,
      draggable: true,
    });
  }

  clearHighlight() {
    this.viewerStore.highlightedIdShortPath.set('');
    this.viewerStore.highlightedTextQuery.set('');
  }
}
