export type InstalledVersionStatus = 'current' | 'update-available' | 'newer';

/**
 * Compares two version strings segment by segment ("4.5" < "4.10", "v2.0.1" = "2.0.1"). Numeric segments are
 * compared as numbers, other segments alphabetically; missing segments count as 0.
 *
 * @returns a negative number if a < b, 0 if equal, a positive number if a > b, or null if one is empty.
 */
export function compareSoftwareVersions(a: string, b: string): number | null {
  const left = splitVersion(a);
  const right = splitVersion(b);
  if (left.length === 0 || right.length === 0) {
    return null;
  }

  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const l = left[i] ?? '0';
    const r = right[i] ?? '0';
    const bothNumeric = /^\d+$/.test(l) && /^\d+$/.test(r);
    const diff = bothNumeric ? Number(l) - Number(r) : l.localeCompare(r);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

/** Status of the installed version compared to the version the nameplate describes, or null if unknown. */
export function getInstalledVersionStatus(installedVersion: string, releasedVersion: string) {
  const diff = compareSoftwareVersions(installedVersion, releasedVersion);
  if (diff == null) {
    return null;
  }

  const status: InstalledVersionStatus = diff === 0 ? 'current' : diff < 0 ? 'update-available' : 'newer';
  return status;
}

function splitVersion(version: string) {
  return version
    .trim()
    .replace(/^v(?=\d)/i, '')
    .split(/[.\-+_\s]+/)
    .filter((segment) => segment !== '');
}
