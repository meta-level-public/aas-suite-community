---
sidebar_position: 21
title: Systemverwaltung
---

# Systemverwaltung

Die **Systemverwaltung** im Hauptmenü enthält die Einstellungen, die für die
ganze Installation gelten. Sie ist nur mit der Rolle `SYSTEM_ADMIN` sichtbar,
siehe [Rollen und Rechte](./rollen-und-rechte.md). Links steht die
Navigation, rechts die jeweilige Einstellung.

![Systemverwaltung](/img/designer/system-templates.png)

| Eintrag | Inhalt |
|---|---|
| Templateverwaltung | Teilmodell-Vorlagen, die im Editor zur Auswahl stehen |
| Cors Konfiguration | Web-Adressen, die direkt aus dem Browser auf die Schnittstellen zugreifen dürfen |
| Mail-Einstellungen | Mailserver für die Mails des Designers und für Passwort-Mails |
| News-Verwaltung | Neuigkeiten für Benutzer und für die Anmeldeseite |
| Rechtslinks | Datenschutz, AGB, AVV und Impressum |
| Hilfetexte | Globale Feldhilfen exportieren und einspielen |
| Job-Konfiguration | Hintergrundaufgaben ein- und ausschalten, Intervalle festlegen |

Teilen sich mehrere Organisationen eine Installation (mandantenfähiger
Betrieb), kommen weitere Einträge hinzu, siehe
[Mandantenfähiger Betrieb](#mandantenfähiger-betrieb).

## Templateverwaltung

Die Teilmodell-Vorlagen dieser Liste stehen im Editor zur Auswahl, wenn man
ein Teilmodell einfügt, siehe
[Teilmodell aus einer Vorlage einfügen](./editor.md). Die Tabelle zeigt Name,
Label, Version, Dateiname und Semantic IDs jeder Vorlage.

- **Hinzufügen**: eine Vorlage als `.aasx`-Datei hochladen und Name, Label,
  Gruppe (IDTA, VDMA oder Sonstige) und Semantic IDs angeben.
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

**Hinzufügen** öffnet einen Dialog für die Adresse (Origin, z. B.
`https://shop.example.com`) und eine interne Beschreibung. Die Adresse muss
genau mit dem Origin der anfragenden Seite übereinstimmen: Protokoll, Host
und gegebenenfalls Port, ohne Pfad. Der Eintrag `*` erlaubt alle Adressen
und ist nur für Tests gedacht.

## Mail-Einstellungen

Die Seite hat zwei Abschnitte. **Speichern** übernimmt beide.

**Anwendungs-Mails** sind die Mails, die der Designer selbst verschickt,
z. B. Einladungen und Benachrichtigungen:

- SMTP-Server, Port, Sender-Adresse, Benutzername und Passwort,
- ob der Server eine Anmeldung, SSL oder TLS verlangt,
- eine Benachrichtigungsadresse für neue Organisationen und ein
  Betreff-Präfix, z. B. um Mails einer Testumgebung zu kennzeichnen.

Mit **Testmail senden** an eine Testadresse lässt sich die Einstellung prüfen.

Gespeicherte Passwörter werden aus Sicherheitsgründen nicht angezeigt. Das
Passwortfeld zeigt dann den Hinweis **Passwort hinterlegt**. Bleibt das Feld
leer, gilt beim Speichern und bei Testmails das bisherige Passwort weiter;
ein eingetragenes Passwort ersetzt es. Das gilt für beide Abschnitte.

**Keycloak Passwort-Reset-Mails** betrifft die Mails der Anmeldung, etwa zum
Zurücksetzen des Passworts. Die Werte werden direkt in Keycloak gespeichert.
**Keycloak-Testmail senden** speichert die eingegebenen Werte vorher in
Keycloak und schickt dann eine Mail zum Zurücksetzen des Passworts an einen
vorhandenen Benutzer. Ist Keycloak nicht angebunden, weist die Seite darauf
hin.

## News-Verwaltung

News sind kurze Mitteilungen an die Benutzer, z. B. zu neuen Funktionen oder
geplanten Wartungen.

![News-Verwaltung](/img/designer/system-news.png)

**News anlegen** öffnet den Editor mit Datum, Titel, formatiertem Inhalt und
zwei Optionen:

- **Sichtbar**: Die News erscheint angemeldeten Benutzern. Ungelesene News
  öffnen sich nach der Anmeldung automatisch; danach sind sie über das
  Benutzermenü › **News** erreichbar.
- **Öffentlich**: Die News erscheint zusätzlich auf der Anmeldeseite, also
  auch für Personen ohne Konto.

In der Liste lässt sich jede News bearbeiten, anzeigen und ausblenden.

## Rechtslinks

Hier werden die Links auf **Datenschutz**, **AGB** und **AVV** (jeweils
Deutsch und Englisch) sowie das **Impressum** festgelegt. Für jeden Eintrag
lässt sich wählen, ob er auf eine **URL** verweist oder ein hochgeladenes
**Dokument** (z. B. PDF) öffnet. Leere Felder verwenden die Werte aus der
Konfiguration der Installation.

Die Links erscheinen im Benutzermenü, in der Fußzeile der Anmeldeseite, des
öffentlichen Viewers und der Registrierung sowie im Markt. Hochgeladene
Dokumente sind ohne Anmeldung abrufbar.

## Hilfetexte

Die globalen [Feldhilfen](./feldhilfen.md) lassen sich als Datei
herunterladen und in eine andere Installation einspielen, z. B. von einer
Test- in die Produktivumgebung. Die Seite zeigt, wie viele Texte vorhanden
sind.

- **Aktuelle Hilfetexte herunterladen** speichert alle globalen Texte in der
  Datei `export-help-text.zip`.
- **Neue Hilfetexte einspielen** lädt eine solche Datei (bis 1 MB).

:::warning
Beim Einspielen werden **alle globalen Hilfetexte ersetzt**. Texte, die nur
in dieser Installation gepflegt wurden, gehen verloren. Vorher die aktuellen
Texte herunterladen. Die Hilfetexte der Organisationen bleiben unverändert.
:::

## Job-Konfiguration

Jobs sind Aufgaben, die der Designer regelmäßig im Hintergrund ausführt. Für
jeden Job lässt sich einstellen, ob er **aktiv** ist und in welchem
**Ausführungsintervall** (in Minuten) er läuft. Änderungen gelten nach
wenigen Minuten, ohne Neustart.

![Job-Konfiguration](/img/designer/system-jobs.png)

| Job | Aufgabe | Standardintervall |
|---|---|---|
| Statistik-Berechnung | Zahlen für das [Dashboard](./dashboard.md): Uploads, Registrierungen und Veröffentlichungen je Organisation | 10 Minuten |
| Tägliche Statistik-Berechnung | Werte des Vortags für das Dashboard | täglich |
| IDTA Crawler | Lädt die aktuellen Teilmodell-Vorlagen aus dem IDTA-Repository auf GitHub | 60 Minuten |
| PCN Update Listener | Empfängt Änderungsmitteilungen (PCN) für abonnierte Produkte | 1 Minute |

Ein deaktivierter Job wird übersprungen. Ist z. B. der IDTA Crawler
abgeschaltet, bietet der Editor keine neuen IDTA-Vorlagen an.

## Mandantenfähiger Betrieb

Wird eine Installation von mehreren Organisationen genutzt, enthält die
Systemverwaltung zusätzlich:

| Eintrag | Inhalt |
|---|---|
| Organisationen | Alle Organisationen anlegen, bearbeiten, aktivieren, deaktivieren und löschen; Export als CSV |
| Bezahlmodelle | Pakete mit Preis, Benutzerzahl und Intervall, die Organisationen zugewiesen werden |
| Infrastrukturstatus | Zustand der internen AAS-Server aller Organisationen; Container starten, stoppen und neu erstellen |
| Verwaiste Infrastrukturen | Interne Infrastrukturen, deren Organisation nicht mehr existiert |
| Verwaiste Container | Container ohne zugehörige Infrastruktur |
| Angebotsanfragen | Anfragen aus dem Kontaktformular |

Eine gelöschte Organisation wird zunächst nur als gelöscht markiert. Der Job
**Organisationen löschen** entfernt sie später samt Benutzern endgültig; der
Job **Infrastrukturen löschen** räumt danach ihre Server ab. Weitere Jobs
prüfen, ob Bezahlmodelle abgelaufen sind, und verschicken Erinnerungen.
