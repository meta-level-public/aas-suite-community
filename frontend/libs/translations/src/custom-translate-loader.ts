import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import de from '../i18n/de.json';
import en from '../i18n/en.json';

@Injectable({
  providedIn: 'root',
})
export class CustomTranslateLoader implements TranslateLoader {
  public getTranslation(lang: string): Observable<unknown> {
    return new Observable((observer) => {
      switch (lang.toLowerCase()) {
        case 'de':
          observer.next(de);
          break;
        case 'en':
        case 'en-us':
          observer.next(en);
      }

      // eslint-disable-next-line no-console
      console.log('language loaded');

      observer.complete();
    });
  }
}
