import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppConfigService } from './app-config.service';
import { buildDocsUrl, DocsContext, docsTopic, resolveDocsTopic, UserDocsService } from './user-docs.service';

const context: DocsContext = {
  defaultTopic: docsTopic('designer'),
  rules: [
    { urlPrefix: 'aas', topic: docsTopic('designer/aas-verwalten') },
    { urlPrefix: 'aas/v3/repo-edit', topic: docsTopic('designer/editor') },
    { urlPrefix: '/viewer/', topic: docsTopic('designer/viewer') },
  ],
};

describe('resolveDocsTopic', () => {
  it('uses the longest matching route prefix', () => {
    expect(resolveDocsTopic('/aas/v3/repo-edit/3/abc', context)).toBe('designer/editor');
    expect(resolveDocsTopic('/aas', context)).toBe('designer/aas-verwalten');
  });

  it('ignores query and fragment and normalizes slashes in rules', () => {
    expect(resolveDocsTopic('/viewer/aas-view/1/x?tab=2#top', context)).toBe('designer/viewer');
  });

  it('matches whole route segments only', () => {
    expect(resolveDocsTopic('/aas-view/1', context)).toBe('designer');
  });

  it('falls back to the default topic', () => {
    expect(resolveDocsTopic('/dashboard', context)).toBe('designer');
    expect(resolveDocsTopic('/', context)).toBe('designer');
  });
});

describe('buildDocsUrl', () => {
  it('joins base URL and topic with exactly one slash', () => {
    expect(buildDocsUrl('https://docs.example.com/', docsTopic('designer/viewer'))).toBe(
      'https://docs.example.com/designer/viewer',
    );
    expect(buildDocsUrl('https://docs.example.com/handbuch', docsTopic('/markt/'))).toBe(
      'https://docs.example.com/handbuch/markt',
    );
  });

  it('links the start page for an empty topic', () => {
    expect(buildDocsUrl('https://docs.example.com', docsTopic(''))).toBe('https://docs.example.com/');
  });
});

describe('UserDocsService', () => {
  const runtimeWindow = window as unknown as Record<string, unknown>;
  let config: { docsBaseUrl?: string };
  let service: UserDocsService;

  beforeEach(() => {
    config = {};
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppConfigService,
          useValue: {
            get config() {
              return config;
            },
          },
        },
      ],
    });
    service = TestBed.inject(UserDocsService);
  });

  afterEach(() => {
    delete runtimeWindow['__AAS_DOCS_BASE_URL'];
    vi.restoreAllMocks();
  });

  it('is not available without a configured URL', () => {
    config.docsBaseUrl = '  ';
    expect(service.isAvailable()).toBe(false);
    expect(service.urlFor(docsTopic('designer'))).toBeNull();
  });

  it('uses docsBaseUrl from the app config', () => {
    config.docsBaseUrl = 'https://config.example.com';
    expect(service.urlFor(docsTopic('designer'))).toBe('https://config.example.com/designer');
  });

  it('prefers the runtime variable over the app config', () => {
    config.docsBaseUrl = 'https://config.example.com';
    runtimeWindow['__AAS_DOCS_BASE_URL'] = 'https://runtime.example.com';
    expect(service.urlFor(docsTopic('designer'))).toBe('https://runtime.example.com/designer');
  });

  it('opens the page in a new tab', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    config.docsBaseUrl = 'https://config.example.com';
    service.open(docsTopic('designer/viewer'));
    expect(openSpy).toHaveBeenCalledWith('https://config.example.com/designer/viewer', '_blank', 'noopener');
  });
});
