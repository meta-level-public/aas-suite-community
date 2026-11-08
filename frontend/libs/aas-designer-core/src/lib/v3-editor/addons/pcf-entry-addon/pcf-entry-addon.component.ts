import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { NotificationService } from '@aas/common-services';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BatteryPassportAssistantService, DppPcfEntry, DppPcfEntryType } from 'battery-passport-assistant';
import { DynamicDialogConfig, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { PcfEntryAssistantComponent } from '../../../general/pcf-entry-assistant/pcf-entry-assistant.component';
import { PcfEntryMapperService } from '../../../general/pcf-entry-assistant/pcf-entry-mapper.service';

@Component({
  selector: 'aas-pcf-entry-addon',
  imports: [CommonModule, TranslateModule, PcfEntryAssistantComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './pcf-entry-addon.component.html',
})
export class PcfEntryAddonComponent implements OnInit {
  private readonly config = inject(DynamicDialogConfig);
  private readonly ref = inject(DynamicDialogRef);
  private readonly batteryPassportAssistantService = inject(BatteryPassportAssistantService);
  private readonly mapper = inject(PcfEntryMapperService);
  private readonly notificationService = inject(NotificationService);

  loading = true;
  entry: DppPcfEntry | null = null;
  templateSubmodels: aas.types.Submodel[] = [];
  templateConceptDescriptions: aas.types.ConceptDescription[] = [];

  async ngOnInit() {
    const entryType = this.config.data?.entryType as DppPcfEntryType | undefined;
    if (entryType == null) {
      this.ref.close(null);
      return;
    }

    let bundle: Awaited<ReturnType<BatteryPassportAssistantService['loadDppPcfTemplate']>>;
    try {
      bundle = await this.batteryPassportAssistantService.loadDppPcfTemplate();
    } catch {
      this.notificationService.showMessageAlways('ERROR_LOADING_DATA', 'ERROR', 'error', true);
      this.ref.close(null);
      return;
    }
    this.templateSubmodels = bundle.v3Submodels;
    this.templateConceptDescriptions = bundle.v3ConceptDescriptions;

    const existingElement = this.config.data?.existingElement as aas.types.SubmodelElementCollection | undefined;
    const entryIndex = this.config.data?.entryIndex ?? 0;
    this.entry =
      existingElement != null
        ? this.mapper.readEntry(entryType, existingElement, entryIndex)
        : this.mapper.createEmptyEntry(entryType);
    this.loading = false;
  }

  apply(entry: DppPcfEntry) {
    this.ref.close(entry);
  }

  cancel() {
    this.ref.close(null);
  }
}
