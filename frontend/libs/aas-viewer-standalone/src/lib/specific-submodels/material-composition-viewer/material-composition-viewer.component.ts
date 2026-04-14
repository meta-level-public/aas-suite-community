import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SemanticIdHelper } from '@aas/helpers';
import { Component, Input, OnChanges, computed, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { ConceptDescriptionService } from '../../concept-description.service';
import { ViewerStoreService } from '../../viewer-store.service';

const SEMANTICS = {
  batteryChemistry: 'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryChemistry',
  shortName: 'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#shortName',
  clearName: 'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#clearName',
  batteryMaterials: 'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryMaterials',
  batteryMaterialLocation:
    'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryMaterialLocation',
  componentName: 'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#componentName',
  componentId: 'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#componentId',
  batteryMaterialIdentifier:
    'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryMaterialIdentifier',
  batteryMaterialName: 'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryMaterialName',
  batteryMaterialMass: 'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryMaterialMass',
  isCriticalRawMaterial: 'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#isCriticalRawMaterial',
  hazardousSubstances: 'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#hazardousSubstances',
  hazardousSubstanceClass:
    'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#hazardousSubstanceClass',
  hazardousSubstanceName: 'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#hazardousSubstanceName',
  hazardousSubstanceConcentration:
    'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#hazardousSubstanceConcentration',
  hazardousSubstanceImpact:
    'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#hazardousSubstanceImpact',
  impact: 'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#Impact',
  hazardousSubstanceLocation:
    'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#hazardousSubstanceLocation',
  hazardousSubstanceIdentifier:
    'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#hazardousSubstanceIdentifier',
} as const;

interface MaterialCompositionChemistry {
  shortName: string;
  clearName: string;
}

interface MaterialCompositionLocationEntry {
  locationName: string;
  locationId: string;
}

interface MaterialCompositionMaterial extends MaterialCompositionLocationEntry {
  materialName: string;
  materialIdentifier: string;
  mass: string;
  isCriticalRawMaterial: boolean;
}

interface MaterialCompositionHazardousSubstance extends MaterialCompositionLocationEntry {
  hazardousSubstanceClass: string;
  hazardousSubstanceName: string;
  hazardousSubstanceConcentration: string;
  hazardousSubstanceIdentifier: string;
  impacts: string[];
}

interface MaterialCompositionGroup<T extends MaterialCompositionLocationEntry> {
  locationName: string;
  locationId: string;
  items: T[];
}

interface MaterialCompositionViewModel {
  chemistry: MaterialCompositionChemistry;
  materials: MaterialCompositionMaterial[];
  groupedMaterials: MaterialCompositionGroup<MaterialCompositionMaterial>[];
  hazardousSubstances: MaterialCompositionHazardousSubstance[];
  groupedHazardousSubstances: MaterialCompositionGroup<MaterialCompositionHazardousSubstance>[];
}

interface MeasurementMetadata {
  unit: string;
  symbol: string;
}

const EMPTY_VIEW_MODEL: MaterialCompositionViewModel = {
  chemistry: {
    shortName: '',
    clearName: '',
  },
  materials: [],
  groupedMaterials: [],
  hazardousSubstances: [],
  groupedHazardousSubstances: [],
};

@Component({
  selector: 'aas-material-composition-viewer',
  standalone: true,
  templateUrl: './material-composition-viewer.component.html',
  styleUrls: ['./material-composition-viewer.component.css'],
  imports: [TranslateModule, InputGroup, InputGroupAddon, InputText],
})
export class MaterialCompositionViewerComponent implements OnChanges {
  @Input({ required: true }) submodel: aas.types.Submodel | undefined;
  @Input() currentLanguage = 'de';

  private readonly cdService = inject(ConceptDescriptionService);
  private readonly viewerStore = inject(ViewerStoreService);

  private readonly model = signal<MaterialCompositionViewModel>(EMPTY_VIEW_MODEL);
  readonly massUnit = signal('');
  readonly massSymbol = signal('');
  readonly concentrationUnit = signal('');
  readonly concentrationSymbol = signal('');

  readonly chemistry = computed(() => this.model().chemistry);
  readonly materials = computed(() => this.model().materials);
  readonly groupedMaterials = computed(() => this.model().groupedMaterials);
  readonly hazardousSubstances = computed(() => this.model().hazardousSubstances);
  readonly groupedHazardousSubstances = computed(() => this.model().groupedHazardousSubstances);
  readonly criticalRawMaterialCount = computed(
    () => this.materials().filter((item) => item.isCriticalRawMaterial).length,
  );
  readonly hasContent = computed(() => {
    const current = this.model();
    return (
      current.chemistry.shortName.trim() !== '' ||
      current.chemistry.clearName.trim() !== '' ||
      current.materials.length > 0 ||
      current.hazardousSubstances.length > 0
    );
  });

  async ngOnChanges(): Promise<void> {
    this.model.set(this.buildViewModel());
    await this.loadMeasurementMetadata();
  }

  formatMass(value: string): string {
    const formatted = this.formatNumericValue(value);
    return this.withMeasurementMetadata(formatted === '' ? value : formatted, this.massUnit(), this.massSymbol());
  }

  formatConcentration(value: string): string {
    const formatted = this.formatNumericValue(value);
    return this.withMeasurementMetadata(
      formatted === '' ? value : formatted,
      this.concentrationUnit(),
      this.concentrationSymbol(),
      '%',
    );
  }

  componentGroupTitle(locationName: string): string {
    return locationName.trim() || 'Component';
  }

  componentGroupMeta(locationId: string, entryCount: number): string {
    const normalizedLocationId = locationId.trim();
    const countLabel = `${entryCount}`;

    if (normalizedLocationId !== '') {
      return `${normalizedLocationId} · ${countLabel}`;
    }

    return countLabel;
  }

  private buildViewModel(): MaterialCompositionViewModel {
    const root = this.submodel?.submodelElements ?? [];
    const materials = this.extractMaterials(root);
    const hazardousSubstances = this.extractHazardousSubstances(root);

    return {
      chemistry: this.extractChemistry(root),
      materials,
      groupedMaterials: this.groupByLocation(materials),
      hazardousSubstances,
      groupedHazardousSubstances: this.groupByLocation(hazardousSubstances),
    };
  }

  private extractChemistry(source: aas.types.ISubmodelElement[]): MaterialCompositionChemistry {
    const chemistry = this.findElement(source, [SEMANTICS.batteryChemistry], ['BatteryChemistry']);
    const chemistryChildren = this.childrenOf(chemistry);

    return {
      shortName: this.readText(this.findElement(chemistryChildren, [SEMANTICS.shortName], ['ShortName'])).trim(),
      clearName: this.readText(this.findElement(chemistryChildren, [SEMANTICS.clearName], ['ClearName'])).trim(),
    };
  }

  private extractMaterials(source: aas.types.ISubmodelElement[]): MaterialCompositionMaterial[] {
    const materials = this.findElement(source, [SEMANTICS.batteryMaterials], ['BatteryMaterials']);

    if (!(materials instanceof aas.types.SubmodelElementList)) {
      return [];
    }

    return (materials.value ?? [])
      .filter(
        (entry): entry is aas.types.SubmodelElementCollection => entry instanceof aas.types.SubmodelElementCollection,
      )
      .map((entry) => {
        const children = this.childrenOf(entry);
        const location = this.findElement(children, [SEMANTICS.batteryMaterialLocation], ['BatteryMaterialLocation']);
        const locationChildren = this.childrenOf(location);

        return {
          locationName: this.readText(
            this.findElement(locationChildren, [SEMANTICS.componentName], ['ComponentName']),
          ).trim(),
          locationId: this.readText(
            this.findElement(locationChildren, [SEMANTICS.componentId], ['ComponentId']),
          ).trim(),
          materialName: this.readText(
            this.findElement(children, [SEMANTICS.batteryMaterialName], ['BatteryMaterialName']),
          ).trim(),
          materialIdentifier: this.readText(
            this.findElement(children, [SEMANTICS.batteryMaterialIdentifier], ['BatteryMaterialIdentifier']),
          ).trim(),
          mass: this.readText(
            this.findElement(children, [SEMANTICS.batteryMaterialMass], ['BatteryMaterialMass']),
          ).trim(),
          isCriticalRawMaterial: this.readBoolean(
            this.findElement(children, [SEMANTICS.isCriticalRawMaterial], ['IsCriticalRawMaterial']),
          ),
        };
      })
      .filter(
        (entry) =>
          entry.locationName !== '' ||
          entry.locationId !== '' ||
          entry.materialName !== '' ||
          entry.materialIdentifier !== '' ||
          entry.mass !== '' ||
          entry.isCriticalRawMaterial,
      );
  }

  private extractHazardousSubstances(source: aas.types.ISubmodelElement[]): MaterialCompositionHazardousSubstance[] {
    const hazardousSubstances = this.findElement(source, [SEMANTICS.hazardousSubstances], ['HazardousSubstances']);

    if (!(hazardousSubstances instanceof aas.types.SubmodelElementList)) {
      return [];
    }

    return (hazardousSubstances.value ?? [])
      .filter(
        (entry): entry is aas.types.SubmodelElementCollection => entry instanceof aas.types.SubmodelElementCollection,
      )
      .map((entry) => {
        const children = this.childrenOf(entry);
        const location = this.findElement(
          children,
          [SEMANTICS.hazardousSubstanceLocation],
          ['HazardousSubstanceLocation'],
        );
        const locationChildren = this.childrenOf(location);

        return {
          locationName: this.readText(
            this.findElement(locationChildren, [SEMANTICS.componentName], ['ComponentName']),
          ).trim(),
          locationId: this.readText(
            this.findElement(locationChildren, [SEMANTICS.componentId], ['ComponentId']),
          ).trim(),
          hazardousSubstanceClass: this.readText(
            this.findElement(children, [SEMANTICS.hazardousSubstanceClass], ['HazardousSubstanceClass']),
          ).trim(),
          hazardousSubstanceName: this.readText(
            this.findElement(children, [SEMANTICS.hazardousSubstanceName], ['HazardousSubstanceName']),
          ).trim(),
          hazardousSubstanceConcentration: this.readText(
            this.findElement(
              children,
              [SEMANTICS.hazardousSubstanceConcentration],
              ['HazardousSubstanceConcentration'],
            ),
          ).trim(),
          hazardousSubstanceIdentifier: this.readText(
            this.findElement(children, [SEMANTICS.hazardousSubstanceIdentifier], ['HazardousSubstanceIdentifier']),
          ).trim(),
          impacts: this.extractImpacts(
            this.findElement(children, [SEMANTICS.hazardousSubstanceImpact], ['HazardousSubstanceImpact']),
          ),
        };
      })
      .filter(
        (entry) =>
          entry.locationName !== '' ||
          entry.locationId !== '' ||
          entry.hazardousSubstanceClass !== '' ||
          entry.hazardousSubstanceName !== '' ||
          entry.hazardousSubstanceConcentration !== '' ||
          entry.hazardousSubstanceIdentifier !== '' ||
          entry.impacts.length > 0,
      );
  }

  private extractImpacts(element: aas.types.ISubmodelElement | undefined): string[] {
    return this.childrenOf(element)
      .map((entry) => {
        const nestedImpact = this.findElement(this.childrenOf(entry), [SEMANTICS.impact], ['Impact']);
        return this.readText(nestedImpact ?? entry).trim();
      })
      .filter((entry) => entry !== '');
  }

  private groupByLocation<T extends MaterialCompositionLocationEntry>(entries: T[]): MaterialCompositionGroup<T>[] {
    const groups = new Map<string, MaterialCompositionGroup<T>>();

    entries.forEach((entry) => {
      const key = `${entry.locationName}__${entry.locationId}`.trim();
      const existing = groups.get(key);

      if (existing) {
        existing.items.push(entry);
        return;
      }

      groups.set(key, {
        locationName: entry.locationName,
        locationId: entry.locationId,
        items: [entry],
      });
    });

    return Array.from(groups.values());
  }

  private readBoolean(element: aas.types.ISubmodelElement | undefined): boolean {
    const normalizedValue = this.readText(element).trim().toLowerCase();
    return normalizedValue === 'true' || normalizedValue === '1';
  }

  private async loadMeasurementMetadata(): Promise<void> {
    const root = this.submodel?.submodelElements ?? [];
    const massElement = this.findFirstDescendant(root, [SEMANTICS.batteryMaterialMass], ['BatteryMaterialMass']);
    const concentrationElement = this.findFirstDescendant(
      root,
      [SEMANTICS.hazardousSubstanceConcentration],
      ['HazardousSubstanceConcentration'],
    );

    const [massMetadata, concentrationMetadata] = await Promise.all([
      this.resolveMeasurementMetadata(massElement),
      this.resolveMeasurementMetadata(concentrationElement),
    ]);

    this.massUnit.set(massMetadata.unit);
    this.massSymbol.set(massMetadata.symbol);
    this.concentrationUnit.set(concentrationMetadata.unit);
    this.concentrationSymbol.set(concentrationMetadata.symbol);
  }

  private async resolveMeasurementMetadata(
    element: aas.types.ISubmodelElement | undefined,
  ): Promise<MeasurementMetadata> {
    const embeddedMetadata = this.readMeasurementMetadataFromEmbeddedDataSpecifications(element);
    if (embeddedMetadata.unit !== '' || embeddedMetadata.symbol !== '') {
      return embeddedMetadata;
    }

    const semanticId = element?.semanticId?.keys?.[0]?.value?.trim() ?? '';
    if (semanticId === '') {
      return {
        unit: '',
        symbol: '',
      };
    }

    const conceptDescription = await this.cdService.loadCD(
      semanticId,
      this.viewerStore.cdUrl(),
      this.viewerStore.apiKey() ?? '',
    );

    return this.readMeasurementMetadataFromEmbeddedDataSpecifications(conceptDescription);
  }

  private readMeasurementMetadataFromEmbeddedDataSpecifications(
    source: { embeddedDataSpecifications?: unknown[] | null } | undefined,
  ): MeasurementMetadata {
    const embeddedDataSpecifications = source?.embeddedDataSpecifications ?? [];

    for (const dataSpecification of embeddedDataSpecifications) {
      const content = (dataSpecification as { dataSpecificationContent?: { unit?: string; symbol?: string } })
        .dataSpecificationContent;
      const unit = content?.unit?.trim() ?? '';
      const symbol = content?.symbol?.trim() ?? '';

      if (unit !== '' || symbol !== '') {
        return {
          unit,
          symbol,
        };
      }
    }

    return {
      unit: '',
      symbol: '',
    };
  }

  private findFirstDescendant(
    source: aas.types.ISubmodelElement[],
    semanticIds: string[],
    idShorts: string[],
  ): aas.types.ISubmodelElement | undefined {
    for (const element of source) {
      if (this.matchesElement(element, semanticIds, idShorts)) {
        return element;
      }

      const nestedMatch = this.findFirstDescendant(this.childrenOf(element), semanticIds, idShorts);
      if (nestedMatch) {
        return nestedMatch;
      }
    }

    return undefined;
  }

  private matchesElement(element: aas.types.ISubmodelElement, semanticIds: string[], idShorts: string[]): boolean {
    const normalizedIdShort = `${element.idShort ?? ''}`.toLowerCase();
    return (
      idShorts.some((idShort) => idShort.toLowerCase() === normalizedIdShort) ||
      semanticIds.some((semanticId) => SemanticIdHelper.hasSemanticId(element, semanticId))
    );
  }

  private withMeasurementMetadata(value: string, unit: string, symbol: string, fallbackUnit = ''): string {
    const normalizedValue = value.trim();
    if (normalizedValue === '') {
      return '';
    }

    const normalizedUnit = unit.trim() || symbol.trim() || fallbackUnit.trim();
    return normalizedUnit === '' ? normalizedValue : `${normalizedValue} ${normalizedUnit}`;
  }

  private formatNumericValue(value: string): string {
    const normalizedValue = value.trim();
    if (normalizedValue === '') {
      return '';
    }

    const parsedValue = Number(normalizedValue);
    if (Number.isNaN(parsedValue)) {
      return value;
    }

    return new Intl.NumberFormat(this.resolveLocale(), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(parsedValue);
  }

  private resolveLocale(): string {
    return this.currentLanguage.toLowerCase().startsWith('de') ? 'de-DE' : 'en-US';
  }

  private readText(element: aas.types.ISubmodelElement | undefined): string {
    if (element instanceof aas.types.Property) {
      return `${element.value ?? ''}`;
    }

    if (element instanceof aas.types.MultiLanguageProperty) {
      const values = element.value ?? [];
      const language = this.currentLanguage.toLowerCase();

      return (
        values.find((entry) => entry.language.toLowerCase() === language)?.text ??
        values.find((entry) => entry.language.toLowerCase() === 'en')?.text ??
        values[0]?.text ??
        ''
      );
    }

    return '';
  }

  private childrenOf(element: aas.types.ISubmodelElement | null | undefined): aas.types.ISubmodelElement[] {
    if (element instanceof aas.types.SubmodelElementCollection || element instanceof aas.types.SubmodelElementList) {
      return element.value ?? [];
    }

    return [];
  }

  private findElement(
    source: aas.types.ISubmodelElement[],
    semanticIds: string[],
    idShorts: string[],
  ): aas.types.ISubmodelElement | undefined {
    return source.find((element) => this.matchesElement(element, semanticIds, idShorts));
  }
}
