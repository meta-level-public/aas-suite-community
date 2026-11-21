---
sidebar_position: 23
title: Häufige Fragen und Fehler
description: Antworten auf häufige Fragen und die typischen Ursachen von Meldungen im Designer.
stichworte:
  FAQ: ''
  Fehlermeldungen: ''
  Funktion gesperrt: funktion-gesperrt-oder-zugriff-nicht-erlaubt
  Menüpunkt fehlt: der-menüpunkt-organisation-oder-systemverwaltung-fehlt
  Benutzerplätze: benutzer-hinzufügen-ist-gesperrt
  idShort: die-idshort-darf-nur-buchstaben-ziffern-_-und---enthalten-
  Import-Konflikt: mindestens-eine-aas-existiert-bereits
  Einladung: eine-einladung-ist-nicht-angekommen
quellen:
  - frontend/libs/designer-app-menu/src/lib/app-menu/app.menu.component.ts
  - frontend/libs/aas-designer-shared/src/lib/pages/forbidden/app.forbidden.component.html
  - frontend/libs/aas-designer-shared/src/lib/pages/login/sso-login-success/sso-login-success.component.html
  - frontend/libs/aas-designer-core/src/lib/organisation/organisation-user/organisation-user.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/tools/verification-message.ts
  - frontend/libs/common-components/src/lib/user-docs-button/user-docs-button.component.html
  - frontend/apps/aas-designer-enterprise/src/app/dashboard-license.guard.ts
  - frontend/libs/translations/i18n/de.json
  - services/aas-designer/AasDesignerApi/Authorization/JwtUtils.cs
  - services/aas-designer/AasDesignerAasApi/Infrastructure/Queries/GetAvailableInfrastructures/GetAvailableInfastructuresQuery.cs
---

# Häufige Fragen und Fehler

Hier stehen Fragen, die im Alltag oft auftauchen, und Meldungen des Designers
mit ihrer typischen Ursache.

## Zugriff und Rechte

### „Funktion gesperrt“ oder „Zugriff nicht erlaubt“

Der Bereich ist vorhanden, aber für die eigene Rolle nicht freigegeben oder
nicht in der Lizenz enthalten. Welche Rolle wofür nötig ist, steht unter
[Rollen und Rechte](./rollen-und-rechte.md). Rollen vergibt die
Administration der Organisation.

### Der Menüpunkt „Organisation“ oder „Systemverwaltung“ fehlt

**Organisation** erscheint nur mit der Rolle **Organisationsadministration**,
**Systemverwaltung** nur mit der Rolle **Systemadministration**. Wurden die Rollen gerade erst
geändert, die Seite neu laden oder sich neu anmelden.

### Der Menüpunkt „Erstellen“ fehlt

