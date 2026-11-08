import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'aas-submodel-hero-header',
  templateUrl: './submodel-hero-header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./submodel-hero-header.component.css'],
})
export class SubmodelHeroHeaderComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) iconClass = 'fa-solid fa-cube';
  @Input({ required: true }) semanticId = '-';
}
