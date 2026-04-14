import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SubmodelElementCollection } from '@aas-core-works/aas-core3.1-typescript/types';
import { Component, Input, OnChanges, effect, inject, signal } from '@angular/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Card } from 'primeng/card';
import { Ripple } from 'primeng/ripple';
import { ViewerStoreService } from '../../viewer-store.service';
import { PcfElementComponent } from './pcf-element/pcf-element.component';

import { TranslateModule } from '@ngx-translate/core';
import { PcfMapOverviewComponent } from './pcf-map-overview/pcf-map-overview.component';
import { TcfElementComponent } from './tcf-element/tcf-element.component';

@Component({
  selector: 'aas-pcf-viewer',
  templateUrl: './pcf-viewer.component.html',
  imports: [
    Card,
    Accordion,
    AccordionPanel,
    Ripple,
    AccordionHeader,
    AccordionContent,
    PcfElementComponent,
    TcfElementComponent,
    PcfMapOverviewComponent,
    TranslateModule,
  ],
})
export class PcfViewerComponent implements OnChanges {
  @Input({ required: true }) pcfModel: aas.types.Submodel | undefined;

  pcfList: aas.types.SubmodelElementCollection[] = [];
  tcfList: aas.types.SubmodelElementCollection[] = [];

  groupedPcfLists: { name: string; pcfs: aas.types.SubmodelElementCollection[] }[] = [];
  groupedTcfLists: { name: string; tcfs: aas.types.SubmodelElementCollection[] }[] = [];

  // Accordion expansion state
  expandedPcfPanels = signal<string[]>([]);
  expandedTcfPanels = signal<string[]>([]);
  expandedPcfGroupPanels = signal<Record<string, string[]>>({});

  private viewerStore = inject(ViewerStoreService);

  constructor() {
    // React to highlighted path to open the relevant PCF/TCF accordions
    effect(() => {
      const target = this.viewerStore.highlightedIdShortPath();
      if (!target) return;
      this.expandForTarget(target);
    });
  }

  ngOnChanges() {
    this.pcfList = this.pcfModel?.submodelElements?.filter(
      (el) =>
        this.hasSemanticId(el, '0173-1#01-AHE716#001') ||
        this.hasSemanticId(el, 'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprint/0/9'),
    ) as aas.types.SubmodelElementCollection[];

    this.tcfList = this.pcfModel?.submodelElements?.filter(
      (el) =>
        this.hasSemanticId(el, '0173-1#01-AHE717#001') ||
        this.hasSemanticId(el, 'https://admin-shell.io/idta/CarbonFootprint/TransportCarbonFootprint/0/9'),
    ) as aas.types.SubmodelElementCollection[];

    const collections = this.pcfModel?.submodelElements?.filter(
      (el) =>
        !this.hasSemanticId(el, '0173-1#01-AHE716#001') &&
        !this.hasSemanticId(el, 'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprint/0/9') &&
        !this.hasSemanticId(el, '0173-1#01-AHE717#001') &&
        !this.hasSemanticId(el, 'https://admin-shell.io/idta/CarbonFootprint/TransportCarbonFootprint/0/9'),
    ) as aas.types.SubmodelElementCollection[];

    collections?.forEach((collection: aas.types.SubmodelElementCollection) => {
      collection.value?.forEach((el) => {
        if (el instanceof SubmodelElementCollection) {
          if (
            this.hasSemanticId(el, '0173-1#01-AHE716#001') ||
            this.hasSemanticId(el, 'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprint/0/9')
          ) {
            // es ist ein PCF
            if (this.groupedPcfLists.find((x) => x.name === collection.idShort)) {
              this.groupedPcfLists.find((x) => x.name === collection.idShort)?.pcfs.push(el);
            } else {
              this.groupedPcfLists.push({
                name: collection.idShort ?? '',
                pcfs: [el],
              });
            }
          }
          if (
            this.hasSemanticId(el, '0173-1#01-AHE717#001') ||
            this.hasSemanticId(el, 'https://admin-shell.io/idta/CarbonFootprint/TransportCarbonFootprint/0/9')
          ) {
            // es ist ein TCF
            if (this.groupedTcfLists.find((x) => x.name === collection.idShort)) {
              this.groupedTcfLists.find((x) => x.name === collection.idShort)?.tcfs.push(el);
            } else {
              this.groupedTcfLists.push({
                name: collection.idShort ?? '',
                tcfs: [el],
              });
            }
          }
        }
      });
    });

    // If a highlight is active when inputs change, re-apply expansion
    const current = this.viewerStore.highlightedIdShortPath();
    if (current) this.expandForTarget(current);
  }

  hasSemanticId(sme: aas.types.ISubmodelElement | undefined, semanticId: string) {
    return sme?.semanticId?.keys.find((k) => k.value.startsWith(semanticId)) != null;
  }

  private expandForTarget(target: string) {
    // Normalize helpers
    const stripIndex = (seg: string) => seg.replace(/\[\d+\]/g, '');
    const [seg1Raw, seg2Raw] = this.firstTwoSegments(target);
    const seg1 = stripIndex(seg1Raw ?? '');
    const seg2 = stripIndex(seg2Raw ?? '');

    if (!seg1) return;

    // Try direct PCF match in flat list
    if (this.pcfList?.some((p) => (p.idShort ?? '') === seg1)) {
      this.expandedPcfPanels.set([seg1]);
      return;
    }

    // Try grouped PCF: seg1 is group name
    const group = this.groupedPcfLists?.find((g) => (g.name ?? '') === seg1);
    if (group) {
      this.expandedPcfPanels.set([seg1]); // open group panel
      if (seg2) {
        const hasChild = group.pcfs?.some((p) => (p.idShort ?? '') === seg2);
        if (hasChild) {
          const next = { ...this.expandedPcfGroupPanels() };
          next[seg1] = [seg2];
          this.expandedPcfGroupPanels.set(next);
          return;
        }
      }
      return;
    }

    // Maybe target starts directly with a child PCF id inside any group
    const groupWithChild = this.groupedPcfLists?.find((g) => g.pcfs?.some((p) => (p.idShort ?? '') === seg1));
    if (groupWithChild) {
      this.expandedPcfPanels.set([groupWithChild.name]);
      const next = { ...this.expandedPcfGroupPanels() };
      next[groupWithChild.name] = [seg1];
      this.expandedPcfGroupPanels.set(next);
      return;
    }

    // TCF: simple top-level list
    if (this.tcfList?.some((t) => (t.idShort ?? '') === seg1)) {
      this.expandedTcfPanels.set([seg1]);
    }
  }

  private firstTwoSegments(path: string): [string | undefined, string | undefined] {
    // Split on dots, but keep list indices attached to segments (e.g., Foo[2])
    const parts = path.split('.');
    return [parts[0], parts[1]];
  }
}
