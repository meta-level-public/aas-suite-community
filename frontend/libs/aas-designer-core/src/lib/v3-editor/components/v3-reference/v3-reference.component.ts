import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { VerificationError } from '@aas-core-works/aas-core3.1-typescript/verification';
import { HelpLabelComponent } from '@aas/common-components';
import { NotificationService } from '@aas/common-services';
import { InstanceHelper } from '@aas/helpers';
import { ShellResult } from '@aas/model';
import { NgClass } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { PrimeTemplate, TreeNode } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';
import { Tree } from 'primeng/tree';
import { TreeNodeSelectEvent } from 'primeng/tree';
import { v4 as uuid } from 'uuid';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';
import { Info } from '../../../general/model/info-item';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { ErrorPanelComponent } from '../error-panel/error-panel.component';
import { V3ComponentBase } from '../v3-component-base';

@Component({
  selector: 'aas-v3-reference',
  templateUrl: './v3-reference.component.html',
  imports: [
    Button,
    NgClass,
    HelpLabelComponent,
    Select,
    V3UndoDirective,
    FormsModule,
    Tooltip,
    InputText,
    NullIfEmptyDirective,
    Dialog,
    TableModule,
    PrimeTemplate,
    Tree,
    ErrorPanelComponent,
    TranslateModule,
  ],
  styles: [
    `
      .reference-picker-node {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        width: 100%;
        padding-right: 0.25rem;
      }
      .reference-picker-node-main {
        min-width: 0;
      }
      .reference-picker-node-label {
        font-weight: 600;
        line-height: 1.1rem;
      }
      .reference-picker-node-path {
        font-size: var(--aas-text-xs);
        color: var(--text-color-secondary);
        line-height: 1rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 34rem;
      }
      .reference-picker-type-badge {
        font-size: var(--aas-text-xs);
        padding: 0.12rem 0.45rem;
        border-radius: var(--aas-radius-pill);
        border: 1px solid;
        line-height: 1;
        white-space: nowrap;
      }
      .reference-type-property {
        background: var(--aas-info-surface);
        color: var(--aas-info-text);
        border-color: var(--aas-info-border);
      }
      .reference-type-range {
        background: var(--aas-success-surface);
        color: var(--aas-success-text);
        border-color: var(--aas-success-border);
      }
      .reference-type-mlp {
        background: var(--aas-warning-surface);
        color: var(--aas-warning-text);
        border-color: var(--aas-warning-border);
      }
      .reference-type-collection {
        background: color-mix(in srgb, var(--p-primary-50) 84%, var(--p-surface-0));
        color: var(--p-primary-700);
        border-color: color-mix(in srgb, var(--p-primary-400) 45%, var(--p-content-border-color));
      }
      .reference-type-list {
        background: var(--aas-surface-subtle);
        color: var(--p-text-muted-color);
        border-color: var(--p-content-border-color);
      }
      .reference-type-submodel {
        background: var(--aas-danger-surface);
        color: var(--aas-danger-text);
        border-color: var(--aas-danger-border);
      }
      .reference-type-default {
        background: var(--aas-surface-subtle);
        color: var(--p-text-muted-color);
        border-color: var(--p-content-border-color);
      }
      .reference-picker-panel {
        border: 1px solid var(--p-content-border-color);
        border-radius: var(--aas-radius-sm);
        background: var(--aas-surface-overlay);
      }
      .reference-picker-tree {
        height: 26rem;
        overflow: auto;
      }
      .reference-picker-details {
        min-height: 26rem;
      }
      .reference-picker-value {
        overflow-wrap: anywhere;
        word-break: break-word;
      }
    `,
  ],
})
export class V3ReferenceComponent extends V3ComponentBase implements OnChanges {
  private readonly allFilterValue = '__all__';

  @Input({ required: true }) reference: aas.types.Reference | undefined | null;
  @Input({ required: true }) referenceParent: any;
  @Input({ required: true }) referenceParentField: string = '';
  @Input() referenceParentIsArray: boolean = false;
  @Input() type: aas.types.KeyTypes | null = null;
  @Input() typeEditable: boolean = true;
  info = Info;
  refType = aas.types.ReferenceTypes;

