import { MultiLanguagePropertyValue } from '@aas/model';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Address } from './address';
import { Helper } from './helper';
import { Marking } from './marking';

export class Nameplate {
  manufacturer: MultiLanguagePropertyValue[] = [];
  address: Address = new Address();
  productDesignation: MultiLanguagePropertyValue[] = [];
  productRoot: MultiLanguagePropertyValue[] = [];
  productFamily: MultiLanguagePropertyValue[] = [];
  yearOfConstruction: string | undefined;
  markings: Marking[] = [];
  serialNumber: string | undefined;
  raw: any;
  type: string = '';

  static async fromDto(dto: any) {
    const nameplate = new Nameplate('unknown');

    nameplate.raw = dto;
    const contactInformation = Nameplate.findContactInformationCollection(dto.submodelElements ?? []);

    nameplate.manufacturer = dto.submodelElements?.find((sme: any) => sme.idShort === 'ManufacturerName')?.value;
    nameplate.address = Address.fromDto(contactInformation?.value) ?? new Address();
    nameplate.productDesignation = dto.submodelElements?.find(
      (sme: any) => sme.idShort === 'ManufacturerProductDesignation',
    )?.value;
    nameplate.productFamily = dto.submodelElements?.find(
      (sme: any) => sme.idShort === 'ManufacturerProductFamily',
    )?.value;
    nameplate.productRoot = dto.submodelElements?.find((sme: any) => sme.idShort === 'ManufacturerProductRoot')?.value;
    nameplate.yearOfConstruction =
      dto.submodelElements?.find((sme: any) => sme.idShort === 'YearOfConstruction')?.value ?? '';

    nameplate.serialNumber = dto.submodelElements?.find((sme: any) => sme.idShort === 'SerialNumber')?.value ?? '';
    const markings: Marking[] = [];

    dto.submodelElements
      ?.find((sme: any) => sme.idShort === 'Markings')
      ?.value?.forEach((el: any) => {
        const m = Marking.fromDto(el);
        if (m.name !== '' && m.filename !== '') {
          markings.push(m);
        }
      });

    nameplate.type = dto.semanticId?.keys[0]?.value ?? 'unknown';

    nameplate.markings = markings;
    return nameplate;
  }

  async toDto(apiPath: string, prefix: string, http?: HttpClient) {
    if (this.raw == null) {
      if (http == null) {
        throw new Error('HttpClient is required to create a new nameplate dto');
      }

      const template = await lastValueFrom(http.get<any>(`${apiPath}/SubmodelTemplate/GetNameplateTemplate`));

      this.address.raw = Nameplate.findContactInformationCollection(template.submodelElements ?? [])?.value;

      this.raw = template;
    }

    let el = this.raw.submodelElements.find((sme: any) => sme.idShort === 'ManufacturerName');
    el.value = this.manufacturer;

    el = this.raw.submodelElements.find((sme: any) => sme.idShort === 'ManufacturerProductDesignation');
    el.value = this.productDesignation;

    el = this.raw.submodelElements.find((sme: any) => sme.idShort === 'ManufacturerProductFamily');
    el.value = this.productFamily;

    el = this.raw.submodelElements.find((sme: any) => sme.idShort === 'ManufacturerProductRoot');
    el.value = this.productRoot;

    el = Nameplate.findContactInformationCollection(this.raw.submodelElements ?? []);
    if (el != null) {
      if (this.address.raw == null && Array.isArray(el.value)) {
        this.address.raw = el.value;
      }

      el.value = this.address.toDto(prefix);
    }

    Helper.setValue(this.raw.submodelElements, 'YearOfConstruction', this.yearOfConstruction, prefix);
    Helper.setValue(this.raw.submodelElements, 'SerialNumber', this.serialNumber, prefix);

    const markingEl = this.raw.submodelElements.find((sme: any) => sme.idShort === 'Markings');
    if (markingEl != null) {
      const mappedMarkings = [];
      let num = 0;
      for (const marking of this.markings) {
        mappedMarkings.push(await marking.toDto(num, apiPath, prefix, http));
        num++;
      }
      markingEl.value = mappedMarkings;
    }

    return this.raw;
  }

  constructor(type: string) {
    this.type = type;
  }

  private static findContactInformationCollection(elements: any[]): any | undefined {
    for (const element of elements) {
      if (`${element?.idShort ?? ''}` === 'ContactInformation') {
        return element;
      }

      const children = element?.value;
      if (!Array.isArray(children)) {
        continue;
      }

      const nestedMatch = Nameplate.findContactInformationCollection(children);
      if (nestedMatch != null) {
        return nestedMatch;
      }
    }

    return undefined;
  }
}
