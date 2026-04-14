import moment from 'moment';

export class CorsConfig {
  id: number = 0;
  corsString: string = '';
  notice: string = '';
  anlageDatum: Date | undefined;
  aenderungsDatum: Date | undefined;

  static fromDto(dto: any) {
    const config = new CorsConfig();

    Object.assign(config, dto);
    config.aenderungsDatum = moment(dto.aenderungsDatum).toDate();
    config.anlageDatum = moment(dto.anlageDatum).toDate();

    return config;
  }
}
