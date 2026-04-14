export interface AppConfig {
  logoPath: string;
  apiPath: string;
  aasApiPath: string;
  aasProxyApiPath: string;
  aasSharedLinksApiPath: string;
  aasDashboardApiPath: string;
  aasSystemManagementApiPath: string;
  aasHelpApiPath: string;
  aasViewerProxyPath: string;
  aasViewerApiPath: string;
  datenschutzLinkDe: string;
  datenschutzLinkEn: string;
  avvLinkDe: string;
  avvLinkEn: string;
  agbLinkDe: string;
  agbLinkEn: string;
  imprintLink: string;
  aasSuiteLink: string;
  useContactForm: string;
  licensingEnabled?: boolean;
  defaultTheme?: string;
  compareUrls: string;
}
