import { SubmodelMetadata } from '@aas/webapi-client';

export class ShellListDtoSubmodelData {
  shellListDtoId: string = '';
  submodelMetadata: SubmodelMetadata[] | undefined;
  dataLoading = false;
  requested = false;
}
