import { Component, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { DialogService, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { AasViewerStandaloneComponent } from '../aas-viewer-standalone/aas-viewer-standalone.component';
import { claimOpenViewerEvent } from '../aas-viewer-dialog.config';

@Component({
  selector: 'aas-viewer-main',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './aas-viewer-main.component.html',
})
export class AasViewerMainComponent {
  ref: DynamicDialogRef | undefined | null;

  constructor(private dialogService: DialogService) {}

  @HostListener('window:openViewer', ['$event'])
  openViewer(event: Event) {
    this.ref = this.dialogService.open(AasViewerStandaloneComponent, claimOpenViewerEvent(event));
  }
}
