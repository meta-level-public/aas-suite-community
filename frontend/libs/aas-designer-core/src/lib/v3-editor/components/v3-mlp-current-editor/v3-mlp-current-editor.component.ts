import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Subscription } from 'rxjs';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { LanguageService } from '@aas/aas-designer-shared';
type MultiLanguageProperty = aas.types.MultiLanguageProperty;

@Component({
  selector: 'aas-v3-mlp-current-editor',
  templateUrl: './v3-mlp-current-editor.component.html',
  imports: [
    InputGroup,
    FormsModule,
    InputText,
    NullIfEmptyDirective,
    InputGroupAddon,
    Message,
    Button,
    TranslateModule,
  ],
})
export class V3MlpCurrentEditorComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) items: aas.types.LangStringTextType[] | undefined | null;
  @Input({ required: true }) itemsParent: MultiLanguageProperty | undefined | null;
  item: aas.types.LangStringTextType | undefined | null;
  langSubscription: Subscription | undefined;

  constructor(
    public langService: LanguageService,
    private translate: TranslateService,
  ) {
    this.langSubscription = translate.onLangChange.subscribe(() => this.ngOnChanges());
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }

  ngOnChanges(): void {
    this.item = this.items?.find((item) => item.language === this.langService.userLanguage);
  }

  addCurrentLang() {
    if (this.items == null && this.itemsParent != null) {
      this.itemsParent.value = [];
      this.items = this.itemsParent.value;
    }
    const newItem = new aas.types.LangStringTextType(this.langService.userLanguage, '');
    this.items?.push(newItem);
    this.item = newItem;
  }
}
