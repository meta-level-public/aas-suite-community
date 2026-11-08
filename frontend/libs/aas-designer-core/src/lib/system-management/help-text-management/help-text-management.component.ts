import { HelpLabelComponent } from '@aas/common-components';
import { NotificationService } from '@aas/common-services';
import { HelpInfoDto, HelpUpdate, SystemManagementClient } from '@aas/webapi-client';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { Optimus } from '@openng/optimus-ui/config';
import { FileUploadModule } from '@openng/optimus-ui/fileupload';
import { InputGroupModule } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddonModule } from '@openng/optimus-ui/inputgroupaddon';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { TableModule } from '@openng/optimus-ui/table';
import { ToolbarModule } from '@openng/optimus-ui/toolbar';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'aas-help-text-management',
  imports: [
    TranslateModule,
    TableModule,
    ButtonModule,
    FileUploadModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    HelpLabelComponent,
    ToolbarModule,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './help-text-management.component.html',
})
export class HelpTextManagementComponent implements OnInit {
  systemManagementClient = inject(SystemManagementClient);

  helpInfo = signal<HelpInfoDto | null>(null);
  uploadMode = signal(false);
  selectedFile: File | null = null;
  loading = signal(false);
  config = inject(Optimus);
  fileAsBase64: string | null = null;
  notificationService = inject(NotificationService);

  ngOnInit() {
    this.loadHelpInfo();
  }

  async loadHelpInfo() {
    this.helpInfo.set(await lastValueFrom(this.systemManagementClient.systemManagement_GetHelpInfo()));
  }

  choose(_event: any, callback: any) {
    callback();
  }

  formatSize(bytes: any) {
    const k = 1024;
    const dm = 3;
    const sizes = this.config.translation.fileSizeTypes ?? [];
    if (bytes === 0) {
      return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
  }
  onRemoveTemplatingFile(event: any, _file: any, removeFileCallback: any, index: any) {
    removeFileCallback(event, index);
    // this.totalSize -= parseInt(this.formatSize(file.size));
    // this.totalSizePercent = this.totalSize / 10;
  }

  selectFile(event: any) {
    this.selectedFile = event.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(event.files[0]);
    reader.onloadend = () => {
      const base64data = reader.result;
      this.fileAsBase64 = base64data as string;
    };
  }

  async doUpload() {
    if (this.selectedFile && this.fileAsBase64) {
      try {
        this.loading.set(true);

        const helpUpdate = new HelpUpdate();
        helpUpdate.fileAsBase64 = this.fileAsBase64;

        const res = await lastValueFrom(this.systemManagementClient.systemManagement_ImportHelpTexts(helpUpdate));
        if (res) this.loadHelpInfo();
      } finally {
        this.loading.set(false);
      }
    }
  }

  async downloadHelpTexts() {
    try {
      this.loading.set(true);

      const res = await lastValueFrom(this.systemManagementClient.systemManagement_ExportHelpTexts());

      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(res.data);
      a.href = objectUrl;

      a.download = res.fileName ?? 'export-help-text.zip';
      a.click();
      URL.revokeObjectURL(objectUrl);
    } finally {
      this.loading.set(false);
    }
  }
}
