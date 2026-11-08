import { UrlHelper } from './url-helper';

describe('UrlHelper', () => {
  afterEach(() => vi.restoreAllMocks());

  it('accepts only absolute http and https URLs', () => {
    expect(UrlHelper.isHttpUrl('https://admin-shell.io/idta/nameplate')).toBe(true);
    expect(UrlHelper.isHttpUrl(' http://example.com ')).toBe(true);
    expect(UrlHelper.isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(UrlHelper.isHttpUrl('data:text/html,<script></script>')).toBe(false);
    expect(UrlHelper.isHttpUrl('0173-1#02-AAO677#002')).toBe(false);
    expect(UrlHelper.isHttpUrl('')).toBe(false);
    expect(UrlHelper.isHttpUrl(null)).toBe(false);
  });

  it('opens http links in a new tab without access to this window', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    expect(UrlHelper.openExternalUrl('https://example.com/a')).toBe(true);
    expect(open).toHaveBeenCalledWith('https://example.com/a', '_blank', 'noopener,noreferrer');
  });

  it('does not open links with other schemes', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    expect(UrlHelper.openExternalUrl('javascript:alert(document.cookie)')).toBe(false);
    expect(open).not.toHaveBeenCalled();
  });
});
