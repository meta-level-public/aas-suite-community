import { Organisation } from '@aas-designer-model';
import { Benutzer } from '@aas-designer-model';

export class Apikey {
  id: number | null = null;
  key: string = '';
  notice: string = '';
  active: boolean = false;
  validUntil: Date | null = null;
  scopes: string[] = [];

  organisation: Organisation | null = null;
  organisationId: number | null = null;

  benutzer: Benutzer | null = null;
  benutzerId: number | null = null;

  static fromDto(dto: any) {
    const token = new Apikey();
    Object.assign(token, dto);
    if (dto.validUntil != null) token.validUntil = new Date(dto.validUntil);
    if (dto.benutzer != null) token.benutzer = Benutzer.fromDto(dto.benutzer);
    if (dto.organisation != null) token.organisation = Organisation.fromDto(dto.organisation);

    return token;
  }
}
