import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { PortalService } from '@aas/common-services';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { Select } from 'primeng/select';
import { HerstellerAdresse } from '../../../generator/model/hersteller-adresse';
import { V3TreeItem } from '../../../v3-editor/model/v3-tree-item';
import { AddressSelectionService } from './address-selection.service';

import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';

@Component({
  selector: 'aas-address-selection',
  templateUrl: './address-selection.component.html',
  imports: [Select, FormsModule, PrimeTemplate, Button, Divider, TranslateModule],
})
export class AddressSelectionComponent implements OnInit {
  @Input() editableNode: any;
  @Input() submodelElementCollection: V3TreeItem<aas.types.SubmodelElementCollection> | undefined | null;
  addressList: HerstellerAdresse[] = [];
  selectedAddress: HerstellerAdresse | null = null;
  loading: boolean = false;
  @Output() applied: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private addressService: AddressSelectionService,
    public portalService: PortalService,
    private cdRef: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      this.addressList = await this.addressService.getAllAddressData();
    } finally {
      this.loading = false;
    }
  }

  applyAddress() {
    if (this.editableNode != null) {
      let el = this.editableNode.value.find((v: any) => v.idShort.toLowerCase() === 'street');
      let elVal = el.value.find((e: any) => e.language === this.portalService.currentLanguage);
      if (elVal != null) {
        elVal.text = this.selectedAddress?.getDisplayStreet(this.portalService.currentLanguage);
      } else {
        el.value.push({
          language: this.portalService.currentLanguage,
          text: this.selectedAddress?.getDisplayStreet(this.portalService.currentLanguage),
        });
      }
      el = this.editableNode.value.find((v: any) => v.idShort.toLowerCase() === 'statecounty');
      elVal = el.value.find((e: any) => e.language === this.portalService.currentLanguage);
      if (elVal != null) {
        elVal.text = this.selectedAddress?.getDisplayState(this.portalService.currentLanguage);
      } else {
        el.value.push({
          language: this.portalService.currentLanguage,
          text: this.selectedAddress?.getDisplayState(this.portalService.currentLanguage),
        });
      }
      el = this.editableNode.value.find((v: any) => v.idShort.toLowerCase() === 'nationalcode');
      elVal = el.value.find((e: any) => e.language === this.portalService.currentLanguage);
      if (elVal != null) {
        elVal.text = this.selectedAddress?.laenderCode;
      } else {
        el.value.push({ language: this.portalService.currentLanguage, text: this.selectedAddress?.laenderCode });
      }
      el = this.editableNode.value.find((v: any) => v.idShort.toLowerCase() === 'citytown');
      elVal = el.value.find((e: any) => e.language === this.portalService.currentLanguage);
      if (elVal != null) {
        elVal.text = this.selectedAddress?.getDisplayCity(this.portalService.currentLanguage);
      } else {
        el.value.push({
          language: this.portalService.currentLanguage,
          text: this.selectedAddress?.getDisplayCity(this.portalService.currentLanguage),
        });
      }
      el = this.editableNode.value.find((v: any) => v.idShort.toLowerCase() === 'zipcode');
      elVal = el.value.find((e: any) => e.language === this.portalService.currentLanguage);
      if (elVal != null) {
        elVal.text = this.selectedAddress?.plz ?? '';
      } else {
        el.value.push({ language: this.portalService.currentLanguage, text: this.selectedAddress?.plz });
      }
    }

    if (this.submodelElementCollection?.content?.value != null) {
      let el = this.submodelElementCollection.content.value.find(
        (v: any) => v.idShort.toLowerCase() === 'street',
      ) as aas.types.MultiLanguageProperty;
      let elVal = el?.value?.find((e: any) => e.language === this.portalService.currentLanguage);
      if (elVal != null) {
        elVal.text = this.selectedAddress?.getDisplayStreet(this.portalService.currentLanguage) ?? '';
      } else {
        const newEl = new aas.types.LangStringTextType(
          this.portalService.currentLanguage,
          this.selectedAddress?.getDisplayStreet(this.portalService.currentLanguage) ?? '',
        );
        if (el.value == null) {
          el.value = [newEl];
        } else {
          el.value?.push(newEl);
        }
      }
      el = this.submodelElementCollection.content.value.find(
        (v: any) => v.idShort.toLowerCase() === 'statecounty',
      ) as aas.types.MultiLanguageProperty;
      if (el != null) {
        elVal = el?.value?.find((e: any) => e.language === this.portalService.currentLanguage);
        if (elVal != null) {
          elVal.text = this.selectedAddress?.getDisplayState(this.portalService.currentLanguage) ?? '';
        } else {
          const newEl = new aas.types.LangStringTextType(
            this.portalService.currentLanguage,
            this.selectedAddress?.getDisplayState(this.portalService.currentLanguage) ?? '',
          );
          if (el.value == null) {
            el.value = [newEl];
          } else {
            el.value?.push(newEl);
          }
        }
      }
      el = this.submodelElementCollection.content.value.find(
        (v: any) => v.idShort.toLowerCase() === 'nationalcode',
      ) as aas.types.MultiLanguageProperty;
      if (el != null) {
        elVal = el?.value?.find((e: any) => e.language === this.portalService.currentLanguage);
        if (elVal != null) {
          elVal.text = this.selectedAddress?.laenderCode ?? '';
        } else {
          const newEl = new aas.types.LangStringTextType(
            this.portalService.currentLanguage,
            this.selectedAddress?.laenderCode ?? '',
          );
          if (el.value == null) {
            el.value = [newEl];
          } else {
            el.value?.push(newEl);
          }
        }
      }
      el = this.submodelElementCollection.content.value.find(
        (v: any) => v.idShort.toLowerCase() === 'citytown',
      ) as aas.types.MultiLanguageProperty;
      if (el != null) {
        elVal = el?.value?.find((e: any) => e.language === this.portalService.currentLanguage);
        if (elVal != null) {
          elVal.text = this.selectedAddress?.getDisplayCity(this.portalService.currentLanguage) ?? '';
        } else {
          const newEl = new aas.types.LangStringTextType(
            this.portalService.currentLanguage,
            this.selectedAddress?.getDisplayCity(this.portalService.currentLanguage) ?? '',
          );
          if (el.value == null) {
            el.value = [newEl];
          } else {
            el.value?.push(newEl);
          }
        }
      }
      el = this.submodelElementCollection.content.value.find(
        (v: any) => v.idShort.toLowerCase() === 'zipcode',
      ) as aas.types.MultiLanguageProperty;
      if (el != null) {
        elVal = el?.value?.find((e: any) => e.language === this.portalService.currentLanguage);
        if (elVal != null) {
          elVal.text = this.selectedAddress?.plz ?? '';
        } else {
          const newEl = new aas.types.LangStringTextType(
            this.portalService.currentLanguage,
            this.selectedAddress?.plz ?? '',
          );
          if (el.value == null) {
            el.value = [newEl];
          } else {
            el.value?.push(newEl);
          }
        }
      }
    }
    this.applied.emit();
  }
}
