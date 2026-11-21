import type { LoadedContent } from '@docusaurus/plugin-content-docs';
import type { LoadContext, Plugin } from '@docusaurus/types';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { join, relative } from 'node:path';

/**
 * Ganzes Handbuch als PDF (scripts/pdf.mjs):
 * - Build: schreibt pdf-seiten.json (alle Seiten in der Reihenfolge der Seitenleiste) in das Build-Verzeichnis;
 *   daraus druckt `npm run pdf` das PDF.
 * - Entwicklungsserver (`npm start`): /handbuch.pdf baut das PDF beim ersten Aufruf im Hintergrund mit denselben
 *   Schritten wie die Pipeline (eigenes Build-Verzeichnis und eigener .docusaurus-Ordner unter
 *   node_modules/.cache/handbuch-pdf/), zeigt solange eine
 *   Warteseite und baut erst neu, wenn sich Kapitel, Bilder oder der Code des Handbuchs geändert haben.
 */
export const PDF_FILE = 'handbuch.pdf';
export const PDF_PAGES_FILE = 'pdf-seiten.json';

export type PdfSeite = { permalink: string; title: string; bereich: string | null };

type Item = { type: string; id?: string; label?: string; items?: Item[]; link?: { type: string; id?: string } };

function flatten(items: Item[], bereich: string | null, out: Array<{ id: string; bereich: string | null }>) {
  for (const item of items) {
    if (item.type === 'doc' || item.type === 'ref') out.push({ id: item.id!, bereich });
    if (item.type === 'category') {
      if (item.link?.type === 'doc') out.push({ id: item.link.id!, bereich: item.label ?? null });
      flatten(item.items ?? [], item.label ?? null, out);
    }
  }
}

// Alles, was das PDF beeinflusst; ändert sich davon nichts, bleibt das Vorschau-PDF gültig
const WATCHED = ['docs', 'static', 'src', 'plugins', 'scripts/pdf.mjs', 'docusaurus.config.ts', 'sidebars.ts'];

function fingerprint(siteDir: string): string {
  const hash = createHash('sha1');
  const visit = (path: string) => {
    if (!existsSync(path)) return;
    const stat = statSync(path);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(path).sort()) visit(join(path, entry));
    } else {
      hash.update(`${relative(siteDir, path)}:${stat.size}:${stat.mtimeMs}\n`);
    }
  };
  WATCHED.forEach((entry) => visit(join(siteDir, entry)));
  return hash.digest('hex');
}

const escapeHtml = (text: string) => text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);

