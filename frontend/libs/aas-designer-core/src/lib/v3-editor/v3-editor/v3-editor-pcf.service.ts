import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SemanticIdHelper } from '@aas/helpers';
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DppPcfEntry, DppPcfEntryType } from 'battery-passport-assistant';
import { cloneDeep } from 'lodash-es';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PcfEntryMapperService } from '../../general/pcf-entry-assistant/pcf-entry-mapper.service';
import { PcfEntryAddonComponent } from '../addons/pcf-entry-addon/pcf-entry-addon.component';
import { V3TreeItem } from '../model/v3-tree-item';
import { V3TreeService } from '../v3-tree/v3-tree.service';

@Injectable()
export class V3EditorPcfService {
  private dialogService = inject(DialogService);
  private translate = inject(TranslateService);
  private treeService = inject(V3TreeService);
  private pcfEntryMapperService = inject(PcfEntryMapperService);

  private ref: DynamicDialogRef | undefined | null;

  selectedElement: V3TreeItem<any> | undefined;

  destroy(): void {
    if (this.ref) {
      this.ref.close();
    }
  }

  isPcfAssistantContextSelection(): boolean {
    return this.isPcfListSelection() || this.isPcfEntrySelection();
  }

  isPcfListSelection(): boolean {
    const content = this.selectedElement?.content;
    return content instanceof aas.types.SubmodelElementList && this.getPcfListType(content) != null;
  }

  isProductCarbonFootprintListSelection(): boolean {
    const content = this.selectedElement?.content;
    return (
      content instanceof aas.types.SubmodelElementList && this.getPcfListType(content) === 'product-carbon-footprint'
    );
  }

  isProductOrSectorSpecificCarbonFootprintListSelection(): boolean {
    const content = this.selectedElement?.content;
    return (
      content instanceof aas.types.SubmodelElementList &&
      this.getPcfListType(content) === 'product-or-sector-specific-carbon-footprint'
    );
  }

  isPcfEntrySelection(): boolean {
    return this.getSelectedPcfEntryContext() != null;
  }

  isProductCarbonFootprintEntrySelection(): boolean {
    return this.getSelectedPcfEntryContext()?.entryType === 'product-carbon-footprint';
  }

  isProductOrSectorSpecificCarbonFootprintEntrySelection(): boolean {
    return this.getSelectedPcfEntryContext()?.entryType === 'product-or-sector-specific-carbon-footprint';
  }

  openAddPcfEntryAddon(): void {
    const list = this.selectedElement?.content;
    if (!(list instanceof aas.types.SubmodelElementList)) {
      return;
    }

    const entryType = this.getPcfListType(list);
    if (entryType == null) {
      return;
    }

    this.ref = this.dialogService.open(PcfEntryAddonComponent, {
      width: '75%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('PCF_ADD_ENTRY'),
      closable: true,
      modal: true,
      data: {
        entryType,
        entryIndex: (list.value ?? []).length,
      },
    });

    this.ref?.onClose.subscribe((entry: DppPcfEntry | null) => {
      if (entry == null) {
        return;
      }

      if (list.value == null) {
        list.value = [];
      }

      list.value.push(this.pcfEntryMapperService.createEntryElement(entry, list.value.length));
      this.treeService.refreshWholeTree();
      setTimeout(() => this.treeService.selectNodeByElement(list), 0);
    });
  }

  openEditPcfEntryAddon(): void {
    this.openEditPcfEntryAddonByIndex();
  }

  openEditPcfEntryAddonByIndex(indexOverride?: number): void {
    const context = this.getSelectedPcfEntryContext();
    if (context == null) {
      const selectedList = this.selectedElement?.content;
      if (!(selectedList instanceof aas.types.SubmodelElementList)) {
        return;
      }

      const entryType = this.getPcfListType(selectedList);
      if (entryType == null || indexOverride == null) {
        return;
      }

      const existingElement = (selectedList.value ?? [])[indexOverride];
      if (!(existingElement instanceof aas.types.SubmodelElementCollection)) {
        return;
      }

      this.openPcfEntryEditor(entryType, existingElement, indexOverride);
      return;
    }

    this.openPcfEntryEditor(context.entryType, context.collection, context.index);
  }

  get pcfListViewerSubmodel(): aas.types.Submodel | undefined {
    const selectedContent = this.selectedElement?.content;
    if (!(selectedContent instanceof aas.types.SubmodelElementList)) {
      return undefined;
    }

    const entryType = this.getPcfListType(selectedContent);
    if (entryType == null) {
      return undefined;
    }

    const listSemanticId =
      entryType === 'product-carbon-footprint'
        ? 'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprints/1/0'
        : 'https://admin-shell.io/idta/CarbonFootprint/ProductOrSectorSpecificCarbonFootprints/1/0';

    const submodel = new aas.types.Submodel('urn:temporary:pcf-list-viewer');
    submodel.idShort = selectedContent.idShort ?? 'CarbonFootprint';
    submodel.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(
        aas.types.KeyTypes.GlobalReference,
        'https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0',
      ),
    ]);

    const list = cloneDeep(selectedContent);
    list.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, listSemanticId),
    ]);
    submodel.submodelElements = [list];
    return submodel;
  }

  get pcfSelectedStep(): aas.types.SubmodelElementCollection | undefined {
    return this.getSelectedPcfEntryContext()?.collection;
  }

  private openPcfEntryEditor(
    entryType: DppPcfEntryType,
    existingElement: aas.types.SubmodelElementCollection,
    index: number,
  ): void {
    this.ref = this.dialogService.open(PcfEntryAddonComponent, {
      width: '75%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('PCF_EDIT_WITH_ASSISTANT'),
      closable: true,
      modal: true,
      data: {
        entryType,
        existingElement: cloneDeep(existingElement),
        entryIndex: index,
      },
    });

    this.ref?.onClose.subscribe((entry: DppPcfEntry | null) => {
      if (entry == null) {
        return;
      }

      const updated = this.pcfEntryMapperService.createEntryElement(entry, index);
      Object.assign(existingElement as any, updated as any);
      this.treeService.refreshWholeTree();
      setTimeout(() => this.treeService.selectNodeByElement(existingElement), 0);
    });
  }

  private getSelectedPcfEntryContext(): {
    collection: aas.types.SubmodelElementCollection;
    entryType: DppPcfEntryType;
    index: number;
  } | null {
    const collection = this.selectedElement?.content;
    const parent = this.selectedElement?.parent?.content;
    if (
      !(collection instanceof aas.types.SubmodelElementCollection) ||
      !(parent instanceof aas.types.SubmodelElementList)
    ) {
      return null;
    }

    const entryType = this.getPcfListType(parent);
    if (entryType == null) {
      return null;
    }

    return {
      collection,
      entryType,
      index: Math.max(0, (parent.value ?? []).indexOf(collection)),
    };
  }

  getPcfListType(list: aas.types.SubmodelElementList): DppPcfEntryType | null {
    if (
      SemanticIdHelper.hasSemanticId(list, 'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprints/1/0') ||
      list.idShort === 'ProductCarbonFootprints'
    ) {
      return 'product-carbon-footprint';
    }

    if (
      SemanticIdHelper.hasSemanticId(
        list,
        'https://admin-shell.io/idta/CarbonFootprint/ProductOrSectorSpecificCarbonFootprints/1/0',
      ) ||
      list.idShort === 'ProductOrSectorSpecificCarbonFootprints'
    ) {
      return 'product-or-sector-specific-carbon-footprint';
    }

    return null;
  }
}
