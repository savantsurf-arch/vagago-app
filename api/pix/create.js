import {
  calculateSplitBreakdown,
  buildSandboxPixPayload,
  resolvePixProvider,
  createAsaasPixPayment,
  createMercadoPagoPixPayment
} from '../_lib/pixProviders.js';
import { applyRateLimit, verifyCsrfOrigin, sanitizeString } from '../_lib/security.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!verifyCsrfOrigin(req, res)) return;
  if (!applyRateLimit(req, res, { windowMs: 60_000, max: 25, bucket: 'pix-create' })) return;

  try {
    const {
      amount,
      bookingNumber = `VG-${Math.floor(10000 + Math.random() * 90000)}`,
      spaceTitle = 'Garagem VagaGo Itabuna',
      payerName,
      payerEmail,
      payerCpf,
      hostWalletId,
      isDayOff = false
    } = req.body || {};

    const cleanBookingNumber = sanitizeString(bookingNumber, 32);
    const cleanSpaceTitle = sanitizeString(spaceTitle, 120);

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0 || numAmount > 10000) {
      return res.status(400).json({ error: 'Valor da cobrança Pix inválido.' });
    }

    const splitBreakdown = calculateSplitBreakdown({
      amount: numAmount,
      feePercent: 10,
      isDayOff: Boolean(isDayOff)
    });

    const provider = resolvePixProvider();

    if (provider === 'asaas') {
      const payment = await createAsaasPixPayment({
        amount: numAmount,
        bookingNumber: cleanBookingNumber,
        description: `VagaGo | ${cleanSpaceTitle} (#${cleanBookingNumber})`,
        customerName: sanitizeString(payerName, 100),
        customerCpf: payerCpf,
        customerEmail: sanitizeString(payerEmail, 120),
        hostWalletId,
        splitBreakdown
      });
      return res.status(200).json(payment);
    }

    if (provider === 'mercadopago') {
      const host = req.headers.host || 'vagago-app.vercel.app';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const payment = await createMercadoPagoPixPayment({
        bookingNumber: cleanBookingNumber,
        description: `VagaGo | ${cleanSpaceTitle} (#${cleanBookingNumber})`,
        payerEmail: sanitizeString(payerEmail, 120),
        payerName: sanitizeString(payerName, 100),
        splitBreakdown,
        notificationUrl: `${protocol}://${host}/api/pix/webhook`
      });
      return res.status(200).json(payment);
    }

    // Modo Sandbox quando ASAAS_API_KEY / MP_ACCESS_TOKEN ainda não estão configurados
    const pixCopyPaste = buildSandboxPixPayload({
      amount: splitBreakdown.amount,
      bookingNumber: cleanBookingNumber
    });

    return res.status(200).json({
      provider: 'sandbox',
      mode: 'sandbox',
      paymentId: `sbx_${cleanBookingNumber}_${Date.now()}`,
      status: 'PENDING',
      pixCopyPaste,
      qrImageBase64: null,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      split: splitBreakdown,
      notice: 'Modo Sandbox: configure ASAAS_API_KEY ou MP_ACCESS_TOKEN na Vercel para cobrança Pix em produção.'
    });
  } catch (err) {
    console.error('Erro /api/pix/create:', err);
    return res.status(502).json({
      error: err?.message || 'Não foi possível gerar a cobrança Pix no momento.',
      retryable: true
    });
  }
}
