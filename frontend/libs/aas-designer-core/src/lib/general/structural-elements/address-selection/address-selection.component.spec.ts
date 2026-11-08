import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HerstellerAdresse } from '../../../generator/model/hersteller-adresse';
import { V3TreeItem } from '../../../v3-editor/model/v3-tree-item';
import { AddressSelectionComponent } from './address-selection.component';

function emptyEnglishMlp(idShort: string): aas.types.MultiLanguageProperty {
  const mlp = new aas.types.MultiLanguageProperty();
  mlp.idShort = idShort;
  mlp.value = [new aas.types.LangStringTextType('en', '')];
  return mlp;
}

function mlpValue(collection: aas.types.SubmodelElementCollection, idShort: string) {
  const element = collection.value?.find((entry) => entry.idShort === idShort);
  if (!(element instanceof aas.types.MultiLanguageProperty)) {
    throw new Error(`MultiLanguageProperty ${idShort} not found`);
  }
  return element.value?.map((entry) => ({ language: entry.language, text: entry.text }));
}

describe('AddressSelectionComponent', () => {
  it('applies localized address values and keeps zipcode unchanged', () => {
    const component = new AddressSelectionComponent(
      { getAllAddressData: vi.fn() } as any,
      { currentLanguage: 'en' } as any,
      { detectChanges: vi.fn() } as any,
    );

    component.selectedAddress = HerstellerAdresse.fromDto({
      name: 'ACME GmbH',
      strasse: 'Musterstraße 1',
      strasseMlpKeyValues: [
        { language: 'de', text: 'Musterstraße 1' },
        { language: 'en', text: 'Example Street 1' },
      ],
      plz: '12345',
      ort: 'Berlin',
      ortMlpKeyValues: [
        { language: 'de', text: 'Berlin' },
        { language: 'en', text: 'Berlin City' },
      ],
      bundesland: 'Berlin',
      bundeslandMlpKeyValues: [
        { language: 'de', text: 'Berlin' },
        { language: 'en', text: 'Berlin State' },
      ],
      laenderCode: 'DE',
    });

    component.editableNode = {
      value: [
        { idShort: 'street', value: [{ language: 'en', text: '' }] },
        { idShort: 'stateCounty', value: [{ language: 'en', text: '' }] },
        { idShort: 'nationalCode', value: [{ language: 'en', text: '' }] },
        { idShort: 'cityTown', value: [{ language: 'en', text: '' }] },
        { idShort: 'zipCode', value: [{ language: 'en', text: '' }] },
      ],
    };

    const collection = new aas.types.SubmodelElementCollection();
    collection.value = ['street', 'stateCounty', 'nationalCode', 'cityTown', 'zipCode'].map(emptyEnglishMlp);
    const collectionItem = new V3TreeItem<aas.types.SubmodelElementCollection>();
    collectionItem.content = collection;
    component.submodelElementCollection = collectionItem;

    const appliedSpy = vi.fn();
    component.applied.subscribe(appliedSpy);

    component.applyAddress();

    expect(component.editableNode.value.find((entry: any) => entry.idShort === 'street').value).toEqual([
      { language: 'en', text: 'Example Street 1' },
    ]);
    expect(component.editableNode.value.find((entry: any) => entry.idShort === 'zipCode').value).toEqual([
      { language: 'en', text: '12345' },
    ]);
    expect(mlpValue(collection, 'street')).toEqual([{ language: 'en', text: 'Example Street 1' }]);
    expect(mlpValue(collection, 'zipCode')).toEqual([{ language: 'en', text: '12345' }]);
    expect(appliedSpy).toHaveBeenCalledTimes(1);
  });
});
