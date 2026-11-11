import { DOCS_CONTEXT, docsTopic, UserDocsService } from '@aas/common-services';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserDocsButtonComponent } from './user-docs-button.component';

describe('UserDocsButtonComponent', () => {
  let userDocsService: { isAvailable: ReturnType<typeof vi.fn>; open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    userDocsService = { isAvailable: vi.fn().mockReturnValue(true), open: vi.fn() };
    TestBed.configureTestingModule({
      imports: [UserDocsButtonComponent, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        { provide: UserDocsService, useValue: userDocsService },
        { provide: Router, useValue: { url: '/viewer/aas-view/1/abc' } },
        {
          provide: DOCS_CONTEXT,
          useValue: {
            defaultTopic: docsTopic('designer'),
            rules: [{ urlPrefix: 'viewer', topic: docsTopic('designer/viewer') }],
          },
        },
      ],
    });
  });

  it('opens the documentation page of the current route', () => {
    const fixture = TestBed.createComponent(UserDocsButtonComponent);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(userDocsService.open).toHaveBeenCalledWith('designer/viewer');
  });

  it('is hidden if no documentation is configured', () => {
    userDocsService.isAvailable.mockReturnValue(false);
    const fixture = TestBed.createComponent(UserDocsButtonComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
