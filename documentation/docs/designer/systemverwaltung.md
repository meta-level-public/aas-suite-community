---
sidebar_position: 21
title: Systemverwaltung
description: Einstellungen für die ganze Installation – Vorlagen, CORS, Mails, News, Rechtslinks, Hilfetexte und Hintergrund-Jobs.
stichworte:
  Löschprotokoll: löschprotokoll
  Systemverwaltung: ''
  Templateverwaltung: templateverwaltung
  Teilmodell-Vorlagen: templateverwaltung
  CORS: cors-konfiguration
  Mailserver: mail-einstellungen
  Testmail: mail-einstellungen
  News: news-verwaltung
  Rechtslinks: rechtslinks
  Impressum: rechtslinks
  Jobs: job-konfiguration
  Mandantenfähiger Betrieb: mandantenfähiger-betrieb
quellen:
  - frontend/libs/designer-app-menu/src/lib/app-menu/app.menu.component.ts
  - frontend/libs/aas-designer-core/src/lib/system-management/system-management.routes.ts
  - frontend/libs/aas-designer-core/src/lib/system-management/system-management/system-management.component.ts
  - frontend/libs/aas-designer-core/src/lib/submodel-template/template-list/template-list.component.html
  - frontend/libs/aas-designer-core/src/lib/submodel-template/template-list/template-list.component.ts
  - frontend/libs/common-modules/src/lib/cors-config/cors-list/cors-list.component.html
  - frontend/libs/aas-designer-core/src/lib/system-management/mail-settings/mail-settings.component.html
  - frontend/libs/aas-designer-core/src/lib/system-management/news-management/news-management.component.html
  - frontend/libs/aas-designer-core/src/lib/system-management/news-management/news-management-editor.component.html
  - frontend/libs/aas-designer-core/src/lib/system-management/legal-links-settings/legal-links-settings.component.html
  - frontend/libs/aas-designer-core/src/lib/system-management/legal-links-settings/legal-links-settings.component.ts
  - frontend/libs/aas-designer-core/src/lib/system-management/help-text-management/help-text-management.component.html
  - frontend/libs/aas-designer-core/src/lib/system-management/job-settings/job-settings-form.component.html
  - frontend/libs/aas-designer-core/src/lib/system-management/job-settings/jobs/statistic-calculator-settings.component.ts
  - frontend/libs/aas-designer-core/src/lib/system-management/job-settings/jobs/pcn-update-listener-settings.component.ts
  - frontend/libs/aas-designer-core/src/lib/system-management/infrastructure-status/infrastructure-status.component.html
  - frontend/libs/aas-designer-core/src/lib/administration/administration.component.html
  - frontend/libs/designer-enterprise-theme/src/lib/system-management-addon.ts
  - frontend/libs/aas-designer-enterprise-license/src/lib/system-management-addon.ts
  - frontend/apps/aas-designer-enterprise/src/app/app.config.ts
  - frontend/libs/translations/i18n/de.json
  - frontend/libs/aas-designer-enterprise-license/src/lib/delete-protocol/delete-protocol.component.html
  - frontend/libs/aas-designer-enterprise-license/src/lib/system-management-addon.ts
  - services/aas-designer/AasDesignerApi/Cors/CorsService.cs
  - services/aas-designer/AasDesignerApi/Jobs/StatisticCalculatorSettingsStore.cs
  - services/aas-designer/AasDesignerApi/Jobs/DailyStatisticCalculatorSettingsStore.cs
  - services/aas-designer/AasDesignerApi/Jobs/DailyExpiredOrganisationsCheckerSettingsStore.cs
  - services/aas-designer/AasDesignerApi/Jobs/DailyExpiredOrganisationsChecker.cs
  - services/aas-designer/AasDesignerApi/Jobs/PeriodicOrganisationDeleterSettingsStore.cs
  - services/aas-designer/AasDesignerApi/Jobs/PeriodicInfrastructureDeleterSettingsStore.cs
  - services/aas-designer/AasDesignerApi/Jobs/IdtaCrawlerSettingsStore.cs
  - services/aas-designer/AasDesignerApi/Jobs/PcnUpdateListenerSettingsStore.cs
  - services/aas-designer/AasDesignerSystemManagementApi/SystemManagement/Command/ImportHelpTexts/ImportHelpTextsCommand.cs
---

# Systemverwaltung

