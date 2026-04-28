import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdGenerationUtil {
  generateIri(
    type: 'submodel' | 'property' | 'collection' | 'mlp' | 'file' | 'asset' | 'other' | string,
    prefix: string,
  ) {
    return IdGenerationUtil.generateIri(type, prefix);
  }

  static generateIri(
    type: 'submodel' | 'property' | 'collection' | 'mlp' | 'file' | 'asset' | 'other' | 'aas' | string,
    prefix: string,
  ) {
    let generatedIRdi = prefix.replace(/\/+$/, '') + '/ids';
    switch (type) {
      case 'submodel':
        generatedIRdi += `/sm/${this.getRandomInt(1000, 9999)}_${this.getRandomInt(1000, 9999)}_${this.getRandomInt(
          1000,
          9999,
        )}_${this.getRandomInt(1000, 9999)}`;
        break;
      case 'aas':
        generatedIRdi += `/aas/${this.getRandomInt(1000, 9999)}_${this.getRandomInt(1000, 9999)}_${this.getRandomInt(
          1000,
          9999,
        )}_${this.getRandomInt(1000, 9999)}`;
        break;
      case 'collection':
        generatedIRdi += `/coll/${this.getRandomInt(1000, 9999)}_${this.getRandomInt(1000, 9999)}_${this.getRandomInt(
          1000,
          9999,
        )}_${this.getRandomInt(1000, 9999)}`;
        break;
      case 'property':
        generatedIRdi += `/prop/${this.getRandomInt(1000, 9999)}_${this.getRandomInt(1000, 9999)}_${this.getRandomInt(
          1000,
          9999,
        )}_${this.getRandomInt(1000, 9999)}`;
        break;
      case 'mlp':
        generatedIRdi += `/mlp/${this.getRandomInt(1000, 9999)}_${this.getRandomInt(1000, 9999)}_${this.getRandomInt(
          1000,
          9999,
        )}_${this.getRandomInt(1000, 9999)}`;
        break;
      case 'file':
        generatedIRdi += `/file/${this.getRandomInt(1000, 9999)}_${this.getRandomInt(1000, 9999)}_${this.getRandomInt(
          1000,
          9999,
        )}_${this.getRandomInt(1000, 9999)}`;
        break;
      case 'asset':
        generatedIRdi += `/asset/${this.getRandomInt(1000, 9999)}_${this.getRandomInt(1000, 9999)}_${this.getRandomInt(
          1000,
          9999,
        )}_${this.getRandomInt(1000, 9999)}`;
        break;
      case 'other':
        generatedIRdi += `/other/${this.getRandomInt(1000, 9999)}_${this.getRandomInt(1000, 9999)}_${this.getRandomInt(
          1000,
          9999,
        )}_${this.getRandomInt(1000, 9999)}`;
        break;
      default:
        generatedIRdi += `/${type}/${this.getRandomInt(1000, 9999)}_${this.getRandomInt(
          1000,
          9999,
        )}_${this.getRandomInt(1000, 9999)}_${this.getRandomInt(1000, 9999)}`;
    }
    return generatedIRdi;
  }

  static getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
