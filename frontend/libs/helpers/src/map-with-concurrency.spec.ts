import { mapWithConcurrency } from './map-with-concurrency';

describe('mapWithConcurrency', () => {
  it('keeps the order of the items', async () => {
    const delays = [30, 5, 15, 0];

    const result = await mapWithConcurrency(delays, 2, (ms) => new Promise<number>((r) => setTimeout(() => r(ms), ms)));

    expect(result).toEqual([30, 5, 15, 0]);
  });

  it('runs at most the given number of calls at the same time', async () => {
    let running = 0;
    let maxRunning = 0;

    await mapWithConcurrency([1, 2, 3, 4, 5, 6, 7], 3, async () => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await new Promise((r) => setTimeout(r, 1));
      running--;
    });

    expect(maxRunning).toBe(3);
  });

  it('leaves out items whose call fails', async () => {
    const result = await mapWithConcurrency(['a', 'b', 'c'], 2, async (v) => {
      if (v === 'b') throw new Error('not found');
      return v.toUpperCase();
    });

    expect(result).toEqual(['A', 'C']);
  });

  it('handles an empty list', async () => {
    await expect(mapWithConcurrency([], 4, async (v) => v)).resolves.toEqual([]);
  });
});
