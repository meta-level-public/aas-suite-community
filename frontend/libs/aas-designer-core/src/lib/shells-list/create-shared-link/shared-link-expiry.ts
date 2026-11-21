/**
 * Die Datumsauswahl liefert 0:00 Uhr des gewählten Tages. Ein geteilter Link soll aber bis
 * zum Ende dieses Tages (lokale Zeit) gültig bleiben.
 */
export function endOfSelectedDay(date: Date | null | undefined): Date | undefined {
  if (date == null) return undefined;
  const end = new Date(date.getTime());
  end.setHours(23, 59, 59, 999);
  return end;
}
