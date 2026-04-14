import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { HelpLabelComponent } from '@aas/common-components';
import { EClassItem } from '@aas/model';
import { Component, Input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';
import { EClassLogoComponent } from '../../../general/eclass-logo/eclass-logo.component';
import { EclassSearchComponent } from '../../../general/eclass-search/eclass-search.component';
import { VecLogoComponent } from '../../../general/vec-logo/vec-logo.component';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { AdditionalLookupSourcesComponent } from '../additional-lookup-sources/additional-lookup-sources.component';
import { V3ComponentBase } from '../v3-component-base';
import { VecLookupComponent } from '../vec-lookup/vec-lookup.component';

@Component({
  selector: 'aas-v3-value-id',
  templateUrl: './v3-value-id.component.html',
  imports: [
    Button,
    InputGroup,
    FormsModule,
    InputText,
    V3UndoDirective,
    NullIfEmptyDirective,
    InputGroupAddon,
    Button,
    HelpLabelComponent,
    Dialog,
    Tabs,
    TabList,
    Ripple,
    Tab,
    EClassLogoComponent,
    VecLogoComponent,
    EclassSearchComponent,
    VecLookupComponent,
    AdditionalLookupSourcesComponent,
    TranslateModule,
  ],
})
export class V3ValueIdComponent extends V3ComponentBase {
  @Input({ required: true }) property:
    | V3TreeItem<aas.types.Property>
    | V3TreeItem<aas.types.MultiLanguageProperty>
    | undefined;

  source = model<'eclass' | 'vec' | 'other'>('eclass');

  showEclassSearch: boolean = false;

  constructor(private treeService: V3TreeService) {
    super();
  }

  selectEclass(item: EClassItem) {
    const id = 'https://api.eclass-cdp.com/' + item.irdi.replaceAll('#', '-');
    if (this.property?.content?.valueId != null) {
      if (this.property.content.valueId.keys == null) {
        this.property.content.valueId.keys = [new aas.types.Key(aas.types.KeyTypes.GlobalReference, '')];
      }
      this.property.content.valueId.keys[0].value = item.irdi;
      // this.property.content.value = item.irdi;

      if (this.property.content.valueId.referredSemanticId == null) {
        this.property.content.valueId.referredSemanticId = new aas.types.Reference(
          aas.types.ReferenceTypes.ExternalReference,
          [new aas.types.Key(aas.types.KeyTypes.GlobalReference, '')],
        );
      }
      this.property.content.valueId.referredSemanticId.keys[0].value = id;
      this.treeService.registerFieldUndoStep();
    }
    this.showEclassSearch = false;
  }

  selectVec(item: any) {
    if (this.property?.content?.valueId != null) {
      if (this.property.content.valueId.keys == null) {
        this.property.content.valueId.keys = [new aas.types.Key(aas.types.KeyTypes.GlobalReference, '')];
      }
      this.property.content.valueId.keys[0].value = item.groupName;
      // TODO: Vielleicht das hier auch setzen?
      // this.property.content.value = item.shortGroupName;

      if (this.property.content.valueId.referredSemanticId == null) {
        this.property.content.valueId.referredSemanticId = new aas.types.Reference(
          aas.types.ReferenceTypes.ExternalReference,
          [new aas.types.Key(aas.types.KeyTypes.GlobalReference, '')],
        );
      }
      this.property.content.valueId.referredSemanticId.keys[0].value = item.groupName;
      this.treeService.registerFieldUndoStep();
    }
    this.showEclassSearch = false;
  }

  addValueId() {
    if (this.property?.content != null) {
      if (this.property.content.valueId == null) {
        const ref = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, []);
        this.property.content.valueId = ref;
      }
      if (this.property.content.valueId != null && this.property?.content.valueId.keys == null) {
        this.property.content.valueId.keys = [];
      }
      const key = new aas.types.Key(aas.types.KeyTypes.GlobalReference, '');
      this.property.content.valueId?.keys.push(key);

      // if (this.property.content.valueId.referredSemanticId == null) {
      //   this.property.content.valueId.referredSemanticId = new aas.types.Reference(
      //     aas.types.ReferenceTypes.ExternalReference,
      //     [new aas.types.Key(aas.types.KeyTypes.GlobalReference, '')],
      //   );
      // }
      this.treeService.registerFieldUndoStep();
    }
    this.showEclassSearch = false;
  }

  removeValueId(index: number) {
    if (this.property?.content?.valueId?.keys != null) {
      this.property.content.valueId.keys.splice(index, 1);
      if (this.property.content.valueId.keys.length === 0) {
        this.property.content.valueId = null;
      }
      this.treeService.registerFieldUndoStep();
    }
  }

  addRefId() {
    if (this.property?.content?.valueId != null && this.property.content.valueId.referredSemanticId == null) {
      this.property.content.valueId.referredSemanticId = new aas.types.Reference(
        aas.types.ReferenceTypes.ExternalReference,
        [new aas.types.Key(aas.types.KeyTypes.GlobalReference, '')],
      );
      this.treeService.registerFieldUndoStep();
    }
  }

  hasValueIdErrors(index: number) {
    const errors = [];
    if (this.property?.content?.valueId?.keys[index]) {
      for (const error of aas.verification.verify(this.property.content.valueId.keys[index])) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }

  valueIdError(index: number) {
    const errors = [];
    if (this.property?.content?.valueId?.keys[index]) {
      for (const error of aas.verification.verify(this.property.content.valueId.keys[index])) {
        errors.push(error);
      }
    }
    return errors;
  }

  hasValueIdRefErrors() {
    const errors = [];
    if (this.property?.content?.valueId?.referredSemanticId) {
      for (const error of aas.verification.verify(this.property.content.valueId.referredSemanticId)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }

  valueIdRefErrors() {
    const errors = [];
    if (this.property?.content?.valueId?.referredSemanticId) {
      for (const error of aas.verification.verify(this.property.content.valueId.referredSemanticId)) {
        errors.push(error);
      }
    }
    return errors;
  }

  openLink(link: string) {
    if (link != null && link !== '') window.open(link, '_blank');
  }
}
