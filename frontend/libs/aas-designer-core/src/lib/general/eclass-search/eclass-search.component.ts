import { EClassItem } from '@aas/model';
import { KeyValuePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeTemplate, SelectItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { PortalService } from '@aas/common-services';
import { EclassSearchService } from './eclass-search.service';

@Component({
  selector: 'aas-eclass-search',
  templateUrl: './eclass-search.component.html',
  styleUrls: ['../../../host.scss'],
  imports: [
    FormsModule,
    InputText,
    Button,
    Divider,
    Select,
    PrimeTemplate,
    MultiSelect,
    TableModule,
    Dialog,
    KeyValuePipe,
    TranslateModule,
  ],
})
export class EclassSearchComponent implements OnInit, OnChanges {
  searchResult: EClassItem[] = [];
  keyword: string = '';
  irdi: string = '';

  currentSearchType: 'irdi' | 'keyword' = 'keyword';

  @Output() selectedItem: EventEmitter<EClassItem> = new EventEmitter<EClassItem>();
  loading: boolean = false;
  katalogOptions: SelectItem[] = [];
  langOptions: SelectItem[] = [];
  @Input() katalog: string = 'classificationClasses';
  @Input() withoutValueLists: boolean = false;
  selectedKatalog: SelectItem | undefined;
  // detailsItem: EClassItem | null = null;
  detailsItem: any;
  showDetailsDialog: boolean = false;
  lang: string[] = [];
  hasEclass: boolean = false;

  first: number = 0;
  rows: number = 50;
  totalRecords: number = 0;

  constructor(
    private eclassSearchService: EclassSearchService,
    private portalService: PortalService,
  ) {
    this.katalogOptions.push({ label: 'CLASSIFICATIONS', value: 'classificationClasses' });
    this.katalogOptions.push({ label: 'PROPERTIES', value: 'properties' });
    this.katalogOptions.push({ label: 'VALUES', value: 'values' });
    this.katalogOptions.push({ label: 'UNITS', value: 'units' });
    this.katalogOptions.push({ label: 'VALUE_LISTS', value: 'valueLists' });
    this.katalogOptions.push({ label: 'ASPECTS', value: 'aspects' });
    this.katalogOptions.push({ label: 'APPLICATION_CLASSES', value: 'applicationClasses' });

    this.langOptions.push({ label: 'de', value: 'de-DE' });
    this.langOptions.push({ label: 'en', value: 'en-US' });

    this.lang.push(EClassItem.mapGuiLanguageToEclass(portalService.currentLanguage));
    this.lang.push(EClassItem.mapGuiLanguageToEclass('en'));

    this.lang = [...new Set(this.lang)];
  }

  async ngOnInit() {
    this.hasEclass = await this.eclassSearchService.hasEclass();
  }

  ngOnChanges() {
    this.selectedKatalog = this.katalogOptions.find((ko) => ko.value === this.katalog);
  }

  async search(type: 'irdi' | 'keyword') {
    this.currentSearchType = type;
    try {
      this.loading = true;
      this.first = 0;
      const response = await this.eclassSearchService.tableSearch(
        type === 'keyword' ? this.keyword : '',
        type === 'irdi' ? this.irdi : '',
        this.selectedKatalog?.value,
        this.lang,
        this.first,
        this.rows,
      );
      if (response != null) {
        if (this.currentSearchType === 'irdi') {
          this.searchResult = [EClassItem.fromDto(response, this.portalService.currentLanguage)];
          this.totalRecords = 1;
        } else {
          this.searchResult = response.data?.map((dto: any) =>
            EClassItem.fromDto(dto, this.portalService.currentLanguage),
          );
          this.totalRecords = response.totalResults;
        }
      } else {
        this.searchResult = [];
        this.totalRecords = 0;
      }
    } finally {
      this.loading = false;
    }
  }

  async nextPage(event: TableLazyLoadEvent) {
    if (this.keyword !== '' || this.irdi !== '') {
      try {
        this.loading = true;
        const offset = (event.first ?? 0) / (event.rows ?? 50);
        const response = await this.eclassSearchService.tableSearch(
          this.currentSearchType === 'keyword' ? this.keyword : '',
          this.currentSearchType === 'irdi' ? this.irdi : '',
          this.selectedKatalog?.value,
          this.lang,
          offset,
          this.rows,
        );
        if (response != null) {
          if (this.currentSearchType === 'irdi') {
            this.searchResult = [EClassItem.fromDto(response, this.portalService.currentLanguage)];
            this.totalRecords = 1;
          } else {
            this.searchResult = response.data?.map((dto: any) =>
              EClassItem.fromDto(dto, this.portalService.currentLanguage),
            );
            this.totalRecords = response.totalResults;
          }
        } else {
          this.searchResult = [];
          this.totalRecords = 0;
        }
      } finally {
        this.loading = false;
      }
    }
  }

  async loadItem(item: EClassItem) {
    try {
      this.loading = true;

      const res = await this.eclassSearchService.getItem(item.irdi, this.selectedKatalog?.value, this.lang);

      item.fullItem = res;
    } finally {
      this.loading = false;
    }
  }

  async selectItem(item: EClassItem) {
    await this.loadItem(item);
    this.loading = true;

    try {
      // noch die Einheit laden
      if (item.fullItem?.unit?.irdi) {
        try {
          const unit = await this.eclassSearchService.tableSearch(
            '',
            item.fullItem?.unit?.irdi,
            'units',
            ['en-US'],
            this.first,
            this.rows,
          );

          item.unit = unit.shortName['en-US'];
          item.unitId = unit.irdi;
        } catch (_error) {
          // können wir eben nicht laden
        }
      }

      if (item.fullItem.valueList != null && !this.withoutValueLists) {
        try {
          const valueList = await this.eclassSearchService.tableSearch(
            '',
            item.fullItem?.valueList?.irdi,
            'valueLists',
            ['en-US'],
            this.first,
            this.rows,
          );

          const valuesToAdd = [];
          if (valueList.values != null) {
            // Values laden
            for (const value of valueList.values) {
              try {
                const valueItem = await this.eclassSearchService.tableSearch(
                  '',
                  value.irdi,
                  'values',
                  ['en-US'],
                  this.first,
                  this.rows,
                );

                valuesToAdd.push({ value: valueItem.value, id: valueItem.irdi });
              } catch (_error) {
                // können wir eben nicht laden
              }
            }
          }

          item.valueList = valuesToAdd;
        } catch (_error) {
          // können wir eben nicht laden
        }
      }
    } finally {
      this.loading = false;
    }

    this.selectedItem.emit(item);
  }

  async showDetails(irdi: string) {
    this.detailsItem = await this.eclassSearchService.getItem(irdi, this.selectedKatalog?.value, this.lang);
    this.showDetailsDialog = true;
  }
}
