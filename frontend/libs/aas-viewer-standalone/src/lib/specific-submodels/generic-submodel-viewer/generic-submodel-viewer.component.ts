import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Component, Input } from '@angular/core';
import { SubmodelElementsListComponent } from '../../submodel-elements-list/submodel-elements-list.component';

@Component({
  selector: 'aas-generic-submodel-viewer',
  templateUrl: './generic-submodel-viewer.component.html',
  styleUrls: ['./generic-submodel-viewer.component.css'],
  imports: [SubmodelElementsListComponent],
})
export class GenericSubmodelViewerComponent {
  @Input({ required: true }) submodel!: aas.types.Submodel;
  @Input() currentLanguage = 'de';
}
