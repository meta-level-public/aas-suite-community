import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { DataTypeDefXsd } from '@aas-core-works/aas-core3.1-typescript/types';

import { HelpLabelComponent } from '@aas/common-components';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TieredMenu } from 'primeng/tieredmenu';
import { lastValueFrom } from 'rxjs';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { V3ComponentBase } from '../v3-component-base';
import { AaspeQualifier, AaspeQualifierEntry } from './aaspe-qualifier-entry';

@Component({
  selector: 'aas-v3-qualifiers',
  templateUrl: './v3-qualifiers.component.html',
  imports: [
    Button,
    TieredMenu,
    HelpLabelComponent,
    Select,
    FormsModule,
    InputText,
    NullIfEmptyDirective,
    V3UndoDirective,
    Button,
    TranslateModule,
  ],
})
export class V3QualifiersComponent extends V3ComponentBase implements OnInit {
  @Input() qualifiers: aas.types.Qualifier[] | null | undefined;

  @Input() qualifiersParent: any;
  filteredItems: string[] = [];
  addItems: MenuItem[] = [];
  multiplicityOptions: string[] = [];

  http = inject(HttpClient);

  constructor(
    private treeService: V3TreeService,
    private translate: TranslateService,
  ) {
    super();
  }

  async ngOnInit() {
    this.addItems = [
      {
        // icon: 'pi pi-file',
        command: () => this.addQualifier(),
        label: this.translate.instant('ADD_CUSTOM_QUALIFIER'),
      },
      // {
      //   icon: 'fa-solid fa-code-compare',
      //   command: () => this.addQualifier('multiplicity'),
      //   label: this.translate.instant('ADD_MULTIPLICITY_QUALIFIER'),
      // },
    ];
    await this.loadAaspeQualifiers();

    this.multiplicityOptions = ['ZeroToOne', 'One', 'ZeroToMany', 'OneToMany'];
  }

  async loadAaspeQualifiers() {
    try {
      const res = await lastValueFrom(this.http.get<AaspeQualifierEntry[]>('assets/lookups/qualifier-presets.json'));
      const qmenuEntries: MenuItem[] = [];
      res.forEach((entry) => {
        const splittedName = entry.name.split(' | ');
        const foundEntry = qmenuEntries.find((e) => e.label === splittedName[0]);
        if (foundEntry) {
          if (foundEntry.items == null) foundEntry.items = [];
          {
            foundEntry.items.push({
              label: splittedName[1],
              command: () => {
                this.addAaspeQualifier(entry.qualifier);
              },
            });
          }
        } else {
          qmenuEntries.push({
            label: splittedName[0],
            items: [
              {
                label: splittedName[1],
                command: () => {
                  this.addAaspeQualifier(entry.qualifier);
                },
              },
            ],
          });
        }
      });

      const aaspeMenuEntry: MenuItem = {
        // icon: 'pi pi-file',
        label: 'AASPE Qualifiers',
        items: qmenuEntries,
      };

      this.addItems = [...this.addItems, aaspeMenuEntry];
    } catch {
      // ignore
    }
  }

  addAaspeQualifier(aaspeQualifier: AaspeQualifier) {
    if (this.qualifiers == null) {
      this.qualifiersParent.qualifiers = [];
      this.qualifiers = this.qualifiersParent.qualifiers;
    }

    const qualifier = new aas.types.Qualifier(aaspeQualifier.type, DataTypeDefXsd.String);

    if (aaspeQualifier.kind != null) {
      qualifier.kind = this.getKind(aaspeQualifier.kind);
    }
    if (aaspeQualifier.value != null) {
      qualifier.value = aaspeQualifier.value;
    }

    if (aaspeQualifier.semanticId != null) {
      const keys: aas.types.Key[] = [];
      aaspeQualifier.semanticId.keys.forEach((key) => {
        keys.push(new aas.types.Key(this.getKeyType(key.type as any as string), key.value));
      });
      const semanticId = new aas.types.Reference(this.getRefType(aaspeQualifier.semanticId.type), keys);
      qualifier.semanticId = semanticId;
    }
    if (aaspeQualifier.valueId != null) {
      const keys: aas.types.Key[] = [];
      aaspeQualifier.valueId.keys.forEach((key) => {
        keys.push(new aas.types.Key(this.getKeyType(key.type as any as string), key.value));
      });
      const valueId = new aas.types.Reference(this.getRefType(aaspeQualifier.valueId.type as any as string), keys);
      qualifier.valueId = valueId;
    }

    this.qualifiers?.push(qualifier);
    this.treeService.registerFieldUndoStep();
  }

