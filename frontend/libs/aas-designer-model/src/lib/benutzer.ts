import type { Organisation } from './organisation';
import { Rolle } from './rolle';

export class Benutzer {
  id: number | undefined;
  name: string = '';
  vorname: string = '';
  _email: string = '';
  telefon: string | undefined;
  rolle: Rolle | undefined;
  benutzerRollen: any[] = [];
  organisation: Organisation | undefined;
  accountAktiv: boolean = true;
  organisationId: number | undefined;
  geloescht: boolean = false;
  jwtToken: string = '';
  refreshToken: string = '';
  accessToken: string = '';

  static fromDto(dto: any) {
    const benutzer = new Benutzer();
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
      organisationId: this.organisationId,
    };
  }

  set email(value: string | number) {
    this._email = value.toString();
  }

  get email(): string {
    return this._email.toString();
  }
}
