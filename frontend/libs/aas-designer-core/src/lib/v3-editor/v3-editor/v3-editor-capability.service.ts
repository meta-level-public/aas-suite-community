import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AasConfirmationService, AppConfigService, PortalService } from '@aas/common-services';
import { SemanticIdHelper } from '@aas/helpers';
import { ShellResult } from '@aas/model';
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AssetInterfacesInterfaceAddonComponent } from '../addons/asset-interfaces-interface-addon/asset-interfaces-interface-addon.component';
import { CapabilityAddonComponent } from '../addons/capability-addon/capability-addon.component';
import { V3TreeItem } from '../model/v3-tree-item';
import { V3EditorDataStoreService } from '../v3-editor-data-store.service';
import { V3TreeService } from '../v3-tree/v3-tree.service';
import { V3EditorPcfService } from './v3-editor-pcf.service';

@Injectable()
export class V3EditorCapabilityService {
  private dialogService = inject(DialogService);
  private translate = inject(TranslateService);
  private confirmationService = inject(AasConfirmationService);
  private portalService = inject(PortalService);
  private appConfigService = inject(AppConfigService);
  private editorDataStoreService = inject(V3EditorDataStoreService);
  private treeService = inject(V3TreeService);
  private pcfService = inject(V3EditorPcfService);

  private ref: DynamicDialogRef | undefined | null;

  selectedElement: V3TreeItem<any> | undefined;
  shellResult: ShellResult | undefined;
  capabilityDetailMode: 'viewer' | 'edit' = 'viewer';
  bomReinitializeRequestId = 0;

  private lastSelectedElementId = '';
  private forceEditModeOnNextSelection = false;

  destroy(): void {
    if (this.ref) {
      this.ref.close();
    }
  }

  syncCapabilityDetailMode(): void {
    const nextSelectedElementId = this.selectedElement?.id ?? '';
    if (nextSelectedElementId !== this.lastSelectedElementId) {
      if (this.forceEditModeOnNextSelection) {
        this.capabilityDetailMode = 'edit';
        this.forceEditModeOnNextSelection = false;
      } else {
        this.capabilityDetailMode = this.isViewerToggleSelection() ? 'viewer' : 'edit';
      }
      this.lastSelectedElementId = nextSelectedElementId;
    }
  }

  requestEditModeForNextSelection(): void {
    this.forceEditModeOnNextSelection = true;
  }

  isViewerToggleSelection(): boolean {
    return (
      this.isCapabilityContextSelection() ||
      this.isGenericSubmodelSelection() ||
      this.pcfService.isPcfAssistantContextSelection() ||
      this.isAssetInterfacesContextSelection()
    );
  }

  isCapabilityContextSelection(): boolean {
    return (
      this.isCapabilityDescriptionSubmodelSelection() ||
      this.isCapabilitySetSelection() ||
      this.isCapabilityContainerSelection() ||
      this.isGenericSubmodelSelection()
    );
  }

  isGenericSubmodelSelection(): boolean {
    return (
      this.selectedElement?.content instanceof aas.types.Submodel &&
      !this.isCapabilityDescriptionSubmodel(this.selectedElement.content)
    );
  }

  isCapabilityViewerMode(): boolean {
    return (
      (this.isCapabilityContextSelection() || this.isAssetInterfacesContextSelection()) &&
      this.capabilityDetailMode === 'viewer'
    );
  }

  isPcfViewerMode(): boolean {
    return this.pcfService.isPcfAssistantContextSelection() && this.capabilityDetailMode === 'viewer';
  }

  isCapabilityEditMode(): boolean {
    return !this.isViewerToggleSelection() || this.capabilityDetailMode === 'edit';
  }

  showCapabilityViewer(): void {
    this.capabilityDetailMode = 'viewer';
  }

  showCapabilityEditor(): void {
    this.capabilityDetailMode = 'edit';
  }

  isAssetInterfacesDescriptionSubmodelSelection(): boolean {
    return (
      this.selectedElement?.content instanceof aas.types.Submodel &&
      this.isAssetInterfacesDescriptionSubmodel(this.selectedElement.content)
    );
  }

  isAssetInterfacesContextSelection(): boolean {
    return (
      this.isAssetInterfacesDescriptionSubmodelSelection() || this.isAssetInterfacesDescriptionInterfaceSelection()
    );
  }

  isAssetInterfacesDescriptionInterfaceSelection(): boolean {
    return (
      this.selectedElement?.content instanceof aas.types.SubmodelElementCollection &&
      SemanticIdHelper.hasSemanticId(
        this.selectedElement.content,
        'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/Interface',
      )
    );
  }

  openAddAssetInterfacesDescriptionInterfaceAddon(): void {
    const submodel = this.selectedElement?.content;
    if (!(submodel instanceof aas.types.Submodel) || !this.isAssetInterfacesDescriptionSubmodelSelection()) return;

    const count = this.getAidInterfaces(submodel).length;
    this.ref = this.dialogService.open(AssetInterfacesInterfaceAddonComponent, {
      width: '65%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('AID_INTERFACE_ADD'),
      closable: true,
      modal: true,
      data: { count },
    });

    this.ref?.onClose.subscribe((newInterface: aas.types.SubmodelElementCollection | null) => {
      if (newInterface == null) return;
      if (submodel.submodelElements == null) submodel.submodelElements = [];
      submodel.submodelElements.push(newInterface);
      this.treeService.refreshWholeTree();
      setTimeout(() => this.treeService.selectNodeByElement(newInterface), 0);
    });
  }

