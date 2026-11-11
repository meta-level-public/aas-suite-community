import { toLocalIsoString } from './create-instance.component';

describe('toLocalIsoString', () => {
  it('keeps the local calendar date and time and adds the time zone offset', () => {
    const date = new Date(2027, 0, 1, 0, 30, 5);

    const result = toLocalIsoString(date);

    expect(result).toMatch(/^2027-01-01T00:30:05[+-]\d{2}:\d{2}$/);
  });

  it('describes the same point in time as the original date', () => {
    const date = new Date(2026, 10, 9, 13, 26, 18);

    expect(new Date(toLocalIsoString(date)).getTime()).toBe(date.getTime());
  });
});
