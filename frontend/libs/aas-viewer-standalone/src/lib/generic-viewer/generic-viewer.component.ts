import { InstanceHelper } from '@aas/helpers';
import { Component, effect, ElementRef, inject, Input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BlobViewerComponent } from '../blob-viewer/blob-viewer.component';
import { CapabilityELementViewerComponent } from '../capability-element-viewer/capability-element-viewer.component';
import { EntityViewerComponent } from '../entity-viewer/entity-viewer.component';
import { V3FileViewerComponent } from '../file-viewer/file-viewer.component';
import { MultilanguagePropertyViewerComponent } from '../multilanguage-property-viewer/multilanguage-property-viewer.component';
import { OperationViewerComponent } from '../operation-viewer/operation-viewer.component';
import { PropertyViewerComponent } from '../property-viewer/property-viewer.component';
import { RangeViewerComponent } from '../range-viewer/range-viewer.component';
import { ReferenceElementComponent } from '../reference-element/reference-element.component';
import { RelationshipViewerComponent } from '../relationship-viewer/relationship-viewer.component';
import { SmcViewerComponent } from '../smc-viewer/smc-viewer.component';
import { SubmodelElementsListComponent } from '../submodel-elements-list/submodel-elements-list.component';
import { ViewerStoreService } from '../viewer-store.service';

@Component({
  selector: 'aas-generic-viewer',
  templateUrl: './generic-viewer.component.html',
  styles: [
    `
      :host .highlight-hit {
        outline: 2px solid var(--primary-color);
        background: color-mix(in srgb, var(--p-yellow-200) 42%, transparent);
        border-radius: var(--aas-radius-xs);
      }
    `,
  ],
  imports: [
    PropertyViewerComponent,
    MultilanguagePropertyViewerComponent,
    SmcViewerComponent,
    SubmodelElementsListComponent,
    V3FileViewerComponent,
    EntityViewerComponent,
    OperationViewerComponent,
    RelationshipViewerComponent,
    ReferenceElementComponent,
    CapabilityELementViewerComponent,
    RangeViewerComponent,
    BlobViewerComponent,
    TranslateModule,
  ],
})
export class GenericViewerComponent {
  @Input({ required: true }) rowData: any;
  @Input({ required: true }) idShortPath: string = '';
  @Input({ required: true }) submodelId: string = '';
  @Input() formatted: boolean = false;
  @Input() fallbackLabel: string = '';
  isHighlighted = signal(false);

  private viewerStore = inject(ViewerStoreService);
  private elRef = inject(ElementRef<HTMLElement>);

  // Observe global highlight target and, if this element matches, scroll and highlight briefly
  private _highlightEffect = effect(() => {
    const target = this.viewerStore.highlightedIdShortPath();
    const mine = this.idShortPath;
    if (!target || !mine) return;
    if (target === mine) {
      // scroll this element into view and apply highlight
      queueMicrotask(() => {
        try {
          this.elRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        } catch {
          // Ignore scroll errors
        }
        this.isHighlighted.set(true);
        setTimeout(() => {
          this.isHighlighted.set(false);
          // clear target so re-selecting can trigger again
          this.viewerStore.highlightedIdShortPath.set('');
        }, 2000);
      });
    }
  });

  get modelType(): string {
    return InstanceHelper.getInstanceName(this.rowData);
  }
}
