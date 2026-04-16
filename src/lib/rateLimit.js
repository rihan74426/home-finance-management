/**
 * In-memory rate limiter for Next.js API routes.
 * Uses a sliding window. Resets on server restart — good enough for Phase 1.
 * Upgrade to Redis (upstash/ratelimit) before heavy traffic.
 *
 * Usage:
 *   import { rateLimit } from "@/lib/rateLimit";
 *   const limited = await rateLimit(clerkId, "ledger", 20, 60);
 *   if (limited) return Response.json({ success: false, error: "Too many requests" }, { status: 429 });
 */

// Global map survives hot-reload in dev because of Next.js module caching
const store = global._rateLimitStore || (global._rateLimitStore = new Map());

/**
 * @param {string} identifier  - unique key (clerkId, IP, etc.)
 * @param {string} action      - namespace (e.g. "ledger", "split")
 * @param {number} limit       - max requests allowed in the window
 * @param {number} windowSecs  - sliding window in seconds
 * @returns {boolean} true if the request should be blocked
 */
export function rateLimit(identifier, action, limit = 30, windowSecs = 60) {
  const key = `${action}:${identifier}`;
  const now = Date.now();
  const windowMs = windowSecs * 1000;

  let record = store.get(key);
  if (!record) {
    record = { timestamps: [] };
    store.set(key, record);
  }

  // Remove timestamps outside the window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    return true; // blocked
  }

  record.timestamps.push(now);
  return false; // allowed
}

/**
 * Preset limiters for common routes.
 * Returns a 429 Response if limited, null otherwise.
 */
export function limitApi(clerkId, action) {
  const limits = {
    // Reads — generous
    read: { limit: 60, window: 60 },
    // Mutations — tighter
    write: { limit: 20, window: 60 },
    // Expensive operations
    split: { limit: 5, window: 60 },
    invite: { limit: 10, window: 300 },
    // Auth-adjacent
    default: { limit: 30, window: 60 },
  };

  const cfg = limits[action] || limits.default;
  const blocked = rateLimit(clerkId, action, cfg.limit, cfg.window);

  if (blocked) {
    return Response.json(
      { success: false, error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(cfg.window) } }
    );
  }
  return null;
}

// Added helper: derive an identifier from the incoming Request
export function getRequestIdentifier(request) {
  // Works with App Router route handlers (Web Request)
  try {
    const headers = request.headers;
    // Prefer explicit Clerk/user header if present
    const clerk = headers.get?.('x-clerk-id') || headers.get?.('x-user-id');
    if (clerk) return clerk;

    // Fallback to Authorization header (e.g. bearer token fingerprint)
    const auth = headers.get?.('authorization');
    if (auth) return auth;

    // Finally fallback to IP via common headers
    const forwarded = headers.get?.('x-forwarded-for') || headers.get?.('x-real-ip');
    if (forwarded) return forwarded.split(',')[0].trim();

  } catch (e) {
    // ignore and fallthrough
  }
  return 'anon';
}