  openEditAssetInterfacesDescriptionInterfaceAddon(): void {
    const current = this.selectedElement?.content;
    if (
      !(current instanceof aas.types.SubmodelElementCollection) ||
      !this.isAssetInterfacesDescriptionInterfaceSelection()
    )
      return;

    const parentSubmodel = this.capabilityViewerSubmodel;
    const count = parentSubmodel != null ? this.getAidInterfaces(parentSubmodel).length : 0;
    this.ref = this.dialogService.open(AssetInterfacesInterfaceAddonComponent, {
      width: '65%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('AID_INTERFACE_EDIT_WITH_ASSISTANT'),
      closable: true,
      modal: true,
      data: { count, existingInterface: cloneDeep(current) },
    });

    this.ref?.onClose.subscribe((editedInterface: aas.types.SubmodelElementCollection | null) => {
      if (editedInterface == null) return;
      Object.assign(current as any, editedInterface as any);
      this.treeService.refreshWholeTree();
      setTimeout(() => this.treeService.selectNodeByElement(current), 0);
    });
  }

  async deleteAssetInterfacesDescriptionInterface(): Promise<void> {
    const current = this.selectedElement?.content;
    const parent = this.selectedElement?.parent?.content;
    if (!(current instanceof aas.types.SubmodelElementCollection) || !(parent instanceof aas.types.Submodel)) return;
    if (!this.isAssetInterfacesDescriptionInterfaceSelection()) return;

    const confirmed = await this.confirmationService.confirm({
      message: this.translate.instant('AID_INTERFACE_DELETE_Q'),
    });
    if (!confirmed) return;

    parent.submodelElements = (parent.submodelElements ?? []).filter((el) => el !== current);
    this.treeService.refreshWholeTree();
    setTimeout(() => this.treeService.selectNodeByElement(parent), 0);
  }

  get capabilityViewerSubmodel(): aas.types.Submodel | undefined {
    let node: V3TreeItem<any> | null | undefined = this.selectedElement;
    while (node != null) {
      if (node.content instanceof aas.types.Submodel) {
        return node.content;
      }
      node = node.parent;
    }
    return undefined;
  }

  get capabilityViewerSubmodelUrl(): string {
    const smId = this.capabilityViewerSubmodel?.id;
    if (smId == null) return '';
    const endpoint =
      this.editorDataStoreService.editorDescriptor()?.submodelDescriptorEntries?.find((e) => e.oldId === smId)
        ?.endpoint ?? '';
    if (!endpoint) return '';
    const proxyPath = this.appConfigService.config.aasViewerProxyPath.replace(/\/$/, '');
    return `${proxyPath}/call?target=${encodeURIComponent(endpoint)}`;
  }

  get capabilityViewerSet(): aas.types.SubmodelElementCollection | undefined {
    if (this.isCapabilitySetSelection()) {
      return this.selectedElement?.content as aas.types.SubmodelElementCollection;
    }
    if (this.isCapabilityContainerSelection()) {
      let node: V3TreeItem<any> | null | undefined = this.selectedElement?.parent;
      while (node != null) {
        if (
          node.content instanceof aas.types.SubmodelElementCollection &&
          SemanticIdHelper.hasSemanticId(
            node.content,
            'https://admin-shell.io/idta/CapabilityDescription/CapabilitySet/1/0',
          )
        ) {
          return node.content;
        }
        node = node.parent;
      }
    }
    return undefined;
  }

  get capabilityViewerContainer(): aas.types.SubmodelElementCollection | undefined {
    if (this.isCapabilityContainerSelection()) {
      return this.selectedElement?.content as aas.types.SubmodelElementCollection;
    }
    return undefined;
  }

  get capabilityViewerSubmodels(): aas.types.Submodel[] {
    return this.shellResult?.v3Shell?.submodels ?? [];
  }

  isCapabilityDescriptionSubmodelSelection(): boolean {
    return (
      this.selectedElement?.content instanceof aas.types.Submodel &&
      this.isCapabilityDescriptionSubmodel(this.selectedElement.content)
    );
  }

  isCapabilitySetSelection(): boolean {
    return (
      this.selectedElement?.content instanceof aas.types.SubmodelElementCollection &&
      SemanticIdHelper.hasSemanticId(
        this.selectedElement.content,
        'https://admin-shell.io/idta/CapabilityDescription/CapabilitySet/1/0',
      )
    );
  }

  isCapabilityContainerSelection(): boolean {
    return (
      this.selectedElement?.content instanceof aas.types.SubmodelElementCollection &&
      SemanticIdHelper.hasSemanticId(
        this.selectedElement.content,
        'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0',
      )
    );
  }

