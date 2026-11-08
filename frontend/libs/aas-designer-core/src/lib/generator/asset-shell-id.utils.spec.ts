import { describe, expect, it } from 'vitest';
import {
  buildAssetIdentifier,
  buildAssetShellIdentifier,
  buildAssetShellIdShortSuggestion,
  buildNextAssetShellIdShortCandidate,
  normalizeAssetShellIdShort,
} from './asset-shell-id.utils';

/** idShort pattern from the AAS metamodel (Constraint AASd-002). */
const ID_SHORT_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*[a-zA-Z0-9_]+$/;

describe('asset-shell-id.utils', () => {
  describe('normalizeAssetShellIdShort', () => {
    it.each([
      ['Pumpe Größe 3', 'Pumpe_Groesse_3'],
      ['Übergabe Ölpumpe', 'Uebergabe_Oelpumpe'],
      ['Café Crème', 'Cafe_Creme'],
      ['  Battery-Pack  ', 'Battery-Pack'],
      ['a--b__c', 'a-b_c'],
      ['--Motor--', 'Motor'],
      ['123Motor', 'a123Motor'],
      ['_x', 'xa'],
      ['9-', 'a9'],
      ['Motor (V2) / 400V', 'Motor_V2_400V'],
    ])('normalizes "%s" to "%s"', (input, expected) => {
      expect(normalizeAssetShellIdShort(input)).toBe(expected);
    });

    it.each([null, undefined, '', '   ', '!!!', '-_-'])('returns an empty string for %j', (input) => {
      expect(normalizeAssetShellIdShort(input)).toBe('');
    });

    it.each(['Pumpe Größe 3', '123', 'x', '9-', 'Motor (V2) / 400V', 'ß', 'a-'])(
      'produces a metamodel conformant idShort for "%s"',
      (input) => {
        expect(normalizeAssetShellIdShort(input)).toMatch(ID_SHORT_PATTERN);
      },
    );
  });

  describe('buildAssetShellIdShortSuggestion', () => {
    const description = [
      { language: 'en', text: 'Hydraulic pump for heavy loads' },
      { language: 'de', text: 'Hydraulikpumpe für schwere Lasten' },
    ];

    it('builds a camel case idShort from the preferred description language', () => {
      expect(buildAssetShellIdShortSuggestion(description, ['de'])).toBe('hydraulikpumpeFuerSchwereLasten');
    });

    it('matches preferred languages case-insensitively and in the given order', () => {
      expect(buildAssetShellIdShortSuggestion(description, [' FR ', 'EN', 'de'])).toBe('hydraulicPumpForHeavyLoads');
    });

    it('falls back to the first non-empty description', () => {
      expect(
        buildAssetShellIdShortSuggestion(
          [
            { language: 'de', text: '   ' },
            { language: 'en', text: 'Battery module' },
          ],
          ['de'],
        ),
      ).toBe('batteryModule');
    });

    it('limits the suggestion to eight words', () => {
      expect(
        buildAssetShellIdShortSuggestion([{ language: 'en', text: 'one two three four five six seven eight nine' }]),
      ).toBe('oneTwoThreeFourFiveSixSevenEight');
    });

    it('limits the suggestion to 60 characters', () => {
      const longWord = 'a'.repeat(80);

      expect(buildAssetShellIdShortSuggestion([{ language: 'en', text: longWord }])).toHaveLength(60);
    });

    it('prefixes suggestions that would start with a digit', () => {
      expect(buildAssetShellIdShortSuggestion([{ language: 'de', text: '48 V Akku' }])).toBe('a48VAkku');
    });

    it.each([[undefined], [[]], [[{ language: 'en', text: 'A' }]], [[{ language: 'en', text: '!!' }]]])(
      'returns an empty suggestion for unusable descriptions %j',
      (input) => {
        expect(buildAssetShellIdShortSuggestion(input)).toBe('');
      },
    );
  });

  describe('buildAssetShellIdentifier and buildAssetIdentifier', () => {
    it('combines prefix and normalized idShort', () => {
      expect(buildAssetShellIdentifier('https://acme.example/', 'Pump 4711')).toBe(
        'https://acme.example/ids/aas/Pump_4711',
      );
      expect(buildAssetIdentifier('https://acme.example//', 'Pump 4711')).toBe(
        'https://acme.example/ids/asset/Pump_4711',
      );
    });

    it('uses example.com when no prefix is configured', () => {
      expect(buildAssetShellIdentifier(null, 'Pump')).toBe('https://example.com/ids/aas/Pump');
      expect(buildAssetIdentifier('   ', 'Pump')).toBe('https://example.com/ids/asset/Pump');
    });

    it('returns an empty identifier when the idShort is not usable', () => {
      expect(buildAssetShellIdentifier('https://acme.example', '   ')).toBe('');
      expect(buildAssetIdentifier('https://acme.example', null)).toBe('');
    });
  });

  describe('buildNextAssetShellIdShortCandidate', () => {
    it.each([
      ['Pump', 'Pump1'],
      ['Pump1', 'Pump2'],
      ['Pump09', 'Pump10'],
      ['Pump 7', 'Pump_8'],
      ['42', 'a43'],
    ])('suggests "%s" -> "%s"', (input, expected) => {
      expect(buildNextAssetShellIdShortCandidate(input)).toBe(expected);
    });

    it('returns an empty candidate for empty input', () => {
      expect(buildNextAssetShellIdShortCandidate('  ')).toBe('');
      expect(buildNextAssetShellIdShortCandidate(undefined)).toBe('');
    });
  });
});
