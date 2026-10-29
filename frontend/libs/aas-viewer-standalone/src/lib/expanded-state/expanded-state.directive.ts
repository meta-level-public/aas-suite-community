import { computed, DestroyRef, Directive, effect, inject, input, untracked } from '@angular/core';
import { Accordion } from 'primeng/accordion';
import { ViewerStoreService } from '../viewer-store.service';

/**
 * Keeps the open panels of an accordion in the viewer store, so they stay open when the
 * submodel is reloaded or the viewer re-renders. Until the user toggles a panel, the
 * accordion's own [value] binding applies.
 */
@Directive({ selector: 'p-accordion[aasExpandedState]' })
export class ExpandedStateDirective {
  private accordion = inject(Accordion);
  private viewerStore = inject(ViewerStoreService);

  /** Path of the accordion within the submodel, unique per accordion */
  readonly aasExpandedState = input.required<string>();
  /** Defaults to the submodel currently shown in the viewer */
  readonly aasExpandedStateSubmodelId = input<string>();

  private submodelId = computed(() => this.aasExpandedStateSubmodelId() ?? this.viewerStore.currentSubmodelId());
  private storedValue = computed(() => this.viewerStore.expandedStateOf(this.submodelId(), this.aasExpandedState()));

  constructor() {
    effect(() => {
      const value = this.storedValue();
      if (value === undefined || typeof value === 'boolean') return;
      untracked(() => this.accordion.value.set(value));
    });

    const subscription = this.accordion.value.subscribe((value) =>
      this.viewerStore.setExpandedState(this.submodelId(), this.aasExpandedState(), value ?? null),
    );
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  }
}
