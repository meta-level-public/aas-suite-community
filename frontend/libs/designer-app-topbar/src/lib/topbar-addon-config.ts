import { DocsContextRule } from '@aas/common-services';
import { InjectionToken, Type } from '@angular/core';
import { MenuItem } from '@openng/optimus-ui/api';

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

/** Components rendered in the action area on the right of the topbar (e.g. the AASsi button). */
export const ADDITIONAL_TOPBAR_ACTION_COMPONENTS = new InjectionToken<Type<unknown>[]>(
  'ADDITIONAL_TOPBAR_ACTION_COMPONENTS',
  {
    providedIn: 'root',
    factory: () => [],
  },
);

/**
 * Additional rules for the context help (Handbuch button), e.g. for views that only exist in the enterprise
 * edition. They extend DESIGNER_DOCS_CONTEXT; the longest matching route prefix wins.
 */
export const ADDITIONAL_DOCS_CONTEXT_RULES = new InjectionToken<DocsContextRule[]>('ADDITIONAL_DOCS_CONTEXT_RULES', {
  providedIn: 'root',
  factory: () => [],
});
