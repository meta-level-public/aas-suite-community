import * as aas from '@aas-core-works/aas-core3.1-typescript';
import {
  ConceptDescription,
  LangStringDefinitionTypeIec61360,
  MultiLanguageProperty,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { HelpLabelComponent } from '@aas/common-components';
import { AasConfirmationService, EncodingService } from '@aas/common-services';
import { TagHelper } from '@aas/helpers';
import { AasInfrastructureClient, AvailableInfastructure, ConceptDescriptionClient } from '@aas/webapi-client';
import { CommonModule } from '@angular/common';
import { Component, inject, model, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FilterMatchMode, MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { lastValueFrom, Subscription } from 'rxjs';
import { PortalService } from '@aas/common-services';

interface Column {
  field: string;
  header: string;
  columnTemplate: string;
  sortable: boolean;
  filterable: boolean;
  matchMode: FilterMatchMode;
  label: string;
  reorderable: boolean;
}

@Component({
  selector: 'aas-cds-list',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    HelpLabelComponent,
    ButtonModule,
    SelectModule,
    TableModule,
    ChipModule,
    MultiSelectModule,
    TagModule,
    TieredMenuModule,
  ],
  templateUrl: './cds-list.component.html',
  styleUrls: ['../../host.scss'],
})
export class CdsListComponent implements OnDestroy, OnInit {
  portalService = inject(PortalService);
  infrastructureClient = inject(AasInfrastructureClient);
  cdClient = inject(ConceptDescriptionClient);
  translate = inject(TranslateService);
  router = inject(Router);
  confirmService = inject(AasConfirmationService);

  cdId = model<string>('');
  loading = signal(false);

  PortalService = PortalService;
  firstPage = signal(true);
  pageOptions = [1, 5, 10, 20, 50, 100];
  pageSize = model(10);
  menuItems: MenuItem[] = [];
  availableColumns = signal<Column[]>([]);
  selectedColumns = model<Column[]>([]);

  cursor: string | undefined;

  availableRepositories = signal<AvailableInfastructure[]>([]);
  selectedRepository = model<AvailableInfastructure | null>(null);
  cds = signal<ConceptDescription[]>([]);
  selectedCds = signal<ConceptDescription[]>([]);

  currentLang = 'de';
  subscriptions: Subscription[] = [];

  async ngOnInit() {
    this.loading.set(true);
    try {
      this.initColumns();

      const page = window.localStorage.getItem('cds-list-footer-state');
      if (page && page !== '') {
        const pageInt = parseInt(page);
        if (pageInt > 0) {
          this.pageSize.set(parseInt(page));
        } else {
          this.pageSize.set(10);
        }
      } else {
        this.pageSize.set(10);
      }

      await this.initAvailableRepositories();
      await this.loadFirstPage();
    } finally {
      this.loading.set(false);
    }

    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  initColumns() {
    const colId: Column = {
      field: 'id',
      header: 'ID',
      label: 'ID',
      columnTemplate: 'string',
      sortable: true,
      filterable: true,
      matchMode: FilterMatchMode.CONTAINS,
      reorderable: true,
    };
    const colIdShort: Column = {
      field: 'idShort',
      header: 'ID_SHORT',
      label: 'ID_SHORT',
      columnTemplate: 'string',
      sortable: true,
      filterable: true,
      matchMode: FilterMatchMode.CONTAINS,
      reorderable: true,
    };

    const colDefinition: Column = {
      field: 'definition',
      header: 'DEFINITION',
      label: 'DEFINITION',
      columnTemplate: 'edsMlp',
      sortable: false,
      filterable: false,
      reorderable: true,
      matchMode: FilterMatchMode.CONTAINS,
    };

    const colUnit: Column = {
      field: 'unit',
      header: 'UNIT',
      label: 'UNIT',
      columnTemplate: 'eds',
      sortable: false,
      filterable: false,
      reorderable: true,
      matchMode: FilterMatchMode.CONTAINS,
    };

    const columns: Column[] = [colId, colIdShort, colDefinition, colUnit];
    this.availableColumns.set(columns);
    this.selectedColumns.set([colId, colIdShort, colDefinition, colUnit]);
  }

  findCd() {
    // eslint-disable-next-line no-console
    console.log('findCd', this.cdId);
  }

  async initAvailableRepositories() {
    const res = await lastValueFrom(this.infrastructureClient.aasInfrastructure_GetAvailableInfrastructures());
    this.availableRepositories.set(res);

    const selectedRepo = PortalService.getCurrentAasInfrastructureSetting();
    const foundRepo = this.availableRepositories().find((r) => r.id === selectedRepo?.id);
    if (foundRepo) {
      this.selectedRepository.set(foundRepo);
    } else {
      // internes auswählen
      const internalRepo = this.availableRepositories().find((r) => r.isInternal);
      if (internalRepo) {
        this.selectedRepository.set(internalRepo);
        this.portalService.saveCurrentInfrastructureSetting(internalRepo);
      } else {
        // das erstbeste nehmen
        this.selectedRepository.set(this.availableRepositories()[0]);
        this.portalService.saveCurrentInfrastructureSetting(this.availableRepositories()[0]);
      }
    }
  }
  async loadFirstPage() {
    window.localStorage.setItem('cds-list-footer-state', this.pageSize()?.toString());
    this.cursor = undefined;
    this.firstPage.set(true);
    await this.loadPaged();
  }

  async loadNextPage() {
    this.firstPage.set(false);
    await this.loadPaged();
  }

  setInfrastructure() {
    const repo = this.selectedRepository();
    if (repo) {
      this.portalService.saveCurrentInfrastructureSetting(repo);
    }
  }

  async loadPaged() {
    this.selectedCds.set([]);
    this.cds.set([]);
    if (this.selectedRepository()) {
      try {
        this.loading.set(true);
        const res = await lastValueFrom(
          this.cdClient.conceptDescription_GetAllCds(this.pageSize(), this.cursor, this.cdId()),
        );
        var cds: ConceptDescription[] = [];
        res.cdAsJsonStrings?.forEach((cd) => {
          var cdObj = aas.jsonization.conceptDescriptionFromJsonable(JSON.parse(cd)).value;
          if (cdObj != null) {
            cds.push(cdObj);
          }
        });

        this.cds.set(cds);

        this.cursor = res.cursor;
      } finally {
        this.loading.set(false);
      }
    }
  }

  removeSelectedColumn(col: Column) {
    const cols = this.selectedColumns().filter((c) => c.field !== col.field);
    this.selectedColumns.set(cols);
  }

  getAasTagSeverity(type: string) {
    return TagHelper.getAasTypeTagSeverityByString(type);
  }

  async onShowActions(shell: ConceptDescription) {
    const currentInfrastructure = PortalService.getCurrentAasInfrastructureSetting();
    // const transferTargets = this.getTransferTargets(shell);
    this.menuItems = [
      // {
      //   label: this.translate.instant('VIEW'),
      //   icon: 'pi pi-eye',
      //   command: () => {
      //     // this.router.navigate(['/', 'viewer', 'aas-view', shell.id]);
      //   },
      // },
      {
        label: this.translate.instant('EDIT'),
        icon: 'pi pi-pencil',
        command: () => {
          this.router.navigate(PortalService.buildCdEditRoute(shell.id ?? ''));
        },
        visible: !currentInfrastructure?.isReadonly,
      },
      {
        label: this.translate.instant('DELETE'),
        icon: 'pi pi-trash',
        command: () => {
          if (shell.id != null) {
            this.deleteCd(shell.id);
          }
        },
        visible: !currentInfrastructure?.isReadonly,
      },
    ];
  }

  getEdsValue(cd: ConceptDescription, field: string) {
    if (cd != null) {
      const eds = cd.embeddedDataSpecifications?.[0];
      if (eds != null) {
        const dataspec = (eds.dataSpecificationContent as any)[field];
        if (dataspec != null) {
          // console.log('getEdsValue', field, dataspec);
          return dataspec;
        }
        return '';
      }
    }
    return '';
  }

  getEdsMlpValue(cd: ConceptDescription, field: string) {
    if (cd != null) {
      const eds = cd.embeddedDataSpecifications?.[0];
      if (eds != null) {
        const dataspec = (eds.dataSpecificationContent as any)[field];
        return this.getLangStringDefinitionTypeIec61360Value(dataspec);
      }
    }
    return '';
  }

  getLangStringDefinitionTypeIec61360Value(el: LangStringDefinitionTypeIec61360[]) {
    if (el != null) {
      let found = el.find((e: any) => e.language.toLowerCase() === this.currentLang.toLowerCase());
      if (found != null) {
        return found.text;
      }
      found = el?.find((e: any) => e.language.toLowerCase() === 'en');
      if (found != null) {
        return found.text;
      }
      found = el?.[0];
      if (found != null) {
        return found.text;
      }
    }
    return '';
  }

  getMlpValue(mlp: MultiLanguageProperty) {
    if (mlp != null) {
      let found = mlp.value?.find((e: any) => e.language.toLowerCase() === this.currentLang.toLowerCase());
      if (found != null) {
        return found.text;
      }
      found = mlp.value?.find((e: any) => e.language.toLowerCase() === 'en');
      if (found != null) {
        return found.text;
      }
      found = mlp.value?.[0];
      if (found != null) {
        return found.text;
      }
    }
    return '';
  }

  async deleteCd(id: string) {
    if ((await this.confirmService.confirm({ message: this.translate.instant('DELETE_CD_Q') })) === true) {
      try {
        this.loading.set(true);
        const res = await lastValueFrom(this.cdClient.conceptDescription_DeleteCd(EncodingService.base64urlEncode(id)));
        if (res) {
          this.cds.set(this.cds().filter((s) => s.id !== id));
          // this.loadFirstPage();
        }
      } finally {
        this.loading.set(false);
      }
    }
  }
}
