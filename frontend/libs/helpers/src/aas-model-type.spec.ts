import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { describe, expect, it } from 'vitest';
import { getAasModelTypeName } from './aas-model-type';

describe('getAasModelTypeName', () => {
  it('reads the model type of aas-core instances', () => {
    expect(getAasModelTypeName(new aas.types.Property(aas.types.DataTypeDefXsd.String))).toBe('Property');
    expect(getAasModelTypeName(new aas.types.MultiLanguageProperty())).toBe('MultiLanguageProperty');
    expect(getAasModelTypeName(new aas.types.SubmodelElementCollection())).toBe('SubmodelElementCollection');
    expect(getAasModelTypeName(new aas.types.Submodel('urn:sm:1'))).toBe('Submodel');
  });

  it('reads the model type of JSON-shaped elements', () => {
    expect(getAasModelTypeName({ modelType: 'File' })).toBe('File');
    expect(getAasModelTypeName({ modelType: { name: 'SubmodelElementList' } })).toBe('SubmodelElementList');
    expect(getAasModelTypeName(aas.jsonization.toJsonable(new aas.types.Range(aas.types.DataTypeDefXsd.Int)))).toBe(
      'Range',
    );
  });

  it('returns null when no model type is known', () => {
    expect(getAasModelTypeName(null)).toBeNull();
    expect(getAasModelTypeName('Property')).toBeNull();
    expect(getAasModelTypeName({ idShort: 'A' })).toBeNull();
    expect(getAasModelTypeName({ modelType: { name: 5 } })).toBeNull();
  });
});
