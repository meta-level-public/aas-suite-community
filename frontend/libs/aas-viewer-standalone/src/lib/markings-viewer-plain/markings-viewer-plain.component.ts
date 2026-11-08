import { SubmodelElementCollection } from '@aas-core-works/aas-core3.1-typescript/types';

import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SingleMarkingComponent } from './single-marking.component';

@Component({
  selector: 'aas-v3-markings-viewer-plain',
  templateUrl: './markings-viewer-plain.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SingleMarkingComponent, TranslateModule],
})
export class MarkingsViewerPlainComponent {
  markings = input<SubmodelElementCollection[]>([]);
  idShortPath = input<string>('');
  indexed = input<boolean>(false);
}
