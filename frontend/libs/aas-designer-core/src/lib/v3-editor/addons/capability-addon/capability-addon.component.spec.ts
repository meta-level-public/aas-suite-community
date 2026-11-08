import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { TestBed } from '@angular/core/testing';
import { DialogService, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { vi } from 'vitest';
import { CapabilityAddonComponent } from './capability-addon.component';

const CAPABILITY_SEMANTIC_ID = 'https://admin-shell.io/idta/CapabilityDescription/Capability/1/0';

function semanticIdOf(element: aas.types.IHasSemantics | undefined | null) {
  return element?.semanticId?.keys?.[0]?.value;
}

function keysOf(reference: aas.types.Reference | null | undefined) {
  return reference?.keys.map((k) => [aas.types.KeyTypes[k.type], k.value]);
}

function child<T extends aas.types.ISubmodelElement>(
  collection: aas.types.SubmodelElementCollection | undefined,
  idShort: string,
): T | undefined {
  return collection?.value?.find((el) => el.idShort === idShort) as T | undefined;
}

describe('CapabilityAddonComponent', () => {
  let close: ReturnType<typeof vi.fn>;

  function createComponent(data?: Record<string, unknown>) {
    close = vi.fn();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CapabilityAddonComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: { close } },
        { provide: DialogService, useValue: { getInstance: vi.fn(() => (data ? { data } : undefined)) } },
      ],
    });
    TestBed.overrideComponent(CapabilityAddonComponent, { set: { template: '', imports: [], styles: [] } });
    return TestBed.createComponent(CapabilityAddonComponent).componentInstance;
  }

  function applyAndGetResult(component: CapabilityAddonComponent) {
    component.apply();
    expect(close).toHaveBeenCalledTimes(1);
    return close.mock.calls[0][0] as aas.types.SubmodelElementCollection;
  }

  describe('initialisation from dialog data', () => {
    it('uses defaults when no dialog data is available', () => {
      const component = createComponent();

      expect(component.capabilityIdShort).toBe('Capability00');
      expect(component.currentLanguage).toBe('de');
      expect(component.currentSubmodelId).toBe('');
      expect(component.availableCapabilityRefs).toEqual([]);
      expect(component.existingCapabilityContainer).toBeNull();
    });

    it('derives the idShort from the count and takes over language, submodel and refs', () => {
      const component = createComponent({
        count: 7,
        currentLanguage: 'en',
        currentSubmodelId: 'urn:sm:1',
        availableCapabilityRefs: ['CapA'],
      });

      expect(component.capabilityIdShort).toBe('Capability07');
      expect(component.currentLanguage).toBe('en');
      expect(component.currentSubmodelId).toBe('urn:sm:1');
      expect(component.availableCapabilityRefs).toEqual(['CapA']);
    });
  });

  describe('validation', () => {
    it('is valid with the default draft', () => {
      const component = createComponent();
      expect(component.validationErrorKeys).toEqual([]);
      expect(component.canApply).toBe(true);
    });

    it('requires a capability idShort', () => {
      const component = createComponent();
      component.capabilityIdShort = '   ';
      expect(component.validationErrorKeys).toEqual(['CAPABILITY_VALIDATION_ID_SHORT_REQUIRED']);
      expect(component.canApply).toBe(false);
    });

    it('requires idShorts for properties inside containers', () => {
      const component = createComponent();
      component.addPropertyContainer();
      component.propertyContainers[0].properties[0].idShort = ' ';
      expect(component.validationErrorKeys).toContain('CAPABILITY_VALIDATION_PROPERTY_ID_SHORT_REQUIRED');
    });

    it('requires value and target property for property constraints', () => {
      const component = createComponent();
      component.addPropertyConstraint();
      expect(component.validationErrorKeys).toEqual([
        'CAPABILITY_VALIDATION_PROPERTY_CONSTRAINT_VALUE_REQUIRED',
        'CAPABILITY_VALIDATION_PROPERTY_CONSTRAINT_TARGET_REQUIRED',
      ]);

      component.propertyConstraints[0].value = 'x > 1';
      component.addConstraintTargetProperty(0, 'Speed');
      component.propertyConstraints[0].idShort = '';
      expect(component.validationErrorKeys).toEqual(['CAPABILITY_VALIDATION_PROPERTY_CONSTRAINT_ID_SHORT_REQUIRED']);
    });

    it('requires idShort and target capability for transition constraints', () => {
      const component = createComponent();
      component.addTransitionConstraint();
      component.transitionConstraints[0].idShort = '';
      expect(component.validationErrorKeys).toEqual([
        'CAPABILITY_VALIDATION_TRANSITION_CONSTRAINT_ID_SHORT_REQUIRED',
        'CAPABILITY_VALIDATION_TRANSITION_CONSTRAINT_TARGET_REQUIRED',
      ]);
    });

    it('does not close the dialog when the draft is invalid', () => {
      const component = createComponent();
      component.capabilityIdShort = '';
      component.apply();
      expect(close).not.toHaveBeenCalled();
    });
  });

  describe('draft editing', () => {
    it('numbers new containers, properties and constraints consecutively', () => {
      const component = createComponent();
      component.addPropertyContainer();
      component.addPropertyContainer();
      component.addPropertyToContainer(1);
      component.addPropertyToContainer(5);
      component.addPropertyConstraint();
      component.addTransitionConstraint();

      expect(component.propertyContainers.map((c) => c.idShort)).toEqual([
        'PropertyContainer00',
        'PropertyContainer01',
      ]);
      expect(component.propertyContainers[1].properties.map((p) => p.idShort)).toEqual(['Property00', 'Property01']);
      expect(component.propertyConstraints[0].idShort).toBe('PropertyConstraint00');
      expect(component.transitionConstraints[0].idShort).toBe('TransitionConstraint00');
    });

    it('offers trimmed, non-empty property idShorts as constraint targets', () => {
      const component = createComponent();
      component.addPropertyContainer();
      component.addPropertyToContainer(0);
      component.propertyContainers[0].properties[0].idShort = ' Speed ';
      component.propertyContainers[0].properties[1].idShort = '  ';

      expect(component.propertyReferenceOptions).toEqual(['Speed']);
    });

    it('adds constraint targets trimmed and without duplicates', () => {
      const component = createComponent();
      component.addPropertyConstraint();
      component.addConstraintTargetProperty(0, ' Speed ');
      component.addConstraintTargetProperty(0, 'Speed');
      component.addConstraintTargetProperty(0, '   ');
      component.addConstraintTargetProperty(3, 'Ignored');

      expect(component.propertyConstraints[0].targetProperties).toEqual(['Speed']);

      component.removeConstraintTargetProperty(0, 0);
      expect(component.propertyConstraints[0].targetProperties).toEqual([]);
    });

    it('deduplicates relation targets per mode and resets the input', () => {
      const component = createComponent();
      component.realizedByInput = 'CapA';
      component.addRealizedBy(' CapA ');
      component.addRealizedBy('CapA');
      component.addRealizedBy('CapA', 'external');
      component.addRealizedBy('');

      expect(component.realizedByRefs).toEqual([
        { mode: 'internal', value: 'CapA' },
        { mode: 'external', value: 'CapA' },
      ]);
      expect(component.realizedByInput).toBe('');

      component.generalizedByInput = 'urn:x';
      component.addGeneralizedBy('urn:x', 'external');
      component.addGeneralizedBy('urn:x', 'external');
      expect(component.generalizedByRefs).toEqual([{ mode: 'external', value: 'urn:x' }]);
      expect(component.generalizedByInput).toBe('');
    });

    it('manages supplemental semantic ids and drops entries that become empty', () => {
      const component = createComponent();
      component.supplementalSemanticIdInput = 'urn:a';
      component.addSupplementalSemanticId(' urn:a ');
      component.addSupplementalSemanticId('urn:a');
      component.addSupplementalSemanticId('urn:b');
      expect(component.supplementalSemanticIds).toEqual(['urn:a', 'urn:b']);
      expect(component.supplementalSemanticIdInput).toBe('');

      component.supplementalSemanticIds[1] = '  urn:c ';
      component.normalizeSupplementalSemanticId(1);
      expect(component.supplementalSemanticIds).toEqual(['urn:a', 'urn:c']);

      component.supplementalSemanticIds[0] = '   ';
      component.normalizeSupplementalSemanticId(0);
      expect(component.supplementalSemanticIds).toEqual(['urn:c']);
    });
  });

  describe('apply', () => {
    it('creates a minimal capability container with role qualifier', () => {
      const component = createComponent();
      component.capabilityIdShort = ' Drill ';
      component.role = 'Offered';

      const result = applyAndGetResult(component);

      expect(result.idShort).toBe('CapabilityContainerDrill');
      expect(result.value?.map((el) => el.idShort)).toEqual(['Drill']);
      const capability = result.value?.[0] as aas.types.Capability;
      expect(capability).toBeInstanceOf(aas.types.Capability);
      expect(semanticIdOf(capability)).toBe(CAPABILITY_SEMANTIC_ID);
      expect(capability.supplementalSemanticIds).toBeNull();
      expect(capability.qualifiers?.[0].type).toBe('Offered');
      expect(capability.qualifiers?.[0].value).toBe('true');
      expect(capability.qualifiers?.[0].valueId?.keys[0].value).toContain('/CapabilityRoleQualifier/Offered/');
    });

    it('adds a comment only from complete language strings', () => {
      const component = createComponent();
      component.capabilityCommentParent.value = [
        new aas.types.LangStringTextType(' en ', ' Drills holes '),
        new aas.types.LangStringTextType('de', '  '),
      ];
      component.supplementalSemanticIds = ['urn:supp'];

      const result = applyAndGetResult(component);
      const comment = child<aas.types.MultiLanguageProperty>(result, 'CapabilityComment');

      expect(comment?.value?.map((v) => [v.language, v.text])).toEqual([['en', 'Drills holes']]);
      expect((result.value?.[0] as aas.types.Capability).supplementalSemanticIds?.[0].keys[0].value).toBe('urn:supp');
    });

    it('omits the comment when all language strings are empty', () => {
      const component = createComponent();
      component.capabilityCommentParent.value = [new aas.types.LangStringTextType('en', ' ')];
      const result = applyAndGetResult(component);
      expect(child(result, 'CapabilityComment')).toBeUndefined();
    });

    it('maps every property draft type to the matching submodel element', () => {
      const component = createComponent();
      component.addPropertyContainer();
      const container = component.propertyContainers[0];
      container.idShort = '  ';
      container.commentValue = [new aas.types.LangStringTextType('en', 'Note')];
      container.properties = [
        {
          ...container.properties[0],
          idShort: 'Speed',
          type: 'Property',
          valueType: aas.types.DataTypeDefXsd.Int,
          value: ' 5 ',
          valueId: ' urn:val ',
        },
        { ...container.properties[0], idShort: 'Torque', type: 'Range', min: ' 1 ', max: '' },
        {
          ...container.properties[0],
          idShort: 'Label',
          type: 'MultiLanguageProperty',
          mlpValue: [new aas.types.LangStringTextType('en', 'Hi'), new aas.types.LangStringTextType('', 'x')],
          valueId: '',
        },
        { ...container.properties[0], idShort: ' Tags ', type: 'SubmodelElementList', value: ' a ' },
      ];

      const result = applyAndGetResult(component);
      const propertySet = child<aas.types.SubmodelElementCollection>(result, 'PropertySet');
      const created = propertySet?.value?.[0] as aas.types.SubmodelElementCollection;

      expect(created.idShort).toBe('PropertyContainer00');
      const [property, range, mlp, list, comment] = created.value ?? [];

      expect(property).toBeInstanceOf(aas.types.Property);
      expect((property as aas.types.Property).value).toBe('5');
      expect((property as aas.types.Property).valueType).toBe(aas.types.DataTypeDefXsd.Int);
      expect((property as aas.types.Property).valueId?.keys[0].value).toBe('urn:val');

      expect(range).toBeInstanceOf(aas.types.Range);
      expect((range as aas.types.Range).min).toBe('1');
      expect((range as aas.types.Range).max).toBeNull();

      expect(mlp).toBeInstanceOf(aas.types.MultiLanguageProperty);
      expect((mlp as aas.types.MultiLanguageProperty).value?.map((v) => v.text)).toEqual(['Hi']);
      expect((mlp as aas.types.MultiLanguageProperty).valueId).toBeNull();

      expect(list).toBeInstanceOf(aas.types.SubmodelElementList);
      expect(list.idShort).toBe('Tags');
      expect(((list as aas.types.SubmodelElementList).value?.[0] as aas.types.Property).value).toBe('a');

      expect(comment.idShort).toBe('PropertyComment');
    });

    it('creates model references with the full key chain into the current submodel', () => {
      const component = createComponent({ currentSubmodelId: 'urn:sm:1' });
      component.capabilityIdShort = 'Cap';
      component.addPropertyContainer();
      component.propertyContainers[0].properties[0].idShort = 'Speed';
      component.addRealizedBy('Other');
      component.addGeneralizedBy('urn:general', 'external');
      component.addPropertyConstraint();
      component.propertyConstraints[0].value = 'x > 1';
      component.addConstraintTargetProperty(0, 'Speed');
      component.addTransitionConstraint();
      component.transitionConstraints[0].targetCapability = ' urn:next ';

      const result = applyAndGetResult(component);
      const relations = child<aas.types.SubmodelElementCollection>(result, 'CapabilityRelations');

      const realized = child<aas.types.RelationshipElement>(relations, 'CapabilityRealizedBy00');
      expect(realized?.first?.type).toBe(aas.types.ReferenceTypes.ModelReference);
      expect(keysOf(realized?.first)).toEqual([
        ['Submodel', 'urn:sm:1'],
        ['SubmodelElementCollection', 'CapabilitySet'],
        ['SubmodelElementCollection', 'CapabilityContainerCap'],
        ['Capability', 'Cap'],
      ]);
      expect(keysOf(realized?.second)).toEqual([
        ['Submodel', 'urn:sm:1'],
        ['SubmodelElementCollection', 'CapabilitySet'],
        ['SubmodelElementCollection', 'CapabilityContainerOther'],
        ['Capability', 'Other'],
      ]);

      const generalized = child<aas.types.SubmodelElementCollection>(relations, 'GeneralizedBySet');
      const generalizedRel = generalized?.value?.[0] as aas.types.RelationshipElement;
      expect(generalizedRel.second?.type).toBe(aas.types.ReferenceTypes.ExternalReference);
      expect(generalizedRel.second?.keys[0].value).toBe('urn:general');

      const constraintSet = child<aas.types.SubmodelElementCollection>(relations, 'ConstraintSet');
      const propertyConstraint = child<aas.types.SubmodelElementCollection>(constraintSet, 'PropertyConstraint00');
      expect((propertyConstraint?.value?.[0] as aas.types.Property).idShort).toBe('BasicConstraint');
      expect((propertyConstraint?.value?.[0] as aas.types.Property).value).toBe('x > 1');
      const hasProperty = child<aas.types.SubmodelElementCollection>(propertyConstraint, 'ConstraintPropertyRelations')
        ?.value?.[0] as aas.types.RelationshipElement;
      expect(keysOf(hasProperty.first)).toEqual([
        ['Submodel', 'urn:sm:1'],
        ['SubmodelElementCollection', 'CapabilitySet'],
        ['SubmodelElementCollection', 'CapabilityContainerCap'],
        ['SubmodelElementCollection', 'CapabilityRelations'],
        ['SubmodelElementCollection', 'ConstraintSet'],
        ['SubmodelElementCollection', 'PropertyConstraint00'],
      ]);
      expect(keysOf(hasProperty.second)).toEqual([
        ['Submodel', 'urn:sm:1'],
        ['SubmodelElementCollection', 'CapabilitySet'],
        ['SubmodelElementCollection', 'CapabilityContainerCap'],
        ['SubmodelElementCollection', 'PropertySet'],
        ['SubmodelElementCollection', 'PropertyContainer00'],
        ['Property', 'Speed'],
      ]);

      const transition = child<aas.types.SubmodelElementCollection>(constraintSet, 'TransitionConstraint00');
      const constrainedBy = child<aas.types.RelationshipElement>(transition, 'TransitionConstrainedBy');
      expect(constrainedBy?.second?.keys[0].value).toBe('urn:next');
      expect(child<aas.types.Property>(transition, 'TransitionConditionalType')?.value).toBe('Pre');
    });

    it('uses the given CapabilitySet path and the containers of other capabilities', () => {
      const otherContainer = new aas.types.SubmodelElementCollection(null, null, 'MillingContainer');
      otherContainer.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(
          aas.types.KeyTypes.GlobalReference,
          'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0',
        ),
      ]);
      const milling = new aas.types.Capability();
      milling.idShort = 'Milling';
      otherContainer.value = [milling];
      const capabilitySet = new aas.types.SubmodelElementCollection(null, null, 'CapabilitySet');
      capabilitySet.value = [otherContainer];

      const component = createComponent({
        currentSubmodelId: 'urn:sm:1',
        capabilitySetKeys: [
          new aas.types.Key(aas.types.KeyTypes.Submodel, 'urn:sm:1'),
          new aas.types.Key(aas.types.KeyTypes.SubmodelElementList, 'Sets'),
          new aas.types.Key(aas.types.KeyTypes.SubmodelElementCollection, '0'),
        ],
        capabilitySet,
      });
      component.capabilityIdShort = 'Cap';
      component.addGeneralizedBy('Milling');

      const result = applyAndGetResult(component);
      const generalized = child<aas.types.SubmodelElementCollection>(
        child<aas.types.SubmodelElementCollection>(result, 'CapabilityRelations'),
        'GeneralizedBySet',
      )?.value?.[0] as aas.types.RelationshipElement;

      expect(keysOf(generalized.second)).toEqual([
        ['Submodel', 'urn:sm:1'],
        ['SubmodelElementList', 'Sets'],
        ['SubmodelElementCollection', '0'],
        ['SubmodelElementCollection', 'MillingContainer'],
        ['Capability', 'Milling'],
      ]);
    });

    it('falls back to external "internal:" references without a current submodel', () => {
      const component = createComponent();
      component.capabilityIdShort = 'Cap';
      component.addRealizedBy('Other');

      const result = applyAndGetResult(component);
      const realized = child<aas.types.RelationshipElement>(
        child<aas.types.SubmodelElementCollection>(result, 'CapabilityRelations'),
        'CapabilityRealizedBy00',
      );

      expect(realized?.first?.type).toBe(aas.types.ReferenceTypes.ExternalReference);
      expect(realized?.first?.keys[0].value).toBe('internal:Capability:Cap');
      expect(realized?.second?.keys[0].value).toBe('internal:Capability:Other');
    });

    it('maps constraint types to Property, File and ReferenceElement with sensible defaults', () => {
      const component = createComponent();
      (['CustomConstraint', 'OCLConstraint', 'OperationConstraint'] as const).forEach((type, index) => {
        component.addPropertyConstraint();
        component.propertyConstraints[index].type = type;
        component.propertyConstraints[index].value = 'v';
        component.addConstraintTargetProperty(index, 'P');
      });

      const result = applyAndGetResult(component);
      const constraintSet = child<aas.types.SubmodelElementCollection>(
        child<aas.types.SubmodelElementCollection>(result, 'CapabilityRelations'),
        'ConstraintSet',
      );
      const typeElements = constraintSet?.value?.map(
        (container) => (container as aas.types.SubmodelElementCollection).value?.[0],
      );

      expect(typeElements?.[0]).toBeInstanceOf(aas.types.Property);
      expect(typeElements?.[0]?.idShort).toBe('CustomConstraint');
      expect(typeElements?.[1]).toBeInstanceOf(aas.types.File);
      expect((typeElements?.[1] as aas.types.File).contentType).toBe('text/plain');
      expect(typeElements?.[2]).toBeInstanceOf(aas.types.ReferenceElement);
      expect((typeElements?.[2] as aas.types.ReferenceElement).value?.keys[0].value).toBe('v');
    });

    it('closes the dialog with null on cancel', () => {
      const component = createComponent();
      component.cancel();
      expect(close).toHaveBeenCalledWith(null);
    });
  });

  describe('editing an existing capability container', () => {
    function buildExisting() {
      const author = createComponent({ currentSubmodelId: 'urn:sm:1' });
      author.capabilityIdShort = 'Cap';
      author.role = 'Required';
      author.supplementalSemanticIds = ['urn:supp'];
      author.capabilityCommentParent.value = [new aas.types.LangStringTextType('en', 'Comment')];
      author.addPropertyContainer();
      author.propertyContainers[0].properties[0].idShort = 'Speed';
      author.propertyContainers[0].properties[0].value = '5';
      author.addPropertyToContainer(0);
      author.propertyContainers[0].properties[1].type = 'Range';
      author.propertyContainers[0].properties[1].min = '1';
      author.propertyContainers[0].properties[1].max = '9';
      author.addRealizedBy('Other');
      author.addGeneralizedBy('urn:general', 'external');
      author.addPropertyConstraint();
      author.propertyConstraints[0].type = 'OCLConstraint';
      author.propertyConstraints[0].conditionalType = 'Post';
      author.propertyConstraints[0].value = 'rule.ocl';
      author.addConstraintTargetProperty(0, 'Speed');
      author.addTransitionConstraint();
      author.transitionConstraints[0].conditionalType = 'Invariant';
      author.transitionConstraints[0].targetCapability = 'urn:next';
      return applyAndGetResult(author);
    }

    it('restores the full draft from a previously created container', () => {
      const existing = buildExisting();
      const component = createComponent({ currentSubmodelId: 'urn:sm:1', existingCapabilityContainer: existing });

      expect(component.capabilityIdShort).toBe('Cap');
      expect(component.role).toBe('Required');
      expect(component.supplementalSemanticIds).toEqual(['urn:supp']);
      expect(component.capabilityCommentParent.value?.map((v) => v.text)).toEqual(['Comment']);
      expect(component.propertyContainers).toHaveLength(1);
      expect(component.propertyContainers[0].properties.map((p) => [p.idShort, p.type])).toEqual([
        ['Speed', 'Property'],
        ['Property01', 'Range'],
      ]);
      expect(component.propertyContainers[0].properties[0].value).toBe('5');
      expect(component.propertyContainers[0].properties[1]).toMatchObject({ min: '1', max: '9' });
      expect(component.realizedByRefs).toEqual([{ mode: 'internal', value: 'Other' }]);
      expect(component.generalizedByRefs).toEqual([{ mode: 'external', value: 'urn:general' }]);
      expect(component.propertyConstraints).toHaveLength(1);
      expect(component.propertyConstraints[0]).toMatchObject({
        idShort: 'PropertyConstraint00',
        type: 'OCLConstraint',
        conditionalType: 'Post',
        value: 'rule.ocl',
        targetProperties: ['Speed'],
      });
      expect(component.transitionConstraints).toEqual([
        { idShort: 'TransitionConstraint00', conditionalType: 'Invariant', targetCapability: 'urn:next' },
      ]);
    });

    it('produces an equivalent container when re-applied without changes', () => {
      const existing = buildExisting();
      const component = createComponent({ currentSubmodelId: 'urn:sm:1', existingCapabilityContainer: existing });

      const reapplied = applyAndGetResult(component);

      expect(aas.jsonization.toJsonable(reapplied)).toEqual(aas.jsonization.toJsonable(existing));
    });

    function buildWithoutSubmodel() {
      const author = createComponent();
      author.capabilityIdShort = 'Cap';
      author.addPropertyContainer();
      author.propertyContainers[0].properties[0].idShort = 'Speed';
      author.addRealizedBy('Other');
      author.addGeneralizedBy('Parent');
      author.addGeneralizedBy('urn:general', 'external');
      author.addPropertyConstraint();
      author.propertyConstraints[0].value = 'x > 1';
      author.addConstraintTargetProperty(0, 'Speed');
      return applyAndGetResult(author);
    }

    it('keeps "internal:" references stable over repeated load and save without a submodel', () => {
      const first = buildWithoutSubmodel();
      const second = applyAndGetResult(createComponent({ existingCapabilityContainer: first }));
      const reloaded = createComponent({ existingCapabilityContainer: second });

      expect(reloaded.propertyConstraints[0].targetProperties).toEqual(['Speed']);
      expect(aas.jsonization.toJsonable(second)).toEqual(aas.jsonization.toJsonable(first));
      const hasProperty = child<aas.types.SubmodelElementCollection>(
        child<aas.types.SubmodelElementCollection>(
          child<aas.types.SubmodelElementCollection>(
            child<aas.types.SubmodelElementCollection>(second, 'CapabilityRelations'),
            'ConstraintSet',
          ),
          'PropertyConstraint00',
        ),
        'ConstraintPropertyRelations',
      )?.value?.[0] as aas.types.RelationshipElement;
      expect(hasProperty.second?.keys[0].value).toBe('internal:Property:Speed');
    });

    it('keeps the internal mode of relation targets after reload without a submodel', () => {
      const component = createComponent({ existingCapabilityContainer: buildWithoutSubmodel() });

      expect(component.realizedByRefs).toEqual([{ mode: 'internal', value: 'Other' }]);
      expect(component.generalizedByRefs).toEqual([
        { mode: 'internal', value: 'Parent' },
        { mode: 'external', value: 'urn:general' },
      ]);
    });

    it('repairs references whose "internal:" prefix was already duplicated', () => {
      const existing = buildWithoutSubmodel();
      const relations = child<aas.types.SubmodelElementCollection>(existing, 'CapabilityRelations');
      const realized = child<aas.types.RelationshipElement>(relations, 'CapabilityRealizedBy00')!;
      realized.second = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'internal:Capability:internal:Capability:Other'),
      ]);
      const constraint = child<aas.types.SubmodelElementCollection>(
        child<aas.types.SubmodelElementCollection>(relations, 'ConstraintSet'),
        'PropertyConstraint00',
      );
      const hasProperty = child<aas.types.SubmodelElementCollection>(constraint, 'ConstraintPropertyRelations')
        ?.value?.[0] as aas.types.RelationshipElement;
      hasProperty.second = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'internal:Property:internal:Property:Speed'),
      ]);

      const component = createComponent({ existingCapabilityContainer: existing });
      expect(component.realizedByRefs).toEqual([{ mode: 'internal', value: 'Other' }]);
      expect(component.propertyConstraints[0].targetProperties).toEqual(['Speed']);
      expect(aas.jsonization.toJsonable(applyAndGetResult(component))).toEqual(
        aas.jsonization.toJsonable(buildWithoutSubmodel()),
      );
    });

    it('resolves full key chains (incl. list indices) and still reads old two-key references', () => {
      const existing = buildExisting();
      const relations = child<aas.types.SubmodelElementCollection>(existing, 'CapabilityRelations');
      const constraint = child<aas.types.SubmodelElementCollection>(
        child<aas.types.SubmodelElementCollection>(relations, 'ConstraintSet'),
        'PropertyConstraint00',
      )!;
      const relationCollection = child<aas.types.SubmodelElementCollection>(constraint, 'ConstraintPropertyRelations')!;

      // a property inside a SubmodelElementList of the property container, addressed by index
      const listItem = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, 'Feed');
      const list = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property);
      list.idShort = 'Feeds';
      list.value = [listItem];
      const propertyContainer = child<aas.types.SubmodelElementCollection>(
        child<aas.types.SubmodelElementCollection>(existing, 'PropertySet'),
        'PropertyContainer00',
      )!;
      propertyContainer.value?.push(list);

      const modelRef = (...keys: [aas.types.KeyTypes, string][]) =>
        new aas.types.Reference(
          aas.types.ReferenceTypes.ModelReference,
          keys.map(([type, value]) => new aas.types.Key(type, value)),
        );
      const toListItem = new aas.types.RelationshipElement();
      toListItem.idShort = 'ConstraintHasProperty01';
      toListItem.second = modelRef(
        [aas.types.KeyTypes.Submodel, 'urn:sm:1'],
        [aas.types.KeyTypes.SubmodelElementCollection, 'CapabilitySet'],
        [aas.types.KeyTypes.SubmodelElementCollection, existing.idShort ?? ''],
        [aas.types.KeyTypes.SubmodelElementCollection, 'PropertySet'],
        [aas.types.KeyTypes.SubmodelElementCollection, 'PropertyContainer00'],
        [aas.types.KeyTypes.SubmodelElementList, 'Feeds'],
        [aas.types.KeyTypes.Property, '0'],
      );
      const oldStyle = new aas.types.RelationshipElement();
      oldStyle.idShort = 'ConstraintHasProperty02';
      oldStyle.second = modelRef(
        [aas.types.KeyTypes.Submodel, 'urn:sm:1'],
        [aas.types.KeyTypes.SubmodelElement, 'Legacy'],
      );
      relationCollection.value?.push(toListItem, oldStyle);

      const component = createComponent({ currentSubmodelId: 'urn:sm:1', existingCapabilityContainer: existing });

      expect(component.propertyConstraints[0].targetProperties).toEqual(['Speed', 'Feed', 'Legacy']);
    });

    it('detects the role case-insensitively and falls back to NotAssigned', () => {
      const capability = new aas.types.Capability();
      capability.idShort = 'Cap';
      capability.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(aas.types.KeyTypes.GlobalReference, CAPABILITY_SEMANTIC_ID),
      ]);
      capability.qualifiers = [new aas.types.Qualifier('OFFERED', aas.types.DataTypeDefXsd.Boolean)];
      const container = new aas.types.SubmodelElementCollection(null, null, 'X', null, null, null, null, null, null, [
        capability,
      ]);

      expect(createComponent({ existingCapabilityContainer: container }).role).toBe('Offered');

      capability.qualifiers = [new aas.types.Qualifier('Something', aas.types.DataTypeDefXsd.Boolean)];
      expect(createComponent({ existingCapabilityContainer: container }).role).toBe('NotAssigned');
    });

    it('keeps the generated idShort when the container has no capability element', () => {
      const container = new aas.types.SubmodelElementCollection(null, null, 'Empty');
      const component = createComponent({ count: 4, existingCapabilityContainer: container });

      expect(component.capabilityIdShort).toBe('Capability04');
      expect(component.propertyContainers).toEqual([]);
      expect(component.realizedByRefs).toEqual([]);
      expect(component.capabilityCommentParent.value).toBeNull();
    });
  });
});
