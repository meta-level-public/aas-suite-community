import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { HelpLabelComponent } from '@aas/common-components';
import { Component, computed, inject, input, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { isArray } from 'lodash-es';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from '@openng/optimus-ui/accordion';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Ripple } from '@openng/optimus-ui/ripple';
import { Tag } from '@openng/optimus-ui/tag';
import { readableIdShort } from '@aas/helpers';
import { ConceptUnitService, inlineUnitOf, semanticIdOf } from '../../concept-unit.service';
import { SemanticDescriptionPopupComponent } from '../../semantic-description-popup/semantic-description-popup.component';
import { ViewerStoreService } from '../../viewer-store.service';
import { ContactInformation } from './contact-information';

import { ContactInformationMap } from './contact-information-map.component';
import { ExpandedStateDirective } from '../../expanded-state/expanded-state.directive';

/** Single-element fields of a contact with their submodel elements (semantic ID for the "?" and the unit). */
type ContactFieldElements = Partial<
  Record<'department' | 'company' | 'street' | 'ipcom' | 'email' | 'phone' | 'fax' | 'language', ISubmodelElement>
>;
type ContactEntry = ContactInformation & { elements: ContactFieldElements };

@Component({
  selector: 'aas-contact-information-viewer',
  templateUrl: './contact-information-viewer.component.html',
  styleUrls: ['./contact-information-viewer.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ExpandedStateDirective,
    Accordion,
    AccordionPanel,
    Ripple,
    AccordionHeader,
    AccordionContent,
    InputGroup,
    InputGroupAddon,
    InputText,
    ContactInformationMap,
    TranslateModule,
    HelpLabelComponent,
    SemanticDescriptionPopupComponent,
    Tag,
  ],
})
export class ContactInformationViewerComponent implements OnInit {
  viewerStore = inject(ViewerStoreService);

  submodel = input.required<aas.types.Submodel | undefined>();

  /** Companies of all contacts, for the hero when there are several contacts. */
  companies = computed(() => [
    ...new Set(
      this.contactInfos()
        .map((contact) => contact.company.trim())
        .filter((company) => company !== ''),
    ),
  ]);

  /** Name of a contact for headings: person, else company or department, else its readable idShort. */
  contactTitle(contact: ContactInformation) {
    return contact.name.trim() || contact.company.trim() || contact.department.trim() || readableIdShort(contact.id);
  }

  /** Department and company below the name, without repeating what the title already shows. */
  contactSubtitle(contact: ContactInformation) {
    const title = this.contactTitle(contact);
    return [contact.department.trim(), contact.company.trim()]
      .filter((part) => part !== '' && part !== title)
      .join(' · ');
  }

  contactInfos = computed(() => {
    const sm = this.submodel();
    if (sm == null) {
      return [];
    }
    const contacts: ContactEntry[] = [];
    sm.submodelElements?.forEach((smc) => {
      // jedes Element sollte eine SMC sein
      if (smc instanceof aas.types.SubmodelElementCollection) {
        const elements: ContactFieldElements = {
          company: this.findElementRecursive('Company', '0173-1#02-AAW001#001', smc),
          email: this.findElementRecursive('EmailAddress', '0173-1#02-AAO198#002', smc),
          phone: this.findElementRecursive('TelephoneNumber', '0173-1#02-AAO136#002', smc),
          fax: this.findElementRecursive('FaxNumber', '0173-1#02-AAO195#002', smc),
          street: this.findElementRecursive('Street', '0173-1#02-AAO128#002', smc),
          language: this.findElementRecursive(
            'Language',
            'https://adminshell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation/Language',
            smc,
          ),
          department: this.findElementRecursive('Department', '0173-1#02-AAO127#003', smc),
          ipcom: this.findElementRecursive('AddressOfAdditionalLink', '0173-1#02-AAQ326#002', smc),
        };
        const contact: ContactEntry = {
          id: smc.idShort ?? '',
          company: this.textOf(elements.company),
          name:
            this.findTextRecursive('NameOfContact', '0173-1#02-AAO205#002', smc) +
            ' ' +
            this.findTextRecursive('FirstName', '0173-1#02-AAO206#002', smc),
          email: this.textOf(elements.email),
          phone: this.textOf(elements.phone),
          fax: this.textOf(elements.fax),
          street: this.textOf(elements.street),
          zip: this.findTextRecursive('ZipCode', '0173-1#02-AAO129#002', smc),
          city: this.findTextRecursive('CityTown', '0173-1#02-AAO132#002', smc),
          countryCode: this.findTextRecursive('NationalCode', '0173-1#02-AAO134#002', smc),
          language: this.textOf(elements.language),
          department: this.textOf(elements.department),
          ipcom: this.makeUrl(this.textOf(elements.ipcom)),
          showLayer: false,
          elements,
        };
        contacts.push(contact);
      }
    });
    return contacts;
  });

