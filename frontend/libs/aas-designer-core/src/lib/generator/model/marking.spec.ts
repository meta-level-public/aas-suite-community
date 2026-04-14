import { of } from 'rxjs';
import { Marking } from './marking';

describe('Marking', () => {
  it('creates a marking from dto without requiring an Angular injection context', () => {
    const marking = Marking.fromDto({
      value: [
        { idShort: 'MarkingName', value: '0173-1#02-BAF053#008' },
        { idShort: 'MarkingFile', value: '/aasx/files/ce.png', mimeType: 'image/png' },
        { idShort: 'MarkingAdditionalText', value: 'CE' },
      ],
    });

    expect(marking.name).toBe('0173-1#02-BAF053#008');
    expect(marking.filename).toBe('/aasx/files/ce.png');
    expect(marking.additionalText).toBe('CE');
  });

  it('loads eclass data only through an explicit service dependency', async () => {
    const marking = new Marking();
    marking.name = '0173-1#02-BAF053#008';

    const eclassService = {
      getEclassData: vi.fn().mockResolvedValue({
        benennung: 'CE-Kennzeichnung',
        definition: 'Konformitätskennzeichnung',
      }),
    } as any;

    await marking.initEclass(eclassService);

    expect(eclassService.getEclassData).toHaveBeenCalledWith('0173-1#02-BAF053#008', 'de');
    expect(marking.benennung).toBe('CE-Kennzeichnung');
    expect(marking.definition).toBe('Konformitätskennzeichnung');
  });

  it('creates a dto for a new marking with an explicit HttpClient dependency', async () => {
    const marking = new Marking();
    marking.name = '0173-1#02-BAF053#008';
    marking.filename = '/aasx/files/ce.png';
    marking.mimeType = 'image/png';
    marking.additionalText = 'CE';

    const template = {
      value: [
        { idShort: 'MarkingFile', value: '', mimeType: '' },
        { idShort: 'MarkingName', value: '' },
        { idShort: 'MarkingAdditionalText', value: '' },
      ],
    };
    const http = {
      get: vi.fn().mockReturnValue(of(template)),
    } as any;

    const dto = await marking.toDto(1, '/api', 'https://example.com', http);

    expect(http.get).toHaveBeenCalledWith('/api/SubmodelTemplate/GetMarkingTemplate');
    expect(dto.idShort).toBe('Marking01');
    expect(dto.value.find((entry: any) => entry.idShort === 'MarkingFile')?.value).toBe('/aasx/files/ce.png');
    expect(dto.value.find((entry: any) => entry.idShort === 'MarkingFile')?.mimeType).toBe('image/png');
    expect(dto.value.find((entry: any) => entry.idShort === 'MarkingName')?.value).toBe('0173-1#02-BAF053#008');
    expect(dto.value.find((entry: any) => entry.idShort === 'MarkingAdditionalText')?.value).toBe('CE');
  });
});
