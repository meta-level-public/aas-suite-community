import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { HelpLabelComponent } from '@aas/common-components';
import { Component, computed, inject, input, Input, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { isArray } from 'lodash-es';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { ViewerStoreService } from '../../viewer-store.service';
import { ContactInformation } from './contact-information';

import { ContactInformationMap } from './contact-information-map.component';

@Component({
  selector: 'aas-contact-information-viewer',
  templateUrl: './contact-information-viewer.component.html',
  styleUrls: ['./contact-information-viewer.component.css'],
  imports: [
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
  ],
})
export class ContactInformationViewerComponent implements OnInit {
  viewerStore = inject(ViewerStoreService);

  submodel = input.required<aas.types.Submodel | undefined>();

  contactInfos = computed(() => {
    const sm = this.submodel();
    if (sm == null) {
      return [];
    }
    const contacts: ContactInformation[] = [];
    sm.submodelElements?.forEach((smc) => {
      // jedes Element sollte eine SMC sein
      if (smc instanceof aas.types.SubmodelElementCollection) {
        const contact = {
          id: smc.idShort ?? '',
          company: this.findElementRecursive('Company', '0173-1#02-AAW001#001', smc),
          name:
            this.findElementRecursive('NameOfContact', '0173-1#02-AAO205#002', smc) +
            ' ' +
            this.findElementRecursive('FirstName', '0173-1#02-AAO206#002', smc),
          email: this.findElementRecursive('EmailAddress', '0173-1#02-AAO198#002', smc),
          phone: this.findElementRecursive('TelephoneNumber', '0173-1#02-AAO136#002', smc),
          fax: this.findElementRecursive('FaxNumber', '0173-1#02-AAO195#002 ', smc),
          street: this.findElementRecursive('Street', '0173-1#02-AAO128#002', smc),
          zip: this.findElementRecursive('ZipCode', '0173-1#02-AAO129#002', smc),
          city: this.findElementRecursive('CityTown', '0173-1#02-AAO132#002', smc),
          countryCode: this.findElementRecursive('NationalCode', '0173-1#02-AAO134#002', smc),
          language: this.findElementRecursive(
            'Language',
            'https://adminshell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation/Language',
            smc,
          ),
          department: this.findElementRecursive('Department', '0173-1#02-AAO127#003', smc),
          ipcom: this.makeUrl(this.findElementRecursive('AddressOfAdditionalLink ', '0173-1#02-AAQ326#002', smc)),
          showLayer: false,
        };
        contacts.push(contact);
      }
    });
    return contacts;
  });

  @Input({ required: true }) currentLanguage = 'de';

  translate = inject(TranslateService);

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
  findElementRecursive(idShort: string, semanticId: string, smc: aas.types.SubmodelElementCollection) {
    const userLang = this.currentLanguage;
    let el = (
      smc.value?.find(
        (sme: ISubmodelElement) =>
          (sme.idShort as string)?.toLowerCase() === idShort.toLowerCase() || this.hasSemanticId(sme, semanticId),
      ) as any
    )?.value;
    if (el != null) {
      if (typeof el === 'string') {
        return el;
      }
      let found = el?.find((e: any) => e.language.toLowerCase() === userLang.toLowerCase());
      if (found != null) {
        return found.text;
      }
      found = el?.find((e: any) => e.language.toLowerCase() === 'en');
      if (found != null) {
        return found.text;
      }
      try {
        found = el[0];
        if (found != null) {
          return found.text;
        }
      } catch {
        /*ignore*/
      }
    } else {
      for (const sme of smc.value ?? []) {
        if (sme instanceof aas.types.SubmodelElementCollection) {
          el = this.findElementRecursive(idShort, semanticId, sme);
          if (el != null && el !== '') {
            return el;
          }
        }
      }
    }
    return '';
  }

  hasSemanticId(sme: aas.types.ISubmodelElement, semanticId: string) {
    return sme.semanticId?.keys.find((k) => k.value.trim() === semanticId) != null;
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
