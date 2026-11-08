import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

import { resolve } from 'node:path';

export default defineConfig({
  root: import.meta.dirname,
  plugins: [
    ...angular({
      tsconfig: resolve(import.meta.dirname, 'tsconfig.spec.json'),
      workspaceRoot: resolve(import.meta.dirname, '../..'),
      jit: true,
    }),
    tsconfigPaths({ projects: [resolve(import.meta.dirname, '../../tsconfig.base.json')] }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.vitest.ts'],
    include: ['src/**/*.{spec,test}.ts'],
    reporters: ['default'],
    alias: {
      khroma: resolve(import.meta.dirname, '../../__mocks__/khroma.ts'),
      mime: resolve(import.meta.dirname, '../../__mocks__/mime.ts'),
      'file-saver-es': resolve(import.meta.dirname, '../../__mocks__/file-saver-es.ts'),
    },
  },
});
