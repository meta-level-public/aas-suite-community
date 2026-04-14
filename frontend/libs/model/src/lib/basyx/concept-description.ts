import { EClassItem } from '../eclass-item';
import { Identification } from './identification';
import { MultiLanguagePropertyValue } from './multi-language-property';

export class ConceptDescription {
  idShort: string = '';
  identification: Identification = new Identification();
  modelType: { name: string } = { name: 'ConceptDescription' };
  administration: any;
  isCaseOf: any;

  embeddedDataSpecifications: EmbeddedDataSpecification[] = [new EmbeddedDataSpecification()];

  mlGenUuid: string = '';

  static fromDto(dto: any) {
    const conceptDescription = new ConceptDescription();

    conceptDescription.idShort = dto?.idShort ?? '';
    conceptDescription.administration = dto?.administration;
    conceptDescription.isCaseOf = dto?.isCaseOf;
    conceptDescription.mlGenUuid = dto?.mlGenUuid ?? '';

    if (dto?.modelType?.name != null) {
      conceptDescription.modelType = { name: dto.modelType.name };
    } else if (typeof dto?.modelType === 'string') {
      conceptDescription.modelType = { name: dto.modelType };
    }

    if (dto?.identification != null) {
      conceptDescription.identification = Object.assign(new Identification(), dto.identification);
    } else if (dto?.id != null) {
      conceptDescription.identification.id = `${dto.id}`;
    }

    if (dto?.idType != null) {
      conceptDescription.identification.idType = dto.idType;
    }

    conceptDescription.embeddedDataSpecifications = Array.isArray(dto?.embeddedDataSpecifications)
      ? dto.embeddedDataSpecifications.map((embeddedDataSpecification: any) => {
          const mappedEmbeddedDataSpecification = new EmbeddedDataSpecification();
          mappedEmbeddedDataSpecification.dataSpecification = embeddedDataSpecification?.dataSpecification;
          mappedEmbeddedDataSpecification.dataSpecificationContent = Object.assign(
            new DataSpecification(),
            embeddedDataSpecification?.dataSpecificationContent ?? {},
          );
          return mappedEmbeddedDataSpecification;
        })
      : [new EmbeddedDataSpecification()];

    return conceptDescription;
  }

  static fromEclass(eclassItem: EClassItem) {
    const conceptDescription = new ConceptDescription();
    conceptDescription.identification.idType = 'IRDI';
    conceptDescription.identification.id = eclassItem.irdi;
    if (conceptDescription.embeddedDataSpecifications[0].dataSpecificationContent != null) {
      // TODO: aktuelle Sprache benutzen
      conceptDescription.embeddedDataSpecifications[0].dataSpecificationContent.preferredName = [
        { language: 'de', text: eclassItem.benennung },
      ];
      conceptDescription.embeddedDataSpecifications[0].dataSpecificationContent.definition = [
        { language: 'de', text: eclassItem.definition },
      ];
      conceptDescription.embeddedDataSpecifications[0].dataSpecificationContent.dataType = eclassItem.datenformat;
    }
    return conceptDescription;
  }

  getBenennung(userLang: string) {
    let found = this.embeddedDataSpecifications[0].dataSpecificationContent?.preferredName?.find(
      (spec: any) => (spec.language as string).toLowerCase() === userLang,
    );
    if (found != null) {
      return found.text;
    }

    found = this.embeddedDataSpecifications[0].dataSpecificationContent?.definition?.find(
      (spec: any) => (spec.language as string).toLowerCase() === 'en',
    );
    if (found != null) {
      return found.text;
    }

    if (this.embeddedDataSpecifications[0].dataSpecificationContent?.definition?.length > 0) {
      found = this.embeddedDataSpecifications[0].dataSpecificationContent.definition[0];
      if (found != null) {
        return found.text;
      }
    }

    return '';
  }

  getDefinition(userLang: string) {
    if (this.embeddedDataSpecifications[0].dataSpecificationContent != null) {
      let found = this.embeddedDataSpecifications[0].dataSpecificationContent?.definition.find(
        (spec: any) => (spec.language as string).toLowerCase() === userLang,
      );
      if (found != null) {
        return found.text;
      }

      found = this.embeddedDataSpecifications[0].dataSpecificationContent?.definition.find(
        (spec: any) => (spec.language as string).toLowerCase() === 'en',
      );
      if (found != null) {
        return found.text;
      }

      found = this.embeddedDataSpecifications[0].dataSpecificationContent?.definition[0];
      if (found != null) {
        return found.text;
      }
    }
    return '';
  }

  get type() {
    return this.identification.idType;
  }
  get id() {
    return this.identification.id;
  }

  get format() {
    return this.embeddedDataSpecifications[0].dataSpecificationContent?.dataType;
  }

  get unit() {
    return this.embeddedDataSpecifications[0].dataSpecificationContent?.unit;
  }
}

export class EmbeddedDataSpecification {
  dataSpecification: any;
  dataSpecificationContent: DataSpecification = new DataSpecification();
}

export class DataSpecification {
  dataType: string = '';
  preferredName: MultiLanguagePropertyValue[] = [];
  definition: MultiLanguagePropertyValue[] = [];
  shortName: MultiLanguagePropertyValue[] = [];

  sourceOfDefinition: any;
  symbol: any;
  unit: any;
  value: any;
  valueFormat: any;
}
