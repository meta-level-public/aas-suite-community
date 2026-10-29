/** Target of a navigation to another AAS referenced in the viewed AAS. */
export interface ShellNavigationTarget {
  /** Id of the referenced AAS, e.g. from a ModelReference */
  aasId?: string | null;
  /** Global asset ID of the referenced asset, e.g. from a SelfManagedEntity */
  globalAssetId?: string | null;
}

/**
 * Opens another AAS. Provided by the host application because resolving and opening an AAS
 * depends on where the viewer is embedded. Without a navigator, no navigation is offered.
 */
export type ShellNavigator = (target: ShellNavigationTarget) => void | Promise<void>;
