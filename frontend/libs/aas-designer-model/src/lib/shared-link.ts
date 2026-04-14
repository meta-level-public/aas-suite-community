export class SharedLink {
  id: number | null = null;
  ablaufdatum: Date | null = null;
  guid: string | null = null;
  passwort: string = '';
  paketId: number = 0;
  aasIdentifier: number = 0;
  generatedLink: string = '';
  count: number = 0;
  hasPasswort: boolean = false;
  paketName: string = '';

  static fromDto(dto: any) {
    const sharedLink = new SharedLink();
    Object.assign(sharedLink, dto);

    if (dto.ablaufdatum != null && dto.ablaufdatum !== '') sharedLink.ablaufdatum = new Date(dto.ablaufdatum);

    return sharedLink;
  }
}
