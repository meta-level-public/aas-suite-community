import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { ElementInserter } from '../../../tools/element-inserter';
import { V3TreeService } from '../../../v3-tree/v3-tree.service';
import { EClassPropertyService } from '../eclass-property.service';

@Component({
  selector: 'aas-eclass-single-property-generator',
  templateUrl: './eclass-single-property-generator.component.html',
  imports: [Dialog, FormsModule, InputText, Button, TableModule, PrimeTemplate, Popover, TranslateModule],
})
export class EclassSinglePropertyGeneratorComponent implements OnInit, OnChanges {
  @Input() importFromEclassDialogVisible: boolean = false;
  @Output() importFromEclassDialogVisibleChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input({ required: true }) targetNodeId: string = '';
  eclassImported: boolean = false;
  loading: boolean = false;
  irdi: string = '';
  selectedIrdi: string = '';
  noPropertyFound: boolean = false;
  propertyCandidates: any[] = [];
  definition: string = '';

  constructor(
    private eclassPropertyService: EClassPropertyService,
    private v3TreeService: V3TreeService,
    private translate: TranslateService,
  ) {}

  ngOnChanges(): void {
    this.noPropertyFound = false;
  }

  async ngOnInit() {
    this.loading = true;
    try {
      this.eclassImported = await this.eclassPropertyService.hasEclassImported();
    } finally {
      this.loading = false;
    }
  }

  async findProperties() {
    this.propertyCandidates = [];

    this.propertyCandidates = await this.eclassPropertyService.findProperties(this.irdi);
  }

  async createProperty() {
    const createdProperties = await this.eclassPropertyService.addTechnicalPropertiesToCollection([this.selectedIrdi]);

    createdProperties.forEach((prop: any) => {
      const instanceOrErrorPlain = aas.jsonization.submodelElementFromJsonable(JSON.parse(prop));
      if (instanceOrErrorPlain.value != null)
        ElementInserter.insertSubmodelElementByTargetId(
          this.targetNodeId,
          this.v3TreeService,
          instanceOrErrorPlain.value,
        );
    });
    this.importFromEclassDialogVisibleChanged.emit(false);
  }

  getRowLabel(rowData: any) {
    const currentLanguage = this.translate.currentLang;
    const keys = Object.keys(rowData.preferredName);
    let searchKey = keys.find((k) => k.startsWith(currentLanguage));
    let foundLabel = '';
    if (searchKey != null) {
      foundLabel = rowData?.preferredName[searchKey];
    } else {
      searchKey = keys.find((k) => k.startsWith('en'));
      foundLabel = searchKey ? rowData?.preferredName[searchKey] : '';
    }
    if (foundLabel === '') {
      const firstKey = Object.keys(rowData?.preferredName)[0];
      foundLabel = rowData?.preferredName[firstKey] ?? '';
    }
    return foundLabel;
  }

  getRowDefinition(rowData: any) {
    const currentLanguage = this.translate.currentLang;
    const keys = Object.keys(rowData.definition);
    let searchKey = keys.find((k) => k.startsWith(currentLanguage));
    let foundLabel = '';
    if (searchKey != null) {
      foundLabel = rowData?.definition[searchKey];
    } else {
      searchKey = keys.find((k) => k.startsWith('en'));
      foundLabel = searchKey ? rowData?.definition[searchKey] : '';
    }
    if (foundLabel === '') {
      const firstKey = Object.keys(rowData?.definition)[0];
      foundLabel = rowData?.definition[firstKey] ?? '';
    }
    return foundLabel;
  }

  async showDefinition(rowData: any, op: Popover, event: any) {
    this.definition = this.getRowDefinition(rowData);
    op.toggle(event);
  }
}
