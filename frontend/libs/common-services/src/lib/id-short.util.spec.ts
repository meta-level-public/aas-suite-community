import { ID_SHORT_KEY_FILTER, isValidIdShort } from './id-short.util';

describe('ID_SHORT_KEY_FILTER', () => {
  // PrimeNG KeyFilter prüft beim Tippen den bisherigen Wert plus das neue Zeichen ...
  const acceptsTyped = (existing: string, char: string) => ID_SHORT_KEY_FILTER.test(existing + char);
  // ... und beim Einfügen jedes Zeichen einzeln.
  const acceptsPasted = (text: string) => [...text].every((char) => ID_SHORT_KEY_FILTER.test(char));

  it('blocks a dot typed after valid characters', () => {
    expect(acceptsTyped('Etage', '.')).toBe(false);
  });

  it('blocks other special characters typed after valid characters', () => {
    for (const char of [' ', '/', '#', 'ä', ',']) {
      expect(acceptsTyped('Raum', char)).toBe(false);
    }
  });

  it('allows letters, digits, underscores and hyphens while typing', () => {
    expect(acceptsTyped('Etage', '_')).toBe(true);
    expect(acceptsTyped('Etage_', '3')).toBe(true);
    expect(acceptsTyped('', 'E')).toBe(true);
    expect(acceptsTyped('Arbeitsplatz', '-')).toBe(true);
  });

  it('keeps existing idShorts with a hyphen editable', () => {
    expect(acceptsTyped('Arbeitsplatz-1', '2')).toBe(true);
  });

  it('blocks pasted text containing a dot', () => {
    expect(acceptsPasted('Etage.3')).toBe(false);
  });

  it('allows pasted text with only permitted characters', () => {
    expect(acceptsPasted('Etage_3')).toBe(true);
  });
});

describe('isValidIdShort', () => {
  it('accepts valid idShorts', () => {
    for (const idShort of ['Etage_3', 'Raum_310', 'Arbeitsplatz-1', 'ab']) {
      expect(isValidIdShort(idShort)).toBe(true);
    }
  });

  it('rejects idShorts containing a dot', () => {
    expect(isValidIdShort('Etage.3')).toBe(false);
    expect(isValidIdShort('.Etage')).toBe(false);
    expect(isValidIdShort('Etage.')).toBe(false);
  });

  it('rejects idShorts violating the AAS pattern', () => {
    for (const idShort of ['3Etage', '_Etage', 'Etage-', 'E', 'Raum 310', 'Räume', '']) {
      expect(isValidIdShort(idShort)).toBe(false);
    }
  });

  it('rejects missing values', () => {
    expect(isValidIdShort(null)).toBe(false);
    expect(isValidIdShort(undefined)).toBe(false);
  });
});
