import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AasConfirmationService } from '@aas/common-services';
import { ConceptDescriptionHelper } from '@aas/helpers';
import { ShellResult } from '@aas/model';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem, PrimeTemplate } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';
import { Menu } from '@openng/optimus-ui/menu';
import { TableModule } from '@openng/optimus-ui/table';
import { PortalService } from '@aas/common-services';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
type ConceptDescription = aas.types.ConceptDescription;

@Component({
  selector: 'aas-v3-concept-descriptions',
  templateUrl: './v3-concept-descriptions.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TableModule, PrimeTemplate, Button, Button, Menu, TranslateModule],
})
export class V3ConceptDescriptionsComponent {
  @Input({ required: true }) conceptDescriptions: aas.types.ConceptDescription[] | undefined | null;
  @Input({ required: true }) shellResult: ShellResult | undefined;

  ConceptDescriptionHelper = ConceptDescriptionHelper;

  selectedCds: ConceptDescription[] = [];
  menuItems: MenuItem[] = [];

  constructor(
    public portalService: PortalService,
    private treeService: V3TreeService,
    private confirmationService: AasConfirmationService,
    private translate: TranslateService,
  ) {}

  async deleteSelected() {
    if (
      await this.confirmationService.confirm({
        message: `${this.translate.instant('DELETE_ALL_SELECTED_CONCEPT_DESCRIPTIONS_Q')}`,
      })
    ) {
      this.selectedCds.forEach((cd) => {
        this.treeService.deleteConceptDescriptionNode(cd.id);
        this.conceptDescriptions = this.conceptDescriptions?.filter((c) => c.id !== cd.id);
        if (this.shellResult?.v3Shell?.conceptDescriptions) {
          this.shellResult.v3Shell.conceptDescriptions = this.shellResult.v3Shell.conceptDescriptions.filter(
            (c) => c.id !== cd.id,
          );
        }
      });
      // this.treeService.registerFieldUndoStep();
    }
  }

  onShowActions(cd: ConceptDescription) {
    this.menuItems = [
      {
        label: this.translate.instant('EDIT'),
        icon: 'pi pi-pencil',
        command: () => this.treeService.selectConceptDescription(cd.id),
      },
    ];
  }
}
