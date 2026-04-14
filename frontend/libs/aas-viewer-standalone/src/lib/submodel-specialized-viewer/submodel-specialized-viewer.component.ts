import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AssetInformation } from '@aas-core-works/aas-core3.1-typescript/types';
import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { Component, EventEmitter, Input, Output, Type } from '@angular/core';
import { SubmodelHeroHeaderComponent } from '../shared/submodel-hero-header/submodel-hero-header.component';
import { AasDesignerChangelogViewerComponent } from '../specific-submodels/aas-designer-changelog-viewer/aas-designer-changelog-viewer.component';
import { ArticleInformationViewerComponent } from '../specific-submodels/article-information-viewer/article-information-viewer.component';
import { AssetInterfacesDescriptionViewerComponent } from '../specific-submodels/asset-interfaces-description-viewer/asset-interfaces-description-viewer.component';
import { BatteryNameplateViewerComponent } from '../specific-submodels/battery-nameplate-viewer/battery-nameplate-viewer.component';
import { BomViewerComponent } from '../specific-submodels/bom-viewer/bom-viewer.component';
import { CapabilityDescriptionViewerComponent } from '../specific-submodels/capability-description-viewer/capability-description-viewer.component';
import { CircularityViewerComponent } from '../specific-submodels/circularity-viewer/circularity-viewer.component';
import { ContactInformationViewerComponent } from '../specific-submodels/contact-information-viewer/contact-information-viewer.component';
import { GenericSubmodelViewerComponent } from '../specific-submodels/generic-submodel-viewer/generic-submodel-viewer.component';
import { HandoverDocumentationViewerV2Component } from '../specific-submodels/handover-documentation-viewer-v2/handover-documentation-viewer-v2.component';
import { HandoverDocumentationViewerComponent } from '../specific-submodels/handover-documentation-viewer/handover-documentation-viewer.component';
import { NameplateViewerComponent } from '../specific-submodels/nameplate-viewer/nameplate-viewer.component';
import { PcfViewerV1Component } from '../specific-submodels/pcf-viewer-v1/pcf-viewer-v1.component';
import { PcfViewerComponent } from '../specific-submodels/pcf-viewer/pcf-viewer.component';
import { ProductConditionViewerComponent } from '../specific-submodels/product-condition-viewer/product-condition-viewer.component';
import { SoftwareNameplateViewerComponent } from '../specific-submodels/software-nameplate-viewer/software-nameplate-viewer.component';
import { TechnicaldataViewerComponent } from '../specific-submodels/technicaldata-viewer/technicaldata-viewer.component';
import { TimeSeriesViewerComponent } from '../specific-submodels/time-series-viewer/time-series-viewer.component';
import { SpecializedSubmodelViewerType, SubmodelViewerResolver } from '../submodel-viewer-resolver';

@Component({
  selector: 'aas-submodel-specialized-viewer',
  templateUrl: './submodel-specialized-viewer.component.html',
  styles: [
    `
      .submodel-viewer-shell {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
    `,
  ],
  imports: [
    AsyncPipe,
    NgComponentOutlet,
    SubmodelHeroHeaderComponent,
    AasDesignerChangelogViewerComponent,
    AssetInterfacesDescriptionViewerComponent,
    CircularityViewerComponent,
    ProductConditionViewerComponent,
    NameplateViewerComponent,
    BatteryNameplateViewerComponent,
    SoftwareNameplateViewerComponent,
    CapabilityDescriptionViewerComponent,
    ContactInformationViewerComponent,
    TimeSeriesViewerComponent,
    HandoverDocumentationViewerComponent,
    HandoverDocumentationViewerV2Component,
    TechnicaldataViewerComponent,
    BomViewerComponent,
    PcfViewerComponent,
    PcfViewerV1Component,
    ArticleInformationViewerComponent,
    GenericSubmodelViewerComponent,
  ],
})
export class SubmodelSpecializedViewerComponent {
  @Input({ required: true }) submodel: aas.types.Submodel | undefined;
  @Input({ required: true }) currentLanguage = 'de';
  @Input() navigateInBom: boolean = false;
  @Input() bomEditable: boolean = false;
  @Input() enableBomReinitializeAction: boolean = false;
  @Input() assetInformation: AssetInformation | undefined;
  @Input() aasIdShort: string | null | undefined;
  @Output() reloadData = new EventEmitter<void>();
  @Output() requestBomReinitializeInEditor = new EventEmitter<void>();
  @Output() requestBomEditModeInEditor = new EventEmitter<void>();

