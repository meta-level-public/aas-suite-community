---
sidebar_position: 20
title: Rollen und Rechte
---

# Rollen und Rechte

Was ein Benutzer im Designer sehen und tun darf, ergibt sich aus zwei Dingen:

- den **Rollen** in der Organisation, die unter
  [Organisation › Benutzer](./organisation.md#benutzer) vergeben werden, und
- den **Infrastruktur-Rechten**, die je AAS-Infrastruktur festlegen, ob jemand
  lesen, schreiben oder im Markt veröffentlichen darf.

Rollen gelten je Organisation. Wer Mitglied in mehreren Organisationen ist,
kann dort unterschiedliche Rollen haben; die eigenen Rollen zeigt
[Mein Bereich › Organisationen](./mein-bereich.md#organisationen).

## Rollen

In der Oberfläche erscheinen die Rollen mit ihrem technischen Namen.

| Rolle | Bedeutung |
|---|---|
| `BENUTZER` | Grundzugang zur Organisation: Dashboard, Liste der Verwaltungsschalen, Viewer und Mein Bereich |
| `ORGA_ADMIN` | Verwaltet die Organisation: Benutzer, Einladungen, Rollen, Infrastrukturen, Token und ECLASS-Zertifikat. Zeigt den Menüpunkt **Organisation**. |
| `FEED_MAPPING_USER` | Zugriff auf das Feed-Mapping (nur Enterprise) |
| `ORGA_HELP_EDITOR` | Darf die Hilfetexte der Organisation bearbeiten, siehe [Feldhilfen](./feldhilfen.md) |
| `SYSTEM_ADMIN` | Systemweite Administration aller Organisationen. Zeigt den Menüpunkt **Systemverwaltung**. |
| `SYSTEM_HELP_EDITOR` | Darf systemweite Hilfetexte bearbeiten |

`SYSTEM_ADMIN` und `SYSTEM_HELP_EDITOR` kann nur vergeben, wer selbst
`SYSTEM_ADMIN` ist. Die eigene Rolle `ORGA_ADMIN` lässt sich nicht entfernen,
damit eine Organisation nicht ohne Administration bleibt.

## Infrastruktur-Rechte

Die Rechte auf eine AAS-Infrastruktur werden pro Benutzer gesetzt, entweder
unter **Organisation › Benutzer** › ⋮ › **Infrastruktur-Zugriffsrechte** oder
auf der Detailseite der Infrastruktur.

| Recht | Erlaubt |
|---|---|
| Lesen | AAS, Teilmodelle und Konzeptbeschreibungen der Infrastruktur ansehen und exportieren |
| Schreiben | Inhalte anlegen, ändern und löschen; schließt Lesen ein |
| Marktplatz veröffentlichen | AAS der Infrastruktur im Markt anbieten |

Ohne Leserecht erscheint eine Infrastruktur nicht in der Auswahl der Liste der
Verwaltungsschalen. Ist eine Infrastruktur als **Nur-Lesen** eingerichtet,
lassen sich ihre Inhalte auch mit Schreibrecht nicht ändern.

## Typische Kombinationen

| Aufgabe | Rollen | Infrastruktur-Rechte |
|---|---|---|
| AAS nur ansehen | `BENUTZER` | Lesen |
| AAS anlegen und pflegen | `BENUTZER` | Schreiben |
| Produkte im Markt anbieten | `BENUTZER` | Schreiben, Marktplatz veröffentlichen |
| Organisation verwalten | `BENUTZER`, `ORGA_ADMIN` | nach Bedarf |

Neue Benutzer erhalten die Rollen schon mit der Einladung. Infrastruktur-Rechte
werden erst vergeben, nachdem die Einladung angenommen ist.
