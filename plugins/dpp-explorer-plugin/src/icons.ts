const circle = (x: number, y: number, r: number) =>
  `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

export const iconPaths = {
  activity: ['M22 12h-4l-3 9L9 3l-3 9H2'],
  alert: ['M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z', 'M12 9v4', 'M12 17h.01'],
  award: [circle(12, 8, 6), 'M8.2 13.9 7 22l5-3 5 3-1.2-8.1'],
  battery: ['M4 7h13a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z', 'M22 11v2', 'M6 10v4', 'M10 10v4'],
  building: ['M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z', 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2',
    'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2', 'M10 6h4', 'M10 10h4', 'M10 14h4', 'M10 18h4'],
  calendar: ['M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M16 2v4', 'M8 2v4', 'M3 10h18'],
  car: ['M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.4A2 2 0 0 0 13.7 6H7.6a2 2 0 0 0-1.7 1L4 10l-1.5.6C1.7 11 1 11.8 1 12.7V16c0 .6.4 1 1 1h2',
    circle(7, 17, 2), circle(17, 17, 2), 'M9 17h6'],
  check: [circle(12, 12, 10), 'M9 12l2 2 4-4'],
  clock: [circle(12, 12, 10), 'M12 6v6l4 2'],
  cpu: ['M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M9 9h6v6H9z',
    'M9 1v3', 'M15 1v3', 'M9 20v3', 'M15 20v3', 'M20 9h3', 'M20 14h3', 'M1 9h3', 'M1 14h3'],
  external: ['M15 3h6v6', 'M10 14 21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'],
  factory: ['M2 20h20', 'M4 20V10l5 3v-3l5 3V5h5v15', 'M17 9h.01', 'M17 13h.01'],
  file: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8'],
  flame: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.2 1.6 1.5 2.8 2.5 2.8z'],
  gauge: ['M12 14l4-4', 'M3.3 19a10 10 0 1 1 17.4 0'],
  flask: ['M9 3h6', 'M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3', 'M7 15h10'],
  globe: [circle(12, 12, 10), 'M2 12h20', 'M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z'],
  hash: ['M4 9h16', 'M4 15h16', 'M10 3 8 21', 'M16 3l-2 18'],
  hourglass: ['M5 22h14', 'M5 2h14', 'M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V22',
    'M7 2v4.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4a2 2 0 0 0 .6-1.4V2'],
  image: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', circle(9, 9, 2), 'M21 15l-5-5L5 21'],
  info: [circle(12, 12, 10), 'M12 16v-4', 'M12 8h.01'],
  layers: ['M12 2 2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  leaf: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z', 'M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12'],
  link: ['M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7', 'M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7'],
  mail: ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M22 6l-10 7L2 6'],
  message: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
  package: ['M16.5 9.4 7.5 4.2', 'M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z',
    'M3.3 7 12 12l8.7-5', 'M12 22V12'],
  passport: ['M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', circle(9, 10, 2), 'M15 8h2', 'M15 12h2', 'M7 16h10'],
  phone: ['M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z'],
  pin: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z', circle(12, 10, 3)],
  plug: ['M12 22v-5', 'M9 8V2', 'M15 8V2', 'M18 8v5a6 6 0 0 1-12 0V8z'],
  recycle: ['M7 19H4.8a1.8 1.8 0 0 1-1.6-2.7L7.2 9.5', 'M11 19h8.2a1.8 1.8 0 0 0 1.6-2.7l-1.2-2.1', 'M14 16l-3 3 3 3',
    'M8.3 13.6 7.2 9.5 3.1 10.6', 'M9.3 5.6l1.1-1.9a1.8 1.8 0 0 1 3.1 0l3.9 6.8', 'M13.4 10.4l4.1 1.1 1.1-4.1'],
  refresh: ['M21 12a9 9 0 0 1-15.5 6.3L3 16', 'M3 12a9 9 0 0 1 15.5-6.3L21 8', 'M21 3v5h-5', 'M3 21v-5h5'],
  resistance: ['M2 12h4l2-5 3 10 3-10 3 10 2-5h3'],
  scale: ['M12 3v18', 'M7 21h10', 'M3 7h18', 'M6 7l-3 7a3 3 0 0 0 6 0z', 'M18 7l-3 7a3 3 0 0 0 6 0z'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'M9 12l2 2 4-4'],
  tag: ['M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z', 'M7 7h.01'],
  thermometer: ['M14 14.8V3.5a2.5 2.5 0 0 0-5 0v11.3a4.5 4.5 0 1 0 5 0z'],
  trendingDown: ['M22 17l-8.5-8.5-5 5L2 7', 'M16 17h6v-6'],
  user: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', circle(12, 7, 4)],
  wrench: ['M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8z'],
  zap: ['M13 2 4 14h7l-1 8 9-12h-7l1-8z'],
} satisfies Record<string, string[]>;

export type IconName = keyof typeof iconPaths;

/** Icons for display labels shared by all passport formats. */
const labelIcons: [RegExp, IconName][] = [
  [/co₂|carbon|fußabdruck/i, 'leaf'], [/rezyklat|recycl|kreislauf|zirkular/i, 'recycle'],
  [/material|zusammensetzung/i, 'layers'], [/chemie/i, 'flask'], [/gefahr/i, 'alert'],
  [/zertifikat|nachweis/i, 'award'], [/konformität|ce-kennz|garantie/i, 'shield'], [/dokument/i, 'file'],
  [/hersteller|unternehmen|wirtschaftsakteur|aussteller|rolle|register/i, 'building'],
  [/werk|herstellung|standort|betriebsstätte|tätigkeit/i, 'factory'], [/land|herkunft/i, 'globe'],
  [/ladezustand/i, 'gauge'], [/datum|gültig|erstellt|baujahr/i, 'calendar'], [/aktualisiert|^stand/i, 'clock'],
  [/seriennummer|charge|kennung|-id|artikelnummer|bestellnummer|modell/i, 'hash'],
  [/kapazität|batterie/i, 'battery'], [/energie|spannung|leistung/i, 'zap'],
  [/lebensdauer|zyklen/i, 'hourglass'], [/wirkungsgrad|effizienz/i, 'refresh'], [/temperatur/i, 'thermometer'],
  [/kategorie/i, 'tag'], [/granularität|status|schema/i, 'info'], [/pass/i, 'passport'], [/produkt/i, 'package'],
];

export function iconForLabel(label: string, fallback: IconName = 'info'): IconName {
  return labelIcons.find(([pattern]) => pattern.test(label))?.[1] ?? fallback;
}
