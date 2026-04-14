import { AssetAdministrationShellEnvironment } from '@aas/model';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrimeTemplate, SelectItem, TreeNode } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { AasSharedDataService } from '../../asset-administration-shell-tree/services/aas-shared-data.service';
import { V3TreeService } from '../../v3-editor/v3-tree/v3-tree.service';
import { V2Searcher } from './v2-searcher';
import { V3Searcher } from './v3-searcher';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-extended-search',
  templateUrl: './extended-search.component.html',
  imports: [Dialog, Select, FormsModule, PrimeTemplate, InputText, Button, TranslateModule],
})
export class ExtendedSearchComponent {
  @Input() visible: boolean = false;
  @Input() treeData: TreeNode[] = [];
  @Input({ required: true }) version: 'v3' | 'v2' = 'v2';

  matchingIds: string[] = [];

  searchOptions: SelectItem[] = [];
  selectedSearchOption: SelectItem | undefined;
  keyword: string = '';
  lastSeachtKeyword: string = '';
  currentSearchIndex: number = 0;

  subscriptions: Subscription[] = [];
  aasStructure: AssetAdministrationShellEnvironment | undefined;
  loading: boolean = false;

  constructor(
    private aasSharedDataService: AasSharedDataService,
    private treeService: V3TreeService,
  ) {
    this.subscriptions.push(
      this.aasSharedDataService.currentAas.subscribe((aas) => {
        if (aas != null) {
          this.aasStructure = aas;
        }
      }),
    );

    this.searchOptions.push({ label: 'ID_SHORT', value: 'idShort' });
    this.searchOptions.push({ label: 'VALUES', value: 'value' });
    this.searchOptions.push({ label: 'CONCEPT_DESCRIPTION_DEFINITION', value: 'conceptDescription' });
    this.searchOptions.push({ label: 'SEMANTIC_ID', value: 'semanticId' });
    const opt = { label: 'EVERYWHERE', value: 'undefined' };
    this.searchOptions.push(opt);
    this.selectedSearchOption = opt;
  }

  searchOrFindNext() {
    switch (this.version) {
      case 'v2':
        if (this.lastSeachtKeyword !== this.keyword) {
          this.searchV2();
        } else {
          if (this.currentSearchIndex < this.matchingIds.length - 1) {
            this.nextV2();
          }
        }
        break;
      case 'v3':
        if (this.lastSeachtKeyword !== this.keyword) {
          this.searchV3();
        } else {
          if (this.currentSearchIndex < this.matchingIds.length - 1) {
            this.nextV3();
          }
        }
        break;
      default:
        throw new Error('Unknown version ' + this.version);
    }
  }

  searchV2() {
    const searcher = new V2Searcher();
    if (this.keyword !== '' && this.aasStructure != null) {
      this.lastSeachtKeyword = this.keyword;
      try {
        this.loading = true;
        this.matchingIds = [];
        switch (this.selectedSearchOption?.value) {
          case 'idShort':
            this.matchingIds = searcher.searchIdShort(this.aasStructure, this.keyword, this.treeData);
            break;
          case 'value':
            this.matchingIds = searcher.searchValue(this.aasStructure, this.keyword, this.treeData);
            break;
          case 'conceptDescription':
            this.matchingIds = searcher.searchConceptDescription(this.aasStructure, this.keyword, this.treeData);
            break;
          case 'semanticId':
            this.matchingIds = searcher.searchSemanticId(this.aasStructure, this.keyword, this.treeData);
            break;
          case 'undefined':
            this.matchingIds = searcher.searchAnywhere(this.keyword, this.treeData, this.aasStructure);
            break;
        }

        if (this.matchingIds.length > 0) {
          this.currentSearchIndex = 0;
          this.aasSharedDataService.selectUuid.next({ uuid: this.matchingIds[0], expand: true });
        }
      } finally {
        this.loading = false;
      }
    }
  }

  next() {
    switch (this.version) {
      case 'v2':
        this.nextV2();
        break;
      case 'v3':
        this.nextV3();
        break;
      default:
        throw new Error('Unknown version ' + this.version);
    }
  }
  previous() {
    switch (this.version) {
      case 'v2':
        this.previousV2();
        break;
      case 'v3':
        this.previousV3();
        break;
      default:
        throw new Error('Unknown version ' + this.version);
    }
  }

  previousV2() {
    this.currentSearchIndex--;
    this.aasSharedDataService.selectUuid.next({ uuid: this.matchingIds[this.currentSearchIndex], expand: true });
  }

  nextV2() {
    this.currentSearchIndex++;
    this.aasSharedDataService.selectUuid.next({ uuid: this.matchingIds[this.currentSearchIndex], expand: true });
  }

  previousV3() {
    this.currentSearchIndex--;
    this.treeService.selectById(this.matchingIds[this.currentSearchIndex]);
  }

  searchV3() {
    const searcher = new V3Searcher(this.treeService);

    if (this.keyword !== '') {
      this.lastSeachtKeyword = this.keyword;
      try {
        this.loading = true;
        this.matchingIds = [];
        switch (this.selectedSearchOption?.value) {
          case 'idShort':
            this.matchingIds = searcher.searchIdShort(this.keyword, this.treeData);
            break;
          case 'value':
            this.matchingIds = searcher.searchValue(this.keyword, this.treeData);
            break;
          case 'conceptDescription':
            this.matchingIds = searcher.searchConceptDescription(this.keyword, this.treeData);
            break;
          case 'semanticId':
            this.matchingIds = searcher.searchSemanticId(this.keyword, this.treeData);
            break;
          case 'undefined':
            this.matchingIds = searcher.searchAnywhere(this.keyword, this.treeData);
            break;
        }

        if (this.matchingIds.length > 0) {
          this.currentSearchIndex = 0;
          this.treeService.selectById(this.matchingIds[0]);
          (window as any).find(this.keyword);
        }
      } finally {
        this.loading = false;
      }
    }
  }

  nextV3() {
    this.currentSearchIndex++;
    this.treeService.selectById(this.matchingIds[this.currentSearchIndex]);
  }
}
