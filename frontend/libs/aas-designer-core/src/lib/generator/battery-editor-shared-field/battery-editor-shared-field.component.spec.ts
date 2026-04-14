import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BatteryEditorSharedFieldComponent } from './battery-editor-shared-field.component';

describe('BatteryEditorSharedFieldComponent', () => {
  function createComponent(field: any) {
    const component = new BatteryEditorSharedFieldComponent();
    component.field = field;
    component.fieldId = 'field-id';
    component.conceptDescriptions = [];
    component.referenceTypeOptions = [
      { label: 'ExternalReference', value: aas.types.ReferenceTypes.ExternalReference },
      { label: 'ModelReference', value: aas.types.ReferenceTypes.ModelReference },
    ];
    component.keyTypeOptions = [
      { label: 'GlobalReference', value: aas.types.KeyTypes.GlobalReference },
      { label: 'Submodel', value: aas.types.KeyTypes.Submodel },
    ];
    return component;
  }

  it('normalizes string based reference elements for editing', () => {
    const component = createComponent({
      type: 'ReferenceElement',
      element: {
        value: {
          type: 'ExternalReference',
          keys: [{ type: 'GlobalReference', value: 'urn:test:evidence' }],
        },
      },
    });

    expect(component.getReferenceSummary()).toBe('GlobalReference: urn:test:evidence');
    expect(component.field.element.value.type).toBe(aas.types.ReferenceTypes.ExternalReference);
    expect(component.field.element.value.keys[0].type).toBe(aas.types.KeyTypes.GlobalReference);
    expect(component.getKeyTypeOptions()).toEqual([
      { label: 'GlobalReference', value: aas.types.KeyTypes.GlobalReference },
    ]);
  });

  it('treats json blobs as textual content', () => {
    const component = createComponent({
      type: 'Blob',
      element: {
        contentType: 'application/json',
        value: '{"hello":"world"}',
      },
    });

    expect(component.isTextualBlob()).toBe(true);
    expect(component.getBlobLength()).toBe(17);

    component.onBlobValueChanged('{"hello":"battery"}');

    expect(component.getBlobValue()).toBe('{"hello":"battery"}');
  });

  it('treats pdf blobs as binary payloads', () => {
    const component = createComponent({
      type: 'Blob',
      element: {
        contentType: 'application/pdf',
        value: 'JVBERi0xLjcKJcTl8uXr',
      },
    });

    expect(component.isTextualBlob()).toBe(false);
    expect(component.getBlobLength()).toBe(20);

    component.onBlobContentTypeChanged('application/octet-stream');

    expect(component.getBlobContentType()).toBe('application/octet-stream');
  });

  it('uses datepicker conversion for date ranges', () => {
    const component = createComponent({
      type: 'Range',
      element: {
        valueType: 'xs:date',
        min: '2024-01-10',
        max: '',
      },
    });

    expect(component.usesDatePickerRangeInput()).toBe(true);
    expect(component.getRangeDatePickerValue('min')).toEqual(new Date(2024, 0, 10));

    component.onRangeDatePickerChanged('max', new Date(2024, 0, 12));

    expect(component.field.element.max).toBe('2024-01-12');
  });

  it('uses datepicker conversion for date properties', () => {
    const component = createComponent({
      type: 'Property',
      element: {
        valueType: 'xs:date',
        value: '2024-01-10',
      },
    });

    expect(component.usesDatePickerPropertyInput()).toBe(true);
    expect(component.getPropertyDatePickerValue()).toEqual(new Date(2024, 0, 10));

    component.onPropertyDatePickerChanged(new Date(2024, 0, 12));

    expect(component.field.element.value).toBe('2024-01-12');
  });

  it('returns a stable date instance for unchanged date properties', () => {
    const component = createComponent({
      type: 'Property',
      element: {
        valueType: 'xs:date',
        value: '2024-01-10',
      },
    });

    const firstValue = component.getPropertyDatePickerValue();
    const secondValue = component.getPropertyDatePickerValue();

    expect(secondValue).toBe(firstValue);
  });

  it('uses datepicker conversion for datetime properties', () => {
    const component = createComponent({
      type: 'Property',
      element: {
        valueType: 'xs:dateTime',
        value: '2024-01-10T14:35',
      },
    });

    expect(component.usesDatePickerPropertyInput()).toBe(true);
    expect(component.isDateTimePropertyInput()).toBe(true);
    expect(component.getPropertyDatePickerValue()).toEqual(new Date(2024, 0, 10, 14, 35));

    component.onPropertyDatePickerChanged(new Date(2024, 0, 12, 9, 5));

    expect(component.field.element.value).toBe('2024-01-12T09:05');
  });

  it('uses time-only datepicker conversion for time properties', () => {
    const component = createComponent({
      type: 'Property',
      element: {
        valueType: 'xsd:time',
        value: '14:35:00',
      },
    });

    expect(component.usesDatePickerPropertyInput()).toBe(true);
    expect(component.isTimeOnlyPropertyInput()).toBe(true);
    expect(component.getPropertyDatePickerValue()).toEqual(new Date(1970, 0, 1, 14, 35, 0));

    component.onPropertyDatePickerChanged(new Date(1970, 0, 1, 9, 5));

    expect(component.field.element.value).toBe('09:05');
  });

  it('uses datepicker conversion for datetime ranges', () => {
    const component = createComponent({
      type: 'Range',
      element: {
        valueType: 'xs:dateTime',
        min: '2024-01-10T14:35',
        max: null,
      },
    });

    const minValue = component.getRangeDatePickerValue('min');

    expect(component.usesDatePickerRangeInput()).toBe(true);
    expect(component.isDateTimeRangeInput()).toBe(true);
    expect(minValue).toEqual(new Date(2024, 0, 10, 14, 35));

    component.onRangeDatePickerChanged('max', new Date(2024, 0, 12, 9, 5));

    expect(component.field.element.max).toBe('2024-01-12T09:05');
  });

  it('returns a stable date instance for unchanged datetime ranges', () => {
    const component = createComponent({
      type: 'Range',
      element: {
        valueType: 'xs:dateTime',
        min: '2024-01-10T14:35',
        max: null,
      },
    });

    const firstValue = component.getRangeDatePickerValue('min');
    const secondValue = component.getRangeDatePickerValue('min');

    expect(secondValue).toBe(firstValue);
  });

  it('renders primeng datepickers for date based ranges', async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), BatteryEditorSharedFieldComponent],
    }).compileComponents();

    const fixture: ComponentFixture<BatteryEditorSharedFieldComponent> = TestBed.createComponent(
      BatteryEditorSharedFieldComponent,
    );
    const component = fixture.componentInstance;

    component.field = {
      type: 'Range',
      element: {
        valueType: 'xs:date',
        min: '2024-01-10',
        max: '2024-01-12',
      },
    };
    component.fieldId = 'range-field';
    component.referenceTypeOptions = [];
    component.keyTypeOptions = [];

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('p-datepicker')).toHaveLength(2);
  });

  it('renders a primeng datepicker for date based properties', async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), BatteryEditorSharedFieldComponent],
    }).compileComponents();

    const fixture: ComponentFixture<BatteryEditorSharedFieldComponent> = TestBed.createComponent(
      BatteryEditorSharedFieldComponent,
    );
    const component = fixture.componentInstance;

    component.field = {
      type: 'Property',
      element: {
        valueType: 'xs:dateTime',
        value: '2024-01-10T14:35',
      },
    };
    component.fieldId = 'property-date-field';
    component.referenceTypeOptions = [];
    component.keyTypeOptions = [];

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('p-datepicker')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('p-select')).toBeNull();
  });

  it('uses a select for property fields with embedded value lists', async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), BatteryEditorSharedFieldComponent],
    }).compileComponents();

    const fixture: ComponentFixture<BatteryEditorSharedFieldComponent> = TestBed.createComponent(
      BatteryEditorSharedFieldComponent,
    );
    const component = fixture.componentInstance;

    component.field = {
      type: 'Property',
      element: {
        value: 'Draft',
        embeddedDataSpecifications: [
          {
            dataSpecificationContent: {
              valueList: {
                valueReferencePairs: [{ value: 'Draft' }, { value: 'Released' }],
              },
            },
          },
        ],
      },
    };
    component.fieldId = 'property-field';
    component.referenceTypeOptions = [];
    component.keyTypeOptions = [];

    fixture.detectChanges();

    expect(component.hasPropertyValueList()).toBe(true);
    expect(component.getPropertyValueListOptions()).toEqual([
      { label: 'Draft', value: 'Draft' },
      { label: 'Released', value: 'Released' },
    ]);
    expect(fixture.nativeElement.querySelector('p-select')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
  });

  it('uses concept description value lists when the property has no embedded list', () => {
    const component = createComponent({
      type: 'Property',
      element: {
        semanticId: {
          keys: [{ value: 'urn:test:state' }],
        },
        value: null,
      },
    });
    component.conceptDescriptions = [
      {
        id: 'urn:test:state',
        embeddedDataSpecifications: [
          {
            dataSpecificationContent: {
              valueList: {
                valueReferencePairs: [{ value: 'Enabled' }, { value: 'Disabled' }],
              },
            },
          },
        ],
      } as never,
    ];

    expect(component.hasPropertyValueList()).toBe(true);
    expect(component.getPropertyValueListOptions()).toEqual([
      { label: 'Enabled', value: 'Enabled' },
      { label: 'Disabled', value: 'Disabled' },
    ]);

    component.onPropertyValueChanged('Disabled');

    expect(component.field.element.value).toBe('Disabled');
  });
});
