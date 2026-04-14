import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { HelpLabelComponent } from '@aas/common-components';
import { DataspecificationIec61360Helper } from '@aas/helpers';
import { EClassItem, ShellResult } from '@aas/model';
import { Component, Input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Ripple } from 'primeng/ripple';
import { Select } from 'primeng/select';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';
import { EClassLogoComponent } from '../../../general/eclass-logo/eclass-logo.component';
import { EclassSearchComponent } from '../../../general/eclass-search/eclass-search.component';
import { VecLogoComponent } from '../../../general/vec-logo/vec-logo.component';
import { AdditionalLookupSourcesComponent } from '../additional-lookup-sources/additional-lookup-sources.component';
import { DataSpecificationContentComponent } from '../data-specification-content/data-specification-content.component';
import { V3ComponentBase } from '../v3-component-base';
import { VecLookupComponent } from '../vec-lookup/vec-lookup.component';

@Component({
  selector: 'aas-v3-embedded-data-specification',
  templateUrl: './v3-embedded-data-specification.component.html',
  imports: [
    Button,
    Message,
    Accordion,
    AccordionPanel,
    Ripple,
    AccordionHeader,
    AccordionContent,
    HelpLabelComponent,
    Select,
    V3UndoDirective,
    FormsModule,
    InputGroup,
    InputText,
    InputGroupAddon,
    DataSpecificationContentComponent,
    Dialog,
    Tabs,
    TabList,
    Tab,
    EClassLogoComponent,
    VecLogoComponent,
    EclassSearchComponent,
    VecLookupComponent,
    AdditionalLookupSourcesComponent,
    TranslateModule,
  ],
})
export class V3EmbeddedDataSpecificationComponent extends V3ComponentBase {
  @Input({ required: true }) dataSpecification: aas.types.EmbeddedDataSpecification[] | undefined | null;
  @Input({ required: true }) dataSpecificationParent: any;
  @Input({ required: true }) shellResult: ShellResult | undefined | null;
  showEclassSearch: boolean = false;
  source = model('eclass');

  constructor() {
    super();
  }

  addDataSpecification() {
    if (this.dataSpecification == null && this.dataSpecificationParent != null) {
      this.dataSpecificationParent.embeddedDataSpecifications = [];
      this.dataSpecification = this.dataSpecificationParent.embeddedDataSpecifications;
    }

    const dataspec = new aas.types.EmbeddedDataSpecification(
      new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(
          aas.types.KeyTypes.GlobalReference,
          'http://admin-shell.io/DataSpecificationTemplates/DataSpecificationIEC61360/3/0',
        ),
      ]),
      new aas.types.DataSpecificationIec61360([new aas.types.LangStringTextType('en', '')]),
    );
    this.dataSpecification?.push(dataspec);
  }

  getDataSpecContent(spec: aas.types.EmbeddedDataSpecification) {
    return spec.dataSpecificationContent as aas.types.DataSpecificationIec61360;
  }

  removeDataSpecification(index: number) {
    if (this.dataSpecification != null && this.dataSpecificationParent != null) {
      this.dataSpecification.splice(index, 1);
    }
  }

  removeDataSpecificationBlock() {
    if (this.dataSpecification != null && this.dataSpecificationParent != null) {
      this.dataSpecificationParent.embeddedDataSpecifications = null;
      this.dataSpecification = null;
    }
  }

  openLink(link: string) {
    if (link != null && link !== '') window.open(link, '_blank');
  }

  dataspecItem: aas.types.EmbeddedDataSpecification | null = null;

  lookupDataspec(dataspec: aas.types.EmbeddedDataSpecification) {
    this.showEclassSearch = true;
    this.dataspecItem = dataspec;
  }

  selectVec(item: any) {
    if (
      this.dataspecItem != null &&
      this.dataspecItem.dataSpecificationContent instanceof aas.types.DataSpecificationIec61360
    ) {
      DataspecificationIec61360Helper.applyVecToSpec(this.dataspecItem.dataSpecificationContent, item);
    }
    this.showEclassSearch = false;
  }

  selectEclass(item: EClassItem) {
    if (
      this.dataspecItem != null &&
      this.dataspecItem.dataSpecificationContent instanceof aas.types.DataSpecificationIec61360
    ) {
      DataspecificationIec61360Helper.applyEclassToSpec(this.dataspecItem.dataSpecificationContent, item);
    }
    this.showEclassSearch = false;
  }
}
