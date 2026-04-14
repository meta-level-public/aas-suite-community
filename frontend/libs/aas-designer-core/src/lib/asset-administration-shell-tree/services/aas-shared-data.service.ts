import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

import { AssetAdministrationShellEnvironment, FileResult } from '@aas/model';
import { cloneDeep } from 'lodash-es';
import { ValidationError } from '../../validation/validation-error';

@Injectable({ providedIn: 'root' })
export class AasSharedDataService {
  copyOfCurrentAas: AssetAdministrationShellEnvironment | null = null;
  shellName: string = '';
  freigabeLevel: 'PRIVATE' | 'ORGANISATION' = 'PRIVATE';
  marktGuid: string | undefined;
  copyOfShellName: string | null = null;
  currentAasId: number | null = null;
  currentAasTreeShellRootNodeId: string = '';

  addedFiles: FileResult[] = [];
  removedFiles: FileResult[] = [];

  validationErrors: ValidationError[] = [];

  copyPasteClipboardItem: any = null;

  currentEditableNode = new BehaviorSubject<any>(null);
  currentAas = new BehaviorSubject<AssetAdministrationShellEnvironment | null>(null);
  syncIdShortWithLabel = new BehaviorSubject<{ uuid: string; idShort: string }>({
    uuid: '',
    idShort: '',
  });
  currentTreeNode = new BehaviorSubject<TreeNode | null>(null);
  removeUuid = new BehaviorSubject<string>('');
  selectByKey = new BehaviorSubject<string>('');

  addElementToParentUuid = new BehaviorSubject({
    uuid: '',
    objectToInsert: null as any,
    expandTree: false,
  });

  selectUuid: BehaviorSubject<{ uuid: string; submodel?: boolean; doNotLog?: boolean; expand?: boolean }> =
    new BehaviorSubject({
      uuid: '',
    });

  refreshSubtree: BehaviorSubject<{ uuid: string; data: any }> = new BehaviorSubject({
    uuid: '',
    data: null,
  });
  refreshSupplementalFiles = new BehaviorSubject(false);
  refreshTree = new BehaviorSubject(false);
  expandUuid: BehaviorSubject<{ uuid: string; submodel?: boolean }> = new BehaviorSubject({ uuid: '' });

  undoEntries = new ReplaySubject<{
    aas: AssetAdministrationShellEnvironment;
    selectedUuid: string;
    ts: Date;
    id: string;
    submodel?: boolean | null;
  }>(10);

  private currentAasIdSource = new BehaviorSubject(this.currentAasId);

  changeEditableNode(node: any) {
    this.currentEditableNode.next(node);
  }

  changeFullAas(
    aas: any | null,
    fileName: string,
    freigabeLevel: 'PRIVATE' | 'ORGANISATION',
    marktGuid: string | undefined,
  ) {
    this.shellName = fileName.replace('.aasx', '');
    this.freigabeLevel = freigabeLevel;
    this.marktGuid = marktGuid;

    this.currentAas.next(aas);
    this.copyOfCurrentAas = cloneDeep(aas);
    this.copyOfShellName = cloneDeep(this.shellName);
  }

  changeCurrentAasId(id: number) {
    this.currentAasIdSource.next(id);
  }
}
