import { DateProxyPipe } from '@aas/common-pipes';
import { NotificationService } from '@aas/common-services';
import { ProductDesignationClient, ProductDesignationDto } from '@aas/webapi-client';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { lastValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from '@aas/aas-designer-shared';
import { V3LangStringListComponent } from '../../v3-editor';

@Component({
  selector: 'aas-product-designation-catalog',
  templateUrl: './product-designation-catalog.component.html',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    TableModule,
    DialogModule,
    SelectModule,
    TagModule,
    MenuModule,
    ToolbarModule,
    InputTextModule,
    V3LangStringListComponent,
    ConfirmDialogComponent,
    DateProxyPipe,
  ],
  providers: [ConfirmationService],
  styleUrls: ['../../../host.scss'],
})
export class ProductDesignationCatalogComponent implements OnInit {
  productDesignations = signal<ProductDesignationDto[]>([]);

  loading = false;
  menuItems: MenuItem[] = [];
  items: MenuItem[] = [];
  displayproductDesignationModal = false;
  productDesignationModalOption = '';

  productDesignationDialogEntry = this.resetproductDesignation();

  productDesignationClient = inject(ProductDesignationClient);
  constructor(
    private translate: TranslateService,
    private confirmationService: ConfirmationService,
    private notificationService: NotificationService,
  ) {}

  async ngOnInit() {
    await this.loadProductDesignations();
  }

  editproductDesignation(productDesignation: any) {
    this.productDesignationModalOption = 'update';
    this.productDesignationDialogEntry = cloneDeep(productDesignation);
    this.displayproductDesignationModal = true;
  }

  createAddress() {
    this.productDesignationModalOption = 'new';
    this.productDesignationDialogEntry = this.resetproductDesignation();
    this.displayproductDesignationModal = true;
  }
  async loadProductDesignations() {
    try {
      this.loading = true;
      this.productDesignations.set(
        await lastValueFrom(this.productDesignationClient.productDesignation_GetAllProductDesignations()),
      );
    } finally {
      this.loading = false;
    }
  }

  async deleteproductDesignation(productDesignation: ProductDesignationDto) {
    try {
      if (productDesignation.id != null) {
        await lastValueFrom(
          this.productDesignationClient.productDesignation_DeleteProductDesignation(productDesignation.id),
        );
        this.notificationService.showMessageAlways(
          'PRODUCT_DESIGNATION_HAS_BEEN_DELETED_SUCCESSFULLY',
          'SUCCESS',
          'success',
          false,
        );
      }
    } finally {
      this.reload();
    }
  }

  onShowActions(productDesignation: ProductDesignationDto) {
    this.menuItems = [
      {
        label: this.translate.instant('EDIT'),
        icon: 'pi pi-pencil',
        command: (_event: any) => {
          this.editproductDesignation(productDesignation);
        },
      },
      {
        separator: true,
      },
      {
        label: this.translate.instant('DELETE'),
        icon: 'pi pi-trash',
        command: (_event) => {
          this.confirmationService.confirm({
            message: `${this.translate.instant('THE_FOLLOWING_CONTENT_WILL_BE_DELETED', { content: productDesignation.name })}`,
            accept: () => {
              this.deleteproductDesignation(productDesignation);
            },
          });
        },
      },
    ];
  }

  async saveNewproductDesignation() {
    try {
      this.loading = true;
      if (this.productDesignationModalOption === 'new') {
        await lastValueFrom(
          this.productDesignationClient.productDesignation_AddProductDesignation(this.productDesignationDialogEntry),
        );
        this.notificationService.showMessageAlways(
          'PRODUCT_DESIGNATION_HAS_BEEN_ADDED_TO_CATALOG_SUCCESSFULLY',
          'SUCCESS',
          'success',
          false,
        );
      }

      if (this.productDesignationModalOption === 'update') {
        await lastValueFrom(
          this.productDesignationClient.productDesignation_UpdateProductDesignation(this.productDesignationDialogEntry),
        );
        this.notificationService.showMessageAlways(
          'PRODUCT_DESIGNATION_HAS_BEEN_UPDATED_IN_CATALOG_SUCCESSFULLY',
          'SUCCESS',
          'success',
          false,
        );
      }
    } finally {
      this.reload();
    }
  }

  dataValid() {
    if (this.productDesignationDialogEntry.name?.length === 0) {
      return false;
    }

    return true;
  }

  private resetproductDesignation() {
    return new ProductDesignationDto();
  }

  private reload() {
    // this.productFamilies = [];
    this.productDesignationDialogEntry = this.resetproductDesignation();
    this.displayproductDesignationModal = false;
    this.productDesignationModalOption = '';
    this.loadProductDesignations();
  }
}
