import { Component, computed, inject, model, ModelSignal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { StepsModule } from 'primeng/steps';

import {
  AssetInformation,
  Entity,
  EntityType,
  ISubmodelElement,
  Key,
  KeyTypes,
  Property,
  Reference,
  ReferenceTypes,
  RelationshipElement,
  Submodel,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { AasConfirmationService } from '@aas/common-services';
import { MenuItem } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EntityDetailsComponent } from '../entity-details/entity-details.component';
import {
  cloneSpecificAssetIds,
  createUniqueSiblingIdShort,
  entityHasExclusiveAssetReference,
  entityHasRequiredAssetReference,
  specificAssetIdsAreComplete,
} from '../utils/entity-asset-reference.util';
import { SelectTypeComponent } from './select-type/select-type.component';

@Component({
  selector: 'aas-init-bom-assistant',
  imports: [
    FormsModule,
    MarkdownModule,
    SelectButtonModule,
    TranslateModule,
    ButtonModule,
    StepsModule,
    SelectTypeComponent,
    EntityDetailsComponent,
  ],
  templateUrl: './init-bom-assistant.component.html',
  styleUrl: './init-bom-assistant.component.css',
  providers: [provideMarkdown()],
})
export class InitBomAssistantComponent implements OnInit {
  config = inject(DynamicDialogConfig);
  translate = inject(TranslateService);
  ref = inject(DynamicDialogRef);
  confirmService = inject(AasConfirmationService);

  archeType: ModelSignal<'Full' | 'OneUp' | 'OneDown' | undefined> = model<'Full' | 'OneUp' | 'OneDown' | undefined>(
    undefined,
  );

  rootEntity = new Entity();
  firstChildEntity = new Entity();

  items: MenuItem[] | undefined;

  active: number = 0;
  hasUserChanges = false;
  assetInformation: AssetInformation;
  apiUrl: string = '';
  submodel: Submodel;
  reinitialize: boolean = false;

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

  constructor() {
    this.apiUrl = this.config.data.apiUrl;
    this.submodel = this.config.data.submodel;
    this.reinitialize = this.config.data.reinitialize === true;
    this.rootEntity.entityType = EntityType.SelfManagedEntity;
    this.firstChildEntity.entityType = EntityType.SelfManagedEntity;

    this.assetInformation = this.config.data.assetInformation;

    if (this.assetInformation != null) {
      this.rootEntity.globalAssetId = this.assetInformation.globalAssetId;
      this.rootEntity.specificAssetIds = cloneSpecificAssetIds(this.assetInformation.specificAssetIds);
    }
    this.rootEntity.idShort = this.config.data.idShort;
  }

  ngOnInit() {
    this.items = [
      {
        label: this.translate.instant('SELECT_ARCHETYPE'),
      },
      {
        label: this.translate.instant('DEFINE_ENTRY_NODE'),
      },
      {
        label: this.translate.instant('DEFINE_FIRST_CHILD'),
      },
    ];
  }

  selectedType(event: 'Full' | 'OneUp' | 'OneDown' | undefined) {
    this.archeType.set(event);
    this.markAsChanged();
    if (event != null && this.active === 0) {
      this.next();
    }
  }

  next() {
    this.active++;
  }

  prev() {
    this.active--;
  }

  markAsChanged() {
    this.hasUserChanges = true;
  }

  async cancel() {
    if (!this.hasUserChanges) {
      this.ref.close();
      return;
    }

    const confirmed = await this.confirmService.confirm({
      message: this.translate.instant('CANCEL_EDITING_Q'),
    });

    if (confirmed) {
      this.ref.close();
    }
  }

  finish() {
    if (!this.canFinish()) {
      return;
    }

    // jetzt wirds spannend
    // Entity im Submodel ablegen
    // Entity innerhalb der ersten ablegen
    // Relationship zwischen beiden im submodel ablegen
    // archetype setzen

    if (this.submodel.submodelElements == null) {
      this.submodel.submodelElements = [];
    }

    if (this.reinitialize) {
      this.submodel.submodelElements = this.submodel.submodelElements.filter((sme) => !this.isEntryNodeElement(sme));
    }

    this.submodel.submodelElements.push(this.rootEntity);

    if (this.rootEntity.statements == null) {
      this.rootEntity.statements = [];
    }
    this.rootEntity.statements.push(this.firstChildEntity);

    this.rootEntity.semanticId = new Reference(ReferenceTypes.ExternalReference, [
      new Key(KeyTypes.GlobalReference, 'https://admin-shell.io/idta/HierarchicalStructures/EntryNode/1/0'),
    ]);

    this.firstChildEntity.semanticId = new Reference(ReferenceTypes.ExternalReference, [
      new Key(KeyTypes.GlobalReference, 'https://admin-shell.io/idta/HierarchicalStructures/Node/1/0'),
    ]);

    const first = new Reference(ReferenceTypes.ModelReference, [
      new Key(KeyTypes.Submodel, this.submodel.id),
      new Key(KeyTypes.Entity, this.rootEntity.idShort!),
    ]);
    const second = new Reference(ReferenceTypes.ModelReference, [
      new Key(KeyTypes.Submodel, this.submodel.id),
      new Key(KeyTypes.Entity, this.rootEntity.idShort!),
      new Key(KeyTypes.Entity, this.firstChildEntity.idShort!),
    ]);
    const relationship = new RelationshipElement();
    relationship.first = first;
    relationship.second = second;
    relationship.idShort = createUniqueSiblingIdShort(this.rootEntity.statements, this.referenceType().label);
    relationship.semanticId = new Reference(ReferenceTypes.ExternalReference, [
      new Key(KeyTypes.GlobalReference, this.referenceType().value),
    ]);

    this.rootEntity.statements.push(relationship);

    if (this.submodel != null) {
      for (const sme of this.submodel.submodelElements ?? []) {
        if (this.hasSemanticId(sme, 'https://admin-shell.io/idta/HierarchicalStructures/ArcheType/1/0')) {
          (sme as Property).value = this.archeType() ?? '';
        }
      }
    }

    const refreshEvent = new CustomEvent('refreshEntityTreeNodes');
    window.dispatchEvent(refreshEvent);
    this.ref.close();
  }

  hasSemanticId(sme: ISubmodelElement | undefined, semanticId: string) {
    return sme?.semanticId?.keys.find((k) => k.value.startsWith(semanticId)) != null;
  }

  isEntryNodeElement(sme: ISubmodelElement) {
    if (!(sme instanceof Entity)) {
      return false;
    }
    return (
      this.hasSemanticId(sme, 'https://admin-shell.io/idta/HierarchicalStructures/EntryNode/1/0') ||
      this.hasSemanticId(sme, 'https://admin-shell.io/idta/HierarchicalStructures/EntryNode/1/1') ||
      sme.idShort === 'EntryNode'
    );
  }

  canFinish() {
    return (
      !!this.rootEntity.idShort &&
      !!this.firstChildEntity.idShort &&
      this.isEntryAssetValid() &&
      this.isEntryAssetTypeValid() &&
      !this.hasArchetypeConflict() &&
      !this.hasExistingEntryNodeWithoutReinitialize() &&
      !this.hasDuplicateTopLevelIdShort() &&
      this.hasExclusiveAssetReferences() &&
      this.hasValidSpecificAssetIds() &&
      this.hasValidFirstChildAssetReference() &&
      !this.hasInvalidBulkCountValues() &&
      this.isEntityBulkCountTypeReferenceValid(this.rootEntity) &&
      this.isEntityBulkCountTypeReferenceValid(this.firstChildEntity)
    );
  }

  hasValidSpecificAssetIds() {
    return specificAssetIdsAreComplete(this.rootEntity) && specificAssetIdsAreComplete(this.firstChildEntity);
  }

  hasExclusiveAssetReferences() {
    return entityHasExclusiveAssetReference(this.rootEntity) && entityHasExclusiveAssetReference(this.firstChildEntity);
  }

  hasValidFirstChildAssetReference() {
    return entityHasRequiredAssetReference(this.firstChildEntity);
  }

  private isEntryAssetValid() {
    const expected = this.assetInformation?.globalAssetId?.trim();
    if (!expected) {
      return true;
    }
    return (this.rootEntity.globalAssetId?.trim() ?? '') === expected;
  }

  private isEntryAssetTypeValid() {
    return this.rootEntity.entityType === EntityType.SelfManagedEntity;
  }

  hasArchetypeConflict() {
    if (this.reinitialize) {
      return false;
    }

    const relationTypes = this.collectRelationTypes(this.submodel?.submodelElements ?? []);
    if (relationTypes.size === 0) {
      return false;
    }

    if (relationTypes.has('HasPart') && relationTypes.has('IsPartOf')) {
      return true;
    }

    const expectedType = this.referenceType().label === 'IsPartOf' ? 'IsPartOf' : 'HasPart';
    return !relationTypes.has(expectedType);
  }

  hasExistingEntryNodeWithoutReinitialize() {
    if (this.reinitialize) {
      return false;
    }

    return (this.submodel?.submodelElements ?? []).some((sme) => this.isEntryNodeElement(sme));
  }

  hasDuplicateTopLevelIdShort() {
    if (this.reinitialize) {
      return false;
    }

    const candidate = this.rootEntity.idShort?.trim();
    if (!candidate) {
      return false;
    }

    return (this.submodel?.submodelElements ?? []).some((sme) => (sme.idShort?.trim() ?? '') === candidate);
  }

  private collectRelationTypes(elements: ISubmodelElement[]): Set<'HasPart' | 'IsPartOf'> {
    const types = new Set<'HasPart' | 'IsPartOf'>();

    for (const element of elements) {
      if (element instanceof RelationshipElement) {
        if (this.hasSemanticId(element, 'https://admin-shell.io/idta/HierarchicalStructures/HasPart/1/0')) {
          types.add('HasPart');
        }
        if (this.hasSemanticId(element, 'https://admin-shell.io/idta/HierarchicalStructures/IsPartOf/1/0')) {
          types.add('IsPartOf');
        }
      }

      if (element instanceof Entity && element.statements?.length) {
        const nested = this.collectRelationTypes(element.statements);
        nested.forEach((type) => types.add(type));
      }
    }

    return types;
  }

  hasInvalidBulkCountValues() {
    return !this.isEntityBulkCountValid(this.rootEntity) || !this.isEntityBulkCountValid(this.firstChildEntity);
  }

  hasBulkCountTypeReferenceConflict() {
    return (
      !this.isEntityBulkCountTypeReferenceValid(this.rootEntity) ||
      !this.isEntityBulkCountTypeReferenceValid(this.firstChildEntity)
    );
  }

  private isEntityBulkCountValid(entity: Entity) {
    const bulkCount = entity.statements?.find((sme) =>
      this.hasSemanticId(sme, 'https://admin-shell.io/idta/HierarchicalStructures/BulkCount/1/0'),
    ) as Property | undefined;

    if (!bulkCount?.value || bulkCount.value.trim().length === 0) {
      return true;
    }

    return /^\d+$/.test(bulkCount.value.trim());
  }

  private isEntityBulkCountTypeReferenceValid(entity: Entity) {
    const bulkCount = entity.statements?.find((sme) =>
      this.hasSemanticId(sme, 'https://admin-shell.io/idta/HierarchicalStructures/BulkCount/1/0'),
    ) as Property | undefined;
    if (!bulkCount?.value || bulkCount.value.trim().length === 0) {
      return true;
    }

    return entity.entityType === EntityType.SelfManagedEntity && (entity.globalAssetId?.trim().length ?? 0) > 0;
  }
}
