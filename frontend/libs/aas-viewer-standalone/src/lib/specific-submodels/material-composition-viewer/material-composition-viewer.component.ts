import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SemanticIdHelper } from '@aas/helpers';
import { Component, Input, OnChanges, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Tag } from '@openng/optimus-ui/tag';
import { ConceptUnitService, EMPTY_VIEWER_FIELD, ViewerField, viewerFieldOf } from '../../concept-unit.service';
import { SemanticDescriptionPopupComponent } from '../../semantic-description-popup/semantic-description-popup.component';

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
  fields: Record<'shortName' | 'clearName', ViewerField>;
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
  fields: Record<'materialName' | 'materialIdentifier' | 'mass' | 'isCriticalRawMaterial', ViewerField>;
}

interface MaterialCompositionHazardousSubstance extends MaterialCompositionLocationEntry {
  hazardousSubstanceClass: string;
  hazardousSubstanceName: string;
  hazardousSubstanceConcentration: string;
  hazardousSubstanceIdentifier: string;
  impacts: string[];
  fields: Record<
    | 'hazardousSubstanceClass'
    | 'hazardousSubstanceName'
    | 'hazardousSubstanceConcentration'
    | 'hazardousSubstanceIdentifier',
    ViewerField
  >;
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

const EMPTY_VIEW_MODEL: MaterialCompositionViewModel = {
  chemistry: {
    shortName: '',
    clearName: '',
    fields: { shortName: EMPTY_VIEWER_FIELD, clearName: EMPTY_VIEWER_FIELD },
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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TranslateModule, InputGroup, InputGroupAddon, InputText, Tag, SemanticDescriptionPopupComponent],
})
export class MaterialCompositionViewerComponent implements OnChanges {
  @Input({ required: true }) submodel: aas.types.Submodel | undefined;
  @Input() currentLanguage = 'de';

  private readonly units = inject(ConceptUnitService);

  private readonly model = signal<MaterialCompositionViewModel>(EMPTY_VIEW_MODEL);

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

  ngOnChanges(): void {
    this.model.set(this.buildViewModel());
  }

  formatMass(material: MaterialCompositionMaterial): string {
    return this.formatNumericValue(material.mass);
  }

  formatConcentration(substance: MaterialCompositionHazardousSubstance): string {
    return this.formatNumericValue(substance.hazardousSubstanceConcentration);
  }

  /** Unit of a field (element unit, else concept description); reactive, as the unit may load later. */
  fieldUnit(field: ViewerField): string {
    return this.units.fieldUnit(field);
  }

  /** Concentrations without a unit at the element or its concept description are percentages. */
  concentrationUnit(substance: MaterialCompositionHazardousSubstance): string {
    return this.units.fieldUnit(substance.fields.hazardousSubstanceConcentration, '%');
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
    const shortName = this.findElement(chemistryChildren, [SEMANTICS.shortName], ['ShortName']);
    const clearName = this.findElement(chemistryChildren, [SEMANTICS.clearName], ['ClearName']);

    return {
      shortName: this.readText(shortName).trim(),
      clearName: this.readText(clearName).trim(),
      fields: { shortName: viewerFieldOf(shortName), clearName: viewerFieldOf(clearName) },
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
        const materialName = this.findElement(children, [SEMANTICS.batteryMaterialName], ['BatteryMaterialName']);
        const materialIdentifier = this.findElement(
          children,
          [SEMANTICS.batteryMaterialIdentifier],
          ['BatteryMaterialIdentifier'],
        );
        const mass = this.findElement(children, [SEMANTICS.batteryMaterialMass], ['BatteryMaterialMass']);
        const isCriticalRawMaterial = this.findElement(
          children,
          [SEMANTICS.isCriticalRawMaterial],
          ['IsCriticalRawMaterial'],
        );

        return {
          locationName: this.readText(
            this.findElement(locationChildren, [SEMANTICS.componentName], ['ComponentName']),
          ).trim(),
          locationId: this.readText(
            this.findElement(locationChildren, [SEMANTICS.componentId], ['ComponentId']),
          ).trim(),
          materialName: this.readText(materialName).trim(),
          materialIdentifier: this.readText(materialIdentifier).trim(),
          mass: this.readText(mass).trim(),
          isCriticalRawMaterial: this.readBoolean(isCriticalRawMaterial),
          fields: {
            materialName: viewerFieldOf(materialName),
            materialIdentifier: viewerFieldOf(materialIdentifier),
            mass: viewerFieldOf(mass),
            isCriticalRawMaterial: viewerFieldOf(isCriticalRawMaterial),
          },
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
        const substanceClass = this.findElement(
          children,
          [SEMANTICS.hazardousSubstanceClass],
          ['HazardousSubstanceClass'],
        );
        const substanceName = this.findElement(
          children,
          [SEMANTICS.hazardousSubstanceName],
          ['HazardousSubstanceName'],
        );
        const concentration = this.findElement(
          children,
          [SEMANTICS.hazardousSubstanceConcentration],
          ['HazardousSubstanceConcentration'],
        );
        const identifier = this.findElement(
          children,
          [SEMANTICS.hazardousSubstanceIdentifier],
          ['HazardousSubstanceIdentifier'],
        );

        return {
          locationName: this.readText(
            this.findElement(locationChildren, [SEMANTICS.componentName], ['ComponentName']),
          ).trim(),
          locationId: this.readText(
            this.findElement(locationChildren, [SEMANTICS.componentId], ['ComponentId']),
          ).trim(),
          hazardousSubstanceClass: this.readText(substanceClass).trim(),
          hazardousSubstanceName: this.readText(substanceName).trim(),
          hazardousSubstanceConcentration: this.readText(concentration).trim(),
          hazardousSubstanceIdentifier: this.readText(identifier).trim(),
          impacts: this.extractImpacts(
            this.findElement(children, [SEMANTICS.hazardousSubstanceImpact], ['HazardousSubstanceImpact']),
          ),
          fields: {
            hazardousSubstanceClass: viewerFieldOf(substanceClass),
            hazardousSubstanceName: viewerFieldOf(substanceName),
            hazardousSubstanceConcentration: viewerFieldOf(concentration),
            hazardousSubstanceIdentifier: viewerFieldOf(identifier),
          },
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

  private matchesElement(element: aas.types.ISubmodelElement, semanticIds: string[], idShorts: string[]): boolean {
    const normalizedIdShort = `${element.idShort ?? ''}`.toLowerCase();
    return (
      idShorts.some((idShort) => idShort.toLowerCase() === normalizedIdShort) ||
      semanticIds.some((semanticId) => SemanticIdHelper.hasSemanticId(element, semanticId))
    );
  }

  private formatNumericValue(value: string): string {
    const normalizedValue = value.trim();
    if (normalizedValue === '') {
      return '';
    }

    const parsedValue = Number(normalizedValue);
    if (Number.isNaN(parsedValue)) {
      return normalizedValue;
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
