import {
  getBatteryEditorConceptDescription,
  getBatteryEditorElementDisplayName,
  getBatteryEditorTreeItemIndexLabel,
  getBatteryEditorValueListOptions,
  resolveBatteryEditorConceptDescriptionDefinition,
  resolveBatteryEditorDescriptionFromConceptDescriptions,
  resolveBatteryEditorLangString,
  stringifyBatteryEditorDebugValue,
} from './battery-editor-field-utils';

describe('battery-editor-field-utils', () => {
  it('prefers displayName in the active language, then english, then idShort', () => {
    const element = {
      idShort: 'ManufacturerName',
      displayName: [
        { language: 'en', text: 'Manufacturer' },
        { language: 'de', text: 'Hersteller' },
      ],
    };

    expect(getBatteryEditorElementDisplayName(element, 'de-DE')).toBe('Hersteller');
    expect(getBatteryEditorElementDisplayName(element, 'fr-FR')).toBe('Manufacturer');
    expect(getBatteryEditorElementDisplayName({ idShort: 'SerialNumber' }, 'de-DE')).toBe('SerialNumber');
  });

  it('resolves language strings with exact, base-language and english fallback', () => {
    const values = [
      { language: 'en', text: 'Battery passport' },
      { language: 'de', text: 'Batteriepass' },
    ];

    expect(resolveBatteryEditorLangString(values, 'de-AT')).toBe('Batteriepass');
    expect(resolveBatteryEditorLangString(values, 'fr-FR')).toBe('Battery passport');
  });

  it('resolves concept description definitions with language fallback', () => {
    const conceptDescription = {
      embeddedDataSpecifications: [
        {
          dataSpecificationContent: {
            definition: [
              { language: 'en', text: 'English definition' },
              { language: 'de', text: 'Deutsche Definition' },
            ],
          },
        },
      ],
    };

    expect(resolveBatteryEditorConceptDescriptionDefinition(conceptDescription, 'de-DE')).toBe('Deutsche Definition');
    expect(resolveBatteryEditorConceptDescriptionDefinition(conceptDescription, 'fr-FR')).toBe('English definition');
  });

  it('resolves field descriptions from loaded concept descriptions only when a definition exists', () => {
    const element = {
      semanticId: {
        keys: [{ value: 'urn:test:semantic' }],
      },
    };
    const currentAasConceptDescription = {
      identification: { id: 'urn:test:semantic' },
      embeddedDataSpecifications: [
        {
          dataSpecificationContent: {
            definition: [{ language: 'en', text: 'English fallback definition' }],
          },
        },
      ],
    };
    const conceptDescriptionWithoutDefinition = {
      id: 'urn:test:semantic',
      embeddedDataSpecifications: [
        {
          dataSpecificationContent: {
            preferredName: [{ language: 'de', text: 'Nur Titel' }],
          },
        },
      ],
    };
    const missingDefinitionElement = {
      semanticId: {
        keys: [{ value: 'urn:test:missing' }],
      },
    };

    expect(
      resolveBatteryEditorDescriptionFromConceptDescriptions(
        element,
        [[currentAasConceptDescription], [conceptDescriptionWithoutDefinition]],
        'de-DE',
      ),
    ).toBe('English fallback definition');
    expect(
      resolveBatteryEditorDescriptionFromConceptDescriptions(
        missingDefinitionElement,
        [[currentAasConceptDescription], [conceptDescriptionWithoutDefinition]],
        'de-DE',
      ),
    ).toBe('');
  });

  it('falls back to concept description idShort matches when an element has no semanticId', () => {
    const element = {
      idShort: 'Company',
    };
    const conceptDescription = {
      idShort: 'Company',
      embeddedDataSpecifications: [
        {
          dataSpecificationContent: {
            definition: [{ language: 'en', text: 'Company name of the contact address' }],
          },
        },
      ],
    };

    expect(resolveBatteryEditorDescriptionFromConceptDescriptions(element, [[conceptDescription]], 'de-DE')).toBe(
      'Company name of the contact address',
    );
  });

  it('serializes circular structures for unknown debug output', () => {
    const element: Record<string, unknown> = { idShort: 'Example' };
    element['self'] = element;

    expect(stringifyBatteryEditorDebugValue(element)).toContain('[Circular]');
  });

  it('prefers embedded value lists over concept descriptions and removes duplicates', () => {
    const element = {
      semanticId: {
        keys: [{ value: 'urn:test:semantic' }],
      },
      embeddedDataSpecifications: [
        {
          dataSpecificationContent: {
            valueList: {
              valueReferencePairs: [{ value: 'Active' }, { value: 'Active' }, { value: 'Inactive' }],
            },
          },
        },
      ],
    };
    const conceptDescriptions = [
      {
        id: 'urn:test:semantic',
        embeddedDataSpecifications: [
          {
            dataSpecificationContent: {
              valueList: {
                valueReferencePairs: [{ value: 'Archived' }],
              },
            },
          },
        ],
      },
    ];

    expect(getBatteryEditorValueListOptions(element, conceptDescriptions as never)).toEqual([
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
    ]);
  });

  it('falls back to concept description value lists when the property has none', () => {
    const element = {
      semanticId: {
        keys: [{ value: 'urn:test:semantic' }],
      },
    };
    const conceptDescriptions = [
      {
        id: 'urn:test:semantic',
        embeddedDataSpecifications: [
          {
            dataSpecificationContent: {
              valueList: {
                valueReferencePairs: [{ value: 'Draft' }, { value: 'Released' }],
              },
            },
          },
        ],
      },
    ];

    expect(getBatteryEditorValueListOptions(element, conceptDescriptions as never)).toEqual([
      { label: 'Draft', value: 'Draft' },
      { label: 'Released', value: 'Released' },
    ]);
  });

  it('matches concept descriptions by identification.id when direct id is missing', () => {
    const element = {
      semanticId: {
        keys: [{ value: '0173-1#02-AAQ326#002' }],
      },
    };
    const conceptDescription = {
      identification: {
        id: '0173-1#02-AAQ326#002',
      },
      embeddedDataSpecifications: [],
    };

    expect(getBatteryEditorConceptDescription(element, [conceptDescription] as never)).toBe(conceptDescription);
  });

  it('builds hierarchical index labels for nested tree items', () => {
    const items = [
      {
        key: 'general',
        label: 'General',
        path: 'General',
        description: '',
        kind: 'container',
        fields: [],
        children: [
          {
            key: 'general__manufacturer',
            label: 'Manufacturer',
            path: 'General / Manufacturer',
            description: '',
            kind: 'field',
            fields: [{}],
            children: [],
          },
        ],
      },
      {
        key: 'markings',
        label: 'Markings',
        path: 'Markings',
        description: '',
        kind: 'field',
        fields: [{}],
        children: [],
      },
    ];

    expect(getBatteryEditorTreeItemIndexLabel(items as never, 'general')).toBe('1');
    expect(getBatteryEditorTreeItemIndexLabel(items as never, 'general__manufacturer')).toBe('1.1');
    expect(getBatteryEditorTreeItemIndexLabel(items as never, 'markings')).toBe('2');
  });

  it('resolves value list options from concept descriptions matched via identification.id', () => {
    const element = {
      semanticId: {
        keys: [{ value: '0173-1#02-AAQ326#002' }],
      },
    };
    const conceptDescriptions = [
      {
        identification: {
          id: '0173-1#02-AAQ326#002',
        },
        embeddedDataSpecifications: [
          {
            dataSpecificationContent: {
              valueList: {
                valueReferencePairs: [{ value: 'Yes' }, { value: 'No' }],
              },
            },
          },
        ],
      },
    ];

    expect(getBatteryEditorValueListOptions(element, conceptDescriptions as never)).toEqual([
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ]);
  });
});
