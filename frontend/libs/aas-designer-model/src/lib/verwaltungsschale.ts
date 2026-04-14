export class Verwaltungsschale {
  id: number | undefined;
  manufacturerName: string = '';
  serialNumber: string = '';
  manufacturerProductDesignation: string = '';
  manufacturerProductFamily: string = '';
  yearOfConstruction: string = '';
  batchNumber: string = '';

  static fromDto(dto: any) {
    const vws = new Verwaltungsschale();

    Object.assign(vws, dto);

    return vws;
  }
}
