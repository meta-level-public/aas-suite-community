import { Component, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { TableModule } from '@openng/optimus-ui/table';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { Image } from '@openng/optimus-ui/image';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-markings-viewer',
  templateUrl: './markings-viewer.component.html',
  imports: [TableModule, PrimeTemplate, Image, TranslateModule],
})
export class MarkingsViewerComponent {
  @Input() markings: any[] = [];
  @Input() fileMap: Map<string, SafeUrl> = new Map<string, SafeUrl>();

  getMarkingText(marking: any, type: string) {
    return marking.value?.find((sme: any) => sme.idShort === type)?.value ?? '';
  }
}
