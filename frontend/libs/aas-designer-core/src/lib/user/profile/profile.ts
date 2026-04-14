export class Profile {
  name: string = '';
  vorname: string = '';
  _email: string = '';
  profilbildBase64: string = '';

  set email(value: string | number) {
    this._email = value.toString();
  }

  get email(): string {
    return this._email.toString();
  }

  toDto() {
    return {
      name: this.name,
      vorname: this.vorname,
      email: this._email,
      profilbildBase64: this.profilbildBase64,
    };
  }
}
