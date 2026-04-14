export class ProductFamily {
  id: number | undefined;
  name: string = '';
  besitzerId: number | undefined;
  aenderungsZaehler: string | undefined;
  aenderungsBenutzer: string | undefined;
  anlageDatum: Date | undefined;
  aenderungsDatum: Date | undefined;

  static fromDto(dto: any) {
    const productFamily = new ProductFamily();

    Object.assign(productFamily, dto);

    return productFamily;
  }
}
