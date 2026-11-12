// Utilitários de segurança no servidor (rate limiting, CSRF Origin, sanitização XSS e validação)

const ipHits = new Map();

export function getClientIp(req) {
  const fwd = req.headers?.['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) {
    return fwd.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

export function applyRateLimit(req, res, { windowMs = 60_000, max = 30, bucket = 'default' } = {}) {
  const now = Date.now();
  const key = `${bucket}:${getClientIp(req)}`;
  const entry = ipHits.get(key);

  if (!entry || now > entry.resetAt) {
    ipHits.set(key, { count: 1, resetAt: now + windowMs });
    if (ipHits.size > 5000) {
      for (const [k, v] of ipHits.entries()) {
        if (now > v.resetAt) ipHits.delete(k);
      }
    }
    return true;
  }

  entry.count += 1;
  if (entry.count > max) {
    const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfterSec));
    res.status(429).json({
      error: 'Muitas requisições em pouco tempo. Aguarde alguns segundos e tente novamente.'
    });
    return false;
  }

  return true;
}

export function verifyCsrfOrigin(req, res) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return true;
  }

  const origin = req.headers?.origin || '';
  const referer = req.headers?.referer || '';
  const host = req.headers?.host || '';

  // Requisições server-to-server sem Origin/Referer somente permitidas em testes locais se host compatível
  const rawSource = origin || referer;
  if (!rawSource) {
    return true;
  }

  try {
    const sourceHost = new URL(rawSource).host.toLowerCase();
    const expectedHost = host.toLowerCase();
    const allowedHosts = new Set([
      expectedHost,
      'vagago-app.vercel.app',
      'localhost:5173',
      'localhost:4173',
      'localhost:3000',
      '127.0.0.1:5173',
      '127.0.0.1:4173'
    ]);

    if (!allowedHosts.has(sourceHost) && !sourceHost.endsWith('.vercel.app')) {
      res.status(403).json({ error: 'Origem da requisição não autorizada (CSRF).' });
      return false;
    }
    return true;
  } catch {
    res.status(403).json({ error: 'Cabeçalho Origin inválido.' });
    return false;
  }
}

export function sanitizeString(value = '', maxLength = 300) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLength);
}

export function validateBookingPayload(body = {}) {
  const errors = [];
  const spaceId = sanitizeString(body.spaceId, 80);
  const date = sanitizeString(body.date, 20);
  const startTime = sanitizeString(body.startTime || '08:00', 10);
  const endTime = sanitizeString(body.endTime || '20:00', 10);
  const planType = ['hora', 'diaria', 'mensal'].includes(body.planType) ? body.planType : 'hora';
  const totalPrice = Number(body.totalPrice);
  const plate = sanitizeString(body.vehicle?.plate || '', 15).toUpperCase();

  if (!spaceId) errors.push('spaceId é obrigatório.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push('Data inválida (use YYYY-MM-DD).');
  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
    errors.push('Horário de entrada/saída inválido.');
  }
  if (!Number.isFinite(totalPrice) || totalPrice <= 0 || totalPrice > 20000) {
    errors.push('Valor total da reserva inválido.');
  }
  if (!plate || plate.length < 6) {
    errors.push('Placa do veículo inválida.');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      spaceId,
      date,
      endDate: sanitizeString(body.endDate || date, 20),
      startTime,
      endTime,
      planType,
      totalPrice: Number(totalPrice.toFixed(2)),
      plate
    }
  };
}
