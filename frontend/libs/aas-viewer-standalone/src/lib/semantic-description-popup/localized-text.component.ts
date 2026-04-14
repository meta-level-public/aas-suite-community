import { IAbstractLangString } from '@aas-core-works/aas-core3.1-typescript/types';

import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'aas-localized-text',
  imports: [],
  templateUrl: './localized-text.component.html',
})
export class LocalizedTextComponent {
  langStrings = input.required<IAbstractLangString[]>();
  currentLanguage = input.required<string>();

  localizedText = computed(() => {
    let currentEntry = this.langStrings()?.find((d) => d.language === this.currentLanguage());
    if (currentEntry == null) {
      currentEntry = this.langStrings()?.find((d) => d.language === 'en');
      if (currentEntry == null) {
        currentEntry = this.langStrings()?.[0];
      }
    }
    return currentEntry?.text ?? '';
  });
}
