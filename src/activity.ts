// src/activity.ts
import { isVisible, onDoc, on } from './utils';

let lastActivity = Date.now();
let unsub: Array<() => void> = [];

export const getLastActivity = () => lastActivity;

export const startActivityTracking = () => {
    stopActivityTracking();
    const touch = () => { lastActivity = Date.now(); };
    const un1 = onDoc('mousemove', touch);
    const un2 = onDoc('keydown', touch);
    const un3 = onDoc('scroll', touch);
    const un4 = onDoc('touchstart', touch);
    const un5 = on(window, 'focus', touch);
    const un6 = on(window, 'blur', touch);
    const un7 = onDoc('visibilitychange' as any, touch);
    unsub = [un1, un2, un3, un4, un5, un6, un7];
};

export const stopActivityTracking = () => {
    unsub.forEach((f) => f());
    unsub = [];
};

export const isActive = (idleSec: number) => {
    const idleMs = idleSec * 1000;
    return isVisible() && (Date.now() - lastActivity) < idleMs;
};
