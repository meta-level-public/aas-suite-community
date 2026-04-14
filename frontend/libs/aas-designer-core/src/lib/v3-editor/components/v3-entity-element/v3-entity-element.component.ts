import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AssetInformation, Submodel } from '@aas-core-works/aas-core3.1-typescript/types';
import { BomHierarchyChartComponent } from '@aas/bom-diagram';
import { HelpLabelComponent } from '@aas/common-components';
import { AppConfigService } from '@aas/common-services';
import { ShellResult } from '@aas/model';
import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { Fieldset } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';
import { Info } from '../../../general/model/info-item';
import { V3TreeItem } from '../../model/v3-tree-item';
import { EndpointUrlComponent } from '../endpoint-url/endpoint-url.component';
import { V3CategoryComponent } from '../v3-category/v3-category.component';
import { V3ComponentBase } from '../v3-component-base';
import { V3GlobalAssetIdComponent } from '../v3-global-asset-id/v3-global-asset-id.component';
import { V3IdShortComponent } from '../v3-id-short/v3-id-short.component';
import { V3LangStringListComponent } from '../v3-lang-string-list/v3-lang-string-list.component';
import { V3QualifiersComponent } from '../v3-qualifiers/v3-qualifiers.component';
import { V3SemanticDescriptionComponent } from '../v3-semantic-description/v3-semantic-description.component';
import { V3SpecificAssetIdsComponent } from '../v3-specific-asset-ids/v3-specific-asset-ids.component';

@Component({
  selector: 'aas-v3-entity-element',
  templateUrl: './v3-entity-element.component.html',
  imports: [
    Fieldset,
    HelpLabelComponent,
    V3IdShortComponent,
    Message,
    V3LangStringListComponent,
    V3CategoryComponent,
    Select,
    V3UndoDirective,
    FormsModule,
    V3GlobalAssetIdComponent,
    NullIfEmptyDirective,
    V3SpecificAssetIdsComponent,
    NgClass,
    V3SemanticDescriptionComponent,
    V3QualifiersComponent,
    BomHierarchyChartComponent,
    EndpointUrlComponent,
    TranslateModule,
    InputTextModule,
  ],
})
export class V3EntityElementComponent extends V3ComponentBase {
  @Input() entity: V3TreeItem<aas.types.Entity> | undefined;
  @Input({ required: true }) shellResult: ShellResult | undefined;
  @Input({ required: true }) assetInformation: AssetInformation | undefined;
  @Input({ required: true }) idShort: string | undefined;
  @Input({ required: true }) submodel: Submodel | undefined;
  @Input({ required: true }) idShortPath: string = '';

  info = Info;
  candidates: SelectItem[] = [];

  constructor(public appConfigService: AppConfigService) {
    super();
  }

  get isBomNode() {
    if (this.entity == null) return false;
    return (
      this.hasSemanticId(this.entity.content, 'https://admin-shell.io/idta/HierarchicalStructures/EntryNode/1/0') ||
      this.hasSemanticId(this.entity.content, 'https://admin-shell.io/idta/HierarchicalStructures/Node/1/0')
    );
  }

  hasSemanticId(sme: aas.types.ISubmodelElement | undefined, semanticId: string) {
    return sme?.semanticId?.keys.find((k) => k.value.startsWith(semanticId)) != null;
  }

  get relationInvalid() {
    let hasPart: boolean = false;
    let isPart: boolean = false;
    if (this.entity?.content == null) return false;

    if (
      this.entity.content.statements?.find(
        (s) =>
          s.semanticId?.keys.find((k) =>
            k.value.startsWith('https://admin-shell.io/idta/HierarchicalStructures/IsPartOf/1/0'),
          ) != null,
      )
    ) {
      isPart = true;
    }
    if (
      this.entity.content.statements?.find(
        (s) =>
          s.semanticId?.keys.find((k) =>
            k.value.startsWith('https://admin-shell.io/idta/HierarchicalStructures/HasPart/1/0'),
          ) != null,
      )
    ) {
      hasPart = true;
    }

    return isPart && hasPart;
  }

  getRelType(ent: aas.types.Entity) {
    let relString = ' -- ';
    if (
      ent.statements?.find(
        (s) =>
          s.semanticId?.keys.find((k) =>
            k.value.startsWith('https://admin-shell.io/idta/HierarchicalStructures/IsPartOf/1/0'),
          ) != null,
      )
    ) {
      relString += 'isPartOf';
    }
    if (
      ent.statements?.find(
        (s) =>
          s.semanticId?.keys.find((k) =>
            k.value.startsWith('https://admin-shell.io/idta/HierarchicalStructures/HasPart/1/0'),
          ) != null,
      )
    ) {
      if (relString !== ' -- ') relString += ' / ';
      relString += 'hasPart';
    }

    return relString !== ' -- ' ? relString : '';
  }

  getCount(entity: aas.types.Entity) {
    return (
      entity.statements?.find(
        (s) =>
          s.semanticId?.keys.find((k) =>
            k.value.startsWith('https://admin-shell.io/idta/HierarchicalStructures/BulkCount/1/0'),
          ) != null,
      ) as aas.types.Property
    )?.value;
  }

  get hasSemanticErrors() {
    const errors = [];
    if (this.entity?.content?.semanticId != null) {
      for (const error of aas.verification.verify(this.entity.content.semanticId, false)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }

  // @HostListener('window:openViewer', ['$event'])
  // openViewer(event: CustomEvent) {
  //   this.ref = this.dialogService.open(AasViewerStandaloneComponent, {
  //     header: 'AAS Viewer',
  //     width: '70%',
  //     contentStyle: { overflow: 'auto' },
  //     baseZIndex: 10000,
  //     maximizable: true,
  //     data: {
  //       registry: event.detail.registry,
  //       aasId: event.detail.aasId,
  //       httpHeader: event.detail.httpHeader,
  //     },
  //   });
  // }
}
