// src/core.ts
import { jitterMs, log, now } from './utils';
import { startActivityTracking, stopActivityTracking, isActive, getLastActivity } from './activity';
import { becomeLeaderIfFree, handleStorageLeadership, relinquishLeadership, isLeader, fingerprintLite } from './antifraud';
import { analyticsOn, consentFlags } from './consent';
import { initTransport, enqueue, flush } from './transport';
import type { Config, SessionState, HeartbeatPayload, SessionStart, SessionEnd } from './types';

let config: Required<Config>;
let session: SessionState | null = null;
let hbTimer: number | null = null;
let unStorage: (() => void) | undefined;

const DEFAULTS: Required<Config> = {
    projectKey: '',
    endpoint: '',
    consent: { default: 'pending' },
    user: {},
    billing: { heartbeatSec: 15, idleSec: 60, maxHoursPerDay: 6 },
    privacy: { piiFilter: true, dntRespect: true, countryHint: 'FR' },
    security: { hmacPublicKey: undefined as any },
    features: { bugReporter: true, replay: false, sentryBridge: false },
    sampling: { heartbeats: 1, events: 1, bugs: 1 },
    debug: false,
};

export function configure(cfg: Config) {
    config = { ...DEFAULTS, ...cfg, consent: { ...DEFAULTS.consent, ...cfg.consent } } as Required<Config>;
    (window as any).__POULET_DEBUG__ = !!config.debug;
    initTransport({
        endpoint: config.endpoint,
        projectKey: config.projectKey,
        hmacPublicKey: config.security.hmacPublicKey,
        debug: config.debug,
    });
}

export function openSession() {
    if (session) return;
    const id = crypto.randomUUID();
    const fp = fingerprintLite();
    session = {
        sessionId: id,
        startedAt: now(),
        lastActivityAt: now(),
        active: true,
        leader: becomeLeaderIfFree(id),
    };
    if (unStorage) unStorage();
    unStorage = handleStorageLeadership(id, (lead) => {
        if (session) session.leader = lead;
    });

    startActivityTracking();

    const startPayload: SessionStart = {
        type: 'session.start',
        sessionId: id,
        ts: now(),
        projectKey: config.projectKey,
        ua: fp.ua,
        tz: fp.tz,
        dpr: fp.dpr,
        consentFlags: { analytics: analyticsOn(), replay: false },
    };
    enqueue(startPayload);
    scheduleHeartbeats();
    log('session opened', id);
}

export function closeSession(reason: SessionEnd['reason']) {
    if (!session) return;
    stopHeartbeats();
    stopActivityTracking();
    relinquishLeadership(session.sessionId);
    const endPayload: SessionEnd = { type: 'session.end', sessionId: session.sessionId, ts: now(), reason };
    enqueue(endPayload);
    void flush();
    if (unStorage) unStorage();
    session = null;
    log('session closed', reason);
}

function scheduleHeartbeats() {
    stopHeartbeats();
    const loop = () => {
        if (!session) return;
        if (!analyticsOn()) return; // consent required
        // @ts-ignore
        const idle = (now() - getLastActivity()) >= config.billing.idleSec * 1000;
        const vis = document.visibilityState === 'visible';
        const active = vis && !idle && session.leader;
        const fp = fingerprintLite();

        // @ts-ignore
        if (Math.random() <= config.sampling.heartbeats && active) {
            const hb: HeartbeatPayload = {
                type: 'heartbeat',
                sessionId: session.sessionId,
                ts: now(),
                active: true,
                vis,
                idle: false,
                jitter: Math.random(),
                ua: fp.ua,
                tz: fp.tz,
                dpr: fp.dpr,
                purpose: 'billing',
            };
            enqueue(hb);
        }

        // @ts-ignore
        const next = jitterMs(config.billing.heartbeatSec * 1000, 0.1);
        hbTimer = window.setTimeout(loop, next);
    };
    // @ts-ignore
    hbTimer = window.setTimeout(loop, jitterMs(config.billing.heartbeatSec * 1000, 0.1));
}

function stopHeartbeats() {
    if (hbTimer) {
        clearTimeout(hbTimer);
        hbTimer = null;
    }
}

export const getSessionIdSafe = () => session?.sessionId ?? null;
