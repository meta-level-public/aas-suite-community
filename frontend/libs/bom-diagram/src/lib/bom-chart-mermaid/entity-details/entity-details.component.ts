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
} from '@aas-core-works/aas-core3.1-typescript/types';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  Input,
  OnChanges,
  output,
} from '@angular/core';
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
  cloneSpecificAssetIds,
  createUniqueSiblingIdShort,
  entityHasExclusiveAssetReference,
  entityHasRequiredAssetReference,
  specificAssetIdsAreComplete,
} from '../utils/entity-asset-reference.util';

@Component({
  selector: 'aas-entity-details',
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
  templateUrl: './entity-details.component.html',
  styleUrl: './entity-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityDetailsComponent implements OnChanges {
  @Input({ required: true }) entity: Entity | undefined;
  @Input({ required: true }) relationship: RelationshipElement | undefined;
  @Input({ required: true }) editable: boolean = true;
  referenceType = input.required<{ label: string; value: string }>();
  @Input({ required: true }) apiUrl: string = '';
  editAssetIds = input<boolean>(true);
  editAmount = input<boolean>(true);
  editEntityType = input<boolean>(true);
  selectAsset = input<boolean>(true);
  requireAssetReference = input<boolean>(false);
  isEntryAssetValid = input<boolean>(true);
  isEntryAssetTypeValid = input<boolean>(true);
  expectedEntryGlobalAssetId = input<string | null | undefined>(undefined);
  siblingIdShorts = input<string[]>([]);
  detailsChanged = output<boolean>();

  dialogService = inject(DialogService);
  translate = inject(TranslateService);
  cdRef = inject(ChangeDetectorRef);

  idShortRegex = /[a-zA-Z0-9_]/;
  entityTypeOptions: { label: string; value: EntityType }[];
  referenceTypeOptions: { label: string; value: string }[];

  amount: number | undefined;
  modelJson: string = '';
  EntityType = EntityType;

  constructor() {
    this.entityTypeOptions = [
      { label: 'SelfManagedEntity', value: EntityType.SelfManagedEntity },
      { label: 'CoManagedEntity', value: EntityType.CoManagedEntity },
    ];
    this.referenceTypeOptions = [
      { label: 'HasPart', value: 'https://admin-shell.io/idta/HierarchicalStructures/HasPart/1/0' },
      { label: 'IsPartOf', value: 'https://admin-shell.io/idta/HierarchicalStructures/IsPartOf/1/0' },
      { label: 'SameAs', value: 'https://admin-shell.io/idta/HierarchicalStructures/SameAs/1/0' },
    ];
  }

  ngOnChanges() {
    this.modelJson = JSON.stringify(this.entity);
    this.amount = this.getBulkCount(this.entity)?.value
      ? parseInt(this.getBulkCount(this.entity)?.value ?? '')
      : undefined;

    const ref = this.referenceType();
    if (ref != null && this.relationship != null) {
      if ((this.relationship.idShort?.trim().length ?? 0) === 0) {
        this.relationship.idShort = createUniqueSiblingIdShort(this.entity?.statements, ref.label, this.relationship);
      }
      this.relationship.semanticId = new Reference(ReferenceTypes.ExternalReference, [
        new Key(KeyTypes.GlobalReference, ref.value),
      ]);
    }
  }

  addSpecificAssetId() {
    if (this.entity) {
      if (!this.entity.specificAssetIds) {
        this.entity.specificAssetIds = [];
      }
      this.entity.specificAssetIds.push(new SpecificAssetId('', ''));
    }
  }

  removeSpecificAssetId(specificAssetId: SpecificAssetId) {
    if (this.entity) {
      this.entity.specificAssetIds?.splice(this.entity.specificAssetIds.indexOf(specificAssetId), 1);
      if ((this.entity.specificAssetIds?.length ?? 0) === 0) {
        this.entity.specificAssetIds = null;
      }
    }
  }

  hasIdShort() {
    return this.entity?.idShort != null && this.entity.idShort.length > 0;
  }

  hasDuplicateSiblingIdShort() {
    const candidate = this.entity?.idShort?.trim();
    if (!candidate) {
      return false;
    }
    return this.siblingIdShorts().some((idShort) => idShort === candidate);
  }

  specificAssetIdsValid() {
    return specificAssetIdsAreComplete(this.entity);
  }

  hasExclusiveAssetReference() {
    return entityHasExclusiveAssetReference(this.entity);
  }

  hasRequiredAssetReference() {
    return !this.requireAssetReference() || entityHasRequiredAssetReference(this.entity);
  }

  onIdShortChange() {
    if (this.relationship?.second) {
      this.relationship.second.keys[this.relationship.second.keys.length - 1].value = this.entity?.idShort ?? '';
    }
    this.markAsChanged();
  }

  onAmountChange() {
    const normalized = this.normalizeUnsignedLong(this.amount);
    // element finden und setzen/erzeugen
    let bulkCount = this.getBulkCount(this.entity);
    if (normalized == null) {
      if (bulkCount && this.entity?.statements) {
        this.entity.statements = this.entity.statements.filter((s) => s !== bulkCount);
      }
      this.markAsChanged();
      return;
    }

    if (bulkCount == null) {
      bulkCount = new Property(DataTypeDefXsd.UnsignedLong);
      bulkCount.idShort = 'BulkCount';
      bulkCount.value = normalized;
      bulkCount.semanticId = new Reference(ReferenceTypes.ExternalReference, [
        new Key(KeyTypes.GlobalReference, 'https://admin-shell.io/idta/HierarchicalStructures/BulkCount/1/0'),
      ]);
      if (this.entity != null && this.entity.statements == null) {
        this.entity.statements = [];
      }
      this.entity?.statements?.push(bulkCount);
    } else {
      bulkCount.value = normalized;
    }
    this.markAsChanged();
  }

  isBulkCountValid() {
    return this.normalizeUnsignedLong(this.amount, true) != null;
  }

  isBulkCountTypeReferenceValid() {
    if (this.normalizeUnsignedLong(this.amount) == null) {
      return true;
    }

    return (
      this.entity?.entityType === EntityType.SelfManagedEntity && (this.entity.globalAssetId?.trim().length ?? 0) > 0
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

  markAsChanged() {
    if (JSON.stringify(this.entity) !== this.modelJson) {
      this.detailsChanged.emit(true);
    }
  }

  search() {
    const ref = this.dialogService.open(SearchForAssetComponent, {
      header: this.translate.instant('SEARCH_FOR_ASSET'),
      width: '50%',
      data: {
        apiUrl: this.apiUrl,
      },
    });

    ref?.onClose.subscribe((foundAsset: any) => {
      if (this.entity != null && foundAsset != null) {
        this.entity.globalAssetId = foundAsset.globalAssetId;
        if (foundAsset.specificAssetIds?.length > 0) {
          this.entity.specificAssetIds = cloneSpecificAssetIds(foundAsset.specificAssetIds);
        }
        this.cdRef.markForCheck();
      }
    });
  }

  get entityTypeString() {
    return this.entityTypeOptions.find((o) => o.value === this.entity?.entityType)?.label ?? 'unset';
  }

  adoptCurrentAasGlobalAssetId() {
    const value = this.expectedEntryGlobalAssetId();
    if (!this.entity || value == null || value.trim().length === 0) {
      return;
    }
    this.entity.globalAssetId = value;
    this.markAsChanged();
    this.cdRef.markForCheck();
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
