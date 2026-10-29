/** Value of an expandable element: true/false for single panels, the PrimeNG accordion value otherwise */
export type ExpandedStateValue = boolean | string | number | string[] | number[] | null;

export type ExpandedState = ReadonlyMap<string, ExpandedStateValue>;

const STORAGE_PREFIX = 'aas-viewer-expanded:';

export function expandedStateKey(submodelId: string, path: string) {
  return `${submodelId}\n${path}`;
}

// The state is kept per AAS in the session storage, so it survives reloading the page
export function loadExpandedState(aasId: string | null | undefined): ExpandedState {
  if (!aasId) return new Map();
  try {
    const stored = sessionStorage.getItem(STORAGE_PREFIX + aasId);
    return new Map(stored ? (JSON.parse(stored) as [string, ExpandedStateValue][]) : []);
  } catch {
    return new Map();
  }
}

export function saveExpandedState(aasId: string | null | undefined, state: ExpandedState) {
  if (!aasId) return;
  try {
    sessionStorage.setItem(STORAGE_PREFIX + aasId, JSON.stringify([...state]));
  } catch {
    // Storage may be unavailable (private mode, quota); the state is then kept in memory only
  }
}
