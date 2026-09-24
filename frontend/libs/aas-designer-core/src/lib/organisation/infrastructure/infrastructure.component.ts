import { AasConfirmationService, AccessService, NotificationService, PortalService } from '@aas/common-services';
import {
  AasInfrastructureClient,
  AasInfrastructureSettingsDto,
  DppFieldConditionDto,
  DppAccessRuleDto,
  DppAccessPolicyDto,
  AvailableInfastructure,
  OrganisationClient,
  SystemConfigurationDto,
  SystemManagementClient,
} from '@aas/webapi-client';
import { Component, computed, ElementRef, inject, OnInit, output, signal, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { lastValueFrom } from 'rxjs';
import { InfrastrukturRechteComponent } from '../infrastruktur-rechte/infrastruktur-rechte.component';
import { HasChangesCheckable } from '../my-organisation/has-changes-checkable';
import { OrganisationStateService } from '../organisation-state.service';
import { InfrastructureEditComponent } from './infrastructure-edit/infrastructure-edit.component';
import { InfrastructureListComponent } from './infrastructure-list/infrastructure-list.component';
import { InfrastructureMigrateGoComponent } from './infrastructure-migrate-go/infrastructure-migrate-go.component';
import { InfrastructureUpdateVersionsComponent } from './infrastructure-update-versions/infrastructure-update-versions.component';

@Component({
  selector: 'aas-infrastructure',
  imports: [
    TableModule,
    Tabs,
    TabList,
    Tab,
    TextareaModule,
    TranslateModule,
    TagModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    FormsModule,
    InfrastrukturRechteComponent,
    InfrastructureEditComponent,
    InfrastructureListComponent,
    InfrastructureUpdateVersionsComponent,
    InfrastructureMigrateGoComponent,
  ],
  templateUrl: './infrastructure.component.html',
  styleUrls: ['../../../host.scss'],
  providers: [{ provide: HasChangesCheckable, useExisting: InfrastructureComponent }],
})
export class InfrastructureComponent extends HasChangesCheckable implements OnInit {
  organisationClient = inject(OrganisationClient);
  confirmationService = inject(AasConfirmationService);
  translate = inject(TranslateService);
  accessService = inject(AccessService);
  notificationService = inject(NotificationService);
  infrastructureClient = inject(AasInfrastructureClient);
  http = inject(HttpClient);
  systemManagementClient = inject(SystemManagementClient);
  orgaStateService = inject(OrganisationStateService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  loading = signal<boolean>(false);
  policyDialogVisible = signal(false);
  policyLoading = signal(false);
  policySaving = signal(false);
  semanticIdsLoading = signal(false);
  availableSemanticIds = signal<{ label: string; value: string }[]>([]);
  policyEditorMode = signal<'visual' | 'expert'>('visual');
  rawPolicyJson = signal('');
  rawPolicyError = computed(() => {
    if (this.policyEditorMode() !== 'expert') return '';
    try {
      const policy = JSON.parse(this.rawPolicyJson());
      return policy?.AllAccessPermissionRules && typeof policy.AllAccessPermissionRules === 'object'
        ? ''
        : 'DPP_EXPERT_POLICY_ROOT_ERROR';
    } catch {
      return 'DPP_EXPERT_POLICY_JSON_ERROR';
    }
  });
  policyRules = signal<DppAccessRuleDto[]>([]);
  policyValid = computed(() =>
    this.policyEditorMode() === 'expert'
      ? !this.rawPolicyError()
      : this.policyRules().every(
          (rule) =>
            (rule.role === 'anonymous' || /^[\p{L}\p{N}._-]+$/u.test(rule.role?.trim() ?? '')) &&
            (rule.dppConditions ?? []).every((condition) => condition.value?.trim()),
        ),
  );
  readonly policyConditionCombinations = ['All', 'Any'];
  readonly policyConditionOperators = ['Equal', 'NotEqual', 'Contains', 'StartsWith', 'EndsWith', 'Regex'];
  readonly policyDppFields = [
    'digitalProductPassportId',
    'uniqueProductIdentifier',
    'granularity',
    'dppSchemaVersion',
    'dppStatus',
    'economicOperatorId',
    'facilityId',
  ];
  mode = signal<'list' | 'edit' | 'updateVersions'>('list');
  requestReload = output();
  allInfrastructures = signal<AvailableInfastructure[]>([]);
  settingsBackup = computed(() => {
    return JSON.stringify(this.settings());
  });
  settings = signal<AasInfrastructureSettingsDto | undefined>(undefined);
  selectedInfrastructure = signal<AvailableInfastructure | undefined>(undefined);
  systemConfiguration = signal<SystemConfigurationDto | null>(null);
  @ViewChild('editComponent') editComponent: InfrastructureEditComponent | undefined;
  @ViewChild('updateVersionsComponent') updateVersionsComponent: InfrastructureUpdateVersionsComponent | undefined;
  @ViewChild('contentScroll') contentScroll: ElementRef<HTMLDivElement> | undefined;
  reloadInfrastuctureList = output();

  async ngOnInit() {
    this.systemConfiguration.set(await lastValueFrom(this.systemManagementClient.systemManagement_GetConfiguration()));

    // Get infrastructure ID from route
    this.route.params.subscribe(async (params) => {
      const id = parseInt(params['id']);
      if (id) {
        // Load infrastructure details by ID
        const allInfrastructures = await lastValueFrom(
          this.infrastructureClient.aasInfrastructure_GetAllSavedInfrastructures(),
        );
        this.allInfrastructures.set(allInfrastructures);
        const infrastructure = allInfrastructures.find((i) => i.id === id);
        if (infrastructure) {
          this.selectedInfrastructure.set(infrastructure);
          await this.loadSettings();
        }
      }
    });
  }

  canManageInternalInfrastructure(): boolean {
    return this.settings()?.isInternal === true && this.systemConfiguration()?.singleTenantMode === false;
  }

  startEditing() {
    this.mode.set('edit');
    this.scrollToTop();
  }

  async loadSettings() {
    try {
      this.loading.set(true);
      const res = await lastValueFrom(
        this.infrastructureClient.aasInfrastructure_GetInfrastructureDetails(this.selectedInfrastructure()?.id),
      );
      if (res) {
        this.settings.set(res);
      }
    } finally {
      this.loading.set(false);
    }
  }

  async cancelEditing(force = false) {
    if (this.hasChanges() && !force) {
      if (
        await this.confirmationService.confirm({
          message: this.translate.instant('WOULD_YOU_LIKE_TO_CONTINUE_WITHOUT_SAVING'),
        })
      ) {
        this.loadSettings();
        this.mode.set('list');
        this.scrollToTop();
      }
    } else {
      this.mode.set('list');
      this.scrollToTop();
    }
  }

  private scrollToTop() {
    queueMicrotask(() => {
      this.contentScroll?.nativeElement?.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  async save() {
    if (this.mode() !== 'updateVersions') {
      const settings = this.settings();
      if (settings != null && !settings.name?.trim()) {
        this.notificationService.showMessageAlways('REQUIRED_FIELD', 'NAME', 'warn', false);
        return;
      }
      try {
        this.loading.set(true);
        const myOrgaId = PortalService.getCurrentOrgaId();
        if (myOrgaId) {
          if (settings != null) {
            const res = await lastValueFrom(this.infrastructureClient.aasInfrastructure_UpdateInfrastructure(settings));
            if (res) {
              this.loadSettings();
              this.orgaStateService.requestInfrastructureTreeReload();
              this.reloadInfrastuctureList.emit();
            }
          }
        }
        this.mode.set('list');
        this.scrollToTop();
        this.requestReload.emit();
      } finally {
        this.loading.set(false);
      }
    } else {
      if (
        await this.confirmationService.confirm({
          message: this.translate.instant('RECREATE_INFRASTRUCTURE_Q'),
        })
      ) {
        const settings = this.settings();
        if (settings != null) {
          try {
            this.loading.set(true);

            if (this.updateVersionsComponent?.selectedDiscovery() != null) {
              settings.aasDiscoveryVersion = this.updateVersionsComponent?.selectedDiscovery();
            }

            if (this.updateVersionsComponent?.selectedAasReg() != null) {
              settings.aasRegistryVersion = this.updateVersionsComponent?.selectedAasReg();
            }

            if (this.updateVersionsComponent?.selectedSmReg() != null) {
              settings.submodelRegistryVersion = this.updateVersionsComponent?.selectedSmReg();
            }

            if (this.updateVersionsComponent?.selectedEnv() != null) {
              settings.aasRepositoryVersion = this.updateVersionsComponent?.selectedEnv();
              settings.submodelRepositoryVersion = this.updateVersionsComponent?.selectedEnv();
              settings.conceptDescriptionRepositoryVersion = this.updateVersionsComponent?.selectedEnv();
            }

            await lastValueFrom(this.infrastructureClient.aasInfrastructure_UpdateInternalInfrastructure(settings));
            this.mode.set('list');
            this.scrollToTop();
            this.requestReload.emit();
          } finally {
            this.loading.set(false);
          }
        }
      }
    }
  }

  override hasChanges() {
    const hasChanges =
      this.settingsBackup() !== JSON.stringify(this.settings()) ||
      (this.mode() === 'updateVersions' && this.updateVersionsComponent?.hasChanges());

    return hasChanges ?? false;
  }

  override isInEditMode(): boolean {
    if (this.mode() === 'edit' || this.mode() === 'updateVersions') {
      return true;
    }
    return false;
  }

  async deleteInfrastructure() {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('DELETE_INFRASTRUCTURE_Q'),
      })
    ) {
      await lastValueFrom(
        this.infrastructureClient.aasInfrastructure_DeleteInfrastructure(this.selectedInfrastructure()?.id),
      );
      this.orgaStateService.requestInfrastructureTreeReload();
      this.reloadInfrastuctureList.emit();
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  async recreateInfrastructure() {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('RECREATE_INFRASTRUCTURE_Q'),
      })
    ) {
      const settings = this.settings();
      if (settings != null) {
        await lastValueFrom(this.infrastructureClient.aasInfrastructure_UpdateInternalInfrastructure(settings));
      }
    }
  }

  async deactivateInfrastructure() {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('DEACTIVATE_INFRASTRUCTURE_Q'),
      })
    ) {
      await lastValueFrom(
        this.infrastructureClient.aasInfrastructure_DisableInternalInfrastructure(this.selectedInfrastructure()?.id),
      );
      this.loadSettings();
    }
  }

  async activateInfrastructure() {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('ACTIVATE_INFRASTRUCTURE_Q'),
      })
    ) {
      await lastValueFrom(
        this.infrastructureClient.aasInfrastructure_EnableInternalInfrastructure(this.selectedInfrastructure()?.id),
      );
      this.loadSettings();
    }
  }

  startUpdatingVersions() {
    this.mode.set('updateVersions');
    this.scrollToTop();
  }

  async editDppAccessPolicy() {
    const id = this.settings()?.id;
    if (id == null) return;
    this.policyDialogVisible.set(true);
    this.policyLoading.set(true);
    void this.loadAvailableSemanticIds(id);
    try {
      const policy = await lastValueFrom(this.infrastructureClient.aasInfrastructure_GetDppAccessPolicy(id));
      const rules = (policy.rules ?? [])
        .filter((rule) => rule.role !== 'customer' && rule.role !== 'owner')
        .map((rule) => {
          rule.enabled = true;
          if (rule.role === 'viewer') rule.role = 'anonymous';
          rule.conditionCombination ??= 'All';
          rule.dppConditions ??= [];
          rule.visibleSemanticIds ??= [];
          if (rule.dppConditions.length === 0 && rule.dppScope === 'Selected') {
            rule.dppConditions = (rule.dppIds ?? []).map(
              (dppId) =>
                new DppFieldConditionDto({
                  field: 'digitalProductPassportId',
                  operator: 'Equal',
                  value: dppId,
                }),
            );
          }
          return rule;
        });
      if (!rules.some((rule) => rule.role === 'anonymous')) {
        rules.unshift(this.createPolicyRule('anonymous'));
      }
      if (!rules.some((rule) => rule.role !== 'anonymous')) {
        rules.push(this.createPolicyRule('partner'));
      }
      this.policyRules.set(rules);
      this.rawPolicyJson.set(policy.rawPolicyJson ?? '');
      this.policyEditorMode.set(policy.profile === 'Expert' ? 'expert' : 'visual');
    } catch (_error) {
      this.notificationService.showMessageAlways('COMMON_ERROR', 'ERROR', 'error', false);
    } finally {
      this.policyLoading.set(false);
    }
  }

  async saveDppAccessPolicy() {
    const id = this.settings()?.id;
    if (id == null) return;
    this.policySaving.set(true);
    try {
      const policy = new DppAccessPolicyDto({
        infrastructureId: id,
        profile: this.policyEditorMode() === 'expert' ? 'Expert' : 'Custom',
        rawPolicyJson: this.policyEditorMode() === 'expert' ? this.rawPolicyJson() : undefined,
        rules: this.policyRules(),
      });
      await lastValueFrom(this.infrastructureClient.aasInfrastructure_UpdateDppAccessPolicy(policy));
      this.notificationService.showMessageAlways('DPP_ACCESS_POLICY_SAVED', 'SUCCESS', 'success', false);
      this.policyDialogVisible.set(false);
    } finally {
      this.policySaving.set(false);
    }
  }

  addPolicyRule() {
    this.policyRules.update((rules) => [...rules, this.createPolicyRule('', rules.length + 1)]);
  }

  removePolicyRule(index: number) {
    this.policyRules.update((rules) => rules.filter((_, ruleIndex) => ruleIndex !== index));
  }

  markPolicyCustom() {}

  setPolicyEditorMode(mode: 'visual' | 'expert') {
    this.policyEditorMode.set(mode);
  }

  addDppCondition(rule: DppAccessRuleDto) {
    rule.dppConditions = [
      ...(rule.dppConditions ?? []),
      new DppFieldConditionDto({ field: 'digitalProductPassportId', operator: 'Equal', value: '' }),
    ];
    this.markPolicyCustom();
  }

  removeDppCondition(rule: DppAccessRuleDto, index: number) {
    rule.dppConditions = (rule.dppConditions ?? []).filter((_, conditionIndex) => conditionIndex !== index);
    this.markPolicyCustom();
  }

  semanticIdsText(rule: DppAccessRuleDto): string {
    return (rule.visibleSemanticIds ?? []).join('\n');
  }

  updateSemanticIds(rule: DppAccessRuleDto, value: string) {
    rule.visibleSemanticIds = value
      .split(/\r?\n/)
      .map((id) => id.trim())
      .filter(Boolean);
    this.markPolicyCustom();
  }

  private async loadAvailableSemanticIds(infrastructureId: number): Promise<void> {
    this.semanticIdsLoading.set(true);
    try {
      const response = await lastValueFrom(
        this.http.get<{ result?: unknown[] }>(`/aas-proxy/${infrastructureId}/sm-repo/submodels`, {
          params: { limit: 500 },
        }),
      );
      const options = (response.result ?? [])
        .map((item) => this.semanticIdOption(item))
        .filter((option): option is { label: string; value: string } => option !== null);
      this.availableSemanticIds.set(
        [...new Map(options.map((option) => [option.value, option])).values()].sort((a, b) =>
          a.label.localeCompare(b.label),
        ),
      );
    } catch {
      this.availableSemanticIds.set([]);
    } finally {
      this.semanticIdsLoading.set(false);
    }
  }

  private semanticIdOption(value: unknown): { label: string; value: string } | null {
    if (value === null || typeof value !== 'object') return null;
    const submodel = value as {
      idShort?: unknown;
      semanticId?: { keys?: { value?: unknown }[] };
    };
    if (typeof submodel.idShort === 'string' && submodel.idShort.trim().toLowerCase() === 'aasdesignerchangelog') {
      return null;
    }
    const keys = submodel.semanticId?.keys ?? [];
    const semanticId = [...keys]
      .reverse()
      .map((key) => key.value)
      .find((item): item is string => typeof item === 'string' && item.trim().length > 0);
    if (!semanticId || semanticId === 'https://admin-shell.io/idta/cds/dppMetadata/1') return null;
    const idShort =
      typeof submodel.idShort === 'string' && submodel.idShort.trim()
        ? submodel.idShort.trim()
        : this.translate.instant('DPP_SEMANTIC_ID_WITHOUT_ID_SHORT');
    return { label: `${idShort} - ${semanticId}`, value: semanticId };
  }

  private createPolicyRule(role: string, suffix?: number): DppAccessRuleDto {
    return new DppAccessRuleDto({
      name: `${role}_read${suffix ? `_${suffix}` : ''}`,
      role,
      enabled: true,
      dppScope: 'All',
      dppIds: [],
      conditionCombination: 'All',
      dppConditions: [],
      visibleSemanticIds: [],
      getById: true,
      getByProductId: true,
      getByIdAndDate: true,
      getByProductIds: true,
    });
  }
}
