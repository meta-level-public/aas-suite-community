import moment from 'moment';

export class VersionInfo {
  version: string = '';
  date: Date | undefined;
  branch: string = '';
  edition: string = 'Test';

  static fromDto(dto: any) {
    const versionInfo = new VersionInfo();
    Object.assign(versionInfo, dto);

    versionInfo.date = moment(dto.date, 'YYYY-MM-DD hh:mm').toDate();

    return versionInfo;
  }
}
