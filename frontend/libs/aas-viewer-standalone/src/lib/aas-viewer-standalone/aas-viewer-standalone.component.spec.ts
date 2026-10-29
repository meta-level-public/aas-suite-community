import { NotificationService } from '@aas/common-services';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AasViewerStandaloneComponent } from './aas-viewer-standalone.component';

function rect(top: number, bottom: number) {
  return { top, bottom, left: 0, right: 0, width: 0, height: bottom - top, x: 0, y: top, toJSON: () => ({}) };
}

describe('AasViewerStandaloneComponent content reveal', () => {
  let fixture: ComponentFixture<AasViewerStandaloneComponent>;
  let scrollIntoView: ReturnType<typeof vi.fn>;
  let contentTop: number;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AasViewerStandaloneComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: NotificationService, useValue: { showMessageAlways: vi.fn() } },
      ],
    });
    fixture = TestBed.createComponent(AasViewerStandaloneComponent);
    fixture.detectChanges();

    // The toolbar ends at 40px; the position of the content column is set per test
    scrollIntoView = vi.fn();
    const toolbar = fixture.nativeElement.querySelector('.viewer-toolbar') as HTMLElement;
    const content = fixture.nativeElement.querySelector('.viewer-content-column') as HTMLElement;
    vi.spyOn(toolbar, 'getBoundingClientRect').mockReturnValue(rect(0, 40) as DOMRect);
    vi.spyOn(content, 'getBoundingClientRect').mockImplementation(() => rect(contentTop, contentTop + 500) as DOMRect);
    content.scrollIntoView = scrollIntoView;
  });

  afterEach(() => vi.restoreAllMocks());

  it('scrolls the content back into view when a submodel is selected further down the page', () => {
    contentTop = -300;

    fixture.componentInstance.onSubmodelClick('urn:test:submodel');
    fixture.detectChanges();

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' });
  });

  it('does the same when the AAS details are selected', () => {
    contentTop = -300;

    fixture.componentInstance.onMetadataClick();
    fixture.detectChanges();

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.viewMetadata()).toBe(true);
  });

  it('does not scroll when the start of the content is visible', () => {
    contentTop = 120;

    fixture.componentInstance.onSubmodelClick('urn:test:submodel');
    fixture.detectChanges();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
