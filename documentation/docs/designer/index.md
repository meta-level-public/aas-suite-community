---
sidebar_position: 1
title: Überblick
---

# AAS Designer

Mit dem AAS Designer werden Verwaltungsschalen (Asset Administration Shells,
AAS) nach dem Standard der IDTA erstellt, bearbeitet, angezeigt und geteilt.
Die Daten liegen in einer AAS-Infrastruktur (Repositories, Registries und
Discovery), die der Designer anbindet.

## Aufbau der Oberfläche

Das Hauptmenü enthält, je nach Rechten und Edition, folgende Bereiche:

| Menüpunkt | Inhalt |
|---|---|
| Dashboard | Kennzahlen und Wiedereinstieg, siehe [Dashboard](./dashboard.md) |
| Shells | Liste der AAS in der aktuellen Infrastruktur, siehe [AAS verwalten](./aas-verwalten.md) |
| Teilmodelle | Liste der Teilmodelle (Submodels) |
| Konzeptbeschreibungen | Liste der Concept Descriptions, siehe [Konzeptbeschreibungen](./konzeptbeschreibungen.md) |
| Erstellen | Neue AAS anlegen, siehe [AAS anlegen](./aas-anlegen.md) |
| IDTA Submodels | Vorlagen der IDTA für Teilmodelle, siehe [IDTA-Vorlagen](./idta-vorlagen.md) |
| Plugins | Zusätzliche Funktionen, sofern Plugins installiert sind, siehe [Plugins](../betrieb/plugins.md) |
| Mein Bereich | Profil, Stammdaten, [Schnipsel](./schnipsel.md) und [geteilte Links](./geteilte-links.md), siehe [Mein Bereich](./mein-bereich.md) |
| Organisation | Benutzer, Infrastrukturen, Token und Stammdaten der eigenen Organisation (Rolle `ORGA_ADMIN`), siehe [Organisation verwalten](./organisation.md) |
| Systemverwaltung | Systemweite Einstellungen (Rolle `SYSTEM_ADMIN`), siehe [Systemverwaltung](./systemverwaltung.md) |

In der Kopfleiste stehen Sprache, Organisationswechsel, das Handbuch und das
Benutzermenü (Avatar). Im Benutzermenü lassen sich unter anderem der dunkle
Modus und die Schriftgröße umschalten.

## Erste Schritte

Wer neu mit Verwaltungsschalen arbeitet, liest zuerst die
[AAS-Grundlagen](./grundlagen.md); Begriffe stehen im [Glossar](./glossar.md).

1. Im [Dashboard](./dashboard.md) einen Überblick verschaffen.
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
