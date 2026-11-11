import { resolveDocsTopic } from '@aas/common-services';
import { DESIGNER_DOCS_CONTEXT } from './designer-docs-context';

describe('DESIGNER_DOCS_CONTEXT', () => {
  const topicFor = (url: string) => resolveDocsTopic(url, DESIGNER_DOCS_CONTEXT);

  it('opens the page of the current area', () => {
    expect(topicFor('/shells-list')).toBe('designer/aas-verwalten');
    expect(topicFor('/aas/v3/repo-edit/1/abc')).toBe('designer/editor');
    expect(topicFor('/cd-edit/1/0112%2F2%2F%2F%2F61360_7%23AAS006')).toBe('designer/konzeptbeschreibungen');
  });

  it('uses dedicated pages for shared links and snippets in my space', () => {
    expect(topicFor('/my-space/shared-links')).toBe('designer/geteilte-links');
    expect(topicFor('/my-space/snippets')).toBe('designer/schnipsel');
    expect(topicFor('/my-space/addresses')).toBe('designer/mein-bereich');
  });

  it('opens the administration pages for organisation and system management', () => {
    expect(topicFor('/my-organization/users')).toBe('designer/organisation');
    expect(topicFor('/system-management/mail-settings')).toBe('designer/systemverwaltung');
    expect(topicFor('/plugins')).toBe('betrieb/plugins');
  });

  it('falls back to the designer overview for unknown routes', () => {
    expect(topicFor('/unknown-area')).toBe('designer');
  });
});
