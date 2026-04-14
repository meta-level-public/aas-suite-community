import { Component, inject, signal } from '@angular/core';

import { HelpLabelComponent } from '@aas/common-components';
import { NotificationService } from '@aas/common-services';
import { ShellExportOptions, ShellsClient, SubmodelMetadata } from '@aas/webapi-client';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'aas-aasx-export',
  templateUrl: './aasx-export.component.html',
  imports: [
    FormsModule,
    DialogModule,
    ButtonModule,
    PickListModule,
    TranslateModule,
    ProgressBarModule,
    SelectButtonModule,
    HelpLabelComponent,
  ],
})
export class AasxExportComponent {
  availableSubmodels = signal<SubmodelMetadata[]>([]);
  private _selectedSubmodels = signal<SubmodelMetadata[]>([]);

  get selectedSubmodels(): SubmodelMetadata[] {
    return this._selectedSubmodels();
  }

  set selectedSubmodels(value: SubmodelMetadata[]) {
    this._selectedSubmodels.set(value);
  }

  get hasSelectedSubmodels(): boolean {
    return this._selectedSubmodels().length > 0;
  }

  loading = signal<boolean>(false);

  onMoveToTarget(event: { items: SubmodelMetadata[] }) {
    this._selectedSubmodels.set([...this._selectedSubmodels(), ...event.items]);
  }

  onMoveToSource(event: { items: SubmodelMetadata[] }) {
    const itemsToRemove = new Set(event.items);
    this._selectedSubmodels.set(this._selectedSubmodels().filter((item) => !itemsToRemove.has(item)));
  }

  onMoveAllToTarget(event: { items: SubmodelMetadata[] }) {
    this._selectedSubmodels.set(event.items);
  }

  onMoveAllToSource() {
    this._selectedSubmodels.set([]);
  }
  notificationService = inject(NotificationService);

  exportMode: 'XML' | 'JSON' = 'XML';
  metamodelVersion: '3.1' | '3.0' = '3.1';
  displayExportDialog: boolean = false;

  shellsClient = inject(ShellsClient);
  aasIdentifier = '';
  fallbackFilename: string = 'export.aasx';

  async startExport(id: string, idShort: string) {
    try {
      this.loading.set(true);
      this.aasIdentifier = id ?? '';
      this.fallbackFilename = (idShort !== '' ? idShort : 'export') + '.aasx';
      const res = await lastValueFrom(this.shellsClient.shells_GetContainedSubmdels(this.aasIdentifier));
      this.availableSubmodels.set(res.containedSubmodels ?? []);
      this._selectedSubmodels.set([]);
    } finally {
      this.loading.set(false);
    }

    this.displayExportDialog = true;
  }

  async doExport() {
    try {
      this.loading.set(true);
      const opts = new ShellExportOptions();
      opts.aasIdentifier = this.aasIdentifier;
      opts.submodelIds = this._selectedSubmodels()
        .filter((s) => s.id != null)
        .map((s) => s.id) as string[];
      opts.exportMode = this.exportMode;
      opts.metamodelVersion = this.metamodelVersion;

      const res = await lastValueFrom(this.shellsClient.shells_ExportAasx(opts));

      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(res.data);
      a.href = objectUrl;

      a.download = res.fileName !== 'export.aasx' ? (res.fileName ?? this.fallbackFilename) : this.fallbackFilename;
      a.click();
      URL.revokeObjectURL(objectUrl);
      this.displayExportDialog = false;
    } finally {
      this.loading.set(false);
    }
  }
}
