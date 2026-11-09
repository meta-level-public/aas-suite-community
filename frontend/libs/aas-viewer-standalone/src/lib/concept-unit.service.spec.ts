import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConceptDescriptionService } from './concept-description.service';
import { ConceptUnitService, EMPTY_VIEWER_FIELD, viewerFieldOf } from './concept-unit.service';
import { ViewerStoreService } from './viewer-store.service';

const cdWithUnit = (id: string, unit: string) =>
  aas.jsonization.conceptDescriptionFromJsonable({
    modelType: 'ConceptDescription',
    id,
    embeddedDataSpecifications: [
      {
        dataSpecification: { type: 'ExternalReference', keys: [{ type: 'GlobalReference', value: 'iec61360' }] },
        dataSpecificationContent: {
          modelType: 'DataSpecificationIec61360',
          preferredName: [{ language: 'en', text: 'Voltage' }],
          unit,
        },
      },
    ],
  } as never).value;

/** Property with a semantic ID and an IEC 61360 specification carrying unit and symbol. */
const propertyWithUnit = (semanticId: string, unit: string, symbol: string | null = null) => {
  const property = new aas.types.Property(aas.types.DataTypeDefXsd.Double, null, null, 'Mass');
  property.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, semanticId),
  ]);
  property.embeddedDataSpecifications = [
    new aas.types.EmbeddedDataSpecification(
      new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'iec61360'),
      ]),
      new aas.types.DataSpecificationIec61360(
        [new aas.types.LangStringPreferredNameTypeIec61360('en', 'Mass')],
        null,
        unit,
        null,
        null,
        symbol,
      ),
    ),
  ];
  return property;
};

describe('viewerFieldOf', () => {
  it('reads semantic ID and unit stored at the element', () => {
    expect(viewerFieldOf(propertyWithUnit(' urn:mass ', 'g'))).toEqual({ semanticId: 'urn:mass', unit: 'g' });
  });

  it('falls back to the symbol if the unit is empty', () => {
    expect(viewerFieldOf(propertyWithUnit('urn:mass', '', 'kg')).unit).toBe('kg');
  });

  it('is empty for a missing element', () => {
    expect(viewerFieldOf(undefined)).toEqual(EMPTY_VIEWER_FIELD);
  });
});

describe('ConceptUnitService', () => {
  const cdUrl = signal('https://repo.example.com');
  const loadCD = vi.fn(async (id: string) => cdWithUnit(id, 'V'));
  let service: ConceptUnitService;

  beforeEach(() => {
    loadCD.mockClear();
    cdUrl.set('https://repo.example.com');
    TestBed.configureTestingModule({
      providers: [
        { provide: ConceptDescriptionService, useValue: { loadCD } },
        { provide: ViewerStoreService, useValue: { cdUrl, apiKey: signal('') } },
      ],
    });
    service = TestBed.inject(ConceptUnitService);
  });

  it('prefers the unit stored at the element', () => {
    expect(service.unit('urn:voltage', 'mV')).toBe('mV');
    expect(loadCD).not.toHaveBeenCalled();
  });

  it('takes the unit from the concept description once it is loaded, and loads it only once', async () => {
    expect(service.unit('urn:voltage')).toBe('');
    await vi.waitFor(() => expect(service.unit('urn:voltage')).toBe('V'));
    service.unit('urn:voltage');
    expect(loadCD).toHaveBeenCalledTimes(1);
  });

  it('waits for the CD repository before loading', async () => {
    cdUrl.set('');
    expect(service.unit('urn:voltage')).toBe('');
    expect(loadCD).not.toHaveBeenCalled();

    cdUrl.set('https://repo.example.com');
    service.unit('urn:voltage');
    await vi.waitFor(() => expect(loadCD).toHaveBeenCalledTimes(1));
  });

  it('uses the fallback unit if neither element nor concept description has one', () => {
    loadCD.mockResolvedValueOnce(undefined as never);
    expect(service.fieldUnit({ semanticId: 'urn:concentration', unit: '' }, '%')).toBe('%');
    expect(service.fieldUnit({ semanticId: '', unit: 'ppm' }, '%')).toBe('ppm');
    expect(service.fieldUnit(EMPTY_VIEWER_FIELD)).toBe('');
  });

  it('appends the unit to a value, but not to an empty one', () => {
    expect(service.withUnit(' 2.45 ', { semanticId: '', unit: 'kg' })).toBe('2.45 kg');
    expect(service.withUnit('0.14', EMPTY_VIEWER_FIELD, '%')).toBe('0.14 %');
    expect(service.withUnit('0.14', EMPTY_VIEWER_FIELD)).toBe('0.14');
    expect(service.withUnit('', { semanticId: '', unit: 'kg' })).toBe('');
  });
});
