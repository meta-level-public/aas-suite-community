import {
  AssetInformation,
  Entity,
  EntityType,
  ISubmodelElement,
  Property,
  RelationshipElement,
  Submodel,
} from '@aas-core-works/aas-core3.1-typescript/types';

import { AasConfirmationService, NotificationService } from '@aas/common-services';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { AasResultListComponent } from '../aas-result-list/aas-result-list.component';
import { CreateChildEntityComponent } from '../create-child-entity/create-child-entity.component';
import { EntityDetailsComponent } from '../entity-details/entity-details.component';
import {
  entityHasExclusiveAssetReference,
  entityHasRequiredAssetReference,
  specificAssetIdsAreComplete,
} from '../utils/entity-asset-reference.util';

@Component({
  selector: 'aas-bom-entity-dialog',
  imports: [
    ToolbarModule,
    ButtonModule,
    TranslateModule,
    CreateChildEntityComponent,
    AasResultListComponent,
    EntityDetailsComponent,
    TooltipModule,
  ],
  templateUrl: './bom-entity-dialog.component.html',
  styleUrl: './bom-entity-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BomEntityDialogComponent {
  config = inject(DynamicDialogConfig);
  confirmService = inject(AasConfirmationService);
  notificationService = inject(NotificationService);
  translate = inject(TranslateService);

  editable: boolean = true;

  mode: WritableSignal<'details' | 'add-child' | 'aas-search'> = signal('details');

  hasChanges: boolean = false;

  entity: Entity;
  parentEntity: Entity;
  apiUrl: string;
  submodel: Submodel;
  relationship: RelationshipElement;
  ref = inject(DynamicDialogRef);
  refreshEmitter: EventEmitter<boolean>;
  assetInformation: AssetInformation;

  archeType = computed(() => {
    let archeType: string | null = null;
    if (this.submodel != null) {
      for (const sme of this.submodel.submodelElements ?? []) {
        if (this.hasSemanticId(sme, 'https://admin-shell.io/idta/HierarchicalStructures/ArcheType/1/0')) {
          archeType = (sme as Property).value;
        }
      }
    }
    return archeType;
  });

  referenceType = computed(() => {
    switch (this.archeType()) {
      case 'Full':
        return { label: 'HasPart', value: 'https://admin-shell.io/idta/HierarchicalStructures/HasPart/1/0' };
      case 'OneDown':
        return { label: 'HasPart', value: 'https://admin-shell.io/idta/HierarchicalStructures/HasPart/1/0' };
      case 'OneUp':
        return { label: 'IsPartOf', value: 'https://admin-shell.io/idta/HierarchicalStructures/IsPartOf/1/0' };
      default:
        return { label: 'HasPart', value: 'https://admin-shell.io/idta/HierarchicalStructures/HasPart/1/0' };
    }
  });

  siblingIdShorts = computed(() => {
    const source = this.parentEntity?.statements ?? this.submodel?.submodelElements ?? [];
    return source
      .filter((sme): sme is Entity => sme instanceof Entity)
      .filter((entity) => entity !== this.entity)
      .map((entity) => entity.idShort?.trim() ?? '')
      .filter((idShort) => idShort.length > 0);
  });

  constructor() {
    this.entity = this.config.data.entity;
    this.parentEntity = this.config.data.parentEntity;
    this.relationship = this.config.data.relationship;
    this.submodel = this.config.data.submodel;
    this.apiUrl = this.config.data.apiUrl;
    this.editable = this.config.data.editable;
    this.refreshEmitter = this.config.data.refreshEmitter;
    this.assetInformation = this.config.data.assetInformation;
    const initialMode = this.config.data.initialMode as 'details' | 'add-child' | 'remove' | undefined;
    if (initialMode === 'add-child' && this.editable && this.canAddChild()) {
      this.mode.set('add-child');
    } else if (initialMode === 'remove' && this.editable && this.canDeleteCurrentEntity()) {
      queueMicrotask(() => this.deleteElement());
    } else {
      this.mode.set('details');
    }
  }

  close() {
    if (this.mode() === 'details' && this.editable) {
      if (!specificAssetIdsAreComplete(this.entity)) {
        this.notificationService.showMessageAlways('SPECIFIC_ASSET_IDS_INVALID', 'WARNING', 'warn', false);
        return;
      }

      if (!entityHasExclusiveAssetReference(this.entity)) {
        this.notificationService.showMessageAlways('BOM_ENTITY_ASSET_REFERENCE_EXCLUSIVE', 'WARNING', 'warn', false);
        return;
      }

      if (!this.isRootNode && !entityHasRequiredAssetReference(this.entity)) {
        this.notificationService.showMessageAlways(
          'BOM_CHILD_ENTITY_ASSET_REFERENCE_REQUIRED',
          'WARNING',
          'warn',
          false,
        );
        return;
      }
    }

    this.ref.close(this.hasChanges);
  }

  async deleteElement() {
    if (!this.canDeleteCurrentEntity()) {
      this.notificationService.showMessageAlways('BOM_DELETE_ENTRYNODE_BLOCKED', 'WARNING', 'warn', false);
      return;
    }

    if (await this.confirmService.confirm({ message: this.translate.instant('DELETE_ENTITY_TREE') })) {
      let refreshEvent: CustomEvent;
      if (this.parentEntity) {
        this.parentEntity.statements?.splice(this.parentEntity.statements.indexOf(this.entity), 1);
        this.parentEntity.statements?.splice(this.parentEntity.statements.indexOf(this.relationship), 1);
        refreshEvent = new CustomEvent('refreshParentTreeNode');
      } else {
        this.submodel.submodelElements?.splice(this.submodel.submodelElements.indexOf(this.entity), 1);
        refreshEvent = new CustomEvent('selectAndRefreshParentTreeNode');
      }
      window.dispatchEvent(refreshEvent);
      this.detailsChanged();
      this.ref.close();
    }
  }

  get isRootNode() {
    return this.parentEntity == null;
  }

  markAsChanged() {
    this.hasChanges = true;
  }

  doRefresh() {
    this.refreshEmitter.next(true);
  }

  adoptCurrentAasGlobalAssetId() {
    const expectedGlobalAssetId = this.assetInformation?.globalAssetId?.trim();
    if (!this.isRootNode || !this.entity || !expectedGlobalAssetId) {
      return;
    }

    this.entity.globalAssetId = expectedGlobalAssetId;
    this.detailsChanged();
  }

  get isAssetIdSet() {
    if (this.entity?.globalAssetId != null && this.entity.globalAssetId.length > 0) {
      return true;
    }
    if (this.entity?.specificAssetIds != null && this.entity.specificAssetIds.length > 0) {
      return true;
    }

    return false;
  }

  hasSemanticId(sme: ISubmodelElement | undefined, semanticId: string) {
    return sme?.semanticId?.keys.find((k) => k.value.startsWith(semanticId)) != null;
  }

  canAddChild() {
    const archeType = this.archeType();
    return (
      archeType === 'Full' ||
      archeType == null ||
      (archeType === 'OneDown' && this.isRootNode) ||
      (archeType === 'OneUp' &&
        this.isRootNode &&
        (this.entity.statements == null || this.entity.statements.length === 0))
    );
  }

  canDeleteCurrentEntity() {
    return this.editable && !this.isRootNode;
  }

  addChildDisabledHint() {
    const archeType = this.archeType();
    if (archeType === 'OneDown' && !this.isRootNode) {
      return this.translate.instant('BOM_ADD_CHILD_HINT_ONEDOWN_ROOT_ONLY');
    }

    if (archeType === 'OneUp') {
      if (!this.isRootNode) {
        return this.translate.instant('BOM_ADD_CHILD_HINT_ONEUP_ROOT_ONLY');
      }
      if ((this.entity.statements?.length ?? 0) > 0) {
        return this.translate.instant('BOM_ADD_CHILD_HINT_ONEUP_SINGLE_CHILD');
      }
    }

    return this.translate.instant('BOM_ADD_CHILD_HINT_NOT_ALLOWED');
  }

  isEntryAssetValid() {
    return this.entity.globalAssetId === this.assetInformation?.globalAssetId || !this.isRootNode;
  }
  isEntryAssetTypeValid() {
    return (this.entity.entityType === EntityType.SelfManagedEntity && this.isRootNode) || !this.isRootNode;
  }

  childCreated() {
    this.markAsChanged();
    this.doRefresh();
    this.mode.set('details');
  }

  detailsChanged() {
    this.markAsChanged();
    this.doRefresh();
  }
}
