import { createHash, timingSafeEqual } from 'node:crypto';

// Shared admin check for every write/read-protected route. Files starting
// with "_" are not exposed as endpoints by Vercel.
// Hashing both sides first gives equal-length buffers, so the comparison is
// constant-time and doesn't leak the password length.
export function isAdmin(provided) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof provided !== 'string' || !provided) return false;
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}
