import { inject, Injectable, InjectionToken } from '@angular/core';
import { AppConfigService, getRuntimeVar } from './app-config.service';

/** Path of a page in the user documentation relative to its root, e.g. 'designer/viewer'. */
export type DocsTopic = string & { readonly __docsTopic: unique symbol };

/**
 * Marks the path of a page in the user documentation (documentation/docs/).
 * `npm run check:topics` in documentation/ checks that every page referenced this way exists,
 * so always pass the path as a string literal.
 */
export function docsTopic(path: string): DocsTopic {
  return path as DocsTopic;
}

export interface DocsContextRule {
  /** Application route prefix, e.g. 'aas/v3/repo-edit'; the longest matching prefix wins */
  urlPrefix: string;
  topic: DocsTopic;
}

export interface DocsContext {
  /** Page shown when no rule matches the current route */
  defaultTopic: DocsTopic;
  rules: DocsContextRule[];
}

/** Maps the routes of an application to pages of the user documentation. Provided per application. */
export const DOCS_CONTEXT = new InjectionToken<DocsContext>('DOCS_CONTEXT', {
  providedIn: 'root',
  factory: () => ({ defaultTopic: docsTopic(''), rules: [] }),
});

const DOCS_BASE_URL_RUNTIME_KEY = '__AAS_DOCS_BASE_URL';

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

/** Returns the documentation page for an application URL (path, query and fragment are allowed). */
export function resolveDocsTopic(url: string, context: DocsContext): DocsTopic {
  const path = trimSlashes(url.split(/[?#]/)[0]);
  let bestRule: DocsContextRule | undefined;
  let bestLength = -1;

  for (const rule of context.rules) {
    const prefix = trimSlashes(rule.urlPrefix);
    const matches = prefix === '' || path === prefix || path.startsWith(`${prefix}/`);
    if (matches && prefix.length > bestLength) {
      bestRule = rule;
      bestLength = prefix.length;
    }
  }

  return bestRule?.topic ?? context.defaultTopic;
}

export function buildDocsUrl(baseUrl: string, topic: DocsTopic): string {
  const base = baseUrl.trim().replace(/\/+$/, '');
  const path = trimSlashes(topic);
  return path === '' ? `${base}/` : `${base}/${path}`;
}

/** Opens pages of the user documentation, whose address is configured per installation. */
@Injectable({ providedIn: 'root' })
export class UserDocsService {
  private readonly appConfigService = inject(AppConfigService);

  /** Configured base URL of the documentation, or null if no documentation is linked */
  get baseUrl(): string | null {
    const runtimeUrl = getRuntimeVar(DOCS_BASE_URL_RUNTIME_KEY);
    if (runtimeUrl != null) {
      return runtimeUrl;
    }

    const configuredUrl = this.appConfigService.config.docsBaseUrl?.trim() ?? '';
    return configuredUrl !== '' ? configuredUrl : null;
  }

  isAvailable(): boolean {
    return this.baseUrl != null;
  }

  urlFor(topic: DocsTopic): string | null {
    const baseUrl = this.baseUrl;
    return baseUrl != null ? buildDocsUrl(baseUrl, topic) : null;
  }

  open(topic: DocsTopic) {
    const url = this.urlFor(topic);
    if (url != null) {
      window.open(url, '_blank', 'noopener');
    }
  }
}
