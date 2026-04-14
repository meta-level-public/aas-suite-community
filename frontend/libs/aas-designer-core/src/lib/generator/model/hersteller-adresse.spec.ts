import { HerstellerAdresse } from './hersteller-adresse';

describe('HerstellerAdresse', () => {
  it('creates bilingual values from legacy scalar dto fields', () => {
    const address = HerstellerAdresse.fromDto({
      name: 'ACME GmbH',
      strasse: 'Musterstraße 1',
      plz: '12345',
      ort: 'Berlin',
      bundesland: 'Berlin',
      laenderCode: 'DE',
    });

    expect(address.nameMlpKeyValues).toEqual([
      { language: 'de', text: 'ACME GmbH' },
      { language: 'en', text: 'ACME GmbH' },
    ]);
    expect(address.strasseMlpKeyValues).toEqual([
      { language: 'de', text: 'Musterstraße 1' },
      { language: 'en', text: 'Musterstraße 1' },
    ]);
    expect(address.ortMlpKeyValues).toEqual([
      { language: 'de', text: 'Berlin' },
      { language: 'en', text: 'Berlin' },
    ]);
    expect(address.bundeslandMlpKeyValues).toEqual([
      { language: 'de', text: 'Berlin' },
      { language: 'en', text: 'Berlin' },
    ]);
  });

  it('prefers requested language for display helpers', () => {
    const address = HerstellerAdresse.fromDto({
      name: 'ACME GmbH',
      nameMlpKeyValues: [
        { language: 'de', text: 'ACME GmbH Deutschland' },
        { language: 'en', text: 'ACME Germany Ltd.' },
      ],
      strasseMlpKeyValues: [
        { language: 'de', text: 'Musterstraße 1' },
        { language: 'en', text: 'Example Street 1' },
      ],
      ortMlpKeyValues: [
        { language: 'de', text: 'Berlin' },
        { language: 'en', text: 'Berlin City' },
      ],
      bundeslandMlpKeyValues: [
        { language: 'de', text: 'Berlin' },
        { language: 'en', text: 'Berlin State' },
      ],
    });

    expect(address.getDisplayName('en')).toBe('ACME Germany Ltd.');
    expect(address.getDisplayStreet('en')).toBe('Example Street 1');
    expect(address.getDisplayCity('en')).toBe('Berlin City');
    expect(address.getDisplayState('en')).toBe('Berlin State');
  });
});
