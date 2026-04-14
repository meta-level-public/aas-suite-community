export class OrganisationAdminUebersichtDto {
  id: number | undefined;
  orgaName: string = '';
  aktiv: boolean = true;
  wartung: boolean = false;
  strasse: string = '';
  plz: string = '';
  ort: string = '';
  hatGueltigesAbo: boolean = false;
  anzahlNutzer: number = 0;
  anlageDatum: Date | null = null;
  aenderungsDatum: Date | null = null;
  orgaEmail: string = '';

  static fromDto(dto: any) {
    const organisation = new OrganisationAdminUebersichtDto();
    Object.assign(organisation, dto);
    organisation.aenderungsDatum = new Date(dto.aenderungsDatum);
    organisation.anlageDatum = new Date(dto.anlageDatum);

    return organisation;
  }
}
