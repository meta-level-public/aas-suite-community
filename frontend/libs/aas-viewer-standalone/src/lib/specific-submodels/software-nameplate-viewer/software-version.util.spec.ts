import { compareSoftwareVersions, getInstalledVersionStatus } from './software-version.util';

describe('compareSoftwareVersions', () => {
  it('compares numeric segments as numbers', () => {
    expect(compareSoftwareVersions('4.10', '4.5')).toBeGreaterThan(0);
    expect(compareSoftwareVersions('4.5', '4.10')).toBeLessThan(0);
  });

  it('treats a leading v and missing trailing segments as equal', () => {
    expect(compareSoftwareVersions('v2.0', '2.0.0')).toBe(0);
  });

  it('returns null when a version is missing', () => {
    expect(compareSoftwareVersions('', '1.0')).toBeNull();
  });
});

describe('getInstalledVersionStatus', () => {
  it('reports whether the installed version is current, outdated or newer', () => {
    expect(getInstalledVersionStatus('4.5', '4.5')).toBe('current');
    expect(getInstalledVersionStatus('4.4.2', '4.5')).toBe('update-available');
    expect(getInstalledVersionStatus('5.0-beta', '4.5')).toBe('newer');
    expect(getInstalledVersionStatus('4.5', '')).toBeNull();
  });
});
