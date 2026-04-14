import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { HelpLabelComponent } from '@aas/common-components';
import { AasConfirmationService } from '@aas/common-services';
import { SemanticIdHelper } from '@aas/helpers';
import { Component, Input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { v4 as uuid } from 'uuid';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';
import { Info } from '../../../general/model/info-item';
import { PortalService } from '@aas/common-services';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { V3ComponentBase } from '../v3-component-base';
type Key = aas.types.Key;

@Component({
  selector: 'aas-v3-key-list',
  templateUrl: './v3-key-list.component.html',
  styleUrls: ['../../../../host.scss'],
  imports: [
    Button,
    HelpLabelComponent,
    Select,
    V3UndoDirective,
    FormsModule,
    InputText,
    NullIfEmptyDirective,
    Message,
    PrimeTemplate,
    Button,
    TranslateModule,
  ],
})
export class V3KeyListComponent extends V3ComponentBase implements OnInit {
  @Input({ required: true }) keyList: aas.types.Key[] | undefined | null;
  @Input({ required: true }) keyListParent: any;
  @Input({ required: true }) keyListParentPropertyName: string = '';
  @Input() showKeyType: boolean = true;
  @Input() showDescription: boolean = false;
  @Input({ required: true }) conceptDescriptions: aas.types.ConceptDescription[] | undefined | null;
  @Input() keyTypeOptions: { label: string; value: number }[] = this.keyTypes;
  conceptDescriptionOptions: { label: string; value: string }[] = [];
  keyTypesType = aas.types.KeyTypes;

  semIdHelper = SemanticIdHelper;
  info = Info;

  itemChanged = output<string>();

  constructor(
    private treeService: V3TreeService,
    private confirmService: AasConfirmationService,
    private translate: TranslateService,
    public portalService: PortalService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadCds();
  }

  loadCds() {
    this.conceptDescriptionOptions =
      this.conceptDescriptions?.map((cd) => ({ label: cd.idShort ?? cd.id, value: cd.id })) ?? [];
    this.conceptDescriptionOptions = this.conceptDescriptionOptions.sort((a, b) => a.label.localeCompare(b.label));
    this.conceptDescriptionOptions.push({ label: this.translate.instant('CREATE_NEW'), value: 'CREATE_NEW' });
  }

  addKey(type: aas.types.KeyTypes = aas.types.KeyTypes.GlobalReference) {
    if (!this.keyList) {
      const langStringArr: aas.types.Key[] = [];
      this.keyListParent[this.keyListParentPropertyName] = langStringArr;
      this.keyList = langStringArr;
    }
    this.keyList.push(new aas.types.Key(type, ''));
  }

  getConceptDescriptionDetail(key: aas.types.Key) {
    return this.conceptDescriptions?.find((cd) => cd.id === key.value);
  }

  goToEditConceptDescription(key: aas.types.Key) {
    this.treeService.selectConceptDescription(key.value);
  }

  createConceptDescriptionIfNew(key: aas.types.Key) {
    if (key.value === 'CREATE_NEW') {
      const id = uuid();
      key.value = id;
      this.treeService.createAndSelectConceptDescription(id);
    }
  }

  async deleteConceptDescription(key: aas.types.Key) {
    if (await this.confirmService.confirm({ message: this.translate.instant('DELETE_CD_AND_REF_Q') })) {
      this.keyList?.splice(this.keyList.indexOf(key), 1);
      this.treeService.deleteConceptDescriptionNode(key.value);
    } else {
      this.keyList?.splice(this.keyList.indexOf(key), 1);
    }
  }

  isContained(key: Key) {
    return this.conceptDescriptions?.find((cd) => cd.id === key.value) != null;
  }

  createConceptDescriptionByKey(key: Key) {
    this.treeService.createAndSelectConceptDescription(key.value);
  }
}
