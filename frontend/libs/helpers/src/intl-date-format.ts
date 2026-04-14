function resolveLocale(locale: string | null | undefined): string {
  const normalized = locale?.toLowerCase() ?? 'de';

  if (normalized.startsWith('de')) {
    return 'de-DE';
  }

  if (normalized.startsWith('en')) {
    return 'en-GB';
  }

  return locale ?? 'de-DE';
}

function parseGermanDateTime(value: string): Date | null {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) {
    return null;
  }

  const [, day, month, year, hours = '00', minutes = '00', seconds = '00'] = match;
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

function parseTimeLike(value: string): Date | null {
  const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:?\d{2})?$/);
  if (!match) {
    return null;
  }

  const [, hours, minutes, seconds = '00', milliseconds = '0', timezone = ''] = match;

  if (timezone !== '') {
    const normalizedTimezone = timezone === 'Z' ? 'Z' : `${timezone.slice(0, 3)}:${timezone.slice(-2)}`;
    const parsed = new Date(
      `1970-01-01T${hours}:${minutes}:${seconds}.${milliseconds.padEnd(3, '0')}${normalizedTimezone}`,
    );

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(
    1970,
    0,
    1,
    Number(hours),
    Number(minutes),
    Number(seconds),
    Number(milliseconds.padEnd(3, '0')),
  );

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseDateLike(value: string | Date | null | undefined): Date | null {
  if (value == null) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const germanDate = parseGermanDateTime(value);
  if (germanDate != null) {
    return germanDate;
  }

  const timeValue = parseTimeLike(value);
  if (timeValue != null) {
    return timeValue;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateLike(
  value: string | Date | null | undefined,
  locale: string | null | undefined,
  format: string,
): string | null {
  const parsed = parseDateLike(value);
  if (parsed == null) {
    return null;
  }

  const formatterLocale = resolveLocale(locale);

  switch (format) {
    case 'L':
    case 'SHORT_DATE':
      return new Intl.DateTimeFormat(formatterLocale, { dateStyle: 'short' }).format(parsed);
    case 'LTS':
      return new Intl.DateTimeFormat(formatterLocale, { timeStyle: 'medium' }).format(parsed);
    case 'L LTS':
    case 'SHORT_DATE_TIME':
      return new Intl.DateTimeFormat(formatterLocale, {
        dateStyle: 'short',
        timeStyle: 'medium',
      }).format(parsed);
    default:
      return new Intl.DateTimeFormat(formatterLocale, {
        dateStyle: 'short',
        timeStyle: 'medium',
      }).format(parsed);
  }
}
