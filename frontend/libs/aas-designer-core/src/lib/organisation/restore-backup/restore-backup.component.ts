import { AppConfigService, NotificationService } from '@aas/common-services';
import { ApiException } from '@aas/jwt-auth';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { Message } from 'primeng/message';
import { PortalService } from '@aas/common-services';

import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';

@Component({
  selector: 'aas-restore-backup',
  templateUrl: './restore-backup.component.html',
  imports: [Dialog, FileUpload, PrimeTemplate, Message, ProgressBar, Button, TranslateModule],
})
export class RestoreBackupComponent {
  @Input() dialogVisible: boolean = false;
  @Output() dialogClosed: EventEmitter<void> = new EventEmitter();

  restoreOrgadata = true;
  restoreUsersPackages = true;
  restoreCertificate = true;

  uploadFile: File | null = null;
  importing: boolean = false;
  loading: boolean = false;
  uploadProgress: number = 0;

  constructor(
    private http: HttpClient,
    private portalService: PortalService,
    private translate: TranslateService,
    private notificationService: NotificationService,
    private appConfigService: AppConfigService,
  ) {}

  onSelectFile(event: FileSelectEvent) {
    this.uploadFile = event.files[0];
  }

  onRemoveFile() {
    this.uploadFile = null;
  }

  close() {
    this.dialogVisible = false;
    this.dialogClosed.next();
  }

  async handleUpload(event: { files: File[] }) {
    this.loading = true;
    this.importing = false;
    this.uploadProgress = 0;

    const formData = new FormData();
    formData.append('file', event.files[0], event.files[0].name);

    const headers = new HttpHeaders().append('ignoreContentType', 'true');

    this.http
      .post<number>(`${this.appConfigService.config.apiPath}/Backup/RestoreOrga`, formData, {
        headers,
        reportProgress: true,
        observe: 'events',
      })
      .subscribe({
        next: (progressEvent: any) => this.handleUploadProgress(progressEvent),
        error: (err: any) => this.handleError(err),
      });
  }

  handleUploadProgress(progressEvent: any) {
    if (progressEvent.type === HttpEventType.UploadProgress) {
      this.uploadProgress = Math.round((100 * progressEvent.loaded) / progressEvent.total);
      if (this.uploadProgress === 100) this.importing = true;
    }

    if (progressEvent.type === HttpEventType.Response) {
      this.loading = true;
      this.notificationService.showMessageAlways('BACKUP_SUCCESSFULLY_RESTORED', 'SUCCESS', 'success', true);
      this.portalService.logout(true);

      this.resetLoading();
    }
  }

  handleError(err: any) {
    this.resetLoading();

    this.close();

    if (err instanceof ApiException && err.exceptionType === 'RestoreFailedException') {
      err.title = this.translate.instant('RESTORE_FAILED');
      Object.assign(err, {
        message: this.translate.instant(err.message, { exDetail: err.message }),
      });
      throw err;
    } else {
      throw err;
    }
  }

  resetLoading() {
    this.loading = false;
    this.importing = false;
  }
}
