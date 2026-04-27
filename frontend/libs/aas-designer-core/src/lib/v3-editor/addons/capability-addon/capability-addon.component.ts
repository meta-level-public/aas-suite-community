import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HelpLabelComponent } from '@aas/common-components';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { V3LangStringListComponent } from '../../components/v3-lang-string-list/v3-lang-string-list.component';

type CapabilityRole = 'Required' | 'Offered' | 'NotAssigned';
type CapabilityPropertyType = 'Property' | 'Range' | 'MultiLanguageProperty' | 'SubmodelElementList';
type PropertyConstraintType = 'BasicConstraint' | 'CustomConstraint' | 'OCLConstraint' | 'OperationConstraint';
type ConditionalType = 'Pre' | 'Post' | 'Invariant' | 'PrePost' | 'PreInvariant' | 'InvariantPost' | 'PrePostInvariant';

type CapabilityPropertyDraft = {
  idShort: string;
  type: CapabilityPropertyType;
  valueType: aas.types.DataTypeDefXsd;
  semanticId: string;
  valueId: string;
  value: string;
  mlpValue: aas.types.LangStringTextType[] | null;
  min: string;
  max: string;
};

type PropertyContainerDraft = {
  idShort: string;
  commentValue: aas.types.LangStringTextType[] | null;
  properties: CapabilityPropertyDraft[];
};

type PropertyConstraintDraft = {
  idShort: string;
  type: PropertyConstraintType;
  conditionalType: ConditionalType;
  value: string;
  targetProperties: string[];
  targetPropertyInput: string;
  selectedTargetProperty: string;
};

type TransitionConstraintDraft = {
  idShort: string;
  conditionalType: ConditionalType;
  targetCapability: string;
};

type CapabilityRelationTargetDraft = {
  mode: 'internal' | 'external';
  value: string;
};

type CapabilityAddonDialogData = {
  count?: number;
  currentLanguage?: string;
  currentSubmodelId?: string;
  availableCapabilityRefs?: string[];
  existingCapabilityContainer?: aas.types.SubmodelElementCollection;
};

@Component({
  selector: 'vws-capability-addon',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    TextareaModule,
    SelectModule,
    FieldsetModule,
    HelpLabelComponent,
    V3LangStringListComponent,
  ],
  templateUrl: './capability-addon.component.html',
  styles: [
    `
      :host ::ng-deep .capability-fieldset .p-fieldset-legend {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0rem !important;
      }

      :host ::ng-deep .capability-fieldset.p-fieldset-toggleable .p-fieldset-legend a {
        padding: 0rem !important;
      }

      :host ::ng-deep .capability-fieldset.p-fieldset-toggleable .p-fieldset-toggle-button {
        display: flex;
        align-items: center;
        width: 100%;
      }

      :host ::ng-deep .capability-fieldset .p-fieldset-legend-label,
      :host ::ng-deep .capability-fieldset .p-fieldset-legend-text {
        display: flex;
        align-items: center;
        flex: 1;
        width: 100%;
      }
    `,
  ],
})
export class CapabilityAddonComponent {
  ref: DynamicDialogRef = inject(DynamicDialogRef);
  dialogService = inject(DialogService);
  private readonly StringIsNumber = (value: any) => isNaN(Number(value)) === false;

  roleOptions: { label: string; value: CapabilityRole }[] = [
    { label: 'Required', value: 'Required' },
    { label: 'Offered', value: 'Offered' },
    { label: 'NotAssigned', value: 'NotAssigned' },
  ];

  propertyTypeOptions: { label: string; value: CapabilityPropertyType }[] = [
    { label: 'Property', value: 'Property' },
    { label: 'Range', value: 'Range' },
    { label: 'MultiLanguageProperty', value: 'MultiLanguageProperty' },
    { label: 'SubmodelElementList', value: 'SubmodelElementList' },
  ];

  propertyConstraintTypeOptions: { label: string; value: PropertyConstraintType }[] = [
    { label: 'BasicConstraint', value: 'BasicConstraint' },
    { label: 'CustomConstraint', value: 'CustomConstraint' },
    { label: 'OCLConstraint', value: 'OCLConstraint' },
    { label: 'OperationConstraint', value: 'OperationConstraint' },
  ];

  conditionalTypeOptions: { label: string; value: ConditionalType }[] = [
    { label: 'Pre', value: 'Pre' },
    { label: 'Post', value: 'Post' },
    { label: 'Invariant', value: 'Invariant' },
    { label: 'PrePost', value: 'PrePost' },
    { label: 'PreInvariant', value: 'PreInvariant' },
    { label: 'InvariantPost', value: 'InvariantPost' },
    { label: 'PrePostInvariant', value: 'PrePostInvariant' },
  ];

