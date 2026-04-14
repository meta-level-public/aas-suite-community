import { OrgaUserSeatStats } from '@aas-designer-model';
import { OrganisationUserSeatStats } from '@aas/webapi-client';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  static areMoreUsersAllowed(userSeatStats: OrgaUserSeatStats | OrganisationUserSeatStats | undefined) {
    if (!userSeatStats) return false;
    if (userSeatStats.maxUserSeatsCount == null) return false;
    if (userSeatStats.activeUserSeatsCount == null) return false;
    return (
      userSeatStats.maxUserSeatsCount > userSeatStats.activeUserSeatsCount || userSeatStats.maxUserSeatsCount === -1
    );
  }
}
