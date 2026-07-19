import { useState, useRef, useCallback, useEffect } from "react";

const MAX_ATTEMPTS = 3;
const WINDOW_MS = 30_000;      // 30 seconds window
const COOLDOWN_MS = 30_000;    // 30 seconds cooldown after max

interface RateLimitState {
  /** Whether the demo button is allowed to fire */
  allowed: boolean;
  /** Human-readable cooldown message (empty when allowed) */
  message: string;
  /** Seconds remaining in cooldown (0 when allowed) */
  cooldownSeconds: number;
  /** Number of attempts used in the current window */
  attemptsUsed: number;
  /** Total attempts allowed per window */
  maxAttempts: number;
}

export function useDemoRateLimiter(): {
  state: RateLimitState;
  recordAttempt: () => void;
} {
  const timestamps = useRef<number[]>([]);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [, setTick] = useState(0);

  // Tick every second while cooldown is active
  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      if (Date.now() >= cooldownUntil) {
        clearInterval(id);
      }
    }, 200);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const recordAttempt = useCallback(() => {
    const t = Date.now();
    timestamps.current.push(t);

    // Prune timestamps outside the window
    timestamps.current = timestamps.current.filter((ts) => t - ts < WINDOW_MS);

    if (timestamps.current.length >= MAX_ATTEMPTS) {
      const until = t + COOLDOWN_MS;
      setCooldownUntil(until);
      setTick((s) => s + 1);
    }
  }, []);

  // Compute current state
  const t = Date.now();

  if (cooldownUntil > t) {
    const remaining = Math.ceil((cooldownUntil - t) / 1000);
    return {
      state: {
        allowed: false,
        message: `Too many attempts. Try again in ${remaining}s`,
        cooldownSeconds: remaining,
        attemptsUsed: MAX_ATTEMPTS,
        maxAttempts: MAX_ATTEMPTS,
      },
      recordAttempt,
    };
  }

  // Clear cooldown if expired
  if (cooldownUntil > 0 && cooldownUntil <= t) {
    setCooldownUntil(0);
    timestamps.current = [];
  }

  // Prune stale timestamps and count recent ones
  const recent = timestamps.current.filter((ts) => t - ts < WINDOW_MS);
  const used = recent.length;

  return {
    state: {
      allowed: used < MAX_ATTEMPTS,
      message:
        used >= MAX_ATTEMPTS
          ? "Too many attempts. Please wait..."
          : used > 0
            ? `${MAX_ATTEMPTS - used} demo attempt${MAX_ATTEMPTS - used !== 1 ? "s" : ""} remaining`
            : "",
      cooldownSeconds: 0,
      attemptsUsed: used,
      maxAttempts: MAX_ATTEMPTS,
    },
    recordAttempt,
  };
}
