import { PermissionService } from '@aas/aas-designer-shared';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { AuthRoles } from '../general/model/auth-roles';
import { V3_EDITOR_ROUTES } from './v3-editor.routes';

describe('V3_EDITOR_ROUTES', () => {
  it('requires the write right on the infrastructure, for administrators as well', () => {
    const isAllowed = vi.fn().mockReturnValue(true);
    TestBed.configureTestingModule({ providers: [{ provide: PermissionService, useValue: { isAllowed } }] });

    for (const route of V3_EDITOR_ROUTES[0].children ?? []) {
      const guard = route.canActivate?.[0] as () => boolean;
      TestBed.runInInjectionContext(() => guard());
    }

    expect(isAllowed).toHaveBeenCalledTimes(2);
    expect(isAllowed).toHaveBeenCalledWith([AuthRoles.SHELLS_EDITOR]);
  });
});
