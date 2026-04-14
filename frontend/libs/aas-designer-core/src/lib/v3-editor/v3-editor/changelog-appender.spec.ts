import { Property, SubmodelElementCollection } from '@aas-core-works/aas-core3.1-typescript/types';
import { vi } from 'vitest';

import { ShellResult } from '@aas/model';

import { ChangelogAppender } from './changelog-appender';

describe('ChangelogAppender', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('writes the changelog date as an ISO UTC timestamp with milliseconds', () => {
    vi.setSystemTime(new Date('2026-03-21T07:59:06.000Z'));

    const shellResult = {
      v3Shell: {
        assetAdministrationShells: [{ submodels: [] }],
        submodels: [],
      },
    } as unknown as ShellResult;

    ChangelogAppender.appendChangelog('comment', shellResult, 'user@example.com', 'test-prefix');

    const changelogSubmodel = shellResult.v3Shell?.submodels?.[0];
    const changesCollection = changelogSubmodel?.submodelElements?.find((element) => element.idShort === 'Changes') as
      | SubmodelElementCollection
      | undefined;
    const firstEntry = changesCollection?.value?.[0] as SubmodelElementCollection | undefined;
    const dateProperty = firstEntry?.value?.find((element) => element.idShort === 'Date') as Property | undefined;

    expect(dateProperty?.value).toBe('2026-03-21T07:59:06.000Z');
  });
});
