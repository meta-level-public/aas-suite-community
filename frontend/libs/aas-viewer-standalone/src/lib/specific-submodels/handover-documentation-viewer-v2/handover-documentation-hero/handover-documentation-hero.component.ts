import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Tag } from '@openng/optimus-ui/tag';
import { HandoverDocumentationSummary } from '../handover-documentation.service';

/** Tags shown at most in the hero; the rest is summarised as "+n" */
const MAX_TAGS = 6;
/** Languages are few but helpful, so they keep up to this many slots next to the classes */
const MAX_LANGUAGE_TAGS = 3;

export interface HandoverHeroTag {
  kind: 'class' | 'language';
  label: string;
}

/** Hero of the handover documentation viewers: number of documents, document classes and languages */
@Component({
  selector: 'aas-handover-documentation-hero',
  templateUrl: './handover-documentation-hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, Tag],
})
export class HandoverDocumentationHeroComponent {
  readonly summary = input.required<HandoverDocumentationSummary>();

  private readonly allTags = computed<HandoverHeroTag[]>(() => [
    ...this.summary().classNames.map((label) => ({ kind: 'class' as const, label })),
    ...this.summary().languages.map((label) => ({ kind: 'language' as const, label })),
  ]);

  readonly visibleTags = computed<HandoverHeroTag[]>(() => {
    const { classNames, languages } = this.summary();
    const languageCount = Math.min(languages.length, MAX_LANGUAGE_TAGS);
    const classCount = Math.min(classNames.length, MAX_TAGS - languageCount);
    return [
      ...classNames.slice(0, classCount).map((label) => ({ kind: 'class' as const, label })),
      ...languages
        .slice(0, Math.min(languages.length, MAX_TAGS - classCount))
        .map((label) => ({ kind: 'language' as const, label })),
    ];
  });

  readonly hiddenTags = computed<HandoverHeroTag[]>(() => {
    const visible = this.visibleTags();
    return this.allTags().filter((tag) => !visible.some((v) => v.kind === tag.kind && v.label === tag.label));
  });

  readonly hiddenTagLabels = computed(() =>
    this.hiddenTags()
      .map((tag) => tag.label)
      .join(', '),
  );
}
