/**
 * Tiny TTL cache helper for Pinia stores.
 *
 * Usage in any store:
 *   1. Add `lastFetched: 0` to state
 *   2. In fetch(): `if (!force && isFresh(this.lastFetched)) return`
 *   3. After successful fetch: `this.lastFetched = Date.now()`
 */

export const CACHE_TTL = 30000 // 30 seconds

export function isFresh(lastFetched, ttl = CACHE_TTL) {
  return lastFetched > 0 && Date.now() - lastFetched < ttl
}

export function markFresh() {
  return Date.now()
}

export function invalidate() {
  return 0
}
