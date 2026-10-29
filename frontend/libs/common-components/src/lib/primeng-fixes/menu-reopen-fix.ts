import { EnvironmentProviders, provideAppInitializer } from '@angular/core';
import { Menu } from 'primeng/menu';

type MenuOverlayInternals = { visible: boolean; onOverlayAfterLeave(): void };

const PATCHED = Symbol('menuReopenFix');

/**
 * Works around a race in the PrimeNG popup menu (checked up to 21.1.10): when the menu is opened again while
 * its hide animation is still running, the end of that animation tears down the reopened menu. Depending on
 * the timing it resets the anchor element, so positioning fails with "Cannot read properties of null
 * (reading 'offsetHeight')", or it moves the already positioned menu back out of the body to the top left.
 * The end of the hide animation is ignored when the menu is visible again.
 */
export function patchMenuReopenWhileHiding() {
  const prototype = Menu.prototype as unknown as MenuOverlayInternals & { [PATCHED]?: boolean };
  if (prototype[PATCHED]) return;

  const onOverlayAfterLeave = prototype.onOverlayAfterLeave;
  prototype.onOverlayAfterLeave = function (this: MenuOverlayInternals) {
    if (this.visible) return;
    onOverlayAfterLeave.call(this);
  };
  prototype[PATCHED] = true;
}

export function provideMenuReopenFix(): EnvironmentProviders {
  return provideAppInitializer(patchMenuReopenWhileHiding);
}
