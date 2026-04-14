import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { DateProxyPipe } from '@aas/common-pipes';
import { SemanticIdHelper } from '@aas/helpers';
import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { Component, computed, Input, OnChanges, signal, Type } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { MarkingsViewerPlainComponent } from '../../markings-viewer-plain/markings-viewer-plain.component';
import { ViewerStoreService } from '../../viewer-store.service';

const ADDRESS_INFORMATION_SEMANTIC_ID =
  'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation';
const CONTACT_INFORMATION_SEMANTIC_ID =
  'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation';
const PHONE_SEMANTIC_ID = 'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation/Phone';
const EMAIL_SEMANTIC_ID = '0173-1#02-AAQ836#005';
const IP_COMMUNICATION_SEMANTIC_ID = 'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/IPCommunication/';
const ADDRESS_LINK_SEMANTIC_ID = '0173-1#02-AAQ326#002';
const MANUFACTURER_NAME_SEMANTIC_IDS = ['0112/2///61987#ABA565#009', '0173-1#02-AAO677#004'];
const SERIAL_NUMBER_SEMANTIC_IDS = ['0112/2///61987#ABA951#009', '0173-1#02-AAM556#004'];
const URI_OF_PRODUCT_SEMANTIC_IDS = ['0112/2///61987#ABN590#002', '0173-1#02-ABH173#003'];
const DATE_OF_MANUFACTURE_SEMANTIC_IDS = ['0112/2///61987#ABB757#007', '0173-1#02-AAR972#004'];
const DATE_OF_PUTTING_INTO_SERVICE_SEMANTIC_IDS = [
  'urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0#dateOfPuttingIntoService',
];
const LIFE_CYCLE_STAGE_SEMANTIC_IDS = ['0173-1#02-ABL841#001'];
const MANUFACTURER_IDENTIFIER_SEMANTIC_IDS = [
  'urn:samm:io.admin-shell.idta.batterypass.technical_data:1.0.0#manufacturerIdentifier',
];
const OPERATOR_IDENTIFIER_SEMANTIC_IDS = [
  'urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0#operatorIdentifier',
];
const UNIQUE_FACILITY_IDENTIFIER_SEMANTIC_IDS = [
  'https://admin-shell.io/idta/nameplate/3/0/UniqueFacilityIdentifier',
  '0173-1#02-AAV646#003',
];
const STREET_SEMANTIC_IDS = ['0173-1#02-AAO128#002'];
const ZIP_SEMANTIC_IDS = ['0173-1#02-AAO129#002'];
const CITY_SEMANTIC_IDS = ['0173-1#02-AAO132#002'];
const COUNTRY_CODE_SEMANTIC_IDS = ['0173-1#02-AAO134#002'];
const COMPANY_SEMANTIC_IDS = ['0173-1#02-AAW001#001'];
const TELEPHONE_NUMBER_SEMANTIC_IDS = ['0173-1#02-AAO136#002'];
const EMAIL_ADDRESS_SEMANTIC_IDS = ['0173-1#02-AAO198#002'];
const MARKINGS_SEMANTIC_IDS = ['0112/2///61360_7#AAS006', '0173-1#02-ABI563#003/0173-1#01-AHF849#003'];
const EU_DECLARATION_OF_CONFORMITY_SEMANTIC_IDS = [
  'urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0#euDeclarationOfConformity',
  '0173-1#02-ABA889#003',
];
const RESULTS_OF_TEST_REPORTS_SEMANTIC_IDS = [
  'urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0#resultsOfTestReportsProvingCompliance',
  '0173-1#02-ABA705#003',
];
const DOCUMENT_IDENTIFIER_SEMANTIC_IDS = [
  'urn:samm:io.admin-shell.idta.handover_documentation:2.0.0#DocumentIdentifier',
];

@Component({
  selector: 'aas-battery-nameplate-viewer',
  templateUrl: './battery-nameplate-viewer.component.html',
  styleUrls: ['./battery-nameplate-viewer.component.css'],
  imports: [
    MarkingsViewerPlainComponent,
    AsyncPipe,
    NgComponentOutlet,
    TranslateModule,
    DateProxyPipe,
    InputGroup,
    InputGroupAddon,
    InputText,
  ],
})
export class BatteryNameplateViewerComponent implements OnChanges {
  @Input({ required: true }) nameplate: aas.types.Submodel | undefined;
  @Input({ required: true }) currentLanguage = 'de';

