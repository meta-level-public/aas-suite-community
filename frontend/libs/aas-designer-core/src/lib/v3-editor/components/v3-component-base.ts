import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { VerificationError } from '@aas-core-works/aas-core3.1-typescript/verification';
import { inject } from '@angular/core';
import { UrlHelper } from '@aas/helpers';
import { V3EditorUiStateStoreService } from '../v3-editor-ui-state-store.service';

const StringIsNumber = (value: any) => isNaN(Number(value)) === false;

export class V3ComponentBase {
  modelingTypes: { label: string; value: number }[] = [];
  refTypes: { label: string; value: number }[];
  valueTypeOptions: { label: string; value: number }[] = [];
  qualifierKindOptions: { label: string; value: number | null }[] = [];
  keyTypes: { label: string; value: number }[];
  externalKeyTypes: { label: string; value: number }[];
  modelKeyTypes: { label: string; value: number }[];
  assetTypes: { label: string; value: number }[];
  dataTypes: { label: string; value: number }[];
  trueFalseOptions: { label: string; value: string }[];
  submodelElementTypes: { label: string; value: number }[];
  entityTypes: { label: string; value: number }[];
  categoryOptions: { label: string; value: string | null }[];

  idShortRegex = /[a-zA-Z0-9_]/;

  UrlHelper = UrlHelper;

  directionTypes: { label: string; value: number }[];
  eventStateTypes: { label: string; value: number }[];

  ErrorHandlingAction = ErrorHandlingAction;

  uiStateStore = inject(V3EditorUiStateStoreService);

  constructor() {
    this.modelingTypes = Object.keys(aas.types.ModellingKind)
      .filter(StringIsNumber)
      .map((key) => ({ label: aas.types.ModellingKind[key as any], value: +key }));

    this.refTypes = Object.keys(aas.types.ReferenceTypes)
      .filter(StringIsNumber)
      .map((key) => ({ label: aas.types.ReferenceTypes[key as any], value: +key }));
    this.refTypes = this.refTypes.sort((a, b) => a.label.localeCompare(b.label));

    this.keyTypes = Object.keys(aas.types.KeyTypes)
      .filter(StringIsNumber)
      .map((key) => ({ label: aas.types.KeyTypes[key as any], value: +key }));

    this.modelKeyTypes = [
      {
        label: aas.types.KeyTypes[aas.types.KeyTypes.ConceptDescription],
        value: aas.types.KeyTypes.ConceptDescription,
      },
      {
        label: aas.types.KeyTypes[aas.types.KeyTypes.AssetAdministrationShell],
        value: aas.types.KeyTypes.AssetAdministrationShell,
      },
      { label: aas.types.KeyTypes[aas.types.KeyTypes.Submodel], value: aas.types.KeyTypes.Submodel },
      { label: aas.types.KeyTypes[aas.types.KeyTypes.Identifiable], value: aas.types.KeyTypes.Identifiable },
    ];
    this.modelKeyTypes = this.modelKeyTypes.sort((a, b) => a.label.localeCompare(b.label));

    this.externalKeyTypes = [
      { label: aas.types.KeyTypes[aas.types.KeyTypes.GlobalReference], value: aas.types.KeyTypes.GlobalReference },
    ];
    this.externalKeyTypes = this.externalKeyTypes.sort((a, b) => a.label.localeCompare(b.label));

    this.qualifierKindOptions = Object.keys(aas.types.QualifierKind)
      .filter(StringIsNumber)
      .map((key) => ({ label: aas.types.QualifierKind[key as any], value: +key }));

    this.qualifierKindOptions.push({ label: 'NULL', value: null });
    this.qualifierKindOptions = this.qualifierKindOptions.sort((a, b) => a.label.localeCompare(b.label));

    this.valueTypeOptions = Object.keys(aas.types.DataTypeDefXsd)
      .filter(StringIsNumber)
      .map((key) => ({ label: aas.types.DataTypeDefXsd[key as any], value: +key }));
    this.valueTypeOptions = this.valueTypeOptions.sort((a, b) => a.label.localeCompare(b.label));

    this.assetTypes = Object.keys(aas.types.AssetKind)
      .filter(StringIsNumber)
      .map((key) => ({ label: aas.types.AssetKind[key as any], value: +key }));
    this.assetTypes = this.assetTypes.sort((a, b) => a.label.localeCompare(b.label));

    this.dataTypes = Object.keys(aas.types.DataTypeIec61360)
      .filter(StringIsNumber)
      .map((key) => ({ label: aas.types.DataTypeIec61360[key as any], value: +key }));
    this.dataTypes = this.dataTypes.sort((a, b) => a.label.localeCompare(b.label));

    this.submodelElementTypes = Object.keys(aas.types.AasSubmodelElements)
      .filter(StringIsNumber)
      .map((key) => ({ label: aas.types.AasSubmodelElements[key as any], value: +key }));
    this.submodelElementTypes = this.submodelElementTypes.sort((a, b) => a.label.localeCompare(b.label));

    this.entityTypes = Object.keys(aas.types.EntityType)
      .filter(StringIsNumber)
      .map((key) => ({ label: aas.types.EntityType[key as any], value: +key }));
    this.entityTypes = this.entityTypes.sort((a, b) => a.label.localeCompare(b.label));

    this.trueFalseOptions = [
      { label: 'SML_TRUE', value: 'true' },
      { label: 'SML_FALSE', value: 'false' },
    ];

    this.categoryOptions = [
      { label: 'CONSTANT', value: 'CONSTANT' },
      { label: 'PARAMETER', value: 'PARAMETER' },
      { label: 'VARIABLE', value: 'VARIABLE' },
      { label: 'NULL', value: null },
    ];

    this.directionTypes = Object.keys(aas.types.Direction)
      .filter(StringIsNumber)
      .map((key) => ({ label: aas.types.Direction[key as any], value: +key }));
    this.directionTypes = this.directionTypes.sort((a, b) => a.label.localeCompare(b.label));

    this.eventStateTypes = Object.keys(aas.types.StateOfEvent)
      .filter(StringIsNumber)
      .map((key) => ({ label: aas.types.StateOfEvent[key as any], value: +key }));
    this.eventStateTypes = this.eventStateTypes.sort((a, b) => a.label.localeCompare(b.label));
  }

  getAction(error: VerificationError) {
    if (error.message === 'The value must not be empty.' && error.path.toString().includes('[')) {
      return ErrorHandlingAction.NOTHING;
    } else if (error.message === 'The value must not be empty.') {
      return ErrorHandlingAction.SET_NULL;
    } else if (error.message.includes('All submodels must be model references to a submodel.')) {
      return ErrorHandlingAction.FIX_SUBMODEL_REFERENCES_MUST_BE_MODEL_REFERENCES;
    } else if (error.message.startsWith('Constraint AASd-122') || error.message.startsWith('Constraint AASd-123')) {
      return ErrorHandlingAction.FIX_EXTERNAL_REFERENCES;
    }

    return ErrorHandlingAction.NOTHING;
  }
}

export enum ErrorHandlingAction {
  NOTHING,
  SET_NULL,
  FIX_SUBMODEL_REFERENCES_MUST_BE_MODEL_REFERENCES,
  FIX_EXTERNAL_REFERENCES,
}