function page(res: ServerResponse, title: string, body: string, reload: boolean) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${title}</title>
${reload ? '<meta http-equiv="refresh" content="5">' : ''}
<style>body{font-family:Verdana,sans-serif;margin:3rem;max-width:60rem;color:#1e293b}pre{background:#f1f5f9;padding:1rem;overflow:auto;font-size:12px}</style>
</head><body><h1>${title}</h1>${body}</body></html>`);
}

/** Baut das Vorschau-PDF im Entwicklungsserver und liefert es aus. */
function createPreview(context: LoadContext) {
  // Unter node_modules/.cache: ein Ordner im Handbuch-Verzeichnis würde von späteren Builds mit erfasst
  const workDir = join(context.siteDir, 'node_modules', '.cache', 'handbuch-pdf');
  const buildDir = join(workDir, 'build');
  const pdfFile = join(workDir, PDF_FILE);
  let state: { status: 'idle' | 'building' | 'ready' | 'failed'; fingerprint?: string; log: string } = {
    status: 'idle',
    log: '',
  };

  const run = (command: string, args: string[], env: NodeJS.ProcessEnv) =>
    new Promise<void>((resolve, reject) => {
      const child = spawn(command, args, { cwd: context.siteDir, env: { ...process.env, ...env } });
      const append = (chunk: Buffer) => {
        state.log = (state.log + chunk.toString()).slice(-200_000);
      };
      child.stdout.on('data', append);
      child.stderr.on('data', append);
      child.on('error', reject);
      child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')}: ${code}`))));
    });

  const build = async (current: string) => {
    state = { status: 'building', fingerprint: current, log: '' };
    mkdirSync(workDir, { recursive: true });
    try {
      // Eigener .docusaurus-Ordner, damit der laufende Entwicklungsserver unberührt bleibt; ohne persistenten
      // Webpack-Cache, denn der ist für alle Builds gemeinsam und würde sonst verunreinigt
      const env = {
        DOCUSAURUS_GENERATED_FILES_DIR_NAME: relative(context.siteDir, join(workDir, '.docusaurus')),
        DOCUSAURUS_NO_PERSISTENT_CACHE: 'true',
        NODE_ENV: 'production',
      };
      await run('npx', ['docusaurus', 'build', '--out-dir', buildDir], env);
      await run('node', ['scripts/pdf.mjs', '--build-dir', buildDir, '--out', pdfFile], {});
      state = { ...state, status: 'ready' };
    } catch (error) {
      state = { ...state, status: 'failed', log: `${state.log}\n${String(error)}` };
    }
  };

  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const path = (req.url ?? '').split('?')[0];
    if (path !== `${context.baseUrl}${PDF_FILE}`) return next();

    const current = fingerprint(context.siteDir);
    if (state.status === 'building') {
      return page(res, 'PDF wird erstellt …', '<p>Das ganze Handbuch wird gebaut und gedruckt. Diese Seite lädt sich selbst neu.</p>', true);
    }
    if (state.fingerprint !== current || state.status === 'idle') {
      void build(current);
      return page(res, 'PDF wird erstellt …', '<p>Das ganze Handbuch wird gebaut und gedruckt. Diese Seite lädt sich selbst neu.</p>', true);
    }
    if (state.status === 'failed') {
      return page(
        res,
        'PDF konnte nicht erstellt werden',
        `<p>Nach der nächsten Änderung an Kapiteln, Bildern oder Code wird es erneut versucht.</p><pre>${escapeHtml(state.log)}</pre>`,
        false,
      );
    }
    res.writeHead(200, { 'Content-Type': 'application/pdf', 'Cache-Control': 'no-store' });
    createReadStream(pdfFile).pipe(res);
  };
}

export default function pdfPlugin(context: LoadContext): Plugin {
  let seiten: PdfSeite[] = [];
  return {
    name: 'handbuch-pdf',

    async allContentLoaded({ allContent }) {
      const docs = allContent['docusaurus-plugin-content-docs']?.['default'] as LoadedContent | undefined;
      if (!docs) throw new Error('PDF: Docs-Plugin nicht gefunden.');
      const version = docs.loadedVersions[0];
      const order: Array<{ id: string; bereich: string | null }> = [];
      for (const sidebar of Object.values(version.sidebars)) flatten(sidebar as Item[], null, order);
      const byId = new Map(version.docs.map((doc) => [doc.id, doc]));
      seiten = order
        .filter(({ id }, index) => order.findIndex((entry) => entry.id === id) === index)
        .map(({ id, bereich }) => ({ permalink: byId.get(id)!.permalink, title: byId.get(id)!.title, bereich }));
    },

    async postBuild({ outDir }) {
      writeFileSync(
        join(outDir, PDF_PAGES_FILE),
        JSON.stringify({ edition: context.siteConfig.customFields?.edition, seiten }, null, 2),
      );
    },

    configureWebpack(_config, isServer) {
      if (isServer || process.env.NODE_ENV !== 'development') return undefined;
      const preview = createPreview(context);
      // devServer gehört zu webpack-dev-server und fehlt im Webpack-Typ; Docusaurus führt es mit seiner Konfiguration zusammen
      return {
        devServer: {
          // webpack-merge ruft diese Funktion zusätzlich zu der von Docusaurus auf und hängt beide Rückgaben
          // aneinander; deshalb wird hier in die gemeinsame Liste eingefügt und eine leere Liste zurückgegeben.
          setupMiddlewares: (middlewares: unknown[]) => {
            middlewares.unshift(preview);
            return [];
          },
        },
      } as ReturnType<NonNullable<Plugin['configureWebpack']>>;
    },
  };
}
