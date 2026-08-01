/** Broadcast channel name for cross-tab cache synchronization. */
const SYNC_CHANNEL = "careertrack-cache-sync";

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const store = new Map<string, CacheEntry>();
export const DEFAULT_TTL = 1_800_000; // 30 minutes — cross-navigation persistence

/* ── BroadcastChannel for cross-tab invalidation ── */
let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  if (!channel) {
    try {
      channel = new BroadcastChannel(SYNC_CHANNEL);
      channel.onmessage = (event: MessageEvent) => {
        const msg = event.data as { type: string; pattern?: string };
        if (msg?.type === "invalidate") {
          if (msg.pattern) {
            for (const key of store.keys()) {
              if (key.startsWith(msg.pattern)) store.delete(key);
            }
          } else {
            store.clear();
          }
        }
      };
    } catch {
      // BroadcastChannel unsupported — cross-tab sync disabled
    }
  }
  return channel;
}

function broadcastInvalidate(pattern?: string): void {
  const ch = getChannel();
  if (ch) {
    try {
      ch.postMessage({ type: "invalidate", pattern });
    } catch {
      // Ignore send failures (e.g., channel closed)
    }
  }
}

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > DEFAULT_TTL) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache(key: string, data: unknown): void {
  store.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(pattern?: string): void {
  // Invalidate locally
  if (!pattern) {
    store.clear();
  } else {
    for (const key of store.keys()) {
      if (key.startsWith(pattern)) store.delete(key);
    }
  }

  // Broadcast to other tabs
  broadcastInvalidate(pattern);
}
