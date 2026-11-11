---
sidebar_position: 18
title: Mein Bereich
---

# Mein Bereich

**Mein Bereich** im Hauptmenü bündelt das eigene Profil und die Stammdaten,
die beim Ausfüllen von AAS immer wieder gebraucht werden. Links steht die
Navigation; das Suchfeld darüber filtert die Einträge.

| Eintrag | Inhalt |
|---|---|
| Mein Profil | Name und Profilbild |
| Organisationen | Organisationen, in denen man Mitglied ist, mit den eigenen Rollen |
| Adressen | Adresskatalog für Hersteller- und Kontaktangaben |
| Produktstämme, Produktfamilien, Produktbezeichnungen | Kataloge für die Produktangaben im Typenschild |
| Schnipsel | Gespeicherte Bausteine, siehe [Schnipsel](./schnipsel.md) |
| Geteilte Links | Öffentliche Links auf AAS, siehe [Geteilte Links](./geteilte-links.md) |

## Mein Profil

![Mein Profil](/img/designer/mein-profil.png)

- **Persönliche Informationen**: Vorname und Name lassen sich ändern und mit
  **Speichern** übernehmen. Die E-Mail-Adresse ist die Anmeldekennung und
  kann hier nicht geändert werden.
- **Profilbild**: ein Bild per **Datei wählen** oder Drag & Drop auswählen und
  **Hochladen**. Es erscheint oben rechts in der Kopfleiste.

Außerdem lassen sich auf dieser Seite die Hilfeeinstellungen zurücksetzen.
Dann erscheinen Hinweise, die man ausgeblendet hat, wieder.

## Organisationen

**Meine Organisationen** zeigt, in welchen Organisationen man Mitglied ist,
welche Rollen man dort hat und ob die Mitgliedschaft aktiv ist.

![Meine Organisationen](/img/designer/meine-organisationen.png)

Die Seite dient nur zur Ansicht. Zwischen Organisationen wechselt man über das
Organisationssymbol in der Kopfleiste; Rollen vergibt die Administration der
Organisation, siehe [Rollen und Rechte](./rollen-und-rechte.md).

## Adressen

Der Adresskatalog speichert Adressen, die man häufig braucht, z. B. die
eigene Firmenanschrift oder Standorte.

![Adresskatalog](/img/designer/adressen.png)

**Hinzufügen** öffnet den Dialog **Adresse hinzufügen**:

![Dialog Adresse hinzufügen](/img/designer/adresse-hinzufuegen.png)

- **Name**, **Straße**, **Ort** und **Bundesland** werden mehrsprachig
  erfasst, je Sprache eine Zeile. **+** ergänzt eine weitere Sprache.
- **PLZ** und **Ländercode** gelten für alle Sprachen.

Beim Speichern einer AAS übernimmt der Designer die Herstelleradresse aus
dem digitalen Typenschild automatisch in den Katalog, sofern sie dort noch
nicht steht.

**Wo Adressen verwendet werden**

- Im [geführten Modus](./aas-anlegen.md) lässt sich beim digitalen
  Typenschild der Hersteller aus der Adressliste übernehmen.
- Im [Editor](./editor.md) bieten Collections für Kontaktangaben (idShort
  beginnt mit `ContactInformation`) die Auswahl **Bitte Adresse wählen oder
  manuell erfassen** mit **Übernehmen** an.

## Produktstämme, Produktfamilien und Produktbezeichnungen

Das digitale Typenschild beschreibt ein Produkt in drei Ebenen:

| Katalog | Eigenschaft im Typenschild | Beispiel |
|---|---|---|
| Produktstämme | `ManufacturerProductRoot` | Pumpen |
| Produktfamilien | `ManufacturerProductFamily` | Kreiselpumpen |
| Produktbezeichnungen | `ManufacturerProductDesignation` | Kreiselpumpe KP-200 |

Die drei Kataloge sorgen dafür, dass diese Angaben in allen AAS einheitlich
und in allen Sprachen gleich geschrieben werden. Sie gelten für die ganze
Organisation.

![Katalog der Produktbezeichnungen](/img/designer/produktbezeichnungen.png)

Auch hier übernimmt der Designer beim Speichern einer AAS die Werte aus dem
Typenschild automatisch, sofern es den Eintrag noch nicht gibt. Die Kataloge
füllen sich so mit der Zeit von selbst; von Hand angelegt werden vor allem
Einträge, die schon vor der ersten AAS feststehen sollen.

**Hinzufügen** öffnet einen Dialog mit einem eindeutigen **Namen** und den
**Mehrsprachigen Bezeichnungen**. Mindestens eine Übersetzung ist nötig.

![Dialog Produktbezeichnung hinzufügen](/img/designer/produktbezeichnung-hinzufuegen.png)

Im [geführten Modus](./aas-anlegen.md) und im [Editor](./editor.md) bieten die
drei Eigenschaften eine Auswahl aus dem jeweiligen Katalog an; **Übernehmen**
trägt alle Sprachen auf einmal ein. Alternativ lässt sich der Text von Hand
eingeben.