  valueTypeOptions: { label: string; value: aas.types.DataTypeDefXsd }[] = Object.keys(aas.types.DataTypeDefXsd)
    .filter(this.StringIsNumber)
    .map((key) => ({
      label: aas.types.DataTypeDefXsd[key as any],
      value: +key as aas.types.DataTypeDefXsd,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  capabilityIdShort = 'Capability00';
  capabilityCommentParent: { value: aas.types.LangStringTextType[] | null } = { value: null };
  supplementalSemanticIdInput = '';
  supplementalSemanticIds: string[] = [];
  role: CapabilityRole = 'NotAssigned';
  currentLanguage = 'de';
  currentSubmodelId = '';

  propertyContainers: PropertyContainerDraft[] = [];
  propertyConstraints: PropertyConstraintDraft[] = [];
  transitionConstraints: TransitionConstraintDraft[] = [];

  availableCapabilityRefs: string[] = [];
  selectedRealizedBy = '';
  selectedGeneralizedBy = '';
  realizedByInput = '';
  generalizedByInput = '';
  relationModeOptions: { label: string; value: 'internal' | 'external' }[] = [
    { label: 'ModelReference', value: 'internal' },
    { label: 'ExternalReference', value: 'external' },
  ];
  realizedByRefs: CapabilityRelationTargetDraft[] = [];
  generalizedByRefs: CapabilityRelationTargetDraft[] = [];
  existingCapabilityContainer: aas.types.SubmodelElementCollection | null = null;

  constructor() {
    const instance = this.dialogService.getInstance(this.ref);
    const data = (instance?.data ?? {}) as CapabilityAddonDialogData;
    const count = data.count ?? 0;
    this.capabilityIdShort = `Capability${count.toString().padStart(2, '0')}`;
    this.currentLanguage = data.currentLanguage ?? 'de';
    this.currentSubmodelId = data.currentSubmodelId ?? '';
    this.availableCapabilityRefs = data.availableCapabilityRefs ?? [];
    this.existingCapabilityContainer = data.existingCapabilityContainer ?? null;
    if (this.existingCapabilityContainer != null) {
      this.applyDraftFromExistingContainer(this.existingCapabilityContainer);
    }
  }

  get validationErrorKeys(): string[] {
    const errors: string[] = [];

    if (this.capabilityIdShort.trim() === '') {
      errors.push('CAPABILITY_VALIDATION_ID_SHORT_REQUIRED');
    }

    this.propertyContainers.forEach((container) => {
      container.properties.forEach((property) => {
        if (property.idShort.trim() === '') {
          errors.push('CAPABILITY_VALIDATION_PROPERTY_ID_SHORT_REQUIRED');
        }
      });
    });

    this.propertyConstraints.forEach((constraint) => {
      if (constraint.idShort.trim() === '') {
        errors.push('CAPABILITY_VALIDATION_PROPERTY_CONSTRAINT_ID_SHORT_REQUIRED');
      }
      if (constraint.value.trim() === '') {
        errors.push('CAPABILITY_VALIDATION_PROPERTY_CONSTRAINT_VALUE_REQUIRED');
      }
      if (constraint.targetProperties.length === 0) {
        errors.push('CAPABILITY_VALIDATION_PROPERTY_CONSTRAINT_TARGET_REQUIRED');
      }
    });

    this.transitionConstraints.forEach((constraint) => {
      if (constraint.idShort.trim() === '') {
        errors.push('CAPABILITY_VALIDATION_TRANSITION_CONSTRAINT_ID_SHORT_REQUIRED');
      }
      if (constraint.targetCapability.trim() === '') {
        errors.push('CAPABILITY_VALIDATION_TRANSITION_CONSTRAINT_TARGET_REQUIRED');
      }
    });

    return errors;
  }

  get canApply(): boolean {
    return this.validationErrorKeys.length === 0;
  }

  get propertyReferenceOptions(): string[] {
    return this.propertyContainers
      .flatMap((c) => c.properties)
      .map((p) => p.idShort.trim())
      .filter((idShort) => idShort !== '');
  }

  addPropertyContainer() {
    this.propertyContainers.push({
      idShort: `PropertyContainer${this.propertyContainers.length.toString().padStart(2, '0')}`,
      commentValue: null,
      properties: [this.createDefaultPropertyDraft(0)],
    });
  }

  removePropertyContainer(containerIndex: number) {
    this.propertyContainers.splice(containerIndex, 1);
  }

  addPropertyToContainer(containerIndex: number) {
    const container = this.propertyContainers[containerIndex];
    if (container == null) return;
    container.properties.push(this.createDefaultPropertyDraft(container.properties.length));
  }

  removePropertyFromContainer(containerIndex: number, propIndex: number) {
    this.propertyContainers[containerIndex]?.properties.splice(propIndex, 1);
  }

  private createDefaultPropertyDraft(index: number): CapabilityPropertyDraft {
    return {
      idShort: `Property${index.toString().padStart(2, '0')}`,
      type: 'Property',
      valueType: aas.types.DataTypeDefXsd.String,
      semanticId: '',
      valueId: '',
      value: '',
      mlpValue: null,
      min: '',
      max: '',
    };
  }

  addPropertyConstraint() {
    this.propertyConstraints.push({
      idShort: `PropertyConstraint${this.propertyConstraints.length.toString().padStart(2, '0')}`,
      type: 'BasicConstraint',
      conditionalType: 'Pre',
      value: '',
      targetProperties: [],
      targetPropertyInput: '',
      selectedTargetProperty: '',
    });
  }

  removePropertyConstraint(index: number) {
    this.propertyConstraints.splice(index, 1);
  }

  addConstraintTargetProperty(index: number, propertyRef: string) {
    const normalized = propertyRef.trim();
    if (normalized === '') return;
    const draft = this.propertyConstraints[index];
    if (draft == null || draft.targetProperties.includes(normalized)) return;
    draft.targetProperties.push(normalized);
  }

  removeConstraintTargetProperty(constraintIndex: number, propertyIndex: number) {
    this.propertyConstraints[constraintIndex]?.targetProperties.splice(propertyIndex, 1);
  }

  addTransitionConstraint() {
    this.transitionConstraints.push({
      idShort: `TransitionConstraint${this.transitionConstraints.length.toString().padStart(2, '0')}`,
      conditionalType: 'Pre',
      targetCapability: '',
    });
  }

  removeTransitionConstraint(index: number) {
    this.transitionConstraints.splice(index, 1);
  }

  addRealizedBy(ref: string, mode: 'internal' | 'external' = 'internal') {
    const normalized = ref.trim();
    if (normalized === '') return;
    if (this.realizedByRefs.some((entry) => entry.mode === mode && entry.value === normalized)) return;
    this.realizedByRefs.push({ mode, value: normalized });
    this.realizedByInput = '';
  }

  addGeneralizedBy(ref: string, mode: 'internal' | 'external' = 'internal') {
    const normalized = ref.trim();
    if (normalized === '') return;
    if (this.generalizedByRefs.some((entry) => entry.mode === mode && entry.value === normalized)) return;
    this.generalizedByRefs.push({ mode, value: normalized });
    this.generalizedByInput = '';
  }

  removeRealizedBy(index: number) {
    this.realizedByRefs.splice(index, 1);
  }

  removeGeneralizedBy(index: number) {
    this.generalizedByRefs.splice(index, 1);
  }

  addSupplementalSemanticId(value: string) {
    const normalized = value.trim();
    if (normalized === '' || this.supplementalSemanticIds.includes(normalized)) return;
    this.supplementalSemanticIds.push(normalized);
    this.supplementalSemanticIdInput = '';
  }

  removeSupplementalSemanticId(index: number) {
    this.supplementalSemanticIds.splice(index, 1);
  }

  normalizeSupplementalSemanticId(index: number) {
    const value = this.supplementalSemanticIds[index];
    if (value == null) return;
    const normalized = value.trim();
    if (normalized === '') {
      this.removeSupplementalSemanticId(index);
      return;
    }
    this.supplementalSemanticIds[index] = normalized;
  }

  apply() {
    if (!this.canApply) return;
    const idShort = this.capabilityIdShort.trim();

    const capabilityContainer = new aas.types.SubmodelElementCollection(null, null, `CapabilityContainer${idShort}`);
    capabilityContainer.semanticId = this.createExternalRef(
      'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0',
    );
    capabilityContainer.value = [];

    const capability = new aas.types.Capability();
    capability.idShort = idShort;
    capability.semanticId = this.createExternalRef('https://admin-shell.io/idta/CapabilityDescription/Capability/1/0');
    capability.qualifiers = [this.createRoleQualifier(this.role)];
    capability.supplementalSemanticIds =
      this.supplementalSemanticIds.length > 0
        ? this.supplementalSemanticIds.map((entry) => this.createExternalRef(entry))
        : null;
    capabilityContainer.value.push(capability);

    const normalizedComments = (this.capabilityCommentParent.value ?? [])
      .map((entry) => ({ language: entry.language.trim(), text: entry.text.trim() }))
      .filter((entry) => entry.language !== '' && entry.text !== '');
    if (normalizedComments.length > 0) {
      const comment = new aas.types.MultiLanguageProperty();
      comment.idShort = 'CapabilityComment';
      comment.semanticId = this.createExternalRef(
        'https://admin-shell.io/idta/CapabilityDescription/CapabilityComment/1/0',
      );
      comment.value = normalizedComments.map((entry) => new aas.types.LangStringTextType(entry.language, entry.text));
      capabilityContainer.value.push(comment);
    }

    if (this.propertyContainers.length > 0) {
      const propertySet = new aas.types.SubmodelElementCollection(null, null, 'PropertySet');
      propertySet.semanticId = this.createExternalRef(
        'https://admin-shell.io/idta/CapabilityDescription/PropertySet/1/0',
      );
      propertySet.value = [];
      this.propertyContainers.forEach((containerDraft, index) => {
        propertySet.value?.push(this.createPropertyContainer(containerDraft, index));
      });
      capabilityContainer.value.push(propertySet);
    }

    const capabilityRelations = this.createCapabilityRelations(capability.idShort ?? idShort);
    if (capabilityRelations != null) {
      capabilityContainer.value.push(capabilityRelations);
    }

    this.ref.close(capabilityContainer);
  }

  cancel() {
    this.ref.close(null);
  }

  private createCapabilityRelations(capabilityIdShort: string): aas.types.SubmodelElementCollection | null {
    const hasRelations =
      this.realizedByRefs.length > 0 ||
      this.generalizedByRefs.length > 0 ||
      this.propertyConstraints.length > 0 ||
      this.transitionConstraints.length > 0;

    if (!hasRelations) {
      return null;
    }

    const relations = new aas.types.SubmodelElementCollection(null, null, 'CapabilityRelations');
    relations.semanticId = this.createExternalRef(
      'https://admin-shell.io/idta/CapabilityDescription/CapabilityRelations/1/0',
    );
    relations.value = [];

    this.realizedByRefs
      .map((target) => ({ ...target, value: target.value.trim() }))
      .filter((target) => target.value !== '')
      .forEach((target, index) => {
        const rel = new aas.types.RelationshipElement();
        rel.idShort = `CapabilityRealizedBy${index.toString().padStart(2, '0')}`;
        rel.semanticId = this.createExternalRef(
          'https://adminshell.io/idta/CapabilityDescription/CapabilityRealizedBy/1/0',
        );
        rel.first = this.createCapabilityReference(capabilityIdShort);
        rel.second = this.createRelationTargetReference(target);
        relations.value?.push(rel);
      });

    if (this.generalizedByRefs.length > 0) {
      const generalizedBySet = new aas.types.SubmodelElementCollection(null, null, 'GeneralizedBySet');
      generalizedBySet.semanticId = this.createExternalRef(
        'https://admin-shell.io/idta/CapabilityDescription/GeneralizedBySet/1/0',
      );
      generalizedBySet.value = [];
      this.generalizedByRefs
        .map((target) => ({ ...target, value: target.value.trim() }))
        .filter((target) => target.value !== '')
        .forEach((target, index) => {
          const rel = new aas.types.RelationshipElement();
          rel.idShort = `CapabilityGeneralizedBy${index.toString().padStart(2, '0')}`;
          rel.semanticId = this.createExternalRef(
            'https://adminshell.io/idta/CapabilityDescription/CapabilityGeneralizedBy/1/0',
          );
          rel.first = this.createCapabilityReference(capabilityIdShort);
          rel.second = this.createRelationTargetReference(target);
          generalizedBySet.value?.push(rel);
        });
      relations.value.push(generalizedBySet);
    }

    const constraintSet = this.createConstraintSet(capabilityIdShort);
    if (constraintSet != null) {
      relations.value.push(constraintSet);
    }

    return relations;
  }

  private createConstraintSet(capabilityIdShort: string): aas.types.SubmodelElementCollection | null {
    if (this.propertyConstraints.length === 0 && this.transitionConstraints.length === 0) {
      return null;
    }

    const constraintSet = new aas.types.SubmodelElementCollection(null, null, 'ConstraintSet');
    constraintSet.semanticId = this.createExternalRef(
      'https://admin-shell.io/idta/CapabilityDescription/ConstraintSet/1/0',
    );
    constraintSet.value = [];

    this.propertyConstraints.forEach((draft, index) => {
      const container = new aas.types.SubmodelElementCollection(
        null,
        null,
        draft.idShort.trim() || `PropertyConstraintContainer${index.toString().padStart(2, '0')}`,
      );
      container.semanticId = this.createExternalRef(
        'https://adminshell.io/idta/CapabilityDescription/PropertyConstraintContainer/1/0',
      );
      container.value = [];

      container.value.push(this.createPropertyConstraintTypeElement(draft));

      const conditional = new aas.types.Property(aas.types.DataTypeDefXsd.String);
      conditional.idShort = 'PropertyConditionalType';
      conditional.semanticId = this.createExternalRef(
        'https://adminshell.io/idta/CapabilityDescription/PropertyConditionalType/1/0',
      );
      conditional.value = draft.conditionalType;
      container.value.push(conditional);

      const relCollection = new aas.types.SubmodelElementCollection(null, null, 'ConstraintPropertyRelations');
      relCollection.semanticId = this.createExternalRef(
        'https://admin-shell.io/idta/CapabilityDescription/ConstraintPropertyRelations/1/0',
      );
      relCollection.value = [];

      draft.targetProperties.forEach((target, targetIndex) => {
        const rel = new aas.types.RelationshipElement();
        rel.idShort = `ConstraintHasProperty${targetIndex.toString().padStart(2, '0')}`;
        rel.semanticId = this.createExternalRef(
          'https://adminshell.io/idta/CapabilityDescription/ConstraintHasProperty/1/0',
        );
        rel.first = this.createConstraintReference(container.idShort ?? draft.idShort);
        rel.second = this.createPropertyReference(target);
        relCollection.value?.push(rel);
      });

      container.value.push(relCollection);
      constraintSet.value?.push(container);
    });

    this.transitionConstraints.forEach((draft, index) => {
      const container = new aas.types.SubmodelElementCollection(
        null,
        null,
        draft.idShort.trim() || `TransitionConstraintContainer${index.toString().padStart(2, '0')}`,
      );
      container.semanticId = this.createExternalRef(
        'https://adminshell.io/idta/CapabilityDescription/TransitionConstraintContainer/1/0',
      );
      container.value = [];

      const constrainedBy = new aas.types.RelationshipElement();
      constrainedBy.idShort = 'TransitionConstrainedBy';
      constrainedBy.semanticId = this.createExternalRef(
        'https://adminshell.io/idta/CapabilityDescription/TransitionConstrainedBy/1/0',
      );
      constrainedBy.first = this.createCapabilityReference(capabilityIdShort);
      constrainedBy.second = this.createExternalRef(draft.targetCapability.trim());
      container.value.push(constrainedBy);

      const conditional = new aas.types.Property(aas.types.DataTypeDefXsd.String);
      conditional.idShort = 'TransitionConditionalType';
      conditional.semanticId = this.createExternalRef(
        'https://admin-shell.io/idta/CapabilityDescription/TransitionConditionalType/1/0',
      );
      conditional.value = draft.conditionalType;
      container.value.push(conditional);

      constraintSet.value?.push(container);
    });

    return constraintSet;
  }

  private createPropertyConstraintTypeElement(draft: PropertyConstraintDraft): aas.types.ISubmodelElement {
    switch (draft.type) {
      case 'OperationConstraint': {
        const operation = new aas.types.ReferenceElement();
        operation.idShort = 'OperationConstraint';
        operation.semanticId = this.createExternalRef(
          'https://adminshell.io/idta/CapabilityDescription/PropertyConstraintType/OperationConstraint/1/0',
        );
        operation.value = this.createExternalRef(draft.value.trim() || 'OperationReference');
        return operation;
      }
      case 'OCLConstraint': {
        const ocl = new aas.types.File();
        ocl.idShort = 'OCLConstraint';
        ocl.semanticId = this.createExternalRef(
          'https://adminshell.io/idta/CapabilityDescription/PropertyConstraintType/OCLConstraint/1/0',
        );
        ocl.contentType = 'text/plain';
        ocl.value = draft.value.trim() || 'constraint.ocl';
        return ocl;
      }
      case 'CustomConstraint': {
        const custom = new aas.types.Property(aas.types.DataTypeDefXsd.String);
        custom.idShort = 'CustomConstraint';
        custom.semanticId = this.createExternalRef(
          'https://adminshell.io/idta/CapabilityDescription/PropertyConstraintType/CustomConstraint/1/0',
        );
        custom.value = draft.value.trim();
        return custom;
      }
      case 'BasicConstraint':
      default: {
        const basic = new aas.types.Property(aas.types.DataTypeDefXsd.String);
        basic.idShort = 'BasicConstraint';
        basic.semanticId = this.createExternalRef(
          'https://adminshell.io/idta/CapabilityDescription/PropertyConstraintType/BasicConstraint/1/0',
        );
        basic.value = draft.value.trim();
        return basic;
      }
    }
  }

  private createRoleQualifier(role: CapabilityRole): aas.types.Qualifier {
    const qualifier = new aas.types.Qualifier(role, aas.types.DataTypeDefXsd.Boolean);
    qualifier.kind = aas.types.QualifierKind.ValueQualifier;
    qualifier.value = 'true';
    qualifier.semanticId = this.createExternalRef(
      'https://admin-shell.io/idta/CapabilityDescription/CapabilityRoleQualifier/1/0',
    );
    qualifier.valueId = this.createExternalRef(
      `https://adminshell.io/idta/CapabilityDescription/CapabilityRoleQualifier/${role}/1/0`,
    );
    return qualifier;
  }

  private createPropertyContainer(draft: PropertyContainerDraft, index: number): aas.types.SubmodelElementCollection {
    const propertyContainer = new aas.types.SubmodelElementCollection(
      null,
      null,
      draft.idShort.trim() || `PropertyContainer${index.toString().padStart(2, '0')}`,
    );
    propertyContainer.semanticId = this.createExternalRef(
      'https://admin-shell.io/idta/CapabilityDescription/PropertyContainer/1/0',
    );
    propertyContainer.value = [];

    draft.properties.forEach((propDraft) => {
      propertyContainer.value?.push(this.createCapabilityPropertyElement(propDraft));
    });

    const normalizedComments =
      (draft.commentValue ?? [])
        .map((entry) => new aas.types.LangStringTextType(entry.language.trim(), entry.text.trim()))
        .filter((entry) => entry.language !== '' && entry.text !== '') ?? [];
    if (normalizedComments.length > 0) {
      const propertyComment = new aas.types.MultiLanguageProperty();
      propertyComment.idShort = 'PropertyComment';
      propertyComment.semanticId = this.createExternalRef(
        'https://adminshell.io/idta/CapabilityDescription/PropertyComment/1/0',
      );
      propertyComment.value = normalizedComments;
      propertyContainer.value.push(propertyComment);
    }

    return propertyContainer;
  }

  private createCapabilityPropertyElement(draft: CapabilityPropertyDraft): aas.types.ISubmodelElement {
    switch (draft.type) {
      case 'Range': {
        const range = new aas.types.Range(draft.valueType);
        range.idShort = draft.idShort.trim() || 'PropertyRange';
        range.semanticId = this.createExternalRef('https://adminshell.io/idta/CapabilityPropertyType/Range/1/0');
        range.min = draft.min.trim() || null;
        range.max = draft.max.trim() || null;
        return range;
      }
      case 'MultiLanguageProperty': {
        const mlp = new aas.types.MultiLanguageProperty();
        mlp.idShort = draft.idShort.trim() || 'PropertyMultiLanguageProperty';
        mlp.semanticId = this.createExternalRef(
          'https://adminshell.io/idta/CapabilityPropertyType/MultiLanguageProperty/1/0',
        );
        const normalizedValues =
          (draft.mlpValue ?? [])
            .map((entry) => new aas.types.LangStringTextType(entry.language.trim(), entry.text.trim()))
            .filter((entry) => entry.language !== '' && entry.text !== '') ?? [];
        mlp.value = normalizedValues.length > 0 ? normalizedValues : null;
        if (draft.valueId.trim() !== '') {
          mlp.valueId = this.createExternalRef(draft.valueId.trim());
        }
        return mlp;
      }
      case 'SubmodelElementList': {
        const list = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property);
        list.idShort = draft.idShort.trim() || 'PropertySubmodelList';
        list.semanticId = this.createExternalRef(
          'https://adminshell.io/idta/CapabilityPropertyType/SubmodelElementList/1/0',
        );
        list.valueTypeListElement = draft.valueType;
        list.value = [];
        const listItem = new aas.types.Property(draft.valueType);
        listItem.idShort = 'Entry00';
        listItem.value = draft.value.trim();
        list.value.push(listItem);
        return list;
      }
      case 'Property':
      default: {
        const property = new aas.types.Property(draft.valueType);
        property.idShort = draft.idShort.trim() || 'PropertyProperty';
        property.semanticId = this.createExternalRef('https://adminshell.io/idta/CapabilityPropertyType/Property/1/0');
        property.value = draft.value.trim();
        if (draft.valueId.trim() !== '') {
          property.valueId = this.createExternalRef(draft.valueId.trim());
        }
        return property;
      }
    }
  }

  private createPropertyReference(propertyIdShort: string): aas.types.Reference {
    if (this.currentSubmodelId.trim() === '') {
      return this.createExternalRef(`internal:Property:${propertyIdShort}`);
    }

    return new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.Submodel, this.currentSubmodelId),
      new aas.types.Key(aas.types.KeyTypes.SubmodelElement, propertyIdShort),
    ]);
  }

  private createConstraintReference(constraintIdShort: string): aas.types.Reference {
    if (this.currentSubmodelId.trim() === '') {
      return this.createExternalRef(`internal:Constraint:${constraintIdShort}`);
    }

    return new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.Submodel, this.currentSubmodelId),
      new aas.types.Key(aas.types.KeyTypes.SubmodelElement, constraintIdShort),
    ]);
  }

  private createCapabilityReference(capabilityIdShort: string): aas.types.Reference {
    if (this.currentSubmodelId.trim() === '') {
      return this.createExternalRef(`internal:Capability:${capabilityIdShort}`);
    }

    return new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.Submodel, this.currentSubmodelId),
      new aas.types.Key(aas.types.KeyTypes.SubmodelElement, capabilityIdShort),
    ]);
  }

  private createRelationTargetReference(target: CapabilityRelationTargetDraft): aas.types.Reference {
    if (target.mode === 'internal') {
      return this.createCapabilityReference(target.value.trim());
    }
    return this.createExternalRef(target.value.trim());
  }

  private createExternalRef(value: string): aas.types.Reference {
    return new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, value),
    ]);
  }

  private applyDraftFromExistingContainer(container: aas.types.SubmodelElementCollection): void {
    const elements = container.value ?? [];
    const capability = elements.find((el) =>
      this.hasSemanticId(el, 'https://admin-shell.io/idta/CapabilityDescription/Capability/1/0'),
    ) as aas.types.Capability | undefined;
    if (capability != null) {
      this.capabilityIdShort = capability.idShort?.trim() || this.capabilityIdShort;
      this.role = this.extractRole(capability.qualifiers ?? []);
      this.supplementalSemanticIds =
        capability.supplementalSemanticIds
          ?.flatMap((ref) => ref.keys ?? [])
          .map((key) => key.value?.trim() ?? '')
          .filter((value) => value !== '') ?? [];
    }

    const comment = elements.find((el) =>
      this.hasSemanticId(el, 'https://admin-shell.io/idta/CapabilityDescription/CapabilityComment/1/0'),
    ) as aas.types.MultiLanguageProperty | undefined;
    this.capabilityCommentParent.value =
      comment?.value
        ?.map((entry) => new aas.types.LangStringTextType(entry.language?.trim() ?? '', entry.text?.trim() ?? ''))
        .filter((entry) => entry.language !== '' && entry.text !== '') ?? null;

    const propertySet = elements.find((el) =>
      this.hasSemanticId(el, 'https://admin-shell.io/idta/CapabilityDescription/PropertySet/1/0'),
    ) as aas.types.SubmodelElementCollection | undefined;
    this.propertyContainers = this.readPropertyContainerDrafts(propertySet);

    const relations = elements.find((el) =>
      this.hasSemanticId(el, 'https://admin-shell.io/idta/CapabilityDescription/CapabilityRelations/1/0'),
    ) as aas.types.SubmodelElementCollection | undefined;
    this.realizedByRefs = this.readRelationTargets(relations, 'realized');
    this.generalizedByRefs = this.readGeneralizedByTargets(relations);
    this.propertyConstraints = this.readPropertyConstraints(relations);
    this.transitionConstraints = this.readTransitionConstraints(relations);
  }

  private extractRole(qualifiers: aas.types.Qualifier[]): CapabilityRole {
    const lowerTypes = qualifiers.map((q) => (q.type ?? '').toLowerCase());
    if (lowerTypes.includes('required')) return 'Required';
    if (lowerTypes.includes('offered')) return 'Offered';
    return 'NotAssigned';
  }

  private readPropertyContainerDrafts(
    propertySet: aas.types.SubmodelElementCollection | undefined,
  ): PropertyContainerDraft[] {
    const containers = (propertySet?.value ?? []).filter(
      (el): el is aas.types.SubmodelElementCollection => el instanceof aas.types.SubmodelElementCollection,
    );

    return containers.map((container) => {
      const value = container.value ?? [];
      const comment = value.find((el) =>
        this.hasSemanticId(el, 'https://adminshell.io/idta/CapabilityDescription/PropertyComment/1/0'),
      ) as aas.types.MultiLanguageProperty | undefined;

      const propertyElements = value.filter(
        (el) => !this.hasSemanticId(el, 'https://adminshell.io/idta/CapabilityDescription/PropertyComment/1/0'),
      );

      const commentValue =
        comment?.value
          ?.map((entry) => new aas.types.LangStringTextType(entry.language?.trim() ?? '', entry.text?.trim() ?? ''))
          .filter((entry) => entry.language !== '' && entry.text !== '') ?? null;

      const properties: CapabilityPropertyDraft[] = propertyElements.map((propertyElement, propIndex) => {
        const draft: CapabilityPropertyDraft = {
          idShort: `Property${propIndex.toString().padStart(2, '0')}`,
          type: 'Property',
          valueType: aas.types.DataTypeDefXsd.String,
          semanticId: '',
          valueId: '',
          value: '',
          mlpValue: null,
          min: '',
          max: '',
        };

        if (propertyElement instanceof aas.types.Range) {
          draft.idShort = propertyElement.idShort ?? draft.idShort;
          draft.type = 'Range';
          draft.valueType = propertyElement.valueType ?? aas.types.DataTypeDefXsd.String;
          draft.semanticId = this.readFirstRefValue(propertyElement.semanticId);
          draft.min = propertyElement.min ?? '';
          draft.max = propertyElement.max ?? '';
        } else if (propertyElement instanceof aas.types.MultiLanguageProperty) {
          draft.idShort = propertyElement.idShort ?? draft.idShort;
          draft.type = 'MultiLanguageProperty';
          draft.semanticId = this.readFirstRefValue(propertyElement.semanticId);
          draft.mlpValue =
            propertyElement.value
              ?.map((entry) => new aas.types.LangStringTextType(entry.language?.trim() ?? '', entry.text?.trim() ?? ''))
              .filter((entry) => entry.language !== '' && entry.text !== '') ?? null;
          draft.valueId = this.readFirstRefValue(propertyElement.valueId);
        } else if (propertyElement instanceof aas.types.SubmodelElementList) {
          draft.idShort = propertyElement.idShort ?? draft.idShort;
          draft.type = 'SubmodelElementList';
          draft.valueType = propertyElement.valueTypeListElement ?? aas.types.DataTypeDefXsd.String;
          draft.semanticId = this.readFirstRefValue(propertyElement.semanticId);
          const first = propertyElement.value?.[0];
          if (first instanceof aas.types.Property) {
            draft.value = first.value ?? '';
          }
        } else if (propertyElement instanceof aas.types.Property) {
          draft.idShort = propertyElement.idShort ?? draft.idShort;
          draft.type = 'Property';
          draft.valueType = propertyElement.valueType ?? aas.types.DataTypeDefXsd.String;
          draft.semanticId = this.readFirstRefValue(propertyElement.semanticId);
          draft.value = propertyElement.value ?? '';
          draft.valueId = this.readFirstRefValue(propertyElement.valueId);
        }

        return draft;
      });

      return {
        idShort: container.idShort?.trim() ?? '',
        commentValue,
        properties,
      };
    });
  }

  private readRelationTargets(
    relations: aas.types.SubmodelElementCollection | undefined,
    idShortContains: string,
  ): CapabilityRelationTargetDraft[] {
    return (relations?.value ?? [])
      .filter((el): el is aas.types.RelationshipElement => el instanceof aas.types.RelationshipElement)
      .filter((rel) => (rel.idShort ?? '').toLowerCase().includes(idShortContains))
      .map((rel) => this.readRelationTargetDraft(rel.second))
      .filter((entry) => entry.value !== '');
  }

  private readGeneralizedByTargets(
    relations: aas.types.SubmodelElementCollection | undefined,
  ): CapabilityRelationTargetDraft[] {
    const generalizedBySet = (relations?.value ?? []).find((el) =>
      this.hasSemanticId(el, 'https://admin-shell.io/idta/CapabilityDescription/GeneralizedBySet/1/0'),
    ) as aas.types.SubmodelElementCollection | undefined;

    return (generalizedBySet?.value ?? [])
      .filter((el): el is aas.types.RelationshipElement => el instanceof aas.types.RelationshipElement)
      .map((rel) => this.readRelationTargetDraft(rel.second))
      .filter((entry) => entry.value !== '');
  }

  private readRelationTargetDraft(ref: aas.types.Reference | null | undefined): CapabilityRelationTargetDraft {
    const mode: 'internal' | 'external' =
      ref?.type === aas.types.ReferenceTypes.ModelReference ? 'internal' : 'external';
    const value = this.readLastRefValue(ref).trim();
    return { mode, value };
  }

  private readPropertyConstraints(
    relations: aas.types.SubmodelElementCollection | undefined,
  ): PropertyConstraintDraft[] {
    const constraintSet = (relations?.value ?? []).find((el) =>
      this.hasSemanticId(el, 'https://admin-shell.io/idta/CapabilityDescription/ConstraintSet/1/0'),
    ) as aas.types.SubmodelElementCollection | undefined;

    const containers = (constraintSet?.value ?? []).filter(
      (el) =>
        el instanceof aas.types.SubmodelElementCollection &&
        this.hasSemanticId(el, 'https://adminshell.io/idta/CapabilityDescription/PropertyConstraintContainer/1/0'),
    ) as aas.types.SubmodelElementCollection[];

    return containers.map((container, index) => {
      const basic = container.value?.find(
        (el) =>
          el instanceof aas.types.Property || el instanceof aas.types.File || el instanceof aas.types.ReferenceElement,
      );
      const conditional = container.value?.find((el) => (el.idShort ?? '') === 'PropertyConditionalType') as
        | aas.types.Property
        | undefined;
      const relationCollection = container.value?.find((el) =>
        this.hasSemanticId(el, 'https://admin-shell.io/idta/CapabilityDescription/ConstraintPropertyRelations/1/0'),
      ) as aas.types.SubmodelElementCollection | undefined;
      const targetProperties = (relationCollection?.value ?? [])
        .filter((el): el is aas.types.RelationshipElement => el instanceof aas.types.RelationshipElement)
        .map((rel) => this.readLastRefValue(rel.second))
        .filter((value) => value !== '');

      let type: PropertyConstraintType = 'BasicConstraint';
      let value = '';
      if (basic instanceof aas.types.ReferenceElement) {
        type = 'OperationConstraint';
        value = this.readFirstRefValue(basic.value);
      } else if (basic instanceof aas.types.File) {
        type = 'OCLConstraint';
        value = basic.value ?? '';
      } else if (basic instanceof aas.types.Property) {
        type = (basic.idShort ?? '').toLowerCase().includes('custom') ? 'CustomConstraint' : 'BasicConstraint';
        value = basic.value ?? '';
      }

      return {
        idShort: container.idShort?.trim() || `PropertyConstraint${index.toString().padStart(2, '0')}`,
        type,
        conditionalType: this.toConditionalType(conditional?.value),
        value,
        targetProperties,
        targetPropertyInput: '',
        selectedTargetProperty: '',
      };
    });
  }

  private readTransitionConstraints(
    relations: aas.types.SubmodelElementCollection | undefined,
  ): TransitionConstraintDraft[] {
    const constraintSet = (relations?.value ?? []).find((el) =>
      this.hasSemanticId(el, 'https://admin-shell.io/idta/CapabilityDescription/ConstraintSet/1/0'),
    ) as aas.types.SubmodelElementCollection | undefined;

    const containers = (constraintSet?.value ?? []).filter(
      (el) =>
        el instanceof aas.types.SubmodelElementCollection &&
        this.hasSemanticId(el, 'https://adminshell.io/idta/CapabilityDescription/TransitionConstraintContainer/1/0'),
    ) as aas.types.SubmodelElementCollection[];

    return containers.map((container, index) => {
      const rel = container.value?.find((el) => (el.idShort ?? '') === 'TransitionConstrainedBy') as
        | aas.types.RelationshipElement
        | undefined;
      const conditional = container.value?.find((el) => (el.idShort ?? '') === 'TransitionConditionalType') as
        | aas.types.Property
        | undefined;

      return {
        idShort: container.idShort?.trim() || `TransitionConstraint${index.toString().padStart(2, '0')}`,
        conditionalType: this.toConditionalType(conditional?.value),
        targetCapability: this.readLastRefValue(rel?.second),
      };
    });
  }

  private toConditionalType(value: string | null | undefined): ConditionalType {
    const normalized = (value ?? '').trim();
    return this.conditionalTypeOptions.find((entry) => entry.value === normalized)?.value ?? 'Pre';
  }

  private hasSemanticId(element: any, semanticId: string): boolean {
    const keys = (element as any)?.semanticId?.keys as aas.types.Key[] | null | undefined;
    return (keys ?? []).some((key) => (key.value ?? '').trim().toLowerCase() === semanticId.toLowerCase());
  }

  private readFirstRefValue(ref: aas.types.Reference | null | undefined): string {
    return ref?.keys?.[0]?.value ?? '';
  }

  private readLastRefValue(ref: aas.types.Reference | null | undefined): string {
    const keys = ref?.keys ?? [];
    return keys.length > 0 ? (keys[keys.length - 1].value ?? '') : '';
  }
}
