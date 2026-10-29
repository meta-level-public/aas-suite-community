import { ShellNavigationTarget, ShellNavigator } from '@aas/aas-viewer-standalone';
import { NotificationService, PortalService } from '@aas/common-services';
import { ShellsClient } from '@aas/webapi-client';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

/** Opens AAS referenced in a viewed AAS in the designer viewer of the current infrastructure */
@Injectable({ providedIn: 'root' })
export class DesignerShellNavigationService {
  private router = inject(Router);
  private shellsClient = inject(ShellsClient);
  private notificationService = inject(NotificationService);

  readonly navigator: ShellNavigator = async (target: ShellNavigationTarget) => {
    const aasId = target.aasId?.trim() || (await this.findAasIdByGlobalAssetId(target.globalAssetId));
    if (!aasId) {
      this.notificationService.showMessage('REFERENCED_AAS_NOT_FOUND', 'OPEN_ASSOCIATED_AAS', 'warn', false, 5000);
      return;
    }
    await this.router.navigate(PortalService.buildViewerRoute(aasId));
  };

  private async findAasIdByGlobalAssetId(globalAssetId: string | null | undefined) {
    if (!globalAssetId?.trim()) return null;
    const result = await lastValueFrom(
      this.shellsClient.shells_GetAllShells(10, undefined, undefined, globalAssetId, undefined),
    );
    return result.shells?.find((shell) => shell.globalAssetId === globalAssetId)?.id ?? null;
  }
}
