import { ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { SemanticIdHelper } from '@aas/helpers';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import { ViewerStoreService } from '../viewer-store.service';

@Component({
  selector: 'aas-single-marking',
  imports: [CommonModule],
  templateUrl: './single-marking.component.html',
})
export class SingleMarkingComponent {
  marking = input<any>(undefined);
  idShortPath = input<string>('');
  viewerStore = inject(ViewerStoreService);
  sanitizer = inject(DomSanitizer);
  http = inject(HttpClient);

  markingText = computed(() => {
    return this.marking().value?.find((sme: any) => sme.idShort === 'MarkingText')?.value ?? '';
  });

  markingFile = computed(async () => {
    const loadedFile = await this.viewerStore
      .currentlyloadedFiles()
      .find(
        (f) => f.submodelId === this.viewerStore.currentSubmodelId() && f.idShortPath === this.markingFileIdShortPath(),
      );
    if (loadedFile != null) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(loadedFile.blob));
    }
    const markingFilename = this.markingFilename();

    if (markingFilename != null) {
      if (markingFilename.startsWith('http')) {
        return markingFilename;
      } else {
        try {
          const url =
            (await this.viewerStore.currentSmUrl()) +
            `/submodel-elements/${encodeURIComponent(this.markingFileIdShortPath())}/attachment`;
          const res = await lastValueFrom(
            this.http.get<Blob>(url, {
              responseType: 'blob' as 'json',
              observe: 'response',
              headers: this.viewerStore.headers(),
            }),
          );

          if (res.body == null) return;

          this.viewerStore.addFileToCurrentlyLoadedFiles({
            submodelId: await this.viewerStore.currentSubmodelId(),
            idShortPath: this.markingFileIdShortPath(),
            path: markingFilename,
            blob: res.body,
          });

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

  markingFilename = computed(() => {
    let val = this.marking().value?.find((sme: any) => sme.idShort === 'MarkingFile');
    if (val == null) {
      val = this.marking().value.find((sme: ISubmodelElement) =>
        sme.semanticId?.keys.find((k) =>
          k.value.trim().startsWith('https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingFile'),
        ),
      );
    }

    return val?.value ?? '';
  });

  markingFileIdShortPath = computed(() => {
    let val = this.marking().value?.find(
      (sme: any) =>
        sme.idShort === 'MarkingFile' ||
        SemanticIdHelper.hasSemanticId(sme, '0173-1#01-AHD206#001') ||
        SemanticIdHelper.hasSemanticId(sme, '0112/2///61360_7#AAS006#001'),
    );
    if (val == null) {
      val = this.marking().value.find((sme: ISubmodelElement) =>
        sme.semanticId?.keys.find((k) =>
          k.value.trim().startsWith('https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingFile'),
        ),
      );
    }

    return this.idShortPath() + '.' + (val?.idShort ?? '');
  });

  markingFileContentType = computed(() => {
    let val = this.marking().value?.find((sme: any) => sme.idShort === 'MarkingFile');
    if (val == null) {
      val = this.marking().value.find((sme: ISubmodelElement) =>
        sme.semanticId?.keys.find((k) =>
          k.value.trim().startsWith('https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingFile'),
        ),
      );
    }

    return val.contentType ?? '';
  });

  markingAdditionalText = computed(() => {
    let val = this.marking().value?.find((sme: any) => sme.idShort === 'MarkingAdditionalText');
    if (val == null) {
      val = this.marking().value.find((sme: ISubmodelElement) =>
        sme.semanticId?.keys.find((k) =>
          k.value
            .trim()
            .startsWith('https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingAdditionalText'),
        ),
      );
    }

    return val?.value ?? '';
  });

  markingName = computed(() => {
    let val = this.marking().value?.find((sme: any) => sme.idShort === 'MarkingName');
    if (val == null) {
      val = this.marking().value.find((sme: ISubmodelElement) =>
        sme.semanticId?.keys.find((k) =>
          k.value.trim().startsWith('https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingName'),
        ),
      );
    }

    return val?.value ?? '';
  });
}
