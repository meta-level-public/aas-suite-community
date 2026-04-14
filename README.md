# AAS Suite Community

Die AAS Suite Community Version stellt zentrale Open-Source-Komponenten für Entwicklung, Evaluierung und eigene Deployments rund um die Asset Administration Shell bereit.

## Überblick

Dieses Repository enthält den Community-Kern der AAS Suite mit Quellcode, Docker-Compose-Artefakten und öffentlicher Dokumentation.

Geeignet ist es insbesondere für:

- den lokalen Einstieg mit Docker Compose
- die technische Evaluierung der Community Version
- die Weiterentwicklung der enthaltenen Open-Source-Komponenten

## Warum AAS Suite Community

Mit der AAS Suite Community können Sie Asset Administration Shells praxisnah aufbauen, bereitstellen und in bestehende technische Landschaften integrieren.

Sie unterstützt unter anderem dabei:

- AAS-bezogene Services und Oberflächen lokal schnell bereitzustellen
- Datenmodelle, Integrationen und technische Abläufe in einer realistischen Umgebung zu evaluieren
- manuelle Prozesse mit passenden Assistenten und geführten Abläufen effizient zu unterstützen
- externe AAS-Infrastrukturen sowie angrenzende Systeme gezielt anzubinden
- eigene Erweiterungen und Anpassungen auf Basis der Open-Source-Komponenten umzusetzen
- Teams einen schnellen Einstieg in AAS-nahe Entwicklungs- und Betriebsszenarien zu ermöglichen

## Schnellstart

### Voraussetzungen

- Docker
- Docker Compose

### Mit Code-Checkout lokal starten

```bash
docker compose -f docker-oss/docker-compose.yml up -d
```

Für weitergehende Setups und portable Stacks stehen im Verzeichnis [docker-oss/](docker-oss/) Compose-Vorlagen und Hilfsdateien bereit. Zusätzliche Hinweise finden Sie in [docker-oss/DOCKER_README.md](docker-oss/DOCKER_README.md).

### Ohne Code-Checkout eine portable Umgebung erzeugen

Wenn Sie keine lokale Entwicklungsumgebung mit Repository-Checkout aufsetzen möchten, können Sie stattdessen den Docker-Compose-Wizard verwenden. Damit lässt sich eine portable Laufzeitumgebung mit den benötigten Compose-Dateien und Assets erzeugen.

```bash
bash tools/docker-compose-wizard/oss/create-compose-oss.sh
```

Der Wizard erzeugt einen startbereiten Stack in einem separaten Verzeichnis. Weitere Informationen finden Sie in [tools/docker-compose-wizard/oss/README.md](tools/docker-compose-wizard/oss/README.md).

## Repository-Inhalt

- [docker-oss/](docker-oss/) enthält die Docker-Compose-Artefakte für die Community-Version.
- [docs-oss/](docs-oss/) enthält die öffentliche OSS-Dokumentation.
- [frontend/](frontend/) enthält die Frontend-Anteile der Community-Version.
- [services/](services/) enthält die Backend-Services und gemeinsamen Komponenten.

## Dokumentation

Die weiterführende Dokumentation finden Sie unter [docs-oss/](docs-oss/).

## Beitragen

Community-Beiträge, Issues und Pull Requests sind willkommen. Für Beitragsrichtlinien siehe [CONTRIBUTING.md](CONTRIBUTING.md).

Bitte beschreiben Sie Änderungen, Motivation und Anwendungsfall möglichst konkret, damit die Review effizient erfolgen kann.

Zur Transparenz: Dieses Repository wird als One-Way-Mirror aus der Hauptentwicklung bereitgestellt. Beiträge und Pull Requests werden daher geprüft und bei Annahme manuell in die primäre Entwicklungsumgebung übernommen.

## Lizenz

Die AAS Suite Community Version wird unter der MIT-Lizenz zur Verfügung gestellt.

## Kontakt

Weitere Informationen finden Sie unter [aassuite.de](https://aassuite.de) oder auf unserer Homepage [meta-level.de](https://meta-level.de).

Wenn Sie Support, erweiterte Features oder konkrete Möglichkeiten suchen, projektspezifische Kundenwünsche und Anforderungen umzusetzen, finden Sie auf [aassuite.de](https://aassuite.de) auch Informationen zur Enterprise Version. Sprechen Sie uns gerne an.

## Hinweis

Diese README wird beim OSS-Export automatisch generiert.
