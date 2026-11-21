---
sidebar_position: 19
title: Organisation verwalten
description: Stammdaten, Benutzer, Einladungen, ECLASS-Zertifikat, Token und AAS-Infrastrukturen der eigenen Organisation verwalten.
stichworte:
  Organisation: ''
  IRI-Präfix: organisationsdetails
  Benutzerplätze: benutzer
  Einladung: benutzer-einladen
  ECLASS-Zertifikat: eclass
  Token: token
  API-Schlüssel: token
  AAS-Infrastruktur: aas-infrastruktur
  Health Check: infrastruktur-hinzufügen
  DPP-Zugriffsregeln: dpp-zugriffsregeln
quellen:
  - frontend/libs/designer-app-menu/src/lib/app-menu/app.menu.component.ts
  - frontend/libs/aas-designer-core/src/lib/organisation/organisation.routes.ts
  - frontend/libs/aas-designer-core/src/lib/organisation/organisation.service.ts
  - frontend/libs/aas-designer-core/src/lib/organisation/my-organisation/my-organisation.component.ts
  - frontend/libs/aas-designer-core/src/lib/organisation/orga-details/orga-details.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/orga-details/organisation-details-edit/organisation-details-edit.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/organisation-user/organisation-user.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/organisation-user/organisation-user-list/organisation-user.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/organisation-user/organisation-user-list/organisation-user.component.ts
  - frontend/libs/aas-designer-core/src/lib/organisation/organisation-user/organisation-user-create/organisation-user-create.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/user-invitation-list/user-invitation-list.component.ts
  - frontend/libs/aas-designer-core/src/lib/organisation/eclass-details/eclass-details.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/organisation-token/organisation-token.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/organisation-token/organisation-token.component.ts
  - services/aas-designer/AasDesignerApi/Orga/OrganisationService.cs
  - services/aas-designer/AasDesignerApi/Apikey/ApikeyService.cs
  - services/aas-designer/AasDesignerSystemManagementApi/Settings/Queries/GetViewerSettings/GetViewerSettingsQuery.cs
  - frontend/libs/aas-designer-core/src/lib/organisation/infrastructure/infrastructure-parent/infrastructure-parent.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/infrastructure/infrastructure-add/infrastructure-add.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/infrastructure/infrastructure-edit/infrastructure-edit.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/infrastructure/infrastructure-list/infrastructure-list.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/infrastructure/infrastructure.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/infrastructure/infrastructure.component.ts
  - frontend/libs/aas-designer-core/src/lib/organisation/infrastructure/infrastructure-migrate-go/infrastructure-migrate-go.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/infrastruktur-rechte/infrastruktur-rechte.component.html
  - frontend/libs/aas-designer-core/src/lib/payment/orga-payment-model-list/orga-payment-model-list.component.html
  - frontend/libs/aas-designer-core/src/lib/payment/orga-payment-model-list/orga-payment-model-list.component.ts
  - frontend/libs/aas-designer-core/src/lib/organisation/role-label/role-label.pipe.ts
  - frontend/libs/aas-assistant/src/lib/aassi-providers.ts
  - frontend/libs/aas-assistant/src/lib/components/aassi-settings/aassi-settings.component.html
  - frontend/libs/translations/i18n/de.json
  - services/aas-designer/AasDesignerApi/Benutzer/BenutzerService.cs
  - services/aas-designer/AasDesignerModel/Model/ApiScopes.cs
  - services/aas-designer/AasDesignerCommon/Utils/InfrastrukturRechteUtil.cs
---

# Organisation verwalten

Unter **Organisation** im Hauptmenü verwaltet die Administration einer
Organisation deren Stammdaten, Benutzer, Zugänge und AAS-Infrastrukturen. Der
Menüpunkt erscheint nur mit der Rolle **Organisationsadministration**, siehe
[Rollen und Rechte](./rollen-und-rechte.md). Alle Einstellungen gelten für die
Organisation, die gerade in der Kopfleiste ausgewählt ist.

![Organisationsdetails](/img/designer/organisation-details.png)

Links steht die Navigation, rechts die gewählte Seite:

