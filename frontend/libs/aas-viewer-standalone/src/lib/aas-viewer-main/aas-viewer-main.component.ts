import { Component, HostListener } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AasViewerStandaloneComponent } from '../aas-viewer-standalone/aas-viewer-standalone.component';

@Component({
  selector: 'aas-viewer-main',
  templateUrl: './aas-viewer-main.component.html',
})
export class AasViewerMainComponent {
  ref: DynamicDialogRef | undefined | null;

  constructor(private dialogService: DialogService) {}

  @HostListener('window:openViewer', ['$event'])
  openViewer(event: Event) {
    this.ref = this.dialogService.open(AasViewerStandaloneComponent, {
      header: 'AAS Viewer',
      width: '75%',
      baseZIndex: 10000,
      maximizable: true,
      styleClass: 'viewerDialog',
      data: {
        viewerDescriptor: (event as CustomEvent).detail.viewerDescriptor,
      },
      closable: true,
    });
  }
}
