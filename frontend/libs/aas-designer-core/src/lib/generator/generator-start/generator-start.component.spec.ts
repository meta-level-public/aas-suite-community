import { NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { GeneratorStartComponent } from './generator-start.component';

describe('GeneratorStartComponent', () => {
  function createGeneratorService(
    generatorFlowSteps: Array<{ labelKey?: string; label?: string; routeCommands: any[] }>,
  ) {
    return {
      generatorFlowSteps,
      rebuildGeneratorFlow: vi.fn(),
    };
  }

  it('includes the handover step in the battery passport stepper', () => {
    const events = new Subject<NavigationEnd>();
    const breadcrumbService = {
      setItems: vi.fn(),
    };
    const translate = {
      instant: (value: string) => value,
    };
    const router = {
      url: '/generator/technical-data',
      events,
    };
    const generatorService = createGeneratorService([
      { labelKey: 'ASSET_METADATA_DATA', routeCommands: ['generator', 'asset-metadata'] },
      { labelKey: 'DIGITAL_NAMEPLATE', routeCommands: ['generator', 'nameplate'] },
      { labelKey: 'TECHNICAL_DATA', routeCommands: ['generator', 'technical-data'] },
      { labelKey: 'HANDOVER_DOCUMENTATION', routeCommands: ['generator', 'battery-handover'] },
      { labelKey: 'CONFIRM_AND_SAVE', routeCommands: ['generator', 'confirmation'] },
    ]);

    const component = new GeneratorStartComponent(
      breadcrumbService as never,
      translate as never,
      router as never,
      generatorService as never,
    );

    component.ngOnInit();
    events.next(new NavigationEnd(1, '/generator/technical-data', '/generator/technical-data'));

    expect(component.items.map((item) => item.label)).toContain('HANDOVER_DOCUMENTATION');

    component.ngOnDestroy();
  });

  it('keeps additional DBP submodels visible in the main stepper preview', () => {
    const events = new Subject<NavigationEnd>();
    const breadcrumbService = {
      setItems: vi.fn(),
    };
    const translate = {
      instant: (value: string) => value,
    };
    const router = {
      url: '/generator/battery-submodels/0',
      events,
    };
    const generatorService = createGeneratorService([
      { labelKey: 'ASSET_METADATA_DATA', routeCommands: ['generator', 'asset-metadata'] },
      { label: 'Circularity', routeCommands: ['generator', 'battery-submodels', 0] },
      { label: 'Material Composition', routeCommands: ['generator', 'battery-submodels', 1] },
      { labelKey: 'CONFIRM_AND_SAVE', routeCommands: ['generator', 'confirmation'] },
    ]);

    const component = new GeneratorStartComponent(
      breadcrumbService as never,
      translate as never,
      router as never,
      generatorService as never,
    );

    component.ngOnInit();

    expect(component.items.map((item) => item.label)).toContain('Circularity');
    expect(component.items.map((item) => item.label)).toContain('Material Composition');

    component.ngOnDestroy();
  });
});