| Eintrag | Inhalt |
|---|---|
| Organisationsdetails | Name, Anschrift, Kontaktdaten, Logo und IRI-Präfix |
| Benutzer | Mitglieder der Organisation mit ihren Rollen und Infrastruktur-Rechten |
| Einladungen | Offene Einladungen an neue Benutzer |
| ECLASS | Zertifikat für den ECLASS-Webservice |
| Token | API-Schlüssel für externe Systeme |
| AAS Infrastruktur | Verbundene AAS-Server; jede Infrastruktur hat einen eigenen Unterpunkt |
| Bezahlmodell | Gebuchte Pakete; nur im mandantenfähigen Betrieb sichtbar |

:::info Enterprise
In der Enterprise-Edition steht unter **Organisation** zusätzlich der Eintrag
**AASsi (KI-Assistent)**. Dort legt die Administration fest, ob der
KI-Assistent für die Organisation aktiv ist, welchen Anbieter und welches
Modell er nutzt, mit welchem Schlüssel er sich dort anmeldet und wie viele
Tokens er im Monat verbrauchen darf. AASsi sendet dabei Inhalte aus AAS,
Texten, Webseiten und Dokumenten an den gewählten Anbieter.
:::

## Organisationsdetails

Die Seite zeigt Name, Anschrift und Kontaktdaten der Organisation.

1. **Bearbeiten** wählen.
2. Die Angaben ändern:
   - **Organisationsdaten**: **Name der Organisation**, **Straße**, **PLZ**,
     **Ort**, **Bundesland**, **Ländercode** und das Logo unter **Icon**
     (Bilddatei bis 1 MB, per Drag & Drop oder über **Bild auswählen**). Das
     Logo erscheint in der Kopfleiste.
   - **Kontaktdaten**: **E-Mail-Adresse**, **Telefon** und **Fax**.
   - **IRI-Präfix**: Anfang der Kennungen, die der Designer für neue AAS,
     Teilmodelle und Assets erzeugt, z. B. `https://demo-pumpen.example/`.
     Der Präfix sollte auf eine Domain der Organisation zeigen, damit die
     Kennungen weltweit eindeutig sind. Bestehende Kennungen ändern sich
     nicht, wenn der Präfix geändert wird.
3. **Speichern** übernimmt die Änderungen, **Abbrechen** verwirft sie.

Pflichtfelder sind Name, Straße, PLZ, Ort, eine gültige E-Mail-Adresse und
der IRI-Präfix. Solange eines fehlt, bleibt **Speichern** gesperrt.

## Benutzer

Die Tabelle listet alle Mitglieder mit **Nachname**, **Vorname**,
**E-Mail-Adresse**, **Aktiv**, Anmeldung über Single Sign-on (**SSO**) und
**Benutzerrollen**. Jede Spalte außer den Rollen lässt sich filtern und
sortieren. Darüber steht, wie viele Benutzerplätze belegt sind.

![Benutzer der Organisation](/img/designer/organisation-benutzer.png)

Das Menü ⋮ am Zeilenanfang bietet:

| Eintrag | Wirkung |
|---|---|
| Löschen | Entfernt den Benutzer nach einer Rückfrage aus der Organisation. Das eigene Konto lässt sich nicht entfernen. |
| Rollen bearbeiten | Rollen des Benutzers an- oder abwählen; unter jeder Rolle steht eine kurze Beschreibung. Die eigene Rolle **Organisationsadministration** lässt sich nicht entfernen. **Systemadministration** und **Hilfe-Redaktion System** erscheinen nur für die Systemadministration. |
| Infrastruktur-Zugriffsrechte | Je Infrastruktur festlegen, ob der Benutzer **Lesen**, **Schreiben** oder **Marktplatz veröffentlichen** darf. |

![Rollen bearbeiten](/img/designer/organisation-rollen-bearbeiten.png)

### Benutzer einladen

1. **Benutzer hinzufügen** wählen.
2. **Nachname**, **Vorname** und **E-Mail-Adresse** eintragen; alle drei
   sind Pflicht.
3. Unter **Benutzerrollen** die gewünschten Rollen ankreuzen.
4. **Speichern** wählen.

![Formular zum Einladen eines Benutzers mit Benutzerdaten und Benutzerrollen](/img/designer/organisation-benutzer-einladen.png)