  openCapabilityContainerAddon(): void {
    const container = this.selectedElement?.content;
    if (!(container instanceof aas.types.SubmodelElementCollection) || !this.isCapabilityContainerSelection()) return;

    const capabilitySet = this.capabilityViewerSet;
    const count = (capabilitySet?.value ?? []).filter(
      (el) =>
        el instanceof aas.types.SubmodelElementCollection &&
        SemanticIdHelper.hasSemanticId(el, 'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0'),
    ).length;
    const availableCapabilityRefs = (
      (capabilitySet?.value ?? []).filter(
        (el): el is aas.types.SubmodelElementCollection =>
          el instanceof aas.types.SubmodelElementCollection &&
          SemanticIdHelper.hasSemanticId(
            el,
            'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0',
          ),
      ) as aas.types.SubmodelElementCollection[]
    )
      .flatMap((el) =>
        (el.value ?? []).filter((child): child is aas.types.Capability => child instanceof aas.types.Capability),
      )
      .map((capability) => capability.idShort?.trim() ?? '')
      .filter((idShort) => idShort !== '');

    this.ref = this.dialogService.open(CapabilityAddonComponent, {
      width: '75%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('CAPABILITY_EDIT_WITH_ASSISTANT'),
      closable: true,
      modal: true,
      data: {
        count,
        currentLanguage: this.portalService.currentLanguage,
        currentSubmodelId: this.capabilityViewerSubmodel?.id ?? '',
        availableCapabilityRefs,
        existingCapabilityContainer: cloneDeep(container),
      },
    });

    this.ref?.onClose.subscribe((editedContainer: aas.types.SubmodelElementCollection | null) => {
      if (editedContainer == null) return;
      Object.assign(container as any, editedContainer as any);
      this.treeService.refreshWholeTree();
      setTimeout(() => this.treeService.selectNodeByElement(container), 0);
    });
  }

  openAddCapabilityAddonForSet(): void {
    const capabilitySet = this.selectedElement?.content;
    if (!(capabilitySet instanceof aas.types.SubmodelElementCollection) || !this.isCapabilitySetSelection()) return;

    const count = this.getCapabilityContainers(capabilitySet).length;
    const availableCapabilityRefs = this.collectCapabilityRefs(capabilitySet);

    this.ref = this.dialogService.open(CapabilityAddonComponent, {
      width: '75%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('ADD_CAPABILITY'),
      closable: true,
      modal: true,
      data: {
        count,
        currentLanguage: this.portalService.currentLanguage,
        currentSubmodelId: this.capabilityViewerSubmodel?.id ?? '',
        availableCapabilityRefs,
      },
    });

    this.ref?.onClose.subscribe((capabilityContainer: aas.types.SubmodelElementCollection | null) => {
      if (capabilityContainer == null) return;
      if (capabilitySet.value == null) capabilitySet.value = [];
      capabilitySet.value.push(capabilityContainer);
      this.treeService.refreshWholeTree();
      setTimeout(() => this.treeService.selectNodeByElement(capabilitySet), 0);
    });
  }

  private isCapabilityDescriptionSubmodel(submodel: aas.types.Submodel): boolean {
    return (
      SemanticIdHelper.hasSemanticId(submodel, 'https://admin-shell.io/idta/CapabilityDescription/1/0') ||
      SemanticIdHelper.hasSemanticId(submodel, 'https://admin-shell.io/idta/CapabilityDescription/1/0/Submodel') ||
      SemanticIdHelper.hasSemanticId(submodel, 'https://admin-shell.io/idta/SubmodelTemplate/CapabilityDescription/1/0')
    );
  }

  private isAssetInterfacesDescriptionSubmodel(submodel: aas.types.Submodel): boolean {
    return (
      SemanticIdHelper.hasSemanticId(submodel, 'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/Submodel') ||
      SemanticIdHelper.hasSemanticId(submodel, 'https://admin-shell.io/idta/AssetInterfacesDescription/1/0')
    );
  }

  private getAidInterfaces(submodel: aas.types.Submodel): aas.types.SubmodelElementCollection[] {
    return (submodel.submodelElements ?? []).filter(
      (el): el is aas.types.SubmodelElementCollection =>
        el instanceof aas.types.SubmodelElementCollection &&
        SemanticIdHelper.hasSemanticId(el, 'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/Interface'),
    );
  }

  private getCapabilityContainers(
    capabilitySet: aas.types.SubmodelElementCollection,
  ): aas.types.SubmodelElementCollection[] {
    return (capabilitySet.value ?? []).filter(
      (el): el is aas.types.SubmodelElementCollection =>
        el instanceof aas.types.SubmodelElementCollection &&
        SemanticIdHelper.hasSemanticId(el, 'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0'),
    );
  }

  private collectCapabilityRefs(capabilitySet: aas.types.SubmodelElementCollection): string[] {
    return this.getCapabilityContainers(capabilitySet)
      .flatMap((container) =>
        (container.value ?? []).filter((child): child is aas.types.Capability => child instanceof aas.types.Capability),
      )
      .map((capability) => capability.idShort?.trim() ?? '')
      .filter((idShort) => idShort !== '');
  }
}
