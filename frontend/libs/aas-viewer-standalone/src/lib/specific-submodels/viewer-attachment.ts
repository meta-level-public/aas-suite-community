import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import { ViewerStoreService } from '../viewer-store.service';

/**
 * URL for a File element of the current submodel (e.g. a logo or product image): an external URL as it is, otherwise
 * the attachment loaded from the submodel repository (cached in the viewer store).
 *
 * @param idShortPath path of the File element, e.g. `GeneralInformation.ProductImages[0].ImageFile`
 * @param value the File element's value (path in the package or URL)
 */
export async function loadViewerAttachmentUrl(
  http: HttpClient,
  sanitizer: DomSanitizer,
  viewerStore: ViewerStoreService,
  idShortPath: string,
  value: string,
): Promise<SafeUrl | string | null> {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  // Without a path the request would go to ".../submodel-elements//attachment" and fail
  if (idShortPath.trim() === '') {
    return null;
  }

  const submodelId = viewerStore.currentSubmodelId();
  const cached = viewerStore
    .currentlyloadedFiles()
    .find((file) => file.submodelId === submodelId && file.idShortPath === idShortPath);
  if (cached?.blob != null) {
    return sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(cached.blob));
  }

  try {
    const url = `${viewerStore.currentSmUrl()}/submodel-elements/${encodeURIComponent(idShortPath)}/attachment`;
    const blob = await lastValueFrom(
      http.get<Blob>(url, { responseType: 'blob' as 'json', headers: viewerStore.headers() }),
    );
    viewerStore.addFileToCurrentlyLoadedFiles({ submodelId, idShortPath, path: value, blob });
    return sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
  } catch {
    return null;
  }
}