**Speichern** legt noch kein Konto an, sondern verschickt eine Einladung per
E-Mail. Über den Link darin legt die eingeladene Person ihr Konto an und wird
Mitglied der Organisation. **Abbrechen** verwirft die Eingaben nach einer
Rückfrage.

Sind alle Benutzerplätze belegt, ist **Benutzer hinzufügen** gesperrt; der
Hinweis am Button nennt den Grund.

:::tip Infrastruktur-Rechte nach der Einladung
Rechte auf externe Infrastrukturen werden nicht mit der Einladung vergeben.
Nachdem die Einladung angenommen ist, unter **Benutzer** › ⋮ ›
**Infrastruktur-Zugriffsrechte** festlegen, was der neue Benutzer lesen oder
schreiben darf. Auf die internen Infrastrukturen der Organisation erhält ein
neues Mitglied automatisch das Leserecht, mit der Rolle **Organisationsadministration** auch
Schreiben und Marktplatz veröffentlichen.
:::

## Einladungen

Hier stehen die Einladungen, die noch nicht angenommen wurden, mit Name,
E-Mail-Adresse, Rollen und der Angabe, ob sie noch **Gültig** sind. Eine
Einladung gilt 14 Tage.

Über das Menü ⋮ lässt sich eine Einladung erneut senden
(**Einladung erneut senden**); sie gilt dann wieder 14 Tage. **Löschen** zieht
sie nach einer Rückfrage zurück; der Link in der E-Mail funktioniert danach
nicht mehr.

## ECLASS

Der Designer kann Merkmale direkt im ECLASS-Katalog suchen und übernehmen:
im Editor über das Kontextmenü eines Elements, bei Semantic IDs und Werten
sowie in [Konzeptbeschreibungen](./konzeptbeschreibungen.md). Dafür braucht die
Organisation ein **ECLASS Webservice Zertifikat**. Es ist bei ECLASS gegen
Lizenzgebühr erhältlich.

![ECLASS-Zertifikat](/img/designer/organisation-eclass.png)

1. Mit **Hochladen** die Zertifikatsdatei (`.pfx`, bis 10 MB) auswählen.
2. Nach dem Hochladen zeigt die Seite **Ausgestellt von**,
   **Ausstellendes Zertifikat**, **Seriennummer**, **Signatur**,
   **Gültig seit** und **Gültig bis**.

Das Zertifikat gilt für alle Mitglieder der Organisation. **Löschen**
entfernt es nach einer Rückfrage wieder; ECLASS-Abfragen sind dann nicht mehr
möglich.

## Token

Ein Token ist ein **API-Schlüssel**, mit dem externe Systeme ohne
Benutzeranmeldung auf den Designer zugreifen, z. B. für automatische Backups
oder um AAS aus einem Feed-Mapping zu erzeugen. Jeder Token gehört zu genau
einer Infrastruktur.

![Token hinzufügen](/img/designer/organisation-token.png)

Die Tabelle zeigt **Beschreibung**, **Infrastruktur**, **Scopes**,
**Gültig bis** und **Aktiv** jedes Tokens. **Aktualisieren** lädt die Liste
neu.

1. **Token hinzufügen** wählen.
2. Im Dialog ausfüllen:
   - **Beschreibung**: wofür der Token verwendet wird.
   - **Infrastruktur**: auf welche AAS-Infrastruktur er Zugriff gibt.
   - **Gültig bis**: optionales Ablaufdatum.
   - **Scopes**: welche Aktionen erlaubt sind.
3. **Speichern** wählen. Gesperrt bleibt der Button, solange Beschreibung,
   Infrastruktur oder ein Scope fehlen.
4. Der Designer erzeugt den Schlüssel und zeigt ihn im Feld **API Key** an.
   Mit **Kopieren** übernehmen, sicher aufbewahren und den Dialog mit
   **Schließen** beenden.

| Scope | Erlaubt |
|---|---|
| Backup erstellen | Sicherung der Infrastruktur abrufen |
| Backup einspielen | Sicherung zurückspielen |
| Aus Mapping erstellen | AAS über ein Feed-Mapping erzeugen |
| `AASX_READ_API` | AAS und Teilmodelle über die AAS-Schnittstelle lesen |
| `AASX_WRITE_API` | AAS und Teilmodelle über die AAS-Schnittstelle schreiben |

