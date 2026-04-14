import { SafeResourceUrl } from '@angular/platform-browser';

export interface SupplementalFile {
  path: string;
  filename: string;
  fileApiUrl: string;
  contentType: string;
  isThumbnail: boolean;

  file: File;
  isLoaded: boolean;
  isLoading: boolean;
  isLocal: boolean;
  fileResourceUrl?: string;
  fileUrl: SafeResourceUrl | null;
  fileData: Blob | null;
  id: number | null;
}
