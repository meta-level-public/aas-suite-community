# OSS / Community Docker Compose Wizard

Auf einem Server ohne Repository-Checkout das fertige Paket aus dem aktuellen Release verwenden:

```bash
curl -LO https://github.com/meta-level-public/aas-suite-community/releases/latest/download/docker-compose-wizard-oss.zip
unzip docker-compose-wizard-oss.zip
bash docker-compose-wizard-oss/oss/create-compose-oss.sh
```

Das Paket enthält alle benötigten Zusatzdateien (u. a. `stack-assets/dpp-security/`, `stack-assets/keycloak-bootstrap/`). Den Ordner `tools/docker-compose-wizard` allein zu kopieren reicht nicht, da die DPP-Dateien sonst aus `deploy/shared/` gelesen werden. Lokal lässt sich das Paket mit `tools/docker-compose-wizard/export-community-zip.sh` bauen.

Start im Repository-Checkout:

```bash
bash tools/docker-compose-wizard/oss/create-compose-oss.sh
```

Erzeugt standardmaessig einen portablen Stack in einem Ordner wie `generated-stack-20260316153045/` mit `docker-compose.yml`, `.env`, `stack-assets/` und `postgres-init/`.

Der erzeugte Stack kann als Verzeichnis an einen beliebigen Ort gelegt und dort gestartet werden.

Der Wizard erzeugt BaSyx-Installationen mit den zusammengehörigen Go-Komponenten auf Version `1.0.12`.
Dabei wird der frühere kombinierte `aas-environment` vollständig durch getrennte Komponenten ersetzt:
`eclipsebasyx/aasrepository-go`, `eclipsebasyx/submodelrepository-go` und `eclipsebasyx/conceptdescriptionrepository-go`.

Wichtig für Keycloak im BFF-Login:

- `KEYCLOAK_ISSUER` und `KEYCLOAK_WELLKNOWN_URL` müssen aus dem Gateway-/Backend-Container erreichbar sein.
- `KEYCLOAK_PUBLIC_ISSUER` und `KEYCLOAK_PUBLIC_WELLKNOWN_URL` müssen aus dem Browser erreichbar sein.
- Im Compose-Setup ist `http://keycloak:8080/...` ein typischer interner Wert, während öffentlich oft `http://localhost:8088/...`, `http://localhost:8081/...` oder eine externe Proxy-URL verwendet wird.

Non-interactive:

```bash
bash tools/docker-compose-wizard/oss/create-compose-oss-non-interactive.sh \
  --input ./compose-oss.values.env \
  --output-dir ./generated-stack-20260316153045
```
