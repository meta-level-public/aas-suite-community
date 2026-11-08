import { describe, expect, it } from 'vitest';
import { parseBuildDate, VersionInfo } from './version-info';

describe('VersionInfo', () => {
  it('parses the build date as local date and time', () => {
    const date = VersionInfo.fromDto({ version: '1.2.3', date: '2026-11-08 14:05' }).date;

    expect(date).toEqual(new Date(2026, 10, 8, 14, 5));
  });

  it('accepts a date without time', () => {
    expect(parseBuildDate('2026-01-31')).toEqual(new Date(2026, 0, 31));
  });

  it('returns an invalid date for unparseable input', () => {
    expect(Number.isNaN(parseBuildDate('unknown').getTime())).toBe(true);
  });
});
