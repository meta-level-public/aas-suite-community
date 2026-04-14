import { NameplateInfosVm } from '@aas/webapi-client';

export class ShellListDtoNameplateData {
  shellListDtoId: string = '';
  nameplateData: NameplateInfosVm | undefined;
  dataLoading = false;
  requested = false;
}
