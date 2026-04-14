import { AasMetamodelVersion } from '@aas/model';

export class Snippet {
  id!: number;
  name: string = '';
  description: string = '';
  besitzer: string = '';
  besitzerId!: number;
  anlageBenutzer: string = '';
  aenderungsZaehler: string = '';
  aenderungsBenutzer = '';
  anlageDatum: Date | null = null;
  aenderungsDatum: Date | null = null;
  template: any;
  typ: string = '';
  freigabeLevel: 'PRIVATE' | 'ORGANISATION' = 'PRIVATE';
  version: AasMetamodelVersion = AasMetamodelVersion.UNKNOWN;

  static fromDto(dto: any) {
    const snipped = new Snippet();

    Object.assign(snipped, dto);

    snipped.anlageDatum = new Date(dto.anlageDatum);

    snipped.aenderungsDatum = new Date(dto.aenderungsDatum);

    if (Object.prototype.hasOwnProperty.call(dto, 'template')) {
      snipped.template = JSON.parse(dto.template);
    }

    if (snipped.description === 'undefined') {
      snipped.description = '';
    }

    return snipped;
  }
}
