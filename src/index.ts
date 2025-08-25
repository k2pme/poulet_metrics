// src/index.ts
import { configure, openSession, closeSession, getSessionIdSafe } from './core';
import { setConsent as _setConsent, initConsent, setDNTPolicy, consentFlags } from './consent';
import { enqueue } from './transport';
import type { Config, EventPayload } from './types';
import { now } from './utils';
export * from './types';
export { reportBug } from './bug';

let initialized = false;

export function init(cfg: Config) {
    if (initialized) return;
    setDNTPolicy(cfg.privacy?.dntRespect ?? true);
    initConsent(cfg.consent?.default ?? 'pending');
    configure(cfg);
    // ouverture paresseuse : dès qu’il y a visibilité/activité
    if (document.visibilityState === 'visible') openSession();
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') openSession();
    });
    // Flush/close sur pagehide
    addEventListener('pagehide', () => closeSession('pagehide'));
    initialized = true;
}

export function setConsent(flags: { analytics?: boolean; replay?: boolean }) {
    _setConsent(flags);
    if (document.visibilityState === 'visible') openSession();
}

export function trackEvent(name: string, props?: Record<string, unknown>) {
    const sessionId = getSessionIdSafe();
    if (!sessionId) return;
    const ev: EventPayload = {
        type: 'event',
        sessionId,
        ts: now(),
        name,
        props,
        purpose: 'diagnostics',
    };
    enqueue(ev);
}

export function shutdown() {
    closeSession('shutdown');
}

export function getSessionId() {
    return getSessionIdSafe();
}

export function forgetMe() {
    // côté core : rien de persistant par défaut (queue en mémoire).
    // si tu ajoutes IndexedDB/localStorage pour queue offline, purge ici.
    // Pour l’exemple, on ne stocke pas persistantement.
    closeSession('shutdown');
}

export const _consentFlags = consentFlags;
