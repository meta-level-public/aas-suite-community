import { buildShellRegistryCorrectionRoute, buildShellsListRoute, NotificationService } from '@aas/common-services';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { SplitterModule } from 'primeng/splitter';
import { TextareaModule } from 'primeng/textarea';
import { SidebarTreeNavComponent } from '../../general/sidebar-tree-nav/sidebar-tree-nav.component';
import {
  RegistryAasDescriptor,
  RegistryCorrectionService,
  RegistryEndpoint,
  RegistryLocalizedText,
  RegistrySubmodelDescriptor,
} from './registry-correction.service';

@Component({
  selector: 'aas-registry-correction',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AccordionModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    SkeletonModule,
    SplitterModule,
    TextareaModule,
    SidebarTreeNavComponent,
  ],
  templateUrl: './registry-correction.component.html',
  styleUrls: ['../../../host.scss', './registry-correction.component.scss'],
})
export class RegistryCorrectionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly registryCorrectionService = inject(RegistryCorrectionService);
  private readonly notificationService = inject(NotificationService);

  loading = signal(false);
  savingAas = signal(false);
  savingSubmodelIds = signal<string[]>([]);
  loadingSubmodelIds = signal<string[]>([]);

  aasDescriptor = signal<RegistryAasDescriptor | null>(null);
  submodelDescriptors = signal<Record<string, RegistrySubmodelDescriptor>>({});

  selectedNodeKey = signal('aas');
  editingAas = signal(false);
  editingSubmodelId = signal<string | null>(null);

  aasDraft = signal<RegistryAasDescriptor | null>(null);
  aasDraftJson = signal('');
  aasDraftJsonError = signal<string | null>(null);
  aasExpandedEndpointPanels = signal<number[]>([]);

  submodelDrafts = signal<Record<string, RegistrySubmodelDescriptor>>({});
  submodelDraftJson = signal<Record<string, string>>({});
  submodelDraftErrors = signal<Record<string, string | null>>({});
  submodelExpandedEndpointPanels = signal<Record<string, number[]>>({});

  readonly submodelRows = computed(() => this.aasDescriptor()?.submodelDescriptors ?? []);
  readonly selectedSubmodelId = computed(() => {
    const selectedKey = this.selectedNodeKey();
    return selectedKey.startsWith('submodel:') ? selectedKey.replace('submodel:', '') : null;
  });
  readonly selectedDescriptor = computed<RegistryAasDescriptor | RegistrySubmodelDescriptor | null>(() => {
    const selectedSubmodelId = this.selectedSubmodelId();
    if (!selectedSubmodelId) {
      return this.aasDescriptor();
    }

    return this.submodelDescriptors()[selectedSubmodelId] ?? this.findNestedSubmodelDescriptor(selectedSubmodelId);
  });
  readonly navigationItems = computed<TreeNode[]>(() => {
    const descriptor = this.aasDescriptor();
    const children = this.submodelRows().map((submodel) => ({
      key: this.buildSubmodelKey(submodel.id),
      label: submodel.idShort || submodel.id || '-',
      icon: 'pi pi-database',
      selectable: !!submodel.id,
      data: {
        descriptorId: submodel.id,
        description: submodel.id ?? '',
        descriptionTranslate: false,
      },
    }));

    return [
      {
        key: 'aas',
        label: 'REGISTRY_CORRECTION_DESCRIPTOR_TITLE',
        icon: 'pi pi-box',
        expanded: true,
        selectable: true,
        data: {
          descriptorId: descriptor?.id ?? this.aasId,
          description: descriptor?.id ?? this.aasId,
          descriptionTranslate: false,
        },
        children,
      },
    ];
  });

  get aasId() {
    return this.route.snapshot.params['aasId'] ?? '';
  }

  async ngOnInit() {
    await this.loadAasDescriptor();
  }

  async goBack() {
    await this.router.navigate(buildShellsListRoute());
  }

  async reloadDescriptor() {
    await this.loadAasDescriptor();
  }

  async selectDescriptor(node: TreeNode) {
    const selectedKey = `${node.key ?? ''}`;
    if (selectedKey === '') {
      return;
    }

    this.selectedNodeKey.set(selectedKey);
    this.cancelEditingOnSelectionChange();

    const submodelId = this.extractSubmodelIdFromKey(selectedKey);
    if (submodelId && this.submodelDescriptors()[submodelId] == null) {
      await this.loadSubmodelDescriptor(submodelId);
    }
  }

  isSubmodelLoading(submodelId: string) {
    return this.loadingSubmodelIds().includes(submodelId);
  }

  isSavingSubmodel(submodelId: string) {
    return this.savingSubmodelIds().includes(submodelId);
  }

  isAasSelected() {
    return this.selectedSubmodelId() == null;
  }

  isSelectedDescriptorEditing() {
    const submodelId = this.selectedSubmodelId();
    return submodelId ? this.editingSubmodelId() === submodelId : this.editingAas();
  }

  isSelectedDescriptorLoading() {
    const submodelId = this.selectedSubmodelId();
    return submodelId ? this.isSubmodelLoading(submodelId) : false;
  }

  isSelectedDescriptorSaving() {
    const submodelId = this.selectedSubmodelId();
    return submodelId ? this.isSavingSubmodel(submodelId) : this.savingAas();
  }

  selectedDescriptorKicker() {
    return this.isAasSelected() ? 'REGISTRY' : 'SUBMODELS';
  }

  selectedDescriptorTitle() {
    return this.isAasSelected()
      ? 'REGISTRY_CORRECTION_DESCRIPTOR_TITLE'
      : 'REGISTRY_CORRECTION_SUBMODEL_DESCRIPTOR_TITLE';
  }

  selectedDescriptorSubtitle() {
    const descriptor = this.selectedDescriptor();
    if (!descriptor) {
      return '';
    }

    return this.isAasSelected() ? (descriptor.id ?? '') : (descriptor.id ?? this.selectedSubmodelId() ?? '');
  }

  startEditingSelected() {
    const submodelId = this.selectedSubmodelId();
    if (submodelId) {
      this.startEditSubmodel(submodelId);
      return;
    }

    this.startEditAas();
  }

  cancelEditingSelected() {
    const submodelId = this.selectedSubmodelId();
    if (submodelId) {
      this.cancelEditSubmodel(submodelId);
      return;
    }

    this.cancelEditAas();
  }

  async saveSelectedDescriptor() {
    const submodelId = this.selectedSubmodelId();
    if (submodelId) {
      await this.saveSubmodelDescriptor(submodelId);
      return;
    }

    await this.saveAasDescriptor();
  }

  startEditAas() {
    const descriptor = this.aasDescriptor();
    if (!descriptor) {
      return;
    }

    const draft = this.cloneDescriptor(descriptor);
    this.aasDraft.set(draft);
    this.aasDraftJson.set(this.stringifyDescriptor(draft));
    this.aasDraftJsonError.set(null);
    this.aasExpandedEndpointPanels.set(this.buildExpandedEndpointPanels(draft));
    this.editingAas.set(true);
    this.editingSubmodelId.set(null);
  }

  cancelEditAas() {
    this.editingAas.set(false);
    this.aasDraft.set(null);
    this.aasDraftJson.set('');
    this.aasDraftJsonError.set(null);
    this.aasExpandedEndpointPanels.set([]);
  }

  onAasJsonChanged(value: string) {
    this.aasDraftJson.set(value);

    try {
      this.aasDraft.set(this.parseDescriptor<RegistryAasDescriptor>(value));
      this.aasDraftJsonError.set(null);
      this.aasExpandedEndpointPanels.set(this.buildExpandedEndpointPanels(this.aasDraft()));
    } catch {
      this.aasDraftJsonError.set('REGISTRY_CORRECTION_JSON_INVALID');
    }
  }

  onAasEndpointPanelsChanged(value: string | number | string[] | number[] | null | undefined) {
    this.aasExpandedEndpointPanels.set(this.normalizeAccordionValue(value));
  }

  addAasEndpoint() {
    const draft = this.aasDraft();
    if (!draft) {
      return;
    }

    const next = this.cloneDescriptor(draft);
    const nextIndex = this.getEndpoints(next).length;
    this.ensureEndpoint(next, nextIndex);
    this.applyAasDraft(next);
    this.aasExpandedEndpointPanels.update((values) => [...new Set([...values, nextIndex])]);
  }

  updateAasEndpointHref(index: number, href: string) {
    const draft = this.aasDraft();
    if (!draft) {
      return;
    }

    const next = this.cloneDescriptor(draft);
    const endpoint = this.ensureEndpoint(next, index);
    endpoint.protocolInformation = {
      ...endpoint.protocolInformation,
      href,
    };
    this.applyAasDraft(next);
  }

  updateAasEndpointInterface(index: number, endpointInterface: string) {
    const draft = this.aasDraft();
    if (!draft) {
      return;
    }

    const next = this.cloneDescriptor(draft);
    const endpoint = this.ensureEndpoint(next, index);
    endpoint.interface = endpointInterface;
    this.applyAasDraft(next);
  }

  updateAasEndpointProtocol(index: number, endpointProtocol: string) {
    const draft = this.aasDraft();
    if (!draft) {
      return;
    }

    const next = this.cloneDescriptor(draft);
    const endpoint = this.ensureEndpoint(next, index);
    endpoint.protocolInformation = {
      ...endpoint.protocolInformation,
      endpointProtocol,
    };
    this.applyAasDraft(next);
  }

  async saveAasDescriptor() {
    const currentDescriptor = this.aasDescriptor();
    const draft = this.aasDraft();
    if (!currentDescriptor || !draft || this.aasDraftJsonError() != null) {
      return;
    }

    const originalId = currentDescriptor.id ?? this.aasId;
    const nextId = draft.id ?? originalId;

    try {
      this.savingAas.set(true);
      await this.registryCorrectionService.saveAasDescriptor(originalId, draft);
      this.notificationService.showMessageAlways('REGISTRY_CORRECTION_SAVE_SUCCESS', 'SUCCESS', 'success', false);
      this.cancelEditAas();

      if (nextId !== this.aasId) {
        await this.router.navigate(buildShellRegistryCorrectionRoute(nextId));
        return;
      }

      await this.loadAasDescriptor();
    } catch {
      this.notificationService.showMessageAlways('REGISTRY_CORRECTION_SAVE_FAILED', 'ERROR', 'error', false);
    } finally {
      this.savingAas.set(false);
    }
  }

  startEditSubmodel(submodelId: string) {
    const descriptor = this.submodelDescriptors()[submodelId] ?? this.findNestedSubmodelDescriptor(submodelId);
    if (!descriptor) {
      return;
    }

    const draft = this.cloneDescriptor(descriptor);
    this.submodelDrafts.update((drafts) => ({ ...drafts, [submodelId]: draft }));
    this.submodelDraftJson.update((jsonMap) => ({ ...jsonMap, [submodelId]: this.stringifyDescriptor(draft) }));
    this.submodelDraftErrors.update((errors) => ({ ...errors, [submodelId]: null }));
    this.submodelExpandedEndpointPanels.update((panels) => ({
      ...panels,
      [submodelId]: this.buildExpandedEndpointPanels(draft),
    }));
    this.editingSubmodelId.set(submodelId);
    this.editingAas.set(false);
  }

  cancelEditSubmodel(submodelId: string) {
    this.submodelDrafts.update((drafts) => {
      const next = { ...drafts };
      delete next[submodelId];
      return next;
    });
    this.submodelDraftJson.update((jsonMap) => {
      const next = { ...jsonMap };
      delete next[submodelId];
      return next;
    });
    this.submodelDraftErrors.update((errors) => {
      const next = { ...errors };
      delete next[submodelId];
      return next;
    });
    this.submodelExpandedEndpointPanels.update((panels) => {
      const next = { ...panels };
      delete next[submodelId];
      return next;
    });
    if (this.editingSubmodelId() === submodelId) {
      this.editingSubmodelId.set(null);
    }
  }

  onSubmodelJsonChanged(submodelId: string, value: string) {
    this.submodelDraftJson.update((jsonMap) => ({ ...jsonMap, [submodelId]: value }));

    try {
      const parsed = this.parseDescriptor<RegistrySubmodelDescriptor>(value);
      this.submodelDrafts.update((drafts) => ({ ...drafts, [submodelId]: parsed }));
      this.submodelDraftErrors.update((errors) => ({ ...errors, [submodelId]: null }));
      this.submodelExpandedEndpointPanels.update((panels) => ({
        ...panels,
        [submodelId]: this.buildExpandedEndpointPanels(parsed),
      }));
    } catch {
      this.submodelDraftErrors.update((errors) => ({ ...errors, [submodelId]: 'REGISTRY_CORRECTION_JSON_INVALID' }));
    }
  }

  onSubmodelEndpointPanelsChanged(submodelId: string, value: string | number | string[] | number[] | null | undefined) {
    this.submodelExpandedEndpointPanels.update((panels) => ({
      ...panels,
      [submodelId]: this.normalizeAccordionValue(value),
    }));
  }

  addSubmodelEndpoint(submodelId: string) {
    const draft = this.submodelDrafts()[submodelId];
    if (!draft) {
      return;
    }

    const next = this.cloneDescriptor(draft);
    const nextIndex = this.getEndpoints(next).length;
    this.ensureEndpoint(next, nextIndex);
    this.applySubmodelDraft(submodelId, next);
    this.submodelExpandedEndpointPanels.update((panels) => ({
      ...panels,
      [submodelId]: [...new Set([...(panels[submodelId] ?? []), nextIndex])],
    }));
  }

  updateSubmodelEndpointHref(submodelId: string, index: number, href: string) {
    const draft = this.submodelDrafts()[submodelId];
    if (!draft) {
      return;
    }

    const next = this.cloneDescriptor(draft);
    const endpoint = this.ensureEndpoint(next, index);
    endpoint.protocolInformation = {
      ...endpoint.protocolInformation,
      href,
    };
    this.applySubmodelDraft(submodelId, next);
  }

  updateSubmodelEndpointInterface(submodelId: string, index: number, endpointInterface: string) {
    const draft = this.submodelDrafts()[submodelId];
    if (!draft) {
      return;
    }

    const next = this.cloneDescriptor(draft);
    const endpoint = this.ensureEndpoint(next, index);
    endpoint.interface = endpointInterface;
    this.applySubmodelDraft(submodelId, next);
  }

  updateSubmodelEndpointProtocol(submodelId: string, index: number, endpointProtocol: string) {
    const draft = this.submodelDrafts()[submodelId];
    if (!draft) {
      return;
    }

    const next = this.cloneDescriptor(draft);
    const endpoint = this.ensureEndpoint(next, index);
    endpoint.protocolInformation = {
      ...endpoint.protocolInformation,
      endpointProtocol,
    };
    this.applySubmodelDraft(submodelId, next);
  }

  async saveSubmodelDescriptor(submodelId: string) {
    const draft = this.submodelDrafts()[submodelId];
    const hasJsonError = this.submodelDraftErrors()[submodelId];
    if (!draft || hasJsonError != null) {
      return;
    }

    const nextId = draft.id ?? submodelId;
    this.savingSubmodelIds.update((ids) => [...ids, submodelId]);

    try {
      await this.registryCorrectionService.saveSubmodelDescriptor(submodelId, draft);
      this.notificationService.showMessageAlways('REGISTRY_CORRECTION_SAVE_SUCCESS', 'SUCCESS', 'success', false);
      this.cancelEditSubmodel(submodelId);
      this.selectedNodeKey.set(this.buildSubmodelKey(nextId));
      await this.loadAasDescriptor(this.buildSubmodelKey(nextId));
      await this.loadSubmodelDescriptor(nextId);
    } catch {
      this.notificationService.showMessageAlways('REGISTRY_CORRECTION_SAVE_FAILED', 'ERROR', 'error', false);
    } finally {
      this.savingSubmodelIds.update((ids) => ids.filter((id) => id !== submodelId));
    }
  }

  displayLocalizedTexts(entries: RegistryLocalizedText[] | undefined) {
    return (entries ?? [])
      .map((entry) => `${entry.language ?? '-'}: ${entry.text ?? ''}`)
      .filter((entry) => entry.trim() !== '');
  }

  getEndpoints(descriptor: { endpoints?: RegistryEndpoint[] } | null | undefined) {
    return descriptor?.endpoints ?? [];
  }

  endpointHref(endpoint: RegistryEndpoint) {
    return endpoint.protocolInformation?.href ?? '';
  }

  endpointProtocol(endpoint: RegistryEndpoint) {
    return endpoint.protocolInformation?.endpointProtocol ?? '';
  }

  endpointTitle(endpoint: RegistryEndpoint, index: number) {
    return endpoint.interface || endpoint.protocolInformation?.href || `Endpoint ${index + 1}`;
  }

  administrationValue(
    descriptor: RegistryAasDescriptor | RegistrySubmodelDescriptor | null | undefined,
    key: 'version' | 'revision' | 'templateId',
  ) {
    return descriptor?.administration?.[key] ?? '';
  }

  submodelDescriptor(submodelId: string) {
    return this.submodelDescriptors()[submodelId] ?? null;
  }

  submodelDraft(submodelId: string) {
    return this.submodelDrafts()[submodelId] ?? null;
  }

  submodelDraftJsonValue(submodelId: string) {
    return this.submodelDraftJson()[submodelId] ?? '';
  }

  submodelDraftError(submodelId: string) {
    return this.submodelDraftErrors()[submodelId] ?? null;
  }

  submodelExpandedPanels(submodelId: string) {
    return this.submodelExpandedEndpointPanels()[submodelId] ?? [];
  }

  private async loadAasDescriptor(preferredSelectedKey?: string) {
    try {
      this.loading.set(true);
      const descriptor = await this.registryCorrectionService.getAasDescriptor(this.aasId);
      this.aasDescriptor.set(descriptor);

      const validSelectedKey =
        preferredSelectedKey ??
        (this.isValidSelection(this.selectedNodeKey(), descriptor.submodelDescriptors ?? [])
          ? this.selectedNodeKey()
          : 'aas');
      this.selectedNodeKey.set(validSelectedKey);

      const validSubmodelIds = new Set((descriptor.submodelDescriptors ?? []).map((item) => item.id).filter(Boolean));
      this.submodelDescriptors.update((current) =>
        Object.fromEntries(Object.entries(current).filter(([key]) => validSubmodelIds.has(key))),
      );

      const selectedSubmodelId = this.extractSubmodelIdFromKey(validSelectedKey);
      if (selectedSubmodelId && this.submodelDescriptors()[selectedSubmodelId] == null) {
        await this.loadSubmodelDescriptor(selectedSubmodelId);
      }
    } catch {
      this.notificationService.showMessageAlways('REGISTRY_CORRECTION_LOAD_FAILED', 'ERROR', 'error', false);
      await this.router.navigate(buildShellsListRoute());
    } finally {
      this.loading.set(false);
    }
  }

  private async loadSubmodelDescriptor(submodelId: string) {
    this.loadingSubmodelIds.update((ids) => [...ids, submodelId]);

    try {
      const descriptor = await this.registryCorrectionService.getSubmodelDescriptor(submodelId);
      this.submodelDescriptors.update((map) => ({ ...map, [submodelId]: descriptor }));
    } catch {
      const fallbackDescriptor = this.findNestedSubmodelDescriptor(submodelId);
      if (fallbackDescriptor) {
        this.submodelDescriptors.update((map) => ({ ...map, [submodelId]: fallbackDescriptor }));
      } else {
        this.notificationService.showMessageAlways('REGISTRY_CORRECTION_LOAD_FAILED', 'ERROR', 'error', false);
      }
    } finally {
      this.loadingSubmodelIds.update((ids) => ids.filter((id) => id !== submodelId));
    }
  }

  private findNestedSubmodelDescriptor(submodelId: string) {
    const descriptor = this.aasDescriptor()?.submodelDescriptors?.find((item) => item.id === submodelId);
    return descriptor ? this.cloneDescriptor(descriptor) : null;
  }

  private buildSubmodelKey(submodelId: string | undefined) {
    return `submodel:${submodelId ?? ''}`;
  }

  private extractSubmodelIdFromKey(selectedKey: string) {
    if (!selectedKey.startsWith('submodel:')) {
      return null;
    }

    const submodelId = selectedKey.replace('submodel:', '');
    return submodelId !== '' ? submodelId : null;
  }

  private isValidSelection(selectedKey: string, submodels: RegistrySubmodelDescriptor[]) {
    if (selectedKey === 'aas') {
      return true;
    }

    const submodelId = this.extractSubmodelIdFromKey(selectedKey);
    return submodelId != null && submodels.some((item) => item.id === submodelId);
  }

  private cancelEditingOnSelectionChange() {
    if (this.editingAas()) {
      this.cancelEditAas();
    }

    const editingSubmodelId = this.editingSubmodelId();
    if (editingSubmodelId) {
      this.cancelEditSubmodel(editingSubmodelId);
    }
  }

  private applyAasDraft(draft: RegistryAasDescriptor) {
    this.aasDraft.set(draft);
    this.aasDraftJson.set(this.stringifyDescriptor(draft));
    this.aasDraftJsonError.set(null);
  }

  private applySubmodelDraft(submodelId: string, draft: RegistrySubmodelDescriptor) {
    this.submodelDrafts.update((drafts) => ({ ...drafts, [submodelId]: draft }));
    this.submodelDraftJson.update((jsonMap) => ({ ...jsonMap, [submodelId]: this.stringifyDescriptor(draft) }));
    this.submodelDraftErrors.update((errors) => ({ ...errors, [submodelId]: null }));
  }

  private ensureEndpoint(descriptor: { endpoints?: RegistryEndpoint[] }, index: number) {
    if (!descriptor.endpoints) {
      descriptor.endpoints = [];
    }

    while (descriptor.endpoints.length <= index) {
      descriptor.endpoints.push({
        interface: '',
        protocolInformation: {
          href: '',
          endpointProtocol: '',
        },
      });
    }

    return descriptor.endpoints[index];
  }

  private stringifyDescriptor(descriptor: RegistryAasDescriptor | RegistrySubmodelDescriptor) {
    return JSON.stringify(descriptor, null, 2);
  }

  private buildExpandedEndpointPanels(descriptor: { endpoints?: RegistryEndpoint[] } | null | undefined) {
    return this.getEndpoints(descriptor).map((_, index) => index);
  }

  private normalizeAccordionValue(value: string | number | string[] | number[] | null | undefined) {
    if (Array.isArray(value)) {
      return value
        .map((entry) => (typeof entry === 'string' ? Number(entry) : entry))
        .filter((entry) => Number.isFinite(entry));
    }

    if (value == null) {
      return [];
    }

    const normalized = typeof value === 'string' ? Number(value) : value;
    return Number.isFinite(normalized) ? [normalized] : [];
  }

  private parseDescriptor<T extends RegistryAasDescriptor | RegistrySubmodelDescriptor>(value: string) {
    return JSON.parse(value) as T;
  }

  private cloneDescriptor<T extends RegistryAasDescriptor | RegistrySubmodelDescriptor>(descriptor: T) {
    return JSON.parse(JSON.stringify(descriptor)) as T;
  }
}
