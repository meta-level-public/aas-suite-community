import { chooseBomOrientation } from './bom-orientation.util';

describe('chooseBomOrientation', () => {
  it('lays out a flat tree with many parts top to bottom', () => {
    const parts = Array.from({ length: 10 }, (_, index) => `part-${index}`);

    expect(chooseBomOrientation('root', { root: parts, 'part-0': ['firmware'] })).toBe('TB');
  });

  it('lays out a deep chain left to right', () => {
    expect(chooseBomOrientation('root', { root: ['a'], a: ['b'], b: ['c'], c: ['d'] })).toBe('LR');
  });

  it('keeps left to right for a single node or a missing root', () => {
    expect(chooseBomOrientation('root', {})).toBe('LR');
    expect(chooseBomOrientation(null, {})).toBe('LR');
  });

  it('does not loop on cyclic relationships', () => {
    expect(chooseBomOrientation('root', { root: ['a', 'b', 'c'], a: ['root'] })).toBe('TB');
  });
});
