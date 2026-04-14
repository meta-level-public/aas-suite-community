import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

type SelectionCardSeverity = 'info' | 'success' | 'warn' | 'danger';

@Component({
  selector: 'aas-selection-card',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  host: {
    class: 'block w-full h-full',
  },
  templateUrl: './selection-card.component.html',
  styleUrl: './selection-card.component.scss',
})
export class SelectionCardComponent {
  title = input.required<string>();
  description = input.required<string>();
  icon = input.required<string>();
  severity = input<SelectionCardSeverity>('info');
  buttonLabel = input.required<string>();
  disabled = input(false);
  loading = input(false);
  choose = output<void>();

  topBorderColor = computed(() => {
    switch (this.severity()) {
      case 'success':
        return 'var(--aas-success-icon)';
      case 'warn':
        return 'var(--aas-warning-icon)';
      case 'danger':
        return 'var(--aas-danger-icon)';
      default:
        return 'var(--aas-info-icon)';
    }
  });

  iconSurface = computed(() => {
    switch (this.severity()) {
      case 'success':
        return 'var(--aas-success-surface)';
      case 'warn':
        return 'var(--aas-warning-surface)';
      case 'danger':
        return 'var(--aas-danger-surface)';
      default:
        return 'var(--aas-info-surface)';
    }
  });

  iconColor = computed(() => {
    switch (this.severity()) {
      case 'success':
        return 'var(--aas-success-text)';
      case 'warn':
        return 'var(--aas-warning-text)';
      case 'danger':
        return 'var(--aas-danger-text)';
      default:
        return 'var(--aas-info-text)';
    }
  });

  cardTint = computed(() => {
    switch (this.severity()) {
      case 'success':
        return 'color-mix(in srgb, var(--aas-success-surface) 55%, var(--p-content-background))';
      case 'warn':
        return 'color-mix(in srgb, var(--aas-warning-surface) 55%, var(--p-content-background))';
      case 'danger':
        return 'color-mix(in srgb, var(--aas-danger-surface) 45%, var(--p-content-background))';
      default:
        return 'color-mix(in srgb, var(--aas-info-surface) 55%, var(--p-content-background))';
    }
  });
}
