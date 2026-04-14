import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HelpLabelComponent } from '@aas/common-components';
import { EClassItem, ShellResult } from '@aas/model';
import { JsonPipe } from '@angular/common';
import { Component, Input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Ripple } from 'primeng/ripple';
import { Select } from 'primeng/select';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { EClassLogoComponent } from '../../../general/eclass-logo/eclass-logo.component';
import { EclassSearchComponent } from '../../../general/eclass-search/eclass-search.component';
import { QudtLogoComponent } from '../../../general/qudt-logo/qudt-logo.component';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { AdditionalLookupSourcesComponent } from '../additional-lookup-sources/additional-lookup-sources.component';
import { LevelTypeComponent } from '../level-type/level-type.component';
import { QudtDatatypeLookupComponent } from '../qudt-datatype-lookup/qudt-datatype-lookup.component';
import { SiDatatypeLookupComponent } from '../si-datatype-lookup/si-datatype-lookup.component';
import { V3ComponentBase } from '../v3-component-base';
import { V3LangStringListComponent } from '../v3-lang-string-list/v3-lang-string-list.component';
import { V3ValueListComponent } from '../v3-value-list/v3-value-list.component';
type VerificationError = aas.verification.VerificationError;

@Component({
  selector: 'aas-data-specification-content',
  templateUrl: './data-specification-content.component.html',
  styleUrls: ['../../../../host.scss'],
  imports: [
    HelpLabelComponent,
    V3LangStringListComponent,
    InputGroup,
    FormsModule,
    InputText,
    NullIfEmptyDirective,
    InputGroupAddon,
    Button,
    Message,
    Select,
    V3ValueListComponent,
    LevelTypeComponent,
    Dialog,
    Tabs,
    TabList,
    Ripple,
    Tab,
    QudtLogoComponent,
    EClassLogoComponent,
    QudtDatatypeLookupComponent,
    SiDatatypeLookupComponent,
    EclassSearchComponent,
    AdditionalLookupSourcesComponent,
    JsonPipe,
    TranslateModule,
  ],
})
export class DataSpecificationContentComponent extends V3ComponentBase {
  @Input({ required: true }) dataSpecificationContent: aas.types.DataSpecificationIec61360 | undefined | null;
  @Input({ required: true }) dataSpecificationContentParent: any;
  @Input({ required: true }) shellResult: ShellResult | undefined | null;

  showUnitSearch = model<boolean>(false);
  source = model('eclass');
  constructor(private treeService: V3TreeService) {
    super();
  }

  getValueError(entry: any) {
    const errors: VerificationError[] = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return errors.filter(
      (e) =>
        (e.path.segments[0] as any)?.name === 'value' ||
        e.message === 'Constraint AASc-3a-010: If value is not empty then value list shall be empty and vice versa.',
    );
  }
  hasValueErrors(entry: any) {
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return (
      errors.filter((e) => (e.path.segments[0] as any)?.name === 'value').length > 0 ||
      errors.filter(
        (e) =>
          e.message === 'Constraint AASc-3a-010: If value is not empty then value list shall be empty and vice versa.',
      ).length > 0
    );
  }
  getValueListError(entry: any) {
    const errors: VerificationError[] = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return errors.filter(
      (e) =>
        e.message === 'Constraint AASc-3a-010: If value is not empty then value list shall be empty and vice versa.',
    );
  }
  hasValueListErrors(entry: any) {
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return (
      errors.filter(
        (e) =>
          e.message === 'Constraint AASc-3a-010: If value is not empty then value list shall be empty and vice versa.',
      ).length > 0
    );
  }

  getErrors(entry: any, fieldname: string) {
    const errors: VerificationError[] = [];
    for (const error of aas.verification.verify(entry)) {
      if (error.path.toString().endsWith(fieldname)) errors.push(error);
    }
    return errors;
  }

  hasErrors(entry: any, fieldname: string) {
    const errors: VerificationError[] = [];
    for (const error of aas.verification.verify(entry)) {
      if (error.path.toString().endsWith(fieldname)) errors.push(error);
    }
    return errors.length > 0;
  }

  onValueChanged() {
    if (this.dataSpecificationContent?.value === '') this.dataSpecificationContent.value = null;
  }

  removeBlock() {
    this.dataSpecificationContentParent.dataSpecificationContent = null;
    this.dataSpecificationContent = null;

    this.treeService.registerFieldUndoStep();
  }

