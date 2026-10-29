import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { NotificationService } from '@aas/common-services';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetInterfacesDescriptionViewerComponent } from './asset-interfaces-description-viewer.component';

const WOT = 'https://www.w3.org/2019/wot/';
const ref = (value: string) => ({ type: 'ExternalReference', keys: [{ type: 'GlobalReference', value }] });
const prop = (idShort: string, semanticId: string, value: string) => ({
  modelType: 'Property',
  idShort,
  semanticId: ref(semanticId),
  valueType: 'xs:string',
  value,
});
const smc = (idShort: string, semanticId: string, value: unknown[]) => ({
  modelType: 'SubmodelElementCollection',
  idShort,
  semanticId: ref(semanticId),
  value,
});
const type = (value: string) => prop('type', 'https://www.w3.org/1999/02/22-rdf-syntax-ns#type', value);

const submodel = aas.jsonization
  .submodelFromJsonable({
    modelType: 'Submodel',
    id: 'urn:test:aid',
    submodelElements: [
      smc('HttpStatus', 'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/Interface', [
        prop('title', `${WOT}td#title`, 'SmartRast status'),
        smc('EndpointMetadata', 'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/EndpointMetadata', [
          prop('base', `${WOT}td#baseURI`, 'http://192.168.42.195/'),
        ]),
        smc('InteractionMetadata', 'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/InteractionMetadata', [
          smc('properties', `${WOT}td#PropertyAffordance`, [
            smc('Status', 'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/PropertyDefinition', [
              type('object'),
              smc('properties', `${WOT}json-schema#properties`, [
                smc('weather', `${WOT}json-schema#propertyName`, [
                  type('object'),
                  smc('properties', `${WOT}json-schema#properties`, [
                    smc('temperature_c', `${WOT}json-schema#propertyName`, [type('number')]),
                  ]),
                ]),
              ]),
              smc('forms', `${WOT}td#hasForm`, [
                prop('href', `${WOT}hypermedia#hasTarget`, '/api/status'),
                prop('htv_methodName', 'https://www.w3.org/2011/http#methodName', 'GET'),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  } as aas.jsonization.JsonValue)
  .mustValue();

describe('AssetInterfacesDescriptionViewerComponent', () => {
  let fixture: ComponentFixture<AssetInterfacesDescriptionViewerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AssetInterfacesDescriptionViewerComponent, TranslateModule.forRoot()],
      providers: [provideNoopAnimations(), { provide: NotificationService, useValue: { showMessageAlways: vi.fn() } }],
    });
    fixture = TestBed.createComponent(AssetInterfacesDescriptionViewerComponent);
    fixture.componentRef.setInput('submodel', submodel);
    fixture.detectChanges();
  });

  const rowTexts = () =>
    Array.from(fixture.nativeElement.querySelectorAll('p-treetable tbody tr') as NodeListOf<HTMLElement>).map((row) =>
      row.textContent?.replace(/\s+/g, ' ').trim(),
    );

  it('shows the interface with its title and base URL', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('SmartRast status');
    expect(text).toContain('HTTP');
    const inputs = Array.from(fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>);
    expect(inputs.map((input) => input.value)).toContain('http://192.168.42.195/');
  });

  it('lists the data points of the first level with their access', () => {
    const rows = rowTexts();

    expect(rows[0]).toContain('Status');
    expect(rows[0]).toContain('GET');
    expect(rows[0]).toContain('/api/status');
    expect(rows.some((row) => row?.includes('weather'))).toBe(true);
    expect(rows.some((row) => row?.includes('temperature_c'))).toBe(false);
  });

  it('repeats data type and access below the name for narrow widths', () => {
    // CSS shows this line instead of the detail columns when the card is narrow
    const meta = fixture.nativeElement.querySelector('p-treetable tbody tr .aid-point-meta') as HTMLElement;

    expect(meta.querySelector('code')?.textContent).toBe('object');
    expect(meta.textContent).toContain('GET');
    expect(meta.textContent).toContain('/api/status');
  });

  it('expands nested data points that match the search', async () => {
    const search = fixture.nativeElement.querySelector('p-iconfield input') as HTMLInputElement;
    search.value = 'temp';
    search.dispatchEvent(new Event('input'));

    // the tree table applies the filter with a short delay
    await vi.waitFor(
      () => {
        fixture.detectChanges();
        expect(rowTexts().some((row) => row?.includes('temperature_c'))).toBe(true);
      },
      // slow CI runners with coverage need more than the default second
      { timeout: 4000 },
    );
  });
});
