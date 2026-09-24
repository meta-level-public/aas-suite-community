import * as aas from '@aas-core-works/aas-core3.1-typescript';

export interface LoadedSubmodel {
  idShort: string;
  id: string;
  url: string;
  sm: aas.types.Submodel;
}

export type SubmodelLoadStatus = 'loading' | 'loaded' | 'failed' | 'skipped';

export interface SubmodelLoadState {
  url: string;
  label: string;
  status: SubmodelLoadStatus;
  submodel?: LoadedSubmodel;
}

/**
 * Derives a readable name for a submodel that is not loaded yet. Submodel endpoints end with the
 * base64url encoded submodel identifier, whose last path segment is usually the submodel name
 * (e.g. https://example.com/submodel/000-001/Nameplate -> Nameplate).
 */
export function submodelLabelFromUrl(url: string): string {
  const encodedId = decodeURIComponent(url.split('?')[0].replace(/\/+$/, '').split('/').pop() ?? '');
  const id = decodeBase64Url(encodedId) ?? encodedId;
  const segments = id.split(/[/#:]/).filter((segment) => segment !== '');
  return segments.pop() ?? id;
}

function decodeBase64Url(value: string): string | null {
  if (value === '' || !/^[A-Za-z0-9_-]+$/.test(value)) {
    return null;
  }

  try {
    const base64 = value
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(value.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    // Binary garbage means the segment was not an encoded identifier.
    // eslint-disable-next-line no-control-regex
    return /[\u0000-\u001F\u007F]/.test(decoded) ? null : decoded;
  } catch {
    return null;
  }
}
