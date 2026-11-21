/**
 * All pages of the user documentation (documentation/docs/) that the applications link to, each with
 * the heading anchors that may be linked. This is the only place where documentation targets are listed;
 * docsTopic() accepts only these pages and anchors.
 *
 * Keys are page paths relative to the documentation root ('' is the start page), anchors are the heading
 * ids Docusaurus generates. `npm run check:topics` in documentation/ checks that every page and anchor
 * listed here exists. Pages under markt/ and betrieb/enterprise/ only exist in the enterprise edition of
 * the documentation.
 */
export const DOCS_TARGETS = {
  '': [],
  designer: [],
  'designer/aas-anlegen': [],
  'designer/aas-verwalten': ['registry-korrektur', 'teilmodelle-und-konzeptbeschreibungen'],
  'designer/dashboard': [],
  'designer/editor': [],
  'designer/geteilte-links': [],
  'designer/idta-vorlagen': [],
  'designer/konzeptbeschreibungen': ['liste-der-konzeptbeschreibungen'],
  'designer/mein-bereich': [
    'mein-profil',
    'organisationen',
    'adressen',
    'produktstämme-produktfamilien-und-produktbezeichnungen',
  ],
  'designer/organisation': [
    'organisationsdetails',
    'benutzer',
    'einladungen',
    'eclass',
    'token',
    'aas-infrastruktur',
    'bezahlmodell',
  ],
  'designer/pcn': ['mitteilung-versenden-hersteller', 'mitteilungen-abonnieren-abnehmer'],
  'designer/rollen-und-rechte': ['infrastruktur-rechte'],
  'designer/schnipsel': [],
  'designer/systemverwaltung': [
    'templateverwaltung',
    'cors-konfiguration',
    'mail-einstellungen',
    'news-verwaltung',
    'rechtslinks',
    'hilfetexte',
    'job-konfiguration',
  ],
  'designer/viewer': [],
  'betrieb/plugins': [],
  'betrieb/enterprise/aassi': ['einrichten'],
  'betrieb/enterprise/feed-mapping': ['mapping-anlegen', 'mappings-verwalten'],
  markt: [],
  'markt/durchsuchen': [],
  'markt/veroeffentlichen': ['veröffentlichungen-verwalten', 'mehrfach-freigaben'],
} as const satisfies Record<string, readonly string[]>;

/** Page of the user documentation, e.g. 'designer/viewer' */
export type DocsPage = keyof typeof DOCS_TARGETS;

/** Heading anchor that may be linked on the given page */
export type DocsAnchor<P extends DocsPage> = (typeof DOCS_TARGETS)[P][number];
