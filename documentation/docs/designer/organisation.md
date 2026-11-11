---
sidebar_position: 19
title: Organisation verwalten
---

# Organisation verwalten

Unter **Organisation** im Hauptmenü verwaltet die Administration einer
Organisation deren Stammdaten, Benutzer, Zugänge und AAS-Infrastrukturen. Der
Menüpunkt erscheint nur mit der Rolle `ORGA_ADMIN`, siehe
[Rollen und Rechte](./rollen-und-rechte.md). Alle Einstellungen gelten für die
Organisation, die gerade in der Kopfleiste ausgewählt ist.

![Organisationsdetails](/img/designer/organisation-details.png)

| Eintrag | Inhalt |
|---|---|
| Organisationsdetails | Name, Anschrift, Kontaktdaten, Logo und IRI-Präfix |
| Benutzer | Mitglieder der Organisation mit ihren Rollen und Infrastruktur-Rechten |
| Einladungen | Offene Einladungen an neue Benutzer |
| ECLASS | Zertifikat für den ECLASS-Webservice |
| Token | API-Schlüssel für externe Systeme |
| AAS Infrastruktur | Verbundene AAS-Server; jede Infrastruktur hat einen eigenen Unterpunkt |
| Bezahlmodell | Gebuchte Pakete; nur im mandantenfähigen Betrieb sichtbar |

## Organisationsdetails

Die Seite zeigt Name, Anschrift und Kontaktdaten der Organisation. Mit
**Bearbeiten** lassen sich ändern:

- **Organisationsdaten**: Name, Straße, PLZ, Ort, Bundesland und Ländercode
  sowie das Logo (Bilddatei bis 1 MB, per Drag & Drop oder Button). Das Logo
  erscheint in der Kopfleiste.
- **Kontaktdaten**: E-Mail-Adresse, Telefon und Fax.
- **IRI-Präfix**: Anfang der Kennungen, die der Designer für neue AAS,
  Teilmodelle und Assets erzeugt, z. B. `https://example.com/`. Der Präfix
  sollte auf eine Domain der Organisation zeigen, damit die Kennungen weltweit
  eindeutig sind. Bestehende Kennungen ändern sich nicht, wenn der Präfix
  geändert wird.

**Speichern** übernimmt die Änderungen, **Abbrechen** verwirft sie.

## Benutzer

Die Tabelle listet alle Mitglieder mit Nachname, Vorname, E-Mail-Adresse,
Status (**Aktiv**), Anmeldung über Single Sign-on (**SSO**) und Rollen. Jede
Spalte lässt sich filtern. Darüber steht, wie viele Benutzerplätze belegt sind.

![Benutzer der Organisation](/img/designer/organisation-benutzer.png)

Das Menü ⋮ am Zeilenanfang bietet:

| Eintrag | Wirkung |
|---|---|
| Rollen bearbeiten | Rollen des Benutzers an- oder abwählen. Die eigene Rolle `ORGA_ADMIN` lässt sich nicht entfernen; `SYSTEM_ADMIN` kann nur die Systemadministration vergeben. |
| Infrastruktur-Zugriffsrechte | Je Infrastruktur festlegen, ob der Benutzer **Lesen**, **Schreiben** oder **Marktplatz veröffentlichen** darf. |
| Löschen | Entfernt den Benutzer nach einer Rückfrage aus der Organisation. Das eigene Konto lässt sich nicht entfernen. |

![Rollen bearbeiten](/img/designer/organisation-rollen-bearbeiten.png)

### Benutzer einladen

**Benutzer hinzufügen** öffnet ein Formular mit Nachname, Vorname,
E-Mail-Adresse und den gewünschten Rollen. **Speichern** legt noch kein Konto
an, sondern verschickt eine **Einladung per E-Mail**. Über den Link darin legt
die eingeladene Person ihr Konto an und wird Mitglied der Organisation.

Sind alle Benutzerplätze belegt, ist der Button gesperrt.

:::tip Infrastruktur-Rechte nach der Einladung
Rechte auf Infrastrukturen werden nicht mit der Einladung vergeben. Nachdem
die Einladung angenommen ist, unter **Benutzer** › ⋮ ›
**Infrastruktur-Zugriffsrechte** festlegen, was der neue Benutzer lesen oder
schreiben darf.
:::

## Einladungen

Hier stehen die Einladungen, die noch nicht angenommen wurden, mit Name,
E-Mail-Adresse, Rollen und der Angabe, ob sie noch **Gültig** sind. Eine
Einladung gilt 14 Tage.

Über das Menü ⋮ lässt sich eine Einladung **erneut senden**; sie gilt dann
wieder 14 Tage. **Löschen** zieht sie zurück; der Link in der E-Mail
funktioniert danach nicht mehr.

## ECLASS

Der Designer kann Merkmale direkt im ECLASS-Katalog suchen und übernehmen:
im Editor über das Kontextmenü eines Elements, bei Semantic IDs und Werten
sowie in [Konzeptbeschreibungen](./konzeptbeschreibungen.md). Dafür braucht die
Organisation ein **Zertifikat für den ECLASS-Webservice**. Es ist bei ECLASS
gegen Lizenzgebühr erhältlich.

![ECLASS-Zertifikat](/img/designer/organisation-eclass.png)

