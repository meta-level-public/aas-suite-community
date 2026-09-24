import type { MaterialChart } from './passport-view-model';

const colors = ['#b7154d', '#087f8c', '#cf8c16', '#7257a7', '#288466', '#cf624c', '#557baf', '#a25d83'];

export function createMaterialChart(entries: { label: string; percentage: number }[]): MaterialChart | undefined {
  if (!entries.length) return undefined;
  const slices = entries.map((entry, index) => ({ ...entry, color: colors[index % colors.length] }));
  const total = slices.reduce((sum, slice) => sum + slice.percentage, 0);
  if (slices.some((slice) => !Number.isFinite(slice.percentage) || slice.percentage < 0 || slice.percentage > 100)
    || !Number.isFinite(total)) return { slices: [], total: NaN, background: null };
  if (total > 100.05) return { slices, total, background: null };

  let position = 0;
  const stops = slices.filter((slice) => slice.percentage > 0).map((slice) => {
    const start = position;
    position += slice.percentage;
    return `${slice.color} ${start}% ${position}%`;
  });
  if (position < 99.95) stops.push(`#dce5e8 ${position}% 100%`);
  return { slices, total, background: `conic-gradient(${stops.join(', ')})` };
}
