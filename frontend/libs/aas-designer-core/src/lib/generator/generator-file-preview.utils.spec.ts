import { afterEach, describe, expect, it, vi } from 'vitest';

import { GeneratorFilePreviewState } from './generator-file-preview.utils';

describe('GeneratorFilePreviewState', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stores a preview url after syncing a previewable file', async () => {
    const previewState = new GeneratorFilePreviewState();
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview-url');
    const file = new File(['preview'], 'logo.png', { type: 'image/png' });

    await previewState.syncPreview('logo', file);

    expect(createObjectUrlSpy).toHaveBeenCalledWith(file);
    expect(previewState.getPreviewUrl('logo')).toBe('blob:preview-url');
  });

  it('clears preview fallback state when a selection is removed', async () => {
    const previewState = new GeneratorFilePreviewState();
    const file = new File(['preview'], 'logo.png', { type: 'image/png' });

    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
      throw new Error('preview failed');
    });

    await previewState.syncPreview('logo', file);

    expect(previewState.hasPreviewFallback('logo')).toBe(true);

    previewState.clearPreview('logo');

    expect(previewState.hasPreviewFallback('logo')).toBe(false);
  });

  it('revokes an existing preview url when clearing a preview', () => {
    const previewState = new GeneratorFilePreviewState();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:logo-preview');
    const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    return previewState.syncPreview('logo', new File(['preview'], 'logo.png', { type: 'image/png' })).then(() => {
      previewState.clearPreview('logo');

      expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:logo-preview');
      expect(previewState.getPreviewUrl('logo')).toBeNull();
    });
  });
});
