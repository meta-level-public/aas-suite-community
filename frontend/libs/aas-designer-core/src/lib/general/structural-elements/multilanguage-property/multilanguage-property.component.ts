import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { LanguageIsoMap, LanguageService } from '@aas/aas-designer-shared';
import { MultiLanguagePropertyValue } from '@aas/model';
import {
  ProductDesignationClient,
  ProductDesignationDto,
  ProductFamilyClient,
  ProductFamilyDto,
  ProductRootClient,
  ProductRootDto,
} from '@aas/webapi-client';
import { Component, inject, Input, OnChanges, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { InputText } from 'primeng/inputtext';
import { KeyFilter } from 'primeng/keyfilter';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { lastValueFrom } from 'rxjs';
import { AasSharedDataService } from '../../../asset-administration-shell-tree/services/aas-shared-data.service';
import { UndoDirective } from '../../directives/undo.directive';
import { HelpExplanationComponent } from '../../eclass-explanation/help-explanation.component';
import { SmeBase } from '../sme-base';

@Component({
  selector: 'aas-multilanguage-property',
  templateUrl: './multilanguage-property.component.html',
  imports: [
    HelpExplanationComponent,
    FormsModule,
    InputText,
    UndoDirective,
    KeyFilter,
    Select,
    Button,
    Divider,
    PrimeTemplate,
    Textarea,
    TranslateModule,
  ],
})
export class MultilanguagePropertyComponent extends SmeBase implements OnChanges, OnInit {
  @Input() propList: MultiLanguagePropertyValue[] | undefined;
  @Input() preferredLanguages: string[] = [];
  @Input() showFieldset: boolean = false;
  @Input() id: string = '';
  @Input() override editableNode: any = undefined;
  @Input() showIdShort: boolean = false;
  @Input() showMetadata: boolean = false;
  @Input() readonly: boolean = false;
  @Input() syncGermanToEnglishOnEdit: boolean = false;
  @Input() seedMissingPreferredLanguagesWithFallbackText: boolean = false;
  isoLanguages: MultiLanguagePropertyIsoMap[] = [];
  userLanguage: string = '';
  oldLanguageCodeValue: string = '';
  private englishWasEditedManually: boolean = false;
  private germanWasEditedManually: boolean = false;
  private sourceUsesAasLangStrings: boolean = false;
  private sourcePropList: Array<{ language?: string | null; text?: string | null }> | null | undefined;

  families: ProductFamilyDto[] = [];
  selectedFamily: ProductFamilyDto | undefined;

  roots: ProductRootDto[] = [];
  selectedRoot: ProductRootDto | undefined;

  designations: ProductDesignationDto[] = [];
  selectedDesignation: ProductDesignationDto | undefined;

  productFamilyClient = inject(ProductFamilyClient);
  productRootClient = inject(ProductRootClient);
  productDesignationClient = inject(ProductDesignationClient);

  constructor(
    private languageService: LanguageService,
    protected override aasSharedDataService: AasSharedDataService,
    private translate: TranslateService,
  ) {
    super(aasSharedDataService);
  }

  ngOnInit(): void {
    this.userLanguage = this.languageService.userLanguage;
    this.initFamilies();
    this.initRoots();
    this.initDesignations();
  }

  ngOnChanges(): void {
    this.isoLanguages = this.languageService.getLanguageNamesAndIsoAlpha2();
    const initialLanguages = this.getInitialLanguages();

    this.sourcePropList = this.propList;
    this.sourceUsesAasLangStrings = this.editableNode != null || this.isAasLangStringList(this.sourcePropList);
    this.propList = this.cloneLanguageValues(this.sourcePropList);

    if (this.propList == null) {
      this.propList = [];
    }
    if (initialLanguages.length > 0) {
      this.replacePropListValues(this.ensureLanguageEntries(this.propList, initialLanguages, ''));
    } else if (this.propList !== undefined && this.propList.length === 0) {
      this.propList.push({ language: '', text: '' });
    }

    this.englishWasEditedManually = this.hasDistinctLanguageValue('en', 'de');
    this.germanWasEditedManually = this.hasDistinctLanguageValue('de', 'en');
  }

  setDisabledStatus() {
    setTimeout(() => {
      this.isoLanguages.forEach((l) => (l.disabled = false));
      this.propList?.forEach((d) => {
        const indx = this.isoLanguages.findIndex((i) => i.iso2Code === d.language);
        if (indx > -1) this.isoLanguages[indx].disabled = true;
      });
    });
  }

  addLanguage() {
    if (this.propList == null) {
      this.propList = [];
    }
    this.propList.push({ language: '', text: '' });
    this.syncSourcePropList();
    this.registerUndoStep(this.translate.instant('ADD_LANGUAGE'));
  }

  removeLanguage(el: MultiLanguagePropertyValue) {
    if (this.propList == null) {
      this.propList = [];
    }
    const indx = this.propList.indexOf(el);
    this.propList.splice(indx, 1);
    this.syncSourcePropList();
    this.registerUndoStep(this.translate.instant('DELETE_LANGUGAGE'));
  }

  syncWithTree() {
    this.aasSharedDataService.syncIdShortWithLabel.next({
      uuid: this.editableNode.mlGenUuid,
      idShort: this.editableNode.idShort,
    });
  }
  registerUndoStep(id: string) {
    if (this.aasSharedDataService.currentAas.value != null) {
      this.aasSharedDataService.undoEntries.next({
        aas: cloneDeep(this.aasSharedDataService.currentAas.value),
        selectedUuid: this.aasSharedDataService.currentEditableNode.value.mlGenUuid,
        ts: new Date(),
        id: id,
      });
    }
  }

  async initFamilies() {
    this.families = (await lastValueFrom(this.productFamilyClient.productFamily_GetAllProductFamilys())) ?? [];
  }

  get isProductFamily() {
    return this.editableNode?.idShort === 'ManufacturerProductFamily' || this.id === 'productFamily';
  }

  applyFamily() {
    if (this.propList != null) {
      this.replacePropListValues(
        this.mapSelectionToLanguageValues(
          this.selectedFamily?.mlpKeyValues,
          this.selectedFamily?.name,
          ['en', 'de'],
          true,
        ),
      );
    }
  }

  async initRoots() {
    this.roots = (await lastValueFrom(this.productRootClient.productRoot_GetAllProductRoots())) ?? [];
  }

  get isProductRoot() {
    return this.editableNode?.idShort === 'ManufacturerProductRoot' || this.id === 'productRoot';
  }

  applyRoot() {
    if (this.propList != null) {
      this.replacePropListValues(
        this.mapSelectionToLanguageValues(this.selectedRoot?.mlpKeyValues, this.selectedRoot?.name, ['en', 'de'], true),
      );
    }
  }

  async initDesignations() {
    this.designations =
      (await lastValueFrom(this.productDesignationClient.productDesignation_GetAllProductDesignations())) ?? [];
  }

  get isProductDesignation() {
    return (
      this.editableNode?.idShort === 'ManufacturerProductDesignation' ||
      this.id === 'productDesignation' ||
      this.id === 'bezeichnung'
    );
  }

  applyDesignation() {
    if (this.propList != null) {
      this.replacePropListValues(
        this.mapSelectionToLanguageValues(
          this.selectedDesignation?.mlpKeyValues,
          this.selectedDesignation?.name,
          ['en', 'de'],
          true,
        ),
      );
    }
  }

  onTextChange(prop: MultiLanguagePropertyValue, nextText?: string) {
    if (nextText !== undefined) {
      prop.text = nextText;
    }

    if (!this.syncGermanToEnglishOnEdit || this.propList == null) {
      this.syncSourcePropList();
      return;
    }

    if (prop.language === 'en') {
      const germanEntry = this.getOrCreateLanguageEntry('de');

      if (!this.germanWasEditedManually) {
        germanEntry.text = prop.text ?? '';
      }

      this.englishWasEditedManually = true;
      this.syncSourcePropList();

      return;
    }

    if (prop.language !== 'de') {
      return;
    }

    const englishEntry = this.getOrCreateLanguageEntry('en');

    if (!this.englishWasEditedManually) {
      englishEntry.text = prop.text ?? '';
    }

    this.germanWasEditedManually = true;
    this.syncSourcePropList();
  }

  onLanguageChange(prop: MultiLanguagePropertyValue, nextLanguage?: string) {
    if (nextLanguage !== undefined) {
      prop.language = nextLanguage;
    }

    this.syncSourcePropList();
  }

  private mapSelectionToLanguageValues(
    values: Array<{ language?: string | null; text?: string | null }> | null | undefined,
    fallbackText: string | null | undefined,
    languages?: string[],
    seedMissingLanguagesWithFallbackText: boolean = false,
  ) {
    const normalizedValues =
      values?.map((value) => this.createLanguageValue(value.language ?? '', value.text ?? '')) ?? [];
    const initialLanguages = languages ?? this.getInitialLanguages();

    return initialLanguages.length > 0
      ? this.ensureLanguageEntries(
          normalizedValues,
          initialLanguages,
          fallbackText ?? '',
          seedMissingLanguagesWithFallbackText,
        )
      : normalizedValues;
  }

  private ensureLanguageEntries(
    values: MultiLanguagePropertyValue[],
    languages: string[],
    fallbackText: string,
    seedMissingLanguagesWithFallbackText: boolean = false,
  ) {
    const normalizedLanguages = Array.from(new Set(languages.filter((language) => language.trim() !== '')));
    const otherValues = values.filter((value) => !normalizedLanguages.includes(value.language));

    return [
      ...normalizedLanguages.map((language) =>
        this.createLanguageValue(
          language,
          this.getLanguageTextOrFallback(
            values,
            language,
            normalizedLanguages,
            fallbackText,
            seedMissingLanguagesWithFallbackText,
          ),
        ),
      ),
      ...otherValues,
    ];
  }

  private getLanguageText(values: MultiLanguagePropertyValue[], language: string) {
    return values.find((value) => value.language === language)?.text;
  }

  private getLanguageTextOrFallback(
    values: MultiLanguagePropertyValue[],
    language: string,
    languages: string[],
    fallbackText: string,
    seedMissingLanguagesWithFallbackText: boolean,
  ) {
    const directText = this.getLanguageText(values, language);

    if (directText != null) {
      return directText;
    }

    if (!this.shouldCopyTextAcrossLanguages(seedMissingLanguagesWithFallbackText)) {
      return '';
    }

    for (const candidateLanguage of languages) {
      if (candidateLanguage === language) {
        continue;
      }

      const candidateText = this.getLanguageText(values, candidateLanguage);
      if (candidateText != null) {
        return candidateText;
      }
    }

    return fallbackText;
  }

  private getOrCreateLanguageEntry(language: string) {
    let value = this.propList?.find((entry) => entry.language === language);

    if (value == null) {
      value = this.createLanguageValue(language, '');
      this.insertLanguageEntry(value);
    }

    return value;
  }

  private insertLanguageEntry(value: MultiLanguagePropertyValue) {
    if (this.propList == null) {
      this.propList = [value];
      this.syncSourcePropList();
      return;
    }

    const languageOrder = this.getInitialLanguages();
    const targetIndex = languageOrder.indexOf(value.language);

    if (targetIndex === -1) {
      this.propList.push(value);
      this.syncSourcePropList();
      return;
    }

    const insertIndex = this.propList.findIndex((entry) => {
      const entryOrderIndex = languageOrder.indexOf(entry.language);
      return entryOrderIndex > targetIndex;
    });

    if (insertIndex === -1) {
      this.propList.push(value);
      this.syncSourcePropList();
      return;
    }

    this.propList.splice(insertIndex, 0, value);
    this.syncSourcePropList();
  }

  private hasDistinctLanguageValue(language: string, counterpartLanguage: string) {
    if (!this.syncGermanToEnglishOnEdit || this.propList == null) {
      return false;
    }

    const currentText = this.getLanguageText(this.propList, language);
    const counterpartText = this.getLanguageText(this.propList, counterpartLanguage);

    return currentText != null && currentText !== '' && currentText !== counterpartText;
  }

  private createLanguageValue(language: string, text: string) {
    const mlp = new MultiLanguagePropertyValue();
    mlp.language = language;
    mlp.text = text;

    return mlp;
  }

  getPropTrackKey(index: number, prop: MultiLanguagePropertyValue) {
    return `${prop?.language ?? ''}|${index}`;
  }

  private replacePropListValues(values: MultiLanguagePropertyValue[]) {
    if (this.propList == null) {
      this.propList = values;
      this.syncSourcePropList();
      return;
    }

    this.propList.splice(0, this.propList.length, ...values);
    this.syncSourcePropList();
  }

  private cloneLanguageValues(values: Array<{ language?: string | null; text?: string | null }> | null | undefined) {
    return (values ?? []).map((value) => this.createLanguageValue(value?.language ?? '', value?.text ?? ''));
  }

  private syncSourcePropList() {
    const currentValues = this.cloneLanguageValues(this.propList);

    if (this.editableNode != null) {
      this.editableNode.value = currentValues.map(
        (value) => new aas.types.LangStringTextType(value.language ?? '', value.text ?? ''),
      );
      this.sourcePropList = this.editableNode.value;
      return;
    }

    if (this.sourcePropList == null) {
      this.sourcePropList = currentValues;
      return;
    }

    const nextValues = this.sourceUsesAasLangStrings ? this.toAasLangStrings(currentValues) : currentValues;
    this.sourcePropList.splice(0, this.sourcePropList.length, ...nextValues);
  }

  private isAasLangStringList(values: Array<{ language?: string | null; text?: string | null }> | null | undefined) {
    return (values ?? []).some((value) => value instanceof aas.types.LangStringTextType);
  }

  private toAasLangStrings(values: MultiLanguagePropertyValue[]) {
    return values.map((value) => new aas.types.LangStringTextType(value.language ?? '', value.text ?? ''));
  }

  private shouldInitializeBilingualEntries() {
    return (
      this.syncGermanToEnglishOnEdit ||
      this.id === 'hersteller' ||
      this.isProductFamily ||
      this.isProductRoot ||
      this.isProductDesignation
    );
  }

  private shouldCopyTextAcrossLanguages(seedMissingLanguagesWithFallbackText: boolean) {
    return (
      seedMissingLanguagesWithFallbackText ||
      this.seedMissingPreferredLanguagesWithFallbackText ||
      this.shouldInitializeBilingualEntries()
    );
  }

  private getInitialLanguages() {
    if (this.preferredLanguages.length > 0) {
      return this.preferredLanguages;
    }

    if (this.shouldInitializeBilingualEntries()) {
      return ['en', 'de'];
    }

    return [];
  }
}

export type MultiLanguagePropertyIsoMap = LanguageIsoMap & { disabled?: boolean };
