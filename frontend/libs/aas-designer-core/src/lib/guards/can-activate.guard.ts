import { inject } from '@angular/core';
import { AuthRoles } from '../general/model/auth-roles';
import { PermissionService } from '@aas/aas-designer-shared';

export const canActivate = (rights: AuthRoles[], permissionService = inject(PermissionService)) =>
  permissionService.isAllowed(rights);
