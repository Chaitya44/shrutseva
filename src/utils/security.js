/**
 * ShrutSeva Security Utilities
 * - Sanitizes all user inputs before API calls
 * - Prevents XSS injection
 * - Safe fetch wrapper with timeout + error handling
 */

/** Strip HTML tags and dangerous characters from user input */
export function sanitize(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/<[^>]*>/g, '')          // strip HTML tags
    .replace(/javascript:/gi, '')     // block JS protocol
    .replace(/on\w+\s*=/gi, '')       // block event handlers
    .replace(/['"`;]/g, '')           // block SQL/JS special chars
    .trim()
    .slice(0, 500);                   // max length cap
}

/** Sanitize an entire params object */
export function sanitizeParams(params) {
  const clean = {};
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      clean[sanitize(key)] = sanitize(params[key]);
    }
  }
  return clean;
}

/** Build a safe URLSearchParams string from an object */
export function buildSafeQuery(params) {
  const clean = sanitizeParams(params);
  return new URLSearchParams(clean).toString();
}

/** Fetch wrapper with timeout, no credentials leak, error handling */
export async function safeFetch(url, options = {}, timeoutMs = 15000) {
  // Never send cookies cross-origin, never expose auth tokens in URLs
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: 'same-origin',   // never send cross-origin cookies
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
      },
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Non-JSON response received');
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  }
}

/** Check if a string looks like it contains SQL injection patterns */
export function hasSQLInjection(value) {
  const patterns = /(\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|--|;|\/\*)/i;
  return patterns.test(String(value));
}

/** Validate that input is safe to send to API */
export function isInputSafe(value) {
  if (!value) return true;
  return !hasSQLInjection(value);
}
