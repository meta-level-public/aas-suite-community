/**
 * Maps the items with an async function, running at most `limit` calls at the same time.
 * The results keep the order of the items. Items whose call fails are left out.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: ({ ok: true; value: R } | { ok: false })[] = new Array(items.length);
  let next = 0;

  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      try {
        results[index] = { ok: true, value: await mapper(items[index]) };
      } catch {
        results[index] = { ok: false };
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(Math.max(1, limit), items.length) }, worker));
  return results.flatMap((result) => (result.ok ? [result.value] : []));
}
