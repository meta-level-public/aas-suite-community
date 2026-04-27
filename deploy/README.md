# Deploy

Dieser Ordner enthaelt das gemeinsame lokale Deployment-Setup fuer Entwicklung und technische Integration.

## Rolle

`deploy/` ist aktuell kein produktvarianten-spezifischer Ordner.
Er bildet vor allem eine lokale Dev-Umgebung fuer mehrere Services und Infrastrukturkomponenten ab.

## Inhalt

- `shared/docker-compose.yml`: gemeinsames Docker-Compose-Setup fuer lokale Entwicklung
- `shared/postgres-init/10-create-basyx-db.sh`: Initialisierung zusaetzlicher Datenbanken beim lokalen Start
- `oss/`: Platz fuer kuenftige OSS-spezifische Deployment-Dateien
- `enterprise/`: Platz fuer kuenftige Enterprise-spezifische Deployment-Dateien

## Einordnung zu OSS und Enterprise

- `docker-oss/` enthaelt das OSS-nahe Docker-Deployment
- `docker-enterprise/` enthaelt das Enterprise-spezifische Docker-Deployment
- `deploy/shared/` enthaelt gemeinsames Dev-Setup
- `deploy/oss/` und `deploy/enterprise/` werden erst befuellt, wenn die Deployments wirklich auseinanderlaufen

Eine Trennung in `deploy/oss` und `deploy/enterprise` ist erst sinnvoll, wenn die Inhalte technisch oder fachlich auseinanderlaufen.
