// src/utils.ts
export const now = () => Date.now();

export const uuid = (): string =>
    (crypto?.randomUUID?.() ?? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >> 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    }));

export const isVisible = () => typeof document !== 'undefined' && document.visibilityState === 'visible';

export const on = <K extends keyof WindowEventMap>(t: Window, type: K, fn: (e: WindowEventMap[K]) => void) => {
    t.addEventListener(type, fn as any, { passive: true });
    return () => t.removeEventListener(type, fn as any);
};

export const onDoc = <K extends keyof DocumentEventMap>(type: K, fn: (e: DocumentEventMap[K]) => void) => {
    document.addEventListener(type, fn as any, { passive: true });
    return () => document.removeEventListener(type, fn as any);
};

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export const jitterMs = (baseMs: number, pct = 0.1) => {
    const delta = baseMs * pct;
    return baseMs + (Math.random() * 2 - 1) * delta;
};

export const filterPII = (o: any): any => {
    if (!o || typeof o !== 'object') return o;
    const SUSPICIOUS = ['email', 'phone', 'password', 'ssn'];
    const out: any = Array.isArray(o) ? [] : {};
    for (const k of Object.keys(o)) {
        if (SUSPICIOUS.includes(k.toLowerCase())) continue;
        const v = (o as any)[k];
        out[k] = typeof v === 'object' ? filterPII(v) : v;
    }
    return out;
};

export const log = (...args: any[]) => {
    if ((window as any).__POULET_DEBUG__) console.log('[poulet]', ...args);
};

export const base64ToArrayBuffer = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
