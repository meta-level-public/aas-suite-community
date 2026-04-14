export class OrganisationAdminBenutzer {
  id: number | undefined;
  name: string = '';
  vorname: string = '';
  _email: string = '';
  telefon: string = '';
  passwort: string = '';
  organisationId: number | undefined;
  benutzerRollen: string[] = [BenutzerRollen.ORGA_ADMIN, BenutzerRollen.SYSTEM_ADMIN];
  accountAktiv: boolean = true;
  geloescht: boolean = false;

  static fromDatabase(dto: any) {
    const organisationAdminBenutzer = new OrganisationAdminBenutzer();
    Object.assign(organisationAdminBenutzer, dto);
    organisationAdminBenutzer.name = dto.name;
    organisationAdminBenutzer.vorname = dto.vorname;
    organisationAdminBenutzer.email = dto.email;
    organisationAdminBenutzer.telefon = dto.telefon;
    organisationAdminBenutzer.organisationId = dto.organisationId;
    organisationAdminBenutzer.benutzerRollen = dto.benutzerRollen;
    organisationAdminBenutzer.accountAktiv = dto.accountAktiv;
    organisationAdminBenutzer.geloescht = dto.geloescht;

    return organisationAdminBenutzer;
  }

  toDto() {
    return {
      id: this.id,
      name: this.name,
      vorname: this.vorname,
      email: this._email,
      telefon: this.telefon,
      passwort: this.passwort,
      benutzerRollen: this.benutzerRollen,
      accountAktiv: this.accountAktiv,
    };
  }

  set email(value: string | number) {
    this._email = value.toString();
  }

  get email(): string {
    return this._email.toString();
  }
}

export const BenutzerRollen = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  ORGA_ADMIN: 'ORGA_ADMIN',
  BENUTZER: 'BENUTZER',
};
