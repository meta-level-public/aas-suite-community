import type { HeaderParameter } from '@aas/webapi-client';
import type { Benutzer } from './benutzer';
import { OrgaPaymentModel } from './orga-payment-model';

export class Organisation {
  id: number | undefined;
  name: string = '';
  _email: string = '';
  fax: string = '';
  telefon: string = '';
  accountAktiv: boolean = true;
  maintenanceActive: boolean = false;
  geloescht: boolean | undefined;
  strasse: string = '';
  plz: string = '';
  ort: string = '';
  bundesland: string = '';
  laenderCode: string = '';
  logoBase64: string = '';

  bezahlmodelle: OrgaPaymentModel[] = [];

  benutzers: Benutzer[] | any;
  aenderungsBenutzer: string = '';
  anlageDatum: Date | null = null;
  aenderungsDatum: Date | null = null;
  _iriPrefix = '';
  themeUrl = '';
  registryUrl = '';
  aasServerUrl = '';

  ownedEclassData: any[] = [];

  useInternalInfrastructure: boolean = false;
  aasDiscoveryUrl: string = '';
  aasRegistryUrl: string = '';
  aasRepositoryUrl: string = '';
  submodelRegistryUrl: string = '';
  submodelRepositoryUrl: string = '';
  conceptDescriptionRepositoryUrl: string = '';
  externalAasRegistryUrl: string = '';
  externalAasRepositoryUrl: string = '';
  externalAasDiscoveryUrl: string = '';
  externalSubmodelRegistryUrl: string = '';
  externalSubmodelRepositoryUrl: string = '';
  externalConceptDescriptionRepositoryUrl: string = '';
  headerParameters: HeaderParameter[] = [];

  static fromDto(dto: any) {
    const organisation = new Organisation();
    Object.assign(organisation, dto);
    organisation.aenderungsDatum = new Date(dto.aenderungsDatum);
    organisation.anlageDatum = new Date(dto.anlageDatum);

    if (dto.bezahlmodelle != null) {
      organisation.bezahlmodelle = dto.bezahlmodelle.map((bm: any) => OrgaPaymentModel.fromDto(bm));
    }
    if (dto.ownedEclassData != null) {
      organisation.ownedEclassData.forEach((eclass: any) => {
        eclass.generationDate = new Date(eclass.generationDate);
      });
    }
    return organisation;
  }

  toDto() {
    return {
      id: this.id,
      name: this.name,
      email: this._email,
      telefon: this.telefon,
      accountAktiv: this.accountAktiv,
      fax: this.fax,
      iriPrefix: this.iriPrefix,
      themeUrl: this.themeUrl,
      registryUrl: this.registryUrl,
      aasServerUrl: this.aasServerUrl,
      strasse: this.strasse,
      plz: this.plz,
      ort: this.ort,
      bundesland: this.bundesland,
      laenderCode: this.laenderCode,
      logoBase64: this.logoBase64,
      useInternalInfrastructure: this.useInternalInfrastructure,
      aasDiscoveryUrl: this.aasDiscoveryUrl,
      aasRegistryUrl: this.aasRegistryUrl,
      aasRepositoryUrl: this.aasRepositoryUrl,
      submodelRegistryUrl: this.submodelRegistryUrl,
      submodelRepositoryUrl: this.submodelRepositoryUrl,
      conceptDescriptionRepositoryUrl: this.conceptDescriptionRepositoryUrl,
      externalAasRegistryUrl: this.externalAasRegistryUrl,
      externalAasRepositoryUrl: this.externalAasRepositoryUrl,
      externalAasDiscoveryUrl: this.externalAasDiscoveryUrl,
      externalSubmodelRegistryUrl: this.externalSubmodelRegistryUrl,
      externalSubmodelRepositoryUrl: this.externalSubmodelRepositoryUrl,
      externalConceptDescriptionRepositoryUrl: this.externalConceptDescriptionRepositoryUrl,
      headerParameters: this.headerParameters,
    };
  }

  get maxUsers() {
    return this.bezahlmodelle.reduce((acc, obj) => {
      return acc + obj.paymentModel.anzahlNutzer;
    }, 0);
  }

  set iriPrefix(value: string | number) {
    this._iriPrefix = value.toString();
  }

  get iriPrefix(): string {
    return this._iriPrefix.toString();
  }
  set email(value: string | number) {
    this._email = value.toString();
  }

  get email(): string {
    return this._email.toString();
  }
}

export interface Adresse {
  id: number | undefined;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  bundesland: string;
  laenderCode: string;
  anlageBenutzer: string | undefined;
  geloescht: boolean | undefined;
  aenderungsZaehler: string | undefined;
  aenderungsBenutzer: string | undefined;
  anlageDatum: Date | undefined;
  aenderungsDatum: Date | undefined;
}

export interface BenutzerRollenDto {
  id: number;
  name: string;
  geloescht: boolean;
}
