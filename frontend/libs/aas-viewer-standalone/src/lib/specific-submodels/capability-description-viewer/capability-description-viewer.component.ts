import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { HelpLabelComponent } from '@aas/common-components';
import { SemanticIdHelper } from '@aas/helpers';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  inject,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { PrimeTemplate } from 'primeng/api';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { GenericViewerComponent } from '../../generic-viewer/generic-viewer.component';
import { SubmodelHeroHeaderComponent } from '../../shared/submodel-hero-header/submodel-hero-header.component';
import { ViewerStoreService } from '../../viewer-store.service';

type CapabilityPropertySummary = {
  id: string;
  comment: string;
  mappings: {
    kind: 'direct' | 'reference';
    property: string;
    valuePath: string;
    resolvedElement: ISubmodelElement | null;
    resolvedSubmodelId: string;
    resolveHint: string;
    idShortPath: string;
  }[];
};

type CapabilityCard = {
  id: string;
  roleRequired: boolean;
  roleOffered: boolean;
  roleNotAssigned: boolean;
  comment: string;
  propertySets: CapabilityPropertySummary[];
  realizedByCount: number;
  composedOfCount: number;
  generalizedByCount: number;
  constraintCount: number;
};

type CapabilitySetGroup = {
  id: string;
  capabilities: CapabilityCard[];
  offeredCount: number;
  requiredCount: number;
  unassignedCount: number;
  totalPropertySetCount: number;
};

@Component({
  selector: 'aas-capability-description-viewer',
  templateUrl: './capability-description-viewer.component.html',
  styleUrls: ['./capability-description-viewer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputGroup,
    InputGroupAddon,
    InputText,
    Button,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    Tag,
    TableModule,
    PrimeTemplate,
    GenericViewerComponent,
    SubmodelHeroHeaderComponent,
    TranslateModule,
    HelpLabelComponent,
  ],
})
export class CapabilityDescriptionViewerComponent implements OnChanges, OnDestroy {
  viewerStore = inject(ViewerStoreService);
  private readonly cdr = inject(ChangeDetectorRef);
  private renderToken = 0;

  @Input({ required: true }) submodel: aas.types.Submodel | undefined;
  @Input() allSubmodels: aas.types.Submodel[] | null | undefined;
  @Input() capabilitySet: aas.types.SubmodelElementCollection | null | undefined;
  @Input() capabilityContainer: aas.types.SubmodelElementCollection | null | undefined;
  @Input({ required: true }) currentLanguage = 'de';
  @Input() showHeader = false;

  capabilities: CapabilityCard[] = [];
  capabilitySetGroups: CapabilitySetGroup[] = [];
  expandedSetPanelValues: number[] = [];
  offeredCount = 0;
  requiredCount = 0;
  unassignedCount = 0;
  totalPropertySetCount = 0;
  loading = false;

  get headerTitle(): string {
    return 'Capability Description';
  }

  get headerIconClass(): string {
    return 'fa-solid fa-bullseye';
  }

  get semanticIdDisplay(): string {
    const keys = this.submodel?.semanticId?.keys ?? [];
    const preferred =
      keys.find(
        (k) =>
          k.type === aas.types.KeyTypes.ConceptDescription ||
          k.type === aas.types.KeyTypes.GlobalReference ||
          k.type === aas.types.KeyTypes.Submodel,
      )?.value ?? '';
    const fallback = keys.find((k) => (k.value ?? '').trim() !== '')?.value ?? '';
    const value = preferred.trim() !== '' ? preferred : fallback;
    return value.trim() || '-';
  }

  ngOnChanges(): void {
    this.scheduleRebuild();
  }

  ngOnDestroy(): void {
    this.renderToken++;
  }

  private scheduleRebuild(): void {
    const token = ++this.renderToken;
    this.loading = true;
    this.capabilities = [];
    this.capabilitySetGroups = [];
    this.expandedSetPanelValues = [];
    this.offeredCount = 0;
    this.requiredCount = 0;
    this.unassignedCount = 0;
    this.totalPropertySetCount = 0;
    this.cdr.markForCheck();

    requestAnimationFrame(() => {
      // Prioritize visible UI switch, then process capability data.
      setTimeout(() => {
        void this.rebuildForToken(token);
      }, 0);
    });
  }

