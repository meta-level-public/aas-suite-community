import { ConfirmDialogComponent } from '@aas/aas-designer-shared';
import { DateProxyPipe } from '@aas/common-pipes';
import { NotificationService } from '@aas/common-services';
import { ProductFamilyClient, ProductFamilyDto } from '@aas/webapi-client';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { lastValueFrom } from 'rxjs';
import { V3LangStringListComponent } from '../../v3-editor';

@Component({
  selector: 'aas-product-family-catalog',
  templateUrl: './product-family-catalog.component.html',
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
    InputGroupModule,
    InputGroupAddonModule,
    V3LangStringListComponent,
    ConfirmDialogComponent,
    DateProxyPipe,
  ],
  styleUrls: ['../../../host.scss'],
})
export class ProductFamilyCatalogComponent implements OnInit {
  productFamilies = signal<ProductFamilyDto[]>([]);
  loading = false;
  menuItems: MenuItem[] = [];
  items: MenuItem[] = [];
  displayProductFamilyModal = false;
  productFamilyModalOption = '';

  productFamilyDialogEntry = this.resetProductFamily();

  productFamilyClient = inject(ProductFamilyClient);

  constructor(
    private translate: TranslateService,
    private confirmationService: ConfirmationService,
    private notificationService: NotificationService,
  ) {}

  async ngOnInit() {
    await this.getAllProductFamilies();
  }

  editProductFamily(productFamily: any) {
    this.productFamilyModalOption = 'update';
    this.productFamilyDialogEntry = cloneDeep(productFamily);
    this.displayProductFamilyModal = true;
  }

  createAddress() {
    this.productFamilyModalOption = 'new';
    this.productFamilyDialogEntry = this.resetProductFamily();
    this.displayProductFamilyModal = true;
  }
  async getAllProductFamilies() {
    try {
      this.loading = true;
      this.productFamilies.set(await lastValueFrom(this.productFamilyClient.productFamily_GetAllProductFamilys()));
    } finally {
      this.loading = false;
    }
  }

  async deleteProductFamily(productFamily: ProductFamilyDto) {
    try {
      if (productFamily.id != null) {
        await lastValueFrom(this.productFamilyClient.productFamily_DeleteProductFamily(productFamily.id));
        this.notificationService.showMessageAlways(
          'PRODUCT_FAMILY_HAS_BEEN_DELETED_SUCCESSFULLY',
          'SUCCESS',
          'success',
          false,
        );
      }
    } finally {
      this.reload();
    }
  }
  onShowActions(productFamily: ProductFamilyDto) {
    this.menuItems = [
      {
        label: this.translate.instant('EDIT'),
        icon: 'pi pi-pencil',
        command: (_event: any) => {
          this.editProductFamily(productFamily);
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
            message: `${this.translate.instant('THE_FOLLOWING_CONTENT_WILL_BE_DELETED', { content: productFamily.name })}`,
            accept: () => {
              this.deleteProductFamily(productFamily);
            },
          });
        },
      },
    ];
  }

  /** Create Address */
  async saveNewProductFamily() {
    try {
      this.loading = true;
      if (this.productFamilyModalOption === 'new') {
        await lastValueFrom(this.productFamilyClient.productFamily_AddProductFamily(this.productFamilyDialogEntry));
        this.notificationService.showMessageAlways(
          'PRODUCT_FAMILY_HAS_BEEN_ADDED_TO_CATALOG_SUCCESSFULLY',
          'SUCCESS',
          'success',
          false,
        );
      }

      if (this.productFamilyModalOption === 'update') {
        await lastValueFrom(this.productFamilyClient.productFamily_UpdateProductFamily(this.productFamilyDialogEntry));
        this.notificationService.showMessageAlways(
          'PRODUCT_FAMILY_HAS_BEEN_ADDED_UPDATED_IN_CATALOG_SUCCESSFULLY',
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
    if (this.productFamilyDialogEntry.name?.length === 0) {
      return false;
    }

    return true;
  }

  private resetProductFamily() {
    return new ProductFamilyDto();
  }

  private reload() {
    this.productFamilies.set([]);
    this.productFamilyDialogEntry = this.resetProductFamily();
    this.displayProductFamilyModal = false;
    this.productFamilyModalOption = '';
    this.getAllProductFamilies();
  }
}
