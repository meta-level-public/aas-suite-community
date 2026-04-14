import { InjectionToken } from '@angular/core';
import { MenuItem } from 'primeng/api';

export interface ShellMenuItemConfig {
  /**
   * Factory function that creates a MenuItem for a specific shell
   * @param shell The shell object
   * @param context Helper methods and services from the component
   */
  createMenuItem: (shell: any, context: ShellMenuItemContext) => MenuItem;
  /**
   * Position where to insert this item (e.g., 'advanced', 'export', 'top')
   */
  insertIn?: 'advanced' | 'export' | 'top';
}

export interface ShellMenuItemContext {
  translate: any;
  router: any;
  accessService: any;
  [key: string]: any;
}

export const ADDITIONAL_SHELL_MENU_ITEMS = new InjectionToken<ShellMenuItemConfig[]>('ADDITIONAL_SHELL_MENU_ITEMS', {
  providedIn: 'root',
  factory: () => [],
});