Externe Systeme senden den Schlüssel im HTTP-Header `Api-Key` mit.

Über das Menü ⋮ einer Zeile lässt sich ein Token **Deaktivieren** bzw.
wieder **Aktivieren**, mit **Token kopieren** erneut in die Zwischenablage
übernehmen oder nach einer Rückfrage **Löschen**.
Ein deaktivierter Token wird sofort abgewiesen, bis er wieder aktiviert wird.

Die Liste enthält auch die Schlüssel, die der Designer für den
[QR-Code der ViewerApp](./aas-verwalten.md#qr-code-für-die-viewerapp) anlegt.
Sie heißen „ViewerApp-QR-Code (nur Lesen)“, gefolgt von der E-Mail-Adresse der
Person, die den QR-Code geöffnet hat, und haben nur den Scope
`AASX_READ_API`. Ältere Schlüssel aus diesem Dialog heißen „PAT Generated by
AAS Designer“ und haben zusätzlich `AASX_WRITE_API`; sie werden nicht mehr
verwendet und können gelöscht werden, sobald die ViewerApp den neuen QR-Code
gescannt hat.

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

1. Unter **AAS Infrastruktur** die Schaltfläche **Hinzufügen** wählen.
2. Das Formular für eine externe Infrastruktur ausfüllen:
   - **Name** (Pflicht) und **Beschreibung**.
   - **Aktiv**: ob die Infrastruktur zur Auswahl steht.
   - **Nur-Lesen**: Inhalte lassen sich ansehen, aber nicht ändern.
   - **Keine Shells-Liste**: für Server, die keine Liste aller AAS liefern.
     Die Liste der Verwaltungsschalen zeigt dann ein Eingabefeld, um eine AAS
     direkt über ihre ID zu öffnen.
   - Unter **URLs** die Adressen der einzelnen Dienste, z. B.
     **AAS Discovery Service URL**. Nicht vorhandene Dienste bleiben leer. Ist
     bei einem Dienst **Health Check** eingeschaltet, prüft der Designer über
     die darunter eingetragene Adresse, ob der Dienst erreichbar ist; die
     Adresse ist dann Pflicht.
   - Unter **Sicherheit** bei Bedarf zusätzliche Header über
     **Header Parameter hinzufügen** (z. B. für einen API-Schlüssel),
     **Aktuelles JWT-Token mitsenden**, wenn der Server dieselbe Anmeldung wie
     der Designer nutzt, sowie eine **Zertifikatsdatei** (`.pfx`) mit ihrem
     **Passwort**.
3. **Speichern** wählen.
4. Nach dem Speichern öffnet sich der Dialog **Infrastruktur-Zugriffsrechte**.
   Dort für jeden Benutzer **Lesen**, **Schreiben** oder
   **Marktplatz veröffentlichen** ankreuzen und **Speichern**.

:::note
Eine neue externe Infrastruktur hat zunächst für niemanden Rechte. Wer im
Dialog nach dem Speichern keine Rechte vergibt, findet sie auch selbst nicht
in der Auswahl der Liste der Verwaltungsschalen.
:::

### Details einer Infrastruktur

Der Unterpunkt einer Infrastruktur zeigt **Name**, **InfrastrukturID**,
**Beschreibung** sowie, ob sie **Intern?**, **Nur-Lesen** und **Aktiv?** ist.
Darunter steht je Dienst eine Karte mit seinen Adressen:

- **Proxy**: Adresse über den Designer, mit dessen Anmeldung.
- **Direkt**: Adresse des Dienstes selbst.
- **Konfiguriert**: bei internen Infrastrukturen die ursprünglich
  hinterlegte Adresse, sofern sie abweicht.

Bei internen Infrastrukturen steht auf jeder Karte zusätzlich die Version des
Dienstes, bei aktivem Health Check ein farbiger Status-Punkt.

Darunter stehen die **Infrastruktur-Zugriffsrechte** aller Benutzer:

| Recht | Bedeutung |
|---|---|
| Lesen | AAS, Teilmodelle und Konzeptbeschreibungen ansehen |
| Schreiben | Inhalte anlegen, ändern und löschen; schließt Lesen ein |
| Marktplatz veröffentlichen | AAS dieser Infrastruktur im Markt anbieten; wirkt nur in der Enterprise-Edition |

Externe Infrastrukturen lassen sich **Bearbeiten** und **Löschen**. Beim
Bearbeiten kommt das Feld **DPP-API-URL** für die Adresse einer
DPP-Schnittstelle hinzu. Beim Löschen werden auch alle Token dieser
Infrastruktur gelöscht.

### DPP-Zugriffsregeln

Hat eine Infrastruktur eine DPP-Schnittstelle, zeigt die Karte **DPP-API**
die Schaltfläche **Konfigurieren**. Sie öffnet den Dialog
**DPP-Zugriffsregeln**, der festlegt, wer welche Produktpässe und welche Teile
davon abrufen darf.

1. Im Reiter **Visueller Editor** den **Öffentlichen Zugriff** festlegen.
   Diese Regel gilt für Aufrufe ohne Anmeldung.
2. Mit **Rollenregel hinzufügen** Regeln für **Authentifizierten Zugriff**
   ergänzen. Unter **Rolle im Zugriffstoken** die Rolle genau so eintragen,
   wie der Identitätsanbieter sie im Zugriffstoken liefert.
3. Je Regel unter **Welche Produktpässe sind sichtbar?** mit
   **Bedingung hinzufügen** Felder der DPP-Metadaten prüfen, z. B. ob die
   Kennung eines Produktpasses mit einem Wert beginnt. Ohne Bedingung gilt die
   Regel für alle Produktpässe der Infrastruktur.
4. Unter **Welche Informationen sind sichtbar?** die Semantic IDs der
   Teilmodelle auswählen oder eintragen, die die Regel freigibt. Ohne Eintrag
   bleiben alle im DPP freigegebenen Teilmodelle sichtbar.
5. **Speichern** wählen.

Der Reiter **Expertenmodus** zeigt die Regeln als JSON zum direkten
Bearbeiten. Mehr zum Produktpass steht unter
[Digitaler Produktpass](./dpp.md).

### Interne Infrastruktur verwalten

Interne Infrastrukturen lassen sich nicht bearbeiten oder löschen. Im
mandantenfähigen Betrieb bietet ihre Detailseite stattdessen:

| Schaltfläche | Wirkung |
|---|---|
| Versionen ändern | Versionen der Dienste auswählen; **Speichern** erstellt die Server danach neu. Bestehende Daten bleiben erhalten. |
| Neu erstellen | Erstellt die Server nach einer Rückfrage mit den aktuellen Einstellungen neu. Bestehende Daten bleiben erhalten. |
| Deaktivieren / Aktivieren | Beendet bzw. startet die Dienste der Infrastruktur; das kann einige Minuten dauern. |

Im mandantenfähigen Betrieb, in dem der Container-Manager die internen
Infrastrukturen bereitstellt, zeigt die Detailseite einer internen
Infrastruktur, die noch nicht auf BaSyx Go beruht, den Hinweis
**Upgrade auf BaSyx Go verfügbar**. In einer Installation für eine einzelne
Organisation erscheint der Hinweis nicht.
**BaSyx Go Infrastruktur anlegen** richtet im Hintergrund eine zusätzliche
interne Infrastruktur ein; die bisherige bleibt aktiv. Vorhandene AAS werden
nicht übertragen, sondern lassen sich einzeln über das Kontextmenü in der
Liste der Verwaltungsschalen in die neue Infrastruktur importieren. Dabei
nimmt BaSyx Go nur gültige AAS an.

## Bezahlmodell

Im mandantenfähigen Betrieb, bei dem sich mehrere Organisationen eine
Installation teilen, zeigt **Bezahlmodell** die gebuchten Pakete mit Anzahl
der Benutzer, Preis, Buchungs- und Enddatum. Änderungen nimmt die
Systemadministration vor; nur für sie bietet das Menü ⋮ einer Zeile
**Option Kündigen** und **Enddatum ändern**. In einer Installation für eine einzelne Organisation
fehlt der Menüpunkt.
