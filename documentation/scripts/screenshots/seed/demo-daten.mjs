// Deterministische Demo-Daten der fiktiven "Demo Pumpen GmbH" für die Handbuch-Aufnahmen.
// Alle Namen, Adressen und Kennungen sind erfunden; Domains enden auf .example (RFC 2606).
// Feste IDs, damit zwei Läufe dieselben Bilder liefern. Werden über die Import-API des Designers angelegt.

export const ORGA = {
  name: 'Demo Pumpen GmbH',
  domain: 'https://demo-pumpen.example',
};

const SEM = {
  nameplate: 'https://admin-shell.io/idta/nameplate/3/0/Nameplate',
  technicalData: 'https://admin-shell.io/ZVEI/TechnicalData/Submodel/1/2',
  generalInformation: 'https://admin-shell.io/ZVEI/TechnicalData/GeneralInformation/1/1',
  technicalProperties: 'https://admin-shell.io/ZVEI/TechnicalData/TechnicalProperties/1/1',
  manufacturerName: '0173-1#02-AAO677#002',
  manufacturerProductDesignation: '0173-1#02-AAW338#001',
  manufacturerArticleNumber: '0173-1#02-AAO676#003',
  manufacturerOrderCode: '0173-1#02-AAO227#002',
  serialNumber: '0173-1#02-AAM556#002',
  yearOfConstruction: '0173-1#02-AAP906#001',
  uriOfProduct: '0173-1#02-AAY811#001',
};

const ref = (value) => ({ type: 'ExternalReference', keys: [{ type: 'GlobalReference', value }] });
const langs = (de, en) => [
  { language: 'en', text: en },
  { language: 'de', text: de },
];
const prop = (idShort, value, semanticId, valueType = 'xs:string') => ({
  modelType: 'Property',
  idShort,
  valueType,
  value,
  ...(semanticId ? { semanticId: ref(semanticId) } : {}),
});
const mlp = (idShort, de, en, semanticId) => ({
  modelType: 'MultiLanguageProperty',
  idShort,
  value: langs(de, en),
  ...(semanticId ? { semanticId: ref(semanticId) } : {}),
});
const smc = (idShort, value, semanticId) => ({
  modelType: 'SubmodelElementCollection',
  idShort,
  value,
  ...(semanticId ? { semanticId: ref(semanticId) } : {}),
});
const submodel = (id, idShort, semanticId, elements) => ({
  modelType: 'Submodel',
  id,
  idShort,
  kind: 'Instance',
  semanticId: { type: 'ExternalReference', keys: [{ type: 'GlobalReference', value: semanticId }] },
  submodelElements: elements,
});
// Changelog-Teilmodell des Designers mit fester ID; sonst legt der Import eines mit zufälliger ID an
const changelog = (id) => ({
  modelType: 'Submodel',
  id,
  idShort: 'AasDesignerChangelog',
  kind: 'Instance',
  semanticId: { type: 'ExternalReference', keys: [{ type: 'GlobalReference', value: 'AasDesignerChangelog' }] },
  submodelElements: [{ modelType: 'SubmodelElementCollection', idShort: 'Changes', value: [] }],
});
const modelRef = (id) => ({ type: 'ModelReference', keys: [{ type: 'Submodel', value: id }] });

// Konzeptbeschreibung nach IEC 61360 (Datenspezifikation), wie sie ECLASS-Merkmale beschreiben
const conceptDescription = (id, idShort, { de, en, shortDe, shortEn, definitionDe, definitionEn, dataType }) => ({
  modelType: 'ConceptDescription',
  id,
  idShort,
  embeddedDataSpecifications: [
    {
      dataSpecification: ref('https://admin-shell.io/DataSpecificationTemplates/DataSpecificationIec61360/3/0'),
      dataSpecificationContent: {
        modelType: 'DataSpecificationIec61360',
        preferredName: langs(de, en),
        shortName: langs(shortDe, shortEn),
        dataType,
        definition: langs(definitionDe, definitionEn),
      },
    },
  ],
});

export const KONZEPTBESCHREIBUNG = conceptDescription(SEM.manufacturerName, 'ManufacturerName', {
  de: 'Herstellername',
  en: 'Manufacturer name',
  shortDe: 'Hersteller',
  shortEn: 'Manufacturer',
  definitionDe: 'Bezeichnung des Herstellers, unter der das Produkt in Verkehr gebracht wird',
  definitionEn: 'Legally valid designation of the natural or judicial person which is directly responsible for the design, production, packaging and labeling of a product',
  dataType: 'STRING_TRANSLATABLE',
});

