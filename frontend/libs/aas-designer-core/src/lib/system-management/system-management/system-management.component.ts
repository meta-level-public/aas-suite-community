import {
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
  modules: { label: string; value: string; icon: string }[] = [];
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

      this.systemManagementEntries.set(
        this.modules.map((module) => {
          return {
            label: module.label,
            key: module.value,
            data: { value: module.value },
            icon: module.icon,
            expanded: true,
          };
        }),
      );

      this.updateSelectedEntry(this.router.url);
    } finally {
      this.loading.set(false);
    }
  }

  private resolveAdditionalModules(): { label: string; value: string; icon: string }[] {
    const context: SystemManagementModuleContext = {
      systemConfiguration: this.systemConfguration(),
      appConfig: this.appConfigService.config,
    };

    return this.additionalModules
      .filter((module: SystemManagementModuleConfig) => module.show == null || module.show(context))
      .map((module) => ({ label: module.label, value: module.value, icon: module.icon }));
  }

  private updateSelectedEntry(url: string) {
    const normalizedUrl = url.split('?')[0].split('#')[0];

    if (normalizedUrl === '/system-management' || normalizedUrl === '/system-management/') {
      const firstEntryValue = this.systemManagementEntries()[0]?.data?.value;
      this.selectedEntryKey = this.systemManagementEntries()[0]?.key ?? null;
      if (firstEntryValue != null) {
        void this.router.navigate([firstEntryValue], { relativeTo: this.route, replaceUrl: true });
      }
      return;
    }

    this.selectedEntryKey =
      this.systemManagementEntries().find((entry) => {
        const value = entry.data?.value;
        return value != null && normalizedUrl.startsWith(`/system-management/${value}`);
      })?.key ?? null;
  }

  selectPage(entry: TreeNode) {
    const value = entry.data?.value;
    if (value == null) {
      return;
    }

    this.router.navigate([value], { relativeTo: this.route });
    this.sidebarVisible = false;
  }
}
