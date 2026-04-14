import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { LookupEntry } from '@aas/model';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { lastValueFrom, Subscription } from 'rxjs';
import { DocumentClassification } from '../../generator/model/document-item';
import { LanguageIsoMap, LanguageService } from '@aas/aas-designer-shared';
import { V3TreeService } from '../../v3-editor/v3-tree/v3-tree.service';

@Component({
  selector: 'aas-handover-documentation-class-name-selection',
  templateUrl: './handover-documentation-class-name-selection.component.html',
  imports: [FormsModule, TranslateModule, SelectModule, ButtonModule, TextareaModule],
})
export class HandoverDocumentationClassNameSelectionComponent implements OnChanges {
  @Input({ required: true }) classificationSystem: string = '';
  @Input({ required: true }) classification: DocumentClassification | undefined;
  allIsoLanguages: LanguageIsoMap[] = [];
  isoLanguages: LanguageIsoMap[] = [];
  vdiClasses = signal<LookupEntry[]>([]);
  iecClasses = signal<LookupEntry[]>([]);
  selectedClass: LookupEntry | undefined;
  availableClasses = signal<LookupEntry[]>([]);

  http = inject(HttpClient);
  translate = inject(TranslateService);
  subscriptions: Subscription[] = [];
  classLabel = signal<string>('descriptionEn');

  constructor(
    private languageService: LanguageService,
    private treeService: V3TreeService,
  ) {
    this.allIsoLanguages = this.languageService.getLanguageNamesAndIsoAlpha2();
    this.isoLanguages = this.languageService.getLanguageNamesAndIsoAlpha2();

    this.subscriptions.push(
      this.translate.onLangChange.subscribe((event) => {
        this.classLabel.set(event.lang === 'de' ? 'descriptionDe' : 'descriptionEn');
        this.sortAndAssignClasses(this.availableClasses());
      }),
    );
    this.classLabel.set(this.translate.currentLang === 'de' ? 'descriptionDe' : 'descriptionEn');
    this.loadClasses();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['classificationSystem']) {
      this.setAvailableClasses();
    }
  }

  async loadClasses() {
    this.iecClasses.set(
      await lastValueFrom(this.http.get<LookupEntry[]>('assets/lookups/iec-documentation-classes.json')),
    );
    this.vdiClasses.set(
      await lastValueFrom(this.http.get<LookupEntry[]>('assets/lookups/vdi-documentation-classes.json')),
    );
    this.setAvailableClasses();
  }

  setAvailableClasses() {
    const classificationSystem = this.classification?.classificationSystem;
    if (classificationSystem === 'VDI2770 Blatt 1:2020') {
      this.availableClasses.set(this.vdiClasses());
    } else if (classificationSystem === 'IEC61355-1:2008') {
      this.availableClasses.set(this.iecClasses());
    } else {
      this.availableClasses.set([]);
    }
    this.sortAndAssignClasses(this.availableClasses());
  }

  sortAndAssignClasses(classes: LookupEntry[]) {
    classes = classes.sort((a: LookupEntry, b: LookupEntry) => {
      const labelA = (a as any)[this.classLabel()];
      const labelB = (b as any)[this.classLabel()];
      if (labelA < labelB) {
        return -1;
      }
      if (labelA > labelB) {
        return 1;
      }
      return 0;
    });
    this.availableClasses.set(classes ?? []);
  }

  addNewDisplayName() {
    if (this.classification != null) {
      if (!this.classification.className) {
        const langStringArr: aas.types.LangStringTextType[] = [];
        this.classification.className = langStringArr;
      }
      this.classification.className.push(new aas.types.LangStringTextType('', ''));
      this.treeService.registerFieldUndoStep();
    }
  }

  removeDisplayName(index: number) {
    if (this.classification?.className != null) {
      this.classification.className.splice(index, 1);
      this.treeService.registerFieldUndoStep();
    }
  }

  setDisabledStatus() {
    this.isoLanguages.forEach((l) => (l.disabled = false));
    this.classification?.className.forEach((d) => {
      const indx = this.isoLanguages.findIndex((i) => i.iso2Code === d.language);
      if (indx > -1) this.isoLanguages[indx].disabled = true;
    });
  }
  get isVdi() {
    return this.classification?.classificationSystem === 'VDI2770 Blatt 1:2020';
  }

  applyVdiClass() {
    if (this.selectedClass != null && this.classification != null) {
      this.classification.className = [];
      this.classification.className.push(new aas.types.LangStringTextType('de', this.selectedClass.descriptionDe));
      this.classification.className.push(new aas.types.LangStringTextType('en', this.selectedClass.descriptionEn));
      this.classification.classId = this.selectedClass.value;
    }
  }
}
