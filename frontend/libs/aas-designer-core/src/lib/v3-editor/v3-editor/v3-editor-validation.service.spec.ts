import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { NotificationService, PortalService } from '@aas/common-services';
import { ShellResult } from '@aas/model';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@openng/optimus-ui/dynamicdialog';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { V3TreeService } from '../v3-tree/v3-tree.service';
import { V3EditorValidationService } from './v3-editor-validation.service';

const T = aas.types;

const MSG_DESCRIPTION = 'Description must be either not set or have at least one item.';
const MSG_EMBEDDED_DS = 'Embedded data specifications must be either not set or have at least one item.';
const MSG_VALUE_TYPE = 'Value must be consistent with the value type.';
const MSG_NOT_EMPTY = 'The value must not be empty.';
const MSG_MAX_18 = 'String shall have a maximum length of 18 characters.';
const MSG_AASD_122 =
  'Constraint AASd-122: For external references the value of type of the first key of keys shall be one of Generic Globally Identifiables.';
const MSG_AASD_123 =
  'Constraint AASd-123: For model references the value of type of the first key of keys shall be one of AAS identifiables.';
const MSG_CONCEPT_DESCRIPTIONS = 'Concept descriptions must be either not set or have at least one item.';

function createValidEnvironment() {
  const shell = new T.AssetAdministrationShell(
    'https://example.com/ids/aas/pump_4711',
    new T.AssetInformation(T.AssetKind.Instance, 'https://example.com/ids/asset/pump_4711'),
  );
  shell.idShort = 'Pump4711';

  const serialNumber = new T.Property(T.DataTypeDefXsd.String, null, null, 'SerialNumber');
  serialNumber.value = 'SN-4711';

  const nameplate = new T.Submodel('https://example.com/ids/sm/nameplate_4711');
  nameplate.idShort = 'Nameplate';
  nameplate.submodelElements = [serialNumber];

  const environment = new T.Environment();
  environment.assetAdministrationShells = [shell];
  environment.submodels = [nameplate];
  return { environment, shell, nameplate };
}

/**
 * Environment with several typical, auto-fixable modelling mistakes.
 * submodelElements: [0] empty Int property, [1] external ref with Submodel key,
 * [2] model ref with GlobalReference key, [3] property with empty category.
 */
function createBrokenEnvironment() {
  const { environment, shell, nameplate } = createValidEnvironment();
  shell.description = [];
  nameplate.description = [];
  nameplate.embeddedDataSpecifications = [];

  const count = new T.Property(T.DataTypeDefXsd.Int, null, null, 'Count');
  count.value = '';

  const externalRef = new T.ReferenceElement(null, null, 'ManufacturerRef');
  externalRef.value = new T.Reference(T.ReferenceTypes.ExternalReference, [
    new T.Key(T.KeyTypes.Submodel, 'https://example.com/ids/sm/other'),
  ]);

  const modelRef = new T.ReferenceElement(null, null, 'DocumentRef');
  modelRef.value = new T.Reference(T.ReferenceTypes.ModelReference, [
    new T.Key(T.KeyTypes.GlobalReference, 'https://example.com/doc'),
  ]);

  const categorized = new T.Property(T.DataTypeDefXsd.String, null, '', 'Categorized');
  categorized.value = 'x';

  nameplate.submodelElements = [count, externalRef, modelRef, categorized];

  const dataSpecification = new T.DataSpecificationIec61360([
    new T.LangStringPreferredNameTypeIec61360('en', 'Maximum operating temperature'),
  ]);
  dataSpecification.shortName = [new T.LangStringShortNameTypeIec61360('en', 'MaxOperatingTemperature')];
  dataSpecification.unit = '';
  dataSpecification.definition = [new T.LangStringDefinitionTypeIec61360('en', '')];

  const conceptDescription = new T.ConceptDescription('urn:example:cd:max-temp');
  conceptDescription.idShort = 'MaxTemp';
  conceptDescription.embeddedDataSpecifications = [
    new T.EmbeddedDataSpecification(
      new T.Reference(T.ReferenceTypes.ExternalReference, [
        new T.Key(
          T.KeyTypes.GlobalReference,
          'https://admin-shell.io/DataSpecificationTemplates/DataSpecificationIec61360/3',
        ),
      ]),
      dataSpecification,
    ),
  ];
  environment.conceptDescriptions = [conceptDescription];

  return { environment, shell, nameplate, count, externalRef, modelRef, categorized, dataSpecification };
}