  @Input() keyTypeOptions: { label: string; value: number }[] = this.keyTypes;
  @Input({ required: true }) shellResult: ShellResult | undefined | null;
  // New: default type when creating a new Reference (kept ExternalReference for backwards compatibility)
  @Input() defaultReferenceType: aas.types.ReferenceTypes = aas.types.ReferenceTypes.ExternalReference;
  // New: allow disabling the reference type dropdown (used e.g. in RelationshipElement first/second refs)
  @Input() referenceTypeEditable: boolean = true;

  InstanceHelper = InstanceHelper;

  candidates: {
    label: string;
    id: string | null;
    idShort: string | null;
    type: string;
    keys: aas.types.Key[];
    guid: string;
    path: string;
    rootSubmodel: string;
  }[] = [];
  selectedCandidate: {
    id: string | null;
    idShort: string | null;
    type: string;
    keys: aas.types.Key[];
    guid: string;
    path: string;
    rootSubmodel: string;
  } | null = null;
  selectedCandidateNode: TreeNode | null = null;
  candidateTree: TreeNode[] = [];
  filteredCandidateTree: TreeNode[] = [];
  selectionSearch = '';
  selectionTypeFilter = this.allFilterValue;
  selectionSubmodelFilter = this.allFilterValue;
  selectionTypeOptions: { label: string; value: string }[] = [];
  selectionSubmodelOptions: { label: string; value: string }[] = [];

  showSelection: boolean = false;
  showUrlDialog: boolean = false;
  externalUrlInput: string = '';

