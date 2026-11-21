import type { LoadedContent } from '@docusaurus/plugin-content-docs';
import type { Plugin } from '@docusaurus/types';

/**
 * Baut das Stichwortverzeichnis aus dem Frontmatter `stichworte` aller Kapitel:
 *
 *   stichworte:
 *     Begriff: anker-einer-ueberschrift   # '' = Seitenanfang
 *
 * Es gelten nur die Kapitel der aktuellen Edition (im OSS-Build fehlen markt/ und betrieb/enterprise/),
 * weil das Plugin die bereits geladenen Seiten des Docs-Plugins liest. Die Seite docs/stichworte.mdx zeigt
 * die Einträge über usePluginData('handbuch-stichworte') an. Die Links tragen den Anker; existiert er
 * nicht, bricht der Build über onBrokenAnchors: 'throw' ab.
 */
export type Stichwort = { begriff: string; seite: string; permalink: string };

export default function stichwortePlugin(): Plugin {
  return {
    name: 'handbuch-stichworte',
    async allContentLoaded({ allContent, actions }) {
      const docs = allContent['docusaurus-plugin-content-docs']?.['default'] as LoadedContent | undefined;
      if (!docs) throw new Error('Stichwortverzeichnis: Docs-Plugin nicht gefunden.');

      const errors: string[] = [];
      const eintraege: Stichwort[] = [];
      for (const doc of docs.loadedVersions[0].docs) {
        const stichworte = doc.frontMatter['stichworte'];
        if (stichworte === undefined) continue;
        if (typeof stichworte !== 'object' || stichworte === null || Array.isArray(stichworte)) {
          errors.push(`${doc.source}: "stichworte" muss eine Zuordnung Begriff: anker sein.`);
          continue;
        }
        for (const [begriff, anker] of Object.entries(stichworte as Record<string, unknown>)) {
          if (typeof anker !== 'string' || anker.startsWith('#')) {
            errors.push(`${doc.source}: Stichwort "${begriff}" braucht einen Anker ohne # oder '' für den Seitenanfang.`);
            continue;
          }
          eintraege.push({ begriff, seite: doc.title, permalink: anker ? `${doc.permalink}#${anker}` : doc.permalink });
        }
      }
      if (errors.length > 0) throw new Error(`Stichwortverzeichnis:\n  ${errors.join('\n  ')}`);

      eintraege.sort(
        (a, b) => a.begriff.localeCompare(b.begriff, 'de', { sensitivity: 'base' }) || a.seite.localeCompare(b.seite, 'de'),
      );
      actions.setGlobalData({ eintraege });
    },
  };
}
