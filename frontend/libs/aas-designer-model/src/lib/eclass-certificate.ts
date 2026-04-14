export class EclassCertificate {
  id: number | undefined;
  filename: string = '';
  validTo: string = '';
  validFrom: string = '';
  serialNumber: string = '';
  issuingCertificate: string = '';
  issuedBy: string = '';
  signature: string = '';
  besitzerId: number | undefined;
  anlageDatum: Date | undefined;
  aenderungsDatum: Date | undefined;
  aenderungsBenutzer: string = '';
  geloescht: boolean = false;
  aenderungsZaehler: number = 0;

  static fromDto(dto: any) {
    const cert = new EclassCertificate();

    Object.assign(cert, dto);

    return cert;
  }
}
