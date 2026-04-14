import { DirtyCheckable, Info } from '@aas-designer-model';
import { AssetAdministrationShellEnvironment, IdentifierType } from '@aas/model';
import { Subscription } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { AasSharedDataService } from '../../asset-administration-shell-tree/services/aas-shared-data.service';

export abstract class SmeBase extends DirtyCheckable {
  editableNode: any;
  aasStructure: AssetAdministrationShellEnvironment = {} as AssetAdministrationShellEnvironment;
  loading: boolean = false;

  idShortRegex = /[a-z0-9_]/i;
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

  override isDirty() {
    return false;
  }

  generateGuid() {
    this.editableNode.identification.id = uuid();
  }
}
