import { SelectionCardComponent } from '@aas/aas-designer-shared';
import { PortalService } from '@aas/common-services';
import { ShellsClient } from '@aas/webapi-client';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  BatteryPassportAssistant,
  BatteryPassportAssistantService,
  DppCoreAssistant,
} from 'battery-passport-assistant';
import { FileUpload } from 'primeng/fileupload';
import { lastValueFrom } from 'rxjs';
import { GeneratorTemplateSource, getGeneratorModeConfig } from '../generator-mode.config';
import { GeneratorService } from '../generator.service';

@Component({
  selector: 'aas-select-type',
  templateUrl: './select-type.component.html',
  imports: [TranslateModule, BatteryPassportAssistant, DppCoreAssistant, SelectionCardComponent],
})
export class SelectTypeComponent implements OnInit {
  @ViewChild('uploader') uploader?: FileUpload;
  loading: boolean = false;

  indexing: boolean = false;
  uploadProgress: number = 0;
  displayUploadDialog: boolean = false;

  constructor(
    private router: Router,
    private generatorService: GeneratorService,
    private route: ActivatedRoute,
    private batteryPassportAssistantService: BatteryPassportAssistantService,
  ) {}

  async ngOnInit() {
    const id = +(this.route.snapshot.params['id'] ?? -1);
    if (id !== -1) {
      this.generatorService.vwsTyp = 'vorlage';
      this.loading = true;
      try {
        this.generatorService.importGeneratorStateSnapshot(await this.generatorService.getData(id));
      } finally {
        this.loading = false;
      }
      this.generatorService.currentId = id;
      this.generatorService.rebuildGeneratorFlow();

      this.nextPage('vorlage');
    }
  }

  shellsClient = inject(ShellsClient);

  async nextPage(typ: 'typ' | 'instanz' | 'vorlage' | 'aktiv' | 'unguided' | 'battery-passport' | 'dpp-core') {
    if (typ === 'unguided') {
      const res = await lastValueFrom(this.shellsClient.shells_Create());
      this.router.navigate(PortalService.buildRepoEditRoute(res.aasId ?? ''));
    } else {
      await this.startGuidedGenerator(typ);
    }
  }

  private async startGuidedGenerator(typ: 'typ' | 'instanz' | 'vorlage' | 'aktiv' | 'battery-passport' | 'dpp-core') {
    const config = getGeneratorModeConfig(typ);
    if (config == null) {
      return;
    }

    this.generatorService.resetGeneratorSessionState(config.sessionMode);

    if (config.bootstrapStrategy !== 'existing') {
      this.loading = true;
      try {
        await this.bootstrapGeneratorMode(config);
      } finally {
        this.loading = false;
      }
    }

    if (config.resetCurrentIdToDraft) {
      this.generatorService.currentId = -1;
    }

    this.generatorService.applyCurrentAasDefaults({
      assetKind: config.assetKind,
      initializeCurrentYear: config.initializeCurrentYear,
    });

    this.generatorService.rebuildGeneratorFlow();
    this.router.navigate(config.navigationCommands);
  }

  private async bootstrapGeneratorMode(config: NonNullable<ReturnType<typeof getGeneratorModeConfig>>) {
    if (config.bootstrapStrategy === 'standard' && config.bootstrapMode != null) {
      await this.generatorService.bootstrapStandardGenerator(config.bootstrapMode);
    } else if (
      config.bootstrapStrategy === 'template' &&
      config.bootstrapMode != null &&
      config.bootstrapTemplateSource != null
    ) {
      const templateBundle = await this.loadTemplateBundle(config.bootstrapTemplateSource);
      await this.generatorService.bootstrapTemplateGenerator(
        config.bootstrapMode,
        templateBundle.v3Submodels,
        templateBundle.v3ConceptDescriptions,
      );
    } else if (config.bootstrapStrategy === 'empty') {
      this.generatorService.importGeneratorStateSnapshot(
        await this.generatorService.getNewAas(config.sessionMode, config.withDocumentation ?? false),
      );
    }

    for (const templateSource of config.mergeTemplateSources ?? []) {
      const templateBundle = await this.loadTemplateBundle(templateSource);
      this.generatorService.mergeAdditionalTemplateBundle(
        templateBundle.v3Submodels,
        templateBundle.v3ConceptDescriptions,
      );
    }
  }

  private async loadTemplateBundle(templateSource: GeneratorTemplateSource) {
    if (templateSource === 'battery-passport') {
      return this.batteryPassportAssistantService.loadBatteryPassportTemplates();
    }

    if (templateSource === 'dpp-pcf') {
      return this.batteryPassportAssistantService.loadDppPcfTemplate();
    }

    return { v3Submodels: [], v3ConceptDescriptions: [] };
  }
}
