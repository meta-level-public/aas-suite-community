import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { HelpLabelComponent } from '@aas/common-components';
import { SemanticIdHelper } from '@aas/helpers';
import { Component, inject, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputText } from '@openng/optimus-ui/inputtext';
import { TableModule } from '@openng/optimus-ui/table';
import { Tag } from '@openng/optimus-ui/tag';
import { ConceptUnitService, inlineUnitOf, semanticIdOf } from '../../concept-unit.service';
import { SemanticDescriptionPopupComponent } from '../../semantic-description-popup/semantic-description-popup.component';
import { ContactInformation } from '../contact-information-viewer/contact-information';
import { ContactInformationMap } from '../contact-information-viewer/contact-information-map.component';
import { getInstalledVersionStatus, InstalledVersionStatus } from './software-version.util';

type ConfigurationPathRow = { uri: string; type: string };

@Component({
  selector: 'aas-software-nameplate-viewer',
  templateUrl: './software-nameplate-viewer.component.html',
  styleUrls: ['./software-nameplate-viewer.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    InputGroup,
    InputGroupAddon,
    InputText,
    TableModule,
    ContactInformationMap,
    Tag,
    TranslateModule,
    HelpLabelComponent,
    SemanticDescriptionPopupComponent,
  ],
})
export class SoftwareNameplateViewerComponent implements OnChanges {
  @Input({ required: true }) submodel: aas.types.Submodel | undefined;
  @Input({ required: true }) currentLanguage = 'de';

  manufacturerName = '';
  manufacturerProductDesignation = '';
  manufacturerProductDescription = '';
  manufacturerProductFamily = '';
  manufacturerProductType = '';
  softwareType = '';
  uriOfTheProduct = '';

  version = '';
  versionName = '';
  versionInfo = '';
  releaseDate = '';
  buildDate = '';
  releaseInformation = '';
  releaseNotes = '';

  installationURI = '';
  installationFile = '';
  installerType = '';
  installationChecksum = '';

  serialNumber = '';
  inventoryTag = '';
  instanceName = '';
  installedVersion = '';
  installationDate = '';
  installationPath = '';
  installationSource = '';
  installedOnArchitecture = '';
  installedOnOS = '';
  installedOnHost = '';
  slaInformation = '';

  contactRole = '';
  contactName = '';
  contactFirstName = '';
  contactDepartment = '';
  contactCompany = '';
  contactStreet = '';
  contactZip = '';
  contactCity = '';
  contactState = '';
  contactCountryCode = '';
  contactLanguage = '';
  contactTimeZone = '';
  contactEmail = '';
  contactTelephone = '';
  contactFax = '';
  contactLink = '';
  contactFurtherDetails = '';

  installedModules: string[] = [];
  configurationPaths: ConfigurationPathRow[] = [];
  mapContact: ContactInformation = {
    id: 'SoftwareContact',
    company: '',
    name: '',
    email: '',
    phone: '',
    fax: '',
    street: '',
    zip: '',
    city: '',
    countryCode: '',
    showLayer: true,
    language: '',
    department: '',
    ipcom: '',
  };
  showContactMap = false;
  /** Semantic IDs of the configuration path columns, taken from the first entry. */
  configurationColumnSemanticIds = { uri: '', type: '' };

  /** Elements behind the single-value fields by idShort (semantic ID for the "?" and the unit). */
  private readonly fieldElements = new Map<string, ISubmodelElement>();
  private readonly units = inject(ConceptUnitService);

  /** Icon for the header, derived from the free-text software type. */
  get softwareIcon() {
    const type = this.softwareType.toLowerCase();
    if (type.includes('firmware')) return 'fa-solid fa-microchip';
    if (type.includes('operating') || type.includes('betriebssystem')) return 'fa-solid fa-desktop';
    if (type.includes('librar') || type.includes('bibliothek') || type.includes('module')) return 'fa-solid fa-cubes';
    if (type.includes('service') || type.includes('server') || type.includes('dienst')) return 'fa-solid fa-server';
    if (type.includes('app')) return 'fa-solid fa-window-restore';
    return 'fa-solid fa-code';
  }

  get installedVersionStatus(): InstalledVersionStatus | null {
    return getInstalledVersionStatus(this.installedVersion, this.version);
  }

  get hasReleaseDetails() {
    return [this.versionInfo, this.releaseDate, this.buildDate, this.releaseNotes, this.releaseInformation].some(
      (value) => value !== '',
    );
  }

  get hasInstallationPackage() {
    return [this.installationURI, this.installationFile, this.installerType, this.installationChecksum].some(
      (value) => value !== '',
    );
  }

  get hasInstance() {
    return [
      this.instanceName,
      this.installedVersion,
      this.installationDate,
      this.installationPath,
      this.installationSource,
      this.installedOnArchitecture,
      this.installedOnOS,
      this.installedOnHost,
      this.serialNumber,
      this.inventoryTag,
      this.slaInformation,
    ].some((value) => value !== '');
  }

