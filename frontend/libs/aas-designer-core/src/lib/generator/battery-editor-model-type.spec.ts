import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { describe, expect, it } from 'vitest';
import {
  getBatteryEditorChildElements,
  getBatteryEditorElementDisplayName,
  getBatteryEditorModelTypeName,
  isBatteryEditorContainerElement,
} from './battery-editor-field-utils';

// aas-core instances expose modelType() as a method; reading modelType.name used to yield "modelType".
describe('battery editor model type handling for aas-core instances', () => {
  it('detects the model type and containers of parsed elements', () => {
    const collection = new aas.types.SubmodelElementCollection();
    const list = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property);
    const property = new aas.types.Property(aas.types.DataTypeDefXsd.String);

    expect(getBatteryEditorModelTypeName(collection)).toBe('SubmodelElementCollection');
    expect(isBatteryEditorContainerElement(collection)).toBe(true);
    expect(isBatteryEditorContainerElement(list)).toBe(true);
    expect(isBatteryEditorContainerElement(property)).toBe(false);
  });

  it('labels elements without idShort by their real type instead of "model Type"', () => {
    const label = getBatteryEditorElementDisplayName(new aas.types.MultiLanguageProperty(), 'en');

    expect(label.toLowerCase()).not.toContain('model type');
    expect(label.replace(/\s/g, '').toLowerCase()).toContain('multilanguageproperty');
  });

  it('treats only collections and lists as containers, not the language strings of an MLP', () => {
    const mlp = new aas.types.MultiLanguageProperty();
    mlp.value = [new aas.types.LangStringTextType('en', 'Pump'), new aas.types.LangStringTextType('de', 'Pumpe')];
    const child = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    const collection = new aas.types.SubmodelElementCollection();
    collection.value = [child];

    expect(getBatteryEditorChildElements(mlp)).toEqual([]);
    expect(getBatteryEditorChildElements(collection)).toEqual([child]);
  });
});
