import { describe, expect, it } from 'vitest';
import { endOfSelectedDay } from './shared-link-expiry';

describe('endOfSelectedDay', () => {
  it('verschiebt den gewählten Tag auf 23:59:59.999 lokaler Zeit', () => {
    const selected = new Date(2026, 10, 24, 0, 0, 0, 0);
    const result = endOfSelectedDay(selected);
    expect(result).toBeDefined();
    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(10);
    expect(result?.getDate()).toBe(24);
    expect(result?.getHours()).toBe(23);
    expect(result?.getMinutes()).toBe(59);
    expect(result?.getSeconds()).toBe(59);
    expect(result?.getMilliseconds()).toBe(999);
  });

  it('verändert das übergebene Datum nicht', () => {
    const selected = new Date(2026, 10, 24);
    endOfSelectedDay(selected);
    expect(selected.getHours()).toBe(0);
  });

  it('lässt ein fehlendes Datum leer', () => {
    expect(endOfSelectedDay(null)).toBeUndefined();
    expect(endOfSelectedDay(undefined)).toBeUndefined();
  });
});
