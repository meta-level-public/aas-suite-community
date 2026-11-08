import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { HelpEditModeService } from './help-edit-mode.service';

describe('HelpEditModeService', () => {
  afterEach(() => window.sessionStorage.removeItem('HELP_EDITMODE_ACTIVE'));

  it('restores the edit mode from the sessionStorage', () => {
    window.sessionStorage.setItem('HELP_EDITMODE_ACTIVE', 'true');

    expect(TestBed.inject(HelpEditModeService).isActive()).toBe(true);
  });

  it('is inactive without a stored value', () => {
    expect(TestBed.inject(HelpEditModeService).isActive()).toBe(false);
  });

  it('persists the toggled edit mode', () => {
    const service = TestBed.inject(HelpEditModeService);

    service.toggle();
    expect(service.isActive()).toBe(true);
    expect(window.sessionStorage.getItem('HELP_EDITMODE_ACTIVE')).toBe('true');

    service.toggle();
    expect(service.isActive()).toBe(false);
    expect(window.sessionStorage.getItem('HELP_EDITMODE_ACTIVE')).toBe('false');
  });
});
