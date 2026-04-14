import { ADDITIONAL_ORGANISATION_MENU_ITEMS, OrganisationMenuItemContext } from '@aas-designer-model';
import { AccessService } from '@aas/common-services';
import { AasInfrastructureClient, SystemConfigurationDto, SystemManagementClient } from '@aas/webapi-client';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { SplitterModule } from 'primeng/splitter';
import { lastValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SidebarTreeNavComponent } from '../../general/sidebar-tree-nav/sidebar-tree-nav.component';
import { OrganisationStateService } from '../organisation-state.service';

@Component({
  selector: 'aas-my-organisation',
  imports: [SplitterModule, TranslateModule, RouterModule, SidebarTreeNavComponent],
  templateUrl: './my-organisation.component.html',
  styleUrls: ['../../../host.scss', './my-organisation.component.scss'],
})
export class MyOrganisationComponent implements OnInit {
  orgaSubentries = signal<TreeNode[]>([]);
  selectedNodeKey: string | null = null;
  router = inject(Router);
  route = inject(ActivatedRoute);
  accessService = inject(AccessService);
  infrastructureClient = inject(AasInfrastructureClient);
  systemManagementClient = inject(SystemManagementClient);
  orgaStateService = inject(OrganisationStateService);
  additionalMenuItems = inject(ADDITIONAL_ORGANISATION_MENU_ITEMS);
  systemConfiguration = signal<SystemConfigurationDto | null>(null);

  infrastructureReloadEffect = effect(() => {
    this.orgaStateService.infrastructureTreeVersion();
    queueMicrotask(async () => {
      await this.reloadInfrastructureTree();
    });
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.syncSelectionFromRoute());
  }

  async ngOnInit() {
    // Load organisation data
    await this.orgaStateService.loadOrganisation();
    await this.orgaStateService.loadUserSeatStats();
    this.systemConfiguration.set(await lastValueFrom(this.systemManagementClient.systemManagement_GetConfiguration()));
    await this.reloadInfrastructureTree();
  }

  private async reloadInfrastructureTree() {
    const menuItems: TreeNode[] = [];
    menuItems.push({
      label: 'ORGANIZATION_DETAILS',
      data: { value: 'details' },
      icon: 'pi pi-info',
      key: 'details',
      expanded: true,
    });

    const context: OrganisationMenuItemContext = {
      accessService: this.accessService,
      router: this.router,
    };

    const additionalItems = this.additionalMenuItems
      .map((config) => config.createMenuItem(context))
      .filter((item) => item !== null);

    menuItems.push(...additionalItems);

    if (this.accessService.isAllowed('ORGA_ADMIN'))
      menuItems.push({
        label: 'USERS',
        data: { value: 'users' },
        icon: 'pi pi-users',
        key: 'users',
        expanded: true,
      });
    if (this.accessService.isAllowed('ORGA_ADMIN'))
      menuItems.push({
        label: 'INVITATIONS',
        data: { value: 'invitations' },
        icon: 'pi pi-envelope',
        key: 'invitations',
        expanded: true,
      });
    if (this.accessService.isAllowed('ORGA_ADMIN'))
      menuItems.push({
        label: 'ECLASS',
        data: { value: 'eclass' },
        icon: 'pi pi-file',
        key: 'eclass',
        expanded: true,
      });
    if (this.accessService.isAllowed('ORGA_ADMIN'))
      menuItems.push({
        label: 'TOKEN',
        data: { value: 'token' },
        icon: 'pi pi-tags',
        key: 'token',
        expanded: true,
      });

    const infrastructureChildren = await this.getInfrastructureChildren();
    menuItems.push({
      label: 'AAS_INFRASTRUCTURE',
      data: { value: 'infrastructure' },
      icon: 'pi pi-server',
      key: 'infrastructure',
      children: infrastructureChildren,
      expanded: true,
    });

    if (this.accessService.isAllowed('ORGA_ADMIN') && this.systemConfiguration()?.singleTenantMode === false)
      menuItems.push({
        label: 'PAYMENT_MODEL',
        data: { value: 'payment-model' },
        icon: 'pi pi-credit-card',
        key: 'payment-model',
        expanded: true,
      });

    this.ensureNodeKeys(menuItems);
    this.orgaSubentries.set(menuItems);
    this.syncSelectionFromRoute();
  }

  async getInfrastructureChildren() {
    const res = await lastValueFrom(this.infrastructureClient.aasInfrastructure_GetAllSavedInfrastructures());
    return res
      .sort((a, b) => ((a.isInternal ?? false) > (b?.isInternal ?? false) ? -1 : 1))
      .map((infrastructure) => {
        return {
          key: `infrastructure/${infrastructure.id}`,
          label: infrastructure.name,
          data: { value: `infrastructure/${infrastructure.id}` },
          icon: 'pi pi-server',
        };
      });
  }

  selectPage(entry: TreeNode) {
    const value = entry.data?.value;
    if (value == null) {
      return;
    }

    this.router.navigate([value], { relativeTo: this.route });
  }

  private syncSelectionFromRoute() {
    const currentPath = this.router.url.split('?')[0].split('#')[0].split('/my-organization/')[1];
    if (currentPath == null || currentPath === '') {
      this.selectedNodeKey = null;
      return;
    }

    this.selectedNodeKey = this.findNodeByValue(this.orgaSubentries(), currentPath)?.key ?? null;
  }

  private findNodeByValue(nodes: TreeNode[], value: string): TreeNode | null {
    for (const node of nodes) {
      if (node.data?.value === value) {
        return node;
      }

      if (node.children?.length) {
        const match = this.findNodeByValue(node.children, value);
        if (match != null) {
          node.expanded = true;
          return match;
        }
      }
    }

    return null;
  }

  private ensureNodeKeys(nodes: TreeNode[]) {
    for (const node of nodes) {
      node.key ??= node.data?.value ?? node.label ?? crypto.randomUUID();
      if (node.children?.length) {
        this.ensureNodeKeys(node.children);
      }
    }
  }
}
