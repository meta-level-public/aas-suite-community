# OSS / Community Docker Compose Wizard

Start:

```bash
bash tools/docker-compose-wizard/oss/create-compose-oss.sh
```

Erzeugt standardmaessig einen portablen Stack in einem Ordner wie `generated-stack-20260316153045/` mit `docker-compose.yml`, `.env`, `stack-assets/` und `postgres-init/`.

Der erzeugte Stack kann als Verzeichnis an einen beliebigen Ort gelegt und dort gestartet werden.

Der Wizard erzeugt BaSyx-Installationen mit den Go-Komponenten auf Version `1.0.0`.
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