  readonly markings: aas.types.SubmodelElementCollection[] = [];
  readonly markingsIdShortPath = signal('');
  readonly indexed = signal(false);
  private nameplateMapComponentLoader?: Promise<Type<unknown>>;

  constructor(private viewerStore: ViewerStoreService) {}

  ngOnChanges(): void {
    this.loadMarkings();
  }

  loadNameplateMapComponent(): Promise<Type<unknown>> {
    this.nameplateMapComponentLoader ??= import('../nameplate-viewer/nameplate-map.component').then(
      (module) => module.NameplateMapComponent,
    );
    return this.nameplateMapComponentLoader;
  }

  readonly nameplateMapInputs = computed(() => ({
    street: this.street(),
    zip: this.zip(),
    city: this.city(),
  }));

  readonly manufacturerName = computed(() => this.readText(this.rootElements(), MANUFACTURER_NAME_SEMANTIC_IDS));
  readonly manufacturerIdentifier = computed(() =>
    this.readText(this.rootElements(), MANUFACTURER_IDENTIFIER_SEMANTIC_IDS),
  );
  readonly serialNumber = computed(() => this.readText(this.rootElements(), SERIAL_NUMBER_SEMANTIC_IDS));
  readonly uriOfProduct = computed(() => this.readText(this.rootElements(), URI_OF_PRODUCT_SEMANTIC_IDS));
  readonly uniqueFacilityIdentifier = computed(() =>
    this.readText(this.rootElements(), UNIQUE_FACILITY_IDENTIFIER_SEMANTIC_IDS),
  );
  readonly operatorIdentifier = computed(() => this.readText(this.rootElements(), OPERATOR_IDENTIFIER_SEMANTIC_IDS));
  readonly lifeCycleStage = computed(() => this.readText(this.rootElements(), LIFE_CYCLE_STAGE_SEMANTIC_IDS));
  readonly dateOfManufacture = computed(() => this.readDate(this.rootElements(), DATE_OF_MANUFACTURE_SEMANTIC_IDS));
  readonly dateOfPuttingIntoService = computed(() =>
    this.readDate(this.rootElements(), DATE_OF_PUTTING_INTO_SERVICE_SEMANTIC_IDS),
  );
  readonly company = computed(
    () => this.readText(this.contactInformationElements(), COMPANY_SEMANTIC_IDS) || this.manufacturerName(),
  );
  readonly street = computed(() => this.readText(this.contactInformationElements(), STREET_SEMANTIC_IDS));
  readonly zip = computed(() => this.readText(this.contactInformationElements(), ZIP_SEMANTIC_IDS));
  readonly city = computed(() => this.readText(this.contactInformationElements(), CITY_SEMANTIC_IDS));
  readonly countryCode = computed(() => this.readText(this.contactInformationElements(), COUNTRY_CODE_SEMANTIC_IDS));
  readonly phone = computed(() => this.readNestedText(PHONE_SEMANTIC_ID, TELEPHONE_NUMBER_SEMANTIC_IDS));
  readonly email = computed(() => this.readNestedText(EMAIL_SEMANTIC_ID, EMAIL_ADDRESS_SEMANTIC_IDS));
  readonly web = computed(() => this.readNestedText(IP_COMMUNICATION_SEMANTIC_ID, ADDRESS_LINK_SEMANTIC_ID));
  readonly euDeclarationOfConformity = computed(() =>
    this.readDocumentIdentifiers(this.rootElements(), EU_DECLARATION_OF_CONFORMITY_SEMANTIC_IDS).join(', '),
  );
  readonly resultsOfTestReports = computed(() =>
    this.readDocumentIdentifiers(this.rootElements(), RESULTS_OF_TEST_REPORTS_SEMANTIC_IDS).join(', '),
  );
  readonly isInstance = computed(() => {
    return this.viewerStore.aas()?.assetInformation.assetKind === aas.types.AssetKind.Instance;
  });

