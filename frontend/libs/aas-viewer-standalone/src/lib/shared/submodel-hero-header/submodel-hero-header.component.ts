import { Component, Input } from '@angular/core';

@Component({
  selector: 'aas-submodel-hero-header',
  templateUrl: './submodel-hero-header.component.html',
  styleUrls: ['./submodel-hero-header.component.css'],
})
export class SubmodelHeroHeaderComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) iconClass = 'fa-solid fa-cube';
  @Input({ required: true }) semanticId = '-';
}
