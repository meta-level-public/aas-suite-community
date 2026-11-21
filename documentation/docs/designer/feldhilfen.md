---
sidebar_position: 22
title: Feldhilfen
description: Erklärt die kurzen Hilfetexte an Eingabefeldern und wie berechtigte Benutzer sie in Deutsch und Englisch bearbeiten.
stichworte:
  Feldhilfe: ''
  Hilfetext: ''
  Globale Hilfe: ''
  Organisationsspezifische Hilfe: ''
  Hilfebearbeitung aktivieren: feldhilfen-bearbeiten
quellen:
  - frontend/libs/common-components/src/lib/help-label/help-label.component.html
  - frontend/libs/common-components/src/lib/help-label/help-label.component.ts
  - frontend/libs/designer-app-topbar/src/lib/app-topbar/app-topbar.component.ts
  - frontend/libs/translations/i18n/de.json
---

# Feldhilfen

Neben diesem Handbuch gibt es kurze Hilfetexte direkt an Eingabefeldern. Ist
für ein Feld ein Text hinterlegt, erscheint neben der Beschriftung ein
Fragezeichen-Symbol; ein Klick darauf öffnet den Text.

Es gibt zwei Arten von Texten:

- **Globale Hilfe**: gilt für alle Organisationen des Systems.
- **Organisationsspezifische Hilfe**: ergänzt die globale Hilfe um Hinweise der eigenen
  Organisation, z. B. interne Namenskonventionen.

Sind beide vorhanden, zeigt das Fenster beide Texte untereinander. Angezeigt
wird jeweils der Text in der Sprache der Oberfläche.

## Feldhilfen bearbeiten

Wer systemweite Hilfetexte oder die Hilfetexte der Organisation bearbeiten
darf (siehe [Rollen und Rechte](./rollen-und-rechte.md)), findet im
Benutzermenü den Eintrag **Hilfebearbeitung aktivieren**. Danach erscheint an
jedem Feld mit Hilfe-Anker ein Stift-Symbol, auch wenn dort noch kein Text
hinterlegt ist.

1. Im Benutzermenü **Hilfebearbeitung aktivieren** wählen.
2. Am gewünschten Feld auf das Stift-Symbol klicken.
3. Oben im Dialog die Sprache wählen (**deutsch** oder **englisch**).
   Vorbelegt ist die Sprache der Oberfläche.
4. Den Text in **Globaler Text** bzw. **Text für die Organisation** eintragen.
   Welche Felder erscheinen, hängt von den eigenen Rechten ab. Die Texte
   lassen sich formatieren, z. B. fett oder als Liste.
5. Für die andere Sprache die Auswahl umstellen und den Text dort eintragen.
6. **Speichern** übernimmt die Texte beider Sprachen.

**Hilfebearbeitung deaktivieren** im Benutzermenü blendet die Stift-Symbole
wieder aus.

:::tip Feldhilfe oder Handbuch?
Feldhilfen erklären in ein, zwei Sätzen, was in ein Feld gehört. Abläufe,
Zusammenhänge und Hintergründe gehören in dieses Handbuch.
:::

:::note
Die globalen Hilfetexte lassen sich in der
[Systemverwaltung](./systemverwaltung.md#hilfetexte) gesammelt herunterladen
und wieder einspielen.
:::
