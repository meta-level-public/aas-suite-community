import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

/**
 * Edition des Builds: "enterprise" (Standard) enthält alle Seiten, "oss" lässt die
 * Enterprise-Inhalte weg. Beim OSS-Export werden dieselben Pfade nicht mitkopiert,
 * siehe CUSTOM_EXCLUDES in tools/oss-export/oss-export.config (synchron halten).
 */
const edition = process.env.DOCS_EDITION === 'oss' ? 'oss' : 'enterprise';
const ENTERPRISE_ONLY = ['markt/**', 'betrieb/enterprise/**'];

// Standard-Excludes von Docusaurus, da "exclude" sie sonst ersetzt
const DEFAULT_EXCLUDES = ['**/_*.{js,jsx,ts,tsx,md,mdx}', '**/_*/**', '**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**'];

// Optionaler "Diese Seite bearbeiten"-Link, z. B. https://github.com/<org>/<repo>/edit/main/documentation/
const editUrl = process.env.DOCS_EDIT_URL || undefined;

const config: Config = {
  title: 'AAS Suite Handbuch',
  tagline: 'Nutzerdokumentation für AAS Designer, AAS Markt und weitere Komponenten',
  favicon: 'img/logo.svg',

  // Öffentliche Adresse der Doku; beeinflusst Sitemap und kanonische Links, nicht das Routing
  url: process.env.DOCS_SITE_URL || 'http://localhost',
  baseUrl: process.env.DOCS_BASE_PATH || '/',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'de',
    locales: ['de'],
  },

  customFields: {
    edition,
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl,
          showLastUpdateTime: true,
          exclude: edition === 'oss' ? [...DEFAULT_EXCLUDES, ...ENTERPRISE_ONLY] : DEFAULT_EXCLUDES,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['de', 'en'],
        docsRouteBasePath: '/',
        indexBlog: false,
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'AAS Suite Handbuch',
      logo: {
        alt: 'AAS Suite',
        src: 'img/logo.svg',
      },
      items: [
        { type: 'docSidebar', sidebarId: 'handbuch', position: 'left', label: 'Handbuch' },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `© ${new Date().getFullYear()} Meta-Level Software AG`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
