import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadTranslation } from './custom-translate-loader';

describe('loadTranslation', () => {
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => undefined));
  afterEach(() => vi.restoreAllMocks());

  it('loads the language chunk', async () => {
    const importer = vi.fn().mockResolvedValue({ default: { SAVE: 'Speichern' } });

    await expect(loadTranslation('DE', { de: importer })).resolves.toEqual({ SAVE: 'Speichern' });
  });

  it('retries once when loading the chunk fails', async () => {
    const importer = vi
      .fn()
      .mockRejectedValueOnce(new Error('Failed to fetch dynamically imported module'))
      .mockResolvedValue({ default: { SAVE: 'Save' } });

    await expect(loadTranslation('en', { en: importer })).resolves.toEqual({ SAVE: 'Save' });
    expect(importer).toHaveBeenCalledTimes(2);
  });

  it('falls back to empty translations so the app can still start', async () => {
    const importer = vi.fn().mockRejectedValue(new Error('chunk not found'));

    await expect(loadTranslation('en', { en: importer })).resolves.toEqual({});
    expect(console.error).toHaveBeenCalled();
  });

  it('returns empty translations for unknown languages', async () => {
    await expect(loadTranslation('fr', {})).resolves.toEqual({});
  });

  it('knows German and English by default', async () => {
    const de = (await loadTranslation('de')) as Record<string, string>;
    const en = (await loadTranslation('en-US')) as Record<string, string>;

    expect(de['SAVE']).toBeTruthy();
    expect(en['SAVE']).toBeTruthy();
  });
});
