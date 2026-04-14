export class OrganisationUebersichtBenutzerDto {
  id: number = 0;
  name: string = '';
  vorname: string = '';
  _email: string = '';
  telefon: string = '';
  geloescht: boolean = false;
  accountAktiv: boolean = false;
  benutzerRollen: string[] = [];
  isSystemUser: boolean = false;

  static fromDto(dto: any) {
    const benutzer = new OrganisationUebersichtBenutzerDto();
    Object.assign(benutzer, dto);

    return benutzer;
  }

  toDto() {
    return {
      id: this.id,
      name: this.name,
      vorname: this.vorname,
      email: this.email,
      telefon: this.telefon,
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
