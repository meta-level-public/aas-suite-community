export class OrgaUserSeatStats {
  maxUserSeatsCount: number = 0;
  activeUserSeatsCount: number = 0;
  totalUsersCount: number = 0;

  static fromDto(dto: any) {
    const stats = new OrgaUserSeatStats();

    stats.maxUserSeatsCount = +dto.maxUserSeatsCount;
    stats.activeUserSeatsCount = +dto.activeUserSeatsCount;
    stats.totalUsersCount = +dto.totalUsersCount;

    return stats;
  }
}
