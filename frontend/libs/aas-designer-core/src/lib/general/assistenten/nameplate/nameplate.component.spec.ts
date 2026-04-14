import { NameplateComponent } from './nameplate.component';

function createTranslateServiceMock() {
  return {
    currentLang: 'en',
    getDefaultLang: () => 'en',
    instant: (key: string) => key,
  };
}

function createNotificationServiceMock() {
  return {
    showMessageAlways: vi.fn(),
  };
}

function createComponent(generatorService: any, routerOverrides: Record<string, unknown> = {}) {
  const router = {
    navigate: vi.fn(),
    ...routerOverrides,
  };
  const notificationService = createNotificationServiceMock();

  return {
    component: new NameplateComponent(
      router as any,
      generatorService as any,
      createTranslateServiceMock() as any,
      notificationService as any,
    ),
    notificationService,
    router,
  };
}

function createLoadedContactInformation(): any {
  return {
    idShort: 'ContactInformation',
    modelType: { name: 'SubmodelElementCollection' },
    semanticId: {
      keys: [{ value: 'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation' }],
    },
    value: [
      { idShort: 'Company', modelType: { name: 'MultiLanguageProperty' }, value: [{ language: 'en', text: '' }] },
      { idShort: 'Name', modelType: { name: 'MultiLanguageProperty' }, value: [{ language: 'en', text: '' }] },
      { idShort: 'Street', modelType: { name: 'MultiLanguageProperty' }, value: [{ language: 'en', text: '' }] },
      { idShort: 'Zipcode', modelType: { name: 'MultiLanguageProperty' }, value: [{ language: 'en', text: '' }] },
      { idShort: 'CityTown', modelType: { name: 'MultiLanguageProperty' }, value: [{ language: 'en', text: '' }] },
      { idShort: 'StateCounty', modelType: { name: 'MultiLanguageProperty' }, value: [{ language: 'en', text: '' }] },
      {
        idShort: 'NationalCode',
        modelType: { name: 'MultiLanguageProperty' },
        value: [{ language: 'en', text: '' }],
      },
    ],
  };
}

function createNameplateRaw(): any {
  return {
    id: 'urn:test:nameplate',
    idShort: 'Nameplate',
    submodelElements: [
      {
        idShort: 'ManufacturerName',
        modelType: { name: 'MultiLanguageProperty' },
        value: [],
      },
      {
        idShort: 'ManufacturerProductRoot',
        modelType: { name: 'MultiLanguageProperty' },
        value: [],
        semanticId: { keys: [{ value: '0112/2///61360_7#AAS011#001' }] },
      },
      {
        idShort: 'ManufacturerProductFamily',
        modelType: { name: 'MultiLanguageProperty' },
        value: [],
        semanticId: { keys: [{ value: '0112/2///61987#ABP464#002' }] },
      },
      {
        idShort: 'ManufacturerProductDesignation',
        modelType: { name: 'MultiLanguageProperty' },
        value: [],
        semanticId: { keys: [{ value: '0112/2///61987#ABA567#009' }] },
      },
      {
        idShort: 'SerialNumber',
        modelType: { name: 'Property' },
        value: '',
      },
      {
        idShort: 'AddressInformation',
        modelType: { name: 'SubmodelElementCollection' },
        semanticId: {
          keys: [{ value: 'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation' }],
        },
        value: [],
      },
      {
        idShort: 'CompanyLogo',
        modelType: { name: 'File' },
        value: '',
        contentType: '',
      },
      {
        idShort: 'Markings',
        modelType: { name: 'SubmodelElementCollection' },
        semanticId: { keys: [{ value: '0112/2///61360_7#AAS006#001' }] },
        value: [],
      },
    ],
  };
}