  private async rebuildForToken(token: number) {
    const allSubmodels = await this.getSubmodelsForResolution();
    if (token !== this.renderToken) return;

    const setGroups = this.resolveCapabilitySetGroups();
    const groupedCapabilities = await Promise.all(
      setGroups.map(async (group, setIdx) => {
        const capabilities = await Promise.all(
          group.containers.map((container, containerIdx) =>
            this.buildCapabilityCard(container, containerIdx, allSubmodels),
          ),
        );

        return {
          id: group.id || `CapabilitySet ${setIdx + 1}`,
          capabilities,
          offeredCount: capabilities.filter((c) => c.roleOffered).length,
          requiredCount: capabilities.filter((c) => c.roleRequired).length,
          unassignedCount: capabilities.filter((c) => c.roleNotAssigned).length,
          totalPropertySetCount: capabilities.reduce((acc, c) => acc + c.propertySets.length, 0),
        } as CapabilitySetGroup;
      }),
    );
    if (token !== this.renderToken) return;

    this.capabilitySetGroups = groupedCapabilities;
    this.expandedSetPanelValues = groupedCapabilities.map((_group, idx) => idx);
    this.capabilities = groupedCapabilities.flatMap((group) => group.capabilities);
    this.offeredCount = this.capabilities.filter((c) => c.roleOffered).length;
    this.requiredCount = this.capabilities.filter((c) => c.roleRequired).length;
    this.unassignedCount = this.capabilities.filter((c) => c.roleNotAssigned).length;
    this.totalPropertySetCount = this.capabilities.reduce((acc, c) => acc + c.propertySets.length, 0);
    this.loading = false;
    this.cdr.markForCheck();
  }

  private resolveCapabilitySetGroups(): { id: string; containers: aas.types.SubmodelElementCollection[] }[] {
    if (this.capabilityContainer != null) {
      return [
        {
          id: this.capabilitySet?.idShort?.trim() || 'CapabilitySet',
          containers: [this.capabilityContainer],
        },
      ];
    }

    if (this.capabilitySet != null) {
      return [
        {
          id: this.capabilitySet.idShort?.trim() || 'CapabilitySet',
          containers: this.collectCollections(
            this.capabilitySet.value ?? [],
            'CapabilityContainer',
            'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0',
          ),
        },
      ];
    }

    const capabilitySets = this.collectCollections(
      this.submodel?.submodelElements ?? [],
      'CapabilitySet',
      'https://admin-shell.io/idta/CapabilityDescription/CapabilitySet/1/0',
    );

    if (capabilitySets.length === 0) {
      return [];
    }

    return capabilitySets.map((set) => ({
      id: set.idShort?.trim() || 'CapabilitySet',
      containers: this.collectCollections(
        set.value ?? [],
        'CapabilityContainer',
        'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0',
      ),
    }));
  }

  private async getSubmodelsForResolution(): Promise<
    { idShort: string; id: string; url: string; sm: aas.types.Submodel }[]
  > {
    if (this.allSubmodels != null && this.allSubmodels.length > 0) {
      return this.allSubmodels.map((sm) => ({
        idShort: sm.idShort ?? '',
        id: sm.id,
        url: '',
        sm,
      }));
    }

    return this.viewerStore.submodels();
  }

