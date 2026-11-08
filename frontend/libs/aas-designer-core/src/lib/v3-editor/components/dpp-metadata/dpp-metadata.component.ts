import { NotificationService } from '@aas/common-services';
import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '@openng/optimus-ui/button';
import { Checkbox } from '@openng/optimus-ui/checkbox';
import { Dialog } from '@openng/optimus-ui/dialog';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Select } from '@openng/optimus-ui/select';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { DPP_GRANULARITY_OPTIONS, DPP_STATUS_OPTIONS, DppStatus } from './dpp-metadata-options';

export interface DppSubmodelOption {
  id: string;
  name: string;
  semanticId: string | null;
}

interface DppMetadataSettings {
  uniqueProductIdentifier: string | null;
  granularity: string | null;
  dppSchemaVersion: string | null;
  dppStatus: DppStatus | null;
  economicOperatorId: string | null;
  facilityId: string | null;
  contentSpecificationIds: string[];
  publicUrl: string | null;
}

interface DppReadinessResult {
  ready: boolean;
  dppAccessible: boolean;
  issues: { severity: 'error' | 'warning'; code: string; message: string }[];
}

@Component({
  selector: 'aas-dpp-metadata',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    Checkbox,
    Dialog,
    InputGroup,
    InputGroupAddon,
    InputText,
    Select,
    Tooltip,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './dpp-metadata.component.html',
})
export class DppMetadataComponent {
  private readonly http = inject(HttpClient);
  private readonly clipboard = inject(Clipboard);
  private readonly notificationService = inject(NotificationService);
  private readonly translate = inject(TranslateService);

  aasId = input.required<string>();
  editable = input(false);
  productIdHint = input('');
  submodels = input<DppSubmodelOption[]>([]);
  created = output<void>();
  status = signal<'checking' | 'missing' | 'existing' | 'unavailable'>('checking');
  dialogVisible = false;
  saving = false;
  error = '';
  productId = '';
  granularity = 'Item';
  schemaVersion = '';
  dppStatus: DppStatus = 'Draft';
  economicOperatorId = '';
  facilityId = '';
  selectedSubmodelIds = new Set<string>();
  private currentMetadata: DppMetadataSettings | null = null;
  readinessVisible = false;
  readinessLoading = false;
  readinessError = '';
  readinessResult: DppReadinessResult | null = null;
  publicUrl = signal<string | null>(null);
  readonly granularityOptions = DPP_GRANULARITY_OPTIONS;
  readonly statusOptions = DPP_STATUS_OPTIONS;

  candidateCount = computed(
    () =>
      this.submodels().filter((submodel) => {
        const semanticId = submodel.semanticId?.toLowerCase() ?? '';
        return semanticId.includes('/digitalbatterypassport/') || semanticId.includes('idta-02035');
      }).length,
  );

  selectableSubmodels = computed(() =>
    this.submodels().filter((submodel) => submodel.name.toLowerCase() !== 'aasdesignerchangelog'),
  );

  constructor() {
    effect(() => {
      const id = this.aasId();
      if (id) void this.checkStatus(id);
    });
  }

  private async checkStatus(id: string): Promise<void> {
    this.status.set('checking');
    try {
      const metadata = await firstValueFrom(
        this.http.get<DppMetadataSettings>('/aas-proxy/dpp/metadata', {
          params: { aasId: id },
          withCredentials: true,
        }),
      );
      if (this.aasId() === id) {
        this.currentMetadata = metadata;
        this.publicUrl.set(metadata.publicUrl || null);
        this.status.set('existing');
      }
    } catch (error) {
      const response = error as HttpErrorResponse;
      if (this.aasId() === id) {
        this.currentMetadata = null;
        this.publicUrl.set(null);
        this.status.set(response.status === 404 ? 'missing' : 'unavailable');
      }
    }
  }

  openDialog(): void {
    this.error = '';
    const metadata = this.currentMetadata;
    this.productId = metadata?.uniqueProductIdentifier || this.productIdHint();
    this.granularity = metadata?.granularity || 'Item';
    this.schemaVersion = metadata?.dppSchemaVersion || '';
    this.dppStatus = metadata?.dppStatus || 'Draft';
    this.economicOperatorId = metadata?.economicOperatorId || '';
    this.facilityId = metadata?.facilityId || '';
    const selected = new Set(
      metadata?.contentSpecificationIds ??
        this.selectableSubmodels()
          .map((submodel) => submodel.semanticId)
          .filter((semanticId): semanticId is string => !!semanticId),
    );
    this.selectedSubmodelIds = new Set(
      this.selectableSubmodels()
        .filter((submodel) => submodel.semanticId && selected.has(submodel.semanticId))
        .map((submodel) => submodel.id),
    );
    this.dialogVisible = true;
  }

  copyPublicUrl(): void {
    const url = this.publicUrl();
    if (!url) return;
    this.clipboard.copy(url);
    this.notificationService.showMessageAlways('LINK_COPIED', 'SUCCESS', 'success', false);
  }

  setSubmodelSelected(id: string, selected: boolean): void {
    const next = new Set(this.selectedSubmodelIds);
    if (selected) next.add(id);
    else next.delete(id);
    this.selectedSubmodelIds = next;
  }

  async checkReadiness(): Promise<void> {
    this.readinessVisible = true;
    this.readinessLoading = true;
    this.readinessError = '';
    this.readinessResult = null;
    try {
      this.readinessResult = await firstValueFrom(
        this.http.get<DppReadinessResult>('/aas-proxy/dpp/metadata/readiness', {
          params: { aasId: this.aasId() },
          withCredentials: true,
        }),
      );
    } catch (error) {
      const response = error as HttpErrorResponse;
      this.readinessError =
        typeof response.error === 'string' ? response.error : this.translate.instant('DPP_READINESS_CHECK_FAILED');
    } finally {
      this.readinessLoading = false;
    }
  }

  async save(): Promise<void> {
    if (!this.productId.trim() || !this.schemaVersion.trim() || !this.economicOperatorId.trim()) return;
    this.saving = true;
    this.error = '';
    try {
      await firstValueFrom(this.http.get('/bff/csrf', { responseType: 'text', withCredentials: true }));
      const body = {
        aasId: this.aasId(),
        uniqueProductIdentifier: this.productId.trim(),
        granularity: this.granularity,
        dppSchemaVersion: this.schemaVersion.trim(),
        dppStatus: this.dppStatus,
        economicOperatorId: this.economicOperatorId.trim(),
        facilityId: this.facilityId.trim() || null,
        contentSpecificationIds: [
          ...new Set(
            this.selectableSubmodels()
              .filter((submodel) => this.selectedSubmodelIds.has(submodel.id))
              .map((submodel) => submodel.semanticId)
              .filter((id): id is string => !!id),
          ),
        ],
      };
      if (this.status() === 'existing')
        await firstValueFrom(this.http.put('/aas-proxy/dpp/metadata', body, { withCredentials: true }));
      else await firstValueFrom(this.http.post('/aas-proxy/dpp/metadata', body, { withCredentials: true }));
      this.dialogVisible = false;
      this.readinessResult = null;
      await this.checkStatus(this.aasId());
      this.created.emit();
    } catch (error) {
      const response = error as HttpErrorResponse;
      this.error =
        typeof response.error === 'string' ? response.error : this.translate.instant('DPP_METADATA_SAVE_FAILED');
    } finally {
      this.saving = false;
    }
  }
}
