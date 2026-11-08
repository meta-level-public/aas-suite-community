import { FilenameHelper } from '@aas/helpers';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { ImageBlobViewerComponent } from './image-blob-viewer.component';
import { PlainTextBlobViewerComponent } from './plain-text-blob-viewer.component';

@Component({
  selector: 'aas-blob-content-viewer',
  imports: [PlainTextBlobViewerComponent, ImageBlobViewerComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './blob-content-viewer.component.html',
})
export class BlobContentViewerComponent {
  blobValue = input.required<Uint8Array>();
  contentType = input.required<string>();
  blobIdShort = input.required<string>();

  isImageContentType() {
    return FilenameHelper.isImageContentType(this.contentType());
  }
}
