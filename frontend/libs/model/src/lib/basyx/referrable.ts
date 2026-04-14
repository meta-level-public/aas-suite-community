export class Referrable {
  _idShort: string = '';

  set idShort(value: string | number) {
    this._idShort = value.toString();
  }

  get idShort(): string {
    return this._idShort.toString();
  }
}