  private async buildCapabilityCard(
    container: aas.types.SubmodelElementCollection,
    idx: number,
    allSubmodels: { idShort: string; id: string; url: string; sm: aas.types.Submodel }[],
  ): Promise<CapabilityCard> {
    const capabilityEl = this.findElement(
      container.value ?? [],
      'Capability',
      'https://admin-shell.io/idta/CapabilityDescription/Capability/1/0',
    );
    const capabilityComment = this.getText(
      this.findElement(
        container.value ?? [],
        'CapabilityComment',
        'https://admin-shell.io/idta/CapabilityDescription/CapabilityComment/1/0',
      ),
    );

    const propertySet = this.findCollection(
      container.value ?? [],
      'PropertySet',
      'https://admin-shell.io/idta/CapabilityDescription/PropertySet/1/0',
    );
    const propertyContainers = this.collectCollections(
      propertySet?.value ?? [],
      'PropertyContainer',
      'https://admin-shell.io/idta/CapabilityDescription/PropertyContainer/1/0',
    );

    const propertySets = await Promise.all(
      propertyContainers.map(async (pc, pIdx) => {
        const props = pc.value ?? [];
        const relationships = this.collectRelationshipElements(props);
        const directValueElements = this.collectPropertyValueElements(props);
        const relationshipMappings = await Promise.all(
          relationships.map((rel) => this.toPropertyMapping(rel, allSubmodels)),
        );
        const directMappings = directValueElements.map((el) => ({
          kind: 'direct' as const,
          property: el.idShort?.trim() || 'Property',
          valuePath: el.idShort?.trim() || '',
          resolvedElement: el,
          resolvedSubmodelId: this.submodel?.id ?? '',
          resolveHint: '',
          idShortPath: el.idShort?.trim() || '',
        }));
        return {
          id: pc.idShort?.trim() || `PropertyContainer ${pIdx + 1}`,
          comment: this.getText(
            this.findElement(
              props,
              'PropertyComment',
              'https://admin-shell.io/idta/CapabilityDescription/PropertyComment/1/0',
            ),
          ),
          mappings: [...directMappings, ...relationshipMappings],
        };
      }),
    );

    const relations = this.findCollection(
      container.value ?? [],
      'CapabilityRelations',
      'https://admin-shell.io/idta/CapabilityDescription/CapabilityRelations/1/0',
    );
    const relationElements = this.collectRelationshipElements(relations?.value ?? []);

    const constraints = this.findCollection(
      relations?.value ?? [],
      'ConstraintSet',
      'https://admin-shell.io/idta/CapabilityDescription/ConstraintSet/1/0',
    );
    const constraintCount = this.collectLeafConstraintElements(constraints?.value ?? []).length;

    const id = capabilityEl?.idShort?.trim() || container.idShort?.trim() || `Capability ${idx + 1}`;
    const qualifiers = (capabilityEl as any)?.qualifiers ?? [];
    const roleRequired = this.hasRole(qualifiers, 'required');
    const roleOffered = this.hasRole(qualifiers, 'offered');
    const roleNotAssigned = this.hasRole(qualifiers, 'notassigned');

    return {
      id,
      roleRequired,
      roleOffered,
      roleNotAssigned,
      comment: capabilityComment,
      propertySets,
      realizedByCount: relationElements.filter((r) => (r.idShort ?? '').toLowerCase().includes('realized')).length,
      composedOfCount: relationElements.filter((r) => (r.idShort ?? '').toLowerCase().includes('composed')).length,
      generalizedByCount: relationElements.filter((r) => (r.idShort ?? '').toLowerCase().includes('generalized'))
        .length,
      constraintCount,
    };
  }

  private hasRole(qualifiers: any[], role: string): boolean {
    const q = qualifiers.find((x) => (x.type ?? '').toLowerCase() === role);
    if (q == null) {
      return false;
    }
    const val = String(q.value ?? '').replace(/\s/g, '');
    return val !== '' && val !== '[0,0]' && val !== '0';
  }

  private collectLeafConstraintElements(source: ISubmodelElement[]): ISubmodelElement[] {
    const out: ISubmodelElement[] = [];
    for (const el of source) {
      if (el instanceof aas.types.SubmodelElementCollection) {
        out.push(...this.collectLeafConstraintElements(el.value ?? []));
      } else if (!(el instanceof aas.types.RelationshipElement)) {
        out.push(el);
      }
    }
    return out;
  }

  private collectRelationshipElements(source: ISubmodelElement[]): aas.types.RelationshipElement[] {
    const out: aas.types.RelationshipElement[] = [];
    for (const el of source) {
      if (el instanceof aas.types.RelationshipElement) {
        out.push(el);
      } else if (el instanceof aas.types.SubmodelElementCollection) {
        out.push(...this.collectRelationshipElements(el.value ?? []));
      }
    }
    return out;
  }

  private collectPropertyValueElements(source: ISubmodelElement[]): ISubmodelElement[] {
    const out: ISubmodelElement[] = [];
    for (const el of source) {
      if (this.isPropertyCommentElement(el)) {
        continue;
      }
      if (el instanceof aas.types.RelationshipElement) {
        continue;
      }
      if (el instanceof aas.types.SubmodelElementCollection || el instanceof aas.types.SubmodelElementList) {
        const nested = this.collectPropertyValueElements(el.value ?? []);
        if (nested.length > 0) {
          out.push(...nested);
        }
        continue;
      }
      if (
        el instanceof aas.types.Property ||
        el instanceof aas.types.MultiLanguageProperty ||
        el instanceof aas.types.Range
      ) {
        out.push(el);
      }
    }
    return out;
  }

  private isPropertyCommentElement(el: ISubmodelElement): boolean {
    return (
      (el.idShort ?? '').toLowerCase() === 'propertycomment' ||
      SemanticIdHelper.hasSemanticId(el, 'https://admin-shell.io/idta/CapabilityDescription/PropertyComment/1/0') ||
      SemanticIdHelper.hasSemanticId(el, 'https://adminshell.io/idta/CapabilityDescription/PropertyComment/1/0')
    );
  }