  private rootElements(): aas.types.ISubmodelElement[] {
    return this.nameplate?.submodelElements ?? [];
  }

  private contactInformationElements(): aas.types.ISubmodelElement[] {
    const addressInformation = this.findElement(
      this.rootElements(),
      [ADDRESS_INFORMATION_SEMANTIC_ID],
      ['AddressInformation'],
    );
    const addressChildren = this.collectionChildren(addressInformation);
    const contactInformation = this.findElement(
      addressChildren,
      [CONTACT_INFORMATION_SEMANTIC_ID],
      ['ContactInformation'],
    );
    return this.collectionChildren(contactInformation);
  }

  private loadMarkings(): void {
    this.markings.length = 0;

    const markingsElement = this.findElement(this.rootElements(), MARKINGS_SEMANTIC_IDS, ['Markings']);
    this.indexed.set(markingsElement instanceof aas.types.SubmodelElementList);
    this.markingsIdShortPath.set(markingsElement?.idShort ?? '');

    if (
      markingsElement instanceof aas.types.SubmodelElementCollection ||
      markingsElement instanceof aas.types.SubmodelElementList
    ) {
      this.markings.push(
        ...(markingsElement.value?.filter(
          (element): element is aas.types.SubmodelElementCollection =>
            element instanceof aas.types.SubmodelElementCollection,
        ) ?? []),
      );
    }
  }

  private readText(
    source: aas.types.ISubmodelElement[],
    semanticIds: string | string[],
    idShorts: string[] = [],
  ): string {
    return this.elementText(this.findElement(source, this.toArray(semanticIds), idShorts));
  }

  private readNestedText(parentSemanticId: string, childSemanticIds: string | string[]): string {
    const parent = this.findElement(this.contactInformationElements(), [parentSemanticId]);
    return this.readText(this.collectionChildren(parent), childSemanticIds);
  }

  private readDate(source: aas.types.ISubmodelElement[], semanticIds: string[]): Date | null {
    const value = this.readText(source, semanticIds);
    if (value.trim() === '') {
      return null;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private readDocumentIdentifiers(source: aas.types.ISubmodelElement[], semanticIds: string[]): string[] {
    const listElement = this.findElement(source, semanticIds);
    const items = listElement instanceof aas.types.SubmodelElementList ? (listElement.value ?? []) : [];

    return items
      .map((item) =>
        this.elementText(this.findElement([item], DOCUMENT_IDENTIFIER_SEMANTIC_IDS, ['DocumentIdentifier']) ?? item),
      )
      .map((value) => value.trim())
      .filter((value) => value !== '');
  }

  private collectionChildren(element: aas.types.ISubmodelElement | null | undefined): aas.types.ISubmodelElement[] {
    if (element instanceof aas.types.SubmodelElementCollection || element instanceof aas.types.SubmodelElementList) {
      return element.value ?? [];
    }

    return [];
  }

  private elementText(element: aas.types.ISubmodelElement | null | undefined): string {
    if (element instanceof aas.types.Property) {
      return `${element.value ?? ''}`;
    }

    if (element instanceof aas.types.MultiLanguageProperty) {
      const entries = element.value ?? [];
      const language = this.currentLanguage.toLowerCase();
      return (
        entries.find((entry) => entry.language.toLowerCase() === language)?.text ??
        entries.find((entry) => entry.language.toLowerCase() === 'en')?.text ??
        entries[0]?.text ??
        ''
      );
    }

    return '';
  }

  private findElement(
    source: aas.types.ISubmodelElement[],
    semanticIds: string[],
    idShorts: string[] = [],
  ): aas.types.ISubmodelElement | undefined {
    return source.find((element) => {
      const idShort = `${element.idShort ?? ''}`.toLowerCase();
      return (
        idShorts.some((candidate) => candidate.toLowerCase() === idShort) ||
        semanticIds.some((semanticId) => SemanticIdHelper.hasSemanticId(element, semanticId))
      );
    });
  }

  private toArray(value: string | string[]): string[] {
    return Array.isArray(value) ? value : [value];
  }
}
