import { HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { PUBLIC_VIEWER_SESSION_HEADER, PortalService } from '@aas/common-services';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { RequestContextInterceptor } from './request-context-interceptor';

describe('RequestContextInterceptor', () => {
  function intercept(isPublicViewerSession: boolean) {
    const portalService = { currentLanguage: 'de', isPublicViewerSession } as unknown as PortalService;
    const handle = vi.fn((req: HttpRequest<unknown>) => of(new HttpResponse({ status: 200, url: req.url })));
    new RequestContextInterceptor(portalService)
      .intercept(new HttpRequest('GET', '/designer-api/api/test'), { handle } as HttpHandler)
      .subscribe();
    return handle.mock.calls[0][0] as HttpRequest<unknown>;
  }

  it('marks requests of a public viewer window', () => {
    expect(intercept(true).headers.get(PUBLIC_VIEWER_SESSION_HEADER)).toBe('1');
  });

  it('leaves requests of a designer window unmarked', () => {
    expect(intercept(false).headers.has(PUBLIC_VIEWER_SESSION_HEADER)).toBe(false);
  });
});
