// Telemetria leve: Sentry (erros) + Plausible ou GA4 (analytics) via variáveis de ambiente

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

const SENTRY_DSN = (env.VITE_SENTRY_DSN || '').trim();
const GA4_ID = (env.VITE_GA4_ID || '').trim();
const PLAUSIBLE_DOMAIN = (env.VITE_PLAUSIBLE_DOMAIN || '').trim();

let initialized = false;

function parseSentryDsn(dsn) {
  try {
    const url = new URL(dsn);
    const key = url.username;
    const projectId = url.pathname.replace(/\//g, '');
    if (!key || !projectId) return null;
    return {
      endpoint: `${url.protocol}//${url.host}/api/${projectId}/store/`,
      key
    };
  } catch {
    return null;
  }
}

export function reportError(error, context = {}) {
  if (typeof window === 'undefined' || !SENTRY_DSN) return;
  const parsed = parseSentryDsn(SENTRY_DSN);
  if (!parsed) return;

  try {
    const payload = {
      event_id: crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : String(Date.now()),
      platform: 'javascript',
      level: 'error',
      timestamp: Math.floor(Date.now() / 1000),
      message: error?.message || String(error),
      extra: context,
      request: { url: window.location.href }
    };
    fetch(`${parsed.endpoint}?sentry_key=${encodeURIComponent(parsed.key)}&sentry_version=7`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});
  } catch {
    // Falha silenciosa para nunca quebrar a UI
  }
}

export function trackEvent(eventName, props = {}) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.plausible === 'function') {
      window.plausible(eventName, { props });
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, props);
    }
  } catch {
    // Ignore analytics errors
  }
}

export function initTelemetry() {
  if (typeof window === 'undefined' || initialized) return;
  initialized = true;

  if (SENTRY_DSN) {
    window.addEventListener('error', (ev) => {
      reportError(ev.error || ev.message, { filename: ev.filename, lineno: ev.lineno });
    });
    window.addEventListener('unhandledrejection', (ev) => {
      reportError(ev.reason || 'Unhandled Promise Rejection');
    });
  }

  if (PLAUSIBLE_DOMAIN && !document.querySelector('script[data-vagago-plausible]')) {
    const s = document.createElement('script');
    s.defer = true;
    s.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
    s.setAttribute('data-vagago-plausible', 'true');
    s.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(s);
  }

  if (GA4_ID && !document.querySelector('script[data-vagago-ga4]')) {
    const s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-vagago-ga4', 'true');
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, { anonymize_ip: true });
  }
}
