// Utilitários de segurança cliente/servidor: hash de senha (SHA-256 + salt) e sanitização anti-XSS

export function sanitizeText(value = '', maxLength = 500) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, maxLength);
}

function generateSaltHex(bytes = 12) {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).slice(2, 14);
}

async function sha256Hex(text) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback determinístico caso ambiente sem WebCrypto subtle
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export async function hashPassword(password) {
  const salt = generateSaltHex();
  const digest = await sha256Hex(`${salt}:${String(password || '')}`);
  return `sha256$${salt}$${digest}`;
}

export async function verifyPassword(password, storedHash) {
  if (!storedHash || !String(storedHash).startsWith('sha256$')) {
    return false;
  }
  const parts = String(storedHash).split('$');
  if (parts.length !== 3) return false;
  const [, salt, expectedDigest] = parts;
  const actualDigest = await sha256Hex(`${salt}:${String(password || '')}`);
  return actualDigest === expectedDigest;
}
