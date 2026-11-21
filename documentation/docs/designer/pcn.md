---
sidebar_position: 16
title: Änderungsmitteilungen (PCN)
description: Wie Hersteller im Designer Änderungsmitteilungen (PCN) zu einem Produkt versenden und Abnehmer sie für übernommene AAS empfangen.
stichworte:
  PCN: ''
  Product Change Notification: ''
  Änderungsmitteilung: mitteilung-versenden-hersteller
  Broker: mitteilung-versenden-hersteller
  Abonnement: mitteilungen-abonnieren-abnehmer
  PCN einrichten: mitteilungen-abonnieren-abnehmer
  PCN Posteingang: eingehende-mitteilungen
  PCN Update Listener: eingehende-mitteilungen
quellen:
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/v3-submodel-editor/v3-submodel-editor.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/pcn/pcn-handling/pcn-handling.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/pcn/pcn-sending/pcn-sending.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/pcn/pcn-sending/pcn-sending.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/pcn/pcn-receiving/pcn-receiving.component.html
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/pcn/pcn-receiving/pcn-receiving.component.ts
  - frontend/libs/aas-designer-core/src/lib/v3-editor/components/pcn/pcn-state-store.service.ts
  - frontend/libs/aas-designer-core/src/lib/pcn/pcn-register-subscription/pcn-register-subscription.component.html
  - frontend/libs/aas-designer-core/src/lib/shells-list/shells-list.actions.ts
  - frontend/libs/aas-designer-core/src/lib/shells-list/shells-list.component.ts
  - frontend/libs/aas-designer-core/src/lib/system-management/job-settings/jobs/pcn-update-listener-settings.component.ts
  - frontend/libs/designer-user-dashboard/src/lib/pcn-inbox/pcn-inbox.component.html
  - frontend/libs/translations/i18n/de.json
---

# Änderungsmitteilungen (PCN)

Mit einer **Product Change Notification (PCN)** informiert ein Hersteller
seine Kunden über Änderungen an einem Produkt, z. B. ein neues Material oder
eine abgekündigte Variante. Im Designer können Hersteller solche
Mitteilungen versenden und Abnehmer sie für übernommene AAS abonnieren.

Grundlage ist ein Teilmodell zur Produktänderungsmitteilung in der AAS
(Semantic ID `0173-10029#01-XFB001#001`). Es enthält die Liste der bisherigen
Änderungen (`Records`), ein Ereigniselement mit dem Thema (Topic) der
Mitteilungen und die Adressen eines MQTT-Brokers, über den die Mitteilungen
verteilt werden.

## Mitteilung versenden (Hersteller)

Enthält das Teilmodell ein ausgehendes Ereignis (`PcnEventsOutgoing`), zeigt
der [Editor](./editor.md) beim Teilmodell den Bereich
**Produktänderungsmitteilung** mit **Änderungsmitteilung anlegen**:

1. **Änderungstyp** wählen: PCN für eine Änderung, PDN für eine
   Abkündigung.
2. **Änderungskommentar** eintragen (Pflichtfeld) und den
   **Änderungsgrund** aus der Liste wählen. Die Liste lässt sich
   durchsuchen.
3. Unter **Brokerdaten** die **Broker Url** aus den Adressen des Teilmodells
   wählen und **Broker Topic**, **Broker Benutzername** und
   **Broker Passwort** prüfen. Die Adresse muss mit `ws://` oder `wss://`
   beginnen, weil der Browser die Mitteilung direkt sendet.
4. **Absenden**. Der Button ist erst aktiv, wenn Broker Url und Broker Topic
   gesetzt sind.

Der Designer legt die Änderung als neuen Eintrag unter `Records` an,
speichert die AAS und schickt dann eine Nachricht an den Broker. Eine
Meldung bestätigt den Versand. Schlägt der Versand fehl, z. B. weil der
Broker nicht erreichbar ist, bleibt der Eintrag in der AAS trotzdem
erhalten.

## Mitteilungen abonnieren (Abnehmer)

Übernimmt man eine fremde AAS mit diesem Teilmodell, z. B. über
**Importieren in ...** oder **Duplizieren** in der
[Liste der Verwaltungsschalen](./aas-verwalten.md), fragt der Designer, ob
man Aktualisierungen zu diesem Produkt erhalten möchte. **Ja** öffnet den
Dialog **PCN einrichten** mit **Broker Url**, **Broker Topic**,
**Broker Benutzername** und **Broker Passwort**. Benutzername und Passwort
bleiben leer, wenn der Broker keine Anmeldung verlangt. Nach dem Schließen
des Dialogs öffnet sich die AAS im Editor.

Später lässt sich das Abonnement im Editor beim Teilmodell im Bereich
**Produktänderungsmitteilung** einrichten oder verwalten (eingehendes
Ereignis `PcnEventsIncoming`):

- Ohne Abonnement zeigt der Bereich den Hinweis „Für diese AAS ist noch kein
  Empfang von Updates eingerichtet.“ und die Brokerfelder. **PCN einrichten**
  legt das Abonnement an; der Empfang ist sofort aktiv.
- Mit Abonnement zeigt der Bereich „Für diese AAS ist der Empfang von
  Änderungsmitteilungen aktiv.“ und die folgenden Buttons:
  - **Deaktivieren** bzw. **Aktivieren** schaltet den Empfang aus oder
    wieder ein.
  - **Löschen** beendet das Abonnement.

Alle drei Aktionen fragen vorher nach.

Für den Empfang muss der Broker über eine `wss://`-Adresse erreichbar sein.

## Eingehende Mitteilungen

Der Job **PCN Update Listener** verbindet sich regelmäßig mit den Brokern
aller aktiven Abonnements, siehe
[Job-Konfiguration](./systemverwaltung.md#job-konfiguration). Eingehende
Mitteilungen erscheinen:

- im Widget **PCN Posteingang** auf dem [Dashboard](./dashboard.md) mit den
  Aktionen Anzeigen und Löschen,
- als Hinweis „Es wurde ein Update zu diesem Asset empfangen.“, wenn die
  betroffene AAS gerade im Editor oder Viewer geöffnet ist.

:::info Enterprise
Das Dashboard und damit das Widget **PCN Posteingang** gibt es nur in der
Enterprise-Edition. In der Community-Edition erscheinen eingehende
Mitteilungen nur als Hinweis in Editor und Viewer.
:::

Die Details einer Mitteilung lädt der Browser direkt vom AAS-Server des
Herstellers. Er muss dafür ohne Anmeldung erreichbar sein.