  private materialCompositionViewerLoader?: Promise<Type<unknown>>;

  get viewerType(): SpecializedSubmodelViewerType {
    return SubmodelViewerResolver.resolve(this.submodel);
  }

  get headerTitle(): string {
    if (this.viewerType === 'Generic') {
      return this.submodel?.idShort?.trim() || 'Submodel';
    }
    return (
      {
        AssetInterfacesDescription: 'Asset Interfaces Description',
        AasDesignerChangelog: 'AAS Designer Changelog',
        Circularity: 'Circularity',
        ProductCondition: 'Product Condition',
        MaterialComposition: 'Material Composition',
        Nameplate: 'Nameplate',
        BatteryNameplate: 'Battery Nameplate',
        SoftwareNameplate: 'Software Nameplate',
        CapabilityDescription: 'Capability Description',
        ContactInformation: 'Contact Information',
        TimeSeries: 'Time Series',
        HandoverDocumentation: 'Handover Documentation',
        HandoverDocumentation_V2: 'Handover Documentation',
        TechnicalData: 'Technical Data',
        Bom: 'Hierarchical Structures',
        PCF: 'Product Carbon Footprint',
        PCF_V1: 'Product Carbon Footprint',
        ArticleInformation: 'Article Information',
      } as Record<Exclude<SpecializedSubmodelViewerType, 'Generic'>, string>
    )[this.viewerType];
  }

  get semanticIdDisplay(): string {
    const keys = this.submodel?.semanticId?.keys ?? [];
    const preferred =
      keys.find(
        (k) =>
          k.type === aas.types.KeyTypes.ConceptDescription ||
          k.type === aas.types.KeyTypes.GlobalReference ||
          k.type === aas.types.KeyTypes.Submodel,
      )?.value ?? '';
    const fallback = keys.find((k) => (k.value ?? '').trim() !== '')?.value ?? '';
    const value = preferred.trim() !== '' ? preferred : fallback;
    return value.trim() || '-';
  }

  get headerIconClass(): string {
    return (
      {
        AssetInterfacesDescription: 'fa-solid fa-plug-circle-bolt',
        AasDesignerChangelog: 'fa-solid fa-clock-rotate-left',
        Circularity: 'fa-solid fa-recycle',
        ProductCondition: 'fa-solid fa-heart-pulse',
        MaterialComposition: 'fa-solid fa-flask-vial',
        Nameplate: 'fa-solid fa-id-card',
        BatteryNameplate: 'fa-solid fa-battery-three-quarters',
        SoftwareNameplate: 'fa-solid fa-laptop-code',
        CapabilityDescription: 'fa-solid fa-bullseye',
        ContactInformation: 'fa-solid fa-address-book',
        TimeSeries: 'fa-solid fa-chart-line',
        HandoverDocumentation: 'fa-solid fa-folder-open',
        HandoverDocumentation_V2: 'fa-solid fa-folder-open',
        TechnicalData: 'fa-solid fa-microchip',
        Bom: 'fa-solid fa-diagram-project',
        PCF: 'fa-solid fa-leaf',
        PCF_V1: 'fa-solid fa-leaf',
        ArticleInformation: 'fa-solid fa-newspaper',
        Generic: 'fa-solid fa-cube',
      } as Record<SpecializedSubmodelViewerType, string>
    )[this.viewerType];
  }

  loadMaterialCompositionViewerComponent(): Promise<Type<unknown>> {
    this.materialCompositionViewerLoader ??=
      import('../specific-submodels/material-composition-viewer/material-composition-viewer.component').then(
        (module) => module.MaterialCompositionViewerComponent,
      );

    return this.materialCompositionViewerLoader;
  }

  onReloadData(): void {
    this.reloadData.emit();
  }

  onRequestBomReinitializeInEditor(): void {
    this.requestBomReinitializeInEditor.emit();
  }

  onRequestBomEditModeInEditor(): void {
    this.requestBomEditModeInEditor.emit();
  }
}
