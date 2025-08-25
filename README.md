# poulet

📊 **SDK JavaScript léger** pour mesurer le **temps réellement actif** sur une application web, collecter des **événements métier**, permettre aux testeurs de **soumettre des bugs**, et alimenter un serveur pour **rémunérer automatiquement** le temps/bounties.

* ✅ **Web SDK** (Vanilla JS, ESM, CJS, IIFE pour CDN)
* ✅ **Adapter React** (`<MetricsProvider>` + `useMetrics`)
* ✅ Respect **RGPD** & **Do Not Track**
* ✅ Anti-fraude : inactivité, onglets multiples, jitter, rythme plausible
* ✅ Transport fiable (`sendBeacon` → `fetch` + queue offline)
* ✅ Poids < 12 kB gzip (core sans bug reporter UI)

---

## ✨ Fonctionnalités

* **Sessions** : ouverture/fermeture automatique, `session.start` & `session.end`.
* **Heartbeats** : signaux réguliers envoyés **seulement si actif** (onglet visible + interaction récente).
* **Événements** : `trackEvent(name, props)` pour instrumenter vos étapes métier.
* **Bugs** : `reportBug({title, description, severity})` pour collecter les remontées des testeurs.
* **Consentement RGPD** : démarre en *pending*, active la mesure après `setConsent`.
* **Anti-fraude** :

    * pause si onglet caché,
    * pause si inactif > X secondes,
    * un seul onglet “leader” envoie les heartbeats,
    * jitter sur l’intervalle pour éviter les patterns parfaits.
* **Transport** : batching, retries, offline queue, `sendBeacon` en priorité.
* **Interopérabilité** : IIFE (CDN global `window.PouletMetrics`), ESM/CJS (`import { init } from 'poulet'`), React (`poulet/react`).

---

## 📦 Installation

### NPM

```bash
npm install poulet
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/poulet/dist/index.global.js" defer></script>
<script>
  window.PouletMetrics.init({
    projectKey: 'PUB_DEMO',
    endpoint: 'https://collector.example.com',
    consent: { default: 'pending' },
    privacy: { dntRespect: true },
    debug: true
  });
</script>
```

---

## 🚀 Usage

### Vanilla (site classique)

```html
<script src="https://cdn.jsdelivr.net/npm/poulet/dist/index.global.js" defer></script>
<script>
  window.PouletMetrics.init({
    projectKey: 'PUB_123',
    endpoint: 'https://collector.example.com',
    consent: { default: 'pending' },
    privacy: { dntRespect: true }
  });

  // Consentement obtenu via CMP
  window.PouletMetrics.setConsent({ analytics: true });

  // Envoi d’un événement
  window.PouletMetrics.trackEvent('cta_click', { variant: 'A' });

  // Signalement d’un bug
  window.PouletMetrics.reportBug({
    title: 'Texte coupé',
    severity: 'minor',
    description: 'Le bouton est tronqué en responsive'
  });
</script>
```

---

### React

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MetricsProvider, useMetrics } from 'poulet/react';

function Demo() {
  const { trackEvent, reportBug, setConsent } = useMetrics();
  return (
    <div>
      <button onClick={() => setConsent({ analytics: true })}>Autoriser tracking</button>
      <button onClick={() => trackEvent('clicked_button', { place: 'hero' })}>Event</button>
      <button onClick={() => reportBug({ title: 'Bug React', severity: 'ux' })}>Bug</button>
    </div>
  );
}

createRoot(document.getElementById('root')!)
  .render(<MetricsProvider config={{
    projectKey: 'PUB_123',
    endpoint: 'https://collector.example.com',
    consent: { default: 'pending' },
    privacy: { dntRespect: true }
  }}>
    <Demo/>
  </MetricsProvider>);
