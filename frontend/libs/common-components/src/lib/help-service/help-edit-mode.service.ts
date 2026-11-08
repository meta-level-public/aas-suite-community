import { Injectable, signal } from '@angular/core';

const HELP_EDITMODE_STORAGE_KEY = 'HELP_EDITMODE_ACTIVE';

/**
 * Holds whether the help edit mode is active. The state is a signal so that OnPush components
 * (e.g. lib-help-label) update immediately when the mode is toggled; it is persisted in the
 * sessionStorage so that it survives a reload.
 */
@Injectable({
  providedIn: 'root',
})
export class HelpEditModeService {
  private readonly active = signal(window.sessionStorage.getItem(HELP_EDITMODE_STORAGE_KEY) === 'true');

  readonly isActive = this.active.asReadonly();

  setActive(active: boolean) {
    window.sessionStorage.setItem(HELP_EDITMODE_STORAGE_KEY, active ? 'true' : 'false');
    this.active.set(active);
  }

  toggle() {
    this.setActive(!this.active());
  }
}
