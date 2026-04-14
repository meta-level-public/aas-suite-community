/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { resolve } from 'node:path';

export default defineConfig({
  root: __dirname,
  plugins: [
    ...angular({
      tsconfig: resolve(__dirname, 'tsconfig.spec.json'),
      workspaceRoot: resolve(__dirname, '../..'),
      jit: true,
    }),
    tsconfigPaths({ projects: [resolve(__dirname, '../../tsconfig.base.json')] }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.vitest.ts'],
    include: ['src/**/*.{spec,test}.ts'],
    reporters: ['default'],
    alias: {
      khroma: resolve(__dirname, '../../__mocks__/khroma.ts'),
      mime: resolve(__dirname, '../../__mocks__/mime.ts'),
      'file-saver-es': resolve(__dirname, '../../__mocks__/file-saver-es.ts'),
    },
  },
});
