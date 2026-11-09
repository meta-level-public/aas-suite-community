/**
 * Turns a technical idShort into a readable label for elements without a display name:
 * "InitialInternalResistanceOnBatteryCellLevel" → "Initial internal resistance on battery cell level",
 * "TemperatureRangeIdleState_LowerBoundary" → "Temperature range idle state lower boundary".
 * Abbreviations in capitals (GPIO, CO2) stay as they are.
 */
export function readableIdShort(idShort: string | null | undefined): string {
  const words = (idShort ?? '')
    .replace(/__\d+__$/, '')
    .replace(/[_-]+/g, ' ')
    // aB → a B, ABc → A Bc (end of an abbreviation), a1 → a 1, 1a → 1 a
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d)/g, '$1 $2')
    .replace(/(\d)([A-Za-z])/g, '$1 $2')
    .split(/\s+/)
    .filter((word) => word !== '');

  return words
    .map((word, index) => {
      const isAbbreviation = word.length > 1 && word === word.toUpperCase();
      if (isAbbreviation) return word;
      return index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase();
    })
    .join(' ');
}
