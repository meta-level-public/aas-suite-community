---
sidebar_position: 16
title: Änderungsmitteilungen (PCN)
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
2. **Änderungskommentar** und **Änderungsgrund** angeben.
3. Unter **Brokerdaten** Adresse, Topic, Benutzername und Passwort des
   Brokers prüfen. Die Adresse muss mit `ws://` oder `wss://` beginnen, weil
   der Browser die Mitteilung direkt sendet.
4. **Senden**.

Der Designer legt die Änderung als neuen Eintrag unter `Records` an,
speichert die AAS und schickt dann eine Nachricht an den Broker. Schlägt der
Versand fehl, bleibt der Eintrag in der AAS trotzdem erhalten.

## Mitteilungen abonnieren (Abnehmer)

Übernimmt man eine fremde AAS mit diesem Teilmodell, z. B. über
**Importieren in …** oder **Duplizieren** in der
[Liste der Verwaltungsschalen](./aas-verwalten.md), fragt der Designer, ob
man Aktualisierungen zu diesem Produkt erhalten möchte. **Ja** öffnet den
Dialog **PCN einrichten** mit Broker-Adresse, Topic, Benutzername und
Passwort.

Später lässt sich das Abonnement im Editor beim Teilmodell einrichten oder
verwalten (eingehendes Ereignis `PcnEventsIncoming`):

- **PCN einrichten** legt das Abonnement an; der Empfang ist sofort aktiv.
- **Aktivieren** bzw. **Deaktivieren** schaltet den Empfang ein oder aus.
- **Löschen** beendet das Abonnement.

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

Die Details einer Mitteilung lädt der Browser direkt vom AAS-Server des
Herstellers. Er muss dafür ohne Anmeldung erreichbar sein.
