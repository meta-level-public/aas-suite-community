import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { translateVerificationMessage, VerificationMessagePipe } from './verification-message';

describe('translateVerificationMessage', () => {
  let translate: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TranslateModule.forRoot()], providers: [VerificationMessagePipe] });
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', {
      errorMessages: {
        'The value must not be empty.': 'Der Wert darf nicht leer sein.',
        'Constraint AASd-131: Either the global asset ID shall be defined or at least one specific asset ID.':
          'Global Asset ID oder Specific Asset ID angeben.',
      },
    });
    translate.use('de');
  });

  it('translates known messages, also when they contain dots and colons', () => {
    expect(translateVerificationMessage(translate, 'The value must not be empty.')).toBe(
      'Der Wert darf nicht leer sein.',
    );
    expect(
      translateVerificationMessage(
        translate,
        'Constraint AASd-131: Either the global asset ID shall be defined or at least one specific asset ID.',
      ),
    ).toBe('Global Asset ID oder Specific Asset ID angeben.');
  });

  it('keeps the original message instead of showing the translation key', () => {
    const message = 'Keys must contain at least one item.';

    expect(translateVerificationMessage(translate, message)).toBe(message);
  });

  it('returns an empty text for missing messages', () => {
    expect(translateVerificationMessage(translate, undefined)).toBe('');
  });

  it('is available as pipe', () => {
    const pipe = TestBed.inject(VerificationMessagePipe);

    expect(pipe.transform('The value must not be empty.')).toBe('Der Wert darf nicht leer sein.');
  });
});
