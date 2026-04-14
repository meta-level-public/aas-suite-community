import { of } from 'rxjs';
import { Nameplate } from './nameplate';

describe('Nameplate', () => {
  it('creates a nameplate from dto without requiring an Angular injection context', async () => {
    const nameplate = await Nameplate.fromDto({
      submodelElements: [
        { idShort: 'ManufacturerName', value: [{ language: 'de', text: 'ACME GmbH' }] },
        { idShort: 'ContactInformation', value: [] },
        {
          idShort: 'Markings',
          value: [
            {
              value: [
                { idShort: 'MarkingName', value: '0173-1#02-BAF053#008' },
                { idShort: 'MarkingFile', value: '/aasx/files/ce.png', mimeType: 'image/png' },
              ],
            },
          ],
        },
      ],
      semanticId: { keys: [{ value: 'nameplate-type' }] },
    });

    expect(nameplate.type).toBe('nameplate-type');
    expect(nameplate.markings).toHaveLength(1);
    expect(nameplate.markings[0].name).toBe('0173-1#02-BAF053#008');
  });

  it('reads nested contact information from address information', async () => {
    const nameplate = await Nameplate.fromDto({
      submodelElements: [
        { idShort: 'ManufacturerName', value: [{ language: 'de', text: 'ACME GmbH' }] },
        {
          idShort: 'AddressInformation',
          value: [
            {
              idShort: 'ContactInformation',
              value: [
                { idShort: 'Street', value: [{ language: 'de', text: 'Musterstraße 1' }] },
                { idShort: 'Zipcode', value: [{ language: 'de', text: '12345' }] },
                { idShort: 'CityTown', value: [{ language: 'de', text: 'Berlin' }] },
                { idShort: 'StateCounty', value: [{ language: 'de', text: 'Berlin' }] },
                { idShort: 'NationalCode', value: [{ language: 'de', text: 'DE' }] },
              ],
            },
          ],
        },
        { idShort: 'Markings', value: [] },
      ],
      semanticId: { keys: [{ value: 'nameplate-type' }] },
    });

    expect(nameplate.address.street).toEqual([{ language: 'de', text: 'Musterstraße 1' }]);
    expect(nameplate.address.zip).toEqual([{ language: 'de', text: '12345' }]);
    expect(nameplate.address.cityTown).toEqual([{ language: 'de', text: 'Berlin' }]);
    expect(nameplate.address.stateCounty).toEqual([{ language: 'de', text: 'Berlin' }]);
    expect(nameplate.address.countryCode).toEqual([{ language: 'de', text: 'DE' }]);
  });

  it('creates a dto for a new nameplate with an explicit HttpClient dependency', async () => {
    const nameplate = new Nameplate('unknown');
    nameplate.manufacturer = [{ language: 'de', text: 'ACME GmbH' }];

    const template = {
      submodelElements: [
        { idShort: 'ManufacturerName', value: [] },
        { idShort: 'ManufacturerProductDesignation', value: [] },
        { idShort: 'ManufacturerProductFamily', value: [] },
        { idShort: 'ManufacturerProductRoot', value: [] },
        {
          idShort: 'ContactInformation',
          value: [
            { idShort: 'NationalCode', value: [] },
            { idShort: 'Street', value: [] },
            { idShort: 'Zipcode', value: [] },
            { idShort: 'CityTown', value: [] },
            { idShort: 'StateCounty', value: [] },
          ],
        },
        { idShort: 'Markings', value: [] },
      ],
    };
    const http = {
      get: vi.fn().mockReturnValue(of(template)),
    } as any;

    const dto = await nameplate.toDto('/api', 'https://example.com', http);

    expect(http.get).toHaveBeenCalledWith('/api/SubmodelTemplate/GetNameplateTemplate');
    expect(dto.submodelElements.find((entry: any) => entry.idShort === 'ManufacturerName')?.value).toEqual([
      { language: 'de', text: 'ACME GmbH' },
    ]);
  });

  it('writes address values into nested contact information collections', async () => {
    const nameplate = new Nameplate('unknown');
    nameplate.manufacturer = [{ language: 'de', text: 'ACME GmbH' }];
    nameplate.address.street = [{ language: 'de', text: 'Musterstraße 1' }];

    nameplate.raw = {
      submodelElements: [
        { idShort: 'ManufacturerName', value: [] },
        { idShort: 'ManufacturerProductDesignation', value: [] },
        { idShort: 'ManufacturerProductFamily', value: [] },
        { idShort: 'ManufacturerProductRoot', value: [] },
        {
          idShort: 'AddressInformation',
          value: [
            {
              idShort: 'ContactInformation',
              value: [
                { idShort: 'NationalCode', value: [] },
                { idShort: 'Street', value: [] },
                { idShort: 'Zipcode', value: [] },
                { idShort: 'CityTown', value: [] },
                { idShort: 'StateCounty', value: [] },
              ],
            },
          ],
        },
        { idShort: 'Markings', value: [] },
      ],
    };

    const dto = await nameplate.toDto('/api', 'https://example.com');
    const nestedContactInformation = dto.submodelElements[4].value[0];

    expect(nestedContactInformation.value.find((entry: any) => entry.idShort === 'Street')?.value).toEqual([
      { language: 'de', text: 'Musterstraße 1' },
    ]);
  });
});
