import { inject } from '@angular/core';
import { AuthRoles } from '@aas-designer-model';
import { PermissionService } from '../service/permission.service';

export const canActivate = (rights: AuthRoles[], permissionService = inject(PermissionService)) =>
  permissionService.isAllowed(rights);
