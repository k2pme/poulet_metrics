import React from 'react';

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

declare function reportBug(payload: {
    title: string;
    description?: string;
    severity?: 'blocker' | 'major' | 'minor' | 'ux';
    attachments?: Blob[];
}): void;

declare function setConsent(flags: {
    analytics?: boolean;
    replay?: boolean;
}): void;
declare function trackEvent(name: string, props?: Record<string, unknown>): void;
declare function shutdown(): void;
declare function getSessionId(): string | null;

declare const MetricsProvider: React.FC<{
    config: Config;
    children: React.ReactNode;
}>;
declare const useMetrics: () => {
    trackEvent: typeof trackEvent;
    reportBug: typeof reportBug;
    setConsent: typeof setConsent;
    shutdown: typeof shutdown;
    getSessionId: typeof getSessionId;
};

export { MetricsProvider, useMetrics };
