import { GeneratorFileUploadCardState } from './generator-file-upload-card/generator-file-upload-card.component';

export interface GeneratorUploadedFileState {
  filename?: string | null;
  contentType?: string | null;
}

export function getGeneratorStoredFileReference(value: unknown) {
  const normalizedValue = `${value ?? ''}`.trim();
  return normalizedValue !== '' ? normalizedValue : null;
}

export function getGeneratorFilenameFromReference(reference: unknown) {
  const normalizedReference = `${reference ?? ''}`.trim();
  if (normalizedReference === '') {
    return null;
  }

  const normalizedValue = normalizedReference.replace(/^file:/, '');
  const segments = normalizedValue.split('/').filter((segment) => segment !== '');
  return segments.at(-1) ?? normalizedValue;
}

export function getGeneratorDisplayedFileName(
  uploadedFile: GeneratorUploadedFileState | null | undefined,
  reference: unknown,
) {
  return uploadedFile?.filename ?? getGeneratorFilenameFromReference(reference);
}

export function getGeneratorDisplayedContentType(
  uploadedFile: GeneratorUploadedFileState | null | undefined,
  contentType: unknown,
) {
  const uploadedContentType = `${uploadedFile?.contentType ?? ''}`.trim();
  if (uploadedContentType !== '') {
    return uploadedContentType;
  }

  const normalizedContentType = `${contentType ?? ''}`.trim();
  return normalizedContentType !== '' ? normalizedContentType : null;
}

export function hasGeneratorFileSelection(
  uploadedFile: GeneratorUploadedFileState | null | undefined,
  storedFileReference: string | null,
) {
  return uploadedFile != null || storedFileReference != null;
}

export function buildGeneratorFileUploadCardState(config: {
  label: string;
  filename: string | null;
  contentType: string | null;
  fileReference: string | null;
  hasSelection: boolean;
  previewUrl: string | null;
  showPreviewFallback: boolean;
}): GeneratorFileUploadCardState {
  return {
    filename: config.filename,
    contentType: config.contentType,
    fileReference: config.fileReference,
    hasSelection: config.hasSelection,
    previewUrl: config.previewUrl,
    showPreviewFallback: config.showPreviewFallback,
    previewAlt: config.filename || config.label,
  };
}
