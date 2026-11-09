import { readableIdShort } from './readable-id-short';

describe('readableIdShort', () => {
  it('splits camel case into a sentence', () => {
    expect(readableIdShort('InitialInternalResistanceOnBatteryCellLevel')).toBe(
      'Initial internal resistance on battery cell level',
    );
  });

  it('handles underscores, numbers and abbreviations', () => {
    expect(readableIdShort('TemperatureRangeIdleState_LowerBoundary')).toBe(
      'Temperature range idle state lower boundary',
    );
    expect(readableIdShort('RoundTripEnergyEfficiencyAt50PercentOfCycleLife')).toBe(
      'Round trip energy efficiency at 50 percent of cycle life',
    );
    expect(readableIdShort('GPIONumber')).toBe('GPIO number');
    expect(readableIdShort('IPCommunication__00__')).toBe('IP communication');
  });

  it('returns an empty text for a missing idShort', () => {
    expect(readableIdShort(undefined)).toBe('');
  });
});
