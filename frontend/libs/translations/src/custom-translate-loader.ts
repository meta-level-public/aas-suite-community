import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';

type TranslationImporter = () => Promise<{ default: unknown }>;

const translationImporters: Record<string, TranslationImporter> = {
  de: () => import('../i18n/de.json'),
  en: () => import('../i18n/en.json'),
  'en-us': () => import('../i18n/en.json'),
};

/**
 * Loads only the requested language as its own chunk instead of bundling all languages into the initial bundle.
 * The apps wait for `translate.use(...)` in an app initializer, so the texts are available before the first render.
 */
@Injectable({
  providedIn: 'root',
})
export class CustomTranslateLoader implements TranslateLoader {
  public getTranslation(lang: string): Observable<unknown> {
    return from(loadTranslation(lang));
  }
}

/**
 * Loads a language chunk and retries once. If the chunk still cannot be loaded (network error, or an old tab after a
 * deployment with new chunk names), an empty translation is returned so the app still starts and shows the keys
 * instead of a blank page.
 */
export async function loadTranslation(
  lang: string,
  importers: Record<string, TranslationImporter> = translationImporters,
): Promise<unknown> {
  const importer = importers[lang.toLowerCase()];
  if (importer == null) {
    return {};
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return (await importer()).default;
    } catch (error) {
      if (attempt === 2) {
        console.error(`Translations for '${lang}' could not be loaded`, error);
      }
    }
  }
  return {};
}
