import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { SmDto, SubmodelClient } from '@aas/webapi-client';
import { Component, inject, model, OnInit, signal, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { PortalService } from '@aas/common-services';

@Component({
  selector: 'aas-search-submodel',
  imports: [FormsModule, TranslateModule, InputTextModule, TableModule, ButtonModule, SelectModule],
  templateUrl: './search-submodel.component.html',
})
export class SearchSubmodelComponent implements OnInit, OnDestroy {
  submodels = signal<SmDto[]>([]);
  searchIdShort = model<string>('');

  smClient = inject(SubmodelClient);

  loading = signal<boolean>(false);

  portalService = inject(PortalService);

  ref: DynamicDialogRef = inject(DynamicDialogRef);
  dialogService = inject(DialogService);

  firstPage = signal(true);
  pageOptions = [1, 5, 10, 20, 50];
  pageSize = model(10);
  cursor: string | undefined;

  constructor() {}

  async ngOnInit() {
    this.loadPaged();
  }

  async loadPaged() {
    let smList: SmDto[] = [];
    try {
      this.loading.set(true);
      const res = await lastValueFrom(
        this.smClient.submodel_GetSmList(this.pageSize(), this.cursor, this.searchIdShort()),
      );
      smList = res.smList ?? [];
      this.cursor = res.cursor;
    } finally {
      this.loading.set(false);
      this.submodels.set(smList);
    }
  }

  async applyCd(smDto: SmDto) {
    // TODO: jetzt das submodel laden

    try {
      this.loading.set(true);
      const smPlain = await lastValueFrom(this.smClient.submodel_GetSmPlain(smDto.id));

      const smJsonable = JSON.parse(smPlain);
      const sm = aas.jsonization.submodelFromJsonable(smJsonable).value;

      this.ref.close(sm);
    } finally {
      this.loading.set(false);
    }
  }

  close() {
    this.ref.close();
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }

  async loadFirstPage() {
    window.localStorage.setItem('sm-list-footer-state', this.pageSize().toString());
    this.cursor = undefined;
    this.firstPage.set(true);
    await this.loadPaged();
  }

  async loadNextPage() {
    this.firstPage.set(false);
    await this.loadPaged();
  }
}
