---
sidebar_position: 17
title: Geteilte Links
---

# Geteilte Links

Ein geteilter Link macht eine AAS für Personen ohne Zugang zum Designer
abrufbar, z. B. für Kunden, Prüfstellen oder Servicetechniker. Der Link
öffnet einen öffentlichen, schreibgeschützten Viewer.

## Link erzeugen

1. In der [Liste der Verwaltungsschalen](./aas-verwalten.md) das Menü (⋮)
   der AAS öffnen.
2. **Link zum Teilen erzeugen** wählen.
3. Die Angaben ausfüllen und **Link zum Teilen erzeugen** bestätigen.

![Dialog Link zum Teilen erzeugen](/img/designer/geteilter-link-erzeugen.png)

| Feld | Bedeutung |
|---|---|
| Notiz | Eigene Notiz, z. B. für wen der Link gedacht ist |
| Ablaufdatum | Optional. Nach diesem Datum funktioniert der Link nicht mehr. Ohne Datum gilt er unbegrenzt. |
| Passwort | Optional. Wer den Link öffnet, muss zuerst das Passwort eingeben. |

Der fertige Link wird in die Zwischenablage kopiert und kann direkt in eine
E-Mail oder ein Dokument eingefügt werden.

:::caution Live-Stand
Der Link zeigt immer den aktuellen Stand der AAS in der gewählten
Infrastruktur, keine Momentaufnahme. Spätere Änderungen sind für alle
sichtbar, die den Link haben. Wer nur einen festen Stand weitergeben will,
nutzt besser einen [Export](./import-export.md).
:::

## Was Empfänger sehen

Der Link öffnet den **AAS Viewer** ohne Anmeldung. Er bietet dieselben
Ansichtsmodi wie der [Viewer](./viewer.md) im Designer, aber keine
Bearbeitungsfunktionen.

![Öffentlicher AAS Viewer](/img/designer/public-viewer.png)

Ist ein Passwort gesetzt, erscheint zuerst die Abfrage **Passwort
erforderlich**. Ist der Link abgelaufen oder gelöscht, zeigt der Viewer einen
entsprechenden Hinweis statt der AAS.

## Links verwalten

**Mein Bereich › Geteilte Links** listet alle Links, die man selbst erzeugt
hat:

![Liste der geteilten Links](/img/designer/geteilte-links.png)

- **Ablaufdatum** und **Passwort** zeigen, wie der Link geschützt ist.
- **Aufrufe** zählt, wie oft der Link geöffnet wurde.
- Das Symbol unter **Link** öffnet den öffentlichen Viewer in einem neuen
  Tab.

Das Menü (⋮) einer Zeile bietet **Kopieren**, **QR-Code** und **Löschen**.
Ein gelöschter Link funktioniert sofort nicht mehr. Ein Link lässt sich nicht
nachträglich ändern; für ein anderes Ablaufdatum oder Passwort einen neuen
Link erzeugen und den alten löschen.

### QR-Code zu einem Link

**QR-Code** zeigt den Link als QR-Code (schwarz auf weiß, auch im dunklen
Design), z. B. für ein Etikett am Gerät. Der Dialog bietet:

- **SVG herunterladen**: verlustfrei skalierbare Vektorgrafik, Dateiname
  `shared-link_<AAS-ID>.svg`,
- **Drucken**: druckt nur den QR-Code (8 × 8 cm) mit der AAS-ID als
  Überschrift und dem Link im Klartext darunter.
