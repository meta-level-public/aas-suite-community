import { FilenameHelper } from '@aas/helpers';

export interface GeneratorExportFileSource {
  nameplateMarkingFiles?: File[];
  documentFiles?: File[];
  packageThumbnailFile?: File | null;
  packageThumbnailFilename?: string | null;
  assetThumbnailFile?: File | null;
  assetThumbnailFilename?: string | null;
}

export interface GeneratorFileExportOptions {
  isBatteryPassport: boolean;
  appendAdditionalFiles?: (formData: FormData) => void;
}

export function appendGeneratorFilesToFormData(
  formData: FormData,
  source: GeneratorExportFileSource | null | undefined,
  options: GeneratorFileExportOptions,
) {
  if (!options.isBatteryPassport) {
    source?.nameplateMarkingFiles?.forEach((markingFile) => {
      if (markingFile != null) {
        formData.append(`addedfiles_/aasx/files/${markingFile.name}`, markingFile, markingFile.name);
      }
    });
  }

  source?.documentFiles?.forEach((documentFile) => {
    if (documentFile != null) {
      const sanitizedFilename = FilenameHelper.sanitizeFilename(documentFile.name);
      formData.append(`addedfiles_/aasx/files/${sanitizedFilename}`, documentFile, sanitizedFilename);
    }
  });

  if (
    source?.packageThumbnailFile != null &&
    source.packageThumbnailFilename != null &&
    source.packageThumbnailFilename !== ''
  ) {
    formData.append(
      `addedfiles_/aasx/files/${source.packageThumbnailFilename}`,
      source.packageThumbnailFile,
      source.packageThumbnailFilename,
    );
    formData.append('thumbnailFilename', source.packageThumbnailFilename);
  }

  if (
    source?.assetThumbnailFile != null &&
    source.assetThumbnailFilename != null &&
    source.assetThumbnailFilename !== ''
  ) {
    formData.append(
      `addedfiles_/aasx/files/${source.assetThumbnailFilename}`,
      source.assetThumbnailFile,
      source.assetThumbnailFilename,
    );
  }

  options.appendAdditionalFiles?.(formData);
}