  private async toPropertyMapping(
    rel: aas.types.RelationshipElement,
    allSubmodels: { idShort: string; id: string; url: string; sm: aas.types.Submodel }[],
  ): Promise<{
    kind: 'direct' | 'reference';
    property: string;
    valuePath: string;
    resolvedElement: ISubmodelElement | null;
    resolvedSubmodelId: string;
    resolveHint: string;
    idShortPath: string;
  }> {
    const sourcePath = this.referencePath(rel.first);
    const propertyPath = sourcePath.join(' / ');
    const property = this.toDisplayIdShort(sourcePath[sourcePath.length - 1] || rel.idShort || 'Property');
    const resolution = await this.resolveSecondReference(rel.second, allSubmodels);
    return {
      kind: 'reference',
      property,
      valuePath: resolution.displayPath || propertyPath,
      resolvedElement: resolution.element,
      resolvedSubmodelId: resolution.submodelId,
      resolveHint: resolution.hint,
      idShortPath: resolution.idShortPath,
    };
  }

  private toDisplayIdShort(value: string): string {
    const trimmed = value.trim();
    const match = /^(.+)\[(\d+)\]$/.exec(trimmed);
    if (match == null) {
      return trimmed;
    }
    return match[1].trim();
  }

  jumpToMapping(mapping: { resolvedSubmodelId: string; idShortPath: string }): void {
    if (mapping.resolvedSubmodelId.trim() === '' || mapping.idShortPath.trim() === '') {
      return;
    }
    this.viewerStore.currentSubmodelId.set(mapping.resolvedSubmodelId);
    this.viewerStore.highlightedIdShortPath.set(mapping.idShortPath);
  }

  private referencePath(ref: aas.types.Reference | null | undefined): string[] {
    return (ref?.keys ?? []).map((k) => k.value).filter((v) => v != null && v.trim() !== '');
  }

  private async resolveSecondReference(
    ref: aas.types.Reference | null | undefined,
    allSubmodels: { idShort: string; id: string; url: string; sm: aas.types.Submodel }[],
  ): Promise<{
    element: ISubmodelElement | null;
    submodelId: string;
    displayPath: string;
    hint: string;
    idShortPath: string;
  }> {
    if (ref == null) {
      return { element: null, submodelId: '', displayPath: '', hint: 'Keine Referenz vorhanden', idShortPath: '' };
    }

    const keys = ref.keys ?? [];
    if (keys.length === 0) {
      return { element: null, submodelId: '', displayPath: '', hint: 'Leere Referenz', idShortPath: '' };
    }

    const submodelKey = keys.find((k) => this.normalizedKeyType(k.type) === 'submodel');
    let submodelId = submodelKey?.value ?? '';
    let idShortParts: string[] = keys
      .filter((k) => !['submodel', 'globalreference', 'conceptdescription'].includes(this.normalizedKeyType(k.type)))
      .map((k) => k.value)
      .filter((v) => v != null && v.trim() !== '');

    if (idShortParts.length === 0) {
      const rawPath = keys.map((k) => k.value).find((v) => v != null && v.trim() !== '') ?? '';
      const splitByPathSeparator = rawPath
        .split(/\s+\/\s+/)
        .map((p) => p.trim())
        .filter((p) => p !== '');
      if (splitByPathSeparator.length >= 2) {
        submodelId = splitByPathSeparator[0];
        idShortParts = splitByPathSeparator.slice(1);
      }
    }

    const displayPath = [submodelId, ...idShortParts].filter((x) => x !== '').join(' / ');
    if (submodelId === '' || idShortParts.length === 0) {
      return {
        element: null,
        submodelId,
        displayPath,
        hint: 'Pfad konnte nicht geparst werden',
        idShortPath: idShortParts.join('.'),
      };
    }

    const sm = allSubmodels.find((s) => s.id === submodelId || s.sm.id === submodelId);
    if (sm == null) {
      return {
        element: null,
        submodelId,
        displayPath,
        hint: 'Submodel nicht im Viewer geladen',
        idShortPath: idShortParts.join('.'),
      };
    }

    let cursor: ISubmodelElement[] = sm.sm.submodelElements ?? [];
    let found: ISubmodelElement | undefined;
    for (const part of idShortParts) {
      const parsed = this.parseIndexedPart(part);
      found = cursor.find((e) => (e.idShort ?? '').toLowerCase() === parsed.idShort.toLowerCase());
      if (found == null) {
        return {
          element: null,
          submodelId: sm.sm.id,
          displayPath,
          hint: `Element "${part}" nicht gefunden`,
          idShortPath: idShortParts.join('.'),
        };
      }

      if (parsed.index != null) {
        if (!(found instanceof aas.types.SubmodelElementList)) {
          return {
            element: null,
            submodelId: sm.sm.id,
            displayPath,
            hint: `Element "${parsed.idShort}" ist keine SubmodelElementList`,
            idShortPath: idShortParts.join('.'),
          };
        }
        const listValues = found.value ?? [];
        if (parsed.index < 0 || parsed.index >= listValues.length) {
          return {
            element: null,
            submodelId: sm.sm.id,
            displayPath,
            hint: `Index ${parsed.index} außerhalb der Liste "${parsed.idShort}"`,
            idShortPath: idShortParts.join('.'),
          };
        }
        found = listValues[parsed.index];
      }

      if (found instanceof aas.types.SubmodelElementCollection || found instanceof aas.types.SubmodelElementList) {
        cursor = found.value ?? [];
      }
    }

    return {
      element: found ?? null,
      submodelId: sm.sm.id,
      displayPath,
      hint: '',
      idShortPath: idShortParts.join('.'),
    };
  }