  constructor(private translate: TranslateService) {
    translate.onLangChange.subscribe((lang: any) => {
      this.currentLanguage = lang.lang;
      this.rebuildView();
    });
  }

  ngOnChanges(): void {
    this.rebuildView();
  }

  /** Semantic ID of a field (by idShort) for the "?" to its concept description. */
  fieldSemanticId(idShort: string): string {
    return semanticIdOf(this.fieldElements.get(idShort));
  }

  /** Unit of a field (at the element or from its concept description). */
  fieldUnit(idShort: string): string {
    const element = this.fieldElements.get(idShort);
    return this.units.unit(semanticIdOf(element), inlineUnitOf(element));
  }

  private rebuildView() {
    this.fieldElements.clear();
    const typeSection = this.findCollection(
      this.submodel?.submodelElements ?? [],
      'SoftwareNameplateType',
      'https://admin-shell.io/idta/SoftwareNameplate/1/0/SoftwareNameplate/SoftwareNameplateType',
    );
    const instanceSection = this.findCollection(
      this.submodel?.submodelElements ?? [],
      'SoftwareNameplateInstance',
      'https://admin-shell.io/idta/SoftwareNameplate/1/0/SoftwareNameplate/SoftwareNameplateInstance',
    );

    this.manufacturerName = this.readValue(typeSection, 'ManufacturerName');
    this.manufacturerProductDesignation = this.readValue(typeSection, 'ManufacturerProductDesignation');
    this.manufacturerProductDescription = this.readValue(typeSection, 'ManufacturerProductDescription');
    this.manufacturerProductFamily = this.readValue(typeSection, 'ManufacturerProductFamily');
    this.manufacturerProductType = this.readValue(typeSection, 'ManufacturerProductType');
    this.softwareType = this.readValue(typeSection, 'SoftwareType');
    this.uriOfTheProduct = this.readValue(typeSection, 'URIOfTheProduct');

    this.version = this.readValue(typeSection, 'Version');
    this.versionName = this.readValue(typeSection, 'VersionName');
    this.versionInfo = this.readValue(typeSection, 'VersionInfo');
    this.releaseDate = this.readValue(typeSection, 'ReleaseDate');
    this.buildDate = this.readValue(typeSection, 'BuildDate');
    this.releaseInformation = this.readValue(typeSection, 'ReleaseInformation');
    this.releaseNotes = this.readValue(typeSection, 'ReleaseNotes');

    this.installationURI = this.readValue(typeSection, 'InstallationURI');
    this.installationFile = this.readValue(typeSection, 'InstallationFile');
    this.installerType = this.readValue(typeSection, 'InstallerType');
    this.installationChecksum = this.readValue(typeSection, 'InstallationChecksum');

    this.serialNumber = this.readValue(instanceSection, 'SerialNumber');
    this.inventoryTag = this.readValue(instanceSection, 'InventoryTag');
    this.instanceName = this.readValue(instanceSection, 'InstanceName');
    this.installedVersion = this.readValue(instanceSection, 'InstalledVersion');
    this.installationDate = this.readValue(instanceSection, 'InstallationDate');
    this.installationPath = this.readValue(instanceSection, 'InstallationPath');
    this.installationSource = this.readValue(instanceSection, 'InstallationSource');
    this.installedOnArchitecture = this.readValue(instanceSection, 'InstalledOnArchitecture');
    this.installedOnOS = this.readValue(instanceSection, 'InstalledOnOS');
    this.installedOnHost = this.readValue(instanceSection, 'InstalledOnHost');
    this.slaInformation = this.readValue(instanceSection, 'SLAInformation');

    const contactSection = this.findCollection(
      instanceSection?.value ?? [],
      'Contact',
      'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation',
    );
    this.contactRole = this.readValue(contactSection, 'RoleOfContactPerson');
    this.contactName = this.readValue(contactSection, 'NameOfContact');
    this.contactFirstName = this.readValue(contactSection, 'FirstName');
    this.contactDepartment = this.readValue(contactSection, 'Department');
    this.contactCompany = this.readValue(contactSection, 'Company');
    this.contactStreet = this.readValue(contactSection, 'Street');
    this.contactZip = this.readValue(contactSection, 'Zipcode');
    this.contactCity = this.readValue(contactSection, 'CityTown');
    this.contactState = this.readValue(contactSection, 'StateCounty');
    this.contactCountryCode = this.readValue(contactSection, 'NationalCode');
    this.contactLanguage = this.readValue(contactSection, 'Language');
    this.contactTimeZone = this.readValue(contactSection, 'TimeZone');
    this.contactEmail = this.readValue(contactSection, 'EmailAddress');
    this.contactTelephone = this.readValue(contactSection, 'TelephoneNumber');
    this.contactFax = this.readValue(contactSection, 'FaxNumber');
    this.contactLink = this.readValue(contactSection, 'AddressOfAdditionalLink');
    this.contactFurtherDetails = this.readValue(contactSection, 'FurtherDetailsOfContact');

    const installedModules = this.findCollection(
      instanceSection?.value ?? [],
      'InstalledModules',
      'https://admin-shell.io/idta/SoftwareNameplate/1/0/SoftwareNameplate/SoftwareNameplateInstance/InstalledModules',
    );
    this.installedModules = (installedModules?.value ?? []).map((entry) => this.getText(entry)).filter((x) => x !== '');

    const configurationPathsSection = this.findCollection(
      instanceSection?.value ?? [],
      'ConfigurationPaths',
      'https://admin-shell.io/idta/SoftwareNameplate/1/0/SoftwareNameplate/SoftwareNameplateInstance/ConfigurationPaths',
    );
    this.configurationPaths = [];
    this.configurationColumnSemanticIds = { uri: '', type: '' };
    for (const entry of configurationPathsSection?.value ?? []) {
      if (!(entry instanceof aas.types.SubmodelElementCollection)) {
        continue;
      }
      const uriElement = this.findElementByIdShortOrSemantic(
        entry.value ?? [],
        'ConfigurationURI',
        'https://admin-shell.io/idta/SoftwareNameplate/1/0/SoftwareNameplate/SoftwareNameplateInstance/ConfigurationPath',
      );
      const typeElement = this.findElementByIdShortOrSemantic(
        entry.value ?? [],
        'ConfigurationType',
        'https://admin-shell.io/idta/SoftwareNameplate/1/0/SoftwareNameplate/SoftwareNameplateInstance/ConfigurationType',
      );
      this.configurationColumnSemanticIds = {
        uri: this.configurationColumnSemanticIds.uri || semanticIdOf(uriElement),
        type: this.configurationColumnSemanticIds.type || semanticIdOf(typeElement),
      };
      const configurationUri = this.getText(uriElement);
      const configurationType = this.getText(typeElement);
      if (configurationUri || configurationType) {
        this.configurationPaths.push({ uri: configurationUri, type: configurationType });
      }
    }

    this.mapContact = {
      id: 'SoftwareContact',
      company: this.contactCompany,
      name: `${this.contactName} ${this.contactFirstName}`.trim(),
      email: this.contactEmail,
      phone: this.contactTelephone,
      fax: this.contactFax,
      street: this.contactStreet,
      zip: this.contactZip,
      city: this.contactCity,
      countryCode: this.contactCountryCode,
      showLayer: true,
      language: this.contactLanguage,
      department: this.contactDepartment,
      ipcom: this.makeUrl(this.contactLink),
    };
    this.showContactMap =
      this.mapContact.street.trim() !== '' || this.mapContact.zip.trim() !== '' || this.mapContact.city.trim() !== '';
  }

