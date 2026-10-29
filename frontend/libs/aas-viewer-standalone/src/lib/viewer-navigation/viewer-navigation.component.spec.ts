import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubmodelLoadState } from '../submodel-load-state';
import { ViewerStoreService } from '../viewer-store.service';
import { ViewerNavigationComponent } from './viewer-navigation.component';

function loaded(id: string, idShort: string): SubmodelLoadState {
  const sm = new aas.types.Submodel(id, null, null, idShort);
  return {
    url: `https://repo/submodels/${idShort}`,
    label: idShort,
    status: 'loaded',
    submodel: { id, idShort, url: '', sm },
  };
}

describe('ViewerNavigationComponent', () => {
  let fixture: ComponentFixture<ViewerNavigationComponent>;

  beforeEach(() => {
    const states: SubmodelLoadState[] = [
      loaded('urn:sm:nameplate', 'Nameplate'),
      loaded('urn:sm:playground', 'Spielplatz'),
      { url: 'https://repo/submodels/Pending', label: 'Pending', status: 'loading' },
    ];
    TestBed.configureTestingModule({
      imports: [ViewerNavigationComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: ViewerStoreService,
          useValue: {
            submodelLoadStates: signal(states),
            isLoadingSubmodels: signal(true),
            submodelLoadProgress: signal({ done: 2, total: 3 }),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ViewerNavigationComponent);
  });

  const texts = (selector: string) =>
    Array.from(fixture.nativeElement.querySelectorAll(selector) as NodeListOf<HTMLElement>).map((el) =>
      el.textContent?.trim(),
    );

  it('shows the AAS details and all submodels as chips on small screens', () => {
    fixture.componentRef.setInput('layout', 'chips');
    fixture.componentRef.setInput('activeSubmodelId', 'urn:sm:playground');
    fixture.detectChanges();

    expect(texts('.viewer-chip')).toEqual(['AAS_METADATA', 'Nameplate', 'Spielplatz', 'Pending']);
    expect(texts('.viewer-chip.active')).toEqual(['Spielplatz']);
    expect(fixture.nativeElement.querySelector('.navigation-item')).toBeNull();
  });

  it('emits the selected submodel and the AAS details', () => {
    const submodelSelected = vi.fn();
    const metadataSelected = vi.fn();
    fixture.componentRef.setInput('layout', 'chips');
    fixture.componentInstance.submodelSelected.subscribe(submodelSelected);
    fixture.componentInstance.metadataSelected.subscribe(metadataSelected);
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelectorAll('button.viewer-chip') as NodeListOf<HTMLButtonElement>;
    chips[0].click();
    chips[1].click();

    expect(metadataSelected).toHaveBeenCalledTimes(1);
    expect(submodelSelected).toHaveBeenCalledWith('urn:sm:nameplate');
  });

  it('does not offer submodels that are still loading for selection', () => {
    fixture.componentRef.setInput('layout', 'chips');
    fixture.detectChanges();

    expect(texts('button.viewer-chip')).not.toContain('Pending');
  });

  it('shows the vertical navigation with load progress in the side column', () => {
    fixture.componentRef.setInput('metadataActive', true);
    fixture.detectChanges();

    expect(texts('.navigation-item.active')).toEqual(['AAS_METADATA']);
    expect(texts('.submodel-item')).toEqual(['Nameplate', 'Spielplatz', 'Pending']);
    expect(fixture.nativeElement.querySelector('p-progressbar')).not.toBeNull();
  });
});
