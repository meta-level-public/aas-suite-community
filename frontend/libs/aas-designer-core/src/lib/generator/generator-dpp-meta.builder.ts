import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HandoverSemantics, IdGenerationUtil } from '@aas/helpers';

export interface GeneratorDppMetaBuilderOptions {
  assetGlobalId: string;
  dppId: string;
  iriPrefix: string;
  assetKind?: 'Type' | 'Instance';
  includeCarbonFootprintSpecification: boolean;
  requiredSemanticIds: string[];
}

export function createDppMetaSubmodels(options: GeneratorDppMetaBuilderOptions) {
  const contentSpecificationIds = [
    'urn:samm:io.admin-shell.idta.dpp_meta:1.0.0#DppMeta',
    'https://admin-shell.io/idta/nameplate/3/0/Nameplate',
    HandoverSemantics.SUBMODEL_V3,
  ];

  if (options.includeCarbonFootprintSpecification) {
    contentSpecificationIds.push('https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0');
  }

  const submodel = new aas.types.Submodel(
    IdGenerationUtil.generateIri('submodel', options.iriPrefix),
    null,
    null,
    'DppMeta',
  );
  submodel.kind = aas.types.ModellingKind.Instance;
  submodel.semanticId = createSemanticId(
    'urn:samm:io.admin-shell.idta.dpp_meta:1.0.0#DppMeta',
    options.requiredSemanticIds,
  );
  submodel.submodelElements = [
    createProperty(
      'digitalProductPassportId',
      aas.types.DataTypeDefXsd.String,
      'urn:samm:io.adminshell.idta.dpp_meta:1.0.0#digitalProductPassportId',
      options.dppId,
      options.requiredSemanticIds,
    ),
    createProperty(
      'uniqueProductIdentifier',
      aas.types.DataTypeDefXsd.String,
      'urn:samm:io.adminshell.idta.dpp_meta:1.0.0#uniqueProductIdentifier',
      options.assetGlobalId,
      options.requiredSemanticIds,
    ),
    createProperty(
      'granularity',
      aas.types.DataTypeDefXsd.String,
      'urn:samm:io.admin-shell.idta.dpp_meta:1.0.0#granularity',
      options.assetKind === 'Instance' ? 'Item' : 'Model',
      options.requiredSemanticIds,
    ),
    createProperty(
      'dppSchemaVersion',
      aas.types.DataTypeDefXsd.String,
      'urn:samm:io.adminshell.idta.dpp_meta:1.0.0#dppSchemaVersion',
      'ENXXX:v1.0',
      options.requiredSemanticIds,
    ),
    createProperty(
      'dppStatus',
      aas.types.DataTypeDefXsd.String,
      'urn:samm:io.admin-shell.idta.dpp_meta:1.0.0#dppStatus',
      'Active',
      options.requiredSemanticIds,
    ),
    createProperty(
      'lastUpdate',
      aas.types.DataTypeDefXsd.DateTime,
      'urn:samm:io.admin-shell.idta.dpp_meta:1.0.0#lastUpdate',
      new Date().toISOString(),
      options.requiredSemanticIds,
    ),
    createContentSpecificationIdsList(contentSpecificationIds),
  ];

  return [submodel];
}

function createContentSpecificationIdsList(contentSpecificationIds: string[]) {
  const list = new aas.types.SubmodelElementList(
    aas.types.AasSubmodelElements.Property,
    null,
    null,
    'contentSpecificationIds',
  );
  list.valueTypeListElement = aas.types.DataTypeDefXsd.String;
  list.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(
      aas.types.KeyTypes.GlobalReference,
      'urn:samm:io.admin-shell.idta.dpp_meta:1.0.0#contentSpecificationIds',
    ),
  ]);
  list.value = contentSpecificationIds.map((id) => {
    const property = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, 'ContentSpecificationId');
    property.value = id;
    return property;
  });

  return list;
}

function createProperty(
  idShort: string,
  datatype: aas.types.DataTypeDefXsd,
  semanticId: string,
  value: string,
  requiredSemanticIds: string[],
) {
  const property = new aas.types.Property(
    datatype,
    null,
    null,
    idShort,
    null,
    null,
    semanticId !== '' ? createSemanticId(semanticId, requiredSemanticIds) : null,
  );
  property.value = value;

  return property;
}

function createSemanticId(semanticId: string, requiredSemanticIds: string[]) {
  if (semanticId !== '') {
    requiredSemanticIds.push(semanticId);
  }

  return new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
    new aas.types.Key(aas.types.KeyTypes.ConceptDescription, semanticId),
  ]);
}
