import { FilenameHelper } from '@aas/helpers';

export function isGeneratorFilePreviewable(file: File | null | undefined) {
  return FilenameHelper.isUploadPreviewableImageFile(file);
}

export async function buildGeneratorFilePreviewBlob(file: File) {
  return FilenameHelper.buildPreviewImageBlob(file);
}

export class GeneratorFilePreviewState {
  private previewUrls = new Map<string, string>();
  private previewFallbackKeys = new Set<string>();
  private previewRequestIds = new Map<string, number>();

  getPreviewUrl(key: string) {
    return this.previewUrls.get(key) ?? null;
  }

  hasPreviewFallback(key: string) {
    return this.previewFallbackKeys.has(key);
  }

  async syncPreview(key: string, file: File | null | undefined) {
    const requestId = (this.previewRequestIds.get(key) ?? 0) + 1;
    this.previewRequestIds.set(key, requestId);

    this.clearPreview(key);
    this.previewFallbackKeys.delete(key);

    if (file == null || !isGeneratorFilePreviewable(file)) {
      return;
    }

    const previewFile: File = file;

    try {
      const previewBlob = await buildGeneratorFilePreviewBlob(previewFile);
      if (this.previewRequestIds.get(key) !== requestId) {
        return;
      }

      this.previewUrls.set(key, URL.createObjectURL(previewBlob));
    } catch {
      if (this.previewRequestIds.get(key) !== requestId) {
        return;
      }

      this.previewFallbackKeys.add(key);
    }
  }

  clearPreview(key: string) {
    const previewUrl = this.previewUrls.get(key);

    if (previewUrl != null) {
      URL.revokeObjectURL(previewUrl);
      this.previewUrls.delete(key);
    }

    this.previewFallbackKeys.delete(key);
  }

  clearAll() {
    this.previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    this.previewUrls.clear();
    this.previewFallbackKeys.clear();
    this.previewRequestIds.clear();
  }
}
