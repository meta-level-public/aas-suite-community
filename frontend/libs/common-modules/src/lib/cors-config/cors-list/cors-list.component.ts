import { DateProxyPipe } from '@aas/common-pipes';
import { AasConfirmationService } from '@aas/common-services';
import { CorsConfig } from '@aas/model';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { Textarea } from 'primeng/textarea';
import { CorsConfigService } from '../cors-config.service';

@Component({
  selector: 'aas-cors-list',
  templateUrl: './cors-list.component.html',
  styleUrls: ['../../host.scss'],
  imports: [
    Button,
    TableModule,
    PrimeTemplate,
    Menu,
    Dialog,
    FormsModule,
    InputText,
    Textarea,
    TranslateModule,
    DateProxyPipe,
  ],
})
export class CorsListComponent implements OnInit {
  configs: CorsConfig[] = [];
  loading: boolean = false;
  menuItems: MenuItem[] = [];
  loadingDownload: boolean = false;
  displayUploadDialog: boolean = false;

  displayEditDialog: boolean = false;
  editConfig: CorsConfig | null = null;
  editMode: 'insert' | 'update' = 'insert';

  constructor(
    private corsConfigService: CorsConfigService,
    private translate: TranslateService,
    private confirmationService: AasConfirmationService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    try {
      this.loading = true;
      this.configs = await this.corsConfigService.getAll();
    } finally {
      this.loading = false;
    }
  }

  onShowActions(config: CorsConfig) {
    this.menuItems = [
      {
        label: this.translate.instant('EDIT'),
        icon: 'pi pi-pencil',
        command: () => {
          this.showEditDialog(config);
        },
      },
      {
        label: this.translate.instant('DELETE'),
        icon: 'pi pi-trash',
        command: () => {
          if (config.id != null) {
            this.deleteConfig(config.id);
          }
        },
      },
    ];
  }
  async deleteConfig(id: number) {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('DELETE_CONFIG_Q'),
      })
    ) {
      await this.corsConfigService.delete(id);
      this.loadData();
    }
  }

  showEditDialog(smt: CorsConfig) {
    this.displayEditDialog = true;
    this.editMode = 'update';
    this.editConfig = smt;
  }

  async doEdit() {
    if (this.editConfig != null) {
      try {
        this.loading = true;
        if (this.editMode === 'insert') {
          await this.corsConfigService.insert(this.editConfig);
        } else {
          await this.corsConfigService.edit(this.editConfig);
        }

        // erstmal komplette tabelle, später vielleicht anhand der id
        this.loadData();
        this.displayEditDialog = false;
      } finally {
        this.loading = false;
      }
    }
  }

  showCreateDialog() {
    this.displayEditDialog = true;
    this.editMode = 'insert';
    this.editConfig = new CorsConfig();
  }
}
