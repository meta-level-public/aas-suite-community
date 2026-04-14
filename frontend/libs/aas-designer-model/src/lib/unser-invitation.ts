export class UserInvitation {
  id: number | undefined;
  name: string = '';
  vorname: string = '';
  _email: string = '';

  benutzerRollen: any[] = [];
  organisationId: number | undefined;
  anlageDatum: Date | undefined;
  validUntil: Date | undefined;
  language: string = '';
  invitationGuid: string = '';

  static fromDto(dto: any) {
    const benutzer = new UserInvitation();
    Object.assign(benutzer, dto);
    if (dto.anlageDatum) benutzer.anlageDatum = new Date(dto.anlageDatum);
    if (dto.validUntil) benutzer.validUntil = new Date(dto.validUntil);

    return benutzer;
  }

  toDto() {
    return {
      id: this.id,
      name: this.name,
      vorname: this.vorname,
      email: this.email,
      benutzerRollen: this.benutzerRollen,
      organisationId: this.organisationId,
      invitationGuid: this.invitationGuid,
    };
  }

  set email(value: string | number) {
    this._email = value.toString();
  }

  get email(): string {
    return this._email.toString();
  }

  isValid() {
    return this.name !== '' && this.vorname !== '' && this.email !== '' && this.benutzerRollen.length > 0;
  }
}
