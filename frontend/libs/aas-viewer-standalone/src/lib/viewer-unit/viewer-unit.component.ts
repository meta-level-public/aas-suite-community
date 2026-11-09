import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ConceptUnitService } from '../concept-unit.service';

/** Unit behind a value or column header in the formatted viewers; empty if neither element nor concept description has one. */
@Component({
  selector: 'aas-viewer-unit',
  templateUrl: './viewer-unit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerUnitComponent {
  semanticId = input<string | null | undefined>('');
  /** Unit stored at the element; wins over the concept description. */
  unit = input<string | null | undefined>('');
  /** Column headers show the unit in brackets. */
  brackets = input(false);

  private readonly units = inject(ConceptUnitService);
  text = computed(() => this.units.unit(this.semanticId(), this.unit() ?? ''));
}