function shellResultFor(environment: aas.types.Environment) {
  const result = new ShellResult();
  result.v3Shell = environment;
  return result;
}

describe('V3EditorValidationService', () => {
  let service: V3EditorValidationService;
  let notificationService: { showMessageAlways: ReturnType<typeof vi.fn> };
  let dialogService: { open: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let dialogClose$: Subject<unknown>;
  let dialogRef: { onClose: Subject<unknown>; close: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    notificationService = { showMessageAlways: vi.fn() };
    dialogClose$ = new Subject();
    dialogRef = { onClose: dialogClose$, close: vi.fn() };
    dialogService = { open: vi.fn(() => dialogRef) };
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        V3EditorValidationService,
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: NotificationService, useValue: notificationService },
        { provide: DialogService, useValue: dialogService },
        { provide: Router, useValue: router },
        { provide: V3TreeService, useValue: {} },
      ],
    });

    service = TestBed.inject(V3EditorValidationService);
  });

  function errorsWithMessage(message: string) {
    return service.validationErrors().filter((error) => error.message === message);
  }

  function firstError(message: string) {
    const error = errorsWithMessage(message)[0];
    if (error == null) {
      throw new Error(`Expected validation error "${message}"`);
    }
    return error;
  }

  describe('validate', () => {
    it('reports success when no shell is loaded', async () => {
      await service.validate();

      expect(service.validationErrors()).toEqual([]);
      expect(service.validationErrorCount).toBe(0);
      expect(service.displayValidationResult).toBe(false);
      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        'NO_ERRORS_FOUND',
        'SUCCESS',
        'success',
        false,
      );
    });

    it('reports success for a valid environment', async () => {
      service.shellResult = shellResultFor(createValidEnvironment().environment);

      await service.validate();

      expect(service.validationErrorCount).toBe(0);
      expect(service.displayValidationResult).toBe(false);
      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        'NO_ERRORS_FOUND',
        'SUCCESS',
        'success',
        false,
      );
    });

    it('collects numbered, translated errors with fix labels and opens the result view', async () => {
      service.shellResult = shellResultFor(createBrokenEnvironment().environment);

      await service.validate();

      const errors = service.validationErrors();
      expect(errors.length).toBeGreaterThan(0);
      expect(service.validationErrorCount).toBe(errors.length);
      expect(errors.map((error) => error.number)).toEqual(errors.map((_, index) => index + 1));
      expect(service.displayValidationResult).toBe(true);
      expect(notificationService.showMessageAlways).not.toHaveBeenCalled();

      const descriptionError = firstError(MSG_DESCRIPTION);
      expect(descriptionError.messageTranslated).toBe(`errorMessages.${MSG_DESCRIPTION}`);
      expect(descriptionError.label).toBe('SET_NULL');
      expect(descriptionError.allLabel).toBe('SET_NULL_ALL');

      expect(firstError(MSG_MAX_18).label).toBe('SHORTEN');
      expect(firstError(MSG_AASD_123).allLabel).toBe('SET_TYPE_ALL');
      expect(firstError(MSG_AASD_122).label).toBe('SET_GLOBAL_REFERENCE');
    });

    it('offers each violated constraint only once as filter option', async () => {
      const { environment, nameplate } = createBrokenEnvironment();
      const secondExternalRef = new T.ReferenceElement(null, null, 'SecondRef');
      secondExternalRef.value = new T.Reference(T.ReferenceTypes.ExternalReference, [
        new T.Key(T.KeyTypes.Submodel, 'https://example.com/ids/sm/third'),
      ]);
      nameplate.submodelElements?.push(secondExternalRef);
      service.shellResult = shellResultFor(environment);

      await service.validate();

      expect(errorsWithMessage(MSG_AASD_122)).toHaveLength(2);
      expect(service.constraintOptions.filter((option) => option === 'AASd-122')).toHaveLength(1);
      expect(service.constraintOptions).toEqual(expect.arrayContaining(['AASd-122', 'AASd-123']));
    });

    it('ignores shell level errors when only submodels are validated', async () => {
      service.shellResult = shellResultFor(createBrokenEnvironment().environment);
      service.validationScope = 'submodelOnly';

      await service.validate();

      const paths = service.validationErrors().map((error) => error.path.toString());
      expect(paths.length).toBeGreaterThan(0);
      expect(paths.some((path) => path.startsWith('.assetAdministrationShells['))).toBe(false);
      expect(paths.some((path) => path.startsWith('.submodels['))).toBe(true);
      expect(paths.some((path) => path.startsWith('.conceptDescriptions['))).toBe(true);
    });
  });

  describe('isAutoFixable', () => {
    it('accepts errors that have an automatic fix and rejects the others', async () => {
      service.shellResult = shellResultFor(createBrokenEnvironment().environment);
      await service.validate();

      expect(service.isAutoFixable(firstError(MSG_DESCRIPTION))).toBe(true);
      expect(service.isAutoFixable(firstError(MSG_VALUE_TYPE))).toBe(true);
      expect(service.isAutoFixable(firstError(MSG_NOT_EMPTY))).toBe(true);
      expect(service.isAutoFixable(firstError(MSG_AASD_122))).toBe(true);

      const aasd124 = service.validationErrors().find((error) => error.constraint === 'AASd-124');
      expect(aasd124).toBeDefined();
      expect(service.isAutoFixable(aasd124!)).toBe(false);
    });
  });

  describe('fixAll', () => {
    it('removes all empty descriptions and validates again', async () => {
      const { environment, shell, nameplate } = createBrokenEnvironment();
      service.shellResult = shellResultFor(environment);
      await service.validate();
      expect(errorsWithMessage(MSG_DESCRIPTION)).toHaveLength(2);

      service.fixAll(firstError(MSG_DESCRIPTION));

      expect(shell.description).toBeNull();
      expect(nameplate.description).toBeNull();
      expect(errorsWithMessage(MSG_DESCRIPTION)).toHaveLength(0);
    });

    it('clears empty values that do not match their value type', async () => {
      const { environment, count } = createBrokenEnvironment();
      service.shellResult = shellResultFor(environment);
      await service.validate();

      service.fixAll(firstError(MSG_VALUE_TYPE));

      expect(count.value).toBeNull();
      expect(errorsWithMessage(MSG_VALUE_TYPE)).toHaveLength(0);
    });

    it('shortens IEC 61360 short names to 18 characters', async () => {
      const { environment, dataSpecification } = createBrokenEnvironment();
      service.shellResult = shellResultFor(environment);
      await service.validate();

      service.fixAll(firstError(MSG_MAX_18));

      expect(dataSpecification.shortName?.[0].text).toBe('MaxOperatingTemper');
      expect(errorsWithMessage(MSG_MAX_18)).toHaveLength(0);
    });

    it('switches the first key of external references to a global reference', async () => {
      const { environment, externalRef } = createBrokenEnvironment();
      service.shellResult = shellResultFor(environment);
      await service.validate();

      service.fixAll(firstError(MSG_AASD_122));

      expect(externalRef.value?.keys[0].type).toBe(T.KeyTypes.GlobalReference);
      expect(errorsWithMessage(MSG_AASD_122)).toHaveLength(0);
    });

    it('nulls empty optional strings and replaces empty lang string texts with a blank', async () => {
      const { environment, categorized, dataSpecification } = createBrokenEnvironment();
      service.shellResult = shellResultFor(environment);
      await service.validate();

      service.fixAll(firstError(MSG_NOT_EMPTY));

      expect(categorized.category).toBeNull();
      expect(dataSpecification.unit).toBeNull();
      expect(dataSpecification.definition?.[0].text).toBe(' ');
      expect(errorsWithMessage(MSG_NOT_EMPTY)).toHaveLength(0);
    });

    it('removes an empty concept description list', async () => {
      const { environment } = createValidEnvironment();
      environment.conceptDescriptions = [];
      service.shellResult = shellResultFor(environment);
      await service.validate();

      service.fixAll(firstError(MSG_CONCEPT_DESCRIPTIONS));

      expect(environment.conceptDescriptions).toBeNull();
      expect(service.validationErrorCount).toBe(0);
    });
  });

  describe('fixThis', () => {
    it('removes empty embedded data specifications of the affected element only', async () => {
      const { environment, nameplate } = createBrokenEnvironment();
      service.shellResult = shellResultFor(environment);
      await service.validate();

      service.fixThis(firstError(MSG_EMBEDDED_DS));

      expect(nameplate.embeddedDataSpecifications).toBeNull();
      expect(errorsWithMessage(MSG_EMBEDDED_DS)).toHaveLength(0);
      expect(errorsWithMessage(MSG_DESCRIPTION)).toHaveLength(2);
    });

    it('turns an invalid model reference into an external reference', async () => {
      const { environment, modelRef } = createBrokenEnvironment();
      service.shellResult = shellResultFor(environment);
      await service.validate();

      service.fixThis(firstError(MSG_AASD_123));

      expect(modelRef.value?.type).toBe(T.ReferenceTypes.ExternalReference);
      expect(errorsWithMessage(MSG_AASD_123)).toHaveLength(0);
    });

    it('nulls an empty category', async () => {
      const { environment, categorized } = createBrokenEnvironment();
      service.shellResult = shellResultFor(environment);
      await service.validate();
      const categoryError = errorsWithMessage(MSG_NOT_EMPTY).find((error) =>
        error.path.toString().endsWith('.category'),
      );

      service.fixThis(categoryError!);

      expect(categorized.category).toBeNull();
    });
  });

  describe('validateIds', () => {
    it('asks the user to save first when there are unsaved changes', () => {
      service.hasChanges = () => true;

      service.validateIds();

      expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
        'SAVE_BEFORE_VALIDATION',
        'HINT',
        'info',
        true,
      );
      expect(dialogService.open).not.toHaveBeenCalled();
    });

    it('opens the id validator with the current shell result', () => {
      service.shellResult = shellResultFor(createValidEnvironment().environment);

      service.validateIds();

      expect(dialogService.open).toHaveBeenCalledTimes(1);
      expect(dialogService.open.mock.calls[0][1]).toMatchObject({
        header: 'ID_VALIDATION',
        modal: true,
        data: { shellResult: service.shellResult },
      });
    });

    it('navigates to the new shell when the validator requests a reroute', () => {
      service.validateIds();

      dialogClose$.next({ action: 'reroute', id: 'https://example.com/ids/aas/pump_4712' });

      expect(router.navigate).toHaveBeenCalledWith(
        PortalService.buildRepoEditRoute('https://example.com/ids/aas/pump_4712'),
      );
    });

    it('requests an editor reset when the validator asks for a refresh', () => {
      const actions: string[] = [];
      service.actionRequested$.subscribe((action) => actions.push(action));
      service.validateIds();

      dialogClose$.next({ action: 'refresh', id: '' });
      dialogClose$.next(null);

      expect(actions).toEqual(['reset']);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('closes an open validator dialog on destroy', () => {
      service.validateIds();

      service.destroy();

      expect(dialogRef.close).toHaveBeenCalled();
    });
  });

  describe('initValidationMenuItems', () => {
    it('provides validate, id validation and diff actions', () => {
      const onDiff = vi.fn();

      service.initValidationMenuItems(onDiff);

      expect(service.validateMenuItems.map((item) => item.label)).toEqual(['VALIDATE', 'VALIDATE_IDS', 'DIFF']);
      service.validateMenuItems[2].command?.({});
      expect(onDiff).toHaveBeenCalledTimes(1);
    });
  });
});
