export class UserOrganisationUebersicht {
  orgaName: string = '';
  benutzerRollen: string[] = [];
  aktiv: boolean = false;

  static fromDto(dto: any): UserOrganisationUebersicht {
    const uebersicht = new UserOrganisationUebersicht();

    Object.assign(uebersicht, dto);
    return uebersicht;
  }
}