// Eine Pumpe als AAS mit Typenschild und Technischen Daten
function pumpe({ key, idShort, assetKind, de, en, serialNumber, articleNumber, power, extra = [], conceptDescriptions = [] }) {
  const aasId = `${ORGA.domain}/ids/aas/${idShort}`;
  const smNameplate = `${ORGA.domain}/ids/sm/${key}-nameplate`;
  const smTechnical = `${ORGA.domain}/ids/sm/${key}-technical-data`;
  const smChangelog = `${ORGA.domain}/ids/sm/${key}-changelog`;
  const nameplateElements = [
    prop('URIOfTheProduct', `${ORGA.domain}/produkte/${key}`, SEM.uriOfProduct),
    mlp('ManufacturerName', ORGA.name, ORGA.name, SEM.manufacturerName),
    mlp('ManufacturerProductDesignation', de, en, SEM.manufacturerProductDesignation),
    prop('ManufacturerArticleNumber', articleNumber, SEM.manufacturerArticleNumber),
    prop('ManufacturerOrderCode', `${articleNumber}-B`, SEM.manufacturerOrderCode),
    ...(serialNumber ? [prop('SerialNumber', serialNumber, SEM.serialNumber)] : []),
    prop('YearOfConstruction', '2026', SEM.yearOfConstruction),
  ];
  return {
    aasId,
    idShort,
    environment: {
      assetAdministrationShells: [
        {
          modelType: 'AssetAdministrationShell',
          id: aasId,
          idShort,
          description: langs(de, en),
          assetInformation: {
            assetKind,
            globalAssetId: `${ORGA.domain}/assets/${key}${serialNumber ? `/${serialNumber}` : ''}`,
          },
          submodels: [modelRef(smNameplate), modelRef(smTechnical), modelRef(smChangelog)],
        },
      ],
      submodels: [
        submodel(smNameplate, 'Nameplate', SEM.nameplate, nameplateElements),
        submodel(smTechnical, 'TechnicalData', SEM.technicalData, [
          smc(
            'GeneralInformation',
            [
              prop('ManufacturerName', ORGA.name, SEM.manufacturerName),
              mlp('ManufacturerProductDesignation', de, en, SEM.manufacturerProductDesignation),
              prop('ManufacturerArticleNumber', articleNumber, SEM.manufacturerArticleNumber),
              prop('ManufacturerOrderCode', `${articleNumber}-B`, SEM.manufacturerOrderCode),
            ],
            SEM.generalInformation,
          ),
          smc(
            'TechnicalProperties',
            [
              prop('NominalPower', power, null, 'xs:double'),
              prop('MaximumFlowRate', '200', null, 'xs:double'),
              prop('MaximumHead', '45', null, 'xs:double'),
              ...extra,
            ],
            SEM.technicalProperties,
          ),
        ]),
        changelog(smChangelog),
      ],
      conceptDescriptions,
    },
  };
}

// Reihenfolge = Importreihenfolge
export const AAS = {
  kreiselpumpe: pumpe({
    key: 'kp200-0001',
    idShort: 'demoKreiselpumpeKp200',
    assetKind: 'Instance',
    de: 'Demo-Kreiselpumpe KP-200',
    en: 'Demo centrifugal pump KP-200',
    serialNumber: 'SN-DEMO-0001',
    articleNumber: 'KP-200',
    power: '7.5',
    conceptDescriptions: [KONZEPTBESCHREIBUNG],
  }),
  kreiselpumpeTyp: pumpe({
    key: 'kp200-typ',
    idShort: 'demoKreiselpumpeTypKp200',
    assetKind: 'Type',
    de: 'Demo-Kreiselpumpe Typ KP-200',
    en: 'Demo centrifugal pump type KP-200',
    serialNumber: null,
    articleNumber: 'KP-200',
    power: '7.5',
  }),
  // Nicht "Dosierpumpe DP-50": die bleibt dem Assistenten vorbehalten und darf nicht existieren
  umwaelzpumpe: pumpe({
    key: 'up30-0001',
    idShort: 'demoUmwaelzpumpeUp30',
    assetKind: 'Instance',
    de: 'Demo-Umwälzpumpe UP-30',
    en: 'Demo circulation pump UP-30',
    serialNumber: 'SN-DEMO-0030',
    articleNumber: 'UP-30',
    power: '0.25',
  }),
  // Absichtlich fehlerhaft, für die Bilder zur Validierung: leerer Pflichtwert, Wert passt nicht zum Datentyp
  versuchspumpe: pumpe({
    key: 'vp10-0001',
    idShort: 'demoVersuchspumpeVp10',
    assetKind: 'Instance',
    de: 'Demo-Versuchspumpe VP-10 (unvollständig)',
    en: 'Demo test pump VP-10 (incomplete)',
    serialNumber: 'SN-DEMO-0010',
    articleNumber: 'VP-10',
    power: 'sieben',
    extra: [prop('OperatingTemperature', '', null, 'xs:double')],
  }),
};

// Adresse im Adresskatalog unter "Mein Bereich"
export const ADRESSE = {
  name: ORGA.name,
  nameMlpKeyValues: langs(ORGA.name, ORGA.name),
  strasse: 'Musterstraße 1',
  strasseMlpKeyValues: langs('Musterstraße 1', 'Musterstraße 1'),
  plz: '12345',
  ort: 'Musterstadt',
  ortMlpKeyValues: langs('Musterstadt', 'Musterstadt'),
  bundesland: 'Berlin',
  bundeslandMlpKeyValues: langs('Berlin', 'Berlin'),
  laenderCode: 'DE',
};

// Produktbezeichnung im Katalog unter "Mein Bereich"
export const PRODUKTBEZEICHNUNG = {
  name: 'Kreiselpumpe KP-200',
  mlpKeyValues: langs('Kreiselpumpe KP-200', 'Centrifugal pump KP-200'),
};

// Schnipsel aus den Allgemeinen Angaben der Technischen Daten der Kreiselpumpe
const generalInformation = AAS.kreiselpumpe.environment.submodels
  .find((sm) => sm.idShort === 'TechnicalData')
  .submodelElements.find((e) => e.idShort === 'GeneralInformation');
export const SCHNIPSEL = {
  name: 'Demo-Allgemeine Angaben',
  description: 'Beispiel für das Handbuch',
  typ: 'SubmodelElementCollection',
  data: generalInformation,
};

// Geteilter Link auf die Kreiselpumpe
export const GETEILTER_LINK = {
  aasIdentifier: AAS.kreiselpumpe.aasId,
  notiz: 'Demo-Link für das Handbuch',
};
