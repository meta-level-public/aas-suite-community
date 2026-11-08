import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { deserializeSnippet, formatDeserializationError, validateImportJson } from './v3-tree-json-import';

describe('v3 tree JSON import', () => {
  it('validates submodels and submodel elements depending on the import type', () => {
    const property = JSON.stringify({ modelType: 'Property', idShort: 'Name', valueType: 'xs:string' });

    expect(validateImportJson(property, 'element')).toEqual({ valid: true, error: null });
    expect(validateImportJson(property, 'submodel').valid).toBe(false);
    expect(validateImportJson(property, 'submodel').error).toBeTruthy();
  });

  it('reports malformed JSON and does not validate concept descriptions in advance', () => {
    expect(validateImportJson('{', 'element').valid).toBe(false);
    expect(validateImportJson('{', 'element').error).toBeTruthy();
    expect(validateImportJson('{', 'cd')).toEqual({ valid: true, error: null });
  });

  it('de-serializes snippets by element type', () => {
    const json = JSON.stringify({ modelType: 'ReferenceElement', idShort: 'Link' });

    expect(deserializeSnippet('Reference', json)).toBeInstanceOf(aas.types.ReferenceElement);
    expect(deserializeSnippet('Property', json)).toBeNull();
    expect(() => deserializeSnippet('Unknown', json)).toThrow('Unknown element type');
  });

  it('formats de-serialization errors with path and message', () => {
    const result = aas.jsonization.submodelFromJsonable({ modelType: 'Submodel' });

    expect(formatDeserializationError(result.error)).toMatch(/^De-serialization failed: .*: .+/);
  });
});
