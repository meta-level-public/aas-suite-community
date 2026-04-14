import { UrlHelper } from '@aas/helpers';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'aas-single-marking-file-view',
  imports: [CommonModule],
  templateUrl: './single-marking-file-view.component.html',
})
export class SingleMarkingFileViewComponent {
  repositoryUrl = input<string>('');
  idShortPath = input<string>('');
  submodelIdentifier = input<string>('');

  http = inject(HttpClient);

  markingFilename = input<any>(undefined);
  markingFileContentType = input<any>(undefined);
  sanitizer = inject(DomSanitizer);

  markingFile = computed(async () => {
    const markingFilename = this.markingFilename();
    const repositoryUrl = this.repositoryUrl();

    if (markingFilename != null) {
      if (markingFilename.startsWith('http')) {
        return markingFilename;
      } else {
        try {
          const url =
            UrlHelper.appendSlash(repositoryUrl) +
            'submodel-elements/' +
            encodeURIComponent(this.idShortPath()) +
            '/attachment';
          const res = await lastValueFrom(
            this.http.get<Blob>(url, {
              responseType: 'blob' as 'json',
              observe: 'response',
            }),
          );
          let blob: Blob | null = null;
          if (res.body == null) return;

          if (markingFilename.endsWith('.svg')) {
            const string = await res.body.text();
            const sanitizedSvg = this.sanitizeSvg(string);
            blob = new Blob([sanitizedSvg], { type: 'image/svg+xml' });
          } else {
            blob = res.body;
          }

          return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  sanitizeSvg(svgContent: string): string {
    // Entfernt den XML-Prolog, falls vorhanden
    return svgContent.replace(/<\?xml.*?\?>\s*/g, '');
  }
}
