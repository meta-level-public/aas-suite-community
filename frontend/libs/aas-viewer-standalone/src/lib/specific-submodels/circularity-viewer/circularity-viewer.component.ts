import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SemanticIdHelper } from '@aas/helpers';
import { Component, Input, OnChanges, computed, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { GenericViewerComponent } from '../../generic-viewer/generic-viewer.component';

const SEMANTICS = {
  dismantlingAndRemovalInformation:
    'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#dismantlingAndRemovalInformation',
  endOfLifeInformation: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#endOfLifeInformation',
  wastePrevention: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#wastePrevention',
  separateCollection: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#separateCollection',
  informationOnCollection: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#informationOnCollection',
  recycledContent: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#recycledContent',
  recycledContentEntry: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#RecycledContent',
  preConsumerShare: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#preConsumerShare',
  recycledMaterial: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#recycledMaterial',
  postConsumerShare: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#postConsumerShare',
  renewableContent: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#renewableContent',
  safetyMeasures: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#safetyMeasures',
  safetyInstructions: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#safetyInstructions',
  extinguishingAgents: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#extinguishingAgents',
  extinguishingAgent: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#ExtinguishingAgent',
  sparePartSources: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#sparePartSources',
  sparePartSupplier: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#SparePartSupplier',
  company: 'urn:samm:io.admin-shell.idta.contact_information:1.0.0#company',
  addressOfSupplier: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#addressOfSupplier',
  nationalCode: 'urn:samm:io.admin-shell.idta.contact_information:1.0.0#nationalCode',
  postalCode: 'urn:samm:io.admin-shell.idta.contact_information:1.0.0#postalCode',
  street: 'urn:samm:io.admin-shell.idta.contact_information:1.0.0#street',
  email: 'urn:samm:io.admin-shell.idta.contact_information:1.0.0#email',
  emailAddress: 'urn:samm:io.admin-shell.idta.contact_information:1.0.0#emailAddress',
  supplierWebAddress: 'urn:samm:io.admin-shell.idta.contact_information:1.0.0#addressOfAdditionalLink',
  components: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#components',
  component: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Component',
  partName: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#partName',
  partNumber: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#partNumber',
  documentIdentifier: 'urn:samm:io.admin-shell.idta.handover_documentation:2.0.0#DocumentIdentifier',
} as const;

interface CircularitySection {
  titleKey: string;
  items: CircularityDocumentItem[];
}

interface CircularityDocumentItem {
  label: string;
  element: aas.types.ISubmodelElement | null;
  idShortPath: string;
}

interface CircularityRecycledContentEntry {
  recycledMaterial: string;
  preConsumerShare: string;
  postConsumerShare: string;
}

interface CircularityComponentPart {
  partName: string;
  partNumber: string;
}

interface CircularitySupplier {
  name: string;
  address: string;
  email: string;
  web: string;
  components: CircularityComponentPart[];
}

interface CircularityViewModel {
  dismantlingDocuments: CircularityDocumentItem[];
  endOfLifeSections: CircularitySection[];
  recycledContentEntries: CircularityRecycledContentEntry[];
  renewableContent: string;
  safetyInstructionDocuments: CircularityDocumentItem[];
  extinguishingAgents: string[];
  sparePartSuppliers: CircularitySupplier[];
}

const EMPTY_VIEW_MODEL: CircularityViewModel = {
  dismantlingDocuments: [],
  endOfLifeSections: [],
  recycledContentEntries: [],
  renewableContent: '',
  safetyInstructionDocuments: [],
  extinguishingAgents: [],
  sparePartSuppliers: [],
};

@Component({
  selector: 'aas-circularity-viewer',
  templateUrl: './circularity-viewer.component.html',
  styleUrls: ['./circularity-viewer.component.css'],
  imports: [InputGroup, InputGroupAddon, InputText, TranslateModule, GenericViewerComponent],
})
export class CircularityViewerComponent implements OnChanges {
  @Input({ required: true }) submodel: aas.types.Submodel | undefined;
  @Input() currentLanguage = 'de';

  private readonly model = signal<CircularityViewModel>(EMPTY_VIEW_MODEL);

  readonly dismantlingDocuments = computed(() => this.model().dismantlingDocuments);
  readonly endOfLifeSections = computed(() => this.model().endOfLifeSections);
  readonly recycledContentEntries = computed(() => this.model().recycledContentEntries);
  readonly renewableContent = computed(() => this.model().renewableContent);
  readonly safetyInstructionDocuments = computed(() => this.model().safetyInstructionDocuments);
  readonly extinguishingAgents = computed(() => this.model().extinguishingAgents);
  readonly sparePartSuppliers = computed(() => this.model().sparePartSuppliers);
  readonly hasContent = computed(() => {
    const current = this.model();
    return (
      current.dismantlingDocuments.length > 0 ||
      current.endOfLifeSections.length > 0 ||
      current.recycledContentEntries.length > 0 ||
      current.renewableContent.trim() !== '' ||
      current.safetyInstructionDocuments.length > 0 ||
      current.extinguishingAgents.length > 0 ||
      current.sparePartSuppliers.length > 0
    );
  });

  ngOnChanges(): void {
    this.model.set(this.buildViewModel());
  }

  private buildViewModel(): CircularityViewModel {
    const root = this.submodel?.submodelElements ?? [];
    const endOfLifeInformation = this.findElement(root, [SEMANTICS.endOfLifeInformation], ['EndOfLifeInformation']);
    const safetyMeasures = this.findElement(root, [SEMANTICS.safetyMeasures], ['SafetyMeasures']);

    return {
      dismantlingDocuments: this.extractDocumentList(
        root,
        [SEMANTICS.dismantlingAndRemovalInformation],
        ['DismantlingAndRemovalInformation'],
      ),
      endOfLifeSections: [
        {
          titleKey: 'CIRCULARITY_END_OF_LIFE_WASTE_PREVENTION',
          items: this.extractDocumentList(
            this.childrenOf(endOfLifeInformation),
            [SEMANTICS.wastePrevention],
            ['WastePrevention'],
          ),
        },
        {
          titleKey: 'CIRCULARITY_END_OF_LIFE_SEPARATE_COLLECTION',
          items: this.extractDocumentList(
            this.childrenOf(endOfLifeInformation),
            [SEMANTICS.separateCollection],
            ['SeparateCollection'],
          ),
        },
        {
          titleKey: 'CIRCULARITY_END_OF_LIFE_INFORMATION_ON_COLLECTION',
          items: this.extractDocumentList(
            this.childrenOf(endOfLifeInformation),
            [SEMANTICS.informationOnCollection],
            ['InformationOnCollection'],
          ),
        },
      ].filter((section) => section.items.length > 0),
      recycledContentEntries: this.extractRecycledContentEntries(
        this.findElement(root, [SEMANTICS.recycledContent], ['RecycledContentInformation']),
      ),
      renewableContent: this.readText(
        this.findElement(root, [SEMANTICS.renewableContent], ['RenewableContent']),
      ).trim(),
      safetyInstructionDocuments: this.extractDocumentList(
        this.childrenOf(safetyMeasures),
        [SEMANTICS.safetyInstructions],
        ['SafetyInstructions'],
      ),
      extinguishingAgents: this.extractSimpleListValues(
        this.childrenOf(safetyMeasures),
        [SEMANTICS.extinguishingAgents],
        ['ExtinguishingAgents'],
      ),
      sparePartSuppliers: this.extractSuppliers(
        this.findElement(root, [SEMANTICS.sparePartSources], ['SparePartSources']),
      ),
    };
  }

  private extractRecycledContentEntries(
    element: aas.types.ISubmodelElement | undefined,
  ): CircularityRecycledContentEntry[] {
    if (!(element instanceof aas.types.SubmodelElementList)) {
      return [];
    }

    return (element.value ?? [])
      .filter(
        (item): item is aas.types.SubmodelElementCollection => item instanceof aas.types.SubmodelElementCollection,
      )
      .map((entry) => ({
        recycledMaterial: this.readText(
          this.findElement(this.childrenOf(entry), [SEMANTICS.recycledMaterial], ['RecycledMaterial']),
        ).trim(),
        preConsumerShare: this.readText(
          this.findElement(this.childrenOf(entry), [SEMANTICS.preConsumerShare], ['PreConsumerShare']),
        ).trim(),
        postConsumerShare: this.readText(
          this.findElement(this.childrenOf(entry), [SEMANTICS.postConsumerShare], ['PostConsumerShare']),
        ).trim(),
      }))
      .filter(
        (entry) => entry.recycledMaterial !== '' || entry.preConsumerShare !== '' || entry.postConsumerShare !== '',
      );
  }

  private extractSuppliers(element: aas.types.ISubmodelElement | undefined): CircularitySupplier[] {
    if (!(element instanceof aas.types.SubmodelElementList)) {
      return [];
    }

    return (element.value ?? [])
      .filter(
        (item): item is aas.types.SubmodelElementCollection => item instanceof aas.types.SubmodelElementCollection,
      )
      .map((supplier) => {
        const addressCollection = this.findElement(
          this.childrenOf(supplier),
          [SEMANTICS.addressOfSupplier],
          ['AddressOfSupplier'],
        );
        const emailCollection = this.findElement(
          this.childrenOf(supplier),
          [SEMANTICS.email],
          ['EmailAddressOfSupplier'],
        );
        const componentsList = this.findElement(this.childrenOf(supplier), [SEMANTICS.components], ['Components']);

        return {
          name: this.readText(
            this.findElement(this.childrenOf(supplier), [SEMANTICS.company], ['NameOfSupplier']),
          ).trim(),
          address: this.formatAddress(addressCollection),
          email: this.readText(
            this.findElement(this.childrenOf(emailCollection), [SEMANTICS.emailAddress], ['EmailAddress']),
          ).trim(),
          web: this.readText(
            this.findElement(this.childrenOf(supplier), [SEMANTICS.supplierWebAddress], ['SupplierWebAddress']),
          ).trim(),
          components: this.extractComponents(componentsList),
        };
      })
      .filter(
        (supplier) =>
          supplier.name !== '' ||
          supplier.address !== '' ||
          supplier.email !== '' ||
          supplier.web !== '' ||
          supplier.components.length > 0,
      );
  }

  private extractComponents(element: aas.types.ISubmodelElement | undefined): CircularityComponentPart[] {
    if (!(element instanceof aas.types.SubmodelElementList)) {
      return [];
    }

    return (element.value ?? [])
      .filter(
        (item): item is aas.types.SubmodelElementCollection => item instanceof aas.types.SubmodelElementCollection,
      )
      .map((component) => ({
        partName: this.readText(
          this.findElement(this.childrenOf(component), [SEMANTICS.partName], ['PartName']),
        ).trim(),
        partNumber: this.readText(
          this.findElement(this.childrenOf(component), [SEMANTICS.partNumber], ['PartNumber']),
        ).trim(),
      }))
      .filter((component) => component.partName !== '' || component.partNumber !== '');
  }

  private extractDocumentList(
    source: aas.types.ISubmodelElement[],
    semanticIds: string[],
    idShorts: string[],
  ): CircularityDocumentItem[] {
    const container = this.findElement(source, semanticIds, idShorts);
    return this.extractDocumentEntries(container, container?.idShort ?? '');
  }

  private extractDocumentEntries(
    element: aas.types.ISubmodelElement | undefined,
    parentPath: string,
  ): CircularityDocumentItem[] {
    return this.childrenOf(element)
      .map((child, index) => {
        const childPath = this.joinPath(parentPath, child.idShort ?? `Item${index + 1}`);
        const nestedDocumentIdentifier = this.findElement(
          this.childrenOf(child),
          [SEMANTICS.documentIdentifier],
          ['DocumentIdentifier'],
        );
        const nestedPath = nestedDocumentIdentifier
          ? this.joinPath(childPath, nestedDocumentIdentifier.idShort ?? 'DocumentIdentifier')
          : childPath;

        if (child instanceof aas.types.File || child instanceof aas.types.Blob) {
          return {
            label: child.idShort ?? '',
            element: child,
            idShortPath: childPath,
          };
        }

        if (nestedDocumentIdentifier instanceof aas.types.File || nestedDocumentIdentifier instanceof aas.types.Blob) {
          return {
            label: nestedDocumentIdentifier.idShort ?? child.idShort ?? '',
            element: nestedDocumentIdentifier,
            idShortPath: nestedPath,
          };
        }

        const value = this.readText(nestedDocumentIdentifier).trim() || this.readText(child).trim();
        return {
          label: value,
          element: nestedDocumentIdentifier ?? child ?? null,
          idShortPath: nestedPath,
        };
      })
      .filter((item) => item.label !== '' || item.element != null);
  }

  private extractSimpleListValues(
    source: aas.types.ISubmodelElement[],
    semanticIds: string[],
    idShorts: string[],
  ): string[] {
    const container = this.findElement(source, semanticIds, idShorts);

    return this.childrenOf(container)
      .map((child) => {
        const nestedValue = this.findElement(
          this.childrenOf(child),
          [SEMANTICS.extinguishingAgent],
          ['ExtinguishingAgent'],
        );
        return this.readText(nestedValue).trim() || this.readText(child).trim();
      })
      .filter((value) => value !== '');
  }

  private formatAddress(element: aas.types.ISubmodelElement | undefined): string {
    const children = this.childrenOf(element);
    const street = this.readText(this.findElement(children, [SEMANTICS.street], ['Street'])).trim();
    const postalCode = this.readText(this.findElement(children, [SEMANTICS.postalCode], ['PostalCode'])).trim();
    const nationalCode = this.readText(this.findElement(children, [SEMANTICS.nationalCode], ['NationalCode'])).trim();

    return [street, [nationalCode, postalCode].filter((part) => part !== '').join(' ')]
      .filter((part) => part !== '')
      .join(', ');
  }

  private joinPath(parentPath: string, idShort: string): string {
    return [parentPath, idShort].filter((part) => part.trim() !== '').join('.');
  }

  private readText(element: aas.types.ISubmodelElement | undefined): string {
    if (element instanceof aas.types.Property) {
      return `${element.value ?? ''}`;
    }

    if (element instanceof aas.types.MultiLanguageProperty) {
      const entries = element.value ?? [];
      const currentLanguage = this.currentLanguage.toLowerCase();

      return (
        entries.find((entry) => entry.language.toLowerCase() === currentLanguage)?.text ??
        entries.find((entry) => entry.language.toLowerCase() === 'en')?.text ??
        entries[0]?.text ??
        ''
      );
    }

    return '';
  }

  private childrenOf(element: aas.types.ISubmodelElement | null | undefined): aas.types.ISubmodelElement[] {
    if (element instanceof aas.types.SubmodelElementCollection || element instanceof aas.types.SubmodelElementList) {
      return element.value ?? [];
    }

    return [];
  }

  private findElement(
    source: aas.types.ISubmodelElement[],
    semanticIds: string[],
    idShorts: string[],
  ): aas.types.ISubmodelElement | undefined {
    return source.find((element) => {
      const normalizedIdShort = `${element.idShort ?? ''}`.toLowerCase();
      return (
        idShorts.some((candidate) => candidate.toLowerCase() === normalizedIdShort) ||
        semanticIds.some((semanticId) => SemanticIdHelper.hasSemanticId(element, semanticId))
      );
    });
  }
}
