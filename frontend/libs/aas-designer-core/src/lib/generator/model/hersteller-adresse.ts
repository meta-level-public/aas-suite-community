import { MultiLanguagePropertyValue } from '@aas/model';

export class HerstellerAdresse {
  id: number | undefined;
  name: string = '';
  nameMlpKeyValues: MultiLanguagePropertyValue[] = [];
  laenderCode: string | undefined;
  strasse: string | undefined;
  strasseMlpKeyValues: MultiLanguagePropertyValue[] = [];
  plz: string | undefined;
  ort: string | undefined;
  ortMlpKeyValues: MultiLanguagePropertyValue[] = [];
  bundesland: string | undefined;
  bundeslandMlpKeyValues: MultiLanguagePropertyValue[] = [];

  static createEmpty() {
    const address = new HerstellerAdresse();

    address.nameMlpKeyValues = this.ensureBilingualValues([], '');
    address.strasseMlpKeyValues = this.ensureBilingualValues([], '');
    address.ortMlpKeyValues = this.ensureBilingualValues([], '');
    address.bundeslandMlpKeyValues = this.ensureBilingualValues([], '');
    address.name = '';
    address.strasse = '';
    address.ort = '';
    address.bundesland = '';
    address.laenderCode = '';
    address.plz = '';

    return address;
  }

  static fromDto(dto: any) {
    const address = new HerstellerAdresse();

    Object.assign(address, dto);
    address.nameMlpKeyValues = this.ensureBilingualValues(dto?.nameMlpKeyValues, address.name);
    address.strasseMlpKeyValues = this.ensureBilingualValues(dto?.strasseMlpKeyValues, address.strasse);
    address.ortMlpKeyValues = this.ensureBilingualValues(dto?.ortMlpKeyValues, address.ort);
    address.bundeslandMlpKeyValues = this.ensureBilingualValues(dto?.bundeslandMlpKeyValues, address.bundesland);
    address.name = this.getPreferredText(address.nameMlpKeyValues, address.name);
    address.strasse = this.getPreferredText(address.strasseMlpKeyValues, address.strasse);
    address.ort = this.getPreferredText(address.ortMlpKeyValues, address.ort);
    address.bundesland = this.getPreferredText(address.bundeslandMlpKeyValues, address.bundesland);

    return address;
  }

  toDto() {
    return {
      id: this.id,
      name: this.name,
      nameMlpKeyValues: this.nameMlpKeyValues,
      laenderCode: this.laenderCode,
      strasse: this.strasse,
      strasseMlpKeyValues: this.strasseMlpKeyValues,
      plz: this.plz,
      ort: this.ort,
      ortMlpKeyValues: this.ortMlpKeyValues,
      bundesland: this.bundesland,
      bundeslandMlpKeyValues: this.bundeslandMlpKeyValues,
    };
  }

  getDisplayName(language: string) {
    return HerstellerAdresse.getPreferredText(this.nameMlpKeyValues, this.name, language);
  }

  getDisplayStreet(language: string) {
    return HerstellerAdresse.getPreferredText(this.strasseMlpKeyValues, this.strasse, language);
  }

  getDisplayCity(language: string) {
    return HerstellerAdresse.getPreferredText(this.ortMlpKeyValues, this.ort, language);
  }

  getDisplayState(language: string) {
    return HerstellerAdresse.getPreferredText(this.bundeslandMlpKeyValues, this.bundesland, language);
  }

  private static ensureBilingualValues(values: any[] | undefined, fallback: string | undefined) {
    const normalizedValues = (values ?? [])
      .filter((value) => `${value?.text ?? ''}`.trim() !== '')
      .map((value) => ({
        language: `${value?.language ?? ''}`.trim().toLowerCase(),
        text: `${value?.text ?? ''}`.trim(),
      }))
      .filter((value) => value.language !== '');

    const sourceText =
      normalizedValues.find((value) => value.language === 'de')?.text ??
      normalizedValues.find((value) => value.language === 'en')?.text ??
      normalizedValues[0]?.text ??
      `${fallback ?? ''}`.trim();

    if (sourceText === '' && normalizedValues.length === 0) {
      return [];
    }

    const result = [...normalizedValues];

    if (sourceText !== '' && !result.some((value) => value.language === 'de')) {
      result.unshift({ language: 'de', text: sourceText });
    }

    if (sourceText !== '' && !result.some((value) => value.language === 'en')) {
      result.splice(result.some((value) => value.language === 'de') ? 1 : 0, 0, {
        language: 'en',
        text: sourceText,
      });
    }

    return result;
  }

  private static getPreferredText(values: MultiLanguagePropertyValue[], fallback?: string, preferredLanguage?: string) {
    const preferences = [preferredLanguage, 'de', 'en']
      .map((language) => `${language ?? ''}`.trim().toLowerCase())
      .filter((language, index, items) => language !== '' && items.indexOf(language) === index);

    for (const language of preferences) {
      const value = values.find((entry) => entry.language === language)?.text;
      if (value != null && value !== '') {
        return value;
      }
    }

    return values[0]?.text ?? fallback ?? '';
  }
}
