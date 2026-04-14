import { Entity, ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';

import { Component, Input, OnChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'aas-bom-child-node',
  templateUrl: './bom-child-node.component.html',
  imports: [TableModule, PrimeTemplate, TranslateModule],
})
export class BomChildNodeComponent implements OnChanges {
  @Input() node: Entity | undefined;
  childNodes: Entity[] = [];

  ngOnChanges(): void {
    if (this.node != null) {
      this.childNodes =
        this.node.statements
          ?.filter((v) => this.hasSemanticId(v, 'https://admin-shell.io/idta/HierarchicalStructures/Node/1/0'))
          .map((v) => v as Entity) ?? [];
    }
  }

  hasSemanticId(sme: ISubmodelElement, semanticId: string) {
    return sme.semanticId?.keys.find((k) => k.value.startsWith(semanticId)) != null;
  }

  get relType() {
    if (this.node == null) return '';
    let relType = '';
    if (
      this.node.statements?.find(
        (s) =>
          s.semanticId?.keys.find((k) =>
            k.value.startsWith('https://admin-shell.io/idta/HierarchicalStructures/IsPartOf/1/0'),
          ) != null,
      )
    ) {
      relType += 'IsPartOf';
    }
    if (
      this.node.statements?.find(
        (s) =>
          s.semanticId?.keys.find((k) =>
            k.value.startsWith('https://admin-shell.io/idta/HierarchicalStructures/HasPart/1/0'),
          ) != null,
      )
    ) {
      if (relType !== '') relType += ' / ';

      relType += 'HasPart';
    }

    return relType;
  }
}
