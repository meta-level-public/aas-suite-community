import { ShellListDto, ShellListVm, ShellsClient, ShellSearchParams } from '@aas/webapi-client';
import { Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { lastValueFrom } from 'rxjs';

export interface ShellSearchOpenResult {
  type: 'open';
  shellId: string;
  action: 'view' | 'edit';
}

@Component({
  selector: 'aas-shells-search',
  imports: [FormsModule, TranslateModule, InputTextModule, ButtonModule],
  templateUrl: './shells-search.component.html',
  styleUrl: './shells-search.component.scss',
})
export class ShellsSearchComponent {
  private readonly inlineSelectionThreshold = 20;

  idShort = model('');
  globalAssetId = model('');

  shellsClient = inject(ShellsClient);
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  translate = inject(TranslateService);

  loading = signal(false);
  errorMessage = signal('');
  lastResult = signal<ShellListVm | null>(null);
  inlineResults = signal<ShellListDto[]>([]);
  lastHitCount = signal<number | null>(null);

  canEdit() {
    return this.config.data?.canEdit === true;
  }

  hasCriteria() {
    return this.idShort().trim() !== '' || this.globalAssetId().trim() !== '';
  }

  reset() {
    this.idShort.set('');
    this.globalAssetId.set('');
    this.errorMessage.set('');
    this.lastResult.set(null);
    this.inlineResults.set([]);
    this.lastHitCount.set(null);
  }

  async search() {
    const idShort = this.idShort().trim();
    const globalAssetId = this.globalAssetId().trim();
    if (idShort === '' && globalAssetId === '') {
      this.errorMessage.set(this.translate.instant('SHELL_SEARCH_MIN_CRITERIA'));
      return;
    }

    const searchParams = new ShellSearchParams();
    searchParams.idShort = idShort;
    searchParams.globalAssetId = globalAssetId;

    try {
      this.loading.set(true);
      this.errorMessage.set('');
      const res = await lastValueFrom(this.shellsClient.shells_Search(searchParams));
      const hits = res.shells ?? [];
      this.lastResult.set(res);
      this.lastHitCount.set(hits.length);

      if (hits.length <= this.inlineSelectionThreshold) {
        this.inlineResults.set(hits);
        return;
      }

      this.inlineResults.set([]);
    } catch (_error) {
      this.errorMessage.set(this.translate.instant('SHELL_SEARCH_FAILED'));
    } finally {
      this.loading.set(false);
    }
  }

  showAllFound() {
    const res = this.lastResult();
    if (res == null) return;
    this.ref.close(res);
  }

  openShell(shell: ShellListDto, action: 'view' | 'edit') {
    if (!shell.id) return;
    const result: ShellSearchOpenResult = {
      type: 'open',
      shellId: shell.id,
      action,
    };
    this.ref.close(result);
  }
}