Mit **Hochladen** die Zertifikatsdatei (`.pfx`, bis 10 MB) auswählen. Danach
zeigt die Seite Aussteller, Seriennummer und Gültigkeitszeitraum. Das
Zertifikat gilt für alle Mitglieder der Organisation. **Löschen** entfernt es
wieder; ECLASS-Abfragen sind dann nicht mehr möglich.

## Token

Ein Token ist ein **API-Schlüssel**, mit dem externe Systeme ohne
Benutzeranmeldung auf den Designer zugreifen, z. B. für automatische Backups
oder um AAS aus einem Feed-Mapping zu erzeugen. Jeder Token gehört zu genau
einer Infrastruktur.

![Token hinzufügen](/img/designer/organisation-token.png)

**Token hinzufügen** öffnet einen Dialog:

- **Beschreibung**: wofür der Token verwendet wird.
- **Infrastruktur**: auf welche AAS-Infrastruktur er Zugriff gibt.
- **Gültig bis**: optionales Ablaufdatum.
- **Scopes**: welche Aktionen erlaubt sind.

| Scope | Erlaubt |
|---|---|
| Backup erstellen | Sicherung der Infrastruktur abrufen |
| Backup einspielen | Sicherung zurückspielen |
| Aus Mapping erstellen | AAS über ein Feed-Mapping erzeugen |
| `AASX_READ_API` | AAS und Teilmodelle über die AAS-Schnittstelle lesen |
| `AASX_WRITE_API` | AAS und Teilmodelle über die AAS-Schnittstelle schreiben |

Nach **Speichern** erzeugt der Designer den Schlüssel und zeigt ihn im Dialog
an. Mit **Kopieren** übernehmen und sicher aufbewahren. Externe Systeme senden
ihn im HTTP-Header `Api-Key` mit.

Über das Menü ⋮ einer Zeile lässt sich ein Token **deaktivieren** bzw.
wieder **aktivieren**, **kopieren** oder **löschen**.

:::warning
Ein Token gewährt Zugriff, ohne dass sich jemand anmeldet. Nur die nötigen
Scopes vergeben, ein Ablaufdatum setzen und Tokens, die nicht mehr gebraucht
werden, löschen.
:::

## AAS Infrastruktur

Eine **AAS-Infrastruktur** ist ein Satz von AAS-Diensten: Discovery,
Registries und Repositories für AAS, Teilmodelle und Konzeptbeschreibungen,
optional eine DPP-Schnittstelle. In der Liste der Verwaltungsschalen wechselt
man zwischen den Infrastrukturen der Organisation.

- **Interne Infrastruktur**: wird von der AAS Suite für die Organisation
  bereitgestellt.
- **Externe Infrastruktur**: eigene AAS-Server, z. B. ein vorhandenes
  BaSyx-Repository, die mit dem Designer verbunden werden.

![AAS-Infrastruktur](/img/designer/organisation-infrastruktur.png)

### Infrastruktur hinzufügen

**Hinzufügen** öffnet das Formular für eine externe Infrastruktur:

- **Name** und **Beschreibung**.
- **Nur-Lesen**: Inhalte lassen sich ansehen, aber nicht ändern.
- **Aktiv**: ob die Infrastruktur zur Auswahl steht.
- **Keine Shells-Liste**: für Server, die keine Liste aller AAS liefern. Die
  Liste der Verwaltungsschalen zeigt dann ein Eingabefeld, um eine AAS direkt
  über ihre ID zu öffnen.
- Die **URLs** der einzelnen Dienste. Nicht vorhandene Dienste bleiben leer.
- **Health Check**: regelmäßig prüfen, ob die Dienste erreichbar sind.
- **Sicherheit**: Zertifikatsdatei, zusätzliche Header (z. B. für einen
  API-Schlüssel), Passwort oder **Aktuelles JWT-Token mitsenden**, wenn der
  Server dieselbe Anmeldung wie der Designer nutzt.

Nach dem Speichern legt man fest, welche Benutzer die Infrastruktur lesen und
schreiben dürfen.

### Details einer Infrastruktur

Der Unterpunkt einer Infrastruktur zeigt ihre Eigenschaften und je Dienst die
Adresse und, bei aktivem Health Check, den Status. Darunter stehen die
**Infrastruktur-Zugriffsrechte** aller Benutzer:

| Recht | Bedeutung |
|---|---|
| Lesen | AAS, Teilmodelle und Konzeptbeschreibungen ansehen |
| Schreiben | Inhalte anlegen, ändern und löschen; schließt Lesen ein |
| Marktplatz veröffentlichen | AAS dieser Infrastruktur im Markt anbieten |

Externe Infrastrukturen lassen sich **bearbeiten** und **löschen**. Für die
DPP-Schnittstelle legt **Konfigurieren** fest, welche Teile eines
Produktpasses öffentlich und welche nur für angemeldete Rollen sichtbar sind.

## Bezahlmodell

Im mandantenfähigen Betrieb, bei dem sich mehrere Organisationen eine
Installation teilen, zeigt **Bezahlmodell** die gebuchten Pakete mit Anzahl
der Benutzer, Preis, Buchungs- und Enddatum. Änderungen nimmt die
Systemadministration vor. In einer Installation für eine einzelne Organisation
fehlt der Menüpunkt.
