function parseDateWithPattern(
  value: string,
  pattern: 'de-date-time' | 'de-date' | 'us-date-time' | 'us-date',
): Date | null {
  const matchers = {
    'de-date-time': /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/,
    'de-date': /^(\d{2})\.(\d{2})\.(\d{4})$/,
    'us-date-time': /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/,
    'us-date': /^(\d{2})\/(\d{2})\/(\d{4})$/,
  };

  const match = value.match(matchers[pattern]);
  if (!match) {
    return null;
  }

  const [, part1, part2, year, hours = '00', minutes = '00', seconds = '00'] = match;
  const day = pattern.startsWith('de') ? part1 : part2;
  const month = pattern.startsWith('de') ? part2 : part1;
  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds),
  );

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export class Convert {
  static toString(s: string | null): string {
    return s ?? '';
  }
  static toNumber(s: string | null): number {
    return s != null ? +s : 0;
  }
  static toNullableNumber(s: string | null): number | null {
    return s != null ? +s : null;
  }
  static toBoolean(s: string | null): boolean {
    return s === '1' ? true : false;
  }
  static toNullableBoolean(s: string | null): boolean | null {
    return s == null ? null : s === '1';
  }
  static toDate(s: string | null): Date {
    return s == null ? new Date() : (parseDateWithPattern(s, 'de-date-time') ?? new Date(NaN));
  }
  static toNullableDate(s: string | null): Date | null {
    return s == null ? null : parseDateWithPattern(s, 'de-date-time');
  }

  static toNullableDateWoTime(s: string | null): Date | null {
    return s == null ? null : parseDateWithPattern(s, 'de-date');
  }

  static toNullableXeriDate(s: string | null): Date | null {
    return s == null ? null : parseDateWithPattern(s, 'us-date-time');
  }

  static toNullableXeriDateWoTime(s: string | null): Date | null {
    return s == null ? null : parseDateWithPattern(s, 'us-date');
  }

  static fromBoolean(b: boolean | null): number | null {
    if (b == null) return null;
    return b ? 1 : 0;
  }
  static fromDate(d: Date | null): string | null {
    if (d == null || Number.isNaN(d.getTime())) {
      return null;
    }

    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
}
