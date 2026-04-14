import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import contactInformationTemplate from './contact-information-template.json';
import { ContactInformation, createEmptyContactInformation } from './contact-information.model';

@Component({
  selector: 'app-contact-information-addon',
  templateUrl: './contact-information-addon.component.html',

  imports: [FormsModule, TranslateModule, FieldsetModule, InputTextModule, ButtonModule],
})
export class ContactInformationAddonComponent {
  // Signal für die ContactInformation Daten
  contactInfo = signal<ContactInformation>(createEmptyContactInformation());

  ref: DynamicDialogRef = inject(DynamicDialogRef);
  dialogService = inject(DialogService);

  constructor() {}

  /**
   * Konvertiert die ContactInformation-Daten in eine AAS SubmodelElementCollection
   * Verwendet das JSON-Template und übernimmt nur die Werte
   */
  createContactInformationCollection() {
    const contactData = this.contactInfo();

    // AAS-Objekt aus JSON-Template erstellen
    const instanceOrError = aas.jsonization.submodelElementCollectionFromJsonable(contactInformationTemplate as any);

    // Either-Handling: Prüfen ob Deserialisierung erfolgreich war
    if (instanceOrError.error == null) {
      const collection = instanceOrError.value;
      if (collection) {
        // Werte aus ContactInformation übernehmen
        this.updateCollectionValues(collection, contactData);
      }
      return collection ?? new aas.types.SubmodelElementCollection();
    } else {
      // eslint-disable-next-line no-console
      console.log('De-serialization failed: ' + `${instanceOrError.error.path}: ` + `${instanceOrError.error.message}`);
      // Fallback: Leere SubmodelElementCollection zurückgeben
      return new aas.types.SubmodelElementCollection();
    }
  }

  /**
   * Aktualisiert die Werte in der SubmodelElementCollection mit den ContactInformation-Daten
   */
  private updateCollectionValues(
    collection: aas.types.SubmodelElementCollection,
    contactData: ContactInformation,
  ): void {
    if (!collection.value) return;

    for (const element of collection.value) {
      switch (element.idShort) {
        case 'NationalCode':
          if (contactData.nationalCode && element instanceof aas.types.MultiLanguageProperty && element.value) {
            element.value[0].text = contactData.nationalCode;
          }
          break;

        case 'CityTown':
          if (contactData.cityTown && element instanceof aas.types.MultiLanguageProperty && element.value) {
            element.value[0].text = contactData.cityTown;
          }
          break;

        case 'Company':
          if (contactData.company && element instanceof aas.types.MultiLanguageProperty && element.value) {
            element.value[0].text = contactData.company;
          }
          break;

        case 'Phone':
          if (contactData.telephoneNumber && element instanceof aas.types.SubmodelElementCollection) {
            this.updatePhoneCollection(element, contactData.telephoneNumber);
          }
          break;

        case 'Email':
          if (contactData.emailAddress && element instanceof aas.types.SubmodelElementCollection) {
            this.updateEmailCollection(element, contactData.emailAddress);
          }
          break;

        case 'Street':
          if (contactData.street && element instanceof aas.types.MultiLanguageProperty && element.value) {
            element.value[0].text = contactData.street;
          }
          break;

        case 'Zipcode':
          if (contactData.zipCode && element instanceof aas.types.MultiLanguageProperty && element.value) {
            element.value[0].text = contactData.zipCode;
          }
          break;
      }
    }
  }

  /**
   * Aktualisiert die Phone SubmodelElementCollection
   */
  private updatePhoneCollection(phoneCollection: aas.types.SubmodelElementCollection, telephoneNumber: string): void {
    if (!phoneCollection.value) return;

    for (const element of phoneCollection.value) {
      if (
        element.idShort === 'TelephoneNumber' &&
        element instanceof aas.types.MultiLanguageProperty &&
        element.value
      ) {
        element.value[0].text = telephoneNumber;
        break;
      }
    }
  }

  /**
   * Aktualisiert die Email SubmodelElementCollection
   */
  private updateEmailCollection(emailCollection: aas.types.SubmodelElementCollection, emailAddress: string): void {
    if (!emailCollection.value) return;

    for (const element of emailCollection.value) {
      if (element.idShort === 'EmailAddress' && element instanceof aas.types.Property) {
        element.value = emailAddress;
        break;
      }
    }
  }

  apply() {
    this.ref.close(this.createContactInformationCollection());
  }

  cancel() {
    this.ref.close(null);
  }
}
