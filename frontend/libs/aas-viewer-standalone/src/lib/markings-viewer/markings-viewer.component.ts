import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Component, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { Image } from 'primeng/image';
import { TableModule } from 'primeng/table';
type ISubmodelElement = aas.types.ISubmodelElement;

@Component({
  selector: 'aas-v3-markings-viewer',
  templateUrl: './markings-viewer.component.html',
  imports: [TableModule, PrimeTemplate, Image, TranslateModule],
})
export class MarkingsViewerComponent {
  @Input() markings: any[] = [];
  @Input() fileMap: Map<string, SafeUrl> = new Map<string, SafeUrl>();

  getMarkingText(marking: any, type: string) {
    return marking.value?.find((sme: any) => sme.idShort === type)?.value ?? '';
  }

  getMarkingFilename(marking: any) {
    let val = marking.value?.find((sme: any) => sme.idShort === 'MarkingFile');
    if (val == null) {
      val = marking.value.find((sme: ISubmodelElement) =>
        sme.semanticId?.keys.find((k: any) =>
          k.value.trim().startsWith('https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingFile'),
        ),
      );
    }

    return val?.value ?? '';
  }
  getMarkingAdditionalText(marking: any) {
    let val = marking.value?.find((sme: any) => sme.idShort === 'MarkingAdditionalText');
    if (val == null) {
      val = marking.value.find((sme: ISubmodelElement) =>
        sme.semanticId?.keys.find((k: any) =>
          k.value
            .trim()
            .startsWith('https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingAdditionalText'),
        ),
      );
    }

    return val?.value ?? '';
  }
}
