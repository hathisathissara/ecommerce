// src/lib/rateLimit.ts

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();

export function checkLoginRateLimit(
  ip: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetInMinutes: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetInMinutes: Math.ceil(windowMs / 60000),
    };
  }

  if (entry.count >= maxAttempts) {
    const resetInMinutes = Math.ceil((entry.resetTime - now) / 60000);
    return { allowed: false, remaining: 0, resetInMinutes };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetInMinutes: Math.ceil((entry.resetTime - now) / 60000),
  };
}

export function resetLoginRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}
