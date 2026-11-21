import { BenutzerEinstellungen } from './benutzer-einstellungen';
import { ResultCode } from './result-code';

export class AuthenticateResponse {
  id: number = 0;
  orgaId: number = 0;
  vorname: string = '';
  name: string = '';
  loginName: string = '';
  profilbildBase64: string = '';
  jwtToken: string = '';
  refreshToken: string = '';

  aasServerUrl: string = '';
  rollen: string[] = [];
  resultCode: ResultCode = ResultCode.UNBEKANNT;
  additionalMessage: string = '';
  einstellungen: BenutzerEinstellungen | null = null;

  orgaSettings: OrgaSettings[] = [];
  preferredOrgaId: number | null = null;

  static fromDto(dto: any) {
    const resp = new AuthenticateResponse();
    Object.assign(resp, dto);

    return resp;
  }
}

export class OrgaSettings {
  iriPrefix: string = '';
  themeUrl: string = '';
  registryUrl: string = '';
  orgaId: number = 0;
  orgaName: string = '';
  orgaLogo: string = '';
}
