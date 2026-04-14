import { InjectionToken } from '@angular/core';

export interface MenuItemConfig {
  label: string;
  icon: string;
  routerLink: string[];
  preventExact?: boolean;
  altLink?: string[];
  visible?: boolean;
  insertAfter?: string;
  insertAtStart?: boolean;
  requiredRole?: string;
  requiresWritableRepo?: boolean;
}

export const ADDITIONAL_MENU_ITEMS = new InjectionToken<MenuItemConfig[]>('ADDITIONAL_MENU_ITEMS', {
  providedIn: 'root',
  factory: () => [],
});
