---
sidebar_position: 3
title: Dashboard
description: Das konfigurierbare Dashboard der Enterprise-Edition mit Seiten, Zeilen und Karten (Widgets) einrichten und nutzen.
stichworte:
  Dashboard: ''
  Widget: verfügbare-karten
  Karte: verfügbare-karten
  Seitenvorlage: startseite-wählen
  Zeilenvorlage: layout-bearbeiten
  Builder: layout-bearbeiten
  Einzelwert: die-seite-übersicht
  PCN Posteingang: die-seite-übersicht
  Startseite nach der Anmeldung: ''
quellen:
  - frontend/libs/designer-user-dashboard-v2/src/lib/user-dashboard-v2.component.html
  - frontend/libs/designer-user-dashboard-v2/src/lib/user-dashboard-v2.component.ts
  - frontend/libs/designer-user-dashboard/src/lib/single-value/single-value.component.html
  - frontend/libs/designer-user-dashboard/src/lib/multiple-values/multiple-values.component.html
  - frontend/libs/designer-user-dashboard/src/lib/edit-single-value/edit-single-value.component.html
  - frontend/libs/designer-user-dashboard/src/lib/operation-widget/operation-widget.component.html
  - frontend/libs/designer-user-dashboard/src/lib/statistics/statistics.component.html
  - frontend/libs/designer-user-dashboard/src/lib/my-last-used-aas/my-last-used-aas.component.html
  - frontend/libs/designer-user-dashboard/src/lib/pcn-inbox/pcn-inbox.component.html
  - frontend/libs/designer-user-dashboard/src/lib/dashboard-widget.ts
  - frontend/apps/aas-designer-enterprise/src/app/app.routes.ts
  - frontend/apps/aas-designer-enterprise/src/app/app.config.ts
  - frontend/apps/aas-designer-enterprise/src/app/dashboard-license.guard.ts
  - frontend/libs/login-enterprise/src/lib/login.component.ts
  - frontend/libs/login-community/src/lib/login.component.ts
  - services/aas-designer/AasDesignerDashboardApi/Controllers/DashboardController.cs
  - frontend/libs/translations/i18n/de.json
---

# Dashboard

Das Dashboard fasst Kennzahlen, zuletzt bearbeitete AAS, ausgewählte Werte
und Hinweise auf einer Seite zusammen. Welche Karten (Widgets) es zeigt, legt
jede Nutzerin und jeder Nutzer selbst fest; das Layout wird je Person
gespeichert.

:::info Nur Enterprise mit Lizenz
Das Dashboard gibt es nur in der Enterprise-Edition und nur, wenn die Lizenz
das konfigurierbare Dashboard enthält. Dann steht **Dashboard** als erster
Eintrag im Hauptmenü, und der Designer öffnet es nach der Anmeldung.

In der Community-Edition und ohne diese Lizenz startet der Designer nach der
Anmeldung mit der Liste der Verwaltungsschalen (**Shells**), siehe
[AAS verwalten](./aas-verwalten.md). Wer das Dashboard ohne Lizenz direkt
aufruft, landet ebenfalls dort; die Systemadministration landet bei der
Lizenzverwaltung.
:::

## Startseite wählen

Solange noch keine Seite eingerichtet ist, zeigt das Dashboard **Seite
auswählen** mit vorbereiteten Seiten. **Auswählen** übernimmt eine davon:

| Seite | Inhalt |
|---|---|
| Übersicht | Kennzahlen, Verlauf und schneller Wiedereinstieg in zuletzt bearbeitete AAS |
| Aktionen | Bearbeitbare Werte und direkte Aktionen |
| Monitoring | Logins, Status und eingehende Änderungen |
| Leere Seite | Startet ohne Karten direkt im Bearbeitungsmodus |

![Auswahl der Dashboard-Seite](/img/designer/dashboard-seite-waehlen.png)

