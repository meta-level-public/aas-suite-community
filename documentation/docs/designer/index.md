---
sidebar_position: 1
title: Überblick
description: Überblick über den AAS Designer – Hauptmenü, Kopfleiste, Benutzermenü, erste Schritte und Darstellung auf Smartphones.
stichworte:
  AAS Designer: ''
  Hauptmenü: aufbau-der-oberfläche
  Kopfleiste: kopfleiste-und-benutzermenü
  Benutzermenü: kopfleiste-und-benutzermenü
  Organisation wechseln: kopfleiste-und-benutzermenü
  Dunkler Modus: kopfleiste-und-benutzermenü
  Schriftgröße: kopfleiste-und-benutzermenü
  Erste Schritte: erste-schritte
  Smartphone: darstellung-auf-mobilen-geräten
quellen:
  - frontend/libs/designer-app-menu/src/lib/app-menu/app.menu.component.ts
  - frontend/libs/designer-app-topbar/src/lib/app-topbar/app-topbar.component.html
  - frontend/libs/designer-app-topbar/src/lib/app-topbar/app-topbar.component.ts
  - frontend/libs/common-components/src/lib/user-docs-button/user-docs-button.component.html
  - frontend/apps/aas-designer-enterprise/src/app/app.config.ts
  - frontend/apps/aas-designer-enterprise/src/app/dashboard-license.guard.ts
  - frontend/libs/aas-assistant/src/lib/components/aassi-topbar-button/aassi-topbar-button.component.html
  - frontend/libs/translations/i18n/de.json
---

# AAS Designer

Mit dem AAS Designer werden Verwaltungsschalen (Asset Administration Shells,
AAS) nach dem Standard der IDTA erstellt, bearbeitet, angezeigt und geteilt.
Die Daten liegen in einer AAS-Infrastruktur (Repositories, Registries und
Discovery), die der Designer anbindet.

## Aufbau der Oberfläche

Das Hauptmenü enthält, je nach Rechten und Edition, folgende Bereiche:

![Ausgeklapptes Hauptmenü neben der Liste der Verwaltungsschalen](/img/designer/hauptmenue.png)


| Menüpunkt | Inhalt |
|---|---|
| Dashboard | Kennzahlen und Wiedereinstieg; nur in der Enterprise-Edition mit passender Lizenz, siehe [Dashboard](./dashboard.md) |
| Shells | Liste der AAS in der aktuellen Infrastruktur, siehe [AAS verwalten](./aas-verwalten.md) |
| Teilmodelle | Liste der Teilmodelle (Submodels) |
| Konzeptbeschreibungen | Liste der Concept Descriptions, siehe [Konzeptbeschreibungen](./konzeptbeschreibungen.md) |
| Erstellen | Neue AAS anlegen, siehe [AAS anlegen](./aas-anlegen.md); nur wenn die aktuelle Infrastruktur beschreibbar ist |
| IDTA Submodels | Vorlagen der IDTA für Teilmodelle, siehe [IDTA-Vorlagen](./idta-vorlagen.md) |
| Plugins | Zusätzliche Funktionen, sofern Plugins installiert sind, siehe [Plugins](../betrieb/plugins.md) |
| Mein Bereich | Profil, Stammdaten, [Schnipsel](./schnipsel.md) und [geteilte Links](./geteilte-links.md), siehe [Mein Bereich](./mein-bereich.md) |
| Organisation | Benutzer, Infrastrukturen, Token und Stammdaten der eigenen Organisation (Rolle **Organisationsadministration**), siehe [Organisation verwalten](./organisation.md) |
| Systemverwaltung | Systemweite Einstellungen (Rolle **Systemadministration**), siehe [Systemverwaltung](./systemverwaltung.md) |

