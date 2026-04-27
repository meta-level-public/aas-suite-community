export type AppRouteSegment = string | number;

function isRouteSegment(segment: AppRouteSegment | null | undefined): segment is AppRouteSegment {
  return segment !== null && segment !== undefined && segment !== '';
}

export function buildAbsoluteRoute(...segments: Array<AppRouteSegment | null | undefined>): AppRouteSegment[] {
  return ['/', ...segments.filter(isRouteSegment)];
}

export function buildAbsoluteRoutePath(...segments: Array<AppRouteSegment | null | undefined>): string {
  const normalizedSegments = segments.filter(isRouteSegment).map(String);

  return normalizedSegments.length === 0 ? '/' : `/${normalizedSegments.join('/')}`;
}

export const AppRouteSegments = {
  aas: 'aas',
  aasView: 'aas-view',
  access: 'access',
  addresses: 'addresses',
  cdEdit: 'cd-edit',
  cdsList: 'cds-list',
  contact: 'contact',
  create: 'create',
  createInvitedAccount: 'create-invited-account',
  dashboard: 'dashboard',
  error: 'error',
  forbidden: 'forbidden',
  generator: 'generator',
  instanceViewer: 'instance-viewer',
  licenseUpdate: 'license-update',
  login: 'login',
  mapping: 'mapping',
  marktFreigaben: 'markt-freigaben',
  marktRegexRules: 'markt-regex-rules',
  myOrganization: 'my-organization',
  myPublishedListings: 'my-published-listings',
  mySpace: 'my-space',
  notFound: 'notfound',
  organisations: 'organisations',
  productDesignation: 'product-designation',
  productFamily: 'product-family',
  productRoot: 'product-root',
  profile: 'profile',
  publicViewer: 'public-viewer',
  registryCorrection: 'registry-correction',
  repoEdit: 'repo-edit',
  shellsList: 'shells-list',
  sharedLinks: 'shared-links',
  snippets: 'snippets',
  ssoLoginStatusLegacy: 'sso-login-status',
  ssoLoginSuccess: 'sso-login-success',
  submodels: 'submodels',
  systemManagement: 'system-management',
  v3: 'v3',
  view: 'view',
  viewer: 'viewer',
} as const;

export const AppRoutePaths = {
  empty: '',
  dashboard: AppRouteSegments.dashboard,
  contact: AppRouteSegments.contact,
  contactWithId: `${AppRouteSegments.contact}/:id`,
  createInvitedAccount: `${AppRouteSegments.createInvitedAccount}/:guid`,
  cdEdit: `${AppRouteSegments.cdEdit}/:id`,
  cdEditWithInfrastructure: `${AppRouteSegments.cdEdit}/:infrastructureId/:id`,
  mappingCreate: `${AppRouteSegments.create}/:aasIdentifier`,
  mappingEdit: `:mappingId/:aasIdentifier`,
  mySpaceProfile: AppRouteSegments.profile,
  repoEdit: `${AppRouteSegments.repoEdit}/:aasId`,
  repoEditWithInfrastructure: `${AppRouteSegments.repoEdit}/:infrastructureId/:aasId`,
  aasView: `${AppRouteSegments.aasView}/:aasId`,
  aasViewWithInfrastructure: `${AppRouteSegments.aasView}/:infrastructureId/:aasId`,
  systemManagementLicenseUpdate: AppRouteSegments.licenseUpdate,
  v3View: `${AppRouteSegments.v3}/${AppRouteSegments.view}/:aasId`,
  legacyV3View: `${AppRouteSegments.v3}/${AppRouteSegments.view}/:aasId/:submodelId`,
} as const;

export function buildShellsListRoute(...segments: Array<AppRouteSegment | null | undefined>): AppRouteSegment[] {
  return buildAbsoluteRoute(AppRouteSegments.shellsList, ...segments);
}

export function buildShellRegistryCorrectionRoute(aasId: string): AppRouteSegment[] {
  return buildShellsListRoute(aasId, AppRouteSegments.registryCorrection);
}

export function buildMySpaceRoute(...segments: Array<AppRouteSegment | null | undefined>): AppRouteSegment[] {
  return buildAbsoluteRoute(AppRouteSegments.mySpace, ...segments);
}

