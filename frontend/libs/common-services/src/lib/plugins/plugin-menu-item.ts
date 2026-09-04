export type PluginType = 'GuiApp' | 'SubmodelViewer' | 'SaveInterceptor';

export interface PluginMenuItem {
  type: PluginType;
  id: string;
  route: string;
  name: string;
  icon: string;
  description?: string;
  shortLabel?: string;
  requiredRole?: string;
  requiresWritableRepo?: boolean;
  sortOrder?: number;
  version?: string;
  author?: string;
  assetPath: string;
  entryPointPath: string;
  entryPointUrl: string;
}

export interface PluginMenuItemDto {
  type: PluginType;
  id: string;
  route: string;
  name: string;
  icon: string;
  description?: string;
  shortLabel?: string;
  requiredRole?: string;
  requiresWritableRepo?: boolean;
  sortOrder?: number;
  version?: string;
  author?: string;
  assetPath: string;
  entryPointPath: string;
}