Die Vorlagen enthalten nur Karten, die man nach den eigenen Rollen sehen darf
(siehe [Verfügbare Karten](#verfügbare-karten)). Weitere Seiten lassen sich
später im Bearbeitungsmodus hinzufügen. Gibt es mehrere Seiten, wechselt man
über die Reiter oben zwischen ihnen.

## Die Seite „Übersicht“

![Dashboard mit der Seite Übersicht](/img/designer/dashboard-uebersicht.png)

Die Vorlage **Übersicht** enthält zwei Zeilen:

- **Statistiken**: zeigt die Anzahl der **Integrierten Teilmodelle**.
- **Einzelwert**: zeigt einen ausgewählten Wert aus einer AAS, z. B. einen
  Zählerstand. AAS und Feld werden im Bearbeitungsmodus festgelegt.
- **Zuletzt bearbeitete AAS**: die zuletzt geänderten AAS mit Datum. Der Stift
  öffnet die AAS direkt im [Editor](./editor.md).
- **Logins der eigenen Organisation**: Anzahl der Anmeldungen pro Stunde,
  ohne Namen.
- **PCN Posteingang**: eingegangene Änderungsmitteilungen (Product Change
  Notifications), siehe [Änderungsmitteilungen (PCN)](./pcn.md). Das Menü
  einer Mitteilung bietet **Anzeigen** und **Löschen**.

Jede Karte lädt ihren Inhalt in dem Abstand neu, der rechts oben auf der
Karte steht (in Sekunden); ohne Angabe lädt sie nur beim Öffnen. Das gilt auch
für **Statistiken**, die Login-Karten, **Zuletzt bearbeitete AAS** und den
**PCN Posteingang**. **Aktualisieren** oben rechts lädt alle Karten der
angezeigten Seite sofort neu.

Hat die Seite selbst einen Wert unter **Aktualisieren (s)**, lädt sie
zusätzlich in diesem Abstand alle ihre Karten neu, auch solche ohne eigenen
Abstand. Im Bearbeitungsmodus ruht jede automatische Aktualisierung.

## Verfügbare Karten

| Karte | Gruppe | Inhalt |
|---|---|---|
| Einzelwert | Kennzahlen | Ein Wert aus einer AAS |
| Mehrere Werte | Kennzahlen | Mehrere zusammengehörige Werte aus einer AAS in einer Karte |
| Statistiken | Kennzahlen | Anzahl der integrierten Teilmodelle |
| Einzelwert bearbeiten | Aktionen | Ein Wert aus einer AAS, der sich direkt auf dem Dashboard ändern und speichern lässt |
| Mehrere Werte bearbeiten | Aktionen | Mehrere Werte einer AAS gemeinsam bearbeiten |
| Operation | Aktionen | Führt eine Operation einer AAS mit **Aufrufen** direkt aus |
| Zuletzt bearbeitete AAS | Listen | Schneller Wiedereinstieg in zuletzt verwendete AAS |
| Logins der eigenen Organisation | Aktivität | Login-Aktivität der aktuellen Organisation |
| Logins des Gesamtsystems | Aktivität | Login-Aktivität über das gesamte System |
| PCN Posteingang | Aktivität | Eingegangene Änderungsmitteilungen |

:::note Rollen
**Logins der eigenen Organisation** steht nur der Organisationsadministration
zur Verfügung, **Logins des Gesamtsystems** nur der Systemadministration.
Anderen Personen bietet der Builder diese Karten nicht an.
:::

Karten mit AAS-Werten werden in der Karte selbst eingerichtet, solange der
Bearbeitungsmodus aktiv ist:

1. In der Karte die AAS wählen (bei **Operation** wahlweise auch über eine
   Instanz).
2. Danach das Feld bzw. die Felder oder die Operation festlegen.
3. Mit **Layout speichern** übernehmen.

## Layout bearbeiten

**Layout bearbeiten** schaltet in den Bearbeitungsmodus:

![Dashboard im Bearbeitungsmodus](/img/designer/dashboard-layout-bearbeiten.png)

- Die Seite ist in **Zeilen** gegliedert. **Zeile einfügen** ergänzt eine
  neue Zeile. Die Symbole an einer Zeile verschieben sie nach oben oder
  unten, fügen eine Karte hinzu oder löschen die Zeile.
- An jeder Karte stehen Symbole zum Bearbeiten, Löschen und Verschieben nach
  links oder rechts.
- Eine Zeile ist 12 Einheiten breit. Ist sie breiter, erscheint ein Hinweis;
  eine Bewertung wie **Ausgewogen**, **Luft nach rechts** oder **Sehr dicht**
  hilft beim Aufteilen.

Rechts steht der **Builder**. Er zeigt, was zur gerade gewählten Stelle
passt:

| Auswahl | Was der Builder anbietet |
|---|---|
| Seite | **Titel**, **Beschreibung**, **Icon** und **Aktualisieren (s)** der Seite; unter **Schnelle Seitenvorlagen** eine weitere vorbereitete Seite hinzufügen; **Löschen** entfernt die Seite |
| Zeile | Unter **Schnelle Zeilenvorlagen** eine vorbereitete Zeile einfügen (**Fokus**, **Zwei Spalten**, **Kennzahlenleiste**, **Analyse + Detail**); darunter alle Karten nach Gruppen zum Hinzufügen |
| Karte | **Titel**, **Typ**, **Breite** (Viertel bis Voll), **Visueller Stil**, **Icon** und **Aktualisieren (s)**; Hinweise zur empfohlenen Breite und Anzahl je Zeile; **Löschen** entfernt die Karte |

**Layout speichern** übernimmt die Änderungen, **Abbrechen** verwirft sie.
