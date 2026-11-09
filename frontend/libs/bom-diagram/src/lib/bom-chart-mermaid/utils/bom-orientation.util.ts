export type BomOrientation = 'LR' | 'TB';

/**
 * Picks the layout direction that uses the (wide) diagram area best.
 *
 * Top-to-bottom spreads the widest level horizontally and stacks the levels vertically; left-to-right does the
 * opposite. A flat tree with many siblings (e.g. a product with ten parts) therefore reads best top-to-bottom, a deep
 * chain left-to-right.
 */
export function chooseBomOrientation(rootId: string | null, childrenMap: Record<string, string[]>): BomOrientation {
  if (rootId == null) {
    return 'LR';
  }

  let depth = 0;
  let maxBreadth = 0;
  let level = [rootId];
  const visited = new Set<string>();

  while (level.length > 0) {
    depth++;
    maxBreadth = Math.max(maxBreadth, level.length);
    level.forEach((id) => visited.add(id));
    level = level.flatMap((id) => childrenMap[id] ?? []).filter((id) => !visited.has(id));
  }

  return maxBreadth > depth ? 'TB' : 'LR';
}
