// src/consent.ts
import type { ConsentState } from './types';

let analyticsAllowed = false;
let replayAllowed = false;
let state: ConsentState = 'pending';
let dntRespected = true;

export const setDNTPolicy = (respect: boolean) => { dntRespected = respect; };

export const initConsent = (defaultState: ConsentState) => {
    state = defaultState;
    if (dntRespected && typeof navigator !== 'undefined' && (navigator as any).doNotTrack === '1') {
        analyticsAllowed = false;
        replayAllowed = false;
        state = 'denied';
    }
};

export const setConsent = (flags: { analytics?: boolean; replay?: boolean }) => {
    if (typeof flags.analytics === 'boolean') {
        analyticsAllowed = flags.analytics;
        state = analyticsAllowed ? 'granted' : 'denied';
    }
    if (typeof flags.replay === 'boolean') replayAllowed = flags.replay;
};

export const consentFlags = () => ({ analytics: analyticsAllowed, replay: replayAllowed, state });
export const analyticsOn = () => analyticsAllowed === true;
export const replayOn = () => replayAllowed === true;
