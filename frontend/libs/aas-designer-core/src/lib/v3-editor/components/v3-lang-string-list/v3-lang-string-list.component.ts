import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MlpKeyValue } from '@aas/webapi-client';
import { LanguageIsoMap, LanguageService } from '@aas/aas-designer-shared';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
@Component({
  selector: 'aas-v3-lang-string-list',
  templateUrl: './v3-lang-string-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    MessageModule,
    SelectModule,
    TextareaModule,
    InputGroupModule,
    InputGroupAddonModule,
    V3UndoDirective,
  ],
})
export class V3LangStringListComponent implements OnChanges {
  @Input({ required: true }) langStrings: aas.types.LangStringTextType[] | MlpKeyValue[] | null | undefined;
  @Input() doValidation: boolean = true;
  @Input() mlpKeyValueMode: boolean = false;
  @Input({ required: true }) langStringParent: any;
  @Input({ required: true }) langStringParentPropertyName: string = '';
  @Input() removeBlockAllowed: boolean = true;

  isoLanguages: LanguageIsoMap[] = [];

  constructor(
    private languageService: LanguageService,
    private treeService: V3TreeService,
  ) {}

  ngOnChanges() {
    this.isoLanguages = this.languageService.getLanguageNamesAndIsoAlpha2();
  }

  addNewDisplayName() {
    if (this.langStrings == null && this.langStringParent != null) {
      if (this.mlpKeyValueMode) {
        const langStringArr: MlpKeyValue[] = [];
        this.langStringParent[this.langStringParentPropertyName] = langStringArr;
        this.langStrings = langStringArr;
      } else {
        const langStringArr: aas.types.LangStringTextType[] = [];
        this.langStringParent[this.langStringParentPropertyName] = langStringArr;
        this.langStrings = langStringArr;
      }
    }

    // hier muss der eigentliche Wert immer nach any gecastet werden, da entweder aas.types.LangStringTextType oder MlpKeyValue bearbeitet werden.
    if (this.mlpKeyValueMode) {
      if (this.langStrings?.find((l) => l.language === 'en') == null) {
        const mlpKeyValue = new MlpKeyValue();
        mlpKeyValue.language = 'en';
        mlpKeyValue.text = '';
        this.langStrings?.push(mlpKeyValue as any);
      } else if (this.langStrings?.find((l) => l.language === 'de') == null) {
        const mlpKeyValue = new MlpKeyValue();
        mlpKeyValue.language = 'de';
        mlpKeyValue.text = '';
        this.langStrings?.push(mlpKeyValue as any);
      } else {
        this.langStrings?.push(new MlpKeyValue() as any);
      }
    } else {
      if (this.langStrings?.find((l) => l.language === 'en') == null) {
        this.langStrings?.push(new aas.types.LangStringTextType('en', '') as any);
      } else if (this.langStrings?.find((l) => l.language === 'de') == null) {
        this.langStrings?.push(new aas.types.LangStringTextType('de', '') as any);
      } else {
        this.langStrings?.push(new aas.types.LangStringTextType('', '') as any);
      }
      this.treeService.registerFieldUndoStep();
    }
  }

  removeDisplayName(index: number) {
    if (this.langStrings) {
      if (!this.deleteAllowed && this.langStrings.length === 1) {
        this.langStrings[index].text = '';
      } else {
        this.langStrings.splice(index, 1);
        if (this.langStrings.length === 0) {
          this.removeLangStringBlock();
        } else {
          this.treeService.registerFieldUndoStep();
        }
      }
    }
  }

  removeLangStringBlock() {
    this.langStringParent[this.langStringParentPropertyName] = null;
    this.langStrings = null;

    this.treeService.registerFieldUndoStep();
  }

  setDisabledStatus() {
    setTimeout(() => {
      this.isoLanguages.forEach((l) => (l.disabled = false));
      this.langStrings?.forEach((d) => {
        const indx = this.isoLanguages.findIndex((i) => i.iso2Code === d.language);
        if (indx > -1) this.isoLanguages[indx].disabled = true;
      });
    });
  }

  getTextError(entry: any) {
    if (!this.doValidation) return [];
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return errors;
    // return errors.filter((e) => (e.path.segments[0] as any)?.name === 'text');
  }
  hasTextErrors(entry: any) {
    if (!this.doValidation) return false;
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return errors;
    // return errors.filter((e) => (e.path.segments[0] as any)?.name === 'text').length > 0;
  }

  getLangError(entry: any) {
    if (!this.doValidation) return [];
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return errors.filter((e) => (e.path.segments[0] as any)?.name === 'language');
  }

  hasLangErrors(entry: any) {
    if (!this.doValidation) return false;
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return errors.filter((e) => (e.path.segments[0] as any)?.name === 'language').length > 0;
  }

  get deleteAllowed() {
    switch (this.langStringParentPropertyName) {
      case 'definition':
      case 'preferredName':
        return this.langStrings != null && this.langStrings.length > 1;
      default:
        return true;
    }
  }
}
