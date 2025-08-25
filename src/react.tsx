// src/react.tsx
import React, { createContext, useContext, useEffect } from 'react';
import type { Config } from './types';
import { init, trackEvent, reportBug, setConsent, shutdown, getSessionId } from './index';

const Ctx = createContext({ trackEvent, reportBug, setConsent, shutdown, getSessionId });

export const MetricsProvider: React.FC<{ config: Config; children: React.ReactNode }> = ({ config, children }) => {
    useEffect(() => { init(config); }, []); // eslint-disable-line
    return <Ctx.Provider value={{ trackEvent, reportBug, setConsent, shutdown, getSessionId }}>{children}</Ctx.Provider>;
};

export const useMetrics = () => useContext(Ctx);
