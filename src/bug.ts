// src/bug.ts
import { enqueue } from './transport';
import type { BugPayload } from './types';
import { now } from './utils';
import { getSessionIdSafe } from './core';

export function reportBug(payload: {
    title: string; description?: string;
    severity?: 'blocker'|'major'|'minor'|'ux';
    attachments?: Blob[];
}) {
    const sessionId = getSessionIdSafe();
    if (!sessionId) return;
    const p: BugPayload = {
        type: 'bug',
        sessionId,
        ts: now(),
        title: payload.title,
        description: payload.description,
        severity: payload.severity,
        hasCapture: !!(payload.attachments && payload.attachments.length > 0),
        purpose: 'diagnostics'
    };
    enqueue(p);
    // NOTE: upload des pièces jointes = hors scope core (peut passer par un autre endpoint)
}
