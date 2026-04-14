import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { NotificationService } from '@aas/common-services';
import { Clipboard } from '@angular/cdk/clipboard';
import { Component, computed, EventEmitter, inject, Input, OnChanges, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Ripple } from 'primeng/ripple';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { GenericViewerComponent } from '../generic-viewer/generic-viewer.component';
import { SubmodelSpecializedViewerComponent } from '../submodel-specialized-viewer/submodel-specialized-viewer.component';
import { ViewerStoreService } from '../viewer-store.service';

@Component({
  selector: 'aas-aas-model-viewer',
  templateUrl: './aas-model-viewer.component.html',
  imports: [
    SubmodelSpecializedViewerComponent,
    Card,
    GenericViewerComponent,
    Tabs,
    TabList,
    Ripple,
    Tab,
    TabPanels,
    TabPanel,
    Button,
    NgxJsonViewerModule,
    TranslateModule,
  ],
})
export class AasModelViewerComponent implements OnChanges {
  viewerStore = inject(ViewerStoreService);

  @Input({ required: true }) currentLanguage = 'de';

  @Input() navigateInBom: boolean = true;
  @Input({ required: true }) selectedViewMode: string = 'formatted';
  @Output() viewerOptions: EventEmitter<{ label: string; value: string }[]> = new EventEmitter<
    { label: string; value: string }[]
  >();

  constructor(
    private notificationService: NotificationService,
    private clipboard: Clipboard,
  ) {}

  ngOnChanges() {
    this.viewerOptions.emit([
      { label: 'FORMATTED_VIEW', value: 'formatted' },
      { label: 'PLAIN_VIEW', value: 'plain' },
      { label: 'JSON_VIEW', value: 'json' },
    ]);
  }

  submodelString = computed(() => {
    const sm = this.viewerStore.currentSubmodel();
    if (sm == null) return '';
    return JSON.stringify(aas.jsonization.toJsonable(sm), null, 2);
  });

  async copyToClipboard() {
    this.clipboard.copy(this.submodelString());
    this.notificationService.showMessageAlways('LINK_COPIED', 'SUCCESS', 'success', false);
  }

  reloadData() {
    this.viewerStore.reloadSubmodel();
  }
}
