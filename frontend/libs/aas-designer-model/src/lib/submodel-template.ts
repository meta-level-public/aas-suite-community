import { AasMetamodelVersion } from '@aas/model';
import { Organisation } from './organisation';

export class SubmodelTemplate {
  id: number | undefined;
  name: string = '';
  label: string = '';
  filename: string = '';
  semanticIds: string = '';
  version: AasMetamodelVersion = AasMetamodelVersion.V3;
  submodelVersion: string = '';
  group: string = '';
  url?: string = '';
  sourceAasIdShort: string = '';

  organisation: Organisation | null = null;
  organisationId: number | null = null;

  anlageDatum: Date | null = null;
  aenderungsDatum: Date | null = null;

  static fromDto(dto: any) {
    const submodelTemplate = new SubmodelTemplate();
    Object.assign(submodelTemplate, dto);

    if (dto.anlageDatum != null) submodelTemplate.anlageDatum = new Date(dto.anlageDatum);
    if (dto.aenderungsDatum != null) submodelTemplate.aenderungsDatum = new Date(dto.aenderungsDatum);

    if (dto.organisation != null) submodelTemplate.organisation = Organisation.fromDto(dto.organisation);
    switch (dto.version) {
      case 'V2':
        submodelTemplate.version = AasMetamodelVersion.V2;
        break;
      case 'V3':
        submodelTemplate.version = AasMetamodelVersion.V3;
        break;
      default:
        submodelTemplate.version = AasMetamodelVersion.UNKNOWN;
        break;
    }

    return submodelTemplate;
  }
}
