/**
 * Anti-Automation & Rate Limiting Utility
 * Tracks timestamps for critical user actions to mitigate spam, automated abuse, and webhook flood attacks.
 */

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
  errorMessage?: string;
}

const STORAGE_PREFIX = 'nysc_ratelimit_';

/**
 * Checks and records an action attempt against a rate limiting window.
 *
 * @param actionKey Unique identifier for the action (e.g., 'feedback_submit', 'sos_trigger')
 * @param maxAttempts Maximum allowed attempts within the window
 * @param windowMs Time window in milliseconds
 */
export function checkAndRecordRateLimit(
  actionKey: string,
  maxAttempts: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const storageKey = `${STORAGE_PREFIX}${actionKey}`;

  let timestamps: number[] = [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out expired timestamps
        timestamps = parsed.filter((t: number) => typeof t === 'number' && now - t < windowMs);
      }
    }
  } catch {
    timestamps = [];
  }

  // Check if limit exceeded
  if (timestamps.length >= maxAttempts) {
    const oldest = timestamps[0];
    const resetInMs = Math.max(0, oldest + windowMs - now);
    const resetInSeconds = Math.ceil(resetInMs / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
      errorMessage: `Rate limit reached. Please wait ${resetInSeconds}s before trying again.`
    };
  }

  // Record this attempt
  timestamps.push(now);
  try {
    localStorage.setItem(storageKey, JSON.stringify(timestamps));
  } catch {}

  const remaining = maxAttempts - timestamps.length;
  const oldest = timestamps[0];
  const resetInSeconds = Math.ceil(Math.max(0, oldest + windowMs - now) / 1000);

  return {
    allowed: true,
    remaining,
    resetInSeconds
  };
}

/**
 * Pre-check rate limit status without consuming an attempt.
 */
export function getRateLimitStatus(
  actionKey: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const storageKey = `${STORAGE_PREFIX}${actionKey}`;

  let timestamps: number[] = [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        timestamps = parsed.filter((t: number) => typeof t === 'number' && now - t < windowMs);
      }
    }
  } catch {
    timestamps = [];
  }

  if (timestamps.length >= maxAttempts) {
    const oldest = timestamps[0];
    const resetInSeconds = Math.ceil(Math.max(0, oldest + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  return {
    allowed: true,
    remaining: maxAttempts - timestamps.length,
    resetInSeconds: 0
  };
}

// Security Configuration Constraints
export const RATE_LIMITS = {
  // Max 3 feedback submissions per 10 minutes
  FEEDBACK: {
    key: 'user_feedback_submit',
    max: 3,
    windowMs: 10 * 60 * 1000,
    label: 'feedback submissions'
  },
  // Max 5 emergency SOS trigger attempts per minute
  SOS: {
    key: 'emergency_sos_trigger',
    max: 5,
    windowMs: 60 * 1000,
    label: 'emergency SOS triggers'
  }
} as const;

/**
 * Login Rate Limiting & Account Security Configuration:
 * - 3 consecutive failed attempts: 3-minute (180s) cooldown timer block with prominent warning banner.
 * - After cooldown expires: allow 2 more attempts.
 * - If user fails 2 more times (5 total failed attempts): lock login form and require email password reset via Supabase Auth resetPasswordForEmail.
 */
export interface LoginSecurityState {
  failedAttempts: number;
  cooldownUntil: number | null; // Epoch ms timestamp
  isPermanentlyLocked: boolean; // True when 5 total failed attempts reached
  lastFailedAt: number | null;
}

export const LOGIN_RATE_LIMIT = {
  FIRST_COOLDOWN_FAILURES: 3,
  TOTAL_LOCKOUT_FAILURES: 5,
  COOLDOWN_SECONDS: 180, // 3 minutes = 180 seconds
  COOLDOWN_MS: 180 * 1000,
  STORAGE_KEY: 'nysc_login_security_lockout'
} as const;

export function getLoginSecurityState(): LoginSecurityState {
  try {
    const raw = localStorage.getItem(LOGIN_RATE_LIMIT.STORAGE_KEY);
    if (raw) {
      const parsed: LoginSecurityState = JSON.parse(raw);
      // Auto-expire cooldown if timer passed
      if (parsed.cooldownUntil && Date.now() >= parsed.cooldownUntil) {
        parsed.cooldownUntil = null;
        try {
          localStorage.setItem(LOGIN_RATE_LIMIT.STORAGE_KEY, JSON.stringify(parsed));
        } catch {}
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse login security state:', e);
  }

  return {
    failedAttempts: 0,
    cooldownUntil: null,
    isPermanentlyLocked: false,
    lastFailedAt: null
  };
}

export function recordFailedLoginAttempt(): LoginSecurityState {
  const current = getLoginSecurityState();
  const newAttempts = current.failedAttempts + 1;
  const now = Date.now();

  let cooldownUntil: number | null = current.cooldownUntil;
  let isPermanentlyLocked = current.isPermanentlyLocked;

  // Rule 1: 3 consecutive failures -> 180s (3-minute) cooldown timer block
  if (newAttempts === LOGIN_RATE_LIMIT.FIRST_COOLDOWN_FAILURES) {
    cooldownUntil = now + LOGIN_RATE_LIMIT.COOLDOWN_MS;
  }

  // Rule 2 & 3: If fails 2 more times (5 total failed attempts) -> lock form permanently
  if (newAttempts >= LOGIN_RATE_LIMIT.TOTAL_LOCKOUT_FAILURES) {
    isPermanentlyLocked = true;
    cooldownUntil = null;
  }

  const updated: LoginSecurityState = {
    failedAttempts: newAttempts,
    cooldownUntil,
    isPermanentlyLocked,
    lastFailedAt: now
  };

  try {
    localStorage.setItem(LOGIN_RATE_LIMIT.STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  return updated;
}

export function resetLoginSecurityState(): void {
  try {
    localStorage.removeItem(LOGIN_RATE_LIMIT.STORAGE_KEY);
  } catch {}
}

export function getLoginCooldownRemainingSeconds(): number {
  const state = getLoginSecurityState();
  if (!state.cooldownUntil) return 0;
  const remainingMs = state.cooldownUntil - Date.now();
  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
}