```

---

## 🛠 API

### `init(config: Config)`

Initialise le SDK.
Principaux champs :

```ts
{
  projectKey: string,        // Identifiant projet
  endpoint: string,          // URL collector
  consent?: { default:'pending'|'granted'|'denied' },
  user?: { testerPseudoId?: string }, // pas de PII
  billing?: { heartbeatSec?:number; idleSec?:number; maxHoursPerDay?:number },
  privacy?: { piiFilter?:boolean; dntRespect?:boolean; countryHint?:string },
  security?: { hmacPublicKey?:string },
  features?: { bugReporter?:boolean; replay?:boolean; sentryBridge?:boolean },
  debug?: boolean
}
```

### `setConsent({ analytics?: boolean; replay?: boolean })`

Active ou désactive la collecte selon le consentement.

### `trackEvent(name: string, props?: object)`

Déclare un événement métier.

### `reportBug({ title, description?, severity?, attachments? })`

Envoie un bug (texte + option capture/pièce jointe).

### `shutdown()`

Ferme la session et flush la queue.

### `getSessionId()`

Retourne l’ID de la session courante.

### `forgetMe()`

Stoppe la collecte et purge localement (utile pour RGPD).

---

## 📤 Événements envoyés

* `session.start` → ouverture d’une session (id, ua, tz, consentFlags).
* `heartbeat` → ping régulier **si actif**.
* `event` → événement métier.
* `bug` → bug report.
* `session.end` → fermeture volontaire ou `pagehide`.

---

## 🔒 Anti-fraude

* **Actif uniquement si** : onglet visible + interaction récente (< idleSec).
* **Un seul onglet leader** émet.
* **Jitter** ±10% sur l’intervalle heartbeat.
* **Contrôles côté serveur** :

    * rythme plausible (7s–45s),
    * plafonds d’heures/jour/testeur,
    * rejet des heartbeats inactifs.

---

## 🛡 Confidentialité & RGPD

* **Consentement** requis (`setConsent`).
* **Respect DNT** (`navigator.doNotTrack === "1"`).
* **Minimisation** : pas de PII, identifiants pseudonymisés.
* **Droits utilisateurs** : `forgetMe()` côté SDK, endpoint côté serveur pour effacement complet.
* **DPA** requis si usage de SaaS tiers (Sentry, PostHog).

---

## ⚡ Transport & Offline

* Envoi via `sendBeacon` si possible, sinon `fetch`.
* Batching (par 10–20 événements).
* Queue offline (IndexedDB en option).
* Retry exponentiel.

---

## 🔧 Exemple collector minimal (Express)

```js
app.post('/ingest', (req,res) => {
  const { projectKey, items } = req.body || {};
  items.forEach(it => console.log(it));
  res.json({ ok: true, received: items.length });
});
```

---

## 📊 Calcul minutes facturables (côté serveur)

```js
minutes = (#heartbeats_valides × heartbeatSec) / 60
```

Valide → `active:true, vis:true, idle:false` + intervalle plausible.

---

## 📡 CDN

Disponible via :

* **jsDelivr** :
  `https://cdn.jsdelivr.net/npm/poulet/dist/index.global.js`
* **unpkg** :
  `https://unpkg.com/poulet/dist/index.global.js`

Ajoute un **SRI hash** en prod pour renforcer la sécurité.

---

## 📦 Publication

```bash
npm run build
npm publish --access public
```

* **Exports** :

    * `poulet` → core ESM/CJS
    * `poulet/react` → adapter React
    * `poulet/iife` → **[bundle]()** global pour `<script>`

---

## ✅ Roadmap

* [x] Sessions, heartbeats, events, bugs
* [x] Consentement RGPD + DNT
* [x] Anti-fraude (idle, onglets multiples)
* [x] Transport fiable (beacon/fetch/queue)

---

## 📝 Licence

MIT © Poulet du bug

---

Veux-tu que je t’ajoute un **schéma architecture (mermaid)** dans le README pour illustrer le flux **Testeur → SDK → Collector → Paiement** ?