  addUnitId() {
    if (this.dataSpecificationContent?.unitId == null && this.dataSpecificationContent != null) {
      const newRef = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(aas.types.KeyTypes.GlobalReference, ''),
      ]);
      this.dataSpecificationContent.unitId = newRef;
      this.dataSpecificationContent.unitId.referredSemanticId = new aas.types.Reference(
        aas.types.ReferenceTypes.ExternalReference,
        [new aas.types.Key(aas.types.KeyTypes.GlobalReference, '')],
      );
    }
    this.treeService.registerFieldUndoStep();
  }

  lookupUnitIdValue() {
    this.showUnitSearch.set(true);
  }

  selectQudtUnit(item: any) {
    if (this.dataSpecificationContent?.unitId != null) {
      if (this.dataSpecificationContent.unitId.keys == null) {
        this.dataSpecificationContent.unitId.keys = [new aas.types.Key(aas.types.KeyTypes.GlobalReference, '')];
      }
      this.dataSpecificationContent.unitId.keys[0].value = item.iec61360Code ?? item.groupName;

      if (this.dataSpecificationContent.unitId.referredSemanticId == null) {
        this.dataSpecificationContent.unitId.referredSemanticId = new aas.types.Reference(
          aas.types.ReferenceTypes.ExternalReference,
          [new aas.types.Key(aas.types.KeyTypes.GlobalReference, '')],
        );
      }
      this.dataSpecificationContent.unitId.referredSemanticId.keys[0].value = item.groupName;
      this.dataSpecificationContent.unit = this.getEnValue(item.label);
      this.dataSpecificationContent.symbol = item.symbol;

      this.treeService.registerFieldUndoStep();
    }
  }

  selectSiUnit(item: any) {
    if (this.dataSpecificationContent?.unitId != null) {
      if (this.dataSpecificationContent.unitId.keys == null) {
        this.dataSpecificationContent.unitId.keys = [new aas.types.Key(aas.types.KeyTypes.GlobalReference, '')];
      }
      this.dataSpecificationContent.unitId.keys[0].value = item.groupName;

      if (this.dataSpecificationContent.unitId.referredSemanticId == null) {
        this.dataSpecificationContent.unitId.referredSemanticId = new aas.types.Reference(
          aas.types.ReferenceTypes.ExternalReference,
          [new aas.types.Key(aas.types.KeyTypes.GlobalReference, '')],
        );
      }
      this.dataSpecificationContent.unitId.referredSemanticId.keys[0].value = item.groupName;
      this.dataSpecificationContent.unit = item.shortGroupName;
      this.dataSpecificationContent.symbol = item.hasSymbol;

      this.treeService.registerFieldUndoStep();
    }
    this.showUnitSearch.set(false);
  }

  selectEclass(item: EClassItem) {
    if (this.dataSpecificationContent?.unitId != null) {
      if (this.dataSpecificationContent.unitId.keys == null) {
        this.dataSpecificationContent.unitId.keys = [new aas.types.Key(aas.types.KeyTypes.GlobalReference, '')];
      }
      this.dataSpecificationContent.unitId.keys[0].value = item.irdi;
      this.dataSpecificationContent.unit = item.unit;

      if (this.dataSpecificationContent.unitId.referredSemanticId == null) {
        this.dataSpecificationContent.unitId.referredSemanticId = new aas.types.Reference(
          aas.types.ReferenceTypes.ExternalReference,
          [new aas.types.Key(aas.types.KeyTypes.GlobalReference, '')],
        );
      }
      this.dataSpecificationContent.unitId.referredSemanticId.keys[0].value =
        'https://api.eclass-cdp.com/' + item.irdi.replaceAll('#', '-');
      this.treeService.registerFieldUndoStep();
    }

    this.showUnitSearch.set(false);
  }

  removeUnitId() {
    if (this.dataSpecificationContent?.unitId != null) {
      this.dataSpecificationContent.unitId = null;
    }
    this.treeService.registerFieldUndoStep();
  }

  getEnValue(items: { label: string; lang: string }[]) {
    let value = '';

    value = items.find((i) => i.lang === 'en')?.label ?? items[0]?.label ?? '';

    return value;
  }

  openLink(link: string) {
    if (link != null && link !== '') window.open(link, '_blank');
  }
}