  constructor(
    private treeService: V3TreeService,
    private notificationService: NotificationService,
    private translateService: TranslateService,
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.reference != null && changes['type'] != null && changes['type'].currentValue != null) {
      if (this.reference.keys == null) {
        this.reference.keys = [];
      }
      if (this.reference.keys.length === 0) {
        this.addKey(changes['type'].currentValue);
      }
    }
  }

  addReference() {
    if (this.reference == null && this.referenceParent != null) {
      const newRef = new aas.types.Reference(this.defaultReferenceType, []);
      if (this.referenceParentIsArray) {
        if (this.referenceParent[this.referenceParentField] == null) {
          this.referenceParent[this.referenceParentField] = [];
        }
        this.referenceParent[this.referenceParentField].push(newRef);
      } else {
        this.referenceParent[this.referenceParentField] = newRef;
      }
      this.reference = newRef;
      this.addKey(this.type ?? aas.types.KeyTypes.GlobalReference);
      this.treeService.registerFieldUndoStep();
    }
  }

  addKey(type: aas.types.KeyTypes = aas.types.KeyTypes.GlobalReference) {
    if (this.reference && this.reference.keys == null) {
      const langStringArr: aas.types.Key[] = [];
      this.reference.keys = langStringArr;
    }
    this.reference?.keys.push(new aas.types.Key(type, ''));
  }

  removeReferenceBlock() {
    if (this.reference != null && this.referenceParent != null) {
      this.referenceParent[this.referenceParentField] = null;
      this.reference = null;
    }
  }

  showSelectionDialog() {
    this.showSelection = true;
    this.candidates = [];
    this.selectedCandidate = null;
    this.selectedCandidateNode = null;
    this.selectionSearch = '';
    this.candidateTree = [];

    this.shellResult?.v3Shell?.submodels?.forEach((sm) => {
      const rootSubmodel = sm.idShort ?? sm.id ?? '';
      const node = this.getReferenceCandidates(sm, [], rootSubmodel, rootSubmodel);
      if (node != null) this.candidateTree.push(node);
    });

    this.initializeSelectionFilters();
    this.applySelectionFilters();
  }

  getReferenceCandidates(
    el: any,
    keys: aas.types.Key[],
    path: string,
    rootSubmodel: string,
    listIndex: number | null = null,
  ): TreeNode | null {
    if (el instanceof aas.types.Reference) return null;

    // If element is inside a SubmodelElementList, key uses index.
    // First key for submodel is submodel.id.
    let keyValue = '';
    if (listIndex != null) {
      keyValue = listIndex.toString();
    } else if (keys.length === 0 && el instanceof aas.types.Submodel) {
      keyValue = el.id ?? el.idShort ?? '';
    } else {
      keyValue = el.idShort ?? el.id ?? '';
    }

    const nextKeys = cloneDeep(keys);
    nextKeys.push(
      new aas.types.Key(
        aas.types.KeyTypes[InstanceHelper.getInstanceName(el) as keyof typeof aas.types.KeyTypes],
        keyValue,
      ),
    );

    const candidate = {
      label: el.id ?? el.idShort,
      idShort: el.idShort,
      id: el.id,
      type: InstanceHelper.getInstanceName(el),
      keys: nextKeys,
      guid: uuid(),
      path,
      rootSubmodel,
    };
    this.candidates.push(candidate);

    const children: TreeNode[] = [];
    if (el instanceof aas.types.Submodel) {
      el.submodelElements?.forEach((sme: any) => {
        const child = this.getReferenceCandidates(sme, nextKeys, `${path}.${sme.idShort}`, rootSubmodel);
        if (child) children.push(child);
      });
    }
    if (el instanceof aas.types.SubmodelElementCollection) {
      el.value?.forEach((sme: any) => {
        const child = this.getReferenceCandidates(sme, nextKeys, `${path}.${sme.idShort}`, rootSubmodel);
        if (child) children.push(child);
      });
    }
    if (el instanceof aas.types.SubmodelElementList) {
      el.value?.forEach((sme: any, idx: number) => {
        const child = this.getReferenceCandidates(sme, nextKeys, `${path}[${idx}]`, rootSubmodel, idx);
        if (child) children.push(child);
      });
    }
    if (el instanceof aas.types.Entity) {
      el.statements?.forEach((sme: any) => {
        const child = this.getReferenceCandidates(sme, nextKeys, `${path}.${sme.idShort}`, rootSubmodel);
        if (child) children.push(child);
      });
    }

    return {
      key: candidate.guid,
      label: candidate.idShort ?? candidate.id ?? candidate.type,
      expanded: true,
      children,
      leaf: children.length === 0,
      data: { candidate },
    };
  }

  initializeSelectionFilters() {
    const typeSet = new Set(this.candidates.map((c) => c.type).filter((v) => v != null && v !== ''));
    const submodelSet = new Set(this.candidates.map((c) => c.rootSubmodel).filter((v) => v != null && v !== ''));
    const sortedTypes = Array.from(typeSet).sort((a, b) => a.localeCompare(b));
    const sortedSubmodels = Array.from(submodelSet).sort((a, b) => a.localeCompare(b));

    this.selectionTypeOptions = [
      { label: this.translateService.instant('ALL'), value: this.allFilterValue },
      ...sortedTypes.map((type) => ({ label: type, value: type })),
    ];
    this.selectionSubmodelOptions = [
      { label: this.translateService.instant('ALL'), value: this.allFilterValue },
      ...sortedSubmodels.map((submodel) => ({ label: submodel, value: submodel })),
    ];

    this.selectionSubmodelFilter = this.allFilterValue;
    this.selectionTypeFilter = this.allFilterValue;
    if (this.type != null) {
      const preferredType = this.getTypeString(this.type);
      if (this.selectionTypeOptions.some((opt) => opt.value === preferredType)) {
        this.selectionTypeFilter = preferredType;
      }
    }
  }

  applySelectionFilters() {
    this.filteredCandidateTree = this.filterCandidateTree(this.candidateTree);
    if (this.selectedCandidate != null && this.isCandidateVisible(this.selectedCandidate.guid) === false) {
      this.selectedCandidate = null;
      this.selectedCandidateNode = null;
    }
  }

  private filterCandidateTree(nodes: TreeNode[]): TreeNode[] {
    const search = (this.selectionSearch ?? '').trim().toLowerCase();
    const selectedType = this.selectionTypeFilter;
    const selectedSubmodel = this.selectionSubmodelFilter;
    const filtered: TreeNode[] = [];

    for (const node of nodes) {
      const candidate = node.data?.candidate;
      const nodeMatches =
        candidate != null &&
        (selectedType === this.allFilterValue || candidate.type === selectedType) &&
        (selectedSubmodel === this.allFilterValue || candidate.rootSubmodel === selectedSubmodel) &&
        (search === '' ||
          candidate.path.toLowerCase().includes(search) ||
          (candidate.idShort ?? '').toLowerCase().includes(search) ||
          (candidate.id ?? '').toLowerCase().includes(search));

      const childMatches = this.filterCandidateTree(node.children ?? []);
      if (nodeMatches || childMatches.length > 0) {
        filtered.push({
          ...node,
          expanded: true,
          children: childMatches,
          leaf: childMatches.length === 0,
        });
      }
    }

    return filtered;
  }

  private isCandidateVisible(guid: string): boolean {
    const stack = [...this.filteredCandidateTree];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node?.data?.candidate?.guid === guid) return true;
      if (node?.children?.length) stack.push(...node.children);
    }
    return false;
  }

  selectCandidate(event: TreeNodeSelectEvent) {
    const candidate = event.node?.data?.candidate;
    if (candidate != null) this.selectedCandidate = candidate;
  }

  clearSelectionFilters() {
    this.selectionSearch = '';
    this.selectionTypeFilter = this.allFilterValue;
    this.selectionSubmodelFilter = this.allFilterValue;
    this.applySelectionFilters();
  }

  getTypeBadgeClass(type: string | undefined): string {
    switch (type) {
      case 'Property':
        return 'reference-picker-type-badge reference-type-property';
      case 'Range':
        return 'reference-picker-type-badge reference-type-range';
      case 'MultiLanguageProperty':
        return 'reference-picker-type-badge reference-type-mlp';
      case 'SubmodelElementCollection':
        return 'reference-picker-type-badge reference-type-collection';
      case 'SubmodelElementList':
        return 'reference-picker-type-badge reference-type-list';
      case 'Submodel':
        return 'reference-picker-type-badge reference-type-submodel';
      default:
        return 'reference-picker-type-badge reference-type-default';
    }
  }

  apply() {
    if (this.selectedCandidate != null && this.reference != null) {
      this.reference.keys = this.selectedCandidate.keys;
    }

    this.selectedCandidate = null;
    this.showSelection = false;
  }

  removeKey(index: number) {
    if (!this.reference?.keys) return;
    this.reference.keys.splice(index, 1);
    this.treeService.registerFieldUndoStep();
  }

  getTypeString(type: number) {
    return aas.types.KeyTypes[type];
  }

  openExternalUrlDialog() {
    if (this.reference == null) {
      // falls noch keine Referenz existiert, zuerst anlegen
      this.addReference();
    }
    this.externalUrlInput = '';
    this.showUrlDialog = true;
  }

  cancelExternalUrlDialog() {
    this.showUrlDialog = false;
    this.externalUrlInput = '';
  }

  applyExternalUrl() {
    if (!this.reference) return;

    const raw = (this.externalUrlInput || '').trim();
    if (raw.length === 0) {
      this.cancelExternalUrlDialog();
      return;
    }

    // Split URL and fragment
    const hashIndex = raw.indexOf('#');
    const base = hashIndex >= 0 ? raw.substring(0, hashIndex) : raw;
    const fragment = hashIndex >= 0 ? raw.substring(hashIndex + 1) : '';

    // Reset keys
    this.reference.keys = [];
    // 1) External Reference key (use GlobalReference or if specific KeyTypes available?)
    this.reference.keys.push(new aas.types.Key(aas.types.KeyTypes.GlobalReference, base));
    // 2) FragmentReference key only if fragment present
    if (fragment) {
      this.reference.keys.push(new aas.types.Key(aas.types.KeyTypes.FragmentReference, fragment));
    }

    // Ensure reference type is ExternalReference
    this.reference.type = aas.types.ReferenceTypes.ExternalReference;

    this.treeService.registerFieldUndoStep();
    this.cancelExternalUrlDialog();
  }

  // Build URL for an ExternalReference from its keys (first = base, optional second = fragment)
  get externalReferenceUrl(): string | null {
    if (this.reference?.type !== aas.types.ReferenceTypes.ExternalReference) return null;
    const keys = this.reference.keys ?? [];
    if (keys.length === 0) return null;
    const base = keys[0].value?.trim();
    if (!base) return null;
    let url = base;
    if (keys.length > 1 && keys[1].value) {
      url += '#' + keys[1].value;
    }
    // basic validation: http/https only
    if (!/^https?:\/\//i.test(url)) return null;
    return url;
  }

  openExternalReference() {
    const url = this.externalReferenceUrl;
    if (!url) return;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }

  // Determine if jump is possible (ModelReference & first key resolves to a Submodel)
  get canJump(): boolean {
    if (this.reference?.type !== aas.types.ReferenceTypes.ModelReference) return false;
    const keys = this.reference?.keys;
    if (!keys || keys.length === 0) return false;
    const firstKey = keys[0].value;
    if (!firstKey) return false;
    return !!this.shellResult?.v3Shell?.submodels?.find((sm) => sm.id === firstKey || sm.idShort === firstKey);
  }

  // Jump to the referenced target (similar to RelationshipElement jump button)
  jump() {
    if (!this.reference?.keys?.length) {
      this.notificationService.showMessage('MODEL_REFERENCE_PATH_INVALID', 'JUMP_TO_TARGET', 'warn', false, 5000);
      return;
    }

    const target = this.resolveModelReferenceTarget(this.reference.keys);
    if (target == null) {
      this.notificationService.showMessage('MODEL_REFERENCE_PATH_INVALID', 'JUMP_TO_TARGET', 'warn', false, 7000);
      return;
    }

    this.treeService.selectNodeByElement(target);
  }

  private resolveModelReferenceTarget(keys: aas.types.Key[]): any | null {
    const firstKey = keys[0]?.value;
    if (!firstKey) return null;
    let current: any =
      this.shellResult?.v3Shell?.submodels?.find((sm) => sm.id === firstKey || sm.idShort === firstKey) ?? null;
    if (!current) return null;

    for (const key of keys.slice(1)) {
      const keyValue = key?.value ?? '';
      current = this.findDirectChildByKey(current, keyValue);
      if (!current) return null;
    }
    return current;
  }

  private findDirectChildByKey(parent: any, keyValue: string): any | null {
    if (!parent) return null;

    if (parent instanceof aas.types.Submodel) {
      return (parent.submodelElements ?? []).find((el) => el.idShort === keyValue) ?? null;
    }
    if (parent instanceof aas.types.SubmodelElementCollection) {
      return (parent.value ?? []).find((el) => el.idShort === keyValue) ?? null;
    }
    if (parent instanceof aas.types.Entity) {
      return (parent.statements ?? []).find((el) => el.idShort === keyValue) ?? null;
    }
    if (parent instanceof aas.types.SubmodelElementList) {
      const index = Number.parseInt(keyValue, 10);
      if (Number.isInteger(index) && index >= 0) {
        return parent.value?.[index] ?? null;
      }
      return (parent.value ?? []).find((el) => el.idShort === keyValue) ?? null;
    }
    return null;
  }

  // --- Validation error handling (moved here so reference alone can show problems) ---
  private errorArr: { error: VerificationError; action: any }[] = [];
  get errors() {
    const collected: { error: VerificationError; action: any }[] = [];
    if (this.reference != null) {
      for (const err of aas.verification.verify(this.reference, true)) {
        collected.push({ error: err, action: this.getAction(err) });
      }
    }
    // shallow compare by JSON (small list)
    if (JSON.stringify(collected) !== JSON.stringify(this.errorArr)) {
      this.errorArr = [...collected];
    }
    return this.errorArr;
  }
  get hasErrors() {
    return this.errors.length > 0;
  }
}