  @Input({ required: true }) currentLanguage = 'de';

  translate = inject(TranslateService);
  private readonly units = inject(ConceptUnitService);

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((lang: any) => {
      this.currentLanguage = lang.lang;
    });
  }

  makeUrl(urlPart: string) {
    if (urlPart == null || urlPart === '') {
      return '';
    }
    if (!urlPart.startsWith('http')) {
      return 'https://' + urlPart;
    }
    return urlPart;
  }
  /** Element with the given idShort or semantic ID, also inside nested collections (first non-empty one wins). */
  findElementRecursive(
    idShort: string,
    semanticId: string,
    smc: aas.types.SubmodelElementCollection,
  ): ISubmodelElement | undefined {
    const direct = smc.value?.find(
      (sme: ISubmodelElement) =>
        (sme.idShort ?? '').toLowerCase() === idShort.toLowerCase() || this.hasSemanticId(sme, semanticId),
    );
    if (direct != null && (direct as { value?: unknown }).value != null) {
      return direct;
    }
    for (const sme of smc.value ?? []) {
      if (sme instanceof aas.types.SubmodelElementCollection) {
        const nested = this.findElementRecursive(idShort, semanticId, sme);
        if (this.textOf(nested) !== '') {
          return nested;
        }
      }
    }
    return undefined;
  }

  findTextRecursive(idShort: string, semanticId: string, smc: aas.types.SubmodelElementCollection): string {
    return this.textOf(this.findElementRecursive(idShort, semanticId, smc));
  }

  /** Displayed value of an element (text in the current language for multi-language properties). */
  textOf(element: ISubmodelElement | undefined): string {
    if (element instanceof aas.types.Property) {
      return element.value ?? '';
    }
    if (element instanceof aas.types.MultiLanguageProperty) {
      const entries = element.value ?? [];
      const userLang = this.currentLanguage.toLowerCase();
      return (
        entries.find((e) => e.language.toLowerCase() === userLang)?.text ??
        entries.find((e) => e.language.toLowerCase() === 'en')?.text ??
        entries[0]?.text ??
        ''
      );
    }
    return '';
  }

  /** Semantic ID of a field element for the "?" to its concept description. */
  readonly semanticIdOf = semanticIdOf;

  /** Unit of a field element (at the element or from its concept description). */
  unitOf(element: ISubmodelElement | undefined): string {
    return this.units.unit(semanticIdOf(element), inlineUnitOf(element));
  }

  hasSemanticId(sme: aas.types.ISubmodelElement, semanticId: string) {
    return sme.semanticId?.keys.find((k) => k.value.trim() === semanticId.trim()) != null;
  }

  accordionTabValueChange(event: string | number | string[] | number[] | null | undefined) {
    const contactInfos = this.contactInfos();
    if (isArray(event)) {
      event.forEach((element) => {
        const contact = contactInfos.find((c) => c.id === element);
        if (contact != null) {
          contact.showLayer = true;
        }
      });
    }
  }
}
