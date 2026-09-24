import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AppConfigService } from '../app-config.service';
import { PluginMenuItem, PluginMenuItemDto } from './plugin-menu-item';

@Injectable({ providedIn: 'root' })
export class PluginRegistryService {
  private readonly pluginItems = signal<PluginMenuItem[]>([]);

  readonly plugins = this.pluginItems.asReadonly();

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async load() {
    const systemManagementApiPath = this.appConfigService.config.aasSystemManagementApiPath?.replace(/\/+$/, '') ?? '';
    if (systemManagementApiPath === '') {
      this.pluginItems.set([]);
      return;
    }

    try {
      console.log('Loading plugin menu items from:', `${systemManagementApiPath}/Plugins/menu-items`);
      const dtos = await lastValueFrom(
        this.http.get<PluginMenuItemDto[]>(`${systemManagementApiPath}/Plugins/menu-items`),
      );
      console.log('Plugin menu items received:', dtos.length, dtos);
      this.pluginItems.set(dtos.map((dto) => this.toPluginMenuItem(dto, systemManagementApiPath)));
      console.log('Plugin registry after mapping:', this.pluginItems().length, this.pluginItems());
    } catch {
      console.error('Loading plugin menu items failed');
      this.pluginItems.set([]);
    }
  }

  findByRoute(route: string) {
    const normalizedRoute = normalizePluginRoute(route);
    return this.plugins().find((plugin) => normalizePluginRoute(plugin.route) === normalizedRoute) ?? null;
  }

  private toPluginMenuItem(dto: PluginMenuItemDto, systemManagementApiPath: string): PluginMenuItem {
    return {
      ...dto,
      entryPointUrl: this.toApiUrl(dto.entryPointPath, systemManagementApiPath),
    };
  }

  private toApiUrl(path: string, systemManagementApiPath: string) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const systemManagementPrefix = '/system-management-api';
    if (normalizedPath.startsWith(systemManagementPrefix)) {
      return `${systemManagementApiPath}${normalizedPath.slice(systemManagementPrefix.length)}`;
    }

    return `${systemManagementApiPath}${normalizedPath}`;
  }
}

export function normalizePluginRoute(route: string) {
  const trimmed = route.trim();
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}