**Erstellen** fehlt, wenn die gewählte Infrastruktur als **Nur-Lesen**
eingerichtet ist oder das Recht **Schreiben** darauf fehlt, siehe
[Rollen und Rechte](./rollen-und-rechte.md#infrastruktur-rechte). Ohne
Dashboard beginnt die Arbeit in der Liste **Shells**.

:::info Enterprise
In der Enterprise-Edition kommen je nach Lizenz und Rechten die Menüpunkte
**Feed Mapping** (Rolle **Feed-Mapping**) und **Marktplatz Freigaben**
(Recht **Marktplatz veröffentlichen**) hinzu.
:::

## Kopfleiste und Benutzermenü

In der Kopfleiste stehen von links nach rechts:

- die Sprache (**DE** oder **EN**),
- die Organisation, mit ihrem Logo, sofern eines hinterlegt ist. Wer Mitglied
  in mehreren Organisationen ist, wechselt hier über
  **Organisation auswählen** die Organisation,
- das Fragezeichen für das **Handbuch**, sofern der Betrieb die Adresse des
  Handbuchs konfiguriert hat; es öffnet die Seite zur aktuellen Ansicht,
- das **Benutzermenü** (Avatar).

Das Benutzermenü enthält:

| Eintrag | Wirkung |
|---|---|
| Abmelden | Beendet die Sitzung |
| Mein Profil | Öffnet [Mein Bereich](./mein-bereich.md) |
| News | Zeigt die Neuigkeiten der Installation |
| Handbuch | Öffnet diese Übersichtsseite im Handbuch; nur wenn das Handbuch konfiguriert ist |
| Datenschutz, AGB, AVV | Öffnen die Rechtstexte der Installation |
| Version | Version des Designers und, sofern beim Bau hinterlegt, Datum und Uhrzeit des Builds (nur Anzeige) |
| Darkmode umschalten | Wechselt zwischen hellem und dunklem Modus |
| Hilfebearbeitung aktivieren | Nur mit Berechtigung für Hilfetexte, siehe [Feldhilfen](./feldhilfen.md) |
| Schrift größer / Schrift kleiner | Ändert die Schriftgröße der Oberfläche |

![Geöffnetes Benutzermenü mit Abmelden, Mein Profil, News, Handbuch, Rechtstexten, Version und Darstellungsoptionen](/img/designer/benutzermenue.png)

:::info Enterprise
In der Enterprise-Edition steht in der Kopfleiste zusätzlich die
Schaltfläche **AASsi** für den KI-Assistenten (Tastenkürzel Strg+K).
:::

## Erste Schritte

Wer neu mit Verwaltungsschalen arbeitet, liest zuerst die
[AAS-Grundlagen](./grundlagen.md); Begriffe stehen im [Glossar](./glossar.md).
Eine Kurzfassung der folgenden Schritte ist der [Schnellstart](../schnellstart.md).

1. In der Liste **Shells** oder, falls vorhanden, im
   [Dashboard](./dashboard.md) einen Überblick verschaffen.
2. Über **Erstellen** eine AAS mit dem [geführten Modus](./aas-anlegen.md)
   anlegen.
3. Im [Editor](./editor.md) weitere Teilmodelle aus den
   [IDTA-Vorlagen](./idta-vorlagen.md) einfügen und Werte ergänzen.
4. Die AAS [validieren](./validierung.md), das Ergebnis im
   [Viewer](./viewer.md) prüfen und bei Bedarf über einen
   [geteilten Link](./geteilte-links.md) oder als
   [Datei](./import-export.md) weitergeben.

## Darstellung auf mobilen Geräten

Unter 768 px Breite (Smartphones):

- Das Hauptmenü ist ausgeblendet und wird über den Menü-Button in der
  Kopfleiste als Overlay geöffnet; nach der Navigation schließt es sich wieder.
- Sprache und Organisation sind im Benutzermenü (Avatar) erreichbar.
- Im Viewer zeigen „Zurück“, „Download“ und „Editor“ nur Icons, und Labels
  von Detailfeldern stehen über ihren Werten.

Weitere Hinweise zur Darstellung im Viewer stehen unter
[Viewer](./viewer.md#bildschirmbreiten).
