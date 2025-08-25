// src/transport.ts
import { base64ToArrayBuffer, filterPII, log } from './utils';
import type { OutgoingPayload } from './types';

type TransportConfig = {
    endpoint: string;
    projectKey: string;
    hmacPublicKey?: string; // base64; optional
    debug?: boolean;
};

let cfg: TransportConfig;
let queue: OutgoingPayload[] = [];
let flushing = false;

async function sign(body: string): Promise<string | undefined> {
    if (!cfg.hmacPublicKey || !('crypto' in window)) return undefined;
    try {
        const keyData = base64ToArrayBuffer(cfg.hmacPublicKey);
        const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
        return btoa(String.fromCharCode(...new Uint8Array(sig)));
    } catch {
        return undefined;
    }
}

async function postBatch(items: OutgoingPayload[]) {
    const sanitized = items.map((i) => filterPII(i));
    const body = JSON.stringify({ projectKey: cfg.projectKey, items: sanitized });
    const sig = await sign(body);

    // Try Beacon first
    if (navigator.sendBeacon && !cfg.debug) {
        const headers = { type: 'application/json' };
        const blob = new Blob([body], headers);
        const ok = navigator.sendBeacon(cfg.endpoint + '/ingest', blob);
        if (ok) return true;
    }

    // Fallback fetch
    const res = await fetch(cfg.endpoint + '/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(sig ? { 'x-signature': sig } : {}) },
        body
    });
    return res.ok;
}

export function initTransport(config: TransportConfig) {
    cfg = config;
    window.addEventListener('online', flush);
    setInterval(flush, 5000);
}

export function enqueue(payload: OutgoingPayload) {
    queue.push(payload);
    if (queue.length >= 10) void flush();
}

export async function flush() {
    if (flushing || queue.length === 0) return;
    flushing = true;
    try {
        const batch = queue.splice(0, 20);
        const ok = await postBatch(batch);
        if (!ok) {
            // put back
            queue.unshift(...batch);
            log('flush failed, will retry');
        }
    } catch (e) {
        log('flush error', e);
    } finally {
        flushing = false;
    }
}
