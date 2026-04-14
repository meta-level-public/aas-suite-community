import { DateProxyPipe } from '@aas/common-pipes';
import { NotificationService } from '@aas/common-services';
import { ProductRootClient, ProductRootDto } from '@aas/webapi-client';
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
  selector: 'aas-product-root-catalog',
  templateUrl: './product-root-catalog.component.html',
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
export class ProductRootCatalogComponent implements OnInit {
  productRoots = signal<ProductRootDto[]>([]);

  loading = false;
  menuItems: MenuItem[] = [];
  items: MenuItem[] = [];
  displayproductRootModal = false;
  productRootModalOption = '';

  productRootDialogEntry = this.resetproductRoot();

  productRootClient = inject(ProductRootClient);
  constructor(
    private translate: TranslateService,
    private confirmationService: ConfirmationService,
    private notificationService: NotificationService,
  ) {}

  async ngOnInit() {
    await this.loadProductRoots();
  }

  editproductRoot(productRoot: any) {
    this.productRootModalOption = 'update';
    this.productRootDialogEntry = cloneDeep(productRoot);
    this.displayproductRootModal = true;
  }

  createAddress() {
    this.productRootModalOption = 'new';
    this.productRootDialogEntry = this.resetproductRoot();
    this.displayproductRootModal = true;
  }
  async loadProductRoots() {
    try {
      this.loading = true;
      this.productRoots.set(await lastValueFrom(this.productRootClient.productRoot_GetAllProductRoots()));
    } finally {
      this.loading = false;
    }
  }

  async deleteproductRoot(productRoot: ProductRootDto) {
    try {
      if (productRoot.id != null) {
        await lastValueFrom(this.productRootClient.productRoot_DeleteProductRoot(productRoot.id));
        this.notificationService.showMessageAlways(
          'PRODUCT_ROOT_HAS_BEEN_DELETED_SUCCESSFULLY',
          'SUCCESS',
          'success',
          false,
        );
      }
    } finally {
      this.reload();
    }
  }

  onShowActions(productRoot: ProductRootDto) {
    this.menuItems = [
      {
        label: this.translate.instant('EDIT'),
        icon: 'pi pi-pencil',
        command: (_event: any) => {
          this.editproductRoot(productRoot);
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
            message: `${this.translate.instant('THE_FOLLOWING_CONTENT_WILL_BE_DELETED', { content: productRoot.name })}`,
            accept: () => {
              this.deleteproductRoot(productRoot);
            },
          });
        },
      },
    ];
  }

  async saveNewproductRoot() {
    try {
      this.loading = true;
      if (this.productRootModalOption === 'new') {
        await lastValueFrom(this.productRootClient.productRoot_AddProductRoot(this.productRootDialogEntry));
        this.notificationService.showMessageAlways(
          'PRODUCT_ROOT_HAS_BEEN_ADDED_TO_CATALOG_SUCCESSFULLY',
          'SUCCESS',
          'success',
          false,
        );
      }

      if (this.productRootModalOption === 'update') {
        await lastValueFrom(this.productRootClient.productRoot_UpdateProductRoot(this.productRootDialogEntry));
        this.notificationService.showMessageAlways(
          'PRODUCT_ROOT_HAS_BEEN_UPDATED_IN_CATALOG_SUCCESSFULLY',
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
    if (this.productRootDialogEntry.name?.length === 0) {
      return false;
    }

    return true;
  }

  private resetproductRoot() {
    return new ProductRootDto();
  }

  private reload() {
    // this.productFamilies = [];
    this.productRootDialogEntry = this.resetproductRoot();
    this.displayproductRootModal = false;
    this.productRootModalOption = '';
    this.loadProductRoots();
  }
}