  private normalizedKeyType(type: aas.types.KeyTypes | string | undefined): string {
    if (typeof type === 'string') {
      return type.toLowerCase();
    }
    if (type == null) {
      return '';
    }
    const enumName = (aas.types.KeyTypes as any)[type];
    if (typeof enumName === 'string') {
      return enumName.toLowerCase();
    }
    return String(type).toLowerCase();
  }

  private parseIndexedPart(part: string): { idShort: string; index: number | null } {
    const trimmed = part.trim();
    const match = /^(.+)\[(\d+)\]$/.exec(trimmed);
    if (match == null) {
      return { idShort: trimmed, index: null };
    }
    return { idShort: match[1].trim(), index: Number.parseInt(match[2], 10) };
  }

  private collectCollections(
    source: ISubmodelElement[],
    idShort: string,
    semanticId: string,
  ): aas.types.SubmodelElementCollection[] {
    const out: aas.types.SubmodelElementCollection[] = [];
    for (const el of source) {
      if (
        el instanceof aas.types.SubmodelElementCollection &&
        ((el.idShort ?? '').toLowerCase() === idShort.toLowerCase() || SemanticIdHelper.hasSemanticId(el, semanticId))
      ) {
        out.push(el);
      }
      if (el instanceof aas.types.SubmodelElementCollection) {
        out.push(...this.collectCollections(el.value ?? [], idShort, semanticId));
      } else if (el instanceof aas.types.SubmodelElementList) {
        out.push(...this.collectCollections(el.value ?? [], idShort, semanticId));
      }
    }
    return out;
  }

  private findElement(source: ISubmodelElement[], idShort: string, semanticId: string): ISubmodelElement | undefined {
    for (const el of source) {
      if ((el.idShort ?? '').toLowerCase() === idShort.toLowerCase()) {
        return el;
      }
      if (semanticId !== '' && SemanticIdHelper.hasSemanticId(el, semanticId)) {
        return el;
      }
      if (el instanceof aas.types.SubmodelElementCollection) {
        const nested = this.findElement(el.value ?? [], idShort, semanticId);
        if (nested != null) {
          return nested;
        }
      } else if (el instanceof aas.types.SubmodelElementList) {
        const nested = this.findElement(el.value ?? [], idShort, semanticId);
        if (nested != null) {
          return nested;
        }
      }
    }
    return undefined;
  }

  private findCollection(
    source: ISubmodelElement[],
    idShort: string,
    semanticId: string,
  ): aas.types.SubmodelElementCollection | undefined {
    const found = this.findElement(source, idShort, semanticId);
    if (found instanceof aas.types.SubmodelElementCollection) {
      return found;
    }
    return undefined;
  }

  private getText(el: ISubmodelElement | undefined): string {
    if (el == null) {
      return '';
    }
    if (el instanceof aas.types.Property) {
      return (el.value ?? '').trim();
    }
    if (el instanceof aas.types.MultiLanguageProperty) {
      const values = el.value ?? [];
      const exact = values.find((v) => v.language.toLowerCase() === this.currentLanguage.toLowerCase());
      if (exact?.text) {
        return exact.text.trim();
      }
      const en = values.find((v) => v.language.toLowerCase() === 'en');
      if (en?.text) {
        return en.text.trim();
      }
      return values[0]?.text?.trim() ?? '';
    }
    return '';
  }
}
