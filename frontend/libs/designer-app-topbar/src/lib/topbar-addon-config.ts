import { InjectionToken, Type } from '@angular/core';
import { MenuItem } from 'primeng/api';

export interface TopbarMenuContext {
  translate: { instant: (key: string) => string };
}

export type TopbarMenuItemFactory = (context: TopbarMenuContext) => MenuItem[];

export const ADDITIONAL_TOPBAR_MENU_ITEMS = new InjectionToken<TopbarMenuItemFactory[]>(
  'ADDITIONAL_TOPBAR_MENU_ITEMS',
  {
    providedIn: 'root',
    factory: () => [],
  },
);

export const ADDITIONAL_TOPBAR_CENTER_COMPONENTS = new InjectionToken<Type<unknown>[]>(
  'ADDITIONAL_TOPBAR_CENTER_COMPONENTS',
  {
    providedIn: 'root',
    factory: () => [],
  },
);

export const ADDITIONAL_TOPBAR_AFTER_COMPONENTS = new InjectionToken<Type<unknown>[]>(
  'ADDITIONAL_TOPBAR_AFTER_COMPONENTS',
  {
    providedIn: 'root',
    factory: () => [],
  },
);