  private readValue(section: aas.types.SubmodelElementCollection | undefined, idShort: string): string {
    const element = this.findElementByIdShortOrSemantic(section?.value ?? [], idShort, '');
    if (element != null) {
      this.fieldElements.set(idShort, element);
    }
    return this.getText(element);
  }

  private findCollection(
    source: ISubmodelElement[],
    idShort: string,
    semanticId: string,
  ): aas.types.SubmodelElementCollection | undefined {
    const found = this.findElementByIdShortOrSemantic(source, idShort, semanticId);
    if (found instanceof aas.types.SubmodelElementCollection) {
      return found;
    }
    return undefined;
  }

  private makeUrl(url: string): string {
    if (url.trim() === '') {
      return '';
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  }

  isLink(value: string): boolean {
    return value.startsWith('http://') || value.startsWith('https://');
  }

  private findElementByIdShortOrSemantic(
    source: ISubmodelElement[],
    idShort: string,
    semanticId: string,
  ): ISubmodelElement | undefined {
    for (const el of source) {
      if ((el.idShort ?? '').toLowerCase() === idShort.toLowerCase()) {
        return el;
      }
      if (semanticId !== '' && SemanticIdHelper.hasSemanticId(el, semanticId)) {
        return el;
      }
      if (el instanceof aas.types.SubmodelElementCollection) {
        const nested = this.findElementByIdShortOrSemantic(el.value ?? [], idShort, semanticId);
        if (nested != null) {
          return nested;
        }
      }
    }
    return undefined;
  }

  private getText(el: ISubmodelElement | undefined): string {
    if (el == null) {
      return '';
    }

    if (el instanceof aas.types.Property) {
      return (el.value ?? '').trim();
    }

    if (el instanceof aas.types.MultiLanguageProperty) {
      const values = el.value ?? [];
      const exact = values.find((v) => v.language.toLowerCase() === this.currentLanguage.toLowerCase());
      if (exact?.text) {
        return exact.text.trim();
      }
      const en = values.find((v) => v.language.toLowerCase() === 'en');
      if (en?.text) {
        return en.text.trim();
      }
      if (values[0]?.text) {
        return values[0].text.trim();
      }
      return '';
    }

    if (el instanceof aas.types.SubmodelElementCollection) {
      const nestedTexts = (el.value ?? []).map((v) => this.getText(v)).filter((v) => v !== '');
      return nestedTexts.join(', ');
    }

    return '';
  }
}
