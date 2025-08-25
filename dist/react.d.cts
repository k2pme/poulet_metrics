import React from 'react';
import { Config, trackEvent, reportBug, setConsent, shutdown, getSessionId } from './index.cjs';

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
