// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- app builds only read this lib through path mappings and would skip the ambient typings otherwise
/// <reference path="./prismjs.d.ts" />
import Prism from 'prismjs';

/**
 * Prism language components are plain scripts that extend the global `Prism` object. With static
 * `import 'prismjs/components/…'` the bundler may evaluate them before the (CommonJS) Prism core,
 * which fails in production builds with "Prism is not defined". Therefore the core is imported
 * here, published globally (ngx-markdown highlights code blocks via the global `Prism`) and the
 * languages are loaded afterwards on demand.
 */
const languageLoaders = {
  bash: () => import('prismjs/components/prism-bash'),
  batch: () => import('prismjs/components/prism-batch'),
  json: () => import('prismjs/components/prism-json'),
  powershell: () => import('prismjs/components/prism-powershell'),
  ruby: () => import('prismjs/components/prism-ruby'),
  typescript: () => import('prismjs/components/prism-typescript'),
  yaml: () => import('prismjs/components/prism-yaml'),
} as const;

export type PrismLanguage = keyof typeof languageLoaders;

export async function loadPrismLanguages(...languages: PrismLanguage[]): Promise<void> {
  const target = globalThis as typeof globalThis & { Prism?: typeof Prism };
  target.Prism ??= Prism;
  await Promise.all(languages.map((language) => languageLoaders[language]()));
}
