import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { LanguageService } from '@aas/aas-designer-shared';
import { ProductDesignationClient, ProductFamilyClient, ProductRootClient } from '@aas/webapi-client';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { AasSharedDataService } from '../../../asset-administration-shell-tree/services/aas-shared-data.service';
import { MultilanguagePropertyComponent } from './multilanguage-property.component';

describe('MultilanguagePropertyComponent', () => {
  let fixture: ComponentFixture<MultilanguagePropertyComponent>;
  let component: MultilanguagePropertyComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultilanguagePropertyComponent],
      providers: [
        {
          provide: LanguageService,
          useValue: {
            userLanguage: 'de',
            getLanguageNamesAndIsoAlpha2: () => [],
          },
        },
        {
          provide: AasSharedDataService,
          useValue: {
            currentEditableNode: new BehaviorSubject<any>({ mlGenUuid: 'uuid' }),
            currentAas: new BehaviorSubject<any>(null),
            syncIdShortWithLabel: { next: vi.fn() },
            undoEntries: { next: vi.fn() },
          },
        },
        {
          provide: ProductFamilyClient,
          useValue: {
            productFamily_GetAllProductFamilys: () => of([]),
          },
        },
        {
          provide: ProductRootClient,
          useValue: {
            productRoot_GetAllProductRoots: () => of([]),
          },
        },
        {
          provide: ProductDesignationClient,
          useValue: {
            productDesignation_GetAllProductDesignations: () => of([]),
          },
        },
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string) => key,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MultilanguagePropertyComponent);
    component = fixture.componentInstance;
  });

  it('fills product families into en and de when dropdown data is monolingual', () => {
    const propList: any[] = [];
    component.propList = propList;
    component.selectedFamily = {
      name: 'Antrieb',
      mlpKeyValues: [{ language: 'de', text: 'Antrieb' }],
    } as any;

    component.applyFamily();

    expect(component.propList).toBe(propList);
    expect(propList).toEqual([
      { language: 'en', text: 'Antrieb' },
      { language: 'de', text: 'Antrieb' },
    ]);
  });

  it('fills product designations into en and de when only a fallback name exists', () => {
    const propList: any[] = [];
    component.propList = propList;
    component.selectedDesignation = {
      name: 'Pump Controller',
      mlpKeyValues: [],
    } as any;

    component.applyDesignation();

    expect(component.propList).toBe(propList);
    expect(propList).toEqual([
      { language: 'en', text: 'Pump Controller' },
      { language: 'de', text: 'Pump Controller' },
    ]);
  });

  it('fills product roots into the existing bound array', () => {
    const propList: any[] = [];
    component.propList = propList;
    component.selectedRoot = {
      name: 'Controller',
      mlpKeyValues: [{ language: 'en', text: 'Controller' }],
    } as any;

    component.applyRoot();

    expect(component.propList).toBe(propList);
    expect(propList).toEqual([
      { language: 'en', text: 'Controller' },
      { language: 'de', text: 'Controller' },
    ]);
  });

  it('shows empty en and de rows immediately for product fields', () => {
    const propList: any[] = [];
    component.id = 'productFamily';
    component.propList = propList;

    component.ngOnChanges();

    expect(component.propList).not.toBe(propList);
    expect(propList).toEqual([
      { language: 'en', text: '' },
      { language: 'de', text: '' },
    ]);
  });

  it('shows empty en and de rows immediately for product designations in the nameplate step', () => {
    const propList: any[] = [];
    component.id = 'bezeichnung';
    component.propList = propList;

    component.ngOnChanges();

    expect(component.propList).not.toBe(propList);
    expect(propList).toEqual([
      { language: 'en', text: '' },
      { language: 'de', text: '' },
    ]);
  });

  it('shows empty en and de rows immediately for synchronized fields', () => {
    const propList: any[] = [];
    component.id = 'hersteller';
    component.syncGermanToEnglishOnEdit = true;
    component.propList = propList;

    component.ngOnChanges();

    expect(component.propList).not.toBe(propList);
    expect(propList).toEqual([
      { language: 'en', text: '' },
      { language: 'de', text: '' },
    ]);
  });

  it('shows empty en and de rows immediately when preferred generator languages are configured', () => {
    const propList: any[] = [];
    component.preferredLanguages = ['en', 'de'];
    component.propList = propList;

    component.ngOnChanges();

    expect(component.propList).not.toBe(propList);
    expect(propList).toEqual([
      { language: 'en', text: '' },
      { language: 'de', text: '' },
    ]);
  });

  it('reorders existing values to the configured preferred generator language order', () => {
    const propList: any[] = [{ language: 'de', text: 'Beschreibung' }];
    component.preferredLanguages = ['en', 'de'];
    component.propList = propList;

    component.ngOnChanges();

    expect(propList).toEqual([
      { language: 'en', text: '' },
      { language: 'de', text: 'Beschreibung' },
    ]);
  });

  it('does not copy preferred generator language text into another language automatically', () => {
    const propList: any[] = [{ language: 'en', text: 'Battery' }];
    component.preferredLanguages = ['en', 'de'];
    component.propList = propList;

    component.ngOnChanges();

    expect(propList).toEqual([
      { language: 'en', text: 'Battery' },
      { language: 'de', text: '' },
    ]);
  });

  it('synchronizes german address input to english until english is edited manually', () => {
    component.syncGermanToEnglishOnEdit = true;
    component.propList = [{ language: 'de', text: 'Musterstraße 1' }];

    component.onTextChange(component.propList[0]);

    expect(component.propList).toEqual([
      { language: 'en', text: 'Musterstraße 1' },
      { language: 'de', text: 'Musterstraße 1' },
    ]);

    component.propList[1].text = 'Musterstraße 2';
    component.onTextChange(component.propList[1]);

    expect(component.propList[0].text).toBe('Musterstraße 2');

    component.propList[0].text = 'Sample Street 2';
    component.onTextChange(component.propList[0]);

    component.propList[1].text = 'Musterstraße 3';
    component.onTextChange(component.propList[1]);

    expect(component.propList[0].text).toBe('Sample Street 2');
  });

  it('keeps created english sync entries before german when preferred generator languages are configured', () => {
    component.syncGermanToEnglishOnEdit = true;
    component.preferredLanguages = ['en', 'de'];
    component.propList = [{ language: 'de', text: 'Beschreibung' }];

    component.onTextChange(component.propList[0]);

    expect(component.propList).toEqual([
      { language: 'en', text: 'Beschreibung' },
      { language: 'de', text: 'Beschreibung' },
    ]);
  });

  it('synchronizes english address input to german when german is still empty', () => {
    component.syncGermanToEnglishOnEdit = true;
    component.preferredLanguages = ['en', 'de'];
    component.propList = [
      { language: 'en', text: '' },
      { language: 'de', text: '' },
    ];

    component.propList[0].text = 'Sample Street 1';
    component.onTextChange(component.propList[0]);

    expect(component.propList).toEqual([
      { language: 'en', text: 'Sample Street 1' },
      { language: 'de', text: 'Sample Street 1' },
    ]);

    component.propList[0].text = 'Sample Street 2';
    component.onTextChange(component.propList[0]);

    expect(component.propList).toEqual([
      { language: 'en', text: 'Sample Street 2' },
      { language: 'de', text: 'Sample Street 2' },
    ]);

    component.propList[1].text = 'Musterstraße 2';
    component.onTextChange(component.propList[1]);

    component.propList[0].text = 'Sample Street 3';
    component.onTextChange(component.propList[0]);

    expect(component.propList).toEqual([
      { language: 'en', text: 'Sample Street 3' },
      { language: 'de', text: 'Musterstraße 2' },
    ]);
  });

  it('uses the latest input event text when syncing english to german', () => {
    component.syncGermanToEnglishOnEdit = true;
    component.preferredLanguages = ['en', 'de'];
    component.propList = [
      { language: 'en', text: '' },
      { language: 'de', text: '' },
    ];

    component.onTextChange(component.propList[0], 'Example Street 1');

    expect(component.propList).toEqual([
      { language: 'en', text: 'Example Street 1' },
      { language: 'de', text: 'Example Street 1' },
    ]);
  });

  it('writes text changes back as AAS lang strings when bound to a typed source array', () => {
    const source = [new aas.types.LangStringTextType('en', 'Original')];
    component.propList = source as unknown as any[];

    component.ngOnChanges();
    component.onTextChange(component.propList![0], 'Updated');

    expect(source[0]).toBeInstanceOf(aas.types.LangStringTextType);
    expect(source[0].text).toBe('Updated');
  });

  it('writes language changes back as AAS lang strings when bound to a typed source array', () => {
    const source = [new aas.types.LangStringTextType('en', 'Original')];
    component.propList = source as unknown as any[];

    component.ngOnChanges();
    component.onLanguageChange(component.propList![0], 'de');

    expect(source[0]).toBeInstanceOf(aas.types.LangStringTextType);
    expect(source[0].language).toBe('de');
  });

  it('writes text changes back to editable AAS nodes even without sync mode', () => {
    const editableNode = new aas.types.MultiLanguageProperty();
    editableNode.value = [new aas.types.LangStringTextType('en', 'Original')];
    component.editableNode = editableNode;
    component.propList = editableNode.value as unknown as any[];

    component.ngOnChanges();
    component.onTextChange(component.propList![0], 'Updated through buffer');

    expect(editableNode.value?.[0]).toBeInstanceOf(aas.types.LangStringTextType);
    expect(editableNode.value?.[0].text).toBe('Updated through buffer');
  });
});
