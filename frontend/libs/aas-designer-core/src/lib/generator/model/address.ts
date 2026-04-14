import { IdGenerationUtil } from '@aas/helpers';
import { IdentifierType, MultiLanguagePropertyValue } from '@aas/model';

export class Address {
  countryCode: MultiLanguagePropertyValue[] = [];
  street: MultiLanguagePropertyValue[] = [];
  zip: MultiLanguagePropertyValue[] = [];
  cityTown: MultiLanguagePropertyValue[] = [];
  stateCounty: MultiLanguagePropertyValue[] = [];
  raw: any;

  static fromDto(dto: any) {
    const address = new Address();

    if (dto != null) {
      address.raw = dto;
      address.countryCode = Address.findByAliases(dto, ['NationalCode', 'CountryCode', 'Country'])?.value ?? [];
      address.street = Address.findByAliases(dto, ['Street', 'StreetName'])?.value ?? [];
      address.zip = Address.findByAliases(dto, ['Zipcode', 'ZipCode', 'Zip'])?.value ?? [];
      address.cityTown = Address.findByAliases(dto, ['CityTown', 'City'])?.value ?? [];
      address.stateCounty = Address.findByAliases(dto, ['StateCounty', 'State'])?.value ?? [];
    }
    return address;
  }

  toDto(prefix: string) {
    let el = Address.findByAliases(this.raw, ['NationalCode', 'CountryCode', 'Country']);
    if (el != null) {
      el.value = this.countryCode;
    }

    el = Address.findByAliases(this.raw, ['Street', 'StreetName']);
    if (el != null) {
      el.value = this.street;
    }

    el = Address.findByAliases(this.raw, ['Zipcode', 'ZipCode', 'Zip']);
    if (el != null) {
      el.value = this.zip;
    }

    el = Address.findByAliases(this.raw, ['CityTown', 'City']);
    if (el != null) {
      el.value = this.cityTown;
    }

    el = Address.findByAliases(this.raw, ['StateCounty', 'State']);
    if (el != null) {
      el.value = this.stateCounty;
    }

    const id = IdGenerationUtil.generateIri('smc', prefix);
    this.raw.semanticId = {};
    this.raw.semanticId.keys = [];
    this.raw.semanticId.keys.push({
      idType: 'IRI',
      value: id,
      local: true,
      type: IdentifierType.SubmodelElementCollection,
    });

    return this.raw;
  }

  private static findByAliases(elements: any[] | undefined, aliases: string[]) {
    return elements?.find((sme: any) => aliases.includes(`${sme?.idShort ?? ''}`));
  }
}
