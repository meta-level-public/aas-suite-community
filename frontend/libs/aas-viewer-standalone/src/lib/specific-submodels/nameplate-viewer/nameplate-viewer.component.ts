import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { HelpLabelComponent } from '@aas/common-components';
import { DateProxyPipe } from '@aas/common-pipes';
import { ElementFinder, SemanticIdHelper } from '@aas/helpers';
import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, Input, OnChanges, signal, Type } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { lastValueFrom } from 'rxjs';
import { AasViewerService } from '../../aas-viewer.service';
import { MarkingsViewerPlainComponent } from '../../markings-viewer-plain/markings-viewer-plain.component';
import { ViewerStoreService } from '../../viewer-store.service';

@Component({
  selector: 'aas-nameplate-viewer',
  templateUrl: './nameplate-viewer.component.html',
  styleUrls: ['./nameplate-viewer.component.css'],
  imports: [
    MarkingsViewerPlainComponent,
    AsyncPipe,
    NgComponentOutlet,
    TranslateModule,
    DateProxyPipe,
    InputGroup,
    InputGroupAddon,
    InputText,
    HelpLabelComponent,
  ],
})
export class NameplateViewerComponent implements OnChanges {
  viewerStore = inject(ViewerStoreService);

  @Input({ required: true }) nameplate: aas.types.Submodel | undefined;
  @Input({ required: true }) currentLanguage = 'de';

  productImage: SafeUrl | undefined;

  markings: any[] = [];
  files: Map<string, SafeUrl> = new Map<string, SafeUrl>();
  markingsIdShortPath = signal('');
  indexed: boolean = false;
  productImageError = signal(false);
  manufacturerImageError = signal(false);
  private nameplateMapComponentLoader?: Promise<Type<unknown>>;

  constructor(
    private sanitizer: DomSanitizer,
    private aasxViewerService: AasViewerService,
    private translate: TranslateService,
    private http: HttpClient,
  ) {
    translate.onLangChange.subscribe((lang: any) => {
      this.currentLanguage = lang.lang;
    });
  }

  ngOnChanges(): void {
    this.productImageError.set(false);
    this.manufacturerImageError.set(false);
    this.init();
  }

  onProductImageError() {
    this.productImageError.set(true);
  }

  onProductImageLoad() {
    this.productImageError.set(false);
  }

  onManufacturerImageError() {
    this.manufacturerImageError.set(true);
  }

  onManufacturerImageLoad() {
    this.manufacturerImageError.set(false);
  }

  loadNameplateMapComponent(): Promise<Type<unknown>> {
    this.nameplateMapComponentLoader ??= import('./nameplate-map.component').then((m) => m.NameplateMapComponent);
    return this.nameplateMapComponentLoader;
  }

  nameplateMapInputs = computed(() => ({
    street: this.street(),
    zip: this.zip(),
    city: this.city(),
  }));

  init() {
    this.markings = [];
    if (this.nameplate != null) {
      const markingsElement = this.nameplate.submodelElements?.find(
        (sme: aas.types.ISubmodelElement) =>
          sme.idShort === 'Markings' ||
          SemanticIdHelper.hasSemanticId(sme, '0173-1#01-AGZ673#001') ||
          SemanticIdHelper.hasSemanticId(sme, '0112/2///61360_7#AAS006#001'),
      );
      this.indexed = false;
      if (markingsElement instanceof aas.types.SubmodelElementList) {
        this.indexed = true;
      }

      if (
        markingsElement instanceof aas.types.SubmodelElementCollection ||
        markingsElement instanceof aas.types.SubmodelElementList
      ) {
        markingsElement?.value?.forEach((el: any) => {
          this.markings.push(el);
        });
        this.markingsIdShortPath.set(markingsElement?.idShort ?? '');
      }
    }
  }

