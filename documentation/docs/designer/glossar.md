---
sidebar_position: 24
title: Glossar
description: Kurze Erklärungen der Fachbegriffe rund um Verwaltungsschalen und den AAS Designer.
stichworte:
  Glossar: ''
  Begriffe: ''
  Fachbegriffe: ''
quellen:
  - frontend/libs/translations/i18n/de.json
  - frontend/libs/designer-app-menu/src/lib/app-menu/app.menu.component.ts
  - frontend/libs/aas-designer-core/src/lib/organisation/infrastructure/infrastructure-add/infrastructure-add.component.html
  - frontend/libs/aas-designer-core/src/lib/system-management/system-management/system-management.component.ts
  - frontend/apps/aas-designer-enterprise/src/app/app.config.ts
---

# Glossar

Ausführlicher erklärt sind die wichtigsten Begriffe unter
[AAS-Grundlagen](./grundlagen.md).

| Begriff | Bedeutung |
|---|---|
| **AAS (Asset Administration Shell, Verwaltungsschale)** | Digitaler Zwilling eines Assets nach dem Standard der IDTA (IEC 63278). |
| **AAS-ID** | Weltweit eindeutige Kennung einer Verwaltungsschale. |
| **AAS-Infrastruktur** | Die Dienste, in denen AAS gespeichert und gefunden werden: Repositories, Registries und Discovery. |
| **AASX** | Paketformat für den Austausch von AAS einschließlich angehängter Dateien, siehe [Import und Export](./import-export.md). |
| **API-Schlüssel (Token)** | Schlüssel, mit dem externe Systeme ohne Anmeldung auf eine Infrastruktur zugreifen, siehe [Organisation verwalten](./organisation.md#token). |
| **Art des Asset (Asset Kind)** | Gibt an, ob eine AAS einen **Typ** oder eine **Instanz** beschreibt, siehe [Typ und Instanz](./typ-und-instanz.md). |
| **Asset** | Der Gegenstand, den eine AAS beschreibt, z. B. ein Gerät, eine Maschine oder eine Software. |
| **Asset-ID (Globale Asset-ID)** | Weltweit eindeutige Kennung des Assets. |
| **Benutzerplatz** | Platz für ein Mitglied einer Organisation. Sind alle belegt, lassen sich keine weiteren Benutzer einladen, siehe [Organisation verwalten](./organisation.md#benutzer). |
| **Concept Description (CD, Konzeptbeschreibung)** | Definition eines Merkmals mit Name, Definition, Einheit und Datentyp, siehe [Konzeptbeschreibungen](./konzeptbeschreibungen.md). |
| **Constraint** | Regel der AAS-Spezifikation, z. B. `AASd-022`. Verletzungen meldet die [Validierung](./validierung.md). |
| **CORS** | Browser-Regel, welche fremden Web-Adressen auf die Schnittstellen zugreifen dürfen, siehe [Systemverwaltung](./systemverwaltung.md#cors-konfiguration). |
| **Dashboard** | Startseite mit frei zusammenstellbaren Karten (Widgets); nur in der Enterprise-Edition mit passender Lizenz, siehe [Dashboard](./dashboard.md). |
| **Digital Nameplate (digitales Typenschild)** | Teilmodell der IDTA mit den Herstellerangaben eines Produkts. |
| **Discovery** | Dienst, der zu einer Asset-ID die passende AAS findet. |
| **DPP (Digitaler Produktpass)** | Öffentlich abrufbare Produktinformationen, die aus einer AAS erzeugt werden, siehe [Digitaler Produktpass](./dpp.md). |
| **ECLASS** | Verbreiteter Merkmalkatalog. Viele Semantic IDs verweisen auf ECLASS-Merkmale, z. B. `0173-1#02-AAO677#004`. |
| **Einladung** | E-Mail mit einem Link, über den eine Person ihr Konto anlegt und einer Organisation beitritt; gilt 14 Tage, siehe [Organisation verwalten](./organisation.md#benutzer-einladen). |
| **Entity** | Element, das einen Bestandteil beschreibt, z. B. in einer Stückliste; kann auf die AAS dieses Bestandteils verweisen. |
| **Externe Infrastruktur** | Eigene AAS-Server, die mit dem Designer verbunden werden, siehe [Organisation verwalten](./organisation.md#infrastruktur-hinzufügen). |
| **Geteilter Link** | Öffentlicher Link auf eine AAS für Personen ohne Zugang zum Designer, siehe [Geteilte Links](./geteilte-links.md). |
| **Health Check** | Regelmäßige Prüfung, ob ein Dienst einer Infrastruktur erreichbar ist; das Ergebnis zeigt ein farbiger Punkt auf der Detailseite der Infrastruktur. |
| **idShort** | Kurzer, lesbarer Name eines Elements; innerhalb seiner Ebene eindeutig. |
| **IDTA (Industrial Digital Twin Association)** | Verband, der den AAS-Standard und die Vorlagen für Teilmodelle pflegt, siehe [IDTA-Vorlagen](./idta-vorlagen.md). |
| **Infrastruktur-Rechte** | Je AAS-Infrastruktur vergebene Rechte Lesen, Schreiben und Marktplatz veröffentlichen, siehe [Rollen und Rechte](./rollen-und-rechte.md). |
| **Interne Infrastruktur** | AAS-Infrastruktur, die die AAS Suite selbst für eine Organisation bereitstellt. |
| **IRI-Präfix** | Anfang der Kennungen, die der Designer für die eigene Organisation erzeugt, z. B. `https://example.com/ids/`; festgelegt in den [Organisationsdetails](./organisation.md#organisationsdetails). |
| **Job** | Aufgabe, die der Designer regelmäßig im Hintergrund ausführt, z. B. der IDTA Crawler, siehe [Systemverwaltung](./systemverwaltung.md#job-konfiguration). |
| **Mandantenfähiger Betrieb** | Eine Installation, die sich mehrere Organisationen teilen; die Systemverwaltung enthält dann weitere Einträge, siehe [Systemverwaltung](./systemverwaltung.md#mandantenfähiger-betrieb). |
| **MLP (Multi Language Property)** | Eigenschaft mit einem Text in mehreren Sprachen. |
| **Nur-Lesen** | Einstellung einer Infrastruktur, deren Inhalte sich ansehen, aber nicht ändern lassen. |
| **PCN (Product Change Notification)** | Mitteilung eines Herstellers über Änderungen an einem Produkt, siehe [Änderungsmitteilungen (PCN)](./pcn.md). |
| **Plugin** | Zusätzliche Funktion, die der Betrieb in eine Installation einbindet; erscheint im Hauptmenü unter **Plugins**, siehe [Plugins](../betrieb/plugins.md). |
| **Property (Prop)** | Element mit einem einzelnen Wert und Datentyp. |
| **Registry** | Verzeichnis, unter welcher Adresse eine AAS oder ein Teilmodell erreichbar ist. |
| **Repository** | Dienst, der AAS, Teilmodelle oder Konzeptbeschreibungen speichert. |
| **Rolle** | Berechtigung eines Benutzers in einer Organisation, z. B. **Organisationsadministration**, siehe [Rollen und Rechte](./rollen-und-rechte.md). |
| **Schnipsel** | Gespeicherter Baustein zum Wiederverwenden, siehe [Schnipsel](./schnipsel.md). |
| **Semantic ID** | Verweis eines Elements auf seine Bedeutung, meist auf eine Konzeptbeschreibung oder ein ECLASS-Merkmal. |
| **SMC (Submodel Element Collection)** | Gruppe zusammengehöriger Elemente. |
| **SML (Submodel Element List)** | Liste gleichartiger Elemente. |
| **Submodel (Teilmodell)** | Thematischer Teil einer AAS, z. B. Typenschild oder technische Daten. |
| **Teilmodell-Vorlage (Submodel Template)** | Von der IDTA standardisierter Aufbau eines Teilmodells. |
| **Widget** | Karte auf dem [Dashboard](./dashboard.md), z. B. mit Kennzahlen oder einem einzelnen Wert aus einer AAS. |
