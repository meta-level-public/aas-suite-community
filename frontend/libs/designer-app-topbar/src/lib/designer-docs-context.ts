import { AppRouteSegments, DocsContext, DocsContextRule, docsTopic } from '@aas/common-services';

const { myOrganization, mySpace, systemManagement } = AppRouteSegments;

/** Maps the designer routes to pages of the user documentation (documentation/docs/designer/). */
export const DESIGNER_DOCS_CONTEXT: DocsContext = {
  defaultTopic: docsTopic('designer'),
  rules: [
    { urlPrefix: AppRouteSegments.shellsList, topic: docsTopic('designer/aas-verwalten') },
    {
      urlPrefix: AppRouteSegments.submodels,
      topic: docsTopic('designer/aas-verwalten', 'teilmodelle-und-konzeptbeschreibungen'),
    },
    {
      urlPrefix: AppRouteSegments.cdsList,
      topic: docsTopic('designer/konzeptbeschreibungen', 'liste-der-konzeptbeschreibungen'),
    },
    { urlPrefix: AppRouteSegments.dashboard, topic: docsTopic('designer/dashboard') },
    { urlPrefix: AppRouteSegments.idtaSubmodels, topic: docsTopic('designer/idta-vorlagen') },
    { urlPrefix: AppRouteSegments.aas, topic: docsTopic('designer/aas-anlegen') },
    { urlPrefix: AppRouteSegments.generator, topic: docsTopic('designer/aas-anlegen') },
    { urlPrefix: `${AppRouteSegments.aas}/${AppRouteSegments.v3}`, topic: docsTopic('designer/editor') },
    { urlPrefix: AppRouteSegments.submodelEdit, topic: docsTopic('designer/editor') },
    { urlPrefix: AppRouteSegments.cdEdit, topic: docsTopic('designer/konzeptbeschreibungen') },
    { urlPrefix: AppRouteSegments.viewer, topic: docsTopic('designer/viewer') },

    { urlPrefix: mySpace, topic: docsTopic('designer/mein-bereich') },
    { urlPrefix: `${mySpace}/${AppRouteSegments.profile}`, topic: docsTopic('designer/mein-bereich', 'mein-profil') },
    {
      urlPrefix: `${mySpace}/${AppRouteSegments.organisations}`,
      topic: docsTopic('designer/mein-bereich', 'organisationen'),
    },
    { urlPrefix: `${mySpace}/${AppRouteSegments.addresses}`, topic: docsTopic('designer/mein-bereich', 'adressen') },
    ...[AppRouteSegments.productRoot, AppRouteSegments.productFamily, AppRouteSegments.productDesignation].map(
      (segment): DocsContextRule => ({
        urlPrefix: `${mySpace}/${segment}`,
        topic: docsTopic('designer/mein-bereich', 'produktstämme-produktfamilien-und-produktbezeichnungen'),
      }),
    ),
    { urlPrefix: `${mySpace}/${AppRouteSegments.sharedLinks}`, topic: docsTopic('designer/geteilte-links') },
    { urlPrefix: `${mySpace}/${AppRouteSegments.snippets}`, topic: docsTopic('designer/schnipsel') },

    { urlPrefix: myOrganization, topic: docsTopic('designer/organisation') },
    { urlPrefix: `${myOrganization}/details`, topic: docsTopic('designer/organisation', 'organisationsdetails') },
    { urlPrefix: `${myOrganization}/users`, topic: docsTopic('designer/organisation', 'benutzer') },
    { urlPrefix: `${myOrganization}/invitations`, topic: docsTopic('designer/organisation', 'einladungen') },
    { urlPrefix: `${myOrganization}/eclass`, topic: docsTopic('designer/organisation', 'eclass') },
    { urlPrefix: `${myOrganization}/token`, topic: docsTopic('designer/organisation', 'token') },
    { urlPrefix: `${myOrganization}/infrastructure`, topic: docsTopic('designer/organisation', 'aas-infrastruktur') },
    { urlPrefix: `${myOrganization}/payment-model`, topic: docsTopic('designer/organisation', 'bezahlmodell') },

    { urlPrefix: AppRouteSegments.plugins, topic: docsTopic('betrieb/plugins') },

    { urlPrefix: systemManagement, topic: docsTopic('designer/systemverwaltung') },
    {
      urlPrefix: `${systemManagement}/template-management`,
      topic: docsTopic('designer/systemverwaltung', 'templateverwaltung'),
    },
    {
      urlPrefix: `${systemManagement}/cors-config`,
      topic: docsTopic('designer/systemverwaltung', 'cors-konfiguration'),
    },
    {
      urlPrefix: `${systemManagement}/mail-settings`,
      topic: docsTopic('designer/systemverwaltung', 'mail-einstellungen'),
    },
    {
      urlPrefix: `${systemManagement}/news-management`,
      topic: docsTopic('designer/systemverwaltung', 'news-verwaltung'),
    },
    {
      urlPrefix: `${systemManagement}/legal-links-settings`,
      topic: docsTopic('designer/systemverwaltung', 'rechtslinks'),
    },
    { urlPrefix: `${systemManagement}/help-text-config`, topic: docsTopic('designer/systemverwaltung', 'hilfetexte') },
    {
      urlPrefix: `${systemManagement}/job-settings`,
      topic: docsTopic('designer/systemverwaltung', 'job-konfiguration'),
    },
  ],
};

/** Adds the rules of an edition (e.g. enterprise views) to a documentation context. */
export function withDocsContextRules(context: DocsContext, rules: DocsContextRule[]): DocsContext {
  return rules.length === 0 ? context : { ...context, rules: [...context.rules, ...rules] };
}