  manufacturerImage = computed(async () => {
    const idShortPath = this.companyLogoPath;
    const loadedImage = this.viewerStore
      .currentlyloadedFiles()
      .find((f) => f.submodelId === this.viewerStore.currentSubmodelId() && f.idShortPath === idShortPath);
    if (loadedImage?.blob != null) {
      return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(loadedImage.blob));
    } else {
      if (this.companyLogoPath != null) {
        if (this.companyLogoPath.startsWith('http')) {
          return this.companyLogoPath;
        } else {
          try {
            const url =
              this.viewerStore.currentSmUrl() + `/submodel-elements/${encodeURIComponent(idShortPath)}/attachment`;
            const thumb = await lastValueFrom(
              this.http.get<Blob>(url, {
                responseType: 'blob' as 'json',
                headers: this.viewerStore.headers(),
              }),
            );

            this.viewerStore.addFileToCurrentlyLoadedFiles({
              submodelId: this.viewerStore.currentSubmodelId(),
              idShortPath: idShortPath,
              path: this.companyLogoValue ?? 'thumbnail',
              blob: thumb,
            });

            return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(thumb));
          } catch {
            return null;
          }
        }
      }
      return null;
    }
  });

  get companyLogoPath() {
    const el = this.nameplate?.submodelElements?.find((e) =>
      this.hasSemanticId(e, 'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/CompanyLogo'),
    );
    return el?.idShort ?? '';
  }
  get companyLogoValue() {
    const el = this.nameplate?.submodelElements?.find((e) =>
      this.hasSemanticId(e, 'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/CompanyLogo'),
    );
    return (el as any)?.value ?? '';
  }

  manufacturer = computed(() => {
    const valV2 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'ManufacturerName',
      '0173-1#02-AAO677#002',
      this.currentLanguage,
    );
    const valV3 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'ManufacturerName',
      '0112/2///61987#ABA565#009',
      this.currentLanguage,
    );
    return valV2 !== '' ? valV2 : valV3;
  });

  productFamily = computed(() => {
    const valV2 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'ProductFamily',
      'falsch:0173-1#02-AAO677#002',
      this.currentLanguage,
    );
    const valV3 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'ManufacturerProductFamily',
      '0112/2///61987#ABP464#002',
      this.currentLanguage,
    );
    return valV2 !== '' ? valV2 : valV3;
  });

  productRoot = computed(() => {
    const valV2 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'ManufacturerProductRoot',
      '0173-1#02-AAU732#001',
      this.currentLanguage,
    );
    const valV3 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'ManufacturerProductRoot',
      '0112/2///61360_7#AAS011#001',
      this.currentLanguage,
    );
    return valV2 !== '' ? valV2 : valV3;
  });

  serialnumber = computed(() => {
    const valV2 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'SerialNumber',
      '0173-1#02-AAM556#002',
      this.currentLanguage,
    );
    const valV3 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'SerialNumber',
      '0112/2///61360_7#AAS011#001',
      this.currentLanguage,
    );
    return valV2 !== '' ? valV2 : valV3;
  });

  productDesignation = computed(() => {
    const valV2 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'ManufacturerProductDesignation',
      '0173-1#02-AAW338#001',
      this.currentLanguage,
    );
    const valV3 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'ManufacturerProductDesignation',
      '0112/2///61987#ABA567#009',
      this.currentLanguage,
    );
    return valV2 !== '' ? valV2 : valV3;
  });
  uriOfProduct = computed(() => {
    const valV2 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'UriOfTheProduct',
      '0173-1#02-AAY811#001',
      this.currentLanguage,
    );
    const valV3 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'UriOfTheProduct',
      '00112/2///61987#ABN590#002',
      this.currentLanguage,
    );
    return valV2 !== '' ? valV2 : valV3;
  });

  articleNumber = computed(() => {
    const valV2 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'ProductArticleNumberOfManufacturer',
      '0173-1#02-AAO676#003',
      this.currentLanguage,
    );
    const valV3 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'ProductArticleNumberOfManufacturer',
      '0112/2///61987#ABA581#007',
      this.currentLanguage,
    );
    return valV2 !== '' ? valV2 : valV3;
  });

  dateOfManufacturing = computed(() => {
    const valV2 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'DateOfManufacture',
      '0173-1#02-AAR972#002',
      this.currentLanguage,
    );
    const valV3 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'DateOfManufacture',
      '0112/2///61987#ABB757#007',
      this.currentLanguage,
    );
    return new Date(valV2 !== '' ? valV2 : valV3);
  });

  fwVersion = computed(() => {
    const valV2 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'FirmwareVersion',
      '0173-1#02-AAM985#002',
      this.currentLanguage,
    );
    const valV3 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'FirmwareVersion',
      '0112/2///61987#ABA302#006',
      this.currentLanguage,
    );
    return valV2 !== '' ? valV2 : valV3;
  });

  hwVersion = computed(() => {
    const valV2 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'HardwareVersion',
      '0173-1#02-AAN270#002',
      this.currentLanguage,
    );
    const valV3 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'HardwareVersion',
      '0112/2///61987#ABA926#008',
      this.currentLanguage,
    );
    return valV2 !== '' ? valV2 : valV3;
  });

  swVersion = computed(() => {
    const valV2 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'SoftwareVersion',
      '0173-1#02-AAM737#002',
      this.currentLanguage,
    );
    const valV3 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'SoftwareVersion',
      '0112/2///61987#ABA601#008',
      this.currentLanguage,
    );
    return valV2 !== '' ? valV2 : valV3;
  });

  yearOfConstruction = computed(() => {
    const valV2 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'YearOfConstruction',
      '0173-1#02-AAP906#001',
      this.currentLanguage,
    );
    const valV3 = ElementFinder.findElementText(
      this.nameplate?.submodelElements ?? [],
      'YearOfConstruction',
      '0112/2///61987#ABP000#002',
      this.currentLanguage,
    );
    return valV2 !== '' ? valV2 : valV3;
  });

  street = computed(() => {
    const addressEl = this.addressElement();
    return ElementFinder.findElementText(
      addressEl?.value ?? [],
      'Street',
      '0173-1#02-AAO128#002',
      this.currentLanguage,
    );
  });

  zip = computed(() => {
    const addressEl = this.addressElement();
    return ElementFinder.findElementText(
      addressEl?.value ?? [],
      'Zipcode',
      '0173-1#02-AAO129#002',
      this.currentLanguage,
    );
  });

  city = computed(() => {
    const addressEl = this.addressElement();
    return ElementFinder.findElementText(
      addressEl?.value ?? [],
      'CityTown',
      '0173-1#02-AAO132#002',
      this.currentLanguage,
    );
  });

  countryCode = computed(() => {
    const addressEl = this.addressElement();
    return ElementFinder.findElementText(
      addressEl?.value ?? [],
      'NationalCode',
      '0173-1#02-AAO134#002',
      this.currentLanguage,
    );
  });

  email = computed(() => {
    const emailEl = ElementFinder.findElement(this.addressElement()?.value ?? [], 'Email', '0173-1#02-AAQ836#005');
    return ElementFinder.findElementText(
      emailEl?.value ?? [],
      'EmailAddress',
      '0173-1#02-AAO198#002',
      this.currentLanguage,
    );
  });

  phone = computed(() => {
    const el = ElementFinder.findElement(this.addressElement()?.value ?? [], 'Phone', '0173-1#02-AAQ833#005');
    return ElementFinder.findElementText(
      el?.value ?? [],
      'TelephoneNumber',
      '0173-1#02-AAO136#002',
      this.currentLanguage,
    );
  });

  web = computed(() => {
    const el = ElementFinder.findElement(
      this.addressElement()?.value ?? [],
      'IPCommunication',
      'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation/IPCommunication/',
    );
    return ElementFinder.findElementText(
      el?.value ?? [],
      'AddressOfAdditionalLink',
      '0173-1#02-AAQ326#002',
      this.currentLanguage,
    );
  });

  addressElement = computed(() => {
    const contactInfo = ElementFinder.findElement(
      this.nameplate?.submodelElements ?? [],
      'ContactInformation',
      'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation',
    );
    const addressInfo = ElementFinder.findElement(
      this.nameplate?.submodelElements ?? [],
      'AddressInformation',
      'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation',
    );

    return contactInfo ?? addressInfo;
  });

  getMarkingFile(marking: any) {
    let val = marking.value?.find((sme: any) => sme.idShort === 'MarkingFile');
    if (val == null) {
      marking.value.forEach((sme: ISubmodelElement) => {
        if (
          sme.semanticId?.keys.find(
            (k) =>
              k.value.trim() === 'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingFile',
          ) != null
        ) {
          val = sme;
        }
      });
    }

    return val;
  }
  getMarkingFileValue(marking: any) {
    return this.getMarkingFile(marking)?.value ?? '';
  }

  getMarkingFileIdShort(marking: any) {
    return this.getMarkingFile(marking)?.idShort ?? '';
  }

  hasSemanticId(sme: aas.types.ISubmodelElement, semanticId: string) {
    return sme.semanticId?.keys.find((k) => k.value.trim() === semanticId) != null;
  }

  isInstance = computed(() => {
    return this.viewerStore.aas()?.assetInformation.assetKind === aas.types.AssetKind.Instance;
  });
}
