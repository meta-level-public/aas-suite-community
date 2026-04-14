import { DateProxyPipe } from '@aas/common-pipes';
import { HelpLabelComponent } from '@aas/common-components';
import { NotificationService } from '@aas/common-services';
import { Component, computed, inject, OnInit, ViewChild } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { FileUpload } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { EclassCertificate } from '@aas-designer-model';
import { PortalService } from '@aas/common-services';
import { EclassImportQueuedItem } from '../model/eclass-import-queued-item';
import { OrganisationStateService } from '../organisation-state.service';
import { OrganisationService } from '../organisation.service';

@Component({
  selector: 'aas-eclass-details',
  templateUrl: './eclass-details.component.html',
  imports: [
    Tabs,
    TabList,
    Ripple,
    Tab,
    TabPanels,
    TabPanel,
    Button,
    FileUpload,
    TableModule,
    TranslateModule,
    DateProxyPipe,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    HelpLabelComponent,
  ],
})
export class EclassDetailsComponent implements OnInit {
  orgaStateService = inject(OrganisationStateService);
  ownedEclassData = computed(() => this.orgaStateService.organisation()?.ownedEclassData ?? []);
  eclass: EclassCertificate | undefined;
  loading = false;
  @ViewChild('uploader') uploader?: FileUpload;
  @ViewChild('uploaderKatalog') uploaderKatalog?: FileUpload;
  importQueue: EclassImportQueuedItem[] = [];

  constructor(
    private organisationService: OrganisationService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService,
    private notificationService: NotificationService,
    private portalService: PortalService,
  ) {}

  ngOnInit() {
    this.getEclassCert();
    this.checkPendingImport();
  }

  async onFileChange(event: any) {
    if (!event.currentFiles[0] || event.currentFiles[0].length === 0) {
      return;
    }

    const mimeType = event.currentFiles[0].type;
    if (mimeType.match(/application\/x-pkcs12/) == null) {
      return;
    }
    const file: File = event.currentFiles[0];

    try {
      this.loading = true;
      const response = await this.organisationService.uploadEclassCertificate(file);
      if (response) {
        this.notificationService.showMessageAlways('ECLASS_SUCCESS_UPLOAD', 'SUCCESS', 'success', false);
        this.getEclassCert();
      } else {
        this.notificationService.showMessageAlways('COMMON_ERROR', 'ERROR', 'error', false);
      }
    } finally {
      this.loading = false;
    }
  }

  async onFileChangeKatalog(event: any) {
    if (!event.currentFiles[0] || event.currentFiles[0].length === 0) {
      return;
    }

    const file: File = event.currentFiles[0];

    try {
      this.loading = true;
      const response = await this.organisationService.uploadEclassKatalog(file);
      if (response) {
        this.notificationService.showMessageAlways('ECLASS_IMPORT_QUEUED', 'SUCCESS', 'success', false);
        this.checkPendingImport();
        this.uploaderKatalog?.clear();
      } else {
        this.notificationService.showMessageAlways('COMMON_ERROR', 'ERROR', 'error', false);
      }
    } finally {
      this.loading = false;
    }
  }

  async getEclassCert() {
    try {
      this.loading = true;
      this.eclass = await this.organisationService.getEclassCertificate();
    } finally {
      this.loading = false;
    }
  }

  async getEclassImport() {
    try {
      this.loading = true;
      await this.orgaStateService.loadOrganisation();
    } finally {
      this.loading = false;
    }
  }

  removeEclassCert() {
    this.confirmationService.confirm({
      message: this.translate.instant('CONFIRM_DELETE_ECLASS_CERTIFICATION'),
      accept: async () => {
        try {
          this.loading = true;
          const result = await this.organisationService.deleteEclassCertificate();
          if (result) {
            this.notificationService.showMessageAlways('ECLASS_SUCCESS_DELETE', 'SUCCESS', 'success', false);
            this.getEclassCert();
          } else {
            this.notificationService.showMessageAlways('COMMON_ERROR', 'ERROR', 'error', false);
          }
        } finally {
          this.loading = false;
          this.uploader?.clear();
        }
      },
    });
  }

  onError() {
    this.uploader?.clear();
    this.uploaderKatalog?.clear();
    this.loading = false;
  }

  get validTo() {
    if (this.eclass?.validTo != null) return new Date(this.eclass.validTo);
    else return null;
  }
  get validFrom() {
    if (this.eclass?.validTo != null) return new Date(this.eclass.validFrom);
    else return null;
  }

  async checkPendingImport() {
    this.importQueue = await this.organisationService.checkPendingImport();
  }

  async deletePendingItem(id: number) {
    this.importQueue = await this.organisationService.deletePendingItem(id);
  }

  get hasPendingImports() {
    return this.importQueue.length > 0;
  }
}
