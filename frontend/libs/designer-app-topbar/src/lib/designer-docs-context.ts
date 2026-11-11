import { AppRouteSegments, DocsContext, docsTopic } from '@aas/common-services';

/** Maps the designer routes to pages of the user documentation (documentation/docs/designer/). */
export const DESIGNER_DOCS_CONTEXT: DocsContext = {
  defaultTopic: docsTopic('designer'),
  rules: [
    { urlPrefix: AppRouteSegments.shellsList, topic: docsTopic('designer/aas-verwalten') },
    { urlPrefix: AppRouteSegments.submodels, topic: docsTopic('designer/aas-verwalten') },
    { urlPrefix: AppRouteSegments.cdsList, topic: docsTopic('designer/aas-verwalten') },
    { urlPrefix: AppRouteSegments.dashboard, topic: docsTopic('designer/dashboard') },
    { urlPrefix: AppRouteSegments.idtaSubmodels, topic: docsTopic('designer/idta-vorlagen') },
    { urlPrefix: AppRouteSegments.aas, topic: docsTopic('designer/aas-anlegen') },
    { urlPrefix: AppRouteSegments.generator, topic: docsTopic('designer/aas-anlegen') },
    { urlPrefix: `${AppRouteSegments.aas}/${AppRouteSegments.v3}`, topic: docsTopic('designer/editor') },
    { urlPrefix: AppRouteSegments.submodelEdit, topic: docsTopic('designer/editor') },
    { urlPrefix: AppRouteSegments.cdEdit, topic: docsTopic('designer/konzeptbeschreibungen') },
    { urlPrefix: AppRouteSegments.viewer, topic: docsTopic('designer/viewer') },
    { urlPrefix: AppRouteSegments.mySpace, topic: docsTopic('designer/mein-bereich') },
    {
      urlPrefix: `${AppRouteSegments.mySpace}/${AppRouteSegments.sharedLinks}`,
      topic: docsTopic('designer/geteilte-links'),
    },
    { urlPrefix: `${AppRouteSegments.mySpace}/${AppRouteSegments.snippets}`, topic: docsTopic('designer/schnipsel') },
    { urlPrefix: AppRouteSegments.myOrganization, topic: docsTopic('designer/organisation') },
    { urlPrefix: AppRouteSegments.plugins, topic: docsTopic('betrieb/plugins') },
    { urlPrefix: AppRouteSegments.systemManagement, topic: docsTopic('designer/systemverwaltung') },
  ],
};
