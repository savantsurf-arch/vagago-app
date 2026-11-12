import { mapProviderStatus } from '../_lib/pixProviders.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { paymentId, provider } = req.query || {};
  if (!paymentId) {
    return res.status(400).json({ error: 'paymentId é obrigatório.' });
  }

  try {
    if (provider === 'asaas' && process.env.ASAAS_API_KEY) {
      const baseUrl = (process.env.ASAAS_BASE_URL || 'https://api.asaas.com/v3').replace(/\/$/, '');
      const resp = await fetch(`${baseUrl}/payments/${encodeURIComponent(paymentId)}`, {
        headers: { access_token: process.env.ASAAS_API_KEY }
      });
      const data = await resp.json();
      if (!resp.ok) {
        return res.status(502).json({ error: 'Erro ao consultar pagamento no Asaas.', retryable: true });
      }
      return res.status(200).json({
        paymentId,
        provider: 'asaas',
        status: mapProviderStatus(data.status),
        rawStatus: data.status
      });
    }

    if (provider === 'mercadopago' && process.env.MP_ACCESS_TOKEN) {
      const resp = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const data = await resp.json();
      if (!resp.ok) {
        return res.status(502).json({ error: 'Erro ao consultar pagamento no Mercado Pago.', retryable: true });
      }
      return res.status(200).json({
        paymentId,
        provider: 'mercadopago',
        status: mapProviderStatus(data.status),
        rawStatus: data.status
      });
    }

    return res.status(200).json({
      paymentId,
      provider: 'sandbox',
      status: 'APPROVED',
      mode: 'sandbox'
    });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'Erro interno ao consultar status do Pix.',
      retryable: true
    });
  }
}