  getRefType(typeString: string) {
    let refType: aas.types.ReferenceTypes = aas.types.ReferenceTypes.ExternalReference;
    switch (typeString) {
      case 'ModelReference':
        refType = aas.types.ReferenceTypes.ModelReference;
        break;
      case 'ExternalReference':
        refType = aas.types.ReferenceTypes.ExternalReference;
        break;
    }

    return refType;
  }

  getKind(kindString: string) {
    let kind: aas.types.QualifierKind = aas.types.QualifierKind.ValueQualifier;
    switch (kindString) {
      case 'ValueQualifier':
        kind = aas.types.QualifierKind.ValueQualifier;
        break;
      case 'ConceptQualifier':
        kind = aas.types.QualifierKind.ConceptQualifier;
        break;
      case 'TemplateQualifier':
        kind = aas.types.QualifierKind.TemplateQualifier;
        break;
    }
    return kind;
  }

  getKeyType(typeString: string) {
    // Todo: weitere Typen mappen
    let keyType: aas.types.KeyTypes = aas.types.KeyTypes.GlobalReference;
    switch (typeString) {
      case 'GlobalReference':
        keyType = aas.types.KeyTypes.GlobalReference;
        break;
    }

    return keyType;
  }
  addQualifier(type: 'multiplicity' | 'custom' = 'custom') {
    if (this.qualifiers == null) {
      this.qualifiersParent.qualifiers = [];
      this.qualifiers = this.qualifiersParent.qualifiers;
    }

    this.qualifiers?.push(this.createQualifier(type));
    this.treeService.registerFieldUndoStep();
  }

  createQualifier(type: 'multiplicity' | 'custom') {
    switch (type) {
      case 'multiplicity':
        return new aas.types.Qualifier('Multiplicity', aas.types.DataTypeDefXsd.String);
      default:
        return new aas.types.Qualifier('', aas.types.DataTypeDefXsd.String);
    }
  }

  removeQualifier(qualifier: any) {
    const indx = this.qualifiersParent.qualifiers.indexOf(qualifier);
    if (indx !== -1) this.qualifiersParent.qualifiers.splice(indx, 1);
    if (this.qualifiersParent.qualifiers?.length === 0) {
      this.qualifiersParent.qualifiers = null;
      this.qualifiers = null;
    }
    this.treeService.registerFieldUndoStep();
  }

  removeQualifiersBlock() {
    this.qualifiersParent.qualifiers = null;
    this.qualifiers = null;
    this.treeService.registerFieldUndoStep();
  }

  getTypeError(entry: any) {
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return errors.filter((e) => (e.path.segments[0] as any)?.name === 'type');
  }
  hasTypeErrors(entry: any) {
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return errors.filter((e) => (e.path.segments[0] as any)?.name === 'type')?.length > 0;
  }

  getValueError(entry: any) {
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return [
      ...errors.filter((e) => (e.path.segments[0] as any)?.name === 'value'),
      ...errors.filter(
        (e) =>
          e.message === 'Constraint AASd-020: The value shall be consistent to the data type as defined in value type.',
      ),
    ];
  }
  hasValueErrors(entry: any) {
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return (
      errors.filter((e) => (e.path.segments[0] as any)?.name === 'value')?.length > 0 ||
      errors.filter(
        (e) =>
          e.message === 'Constraint AASd-020: The value shall be consistent to the data type as defined in value type.',
      ).length > 0
    );
  }
}
