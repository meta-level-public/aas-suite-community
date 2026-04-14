import { FilenameHelper } from './filename-helper';

describe('FilenameHelper', () => {
  it('recognizes tiff file extensions as images', () => {
    expect(FilenameHelper.isImage('preview.tiff')).toBe(true);
    expect(FilenameHelper.isImage('preview.tif')).toBe(true);
  });

  it('recognizes tiff mime types as previewable images', () => {
    expect(FilenameHelper.isImageContentType('image/tiff')).toBe(true);
    expect(FilenameHelper.isImageContentType('image/tif')).toBe(true);
    expect(FilenameHelper.isPreviewableContentType('image/tiff')).toBe(true);
    expect(FilenameHelper.isTiffImage('preview.tiff')).toBe(true);
    expect(FilenameHelper.isTiffImage(new File(['preview'], 'preview.tif', { type: 'image/tiff' }))).toBe(true);
  });

  it('detects heic uploads and derives the matching mime type centrally', () => {
    expect(FilenameHelper.isHeicImage('preview.heic')).toBe(true);
    expect(FilenameHelper.isHeicImage(new File(['preview'], 'preview.heif', { type: 'image/heif' }))).toBe(true);
    expect(FilenameHelper.isUploadPreviewableImageFile(new File(['preview'], 'preview.heic', { type: '' }))).toBe(true);
    expect(FilenameHelper.getImageContentType('preview.heic')).toBe('image/heic');
    expect(FilenameHelper.getImageContentType('preview.heif')).toBe('image/heif');
  });
});
