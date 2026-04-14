import { ConfirmDialogComponent } from '@aas/aas-designer-shared';
import { CountryCodeComponent } from '@aas/common-components';
import { NotificationService } from '@aas/common-services';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { MultilanguagePropertyComponent } from '../../general/structural-elements/multilanguage-property/multilanguage-property.component';
import { HerstellerAdresse } from '../../generator/model/hersteller-adresse';
import { AddressCatalogService } from '../service/address-catalog.service';

@Component({
  selector: 'aas-address-catalog',
  templateUrl: './address-catalog.component.html',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    TableModule,
    DialogModule,
    TagModule,
    CountryCodeComponent,
    MenuModule,
    ToolbarModule,
    InputTextModule,
    ConfirmDialogComponent,
    MultilanguagePropertyComponent,
  ],
  providers: [ConfirmationService],
  styleUrls: ['../../../host.scss'],
})
export class AddressCatalogComponent implements OnInit {
  addresses: any;
  loading = false;
  menuItems: MenuItem[] = [];
  items: MenuItem[] = [];
  displayAddressModal = false;
  addressModalOption = '';

  addressDialogEntry: HerstellerAdresse = this.resetAddress();
  constructor(
    private addressCatalogService: AddressCatalogService,
    private translate: TranslateService,
    private confirmationService: ConfirmationService,
    private notificationService: NotificationService,
  ) {}

  async ngOnInit() {
    await this.getAllAddresses();
  }

  editAddress(address: HerstellerAdresse) {
    this.addressModalOption = 'update';
    this.addressDialogEntry = cloneDeep(address);
    this.addressDialogEntry = this.slimAddress(this.addressDialogEntry);
    this.displayAddressModal = true;
  }

  createAddress() {
    this.addressModalOption = 'new';
    this.addressDialogEntry = this.resetAddress();
    this.displayAddressModal = true;
  }
  async getAllAddresses() {
    try {
      this.loading = true;
      this.addresses = await this.addressCatalogService.getAllAddressData();
    } finally {
      this.loading = false;
    }
  }

  async deleteAddress(address: HerstellerAdresse) {
    try {
      if (address.id !== undefined) {
        const deleted = await this.addressCatalogService.deleteAddressById(address.id as number);
        if (deleted) {
          this.notificationService.showMessageAlways(
            'ADDRESS_HAS_BEEN_DELETED_SUCCESSFULLY',
            'SUCCESS',
            'success',
            false,
          );
        } else {
          this.notificationService.showMessageAlways('ADDRESS_COULD_NOT_BE_DELETED', 'ERROR', 'error', false);
        }
      }
    } finally {
      this.reload();
    }
  }
  onShowActions(address: HerstellerAdresse) {
    this.menuItems = [
      {
        label: this.translate.instant('EDIT'),
        icon: 'pi pi-pencil',
        command: (_event: any) => {
          this.editAddress(address);
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
            message: `${this.translate.instant('THE_FOLLOWING_CONTENT_WILL_BE_DELETED', { content: address.strasse + ' ' + address.plz + ' ' + address.ort })}`,
            accept: () => {
              this.deleteAddress(address);
            },
          });
        },
      },
    ];
  }

  /** Create Address */
  async saveNewAddress() {
    try {
      this.loading = true;
      if (this.addressModalOption === 'new') {
        await this.addressCatalogService.createAddress(this.addressDialogEntry);
      }

      if (this.addressModalOption === 'update') {
        await this.addressCatalogService.updateAddress(this.addressDialogEntry);
      }

      this.notificationService.showMessageAlways(
        'ADDRESS_HAS_BEEN_ADDED_TO_CATALOG_SUCCESSFULLY',
        'SUCCESS',
        'success',
        false,
      );
    } finally {
      this.reload();
    }
  }

  dataValid() {
    if (this.addressDialogEntry.laenderCode?.length === 0) {
      return false;
    }

    if (!this.hasBilingualContent(this.addressDialogEntry.nameMlpKeyValues)) {
      return false;
    }

    if (!this.hasBilingualContent(this.addressDialogEntry.strasseMlpKeyValues)) {
      return false;
    }

    if (this.addressDialogEntry.plz?.length === 0) {
      return false;
    }

    if (!this.hasBilingualContent(this.addressDialogEntry.ortMlpKeyValues)) {
      return false;
    }

    if (!this.hasBilingualContent(this.addressDialogEntry.bundeslandMlpKeyValues)) {
      return false;
    }

    return true;
  }

  setCountryCode(countryCode: string) {
    this.addressDialogEntry.laenderCode = countryCode;
  }

  private resetAddress(): HerstellerAdresse {
    return HerstellerAdresse.createEmpty();
  }

  private slimAddress(address: HerstellerAdresse): HerstellerAdresse {
    return HerstellerAdresse.fromDto({
      id: address.id,
      name: address.name,
      nameMlpKeyValues: address.nameMlpKeyValues,
      laenderCode: address.laenderCode,
      strasse: address.strasse,
      strasseMlpKeyValues: address.strasseMlpKeyValues,
      plz: address.plz,
      ort: address.ort,
      ortMlpKeyValues: address.ortMlpKeyValues,
      bundesland: address.bundesland,
      bundeslandMlpKeyValues: address.bundeslandMlpKeyValues,
    });
  }

  private hasBilingualContent(values: Array<{ language: string; text: string }> | undefined) {
    return ['de', 'en'].every((language) =>
      values?.some((entry) => entry.language === language && entry.text.trim() !== ''),
    );
  }

  private reload() {
    this.addresses = [];
    this.addressDialogEntry = this.resetAddress();
    this.displayAddressModal = false;
    this.addressModalOption = '';
    this.getAllAddresses();
  }
}
