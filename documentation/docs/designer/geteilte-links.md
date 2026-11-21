---
sidebar_position: 17
title: Geteilte Links
description: Wie man eine AAS über einen öffentlichen Link ohne Anmeldung zugänglich macht, den Link schützt und die Links verwaltet.
stichworte:
  Geteilter Link: ''
  Link zum Teilen erzeugen: link-erzeugen
  Ablaufdatum: link-erzeugen
  Passwort für Link: link-erzeugen
  Öffentlicher Viewer: was-empfänger-sehen
  Aufrufe: links-verwalten
  QR-Code: qr-code-zu-einem-link
quellen:
  - frontend/libs/aas-designer-core/src/lib/shells-list/create-shared-link/create-shared-link.component.html
  - frontend/libs/aas-designer-core/src/lib/shells-list/create-shared-link/create-shared-link.component.ts
  - frontend/libs/aas-designer-core/src/lib/shells-list/create-shared-link/shared-link-expiry.ts
  - services/aas-designer/AasDesignerModel/Model/SharedLink.cs
  - frontend/libs/aas-designer-core/src/lib/shells-list/shells-list.component.ts
  - frontend/libs/aas-designer-core/src/lib/user/my-shared-links/my-shared-links.component.html
  - frontend/libs/aas-designer-core/src/lib/user/my-shared-links/my-shared-links.component.ts
  - frontend/libs/aas-designer-core/src/lib/user/my-shared-links/my-shared-links.component.spec.ts
  - frontend/libs/aas-designer-shared/src/lib/public-viewer/public-viewer.component.html
  - services/aas-designer/AasDesignerSharedLinksApi/SharedLinks/Commands/CheckValidity/CreateSharedLinkCommand.cs
  - frontend/libs/translations/i18n/de.json
---

# Geteilte Links

Ein geteilter Link macht eine AAS für Personen ohne Zugang zum Designer
abrufbar, z. B. für Kunden, Prüfstellen oder Servicetechniker. Der Link
öffnet einen öffentlichen, schreibgeschützten Viewer.

## Link erzeugen

1. In der [Liste der Verwaltungsschalen](./aas-verwalten.md) das Menü (⋮)
   der AAS öffnen.
2. **Link zum Teilen erzeugen** wählen.
3. Die Angaben ausfüllen und **Link zum Teilen erzeugen** wählen.

![Dialog Link zum Teilen erzeugen](/img/designer/geteilter-link-erzeugen.png)

| Feld | Bedeutung |
|---|---|
| Notiz | Eigene Notiz, z. B. für wen der Link gedacht ist |
| Ablaufdatum | Optional. Der Link funktioniert bis zum Ende dieses Tages (23:59 Uhr Ortszeit des Browsers, in dem er erzeugt wurde). Ohne Datum gilt er unbegrenzt. |
| Passwort | Optional. Wer den Link öffnet, muss zuerst das Passwort eingeben. Das Augensymbol zeigt das Passwort im Klartext. |

Der fertige Link wird in die Zwischenablage kopiert und kann direkt in eine
E-Mail oder ein Dokument eingefügt werden. Die Meldung „Der Link wurde
erfolgreich erzeugt und in die Zwischenablage kopiert.“ bestätigt das.

:::caution Live-Stand
Der Link zeigt immer den aktuellen Stand der AAS in der gewählten
Infrastruktur, keine Momentaufnahme. Spätere Änderungen sind für alle
sichtbar, die den Link haben. Wer nur einen festen Stand weitergeben will,
nutzt besser einen [Export](./import-export.md).
:::

## Was Empfänger sehen

Der Link öffnet den **AAS Viewer** ohne Anmeldung. Er bietet dieselben
Ansichtsmodi, Werkzeugleiste und Suche wie der [Viewer](./viewer.md) im
Designer, aber weder **Herunterladen** noch Bearbeitungsfunktionen.

![Öffentlicher AAS Viewer](/img/designer/public-viewer.png)

Ist ein Passwort gesetzt, erscheint zuerst die Abfrage **Passwort
erforderlich**. Nach Eingabe des Passworts zeigt **Anzeigen** die AAS. Statt
der AAS erscheint ein Hinweis, wenn

- das Passwort falsch ist,
- der Link abgelaufen ist (**Link abgelaufen**),
- es den Link nicht gibt oder er gelöscht wurde (**Link nicht gefunden**).

Ein geteilter Link lässt sich auch im selben Browser öffnen, in dem man im
Designer angemeldet ist; die eigene Anmeldung bleibt dabei bestehen.

## Links verwalten

**Mein Bereich › Geteilte Links** listet alle Links, die man selbst erzeugt
hat. **Aktualisieren** lädt die Liste neu.

![Liste der geteilten Links](/img/designer/geteilte-links.png)

- **AAS ID** nennt die geteilte AAS.
- **Ablaufdatum** und **Passwort** zeigen, wie der Link geschützt ist.
  **Ablaufdatum** nennt den letzten gültigen Zeitpunkt.
- **Aufrufe** zählt, wie oft der Link geöffnet wurde.
- Das Symbol unter **Link** öffnet den öffentlichen Viewer in einem neuen
  Tab.

Das Menü (⋮) einer Zeile bietet **Kopieren**, **QR-Code** und **Löschen**.
**Kopieren** legt den Link in die Zwischenablage. **Löschen** fragt vorher
nach; ein gelöschter Link funktioniert sofort nicht mehr. Ein Link lässt sich nicht
nachträglich ändern; für ein anderes Ablaufdatum oder Passwort einen neuen
Link erzeugen und den alten löschen.

### QR-Code zu einem Link

**QR-Code** zeigt den Link als QR-Code (schwarz auf weiß, auch im dunklen
Design), z. B. für ein Etikett am Gerät. Der Dialog bietet:

- **SVG herunterladen**: verlustfrei skalierbare Vektorgrafik, Dateiname
  `shared-link_<AAS-ID>.svg`,
- **Drucken**: druckt nur den QR-Code (8 × 8 cm) mit der AAS-ID als
  Überschrift und dem Link im Klartext darunter.
