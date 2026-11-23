import { Component, input, output } from '@angular/core';

import { SlotId } from '../loading-model';
import { SlotState } from '../truck-demo.service';

/** Draufsicht auf das Ladetablett: 2 Spalten × 3 Reihen, Fahrerhaus oben. */
@Component({
  selector: 'app-truck-bed',
  templateUrl: './truck-bed.component.html',
  styleUrl: './truck-bed.component.scss',
})
export class TruckBedComponent {
  readonly slots = input.required<SlotState[]>();
  readonly selected = input<SlotId | null>(null);
  readonly large = input(false);
  readonly slotSelected = output<SlotId>();
}
