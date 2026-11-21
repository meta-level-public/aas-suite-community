import { signal } from '@angular/core';
import { V3TreeComponent } from './v3-tree.component';
import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeItem } from '../model/v3-tree-item';

function validate(json: string, importType: 'submodel' | 'element' = 'submodel') {
  const state = {
    plainJson: json,
    importType,
    jsonValid: signal(false),
    jsonValidationError: signal<string | null>(null),
  };
  V3TreeComponent.prototype.checkJsonValidity.call(state as V3TreeComponent);
  return state;
}

describe('V3TreeComponent JSON import validation', () => {
  it('accepts a standalone submodel without concept descriptions or an environment wrapper', () => {
    const state = validate(
      JSON.stringify({
        modelType: 'Submodel',
        id: 'urn:test:asset-interface',
        idShort: 'AssetInterfacesDescription',
        kind: 'Instance',
        submodelElements: [
          {
            modelType: 'Property',
            idShort: 'base',
            valueType: 'xs:string',
            value: 'http://192.0.2.10/',
          },
        ],
      }),
    );

    expect(state.jsonValid()).toBe(true);
    expect(state.jsonValidationError()).toBeNull();
  });

  it('rejects a concept description in the submodel import dialog', () => {
    const state = validate(JSON.stringify({ modelType: 'ConceptDescription', id: 'urn:test:concept' }));

    expect(state.jsonValid()).toBe(false);
    expect(state.jsonValidationError()).toContain("Expected model type 'Submodel'");
  });

  it('rejects submodels without the required id', () => {
    const state = validate(JSON.stringify({ modelType: 'Submodel', idShort: 'MissingId' }));

    expect(state.jsonValid()).toBe(false);
    expect(state.jsonValidationError()).toBeTruthy();
  });

  it('reports malformed JSON and clears the error after valid input', () => {
    const state = validate('{');

    expect(state.jsonValid()).toBe(false);
    expect(state.jsonValidationError()).toBeTruthy();

    state.plainJson = JSON.stringify({ modelType: 'Submodel', id: 'urn:test:valid' });
    V3TreeComponent.prototype.checkJsonValidity.call(state as V3TreeComponent);

    expect(state.jsonValid()).toBe(true);
    expect(state.jsonValidationError()).toBeNull();
  });

  it('continues to accept properties only as submodel elements', () => {
    const property = JSON.stringify({ modelType: 'Property', idShort: 'Name', valueType: 'xs:string' });

    expect(validate(property, 'element').jsonValid()).toBe(true);
    expect(validate(property, 'submodel').jsonValid()).toBe(false);
  });
});

describe('V3TreeComponent labels of SubmodelElementList children', () => {
  function labelFor(content: object, smlIndex = 2, currentLang = 'de') {
    const component = Object.assign(Object.create(V3TreeComponent.prototype), {
      translate: { currentLang },
    }) as V3TreeComponent;
    const data = Object.assign(new V3TreeItem<any>(), { content, isParentSml: true, smlIndex });
    return component.getNodeLabel({ label: 'Element ' + smlIndex, data });
  }

  it('shows the idShort when the list element has one (allowed since AAS 3.1)', () => {
    expect(labelFor({ idShort: 'FolienKickoff' })).toBe('FolienKickoff');
  });

  it('falls back to the displayName in the current language', () => {
    const content = {
      displayName: [
        { language: 'en', text: 'Slides' },
        { language: 'de', text: 'Folien' },
      ],
    };

    expect(labelFor(content, 0, 'de')).toBe('Folien');
    expect(labelFor(content, 0, 'en')).toBe('Slides');
  });

  it('uses the first displayName when none matches the current language', () => {
    expect(labelFor({ displayName: [{ language: 'fr', text: 'Diapositives' }] }, 0, 'de')).toBe('Diapositives');
  });

  it('keeps the position label when neither idShort nor displayName is set', () => {
    expect(labelFor({}, 3)).toBe('Element 3');
  });
});

describe('V3TreeComponent after undo/redo', () => {
  function cdRoot(environment: aas.types.Environment) {
    return {
      label: 'ConceptDescriptions',
      data: Object.assign(new V3TreeItem<any>(), {
        content: environment,
        editorType: EditorTypeOption.ConceptDescriptions,
      }),
      children: [],
    };
  }

  it('adds new concept descriptions to the restored tree and environment', () => {
    const oldEnvironment = new aas.types.Environment(null, null, []);
    const restoredEnvironment = new aas.types.Environment(null, null, []);
    const oldRoot = cdRoot(oldEnvironment);
    const restoredRoot = cdRoot(restoredEnvironment);
    const treeService = { aasTreeData: [oldRoot] };
    const component = Object.assign(Object.create(V3TreeComponent.prototype), {
      treeService,
      shellResult: { v3Shell: oldEnvironment },
      allConceptDescriptionsNode: oldRoot,
      selectById: () => undefined,
    }) as V3TreeComponent;

    component.applyState([restoredRoot] as never, 'id', restoredEnvironment);
    component.appendConceptDescription(new aas.types.ConceptDescription('0173-1#02-AAZ830#004'));

    expect(restoredEnvironment.conceptDescriptions?.map((cd) => cd.id)).toEqual(['0173-1#02-AAZ830#004']);
    expect(restoredRoot.children).toHaveLength(1);
    expect(oldEnvironment.conceptDescriptions).toEqual([]);
  });
});
