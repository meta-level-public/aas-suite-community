import { AasConfirmationService, NotificationService } from '@aas/common-services';
import {
  CreateInstanceRequest,
  CreateSharedLink,
  SharedLinksClient,
  ShellListVm,
  ShellPlainVm,
  ShellsClient,
  TransferShellRequest,
  TransferShellResponse,
} from '@aas/webapi-client';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ShellsListActions {
  constructor(
    private readonly shellsClient: ShellsClient,
    private readonly sharedLinksClient: SharedLinksClient,
    private readonly confirmService: AasConfirmationService,
    private readonly notificationService: NotificationService,
  ) {}

  async deleteShell(id: string, confirmMessage: string): Promise<boolean> {
    if ((await this.confirmService.confirm({ message: confirmMessage })) !== true) {
      return false;
    }

    return await lastValueFrom(this.shellsClient.shells_Delete(id));
  }

  async confirmDelete(confirmMessage: string): Promise<boolean> {
    return (await this.confirmService.confirm({ message: confirmMessage })) === true;
  }

  async duplicateShell(id: string): Promise<TransferShellResponse> {
    return await lastValueFrom(this.shellsClient.shells_Duplicate(id));
  }

  async confirmRegisterPcn(): Promise<boolean> {
    return (await this.confirmService.confirm({ message: 'HAS_PNC_SUBSCRIBE_Q' })) === true;
  }

  async createNewAas(): Promise<string | undefined> {
    const result = await lastValueFrom(this.shellsClient.shells_Create());
    return result.aasId;
  }

  async transferShell(targetRepoId: number, shellId: string): Promise<TransferShellResponse> {
    const request = new TransferShellRequest({
      targetRepoId,
      aasIdentifier: shellId,
    });
    const result = await lastValueFrom(this.shellsClient.shells_Transfer(request));
    this.notificationService.showMessageAlways('SUCCESS_TRANSFER_SHELL', 'SUCCESS', 'success', false);
    return result;
  }

  async getShellJsonBlob(aasIdentifier: string): Promise<Blob> {
    const result: ShellPlainVm = await lastValueFrom(this.shellsClient.shells_GetShellPlain(aasIdentifier));
    return new Blob([result.plainJson ?? ''], { type: 'application/json' });
  }

  async deleteBulk(ids: string[]): Promise<boolean> {
    if (ids.length === 0) {
      this.notificationService.showMessageAlways('NO_SHELLS_SELECTED', 'ERROR', 'error', false);
      return false;
    }

    return await lastValueFrom(this.shellsClient.shells_DeleteShellsBulk(ids));
  }

  async downloadBulk(ids: string[]) {
    if (ids.length === 0) {
      this.notificationService.showMessageAlways('NO_SHELLS_SELECTED', 'ERROR', 'error', false);
      return null;
    }

    return await lastValueFrom(this.shellsClient.shells_DownloadShellsBulk(ids));
  }

  async createSharedLink(sharedLink: CreateSharedLink): Promise<string> {
    return await lastValueFrom(this.sharedLinksClient.sharedLinks_CreateSharedLink(sharedLink));
  }

  async findAsset(assetId: string): Promise<ShellListVm> {
    return await lastValueFrom(this.shellsClient.shells_Discover(assetId));
  }

  async createInstance(createInstanceItem: CreateInstanceRequest): Promise<string> {
    return await lastValueFrom(this.shellsClient.shells_CreateInstance(createInstanceItem));
  }
}
