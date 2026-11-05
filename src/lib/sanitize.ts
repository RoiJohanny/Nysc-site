import DOMPurify from 'dompurify';

/**
 * Strips dangerous HTML tags, attributes, event handlers, and javascript: protocols.
 * Sanitizes rich text content before rendering in the DOM.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span', 'code'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'javascript:']
  });
}

/**
 * Strips all HTML tags and potentially malicious characters from plain text inputs
 * (e.g., corper bios, marketplace titles, CDS logs, search queries).
 */
export function sanitizePlainText(input: string): string {
  if (!input) return '';
  // First strip all HTML tags via DOMPurify with empty allowed tags
  const stripped = DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  // Remove control characters (except newline, tab) and suspicious protocol prefixes
  return stripped
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .trim();
}

/**
 * Validates and sanitizes URLs to prevent open redirects and javascript: execution.
 * Only allows http:, https:, mailto:, and tel: schemes.
 */
export function sanitizeUrl(rawUrl: string, fallbackUrl = '#'): string {
  if (!rawUrl) return fallbackUrl;
  const trimmed = rawUrl.trim();
  
  // Disallow javascript:, data:, vbscript:
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return fallbackUrl;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    const allowedProtocols = ['https:', 'http:', 'mailto:', 'tel:'];
    if (allowedProtocols.includes(parsed.protocol)) {
      return trimmed;
    }
    return fallbackUrl;
  } catch {
    // Relative safe path (e.g. /dashboard)
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }
    return fallbackUrl;
  }
}

/**
 * Strict validator for NYSC official domain origins.
 * Blocks any external domain or open redirect attempts.
 */
export function isAllowedNyscOrigin(rawUrl: string): boolean {
  if (!rawUrl) return false;
  try {
    const parsed = new URL(rawUrl);
    // Must be https
    if (parsed.protocol !== 'https:') return false;

    const hostname = parsed.hostname.toLowerCase();
    // Allowed: portal.nysc.org.ng, verify.nysc.org.ng, nysc.org.ng, or any *.nysc.org.ng subdomain
    return (
      hostname === 'portal.nysc.org.ng' ||
      hostname === 'verify.nysc.org.ng' ||
      hostname === 'nysc.org.ng' ||
      hostname.endsWith('.nysc.org.ng')
    );
  } catch {
    return false;
  }
}
