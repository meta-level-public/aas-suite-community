import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const VERIFICATION_MESSAGE_PREFIX = 'errorMessages.';

/**
 * Translates a message of the aas-core verification. Only some messages have a translation (`errorMessages.<message>`
 * in the i18n files); all others keep the English text of aas-core instead of showing the raw translation key.
 */
export function translateVerificationMessage(translate: TranslateService, message: string | null | undefined) {
  if (message == null || message === '') {
    return '';
  }

  const key = VERIFICATION_MESSAGE_PREFIX + message;
  const translated = translate.instant(key);

  return typeof translated === 'string' && translated !== key ? translated : message;
}

/** Template variant of {@link translateVerificationMessage}; impure like the translate pipe to follow language changes. */
@Pipe({
  name: 'verificationMessage',
  pure: false,
})
export class VerificationMessagePipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(message: string | null | undefined): string {
    return translateVerificationMessage(this.translate, message);
  }
}
