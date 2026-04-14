import {
  AppRoutePaths,
  AppRouteSegments,
  AppRouteUrls,
  buildAbsoluteRoute,
  buildDashboardRoute,
  buildLicenseUpdateRoute,
  buildMappingCreateRoute,
  buildMappingEditRoute,
  buildMySpaceProfileRoute,
  buildRepoEditRoute,
  buildShellRegistryCorrectionRoute,
  buildShellsListRoute,
  buildViewerRoute,
  normalizePostLoginRedirectUrl,
} from './app-routes';

describe('app-routes', () => {
  it('builds absolute routes without empty segments', () => {
    expect(buildAbsoluteRoute(AppRouteSegments.mapping, null, undefined, '', 42)).toEqual(['/', 'mapping', 42]);
  });

  it('builds repo edit routes with and without infrastructure ids', () => {
    expect(buildRepoEditRoute(7, 'aas-1')).toEqual(['/', 'aas', 'v3', 'repo-edit', 7, 'aas-1']);
    expect(buildRepoEditRoute(-1, 'aas-1')).toEqual(['/', 'aas', 'v3', 'repo-edit', 'aas-1']);
  });

  it('builds viewer and nested feature routes', () => {
    expect(buildViewerRoute(4, 'aas-1')).toEqual(['/', 'viewer', 'aas-view', 4, 'aas-1']);
    expect(buildMappingCreateRoute('aas-1')).toEqual(['/', 'mapping', 'create', 'aas-1']);
    expect(buildMappingEditRoute(12, 'aas-1')).toEqual(['/', 'mapping', 12, 'aas-1']);
    expect(buildMySpaceProfileRoute()).toEqual(['/', 'my-space', 'profile']);
    expect(buildLicenseUpdateRoute()).toEqual(['/', 'system-management', 'license-update']);
    expect(buildDashboardRoute()).toEqual(['/', 'dashboard']);
    expect(buildShellsListRoute()).toEqual(['/', 'shells-list']);
    expect(buildShellRegistryCorrectionRoute('aas-1')).toEqual(['/', 'shells-list', 'aas-1', 'registry-correction']);
  });

  it('exposes stable nested route path templates', () => {
    expect(AppRoutePaths.mappingCreate).toBe('create/:aasIdentifier');
    expect(AppRoutePaths.mappingEdit).toBe(':mappingId/:aasIdentifier');
    expect(AppRoutePaths.mySpaceProfile).toBe('profile');
    expect(AppRoutePaths.systemManagementLicenseUpdate).toBe('license-update');
  });

  it('normalizes valid post login redirects and rejects forbidden targets', () => {
    expect(normalizePostLoginRedirectUrl('/mapping/12/aas-1')).toBe('/mapping/12/aas-1');
    expect(normalizePostLoginRedirectUrl('/my-space/profile')).toBe('/my-space/profile');
    expect(normalizePostLoginRedirectUrl(AppRouteUrls.login)).toBeNull();
    expect(normalizePostLoginRedirectUrl(AppRouteUrls.ssoLoginSuccess)).toBeNull();
    expect(normalizePostLoginRedirectUrl(AppRouteUrls.ssoLoginStatusLegacy)).toBeNull();
    expect(normalizePostLoginRedirectUrl('/contact/42')).toBeNull();
    expect(normalizePostLoginRedirectUrl(AppRouteUrls.root)).toBeNull();
    expect(normalizePostLoginRedirectUrl('https://example.com/malicious')).toBeNull();
  });
});
