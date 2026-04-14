import { InfoItem } from '@aas-designer-model';
import { LanguageService } from '@aas/aas-designer-shared';
import { PortalService } from '@aas/common-services';
import { ConceptDescription } from '@aas/model';
import { Component, Input, ViewChild } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Popover } from 'primeng/popover';
import { GeneratorService } from '../../generator/generator.service';
import { EclassExplanationService } from './help-explanation.service';

import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { EClassLogoComponent } from '../eclass-logo/eclass-logo.component';
@Component({
  selector: 'aas-help-explanation',
  templateUrl: './help-explanation.component.html',
  imports: [Popover, Skeleton, EClassLogoComponent, Button, TranslateModule],
})
export class HelpExplanationComponent {
  @Input() infoItem: InfoItem | undefined;
  @Input() semanticId: string | undefined;
  @ViewChild('op') op: Popover | undefined;
  loading: boolean = false;

  dataItem: ConceptDescription | undefined;

  constructor(
    private eclassService: EclassExplanationService,
    private generatorService: GeneratorService,
    private translate: TranslateService,
    public languageService: LanguageService,
    private portalService: PortalService,
  ) {}

  async loadData(event: any) {
    this.dataItem = undefined;
    if (this.semanticId != null && this.semanticId !== '') {
      // in concept description suchen
    }

    if (this.infoItem?.irdi != null && this.infoItem?.irdi !== '') {
      await this.loadIrdiData(this.infoItem.irdi, event);
      if (this.dataItem == null) {
        const cd = this.generatorService.findCurrentGeneratorConceptDescription(this.infoItem?.irdi);
        this.dataItem = cd;
      }
    }
    if (this.infoItem?.iri != null && this.infoItem?.iri !== '' && this.dataItem == null) {
      const cd = this.generatorService.findCurrentGeneratorConceptDescription(this.infoItem?.irdi);
      if (cd == null) {
        // TODO: daten besorgen
        this.dataItem = new ConceptDescription();
        this.dataItem.identification.idType = 'IRI';
        this.dataItem.identification.id = this.infoItem.iri;
      } else {
        this.dataItem = cd;
      }
    }
    if (this.infoItem?.custom != null && this.infoItem?.custom !== '' && this.dataItem == null) {
      const cd = this.generatorService.findCurrentGeneratorConceptDescription(this.infoItem?.irdi, false);
      if (cd == null) {
        this.dataItem = new ConceptDescription();
        this.dataItem.identification.id = this.infoItem.custom;
        this.dataItem.identification.idType = 'Custom';
        this.dataItem.embeddedDataSpecifications[0].dataSpecificationContent.preferredName = [
          {
            language: 'de',
            text: this.translate.instant(this.infoItem.custom),
          },
        ];
        this.dataItem.embeddedDataSpecifications[0].dataSpecificationContent.definition = [
          {
            language: 'de',
            text: this.translate.instant(`${this.infoItem.custom}_EXPL`),
          },
        ];
      } else {
        this.dataItem = cd;
      }
    }
    if (this.op != null) this.op.show(event);
  }

  async loadIrdi(irdi: string, event: any) {
    try {
      if (this.op != null) this.op.show(event);
      this.loading = true;
      const eclassItem = await this.eclassService.getEclassData(irdi, this.portalService.currentLanguage);
      this.dataItem = ConceptDescription.fromEclass(eclassItem);
    } catch {
      this.dataItem = new ConceptDescription();
      this.dataItem.identification.id = irdi;
      this.dataItem.identification.idType = 'IRDI';
    } finally {
      this.loading = false;
    }
  }

  async loadIrdiData(irdi: string, event: any) {
    try {
      if (this.op != null) this.op.show(event);
      this.loading = true;
      const eclassItem = await this.eclassService.getEclassData(irdi, this.portalService.getLanguage());
      this.dataItem = ConceptDescription.fromEclass(eclassItem);
    } catch {
      this.dataItem = new ConceptDescription();
      this.dataItem.identification.id = irdi;
      this.dataItem.identification.idType = 'IRDI';
    } finally {
      this.loading = false;
    }
  }
}
