import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { BomHierarchyChartComponent } from '@aas/bom-diagram';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ViewerStoreService } from '../../viewer-store.service';
type Entity = aas.types.Entity;
type ISubmodelElement = aas.types.ISubmodelElement;
type Submodel = aas.types.Submodel;

@Component({
  selector: 'aas-bom-viewer',
  templateUrl: './bom-viewer.component.html',
  styleUrls: ['./bom-viewer.component.css'],
  imports: [BomHierarchyChartComponent, TranslateModule, ButtonModule],
})
export class BomViewerComponent implements OnChanges {
  @Input() bom: Submodel | undefined;
  @Input() currentLang = 'de';
  @Input() navigate: boolean = true;
  @Input() editable = false;
  @Input() enableReinitializeAction = false;
  @Input() assetInformation: aas.types.AssetInformation | undefined;
  @Input() aasIdShort: string | null | undefined;
  @Output() requestReinitializeInEditor = new EventEmitter<void>();
  @Output() requestEditModeInEditor = new EventEmitter<void>();

  viewerStore = inject(ViewerStoreService);

  entryNode: Entity | undefined;

  ngOnChanges(_changes: SimpleChanges): void {
    this.entryNode = this.bom?.submodelElements?.find(
      (v: any) =>
        v.idShort === 'EntryNode' ||
        this.hasSemanticId(v, 'https://admin-shell.io/idta/HierarchicalStructures/EntryNode/1/0'),
    ) as aas.types.Entity;
  }

  get archeType() {
    return (
      (
        this.bom?.submodelElements?.find(
          (v: any) =>
            v.idShort === 'ArcheType' ||
            this.hasSemanticId(v, 'https://admin-shell.io/idta/HierarchicalStructures/ArcheType/1/0'),
        ) as aas.types.Property
      )?.value ?? ''
    );
  }

  hasSemanticId(sme: ISubmodelElement, semanticId: string) {
    return sme.semanticId?.keys.find((k: any) => k.value.startsWith(semanticId)) != null;
  }

  getCount(entity: aas.types.Entity) {
    return (
      entity.statements?.find(
        (s) =>
          s.semanticId?.keys.find((k) =>
            k.value.startsWith('https://admin-shell.io/idta/HierarchicalStructures/BulkCount/1/0'),
          ) != null,
      ) as aas.types.Property
    )?.value;
  }

  get hasMixedRelationTypesOnEntryNode() {
    if (!this.entryNode?.statements) {
      return false;
    }
    const hasPart = this.entryNode.statements.some((sme) =>
      this.hasSemanticId(sme, 'https://admin-shell.io/idta/HierarchicalStructures/HasPart/1/0'),
    );
    const isPartOf = this.entryNode.statements.some((sme) =>
      this.hasSemanticId(sme, 'https://admin-shell.io/idta/HierarchicalStructures/IsPartOf/1/0'),
    );
    return hasPart && isPartOf;
  }

  get hasNoChildRelationOnEntryNode() {
    if (!this.entryNode?.statements) {
      return false;
    }
    return !this.entryNode.statements.some(
      (sme) =>
        this.hasSemanticId(sme, 'https://admin-shell.io/idta/HierarchicalStructures/HasPart/1/0') ||
        this.hasSemanticId(sme, 'https://admin-shell.io/idta/HierarchicalStructures/IsPartOf/1/0'),
    );
  }

  get showRebuildHint() {
    return this.hasMixedRelationTypesOnEntryNode || this.hasNoChildRelationOnEntryNode;
  }

  get canStartRebuildDirectly() {
    return this.bom != null && this.entryNode != null;
  }

  get resolvedAssetInformation() {
    return this.assetInformation ?? this.viewerStore.aas()?.assetInformation;
  }

  get resolvedAasIdShort() {
    return this.aasIdShort ?? this.viewerStore.aas()?.idShort ?? null;
  }

  rebuildBomNow() {
    if (!this.enableReinitializeAction || !this.canStartRebuildDirectly) {
      return;
    }

    this.requestReinitializeInEditor.emit();
  }

  switchToEditMode() {
    this.requestEditModeInEditor.emit();
  }
}
