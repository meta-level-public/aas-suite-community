import { SafePipe } from '@aas/common-pipes';
import { FilenameHelper } from '@aas/helpers';
import { Component, computed, effect, input, signal } from '@angular/core';

@Component({
  selector: 'aas-image-blob-viewer',
  imports: [SafePipe],
  templateUrl: './image-blob-viewer.component.html',
})
export class ImageBlobViewerComponent {
  blobValue = input.required<Uint8Array>();
  contentType = input.required<string>();
  previewUrl = signal('');

  constructor() {
    effect(() => {
      void this.updatePreviewUrl();
    });
  }

  blobContentUrl = computed(() => {
    return this.previewUrl();
  });

  private async updatePreviewUrl() {
    const blobValue = this.blobValue();
    const blob = new File([blobValue as BlobPart], 'blob-preview', {
      type: this.contentType() || 'application/octet-stream',
    });
    const previewBlob = await FilenameHelper.buildPreviewImageBlob(blob);
    this.previewUrl.set(URL.createObjectURL(previewBlob));
  }

  blobBase64Content = computed(() => {
    const blobValue = this.blobValue();

    const decoder = new TextDecoder('utf-8');
    const s = decoder.decode(blobValue);
    if (this.contentType() === 'image/svg' || this.contentType() === 'image/svg+xml') {
      return 'data:image/svg+xml;base64, ' + s;
    }

    return 'data:' + this.contentType() + ';base64, ' + s;
  });

  isBase64Image = computed(() => {
    const blobValue = this.blobValue();
    const regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
    const decoder = new TextDecoder('utf-8');
    const s = decoder.decode(blobValue);

    return regex.test(s);
  });
}