Die **Systemverwaltung** im Hauptmenü enthält die Einstellungen, die für die
ganze Installation gelten. Sie ist nur mit der Rolle **Systemadministration** sichtbar,
siehe [Rollen und Rechte](./rollen-und-rechte.md). Links steht die
Navigation, rechts die jeweilige Einstellung. Beim Öffnen zeigt die Seite die
**Templateverwaltung**.

![Systemverwaltung](/img/designer/system-templates.png)

| Eintrag | Inhalt |
|---|---|
| Templateverwaltung | Teilmodell-Vorlagen, die im Editor zur Auswahl stehen |
| Cors Konfiguration | Web-Adressen, die direkt aus dem Browser auf die Schnittstellen zugreifen dürfen |
| Mail-Einstellungen | Mailserver für die Mails des Designers und für Passwort-Mails |
| News-Verwaltung | Neuigkeiten für Benutzer und für die Anmeldeseite |
| Rechtslinks | Datenschutz, AGB, AVV und Impressum |
| Hilfetexte | Globale Feldhilfen exportieren und einspielen |
| Job-Konfiguration | Hintergrundaufgaben ein- und ausschalten, Intervalle festlegen; je Job ein Unterpunkt |

Teilen sich mehrere Organisationen eine Installation (mandantenfähiger
Betrieb), kommen weitere Einträge hinzu, siehe
[Mandantenfähiger Betrieb](#mandantenfähiger-betrieb).

:::info Enterprise
In der Enterprise-Edition kann die Navigation zusätzlich enthalten:
**Lizenz** (wenn die Installation mit Lizenzen arbeitet),
**Theme-Konfigurator** (wenn ein Standard-Theme konfiguriert ist),
**Löschprotokoll** (im mandantenfähigen Betrieb) und unter
**Job-Konfiguration** den Job **Mehrfach-Freigaben Konfiguration** für den
Markt.
:::

## Templateverwaltung

Die Teilmodell-Vorlagen dieser Liste stehen im Editor zur Auswahl, wenn man
ein Teilmodell einfügt, siehe
[Teilmodell einfügen](./editor.md#teilmodell-einfügen). Die Tabelle zeigt
**Name**, **Label**, **Version**, **Dateiname**, Semantic IDs sowie Anlage-
und Änderungsdatum jeder Vorlage. **Aktualisieren** lädt die Liste neu.

- **Hinzufügen**: eine Vorlage als `.aasx`-Datei hochladen und **Name**,
  **Label**, **Gruppe** (`IDTA`, `VDMA` oder `OTHER`) und Semantic IDs (eine
  pro Zeile) angeben.
- **Mehrfachimport**: mehrere `.aasx`-Dateien auf einmal mit gemeinsamer
  Version und Gruppe hochladen.
- Über das Menü ⋮ einer Zeile: **Bearbeiten**, **Herunterladen** und
  **Löschen**. Eine gelöschte Vorlage kann niemand mehr einfügen; bereits
  eingefügte Teilmodelle bleiben erhalten.

Zusätzlich zu dieser Liste bietet der Editor die aktuellen Vorlagen aus dem
IDTA-Repository an. Diese hält der Job **IDTA Crawler** aktuell, siehe
[Job-Konfiguration](#job-konfiguration).

## Cors Konfiguration

Greift eine Webanwendung auf einer anderen Domain direkt aus dem Browser auf
die Schnittstellen des Designers zu, z. B. eingebettete Web Components oder
ein eigener Feeder, muss ihre Adresse hier eingetragen sein. Sonst blockiert
der Browser die Anfragen.

![Cors Konfiguration](/img/designer/system-cors.png)

1. **Hinzufügen** wählen.
2. Unter **Cors String** die Adresse (Origin) eintragen, z. B.
   `https://shop.demo-pumpen.example`.
3. Unter **Interne Beschreibung** notieren, wofür der Eintrag gedacht ist.
4. **Speichern** wählen.

Die Adresse muss genau mit dem Origin der anfragenden Seite übereinstimmen:
Protokoll, Host und gegebenenfalls Port, ohne Pfad. Der Eintrag `*` erlaubt
alle Adressen und ist nur für Tests gedacht. Über das Menü ⋮ einer Zeile
lässt sich ein Eintrag **Bearbeiten** oder **Löschen**.

## Mail-Einstellungen

Die Seite hat zwei Abschnitte. **Speichern** übernimmt beide.

![Mail-Einstellungen mit den Abschnitten Anwendungs-Mails und Keycloak Passwort-Reset-Mails](/img/designer/system-mail.png)

**Anwendungs-Mails** sind die Mails, die der Designer selbst verschickt,
z. B. Einladungen und Benachrichtigungen:

- **SMTP-Server**, **SMTP-Port**, **Sender-Adresse**,
  **Sender-Benutzername** und **Passwort**,
- **SMTP benötigt Authentifizierung**, **SMTP SSL verwenden** und
  **SMTP TLS verwenden**,
- **Benachrichtigungsadresse für neue Organisationen** und
  **Betreff-Präfix**, z. B. um Mails einer Testumgebung zu kennzeichnen.

Mit **Testmail senden** an die Adresse unter **Test-Empfänger** lässt sich die
Einstellung prüfen.

Gespeicherte Passwörter werden aus Sicherheitsgründen nicht angezeigt. Das
Passwortfeld zeigt dann den Hinweis **Passwort hinterlegt – leer lassen, um es
zu behalten**. Bleibt das Feld leer, gilt beim Speichern und bei Testmails das
bisherige Passwort weiter; ein eingetragenes Passwort ersetzt es. Das gilt für
beide Abschnitte.

**Keycloak Passwort-Reset-Mails** betrifft die Mails der Anmeldung, etwa zum
Zurücksetzen des Passworts. Neben Server, Port, Benutzername und Passwort
gibt es hier **Absenderadresse**, **Absendername**, **Antwortadresse** und
**Antwortname** sowie die Schalter **Keycloak SMTP-Authentifizierung**,
**Keycloak SMTP StartTLS** und **Keycloak SMTP SSL**. Die Werte werden direkt
in Keycloak gespeichert. **Keycloak-Testmail senden** speichert die
eingegebenen Werte vorher in Keycloak und schickt dann eine Mail zum
Zurücksetzen des Passworts an einen vorhandenen Benutzer. Ist Keycloak nicht
angebunden oder nicht erreichbar, weist die Seite darauf hin.

## News-Verwaltung

News sind kurze Mitteilungen an die Benutzer, z. B. zu neuen Funktionen oder
geplanten Wartungen.

![News-Verwaltung](/img/designer/system-news.png)

1. **News anlegen** wählen.
2. **Datum**, **Titel** und den formatierten **Inhalt** eingeben.
3. Die Optionen setzen:
   - **sichtbar**: Die News erscheint angemeldeten Benutzern. Ungelesene News
     öffnen sich nach der Anmeldung automatisch; danach sind sie über das
     Benutzermenü › **News** erreichbar.
   - **Öffentlich**: Die News erscheint zusätzlich auf der Anmeldeseite,
     also auch für Personen ohne Konto.
4. **Speichern** wählen.

Die Liste zeigt je News **Datum**, **Titel**, ob sie **Öffentlich** ist und
ihre **Sichtbarkeit**. **Bearbeiten** öffnet den Editor erneut,
**Ausblenden** bzw. **Anzeigen** schaltet die Sichtbarkeit direkt um.

## Rechtslinks

Hier werden die Links auf **Datenschutz**, **AGB** und **AVV** (jeweils
Deutsch und Englisch) sowie das **Impressum** festgelegt. Die Schaltfläche
neben jedem Eintrag wechselt zwischen einer **URL** und einem hochgeladenen
Dokument (z. B. PDF). Ein Dokument wird über **Dokument auswählen**
hochgeladen, über **Anderes Dokument** ersetzt und über **Dokument entfernen**
entfernt. **Speichern** übernimmt alle Einträge. Leere Felder verwenden die
Werte aus der Konfiguration der Installation.

![Rechtslinks mit je einer URL für Datenschutz, AGB, AVV und Impressum](/img/designer/system-rechtslinks.png)

Die Links erscheinen im Benutzermenü, in der Fußzeile der Anmeldeseite, des
öffentlichen Viewers und der Registrierung sowie im Markt. Hochgeladene
Dokumente sind ohne Anmeldung abrufbar.

## Hilfetexte

Die globalen [Feldhilfen](./feldhilfen.md) lassen sich als Datei
herunterladen und in eine andere Installation einspielen, z. B. von einer
Test- in die Produktivumgebung. Die Seite zeigt unter **Anzahl**, wie viele
Texte vorhanden sind.

- **Aktuelle Hilfetexte herunterladen** speichert alle globalen Texte in der
  Datei `export-help-text.zip`.
- **Neue Hilfetexte einspielen**:
  1. Die Schaltfläche wählen.
  2. Eine solche `.zip`-Datei (bis 1 MB) hineinziehen oder auswählen.
  3. **Speichern** wählen.

:::warning
Beim Einspielen werden **alle globalen Hilfetexte ersetzt**. Texte, die nur
in dieser Installation gepflegt wurden, gehen verloren. Vorher die aktuellen
Texte herunterladen. Die Hilfetexte der Organisationen bleiben unverändert.
:::

## Job-Konfiguration

Jobs sind Aufgaben, die der Designer regelmäßig im Hintergrund ausführt.
**Job-Konfiguration** klappt in der Navigation die Liste der Jobs auf; jeder
Job hat eine eigene Seite.

![Job-Konfiguration](/img/designer/system-jobs.png)

1. Unter **Job-Konfiguration** den Job wählen.
2. **Job aktiv** ein- oder ausschalten. Ein deaktivierter Job wird
   übersprungen.
3. Das **Ausführungsintervall** in Minuten eintragen.
4. **Speichern** wählen.

Änderungen gelten spätestens nach einer Minute, ohne Neustart.

| Job | Aufgabe | Standardintervall | Höchstes Intervall |
|---|---|---|---|
| Statistik-Berechnung | Zahlen für das [Dashboard](./dashboard.md): Uploads, Registrierungen und Veröffentlichungen je Organisation | 10 Minuten | 1 Tag |
| Tägliche Statistik-Berechnung | Werte des Vortags für das Dashboard | 1 Tag | 1 Woche |
| IDTA Crawler | Lädt die aktuellen Teilmodell-Vorlagen aus dem IDTA-Repository auf GitHub | 60 Minuten | 1 Woche |
| PCN Update Listener | Empfängt Änderungsmitteilungen (PCN) für abonnierte Produkte | 1 Minute | 1 Tag |

Ist z. B. der IDTA Crawler abgeschaltet, bietet der Editor keine neuen
IDTA-Vorlagen an.

## Mandantenfähiger Betrieb

Wird eine Installation von mehreren Organisationen genutzt, enthält die
Systemverwaltung zusätzlich:

| Eintrag | Inhalt |
|---|---|
| Bezahlmodelle | Pakete mit Preis, Benutzerzahl und Intervall, die Organisationen zugewiesen werden |
| Organisationen | Alle Organisationen anlegen, bearbeiten, aktivieren, deaktivieren und löschen; Export als CSV |
| Infrastrukturstatus | Zustand der internen AAS-Server aller Organisationen; Container starten, stoppen und neu erstellen, DPP-APIs nachrüsten oder reparieren |
| Verwaiste Infrastrukturen | Interne Infrastrukturen, deren Organisation nicht mehr existiert |
| Verwaiste Container | Container ohne zugehörige Infrastruktur |
| Angebotsanfragen | Anfragen aus dem Kontaktformular |

Unter **Job-Konfiguration** kommen drei Jobs hinzu:

| Job | Aufgabe | Standardintervall |
|---|---|---|
| Abgelaufene Organisationen prüfen | Prüft die Bezahlmodelle der Organisationen, verschickt Erinnerungen vor und nach dem Ablauf und markiert Organisationen ohne gültiges Bezahlmodell schließlich zum Löschen | 1 Tag |
| Organisationen löschen | Entfernt zum Löschen markierte Organisationen samt Benutzern endgültig | 60 Minuten |
| Infrastrukturen löschen | Räumt danach die Server gelöschter Organisationen ab | 60 Minuten |

Eine gelöschte Organisation wird zunächst nur als gelöscht markiert. Erst die
Jobs **Organisationen löschen** und **Infrastrukturen löschen** entfernen sie
endgültig.

### Löschprotokoll

:::info Enterprise
Das **Löschprotokoll** gibt es nur in der Enterprise-Edition und nur im
mandantenfähigen Betrieb.
:::

Das Löschprotokoll listet systemweit, was gelöscht wurde. Die Reiter
**Organisationen**, **Benutzerkonten** und **Infrastrukturen** zeigen je
Eintrag **Datum**, die betroffene Organisation bzw. das Konto (z. B.
**Name** oder **E-Mail**) und **Erstellt von**; Einträge anderer Art stehen
unter **Weitere Einträge**. Die Listen sind nach Datum sortiert, neueste
zuerst, und lassen sich seitenweise durchblättern. **Rohdaten** zeigt den
vollständigen protokollierten Datensatz, **Aktualisieren** holt den
aktuellen Stand.

