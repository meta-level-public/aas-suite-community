/**
 * Zeichenfilter für idShort-Eingabefelder (z. B. `[pKeyFilter]`).
 *
 * Der Ausdruck ist bewusst verankert: PrimeNG KeyFilter prüft beim Tippen den
 * gesamten bisherigen Wert plus das neue Zeichen. Ein unverankerter Ausdruck wie
 * `/[a-zA-Z0-9_]/` würde dann jedes Zeichen durchlassen, sobald irgendwo ein
 * gültiges Zeichen steht (z. B. "Etage.3").
 *
 * Erlaubt sind alle Zeichen, die laut Spezifikation in einer idShort vorkommen
 * dürfen (inkl. "-"). Sonst ließen sich bestehende, gültige idShorts mit
 * Bindestrich nicht weiter bearbeiten. Ob Anfang und Ende stimmen, prüft
 * `isValidIdShort`.
 */
export const ID_SHORT_KEY_FILTER = /^[a-zA-Z0-9_-]*$/;

/** idShort-Muster laut AAS-Spezifikation (Constraint AASd-002). */
export const ID_SHORT_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*[a-zA-Z0-9_]+$/;

export function isValidIdShort(idShort: string | null | undefined): boolean {
  return idShort != null && ID_SHORT_PATTERN.test(idShort);
}
