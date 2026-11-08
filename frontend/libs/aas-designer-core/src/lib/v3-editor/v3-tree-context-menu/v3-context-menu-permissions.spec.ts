import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { CMTransformOption } from '../model/cm-transform-option';
import { CMTypeOption } from '../model/cm-type-option';
import { EditorTypeOption } from '../model/editor-type-option';
import {
  getAllowedSnippetTypes,
  isCopyAllowedFor,
  isDeleteAllowedFor,
  isInsertAllowedFor,
  isPasteAllowedFor,
  isRemoveTemplateQualifiersAllowedFor,
  isSaveAsAllowedFor,
  isTransformAllowedFor,
} from './v3-context-menu-permissions';

describe('v3 context menu permissions', () => {
  describe('isInsertAllowedFor', () => {
    it('offers submodels, snippets and JSON import below a shell but no submodel elements', () => {
      const shell = EditorTypeOption.AssetAdministrationShell;
      expect(isInsertAllowedFor(shell, CMTypeOption.Submodel)).toBe(true);
      expect(isInsertAllowedFor(shell, CMTypeOption.SMFromJson)).toBe(true);
      expect(isInsertAllowedFor(shell, CMTypeOption.Property)).toBe(false);
      expect(isInsertAllowedFor(shell, CMTypeOption.ElFromJson)).toBe(false);
    });

    it.each([EditorTypeOption.Submodel, EditorTypeOption.SubmodelElementCollection, EditorTypeOption.Entity])(
      'offers submodel elements, optional elements and addons below %s',
      (editorType) => {
        expect(isInsertAllowedFor(editorType, CMTypeOption.Property)).toBe(true);
        expect(isInsertAllowedFor(editorType, CMTypeOption.SubmodelElementList)).toBe(true);
        expect(isInsertAllowedFor(editorType, CMTypeOption.OptionalElements)).toBe(true);
        expect(isInsertAllowedFor(editorType, CMTypeOption.Addon)).toBe(true);
        expect(isInsertAllowedFor(editorType, CMTypeOption.Submodel)).toBe(false);
        expect(isInsertAllowedFor(editorType, CMTypeOption.Capability)).toBe(false);
      },
    );

    it('does not offer the generic add menu below lists (they get "add child element" instead)', () => {
      expect(isInsertAllowedFor(EditorTypeOption.SubmodelElementList, CMTypeOption.AddGroup)).toBe(false);
      expect(isInsertAllowedFor(EditorTypeOption.SubmodelElementList, CMTypeOption.Property)).toBe(false);
    });

    it('offers concept descriptions and their JSON import below the concept descriptions node', () => {
      expect(isInsertAllowedFor(EditorTypeOption.ConceptDescriptions, CMTypeOption.ConceptDescription)).toBe(true);
      expect(isInsertAllowedFor(EditorTypeOption.ConceptDescriptions, CMTypeOption.CdFromJson)).toBe(true);
      expect(isInsertAllowedFor(EditorTypeOption.ConceptDescriptions, CMTypeOption.Addon)).toBe(false);
    });

    it('allows nothing for leaf elements or without a node', () => {
      expect(isInsertAllowedFor(EditorTypeOption.Property, CMTypeOption.Property)).toBe(false);
      expect(isInsertAllowedFor(undefined, CMTypeOption.AddGroup)).toBe(false);
    });
  });

  it('allows deleting shells and supplemental files but copying and saving only model elements', () => {
    expect(isDeleteAllowedFor(EditorTypeOption.AssetAdministrationShell)).toBe(true);
    expect(isDeleteAllowedFor(EditorTypeOption.SupplementalFile)).toBe(true);
    expect(isDeleteAllowedFor(EditorTypeOption.ConceptDescriptions)).toBe(false);

    expect(isCopyAllowedFor(EditorTypeOption.AssetAdministrationShell)).toBe(true);
    expect(isCopyAllowedFor(EditorTypeOption.SupplementalFile)).toBe(false);

    expect(isSaveAsAllowedFor(EditorTypeOption.Capability)).toBe(true);
    expect(isSaveAsAllowedFor(EditorTypeOption.AssetAdministrationShell)).toBe(false);
    expect(isSaveAsAllowedFor(undefined)).toBe(false);
  });

  describe('isPasteAllowedFor', () => {
    it('allows submodel elements in containers', () => {
      expect(isPasteAllowedFor(EditorTypeOption.SubmodelElementList, EditorTypeOption.Property)).toBe(true);
      expect(isPasteAllowedFor(EditorTypeOption.Entity, EditorTypeOption.SubmodelElementCollection)).toBe(true);
    });

    it('rejects elements that do not fit the target', () => {
      expect(isPasteAllowedFor(EditorTypeOption.Submodel, EditorTypeOption.Submodel)).toBe(false);
      expect(isPasteAllowedFor(EditorTypeOption.Submodel, EditorTypeOption.Capability)).toBe(false);
      expect(isPasteAllowedFor(EditorTypeOption.Property, EditorTypeOption.Property)).toBe(false);
      expect(isPasteAllowedFor(EditorTypeOption.Submodel, undefined)).toBe(false);
    });

    it('allows submodels in shells, shells in the shell list and concept descriptions in their node', () => {
      expect(isPasteAllowedFor(EditorTypeOption.AssetAdministrationShell, EditorTypeOption.Submodel)).toBe(true);
      expect(
        isPasteAllowedFor(EditorTypeOption.AssetAdministrationShells, EditorTypeOption.AssetAdministrationShell),
      ).toBe(true);
      expect(isPasteAllowedFor(EditorTypeOption.ConceptDescriptions, EditorTypeOption.ConceptDescription)).toBe(true);
    });
  });

  it('offers exactly one transformation per transformable type', () => {
    expect(isTransformAllowedFor(EditorTypeOption.Property, CMTransformOption.TO_MULTILANGUAGE_PROPERTY)).toBe(true);
    expect(isTransformAllowedFor(EditorTypeOption.Property, CMTransformOption.TO_PROPERTY)).toBe(false);
    expect(isTransformAllowedFor(EditorTypeOption.MultiLanguageProperty, CMTransformOption.TO_PROPERTY)).toBe(true);
    expect(
      isTransformAllowedFor(EditorTypeOption.SubmodelElementCollection, CMTransformOption.TO_SUBMODEL_ELEMENT_LIST),
    ).toBe(true);
    expect(
      isTransformAllowedFor(EditorTypeOption.SubmodelElementList, CMTransformOption.TO_SUBMODEL_ELEMENT_COLLECTION),
    ).toBe(true);
    expect(isTransformAllowedFor(EditorTypeOption.File, CMTransformOption.TO_PROPERTY)).toBe(false);
  });

  it('allows removing template qualifiers only for submodels that are no templates', () => {
    const instance = new aas.types.Submodel('urn:instance');
    instance.kind = aas.types.ModellingKind.Instance;
    const template = new aas.types.Submodel('urn:template');
    template.kind = aas.types.ModellingKind.Template;

    expect(isRemoveTemplateQualifiersAllowedFor(EditorTypeOption.Submodel, instance)).toBe(true);
    expect(isRemoveTemplateQualifiersAllowedFor(EditorTypeOption.Submodel, template)).toBe(false);
    expect(isRemoveTemplateQualifiersAllowedFor(EditorTypeOption.SubmodelElementCollection, instance)).toBe(false);
  });

  it('restricts the snippet types to what fits below the target', () => {
    expect(getAllowedSnippetTypes(EditorTypeOption.AssetAdministrationShell)).toEqual([EditorTypeOption.Submodel]);
    expect(getAllowedSnippetTypes(EditorTypeOption.Entity)).toContain(EditorTypeOption.ContactInformation);
    expect(getAllowedSnippetTypes(EditorTypeOption.Property)).toEqual([]);
  });
});
