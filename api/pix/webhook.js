import { createClient } from '@supabase/supabase-js';
import { mapProviderStatus, verifyMercadoPagoSignature } from '../_lib/pixProviders.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    let externalReference = null;
    let mappedStatus = 'PENDING';
    let providerName = 'unknown';

    // 1. Webhook Asaas
    if (req.body?.payment?.externalReference || req.headers['asaas-access-token']) {
      providerName = 'asaas';
      const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
      if (expectedToken && req.headers['asaas-access-token'] !== expectedToken) {
        return res.status(401).json({ error: 'Token de webhook Asaas inválido.' });
      }
      externalReference = req.body?.payment?.externalReference;
      mappedStatus = mapProviderStatus(req.body?.payment?.status || req.body?.event);
    }
    // 2. Webhook Mercado Pago
    else if (req.body?.data?.id || req.headers['x-signature']) {
      providerName = 'mercadopago';
      const dataId = req.body?.data?.id;
      const secret = process.env.MP_WEBHOOK_SECRET;
      if (secret) {
        const ok = verifyMercadoPagoSignature({
          xSignature: req.headers['x-signature'],
          xRequestId: req.headers['x-request-id'],
          dataId,
          secret
        });
        if (!ok) {
          return res.status(401).json({ error: 'Assinatura de webhook Mercado Pago inválida.' });
        }
      }
      if (dataId && process.env.MP_ACCESS_TOKEN) {
        const payResp = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, {
          headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
        });
        if (payResp.ok) {
          const payData = await payResp.json();
          externalReference = payData.external_reference;
          mappedStatus = mapProviderStatus(payData.status);
        }
      }
    }

    if (!externalReference) {
      return res.status(200).json({ received: true, ignored: true });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRole) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRole);
      const paymentStatusPt =
        mappedStatus === 'APPROVED' ? 'Aprovado' : mappedStatus === 'FAILED' ? 'Falhou' : 'Pendente';
      const bookingStatusPt = mappedStatus === 'APPROVED' ? 'Confirmado' : undefined;

      const updatePayload = { payment_status: paymentStatusPt };
      if (bookingStatusPt) updatePayload.booking_status = bookingStatusPt;

      await supabaseAdmin
        .from('bookings')
        .update(updatePayload)
        .eq('booking_number', externalReference);
    }

    return res.status(200).json({
      received: true,
      provider: providerName,
      bookingNumber: externalReference,
      status: mappedStatus
    });
  } catch (err) {
    console.error('Erro /api/pix/webhook:', err);
    return res.status(500).json({ error: 'Erro ao processar webhook Pix.' });
  }
}
