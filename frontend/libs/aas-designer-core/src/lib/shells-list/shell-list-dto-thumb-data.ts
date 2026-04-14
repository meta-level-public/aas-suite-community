import { SafeResourceUrl } from '@angular/platform-browser';

export class ShellListDtoThumbData {
  thumbLoaded: boolean = false;
  fileUrl: SafeResourceUrl | undefined;
  thumbLoading = false;
  thumbError = false;
  requested = false;
  fallbackAttempted = false;
  fileData: Blob | undefined;
  shellListDtoId: string = '';
}
