import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { RoleLabelPipe } from './role-label.pipe';

describe('RoleLabelPipe', () => {
  let pipe: RoleLabelPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TranslateModule.forRoot()], providers: [RoleLabelPipe] });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', { ROLE_ORGA_ADMIN: 'Organisationsadministration', ROLE_BENUTZER: 'Benutzer' });
    translate.use('de');
    pipe = TestBed.inject(RoleLabelPipe);
  });

  it('shows the translated name of a role', () => {
    expect(pipe.transform('ORGA_ADMIN')).toBe('Organisationsadministration');
  });

  it('joins a list of roles', () => {
    expect(pipe.transform(['BENUTZER', 'ORGA_ADMIN'])).toBe('Benutzer, Organisationsadministration');
  });

  it('keeps the technical name of a role without translation', () => {
    expect(pipe.transform('UNKNOWN_ROLE')).toBe('UNKNOWN_ROLE');
  });

  it('returns an empty text without roles', () => {
    expect(pipe.transform(null)).toBe('');
  });
});
