import { Organisation } from './organisation';

export class OrgaRechnung {
  id: number | undefined;
  rechnungsdatum: Date | null = null;
  summe: number = 0;
  daten: string = '';

  anlageDatum: Date | null = null;
  aenderungsDatum: Date | null = null;

  organisation: Organisation | null = null;

  static fromDto(dto: any) {
    const orgaRechnung = new OrgaRechnung();
    Object.assign(orgaRechnung, dto);

    if (dto.anlageDatum != null) orgaRechnung.anlageDatum = new Date(dto.anlageDatum);
    if (dto.aenderungsDatum != null) orgaRechnung.aenderungsDatum = new Date(dto.aenderungsDatum);
    if (dto.rechnungsdatum != null) orgaRechnung.rechnungsdatum = new Date(dto.rechnungsdatum);

    if (dto.organisation != null) orgaRechnung.organisation = Organisation.fromDto(dto.organisation);

    return orgaRechnung;
  }
}
