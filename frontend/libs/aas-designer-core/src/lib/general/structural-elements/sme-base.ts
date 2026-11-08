import { DirtyCheckable, Info } from '@aas-designer-model';
import { ID_SHORT_KEY_FILTER } from '@aas/common-services';
import { AssetAdministrationShellEnvironment, IdentifierType } from '@aas/model';
import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { AasSharedDataService } from '../../asset-administration-shell-tree/services/aas-shared-data.service';

@Directive()
export abstract class SmeBase extends DirtyCheckable implements OnDestroy {
  editableNode: any;
  aasStructure: AssetAdministrationShellEnvironment = {} as AssetAdministrationShellEnvironment;
  loading: boolean = false;

  idShortRegex = ID_SHORT_KEY_FILTER;
  Info = Info;
  IdentifierType = IdentifierType;
  subscriptions: Subscription[] = [];

  constructor(protected aasSharedDataService: AasSharedDataService) {
    super();
    this.getSharedData();
  }

  private async getSharedData() {
    this.subscriptions.push(
      this.aasSharedDataService.currentEditableNode.subscribe((item: any) => {
        this.editableNode = item;
      }),
    );
    this.subscriptions.push(
      this.aasSharedDataService.currentAas.subscribe((aas) => {
        if (aas != null) {
          this.aasStructure = aas;
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  override isDirty() {
    return false;
  }

  generateGuid() {
    this.editableNode.identification.id = uuid();
  }
}
