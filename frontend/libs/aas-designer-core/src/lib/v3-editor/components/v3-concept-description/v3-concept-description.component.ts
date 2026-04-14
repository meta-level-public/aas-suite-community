import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HelpLabelComponent } from '@aas/common-components';
import { DataspecificationIec61360Helper } from '@aas/helpers';
import { EClassItem, ShellResult } from '@aas/model';
import { NgClass } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, viewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Fieldset } from 'primeng/fieldset';
import { Message } from 'primeng/message';
import { Info } from '../../../general/model/info-item';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3AdministrationComponent } from '../v3-administration/v3-administration.component';
import { V3ComponentBase } from '../v3-component-base';
import { V3EmbeddedDataSpecificationComponent } from '../v3-embedded-data-specification/v3-embedded-data-specification.component';
import { V3IdShortComponent } from '../v3-id-short/v3-id-short.component';
import { V3IdComponent } from '../v3-id/v3-id.component';
import { V3LangStringListComponent } from '../v3-lang-string-list/v3-lang-string-list.component';
import { V3ReferenceComponent } from '../v3-reference/v3-reference.component';

@Component({
  selector: 'aas-v3-concept-description',
  templateUrl: './v3-concept-description.component.html',
  imports: [
    Fieldset,
    HelpLabelComponent,
    V3IdComponent,
    V3IdShortComponent,
    V3LangStringListComponent,
    NgClass,
    V3AdministrationComponent,
    V3ReferenceComponent,
    Message,
    V3EmbeddedDataSpecificationComponent,
    TranslateModule,
  ],
})
export class V3ConceptDescriptionComponent extends V3ComponentBase implements OnChanges {
  @Input({ required: true }) conceptDescription: V3TreeItem<aas.types.ConceptDescription> | undefined | null;
  @Input({ required: true }) shellResult: ShellResult | undefined;
  info = Info;
  adminCollapsed: boolean = true;
  caseOfCollapsed: boolean = true;
  dataSpecComponent = viewChild<V3EmbeddedDataSpecificationComponent>('dataSpecComponent');

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.hasAdministrationErrors) {
      this.adminCollapsed = false;
    } else {
      this.adminCollapsed = true;
    }
  }
  get hasDefinitionErrors() {
    const errors = [];
    if (this.conceptDescription?.content?.embeddedDataSpecifications != null) {
      this.conceptDescription.content.embeddedDataSpecifications?.forEach((eds) => {
        for (const error of aas.verification.verify(eds) ?? []) {
          errors.push(error);
        }
      });
    }

    return errors.length > 0;
  }
  get hasAdministrationErrors() {
    const errors = [];
    if (this.conceptDescription?.content?.administration) {
      for (const error of aas.verification.verify(this.conceptDescription.content.administration)) {
        errors.push(error);
      }
    }

    return errors.length > 0;
  }

  get hasCaseOfErrors() {
    return this.caseOfErrors.length > 0;
  }

  get caseOfErrors() {
    const errors: any[] = [];
    if (this.conceptDescription?.content?.isCaseOf) {
      this.conceptDescription.content.isCaseOf.forEach((caseOf) => {
        for (const error of aas.verification.verify(caseOf)) {
          errors.push(error);
        }
      });
    }

    return errors;
  }

  eclassLoaded(item: EClassItem) {
    if (this.conceptDescription?.content != null && this.dataSpecComponent != null) {
      if (this.conceptDescription.content.embeddedDataSpecifications == null) {
        this.dataSpecComponent()?.addDataSpecification();
      }

      const prefDe = item.preferredName['de-DE'];
      const prefEn = item.preferredName['en-US'];

      const defDe = item.fullItem.definition['de-DE'];
      const defEn = item.fullItem.definition['en-US'];

      const cd = this.conceptDescription.content;
      cd.displayName = [];
      if (prefDe != null) {
        cd.displayName.push(new aas.types.LangStringTextType('de', prefDe));
      }
      if (prefEn != null) {
        cd.displayName.push(new aas.types.LangStringTextType('en', prefEn));
      }
      cd.description = [];
      if (defDe != null) {
        cd.description.push(new aas.types.LangStringTextType('de', defDe));
      }
      if (defEn != null) {
        cd.description.push(new aas.types.LangStringTextType('en', defEn));
      }

      cd.id = item.irdi;
      cd.idShort = item.benennung ?? item.irdi;

      const dataspec = this.conceptDescription?.content?.embeddedDataSpecifications?.[0];
      if (dataspec?.dataSpecificationContent != null) {
        DataspecificationIec61360Helper.applyEclassToSpec(
          dataspec.dataSpecificationContent as aas.types.DataSpecificationIec61360,
          item,
        );
      }
    }
  }

  vecLoaded(item: any) {
    if (this.conceptDescription?.content != null && this.dataSpecComponent != null) {
      if (this.conceptDescription.content.embeddedDataSpecifications == null) {
        this.dataSpecComponent()?.addDataSpecification();
      }

      const label = this.getEnValue(item.label);
      const definition = this.getEnValue(item.comment);
      const cd = this.conceptDescription.content;

      cd.displayName = [new aas.types.LangStringTextType('en', label)];
      cd.description = [new aas.types.LangStringTextType('en', definition)];

      cd.idShort = item.shortGroupName;
      cd.id = item.groupName;

      const dataspec = this.conceptDescription?.content?.embeddedDataSpecifications?.[0];
      if (dataspec?.dataSpecificationContent != null) {
        DataspecificationIec61360Helper.applyVecToSpec(
          dataspec.dataSpecificationContent as aas.types.DataSpecificationIec61360,
          item,
        );
      }
    }
  }

  getEnValue(items: { label: string; lang: string }[]) {
    let value = '';

    value = items.find((i) => i.lang === 'en')?.label ?? items[0]?.label ?? '';

    return value;
  }
}
