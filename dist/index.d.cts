type ConsentState = 'pending' | 'granted' | 'denied';
type Config = {
    projectKey: string;
    endpoint: string;
    consent?: {
        default: ConsentState;
    };
    user?: {
        testerPseudoId?: string;
    };
    billing?: {
        heartbeatSec?: number;
        idleSec?: number;
        maxHoursPerDay?: number;
    };
    privacy?: {
        piiFilter?: boolean;
        dntRespect?: boolean;
        countryHint?: string;
    };
    security?: {
        hmacPublicKey?: string;
    };
    features?: {
        bugReporter?: boolean;
        replay?: boolean;
        sentryBridge?: boolean;
    };
    sampling?: {
        heartbeats?: number;
        events?: number;
        bugs?: number;
    };
    debug?: boolean;
};
type SessionState = {
    sessionId: string;
    startedAt: number;
    lastActivityAt: number;
    active: boolean;
    leader: boolean;
};
type HeartbeatPayload = {
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
type EventPayload = {
    type: 'event';
    sessionId: string;
    ts: number;
    name: string;
    props?: Record<string, unknown>;
    purpose: 'diagnostics';
};
type BugPayload = {
    type: 'bug';
    sessionId: string;
    ts: number;
    title: string;
    description?: string;
    severity?: 'blocker' | 'major' | 'minor' | 'ux';
    hasCapture?: boolean;
    purpose: 'diagnostics';
};
type OutgoingPayload = HeartbeatPayload | EventPayload | BugPayload | SessionStart | SessionEnd;
type SessionStart = {
    type: 'session.start';
    sessionId: string;
    ts: number;
    projectKey: string;
    ua: string;
    tz: string;
    dpr: number;
    consentFlags: {
        analytics: boolean;
        replay: boolean;
    };
};
type SessionEnd = {
    type: 'session.end';
    sessionId: string;
    ts: number;
    reason: 'pagehide' | 'timeout' | 'shutdown';
};

declare function reportBug(payload: {
    title: string;
    description?: string;
    severity?: 'blocker' | 'major' | 'minor' | 'ux';
    attachments?: Blob[];
}): void;

declare function init(cfg: Config): void;
declare function setConsent(flags: {
    analytics?: boolean;
    replay?: boolean;
}): void;
declare function trackEvent(name: string, props?: Record<string, unknown>): void;
declare function shutdown(): void;
declare function getSessionId(): string | null;
declare function forgetMe(): void;
declare const _consentFlags: () => {
    analytics: boolean;
    replay: boolean;
    state: ConsentState;
};

export { type BugPayload, type Config, type ConsentState, type EventPayload, type HeartbeatPayload, type OutgoingPayload, type SessionEnd, type SessionStart, type SessionState, _consentFlags, forgetMe, getSessionId, init, reportBug, setConsent, shutdown, trackEvent };
