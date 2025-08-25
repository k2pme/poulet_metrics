// src/antifraud.ts
const LS_KEY = 'poulet_leader_session';
let leader = false;

export const becomeLeaderIfFree = (sessionId: string): boolean => {
    const current = localStorage.getItem(LS_KEY);
    if (!current) {
        localStorage.setItem(LS_KEY, sessionId);
        leader = true;
        return true;
    }
    leader = current === sessionId;
    return leader;
};

export const relinquishLeadership = (sessionId: string) => {
    const current = localStorage.getItem(LS_KEY);
    if (current === sessionId) {
        localStorage.removeItem(LS_KEY);
    }
    leader = false;
};

export const isLeader = () => leader;

export const handleStorageLeadership = (sessionId: string, onChange: (isLeader: boolean)=>void) => {
    const listener = (e: StorageEvent) => {
        if (e.key !== LS_KEY) return;
        const now = localStorage.getItem(LS_KEY);
        const newLeader = now === sessionId || !now;
        if (!now) { // try claim
            localStorage.setItem(LS_KEY, sessionId);
            onChange(true);
            leader = true;
        } else {
            leader = now === sessionId;
            onChange(leader);
        }
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
};

export const fingerprintLite = () => ({
    ua: navigator.userAgent,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
    dpr: window.devicePixelRatio || 1,
});