export function buildForbiddenRoute(): AppRouteSegment[] {
  return buildAbsoluteRoute(AppRouteSegments.forbidden);
}

export function buildMappingRoute(...segments: Array<AppRouteSegment | null | undefined>): AppRouteSegment[] {
  return buildAbsoluteRoute(AppRouteSegments.mapping, ...segments);
}

export function buildMappingCreateRoute(aasIdentifier: string): AppRouteSegment[] {
  return buildMappingRoute(AppRouteSegments.create, aasIdentifier);
}

export function buildMappingEditRoute(mappingId: number | string, aasIdentifier: string): AppRouteSegment[] {
  return buildMappingRoute(mappingId, aasIdentifier);
}

export function buildSystemManagementRoute(...segments: Array<AppRouteSegment | null | undefined>): AppRouteSegment[] {
  return buildAbsoluteRoute(AppRouteSegments.systemManagement, ...segments);
}

export function buildDashboardRoute(): AppRouteSegment[] {
  return buildAbsoluteRoute(AppRouteSegments.dashboard);
}

export function buildLicenseUpdateRoute(): AppRouteSegment[] {
  return buildSystemManagementRoute(AppRouteSegments.licenseUpdate);
}

export function buildMySpaceProfileRoute(): AppRouteSegment[] {
  return buildMySpaceRoute(AppRouteSegments.profile);
}

export function buildRepoEditRoute(infrastructureId: number | null | undefined, aasId: string): AppRouteSegment[] {
  return buildAbsoluteRoute(
    AppRouteSegments.aas,
    AppRouteSegments.v3,
    AppRouteSegments.repoEdit,
    infrastructureId != null && infrastructureId >= 0 ? infrastructureId : null,
    aasId,
  );
}

export function buildCdEditRoute(infrastructureId: number | null | undefined, cdId: string): AppRouteSegment[] {
  return buildAbsoluteRoute(
    AppRouteSegments.cdEdit,
    infrastructureId != null && infrastructureId >= 0 ? infrastructureId : null,
    cdId,
  );
}

export function buildViewerRoute(infrastructureId: number | null | undefined, aasId: string): AppRouteSegment[] {
  return buildAbsoluteRoute(
    AppRouteSegments.viewer,
    AppRouteSegments.aasView,
    infrastructureId != null && infrastructureId >= 0 ? infrastructureId : null,
    aasId,
  );
}

export const AppRouteUrls = {
  access: buildAbsoluteRoutePath(AppRouteSegments.access),
  contact: buildAbsoluteRoutePath(AppRouteSegments.contact),
  error: buildAbsoluteRoutePath(AppRouteSegments.error),
  forbidden: buildAbsoluteRoutePath(AppRouteSegments.forbidden),
  login: buildAbsoluteRoutePath(AppRouteSegments.login),
  mapping: buildAbsoluteRoutePath(AppRouteSegments.mapping),
  myOrganization: buildAbsoluteRoutePath(AppRouteSegments.myOrganization),
  root: buildAbsoluteRoutePath(),
  shellsList: buildAbsoluteRoutePath(AppRouteSegments.shellsList),
  ssoLoginStatusLegacy: buildAbsoluteRoutePath(AppRouteSegments.ssoLoginStatusLegacy),
  ssoLoginSuccess: buildAbsoluteRoutePath(AppRouteSegments.ssoLoginSuccess),
  systemManagementLicenseUpdate: buildAbsoluteRoutePath(
    AppRouteSegments.systemManagement,
    AppRouteSegments.licenseUpdate,
  ),
} as const;

export function normalizePostLoginRedirectUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed.startsWith('/')) {
    return null;
  }

  const forbiddenPrefixes = [
    AppRouteUrls.login,
    AppRouteUrls.ssoLoginSuccess,
    AppRouteUrls.ssoLoginStatusLegacy,
    AppRouteUrls.contact,
    AppRouteUrls.error,
    AppRouteUrls.forbidden,
  ];

  if (forbiddenPrefixes.some((prefix) => trimmed === prefix || trimmed.startsWith(`${prefix}/`))) {
    return null;
  }

  if (trimmed === AppRouteUrls.root || trimmed.startsWith('/#')) {
    return null;
  }

  return trimmed;
}
