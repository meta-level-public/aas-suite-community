import { describe, expect, it, vi } from 'vitest';

import { appendGeneratorFilesToFormData } from './generator-file-export.builder';

describe('generator-file-export.builder', () => {
  it('appends markings, documents and thumbnails for non-battery-passport exports', () => {
    const formData = new FormData();
    const appendAdditionalFiles = vi.fn((target: FormData) => {
      target.append(
        'addedfiles_/aasx/files/dpp-extra.pdf',
        new File(['dpp'], 'dpp-extra.pdf', { type: 'application/pdf' }),
      );
    });

    appendGeneratorFilesToFormData(
      formData,
      {
        nameplateMarkingFiles: [new File(['marking'], 'marking.svg', { type: 'image/svg+xml' })],
        documentFiles: [new File(['document'], 'Manual Draft.pdf', { type: 'application/pdf' })],
        packageThumbnailFile: new File(['package-thumb'], 'package-thumb.png', { type: 'image/png' }),
        packageThumbnailFilename: 'package-thumb.png',
        assetThumbnailFile: new File(['asset-thumb'], 'asset-thumb.png', { type: 'image/png' }),
        assetThumbnailFilename: 'asset-thumb.png',
      },
      {
        isBatteryPassport: false,
        appendAdditionalFiles,
      },
    );

    expect(formData.has('addedfiles_/aasx/files/marking.svg')).toBe(true);
    expect(formData.has('addedfiles_/aasx/files/Manual_Draft.pdf')).toBe(true);
    expect(formData.has('addedfiles_/aasx/files/package-thumb.png')).toBe(true);
    expect(formData.has('addedfiles_/aasx/files/asset-thumb.png')).toBe(true);
    expect(formData.get('thumbnailFilename')).toBe('package-thumb.png');
    expect(appendAdditionalFiles).toHaveBeenCalledOnce();
  });

  it('skips marking uploads for battery-passport exports', () => {
    const formData = new FormData();

    appendGeneratorFilesToFormData(
      formData,
      {
        nameplateMarkingFiles: [new File(['marking'], 'marking.svg', { type: 'image/svg+xml' })],
      },
      {
        isBatteryPassport: true,
      },
    );

    expect(formData.has('addedfiles_/aasx/files/marking.svg')).toBe(false);
  });
});
