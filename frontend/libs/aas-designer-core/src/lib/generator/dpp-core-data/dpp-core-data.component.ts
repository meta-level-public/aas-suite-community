import { SemanticIdHelper } from '@aas/helpers';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DppPcfEntry, DppPcfEntryType } from 'battery-passport-assistant';
import { Button } from 'primeng/button';
import { PcfEntryAssistantComponent } from '../../general/pcf-entry-assistant/pcf-entry-assistant.component';
import { GeneratorPageShellComponent } from '../generator-page-shell/generator-page-shell.component';
import { GeneratorService } from '../generator.service';

@Component({
  selector: 'aas-dpp-core-data',
  templateUrl: './dpp-core-data.component.html',
  styleUrl: './dpp-core-data.component.scss',
  host: {
    class: 'flex flex-col flex-1',
  },
  imports: [Button, TranslateModule, PcfEntryAssistantComponent, GeneratorPageShellComponent],
})
export class DppCoreDataComponent implements OnInit {
  editingType: DppPcfEntryType | null = null;
  editingIndex: number | null = null;
  editingEntry: DppPcfEntry | null = null;

  constructor(
    private router: Router,
    public generatorService: GeneratorService,
  ) {}

  ngOnInit(): void {
    if (
      this.generatorService.getCurrentGeneratorRootShell() == null ||
      (this.generatorService.vwsTyp !== 'dpp-core' && this.generatorService.vwsTyp !== 'battery-passport')
    ) {
      this.router.navigate(['generator', 'select-type']);
      return;
    }

    if (this.isBatteryPassportPcfMode && !this.hasBatteryCarbonFootprintSubmodel()) {
      this.router.navigate(['generator', 'technical-data']);
    }
  }

  get isBatteryPassportPcfMode() {
    return this.generatorService.vwsTyp === 'battery-passport';
  }

  get productEntries() {
    return this.generatorService.dppPcfEntries.productCarbonFootprints;
  }

  get sectorEntries() {
    return this.generatorService.dppPcfEntries.productOrSectorSpecificCarbonFootprints;
  }

  get carbonFootprintSemanticId() {
    const submodel = this.generatorService.additionalV3Submodels.find((candidate) =>
      this.isCarbonFootprintSubmodel(candidate),
    );
    return `${submodel?.semanticId?.keys?.[0]?.value ?? ''}`.trim();
  }

  startAdd(type: DppPcfEntryType) {
    this.editingType = type;
    this.editingIndex = null;
    this.editingEntry = {
      id: `${type}-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      type,
      values: {},
    };
  }

  editEntry(type: DppPcfEntryType, index: number) {
    const source = this.getEntries(type)[index];
    if (source == null) {
      return;
    }

    this.editingType = type;
    this.editingIndex = index;
    this.editingEntry = {
      id: source.id,
      type: source.type,
      values: structuredClone(source.values),
    };
  }

  deleteEntry(type: DppPcfEntryType, index: number) {
    this.getEntries(type).splice(index, 1);
  }

  prevStep() {
    this.generatorService.navigateToPreviousGeneratorFlowStep(
      this.router,
      this.isBatteryPassportPcfMode ? 'battery-carbon-footprint' : 'dpp-core',
      ['generator', this.isBatteryPassportPcfMode ? 'technical-data' : 'document'],
    );
  }

  nextStep() {
    this.generatorService.navigateToNextGeneratorFlowStep(
      this.router,
      this.isBatteryPassportPcfMode ? 'battery-carbon-footprint' : 'dpp-core',
      ['generator', 'confirmation'],
    );
  }

  cancelEdit() {
    this.editingType = null;
    this.editingIndex = null;
    this.editingEntry = null;
  }

  saveEntry(entryOverride?: DppPcfEntry) {
    const sourceEntry = entryOverride ?? this.editingEntry;
    if (sourceEntry == null || this.editingType == null) {
      return;
    }

    const target = this.getEntries(this.editingType);
    const entry = {
      id: sourceEntry.id,
      type: sourceEntry.type,
      values: structuredClone(sourceEntry.values),
    };

    if (this.editingIndex == null) {
      target.push(entry);
    } else {
      target[this.editingIndex] = entry;
    }

    this.cancelEdit();
  }

  getEntryTitle(entry: DppPcfEntry, index: number) {
    if (entry.type === 'product-carbon-footprint') {
      const co2eq = entry.values['pcf-co2eq'];
      const publicationDate = entry.values['pcf-publication-date'];
      if (co2eq != null && `${co2eq}` !== '') {
        return `${index + 1}. ${co2eq} CO2eq`;
      }
      if (publicationDate != null && `${publicationDate}` !== '') {
        return `${index + 1}. ${publicationDate}`;
      }
    }

    const ruleName = entry.values['pcf-rule-name'];
    const ruleVersion = entry.values['pcf-rule-version'];
    if (ruleName != null && `${ruleName}` !== '') {
      return ruleVersion != null && `${ruleVersion}` !== ''
        ? `${index + 1}. ${ruleName} (${ruleVersion})`
        : `${index + 1}. ${ruleName}`;
    }

    return `${index + 1}. ${entry.type}`;
  }

  private getEntries(type: DppPcfEntryType) {
    return type === 'product-carbon-footprint' ? this.productEntries : this.sectorEntries;
  }

  get additionalBatteryDbpModels() {
    return this.generatorService.additionalV3Submodels.filter(
      (submodel) =>
        !this.isDigitalNameplateSubmodel(submodel) &&
        !this.isTechnicalDataSubmodel(submodel) &&
        !this.isCarbonFootprintSubmodel(submodel),
    );
  }

  private isDigitalNameplateSubmodel(submodel: any): boolean {
    return (
      SemanticIdHelper.hasSemanticId(
        submodel,
        'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/DigitalNameplate/1/0',
      ) || SemanticIdHelper.hasSemanticId(submodel, 'https://admin-shell.io/idta/digitalbatterypassport/nameplate/1/0')
    );
  }

  private isTechnicalDataSubmodel(submodel: any): boolean {
    return (
      SemanticIdHelper.hasSemanticId(
        submodel,
        'https://admin-shell.io/idta/digitalbatterypassport/TechnicalData/1/0',
      ) ||
      SemanticIdHelper.hasSemanticId(
        submodel,
        'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/TechnicalData/1/0',
      )
    );
  }

  private isCarbonFootprintSubmodel(submodel: any): boolean {
    if (
      SemanticIdHelper.hasSemanticId(submodel, 'https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0') ||
      SemanticIdHelper.hasSemanticId(submodel, 'https://admin-shell.io/idta/CarbonFootprint/1/0')
    ) {
      return true;
    }

    const values = [submodel.idShort ?? '', ...this.getSemanticValues(submodel)];
    return values.some((value) =>
      ['carbonfootprintfordbpaas', 'carbonfootprint', 'productcarbonfootprints'].some((needle) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }

  private getSemanticValues(submodel: any): string[] {
    return [submodel.semanticId, ...(submodel.supplementalSemanticIds ?? [])]
      .flatMap((reference: any) => reference?.keys ?? [])
      .map((key: any) => (key.value ?? '').toString());
  }

  private hasBatteryCarbonFootprintSubmodel() {
    return this.generatorService.additionalV3Submodels.some((submodel) => this.isCarbonFootprintSubmodel(submodel));
  }
}
