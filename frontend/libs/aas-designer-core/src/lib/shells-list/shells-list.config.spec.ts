import { afterEach, describe, expect, it } from 'vitest';
import {
  readShellsListColumns,
  SHELLS_LIST_COLUMNS,
  SHELLS_LIST_DEFAULT_COLUMNS,
  writeShellsListColumns,
} from './shells-list.config';

describe('shells list column selection', () => {
  afterEach(() => window.localStorage.removeItem('shells-list-columns'));

  it('uses the default columns if nothing was chosen yet', () => {
    expect(readShellsListColumns()).toEqual(SHELLS_LIST_DEFAULT_COLUMNS);
  });

  it('remembers the chosen columns', () => {
    const chosen = [SHELLS_LIST_COLUMNS[2], SHELLS_LIST_COLUMNS[5]];

    writeShellsListColumns(chosen);

    expect(readShellsListColumns()).toEqual(chosen);
  });

  it('ignores unknown or broken stored values', () => {
    window.localStorage.setItem('shells-list-columns', JSON.stringify(['idShort', 'removedColumn']));
    expect(readShellsListColumns().map((column) => column.field)).toEqual(['idShort']);

    window.localStorage.setItem('shells-list-columns', '{broken');
    expect(readShellsListColumns()).toEqual(SHELLS_LIST_DEFAULT_COLUMNS);

    window.localStorage.setItem('shells-list-columns', '[]');
    expect(readShellsListColumns()).toEqual(SHELLS_LIST_DEFAULT_COLUMNS);
  });
});
