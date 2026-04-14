import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ConceptDescription, DataSpecificationIec61360, Reference } from '@aas-core-works/aas-core3.1-typescript/types';

import { ConceptDescriptionClient } from '@aas/webapi-client';
import { Component, ElementRef, inject, input, model, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { PortalService } from '@aas/common-services';

@Component({
  selector: 'aas-search-concept-description',
  imports: [FormsModule, TranslateModule, InputTextModule, TableModule, ButtonModule, SelectModule],
  templateUrl: './search-concept-description.component.html',
})
export class SearchConceptDescriptionComponent implements OnInit, OnDestroy {
  @ViewChild('cdTable', { read: ElementRef }) private tableEl?: ElementRef<HTMLElement>;
  searchId = input<string>('');
  conceptDescriptions = signal<ConceptDescription[]>([]);
  searchIdShort = model<string>('');

  cdClient = inject(ConceptDescriptionClient);

  loading = signal<boolean>(false);

  portalService = inject(PortalService);

  ref: DynamicDialogRef = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  dialogService = inject(DialogService);

  firstPage = signal(true);
  pageOptions = [1, 5, 10, 20, 50];
  pageSize = model(10);
  cursor: string | undefined;

  item: Reference | undefined;

  constructor() {
    this.item = this.config.data?.item;
  }

  async ngOnInit() {
    this.loadPaged();
  }

  async loadPaged() {
    const cds: ConceptDescription[] = [];
    try {
      this.loading.set(true);
      const res = await lastValueFrom(
        this.cdClient.conceptDescription_GetCdList(this.pageSize(), this.cursor, this.searchIdShort()),
      );
      res.cdList?.forEach((cdString) => {
        const cdJsonable = JSON.parse(cdString);
        const cd = aas.jsonization.conceptDescriptionFromJsonable(cdJsonable).value;
        if (cd != null) cds.push(cd);
      });

      this.cursor = res.cursor;

      this.conceptDescriptions.set(cds);
      // After data has been updated, ensure the table scrolls back to the top
      this.scrollTableTop();
    } finally {
      this.loading.set(false);
    }
  }

  private scrollTableTop() {
    // Defer to next frame to ensure DOM has rendered the updated rows
    requestAnimationFrame(() => {
      const host = this.tableEl?.nativeElement;
      if (!host) return;
      // PrimeNG table wrapper that owns the vertical scroll
      const wrapper = host.querySelector<HTMLElement>('.p-datatable-wrapper, .p-table-wrapper');
      if (wrapper) {
        wrapper.scrollTo({ top: 0, behavior: 'auto' });
      } else {
        // Fallback: scroll the table itself into view if no inner scroll container exists
        host.scrollIntoView({ block: 'start' });
      }
    });
  }

  getSourceOfDefinition(cd: ConceptDescription) {
    if (
      cd.embeddedDataSpecifications?.[0].dataSpecificationContent != null &&
      cd.embeddedDataSpecifications?.[0].dataSpecificationContent instanceof DataSpecificationIec61360
    ) {
      return cd.embeddedDataSpecifications[0].dataSpecificationContent.sourceOfDefinition;
    }

    return '';
  }
  getDefinition(cd: ConceptDescription) {
    const currentLang = this.portalService.currentLanguage;
    if (
      cd.embeddedDataSpecifications?.[0].dataSpecificationContent != null &&
      cd.embeddedDataSpecifications?.[0].dataSpecificationContent instanceof DataSpecificationIec61360
    ) {
      const def = cd.embeddedDataSpecifications[0].dataSpecificationContent.definition;

      if (def?.find((d) => d.language === currentLang) != null) {
        return def?.find((d) => d.language === currentLang)?.text;
      }
      if (def?.find((d) => d.language === 'en') != null) {
        return def?.find((d) => d.language === 'en')?.text;
      }
      return def?.[0]?.text ?? '';
    }

    return '';
  }
  getPreferredName(cd: ConceptDescription) {
    const currentLang = this.portalService.currentLanguage;
    if (
      cd.embeddedDataSpecifications?.[0].dataSpecificationContent != null &&
      cd.embeddedDataSpecifications?.[0].dataSpecificationContent instanceof DataSpecificationIec61360
    ) {
      const def = cd.embeddedDataSpecifications[0].dataSpecificationContent.preferredName;

      if (def?.find((d) => d.language === currentLang) != null) {
        return def?.find((d) => d.language === currentLang)?.text;
      }
      if (def?.find((d) => d.language === 'en') != null) {
        return def?.find((d) => d.language === 'en')?.text;
      }
      return def?.[0]?.text ?? '';
    }

    return '';
  }

  applyCd(cd: ConceptDescription) {
    this.ref.close({ cd: cd, item: this.item });
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
    window.localStorage.setItem('shells-list-footer-state', this.pageSize().toString());
    this.cursor = undefined;
    this.firstPage.set(true);
    await this.loadPaged();
  }

  async loadNextPage() {
    this.firstPage.set(false);
    await this.loadPaged();
  }
}
