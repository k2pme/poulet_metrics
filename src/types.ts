// src/types.ts
export type ConsentState = 'pending' | 'granted' | 'denied';

export type Config = {
    projectKey: string;
    endpoint: string; // e.g. https://collector.example.com
    consent?: { default: ConsentState };
    user?: { testerPseudoId?: string }; // pseudonyme, pas de PII
    billing?: { heartbeatSec?: number; idleSec?: number; maxHoursPerDay?: number };
    privacy?: { piiFilter?: boolean; dntRespect?: boolean; countryHint?: string };
    security?: { hmacPublicKey?: string }; // base64
    features?: { bugReporter?: boolean; replay?: boolean; sentryBridge?: boolean };
    sampling?: { heartbeats?: number; events?: number; bugs?: number };
    debug?: boolean;
};

export type SessionState = {
    sessionId: string;
    startedAt: number;
    lastActivityAt: number;
    active: boolean;
    leader: boolean; // single-tab leader
};

export type HeartbeatPayload = {
    type: 'heartbeat';
    sessionId: string;
    ts: number;
    active: boolean;
    vis: boolean;
    idle: boolean;
    jitter: number;
    ua: string;
    tz: string;
    dpr: number;
    purpose: 'billing';
};

export type EventPayload = {
    type: 'event';
    sessionId: string;
    ts: number;
    name: string;
    props?: Record<string, unknown>;
    purpose: 'diagnostics';
};

export type BugPayload = {
    type: 'bug';
    sessionId: string;
    ts: number;
    title: string;
    description?: string;
    severity?: 'blocker'|'major'|'minor'|'ux';
    hasCapture?: boolean;
    purpose: 'diagnostics';
};

export type OutgoingPayload = HeartbeatPayload | EventPayload | BugPayload | SessionStart | SessionEnd;

export type SessionStart = {
    type: 'session.start';
    sessionId: string;
    ts: number;
    projectKey: string;
    ua: string;
    tz: string;
    dpr: number;
    consentFlags: { analytics: boolean; replay: boolean };
};

export type SessionEnd = {
    type: 'session.end';
    sessionId: string;
    ts: number;
    reason: 'pagehide'|'timeout'|'shutdown';
};
