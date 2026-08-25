export interface PluginMenuItem {
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