function createGeneratorService(overrides: Record<string, unknown> = {}): any {
  const generatorService = {
    nameplateRaw: createNameplateRaw(),
    currentId: 'current-id',
    vwsTyp: 'instanz',
    getAdressen: vi.fn().mockResolvedValue([]),
    showStandardGeneratorSerialNumber: true,
    showStandardGeneratorManufacturingDate: true,
    buildDppFileKey: vi.fn((_submodel: unknown, keyPath: string[]) => keyPath.join('>')),
    getCurrentGeneratorNameplateSubmodel: vi.fn(function (this: any) {
      return this.nameplateRaw ?? null;
    }),
    getDppUploadedFile: vi.fn(() => null),
    setDppUploadedFile: vi.fn(),
    removeDppUploadedFile: vi.fn(),
    syncEditedGeneratorSubmodel: vi.fn(),
    navigateToNextGeneratorFlowStep: vi.fn(),
    navigateToPreviousGeneratorFlowStep: vi.fn(),
    ensureNameplateContactInformationLoaded: vi.fn().mockImplementation(async (submodel: any) => {
      const addressInformation = submodel?.submodelElements?.find((element: any) =>
        element.semanticId?.keys?.some(
          (key: any) =>
            key.value === 'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation',
        ),
      );
      const hasNestedContactInformation = addressInformation?.value?.some(
        (element: any) => element.idShort === 'ContactInformation',
      );
      const hasTopLevelContactInformation = submodel?.submodelElements?.some(
        (element: any) => element.idShort === 'ContactInformation',
      );

      if (hasNestedContactInformation || hasTopLevelContactInformation) {
        return;
      }

      if (addressInformation != null) {
        addressInformation.value = [createLoadedContactInformation()];
        return;
      }

      submodel.submodelElements = [...(submodel.submodelElements ?? []), createLoadedContactInformation()];
    }),
  };

  return {
    ...generatorService,
    ...overrides,
  };
}

