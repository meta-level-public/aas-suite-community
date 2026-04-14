export class EClassItem {
  irdi: string = '';
  benennung: string = '';
  definition: string = '';
  datenformat: string = '';
  preferredName: { 'de-DE': string; 'en-US': string } = { 'de-DE': '', 'en-US': '' };

  unit: string = '';
  unitId: string = '';

  valueList: { value: string; id: string }[] = [];

  fullItem: any;

  static fromDto(dto: any, language: string) {
    const eclassItem = new EClassItem();

    Object.assign(eclassItem, dto);
    eclassItem.benennung = dto.preferredName[EClassItem.mapGuiLanguageToEclass(language)];
    eclassItem.unitId = dto.unit?.irdi;

    return eclassItem;
  }

  static parseDto(dto: any, language: string) {
    const eClassItem = new EClassItem();

    //TODO eleganteren / dynamischere Lösung implementieren
    language = language === 'de' ? 'de-DE' : 'en-US';

    eClassItem.irdi = dto?.irdi;
    eClassItem.benennung = dto?.preferredName[language];
    eClassItem.definition = dto?.definition[language];
    eClassItem.datenformat = dto?.propertyDataType;

    return eClassItem;
  }

  static mapGuiLanguageToEclass(lang: string) {
    switch (lang) {
      case 'de':
        return 'de-DE';
      case 'en':
        return 'en-US';
      default:
        return 'en-US';
    }
  }

  static mapEclassToGuiLanguage(lang: string) {
    switch (lang) {
      case 'de-DE':
        return 'de';
      case 'en-US':
        return 'en';
      default:
        return 'de';
    }
  }
}
