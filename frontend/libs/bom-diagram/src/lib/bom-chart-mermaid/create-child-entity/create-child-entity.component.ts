import {
  DataTypeDefXsd,
  Entity,
  EntityType,
  ISubmodelElement,
  Key,
  KeyTypes,
  Property,
  Reference,
  ReferenceTypes,
  RelationshipElement,
  SpecificAssetId,
  Submodel,
} from '@aas-core-works/aas-core3.1-typescript/types';

import { NotificationService } from '@aas/common-services';
import { ChangeDetectorRef, Component, inject, input, Input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { SearchForAssetComponent } from '../search-for-asset/search-for-asset.component';
import {
  cloneKeys,
  cloneSpecificAssetIds,
  createUniqueSiblingIdShort,
  entityHasExclusiveAssetReference,
  entityHasRequiredAssetReference,
  specificAssetIdsAreComplete,
} from '../utils/entity-asset-reference.util';

@Component({
  selector: 'aas-create-child-entity',
  imports: [
    FormsModule,
    FieldsetModule,
    InputTextModule,
    ButtonModule,
    TranslateModule,
    SelectModule,
    KeyFilterModule,
    InputGroupModule,
    InputGroupAddonModule,
    TableModule,
    MessageModule,
    KeyFilterModule,
  ],
  templateUrl: './create-child-entity.component.html',
  styleUrl: './create-child-entity.component.css',
})
export class CreateChildEntityComponent {
  @Input({ required: true }) parentEntity: Entity | undefined;
  @Input({ required: true }) parentRelationship: RelationshipElement | undefined;
  @Input({ required: true }) submodel: Submodel | undefined;
  @Input({ required: true }) referenceType: { label: string; value: string } | undefined;
  @Input({ required: true }) apiUrl: string = '';
  showSave = input.required();

  childCreated = output<boolean>();

  notificationService = inject(NotificationService);
  dialogService = inject(DialogService);
  translate = inject(TranslateService);
  cdRef = inject(ChangeDetectorRef);
  idShortRegex = /[a-zA-Z0-9_]/;

  newEntity: Entity;
  entityTypeOptions: { label: string; value: EntityType }[];
  referenceTypeOptions: { label: string; value: string }[];
  amount: number | undefined;
  EntityType = EntityType;

  constructor() {
    this.newEntity = new Entity();
    this.newEntity.entityType = EntityType.SelfManagedEntity;

    this.entityTypeOptions = [
      { label: 'SelfManagedEntity', value: EntityType.SelfManagedEntity },
      { label: 'CoManagedEntity', value: EntityType.CoManagedEntity },
    ];
    this.referenceTypeOptions = [
      { label: 'HasPart', value: 'https://admin-shell.io/idta/HierarchicalStructures/HasPart/1/0' },
      { label: 'IsPartOf', value: 'https://admin-shell.io/idta/HierarchicalStructures/IsPartOf/1/0' },
      { label: 'SameAs', value: 'https://admin-shell.io/idta/HierarchicalStructures/SameAs/1/0' },
    ];
    this.referenceType = this.referenceTypeOptions[0];
  }

  save() {
    if (!this.isNewEntityValid()) {
      this.notificationService.showMessageAlways('BOM_CHILD_ENTITY_ASSET_REFERENCE_REQUIRED', 'WARNING', 'warn', false);
      return;
    }

    if (this.parentEntity) {
      if (!this.parentEntity.statements) {
        this.parentEntity.statements = [];
      }
      if (this.newEntity.idShort != null && this.referenceType != null) {
        this.parentEntity.statements.push(this.newEntity);

        let first: Reference;
        let second: Reference;
        if (this.parentRelationship?.second) {
          // und die Relation einfügen
          const keysForParentEntity = cloneKeys(this.parentRelationship.second.keys);
          first = new Reference(ReferenceTypes.ModelReference, keysForParentEntity);

          const keysForSecondEntity: Key[] = [...keysForParentEntity, new Key(KeyTypes.Entity, this.newEntity.idShort)];
          second = new Reference(ReferenceTypes.ModelReference, keysForSecondEntity);
        } else {
          // eslint-disable-next-line no-console
          console.log('No parent relationship found');

          const keysForParentEntity: Key[] = [
            new Key(KeyTypes.Submodel, this.submodel?.id ?? ''),
            new Key(KeyTypes.Entity, this.parentEntity.idShort!),
          ];
          first = new Reference(ReferenceTypes.ModelReference, keysForParentEntity);

          const keysForSecondEntity: Key[] = [...keysForParentEntity, new Key(KeyTypes.Entity, this.newEntity.idShort)];
          second = new Reference(ReferenceTypes.ModelReference, keysForSecondEntity);
        }
        const relationshipElement = new RelationshipElement();
        relationshipElement.first = first;
        relationshipElement.second = second;
        relationshipElement.idShort = createUniqueSiblingIdShort(
          this.parentEntity.statements,
          this.referenceType.label,
        );
        relationshipElement.semanticId = new Reference(ReferenceTypes.ExternalReference, [
          new Key(KeyTypes.GlobalReference, this.referenceType.value),
        ]);
        this.parentEntity.statements.push(relationshipElement);
        this.notificationService.showMessageAlways('SUCCESS_CREATE_CHILD', 'SUCCESS', 'success', false);

        this.newEntity = new Entity();
        this.newEntity.entityType = EntityType.SelfManagedEntity;
        this.childCreated.emit(true);
        const refreshEvent = new CustomEvent('refreshEntityTreeNodes');
        window.dispatchEvent(refreshEvent);
      }
    }
  }

  addSpecificAssetId() {
    if (this.newEntity) {
      if (!this.newEntity.specificAssetIds) {
        this.newEntity.specificAssetIds = [];
      }
      this.newEntity.specificAssetIds.push(new SpecificAssetId('', ''));
    }
  }

  removeSpecificAssetId(specificAssetId: SpecificAssetId) {
    if (this.newEntity) {
      this.newEntity.specificAssetIds?.splice(this.newEntity.specificAssetIds.indexOf(specificAssetId), 1);
      if ((this.newEntity.specificAssetIds?.length ?? 0) === 0) {
        this.newEntity.specificAssetIds = null;
      }
    }
  }

  isNewEntityValid() {
    return (
      this.hasIdShort() &&
      this.specificAssetIdsValid() &&
      this.hasExclusiveAssetReference() &&
      this.hasRequiredAssetReference() &&
      !this.hasDuplicateSiblingIdShort() &&
      this.isBulkCountValid() &&
      this.isBulkCountTypeReferenceValid()
    );
  }

  hasIdShort() {
    return this.newEntity?.idShort != null && this.newEntity.idShort.length > 0;
  }

  hasDuplicateSiblingIdShort() {
    const idShort = this.newEntity?.idShort?.trim();
    if (!idShort || !this.parentEntity?.statements?.length) {
      return false;
    }

    return this.parentEntity.statements.some((sme) => sme instanceof Entity && (sme.idShort?.trim() ?? '') === idShort);
  }

  specificAssetIdsValid() {
    return specificAssetIdsAreComplete(this.newEntity);
  }

  hasRequiredAssetReference() {
    return entityHasRequiredAssetReference(this.newEntity);
  }

  hasExclusiveAssetReference() {
    return entityHasExclusiveAssetReference(this.newEntity);
  }

  onAmountChange() {
    const normalized = this.normalizeUnsignedLong(this.amount);
    // element finden und setzen/erzeugen
    let bulkCount = this.getBulkCount(this.newEntity);
    if (normalized == null) {
      if (bulkCount && this.newEntity?.statements) {
        this.newEntity.statements = this.newEntity.statements.filter((s) => s !== bulkCount);
      }
      return;
    }

    if (bulkCount == null) {
      bulkCount = new Property(DataTypeDefXsd.UnsignedLong);
      bulkCount.idShort = 'BulkCount';
      bulkCount.value = normalized;
      bulkCount.semanticId = new Reference(ReferenceTypes.ExternalReference, [
        new Key(KeyTypes.GlobalReference, 'https://admin-shell.io/idta/HierarchicalStructures/BulkCount/1/0'),
      ]);
      if (this.newEntity != null && this.newEntity.statements == null) {
        this.newEntity.statements = [];
      }
      this.newEntity?.statements?.push(bulkCount);
    } else {
      bulkCount.value = normalized;
    }
  }

  isBulkCountValid() {
    return this.normalizeUnsignedLong(this.amount, true) != null;
  }

  isBulkCountTypeReferenceValid() {
    if (this.normalizeUnsignedLong(this.amount) == null) {
      return true;
    }

    return (
      this.newEntity.entityType === EntityType.SelfManagedEntity &&
      (this.newEntity.globalAssetId?.trim().length ?? 0) > 0
    );
  }

  getBulkCount(entity: Entity | undefined) {
    return entity?.statements?.find((s) => this.isBulkCount(s)) as unknown as Property;
  }

  isBulkCount(entity: ISubmodelElement) {
    return this.hasSemanticId(entity, 'https://admin-shell.io/idta/HierarchicalStructures/BulkCount/1/0');
  }

  hasSemanticId(sme: ISubmodelElement | undefined, semanticId: string) {
    return sme?.semanticId?.keys.find((k) => k.value.startsWith(semanticId)) != null;
  }

  search() {
    const ref = this.dialogService.open(SearchForAssetComponent, {
      header: this.translate.instant('SEARCH_FOR_ASSET'),
      width: '50%',
      modal: true,
      dismissableMask: true,
      closeOnEscape: true,
      draggable: true,
      data: {
        apiUrl: this.apiUrl,
      },
      closable: true,
    });

    ref?.onClose.subscribe((foundAsset: any) => {
      if (foundAsset == null) return;
      this.newEntity.globalAssetId = foundAsset.globalAssetId ?? '';
      this.newEntity.specificAssetIds = cloneSpecificAssetIds(foundAsset.specificAssetIds);
      this.cdRef.markForCheck();
    });
  }

  get entityTypeString() {
    return this.entityTypeOptions.find((o) => o.value === this.newEntity?.entityType)?.label ?? 'unset';
  }

  private normalizeUnsignedLong(value: unknown, keepEmptyValid = false): string | null {
    if (value == null) {
      return keepEmptyValid ? '' : null;
    }

    const normalized = String(value).trim();
    if (normalized.length === 0) {
      return keepEmptyValid ? '' : null;
    }

    if (!/^\d+$/.test(normalized)) {
      return null;
    }

    return normalized;
  }
}
