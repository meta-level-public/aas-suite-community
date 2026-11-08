export class VersionInfo {
  version: string = '';
  date: Date | undefined;
  branch: string = '';
  edition: string = 'Test';

  static fromDto(dto: any) {
    const versionInfo = new VersionInfo();
    Object.assign(versionInfo, dto);

    versionInfo.date = parseBuildDate(dto.date);

    return versionInfo;
  }
}

/** Parses the build date in the format `YYYY-MM-DD hh:mm` (local time), falling back to the Date parser. */
export function parseBuildDate(value: unknown): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?/.exec(String(value ?? ''));
  if (match == null) {
    return new Date(String(value));
  }
  const [, year, month, day, hour, minute] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour ?? 0), Number(minute ?? 0));
}
