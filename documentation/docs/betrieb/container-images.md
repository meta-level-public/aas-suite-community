---
sidebar_position: 2
title: Container-Images und Versionen
---

# Container-Images und Versionen

Die Community-Images werden unter
`ghcr.io/meta-level-public/aas-suite-community/<image>` veröffentlicht.
Verfügbare Tags:

- `1.4.2`: exakte Version eines Releases (Git-Tag `v1.4.2` im
  Community-Repository)
- `1.4` bzw. `1`: zeigt immer auf das neueste stabile Release dieser Minor-
  bzw. Major-Version; Vorabversionen wie `2.0.0-rc.1` verschieben diese Tags
  nicht
- `latest`: das zuletzt veröffentlichte stabile Release
- `main`, `release`, `sha-<commit>`: Entwicklungs- und Teststände
- ARM64-Images tragen jeweils das Suffix `-arm64`, z. B. `1.4.2-arm64`

Für produktive Installationen empfiehlt sich eine feste Version, z. B.
`IMAGE_TAG=1.4.2` in der `.env` des Stacks; der Compose-Wizard schlägt
standardmäßig die aktuelle Release-Version vor. `latest` wechselt bei jedem
Release automatisch und kann dabei Datenbank-Migrationen auslösen. Die
Version wird im Frontend über `version.json` angezeigt.
