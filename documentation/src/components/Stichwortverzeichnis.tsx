import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';
import type { ReactNode } from 'react';

import type { Stichwort } from '../../plugins/stichworte';
import styles from './Stichwortverzeichnis.module.css';

/** Anfangsbuchstabe für die Gruppierung; Umlaute zählen zum Grundbuchstaben, Ziffern und Zeichen unter „#“. */
function buchstabe(begriff: string): string {
  const erster = begriff.normalize('NFD').charAt(0).toUpperCase();
  return /[A-Z]/.test(erster) ? erster : '#';
}

export default function Stichwortverzeichnis(): ReactNode {
  const { eintraege } = usePluginData('handbuch-stichworte') as { eintraege: Stichwort[] };
  const gruppen = new Map<string, Map<string, Stichwort[]>>();
  for (const eintrag of eintraege) {
    const zeichen = buchstabe(eintrag.begriff);
    if (!gruppen.has(zeichen)) gruppen.set(zeichen, new Map());
    const begriffe = gruppen.get(zeichen)!;
    if (!begriffe.has(eintrag.begriff)) begriffe.set(eintrag.begriff, []);
    begriffe.get(eintrag.begriff)!.push(eintrag);
  }

  return (
    <div className={styles.verzeichnis}>
      <nav className={styles.buchstaben} aria-label="Buchstaben">
        {[...gruppen.keys()].map((zeichen) => (
          <a key={zeichen} href={`#stichworte-${zeichen}`}>
            {zeichen}
          </a>
        ))}
      </nav>
      {[...gruppen.entries()].map(([zeichen, begriffe]) => (
        <section key={zeichen} className={styles.gruppe}>
          <h2 id={`stichworte-${zeichen}`}>{zeichen}</h2>
          <ul>
            {[...begriffe.entries()].map(([begriff, ziele]) => (
              <li key={begriff}>
                {begriff}:{' '}
                {ziele.map((ziel, index) => (
                  <span key={ziel.permalink}>
                    {index > 0 && ', '}
                    <Link to={ziel.permalink}>{ziel.seite}</Link>
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
