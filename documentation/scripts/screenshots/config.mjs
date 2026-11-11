import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export const BASE_URL = (process.env.BASE_URL || 'http://localhost:5196/designer-ui/').replace(/\/?$/, '/');
export const VIEWPORT = { width: 1440, height: 900 };
export const AUTH_DIR = join(here, '.auth');
export const AUTH_FILE = join(AUTH_DIR, 'state.json');
export const IMG_DIR = join(here, '..', '..', 'static', 'img');
