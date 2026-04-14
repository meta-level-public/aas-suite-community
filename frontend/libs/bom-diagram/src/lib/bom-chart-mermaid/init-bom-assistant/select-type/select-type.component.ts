import { SelectionCardComponent } from '@aas/common-components';
import { Component, effect, inject, model, output } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'aas-select-type',
  imports: [TranslateModule, SelectionCardComponent],
  templateUrl: './select-type.component.html',
  styleUrls: ['./select-type.component.css'],
})
export class SelectTypeComponent {
  translate = inject(TranslateService);
  archeType = model<'Full' | 'OneUp' | 'OneDown' | undefined>(undefined);
  readonly options: {
    value: 'Full' | 'OneDown' | 'OneUp';
    descriptionKey: string;
    icon: string;
    severity: 'info' | 'success' | 'danger';
  }[] = [
    {
      value: 'Full',
      descriptionKey: 'ARCHE_TYPE_FULL_EXPL',
      icon: 'pi-sitemap',
      severity: 'info',
    },
    {
      value: 'OneDown',
      descriptionKey: 'ARCHE_TYPE_ONE_DOWN_EXPL',
      icon: 'pi-arrow-down',
      severity: 'success',
    },
    {
      value: 'OneUp',
      descriptionKey: 'ARCHE_TYPE_ONE_UP_EXPL',
      icon: 'pi-arrow-up',
      severity: 'danger',
    },
  ];

  selectedType = output<'Full' | 'OneUp' | 'OneDown' | undefined>();

  archeTypeEffect = effect(() => {
    if (this.archeType() != null) {
      this.selectedType.emit(this.archeType());
    }
  });

  selectArcheType(value: 'Full' | 'OneDown' | 'OneUp') {
    this.archeType.set(value);
  }

  getDisplayName(value: 'Full' | 'OneDown' | 'OneUp') {
    switch (value) {
      case 'Full':
        return 'Full';
      case 'OneDown':
        return 'One Down';
      case 'OneUp':
        return 'One Up';
    }
  }

  getButtonLabel(value: 'Full' | 'OneDown' | 'OneUp') {
    return this.archeType() === value ? 'SELECTED' : 'CHOOSE';
  }

  getTitle(value: 'Full' | 'OneDown' | 'OneUp') {
    return `${this.translate.instant('ARCHE_TYPE')} ${this.getDisplayName(value)}`;
  }
}
