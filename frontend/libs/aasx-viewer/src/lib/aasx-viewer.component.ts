import { CURRENT_LANGUAGE_KEY, DEFAULT_LANGUAGE } from '@aas/common-services';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import moment from 'moment';
import { SelectItem } from 'primeng/api';
import { Select, SelectChangeEvent } from 'primeng/select';
import { AasxViewerService } from './aasx-viewer.service';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Card } from 'primeng/card';
import { Image } from 'primeng/image';
import { Listbox } from 'primeng/listbox';
import { ScrollTop } from 'primeng/scrolltop';
import { Skeleton } from 'primeng/skeleton';
import { AasxModelViewerComponent } from './aasx-model-viewer/aasx-model-viewer.component';

@Component({
  selector: 'aas-aasx-viewer',
  templateUrl: './aasx-viewer.component.html',
  imports: [Select, Card, Image, Skeleton, Listbox, FormsModule, AasxModelViewerComponent, ScrollTop, TranslateModule],
})
export class AasxViewerComponent implements OnChanges, OnInit {
  @Input() aasStructure: any;
  @Input() currentLanguage = DEFAULT_LANGUAGE;
  @Input() apiUrl = '/api';
  @Input() aasId = 0;
  shells: SelectItem[] = [];
  submodels: any[] = [];
  isThumbLoading = false;
  isThumbLoaded = false;
  fileData: Blob | null = null;
  fileUrl: SafeResourceUrl | null = null;
  selectedShell: any;
  selectedModel: any;
  loading = false;

  constructor(
    private viewerService: AasxViewerService,
    private sanitizer: DomSanitizer,
  ) {}

  init() {
    this.shells = [];
    this.submodels = [];
    this.selectedModel = null;

    if (this.aasStructure != null && this.aasStructure.assetAdministrationShells != null) {
      for (const shell of this.aasStructure.assetAdministrationShells) {
        this.shells.push({ label: shell.idShort, value: shell });
      }
      if (this.shells.length > 0) {
        // prüfen ob wir das nameplate finden können
        this.selectedShell = this.shells[0].value;
      }

      this.initSubmodelList(this.selectedShell);
    }

    try {
      this.loading = true;
      this.isThumbLoaded = false;
      this.isThumbLoading = false;
      this.fileData = null;
      this.fileUrl = null;
      this.getThumbnail();
    } finally {
      this.loading = false;
    }

    const lang = window.localStorage.getItem(CURRENT_LANGUAGE_KEY) ?? this.currentLanguage ?? DEFAULT_LANGUAGE;

    switch (lang.toLowerCase()) {
      case 'de':
        moment.locale('de');
        break;
      case 'en':
      case 'en-us':
        moment.locale('en');
    }
  }

  ngOnInit(): void {
    this.init();
  }

  selectSubmodel(event: SelectChangeEvent) {
    this.initSubmodelList(event.value);
  }

  initSubmodelList(shell: any) {
    this.submodels = [];
    this.selectedModel = null;
    if (shell != null && shell.submodels != null) {
      for (const sm of shell.submodels) {
        const smRef = sm.keys.find((s: any) => s.type === 'Submodel');
        const smKey = smRef.value;
        const submodelElement = this.aasStructure.submodels?.find((s: any) => s.identification.id === smKey);
        if (submodelElement != null) {
          this.submodels.push(submodelElement);
        }
      }

      if (this.submodels.length > 0) {
        const npIndex = this.submodels.findIndex((s: any) => s.idShort === 'Nameplate');
        if (npIndex !== -1) {
          this.selectedModel = this.submodels[npIndex];
        } else {
          this.selectedModel = this.submodels[0];
        }
      }
    }
  }

  async ngOnChanges() {
    this.init();
  }
  async getThumbnail() {
    try {
      this.isThumbLoading = true;
      this.fileData = null;
      this.fileUrl = null;
      this.fileData = await this.viewerService.getThumbFile(this.aasId, this.apiUrl);
      this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.fileData));
      this.isThumbLoaded = true;
    } finally {
      this.isThumbLoading = false;
    }
  }

  displayModel(model: any) {
    this.selectedModel = model;
  }

  get manufacturer() {
    return this.findElementText('ManufacturerName');
  }

  get productDesignation() {
    return this.findElementText('ManufacturerProductDesignation');
  }

  findElementText(type: string) {
    let result = '';
    if (this.aasStructure != null) {
      const nameplate = this.aasStructure?.submodels?.find((sm: any) => sm.idShort === 'Nameplate');
      if (nameplate != null) {
        const el = nameplate.submodelElements?.find((sme: any) => sme.idShort === type)?.value;
        const userLang = this.currentLanguage;

        try {
          const found = el.find((e: any) => e.language.toLowerCase() === userLang.toLowerCase());
          if (found != null) {
            result = found.text;
          }
        } catch {
          if (typeof el === 'string') result = el;
        }
      }
    }
    return result;
  }
}
