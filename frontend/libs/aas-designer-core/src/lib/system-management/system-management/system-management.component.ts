import {
  ADDITIONAL_JOB_SETTINGS_CHILDREN,
  ADDITIONAL_SYSTEM_MANAGEMENT_MODULES,
  SystemManagementModuleConfig,
  SystemManagementModuleContext,
} from '@aas-designer-model';
import { AppConfigService } from '@aas/common-services';
import { SystemConfigurationDto, SystemManagementClient } from '@aas/webapi-client';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeTemplate, TreeNode } from 'primeng/api';
import { Skeleton } from 'primeng/skeleton';
import { Splitter } from 'primeng/splitter';
import { lastValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SidebarTreeNavComponent } from '../../general/sidebar-tree-nav/sidebar-tree-nav.component';

@Component({
  selector: 'aas-system-management',
  templateUrl: './system-management.component.html',
  styleUrls: ['../../../host.scss'],
  imports: [Splitter, PrimeTemplate, RouterOutlet, Skeleton, TranslateModule, SidebarTreeNavComponent],
})
export class SystemManagementComponent implements OnInit {
  sidebarVisible: boolean = false;
  modules: SystemManagementModuleConfig[] = [];
  selectedEntryKey: string | null = null;

  loading = signal(true);
  systemManagementEntries = signal<TreeNode[]>([]);

  systemManagementClient = inject(SystemManagementClient);
  systemConfguration = signal<SystemConfigurationDto | null>(null);

