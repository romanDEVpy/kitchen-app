const rateLimitMap = new Map();

// Garbage Collection mechanism: run every 15 minutes to delete expired rate-limit records
// preventing Memory Leaks (OOM) during automated/distributed attacks (DDoS)
if (typeof globalThis.rateLimitInterval === 'undefined') {
  globalThis.rateLimitInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }, 15 * 60 * 1000);
  
  if (typeof globalThis.rateLimitInterval.unref === 'function') {
    globalThis.rateLimitInterval.unref();
  }
}

/**
 * Memory-safe Rate Limiting middleware
 * @param {string} ip Client IP Address
 * @param {number} limit Max allowed requests within window
 * @param {number} windowMs Time window in milliseconds
 * @returns {{blocked: boolean, remaining: number, resetTime: number}}
 */
export function rateLimit(ip, limit = 10, windowMs = 60 * 1000) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    const newRecord = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitMap.set(ip, newRecord);
    return {
      blocked: false,
      remaining: limit - 1,
      resetTime: newRecord.resetTime
    };
  }

  record.count++;
  const blocked = record.count > limit;
  return {
    blocked,
    remaining: Math.max(0, limit - record.count),
    resetTime: record.resetTime
  };
}
