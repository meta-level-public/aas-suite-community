import { InjectionToken } from '@angular/core';
import { Routes } from '@angular/router';

export interface SystemManagementModuleContext {
  systemConfiguration: { singleTenantMode?: boolean } | null;
  appConfig: { defaultTheme?: string; licensingEnabled?: boolean };
}

export interface SystemManagementModuleConfig {
  label: string;
  value: string;
  icon: string;
  show?: (context: SystemManagementModuleContext) => boolean;
}

export const ADDITIONAL_SYSTEM_MANAGEMENT_MODULES = new InjectionToken<SystemManagementModuleConfig[]>(
  'ADDITIONAL_SYSTEM_MANAGEMENT_MODULES',
  {
    providedIn: 'root',
    factory: () => [],
  },
);

export const ADDITIONAL_SYSTEM_MANAGEMENT_ROUTES = new InjectionToken<Routes>('ADDITIONAL_SYSTEM_MANAGEMENT_ROUTES', {
  providedIn: 'root',
  factory: () => [],
});