**Erstellen** erscheint nur, wenn die gerade gewählte Infrastruktur
beschreibbar ist. Entweder fehlt das Recht **Schreiben** auf diese
Infrastruktur, oder sie ist als **Nur-Lesen** eingerichtet. Siehe
[Infrastruktur-Rechte](./rollen-und-rechte.md#infrastruktur-rechte).

### Der Menüpunkt „Dashboard“ fehlt

Das [Dashboard](./dashboard.md) gibt es nur in der Enterprise-Edition und nur,
wenn die Lizenz es enthält. Ohne Dashboard beginnt die Arbeit in der Liste
**Shells**.

### Der Menüpunkt „Plugins“ fehlt

**Plugins** erscheint erst, wenn in der Installation mindestens ein Plugin
eingerichtet ist, siehe [Plugins](../betrieb/plugins.md).

### „Benutzer hinzufügen“ ist gesperrt

Alle Benutzerplätze der Organisation sind belegt. Wie viele belegt sind, steht
über der Tabelle unter
[Organisation › Benutzer](./organisation.md#benutzer). Für weitere Plätze,
wie der Hinweis am Button sagt, den Support ansprechen.

### Eine Infrastruktur fehlt in der Auswahl der Liste der Verwaltungsschalen

Entweder fehlt das Leserecht auf diese Infrastruktur, oder sie ist
deaktiviert. Das gilt auch für die Administration der Organisation: Wer beim
Anlegen einer externen Infrastruktur keine Rechte vergibt, sieht sie selbst
nicht. Beides lässt sich unter
[Organisation › AAS Infrastruktur](./organisation.md#aas-infrastruktur)
prüfen.

### AAS lassen sich ansehen, aber nicht bearbeiten

Für die Infrastruktur fehlt das Recht **Schreiben**, oder die Infrastruktur
ist als **Nur-Lesen** eingerichtet. Siehe
[Infrastruktur-Rechte](./rollen-und-rechte.md#infrastruktur-rechte).

### „Token abgelaufen“

Die Meldung erscheint nach einer Anmeldung über Single Sign-on, wenn die
Anmeldung beim Identitätsanbieter schon abgelaufen war. Erneut anmelden.

## AAS anlegen und bearbeiten

### „Die idShort darf nur Buchstaben, Ziffern, "_" und "-" enthalten …“

Eine idShort muss mit einem Buchstaben beginnen, mindestens zwei Zeichen
lang sein und darf keine Leerzeichen, Punkte oder Umlaute enthalten. Gültig
sind z. B. `TechnicalData` oder `Motor_1`.

### „Die ID Short existiert auf dieser Hierarchieebene bereits.“

Innerhalb eines Teilmodells oder einer Collection muss jede idShort
eindeutig sein. Dem neuen Element einen anderen Namen geben, z. B. mit
Nummer.

### „Für Kindelemente einer SubmodelElementList ist keine idShort erlaubt!“

Elemente einer Liste (SML) werden über ihre Position angesprochen und haben
keine idShort. Das Feld leer lassen.

### Die Validierung meldet Fehler auf Englisch

Die Prüfung verwendet die Regeln der AAS-Spezifikation. Häufige Meldungen
zeigt der Designer übersetzt an; für alle anderen erscheint der englische
Originaltext. Was die häufigsten bedeuten, steht unter
[Validierung › Häufige Fehler](./validierung.md#häufige-fehler).

### Im Editor fehlen neue IDTA-Vorlagen

Die Vorlagen aus dem IDTA-Repository lädt der Job **IDTA Crawler**. Ist er
abgeschaltet oder hat der Server keinen Zugang zu GitHub, bleiben sie
veraltet. Siehe [Job-Konfiguration](./systemverwaltung.md#job-konfiguration).

### Die ECLASS-Suche liefert nichts oder meldet einen Fehler

Die Organisation braucht ein gültiges Zertifikat für den ECLASS-Webservice,
siehe [Organisation › ECLASS](./organisation.md#eclass). Auch ein
abgelaufenes Zertifikat führt zu Fehlern.

## Import und Export

### „Mindestens eine AAS existiert bereits“

Die Datei enthält eine AAS, deren Kennung es in der Infrastruktur schon
gibt. Entweder **ggf. bestehende AAS überschreiben** ankreuzen oder einen
**Abgeleiteten Import** wählen, siehe
[Wenn die AAS schon existiert](./import-export.md#wenn-die-aas-schon-existiert).

### „Es ist ein unbekannter Fehler beim Upload des Pakets aufgetreten.“

Meist ist die Datei kein gültiges AASX-Paket, z. B. eine umbenannte
ZIP-Datei oder ein Paket nach einer sehr alten Version der Spezifikation.
Die Datei mit einem anderen Werkzeug prüfen oder einzelne Teilmodelle über
**Ohne fehlerhafte Submodelle importieren** übernehmen, siehe
[Import und Export](./import-export.md#fehlerhafte-teilmodelle).

### „Die AAS konnte nicht geladen werden, weil kein Zugriff auf die ausgewählte Infrastruktur möglich ist.“

Der AAS-Server der Infrastruktur ist nicht erreichbar. Bei externen
Infrastrukturen Adressen und Zugangsdaten prüfen; mit aktivem Health Check
zeigt die Detailseite der Infrastruktur, welcher Dienst ausfällt.

## Teilen und Zusammenarbeit

### Ein geteilter Link funktioniert nicht mehr

Der Link ist abgelaufen oder wurde gelöscht. Einen neuen Link erzeugen,
siehe [Geteilte Links](./geteilte-links.md).

### Eine Einladung ist nicht angekommen

Den Spam-Ordner prüfen. Unter
[Organisation › Einladungen](./organisation.md#einladungen) lässt sich die
Einladung erneut senden; sie gilt dann wieder 14 Tage. Kommt gar keine Mail
an, sind die [Mail-Einstellungen](./systemverwaltung.md#mail-einstellungen)
zu prüfen, z. B. mit einer Testmail.

## Sonstiges

### Der Button „Handbuch“ fehlt in der Kopfleiste

Der Button erscheint nur, wenn der Betrieb die Adresse des Handbuchs
konfiguriert hat, siehe
[Handbuch bereitstellen](../betrieb/handbuch-bereitstellen.md).

### An einem Feld fehlt das Fragezeichen

Für dieses Feld ist noch keine Feldhilfe hinterlegt. Wer die passende Rolle
hat, kann sie ergänzen, siehe [Feldhilfen](./feldhilfen.md).
