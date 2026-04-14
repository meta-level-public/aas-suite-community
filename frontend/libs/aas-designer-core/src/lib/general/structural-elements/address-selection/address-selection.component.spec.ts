import { HerstellerAdresse } from '../../../generator/model/hersteller-adresse';
import { AddressSelectionComponent } from './address-selection.component';

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

    component.submodelElementCollection = {
      content: {
        value: [
          { idShort: 'street', value: [{ language: 'en', text: '' }] },
          { idShort: 'stateCounty', value: [{ language: 'en', text: '' }] },
          { idShort: 'nationalCode', value: [{ language: 'en', text: '' }] },
          { idShort: 'cityTown', value: [{ language: 'en', text: '' }] },
          { idShort: 'zipCode', value: [{ language: 'en', text: '' }] },
        ],
      },
    } as any;

    const appliedSpy = vi.fn();
    component.applied.subscribe(appliedSpy);

    component.applyAddress();

    expect(component.editableNode.value.find((entry: any) => entry.idShort === 'street').value).toEqual([
      { language: 'en', text: 'Example Street 1' },
    ]);
    expect(component.editableNode.value.find((entry: any) => entry.idShort === 'zipCode').value).toEqual([
      { language: 'en', text: '12345' },
    ]);
    expect(
      component.submodelElementCollection.content.value.find((entry: any) => entry.idShort === 'street').value,
    ).toEqual([{ language: 'en', text: 'Example Street 1' }]);
    expect(
      component.submodelElementCollection.content.value.find((entry: any) => entry.idShort === 'zipCode').value,
    ).toEqual([{ language: 'en', text: '12345' }]);
    expect(appliedSpy).toHaveBeenCalledTimes(1);
  });
});