  router = inject(Router);
  route = inject(ActivatedRoute);
  destroyRef = inject(DestroyRef);
  appConfigService = inject(AppConfigService);
  additionalModules = inject(ADDITIONAL_SYSTEM_MANAGEMENT_MODULES);
  additionalJobSettingsChildren = inject(ADDITIONAL_JOB_SETTINGS_CHILDREN);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event: NavigationEnd) => {
        this.updateSelectedEntry(event.urlAfterRedirects);
      });
  }

  async ngOnInit() {
    this.loading.set(true);

    try {
      this.systemConfguration.set(await lastValueFrom(this.systemManagementClient.systemManagement_GetConfiguration()));
      this.modules = [{ label: 'TEMPLATE_MANAGEMENT', value: 'template-management', icon: 'pi pi-copy' }];
      if (this.systemConfguration()?.singleTenantMode === false) {
        this.modules.push({
          label: 'PAYMENT_MODEL_MANAGEMENT',
          value: 'payment-model-management',
          icon: 'pi pi-credit-card',
        });
      }
      this.modules.push({ label: 'CORS_CONFIG', value: 'cors-config', icon: 'pi pi-list' });
      this.modules.push({ label: 'MAIL_SETTINGS', value: 'mail-settings', icon: 'pi pi-envelope' });
      this.modules.push({ label: 'NEWS_MANAGEMENT', value: 'news-management', icon: 'pi pi-bell' });
      this.modules.push({ label: 'LEGAL_LINK_SETTINGS', value: 'legal-links-settings', icon: 'pi pi-link' });

      if (this.systemConfguration()?.singleTenantMode === false) {
        this.modules.push({ label: 'ORGANISATIONS', value: 'administration', icon: 'pi pi-fw pi-sitemap' });
        this.modules.push({
          label: 'INFRASTRUCTURE_STATUS',
          value: 'infrastructure-status',
          icon: 'pi pi-fw pi-server',
        });
        this.modules.push({ label: 'REQUESTS_FOR_OFFERS', value: 'request-for-offer', icon: 'pi pi-money-bill' });
        // { label: 'INVOICE', value: 'invoice', icon: 'pi pi-dollar' },
      }
      this.modules.push(...this.resolveAdditionalModules());
      this.modules.push({ label: 'HELP_TEXT_CONFIG', value: 'help-text-config', icon: 'pi pi-question-circle' });
      this.modules.push({
        label: 'JOB_SETTINGS',
        value: 'job-settings',
        icon: 'pi pi-sliders-h',
        children: [
          { label: 'JOB_STATISTIC_CALCULATOR', value: 'job-settings/statistic-calculator', icon: 'pi pi-chart-bar' },
          {
            label: 'JOB_DAILY_STATISTIC_CALCULATOR',
            value: 'job-settings/daily-statistic-calculator',
            icon: 'pi pi-chart-line',
          },
          ...(this.systemConfguration()?.singleTenantMode === false
            ? [
                {
                  label: 'JOB_DAILY_EXPIRED_ORGANISATIONS_CHECKER',
                  value: 'job-settings/daily-expired-organisations-checker',
                  icon: 'pi pi-calendar-times',
                },
                {
                  label: 'JOB_PERIODIC_ORGANISATION_DELETER',
                  value: 'job-settings/periodic-organisation-deleter',
                  icon: 'pi pi-trash',
                },
                {
                  label: 'JOB_PERIODIC_INFRASTRUCTURE_DELETER',
                  value: 'job-settings/periodic-infrastructure-deleter',
                  icon: 'pi pi-server',
                },
              ]
            : []),
          { label: 'JOB_IDTA_CRAWLER', value: 'job-settings/idta-crawler', icon: 'pi pi-globe' },
          {
            label: 'JOB_PCN_UPDATE_LISTENER',
            value: 'job-settings/pcn-update-listener',
            icon: 'pi pi-wifi',
          },
          ...this.additionalJobSettingsChildren,
        ],
      });

      this.systemManagementEntries.set(this.modules.map((module) => this.buildTreeNode(module)));

      this.updateSelectedEntry(this.router.url);
    } finally {
      this.loading.set(false);
    }
  }

  private resolveAdditionalModules(): SystemManagementModuleConfig[] {
    const context: SystemManagementModuleContext = {
      systemConfiguration: this.systemConfguration(),
      appConfig: this.appConfigService.config,
    };

    return this.additionalModules
      .filter((module: SystemManagementModuleConfig) => module.show == null || module.show(context))
      .map((module) => ({ label: module.label, value: module.value, icon: module.icon, children: module.children }));
  }

  private buildTreeNode(module: SystemManagementModuleConfig): TreeNode {
    if (module.children?.length) {
      return {
        label: module.label,
        key: module.value,
        data: { value: module.value },
        icon: module.icon,
        selectable: false,
        expanded: false,
        children: module.children.map((child) => this.buildTreeNode(child)),
      };
    }
    return {
      label: module.label,
      key: module.value,
      data: { value: module.value },
      icon: module.icon,
      expanded: true,
    };
  }

  private findNodeByValue(nodes: TreeNode[], url: string): TreeNode | null {
    for (const node of nodes) {
      const value = node.data?.value;
      if (value != null && url.startsWith(`/system-management/${value}`)) {
        if (node.children?.length) {
          const child = this.findNodeByValue(node.children, url);
          if (child != null) return child;
        }
        return node;
      }
    }
    return null;
  }

  private updateSelectedEntry(url: string) {
    const normalizedUrl = url.split('?')[0].split('#')[0];

    if (normalizedUrl === '/system-management' || normalizedUrl === '/system-management/') {
      const firstLeaf = this.findFirstLeaf(this.systemManagementEntries());
      this.selectedEntryKey = firstLeaf?.key ?? null;
      const firstValue = firstLeaf?.data?.value;
      if (firstValue != null) {
        void this.router.navigate(firstValue.split('/'), { relativeTo: this.route, replaceUrl: true });
      }
      return;
    }

    const found = this.findNodeByValue(this.systemManagementEntries(), normalizedUrl);
    this.selectedEntryKey = found?.key ?? null;
  }

  private findFirstLeaf(nodes: TreeNode[]): TreeNode | null {
    for (const node of nodes) {
      if (!node.children?.length) return node;
      const child = this.findFirstLeaf(node.children);
      if (child != null) return child;
    }
    return null;
  }

  selectPage(entry: TreeNode) {
    const value = entry.data?.value;
    if (value == null) {
      return;
    }

    this.router.navigate(value.split('/'), { relativeTo: this.route });
    this.sidebarVisible = false;
  }
}
