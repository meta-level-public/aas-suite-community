---
sidebar_position: 18
title: Mein Bereich
description: Eigenes Profil, eigene Organisationen sowie die Kataloge für Adressen und Produktangaben, die beim Ausfüllen von AAS helfen.
stichworte:
  Mein Bereich: ''
  Profil: mein-profil
  Profilbild: profilbild
  Meine Organisationen: organisationen
  Benutzerrollen: organisationen
  Adresskatalog: adressen
  Herstelleradresse: adressen
  Produktstamm: produktstämme-produktfamilien-und-produktbezeichnungen
  Produktfamilie: produktstämme-produktfamilien-und-produktbezeichnungen
  Produktbezeichnung: produktstämme-produktfamilien-und-produktbezeichnungen
quellen:
  - frontend/libs/aas-designer-core/src/lib/user/user.routes.ts
  - frontend/libs/aas-designer-core/src/lib/user/my-userdata/my-userdata.component.html
  - frontend/libs/aas-designer-core/src/lib/user/my-userdata/my-userdata.component.ts
  - frontend/libs/aas-designer-core/src/lib/user/profile/profile.component.html
  - frontend/libs/aas-designer-core/src/lib/user/profile/profile.component.ts
  - frontend/libs/aas-designer-core/src/lib/user/user-organisation-list/user-organisation-list.component.html
  - frontend/libs/aas-designer-core/src/lib/catalog/address-catalog/address-catalog.component.html
  - frontend/libs/aas-designer-core/src/lib/catalog/address-catalog/address-catalog.component.ts
  - frontend/libs/aas-designer-core/src/lib/catalog/product-designation-catalog/product-designation-catalog.component.html
  - frontend/libs/aas-designer-core/src/lib/catalog/product-designation-catalog/product-designation-catalog.component.ts
  - frontend/libs/aas-designer-core/src/lib/catalog/product-family-catalog/product-family-catalog.component.ts
  - frontend/libs/aas-designer-core/src/lib/catalog/product-root-catalog/product-root-catalog.component.ts
  - frontend/libs/aas-designer-core/src/lib/general/sidebar-tree-nav/sidebar-tree-nav.component.html
  - frontend/libs/aas-designer-core/src/lib/general/structural-elements/multilanguage-property/multilanguage-property.component.ts
  - frontend/libs/designer-app-topbar/src/lib/app-topbar/app-topbar.component.html
  - frontend/libs/translations/i18n/de.json
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

Unter **Persönliche Informationen** stehen **Vorname** und **Name**; beide
sind Pflichtfelder. Die **E-Mail-Adresse** ist die Anmeldekennung und kann
hier nicht geändert werden.

1. **Vorname** oder **Name** ändern.
2. **Speichern** oben rechts wählen.

Die Meldung „Das Profil wurde erfolgreich aktualisiert“ bestätigt die
Änderung.

### Profilbild

Der Abschnitt **Profilbild** zeigt links unter **Aktuelles Profilbild** das
Bild oder „Kein Profilbild vorhanden“, rechts den Bereich **Neues Bild
hochladen**.

1. Unter **Neues Bild hochladen** **Datei wählen** anklicken und ein Bild
   auswählen oder eine Bilddatei in den Bereich ziehen.
2. Das Bild erscheint sofort unter **Aktuelles Profilbild**.
3. **Speichern** übernimmt es dauerhaft, auch wenn sonst nichts geändert
   wurde. Danach erscheint es oben rechts in der Kopfleiste.

Das Kreuz neben der gewählten Datei verwirft die Auswahl; unter
**Aktuelles Profilbild** steht dann wieder das vorherige Bild.

**Profilbild löschen** unter dem aktuellen Bild entfernt es; auch das wird
erst mit **Speichern** übernommen.

## Organisationen

**Meine Organisationen** zeigt je Organisation eine Karte mit
**Organisationsname**, **Benutzerrollen** und **Aktiv** (Ja/Nein), also ob
die Mitgliedschaft aktiv ist.

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
- Alle Felder sind Pflicht. Die mehrsprachigen Felder brauchen mindestens
  einen deutschen und einen englischen Text; vorher bleibt **Speichern**
  gesperrt.
- Wird nur eine der beiden Sprachen bearbeitet, übernimmt der Dialog den
  Text in die andere, bis diese von Hand geändert wird.

Das Menü (⋮) einer Zeile bietet **Bearbeiten** und **Löschen**. **Löschen**
fragt vorher nach.

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
**Mehrsprachigen Bezeichnungen**. Mindestens eine Übersetzung ist nötig. Das
Menü (⋮) einer Zeile bietet **Bearbeiten** und **Löschen**.

![Dialog Produktbezeichnung hinzufügen](/img/designer/produktbezeichnung-hinzufuegen.png)

Im [geführten Modus](./aas-anlegen.md) und im [Editor](./editor.md) bieten die
drei Eigenschaften eine Auswahl aus dem jeweiligen Katalog an; **Übernehmen**
trägt alle Sprachen auf einmal ein. Alternativ lässt sich der Text von Hand
eingeben.