describe('NameplateComponent', () => {
  it('reuses the same markings tree item while the active markings field stays selected', () => {
    const generatorService = createGeneratorService();
    const { component } = createComponent(generatorService);
    const markingsElement = createNameplateRaw().submodelElements.find(
      (element: any) => element.idShort === 'Markings',
    );

    component.editorFields = [
      {
        idShort: 'Markings',
        path: 'Nameplate / Markings',
        keyPath: ['Markings[0]'],
        fileKey: 'Markings[0]',
        type: 'Markings',
        element: markingsElement,
        modelTypeName: 'SubmodelElementCollection',
        label: 'KENNZEICHEN',
        focusTarget: null,
      },
    ] as any;
    component.navItems = [
      {
        key: 'markings',
        label: 'KENNZEICHEN',
        description: '',
        kind: 'leaf',
        fields: [component.editorFields[0]],
      },
    ] as any;
    component.activeItemKey = 'markings';

    const firstTreeItem = component.currentMarkingsTreeItem;
    const secondTreeItem = component.currentMarkingsTreeItem;

    expect(firstTreeItem).toBeTruthy();
    expect(secondTreeItem).toBe(firstTreeItem);
    expect(secondTreeItem?.content).toBe(markingsElement);
  });

  it('uses the same hierarchical step label as the sidebar tree', () => {
    const generatorService = createGeneratorService();
    const { component } = createComponent(generatorService);

    component.navItems = [
      {
        key: 'general',
        label: 'General',
        description: '',
        kind: 'container',
        fields: [],
        path: 'General',
        children: [
          {
            key: 'general__manufacturer',
            label: 'Manufacturer',
            description: '',
            kind: 'field',
            fields: [],
            path: 'General / Manufacturer',
            children: [],
          },
        ],
      },
      {
        key: 'markings',
        label: 'Markings',
        description: '',
        kind: 'field',
        fields: [],
        path: 'Markings',
        children: [],
      },
    ] as any;

    component.activeItemKey = 'markings';

    expect(component.activeStepLabel).toBe('2');

    component.activeItemKey = 'general__manufacturer';

    expect(component.activeStepLabel).toBe('1.1');
  });

  it('applies manufacturer dropdown values to de and en for manufacturer and address and syncs the raw submodel', () => {
    const generatorService: any = createGeneratorService();
    const addressChildren: any[] = [
      { idShort: 'Street', modelType: { name: 'MultiLanguageProperty' }, value: [] },
      { idShort: 'Zipcode', modelType: { name: 'MultiLanguageProperty' }, value: [] },
      { idShort: 'CityTown', modelType: { name: 'MultiLanguageProperty' }, value: [] },
      { idShort: 'StateCounty', modelType: { name: 'MultiLanguageProperty' }, value: [] },
      { idShort: 'NationalCode', modelType: { name: 'MultiLanguageProperty' }, value: [] },
    ];
    const addressInformation: any = {
      idShort: 'AddressInformation',
      modelType: { name: 'SubmodelElementCollection' },
      value: addressChildren,
    };
    const manufacturerElement: any = {
      idShort: 'ManufacturerName',
      modelType: { name: 'MultiLanguageProperty' },
      value: [],
    };
    generatorService.nameplateRaw.submodelElements[0] = manufacturerElement;

    const { component } = createComponent(generatorService);

    component.editorFields = [
      {
        idShort: 'AddressInformation',
        path: 'Nameplate / ContactInformation / AddressInformation',
        keyPath: ['ContactInformation[0]', 'AddressInformation[0]'],
        fileKey: 'ContactInformation[0]>AddressInformation[0]',
        type: 'AddressSelection',
        element: addressInformation,
        modelTypeName: 'SubmodelElementCollection',
        label: 'ADDRESS',
        focusTarget: 'herstellerSelect',
        children: [
          {
            idShort: 'Street',
            path: 'Street',
            keyPath: ['Street[0]'],
            fileKey: 'Street[0]',
            type: 'MultiLanguageProperty',
            element: addressChildren[0],
            modelTypeName: 'MultiLanguageProperty',
            label: 'Street',
            focusTarget: null,
          },
          {
            idShort: 'Zipcode',
            path: 'Zipcode',
            keyPath: ['Zipcode[0]'],
            fileKey: 'Zipcode[0]',
            type: 'MultiLanguageProperty',
            element: addressChildren[1],
            modelTypeName: 'MultiLanguageProperty',
            label: 'Zipcode',
            focusTarget: null,
          },
          {
            idShort: 'CityTown',
            path: 'CityTown',
            keyPath: ['CityTown[0]'],
            fileKey: 'CityTown[0]',
            type: 'MultiLanguageProperty',
            element: addressChildren[2],
            modelTypeName: 'MultiLanguageProperty',
            label: 'CityTown',
            focusTarget: null,
          },
          {
            idShort: 'StateCounty',
            path: 'StateCounty',
            keyPath: ['StateCounty[0]'],
            fileKey: 'StateCounty[0]',
            type: 'MultiLanguageProperty',
            element: addressChildren[3],
            modelTypeName: 'MultiLanguageProperty',
            label: 'StateCounty',
            focusTarget: null,
          },
          {
            idShort: 'NationalCode',
            path: 'NationalCode',
            keyPath: ['NationalCode[0]'],
            fileKey: 'NationalCode[0]',
            type: 'MultiLanguageProperty',
            element: addressChildren[4],
            modelTypeName: 'MultiLanguageProperty',
            label: 'NationalCode',
            focusTarget: null,
          },
        ],
      },
      {
        idShort: 'ManufacturerName',
        path: 'Nameplate / ManufacturerName',
        keyPath: ['ManufacturerName[0]'],
        fileKey: 'ManufacturerName[0]',
        type: 'MultiLanguageProperty',
        element: manufacturerElement,
        modelTypeName: 'MultiLanguageProperty',
        label: 'MANUFACTURER',
        focusTarget: null,
      },
    ] as any;

    component.selectedHersteller = {
      name: 'ACME GmbH',
      strasse: 'Musterstraße 1',
      plz: '12345',
      ort: 'Berlin',
      bundesland: 'Berlin',
      laenderCode: 'DE',
    } as any;

    component.applyManufacturer();

    expect(generatorService.syncEditedGeneratorSubmodel).toHaveBeenCalledWith(generatorService.nameplateRaw);

    expect(manufacturerElement.value).toEqual([
      { language: 'de', text: 'ACME GmbH' },
      { language: 'en', text: 'ACME GmbH' },
    ]);
    expect(addressChildren[0].value).toEqual([
      { language: 'de', text: 'Musterstraße 1' },
      { language: 'en', text: 'Musterstraße 1' },
    ]);
    expect(addressChildren[1].value).toEqual([
      { language: 'de', text: '12345' },
      { language: 'en', text: '12345' },
    ]);
  });

  it('builds semantic-based steps and moves the address selection to the beginning', async () => {
    const generatorService = createGeneratorService();

    const { component } = createComponent(generatorService);

    await component.ngOnInit();

    expect(generatorService.syncEditedGeneratorSubmodel).toHaveBeenCalledWith(generatorService.nameplateRaw);

    expect(component.items.map((item) => item.label)).toEqual([
      'ADDRESS',
      'MANUFACTURER',
      'PRODUCT_ROOT',
      'PRODUCT_FAMILY',
      'MANUFACTURER_PRODUCT_DESIGNATION',
      'SERIAL_NUMBER',
      'Company Logo',
      'KENNZEICHEN',
    ]);
  });

  it('keeps street, zip and city inside the address step even when the template exposes them outside address information', async () => {
    const generatorService = createGeneratorService();
    const raw = generatorService.nameplateRaw;
    const addressInformation = raw.submodelElements.find((element: any) => element.idShort === 'AddressInformation');

    addressInformation.value = [];
    raw.submodelElements.splice(
      raw.submodelElements.findIndex((element: any) => element.idShort === 'CompanyLogo'),
      0,
      { idShort: 'Street', modelType: { name: 'MultiLanguageProperty' }, value: [] },
      { idShort: 'ZipCode', modelType: { name: 'MultiLanguageProperty' }, value: [] },
      { idShort: 'City', modelType: { name: 'MultiLanguageProperty' }, value: [] },
      { idShort: 'CountryCode', modelType: { name: 'MultiLanguageProperty' }, value: [] },
    );

    const { component } = createComponent(generatorService);

    await component.ngOnInit();

    const addressField = component.editorFields.find((field: any) => field.type === 'AddressSelection') as any;
    const addressFieldIds = addressField.children.map((field: any) => field.idShort);

    expect(addressFieldIds).toEqual(expect.arrayContaining(['Street', 'ZipCode', 'City', 'CountryCode']));
    expect(addressFieldIds).not.toEqual(['Street', 'ZipCode', 'City', 'CountryCode']);
    expect(component.items.map((item) => item.label)).not.toContain('Street');
    expect(component.items.map((item) => item.label)).not.toContain('Zip Code');
    expect(component.items.map((item) => item.label)).not.toContain('City');
  });

  it('merges loaded contact information fields into the first address step when address information already exists', async () => {
    const generatorService = createGeneratorService({
      nameplateRaw: {
        id: 'urn:test:nameplate',
        idShort: 'Nameplate',
        submodelElements: [
          {
            idShort: 'AddressInformation',
            modelType: { name: 'SubmodelElementCollection' },
            semanticId: {
              keys: [{ value: 'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation' }],
            },
            value: [],
          },
          {
            idShort: 'ManufacturerName',
            modelType: { name: 'MultiLanguageProperty' },
            value: [],
          },
        ],
      },
    });

    const { component } = createComponent(generatorService);

    await component.ngOnInit();

    const addressFields = component.editorFields.filter((field: any) => field.type === 'AddressSelection');
    expect(addressFields).toHaveLength(1);
    const addressField = addressFields[0] as any;

    expect(addressField.children.map((field: any) => field.idShort)).toEqual(
      expect.arrayContaining(['Company', 'Name', 'Street', 'Zipcode', 'CityTown', 'StateCounty', 'NationalCode']),
    );
  });

  it('inserts contact information when the template has no address information and exposes company and street fields in the address step', async () => {
    const generatorService = createGeneratorService();
    generatorService.nameplateRaw.submodelElements = generatorService.nameplateRaw.submodelElements.filter(
      (element: any) => element.idShort !== 'AddressInformation',
    );

    const { component } = createComponent(generatorService);

    await component.ngOnInit();

    const insertedContactInformation = generatorService.nameplateRaw.submodelElements.find(
      (element: any) => element.idShort === 'ContactInformation',
    );
    const addressField = component.editorFields.find((field: any) => field.type === 'AddressSelection') as any;

    expect(insertedContactInformation).toBeDefined();
    expect(addressField.idShort).toBe('ContactInformation');
    expect(addressField.children.map((field: any) => field.idShort)).toEqual(
      expect.arrayContaining(['Company', 'Name', 'Street', 'Zipcode', 'CityTown', 'StateCounty', 'NationalCode']),
    );
  });

  it('fills the inserted contact information company field from the selected manufacturer', async () => {
    const generatorService = createGeneratorService();

    const { component } = createComponent(generatorService);

    await component.ngOnInit();

    component.selectedHersteller = {
      name: 'ACME GmbH',
      strasse: 'Musterstraße 1',
      plz: '12345',
      ort: 'Berlin',
      laenderCode: 'DE',
    } as any;

    component.applyManufacturer();

    const addressInformation = generatorService.nameplateRaw.submodelElements.find(
      (element: any) => element.idShort === 'AddressInformation',
    );
    const contactInformation = addressInformation.value.find(
      (element: any) => element.idShort === 'ContactInformation',
    );
    const company = contactInformation.value.find((element: any) => element.idShort === 'Company');

    expect(company.value).toEqual([
      { language: 'de', text: 'ACME GmbH' },
      { language: 'en', text: 'ACME GmbH' },
    ]);
  });

  it('applies manufacturer values even when address arrays are initially null', () => {
    const generatorService = createGeneratorService();
    const manufacturerElement = generatorService.nameplateRaw.submodelElements.find(
      (element: any) => element.idShort === 'ManufacturerName',
    );

    const component = new NameplateComponent(
      { navigate: vi.fn() } as any,
      generatorService as any,
      createTranslateServiceMock() as any,
    );

    component.selectedHersteller = {
      name: 'ACME GmbH',
      nameMlpKeyValues: [
        { language: 'de', text: 'ACME GmbH' },
        { language: 'en', text: 'ACME GmbH' },
      ],
      strasse: 'Musterstraße 1',
      strasseMlpKeyValues: [
        { language: 'de', text: 'Musterstraße 1' },
        { language: 'en', text: 'Musterstraße 1' },
      ],
      plz: '12345',
      ort: 'Berlin',
      ortMlpKeyValues: [
        { language: 'de', text: 'Berlin' },
        { language: 'en', text: 'Berlin' },
      ],
      bundesland: 'Berlin',
      bundeslandMlpKeyValues: [
        { language: 'de', text: 'Berlin' },
        { language: 'en', text: 'Berlin' },
      ],
      laenderCode: 'DE',
    } as any;

    expect(() => component.applyManufacturer()).not.toThrow();
    expect(manufacturerElement.value).toEqual([
      { language: 'de', text: 'ACME GmbH' },
      { language: 'en', text: 'ACME GmbH' },
    ]);
  });

  it('hides serial and manufacturing fields when bootstrap rules disable them', async () => {
    const raw = createNameplateRaw();
    raw.submodelElements.splice(6, 0, {
      idShort: 'YearOfConstruction',
      modelType: { name: 'Property' },
      value: '',
    });

    const generatorService = createGeneratorService({
      nameplateRaw: raw,
      showStandardGeneratorSerialNumber: false,
      showStandardGeneratorManufacturingDate: false,
    });

    const component = new NameplateComponent(
      { navigate: vi.fn() } as any,
      generatorService as any,
      createTranslateServiceMock() as any,
    );

    await component.ngOnInit();

    expect(component.items.map((item) => item.label)).not.toContain('SERIAL_NUMBER');
    expect(component.items.map((item) => item.label)).not.toContain('YEAR_OF_CONSTRUCTION');
  });

  it('resolves descriptions for contact information child fields without local semantic ids', async () => {
    const generatorService = createGeneratorService({
      additionalV3ConceptDescriptions: [
        {
          idShort: 'Company',
          embeddedDataSpecifications: [
            {
              dataSpecificationContent: {
                definition: [{ language: 'en', text: 'Legal company name of the contact address' }],
              },
            },
          ],
        },
        {
          idShort: 'Street',
          embeddedDataSpecifications: [
            {
              dataSpecificationContent: {
                definition: [{ language: 'en', text: 'Street information of the contact address' }],
              },
            },
          ],
        },
      ],
    });

    const component = new NameplateComponent(
      { navigate: vi.fn() } as any,
      generatorService as any,
      createTranslateServiceMock() as any,
    );

    await component.ngOnInit();

    const addressField = component.items.find((field) => field.type === 'AddressSelection');

    expect(addressField?.children?.find((field) => field.idShort === 'Company')?.description).toBe(
      'Legal company name of the contact address',
    );
    expect(addressField?.children?.find((field) => field.idShort === 'Street')?.description).toBe(
      'Street information of the contact address',
    );
  });

  it('shows the underlying service error when saving fails', async () => {
    const generatorService = createGeneratorService({
      saveShell: vi.fn().mockRejectedValue(new Error('Backend save failed with validation error')),
      getSaveShellErrorMessage: vi.fn().mockReturnValue('Backend save failed with validation error'),
    });
    const { component, notificationService, router } = createComponent(generatorService);

    await component.saveShell();

    expect(generatorService.getSaveShellErrorMessage).toHaveBeenCalled();
    expect(notificationService.showMessageAlways).toHaveBeenCalledWith(
      'Backend save failed with validation error',
      'ERROR',
      'error',
      true,
    );
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });
});
