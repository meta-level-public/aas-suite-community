import { InjectionToken } from '@angular/core';
import { Routes } from '@angular/router';
import { TreeNode } from 'primeng/api';

export interface OrganisationMenuItemConfig {
  /**
   * Factory function that creates a TreeNode menu item for organisation navigation
   * @param context Helper methods and services from the component
   */
  createMenuItem: (context: OrganisationMenuItemContext) => TreeNode;
  /**
   * Priority for ordering (lower = earlier in list)
   */
  priority?: number;
}

export interface OrganisationMenuItemContext {
  accessService: any;
  router: any;
  translate?: any;
  [key: string]: any;
}

export const ADDITIONAL_ORGANISATION_MENU_ITEMS = new InjectionToken<OrganisationMenuItemConfig[]>(
  'ADDITIONAL_ORGANISATION_MENU_ITEMS',
  {
    providedIn: 'root',
    factory: () => [],
  },
);

export const ADDITIONAL_ORGANISATION_ROUTES = new InjectionToken<Routes>('ADDITIONAL_ORGANISATION_ROUTES', {
  providedIn: 'root',
  factory: () => [],
});
