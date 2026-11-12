import crypto from 'node:crypto';

export function calculateSplitBreakdown({ amount, feePercent = 10, isDayOff = false }) {
  const safeAmount = Math.max(0.01, Number(Number(amount || 0).toFixed(2)));
  const effectiveFeePct = isDayOff ? 0 : Math.min(50, Math.max(0, Number(feePercent || 10)));
  const platformFee = Number(((safeAmount * effectiveFeePct) / 100).toFixed(2));
  const ownerPayout = Number((safeAmount - platformFee).toFixed(2));
  const hostSharePercent = Number((100 - effectiveFeePct).toFixed(2));

  return {
    amount: safeAmount,
    feePercent: effectiveFeePct,
    platformFee,
    ownerPayout,
    hostSharePercent
  };
}

function crc16Ccitt(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function emvTag(id, value) {
  const str = String(value);
  return `${id}${String(str.length).padStart(2, '0')}${str}`;
}

export function buildSandboxPixPayload({ amount, bookingNumber = 'VG0001', pixKey = 'pix@vagago.com.br' }) {
  const safeVal = Number(amount || 10).toFixed(2);
  const merchantInfo = emvTag('00', 'br.gov.bcb.pix') + emvTag('01', pixKey);
  const txid = String(bookingNumber).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20) || 'VAGAGO';
  const additional = emvTag('05', txid);
  const withoutCrc =
    emvTag('00', '01') +
    emvTag('26', merchantInfo) +
    emvTag('52', '0000') +
    emvTag('53', '986') +
    emvTag('54', safeVal) +
    emvTag('58', 'BR') +
    emvTag('59', 'VAGAGO PLATAFORMA') +
    emvTag('60', 'ITABUNA') +
    emvTag('62', additional) +
    '6304';

  return `${withoutCrc}${crc16Ccitt(withoutCrc)}`;
}

export function resolvePixProvider() {
  const explicit = (process.env.PIX_PROVIDER || '').trim().toLowerCase();
  if (explicit === 'asaas' && process.env.ASAAS_API_KEY) return 'asaas';
  if (explicit === 'mercadopago' && process.env.MP_ACCESS_TOKEN) return 'mercadopago';
  if (process.env.ASAAS_API_KEY) return 'asaas';
  if (process.env.MP_ACCESS_TOKEN) return 'mercadopago';
  return 'sandbox';
}

export async function createAsaasPixPayment({
  amount: _amount,
  bookingNumber,
  description,
  customerName,
  customerCpf,
  customerEmail,
  hostWalletId,
  splitBreakdown
}) {
  const apiKey = process.env.ASAAS_API_KEY;
  const baseUrl = (process.env.ASAAS_BASE_URL || 'https://api.asaas.com/v3').replace(/\/$/, '');
  const cleanCpf = String(customerCpf || '00000000000').replace(/\D/g, '').padStart(11, '0').slice(0, 14);

  const custResp = await fetch(`${baseUrl}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', access_token: apiKey },
    body: JSON.stringify({
      name: customerName || 'Motorista VagaGo',
      cpfCnpj: cleanCpf,
      email: customerEmail || undefined
    })
  });
  const custData = await custResp.json();
  if (!custResp.ok || !custData?.id) {
    throw new Error(custData?.errors?.[0]?.description || 'Falha ao registrar pagador no Asaas.');
  }

  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const paymentBody = {
    customer: custData.id,
    billingType: 'PIX',
    value: splitBreakdown.amount,
    dueDate,
    description: description || `Reserva VagaGo #${bookingNumber}`,
    externalReference: bookingNumber
  };

  if (hostWalletId) {
    paymentBody.split = [
      {
        walletId: hostWalletId,
        percentualValue: splitBreakdown.hostSharePercent
      }
    ];
  }

  const payResp = await fetch(`${baseUrl}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', access_token: apiKey },
    body: JSON.stringify(paymentBody)
  });
  const payData = await payResp.json();
  if (!payResp.ok || !payData?.id) {
    throw new Error(payData?.errors?.[0]?.description || 'Falha ao criar cobrança Pix no Asaas.');
  }

  const qrResp = await fetch(`${baseUrl}/payments/${payData.id}/pixQrCode`, {
    headers: { access_token: apiKey }
  });
  const qrData = await qrResp.json();
  if (!qrResp.ok || !qrData?.payload) {
    throw new Error('Cobrança criada, mas falhou ao obter QR Code Pix no Asaas.');
  }

  return {
    provider: 'asaas',
    mode: 'live',
    paymentId: payData.id,
    status: 'PENDING',
    pixCopyPaste: qrData.payload,
    qrImageBase64: qrData.encodedImage || null,
    expiresAt: qrData.expirationDate || null,
    split: splitBreakdown
  };
}

export async function createMercadoPagoPixPayment({
  bookingNumber,
  description,
  payerEmail,
  payerName,
  splitBreakdown,
  notificationUrl,
  useMarketplaceApplicationFee = false
}) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  const payload = {
    transaction_amount: splitBreakdown.amount,
    description: description || `Reserva VagaGo #${bookingNumber}`,
    payment_method_id: 'pix',
    external_reference: bookingNumber,
    notification_url: notificationUrl || undefined,
    payer: {
      email: payerEmail || 'motorista@vagago.com.br',
      first_name: (payerName || 'Motorista').split(' ')[0]
    }
  };

  if (useMarketplaceApplicationFee && splitBreakdown.platformFee > 0) {
    payload.application_fee = splitBreakdown.platformFee;
  }

  const resp = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': `vagago-${bookingNumber}-${Date.now()}`
    },
    body: JSON.stringify(payload)
  });
  const data = await resp.json();

  if (!resp.ok || !data?.id) {
    throw new Error(data?.message || 'Falha ao gerar Pix no Mercado Pago.');
  }

  const txData = data.point_of_interaction?.transaction_data || {};
  return {
    provider: 'mercadopago',
    mode: 'live',
    paymentId: String(data.id),
    status: mapProviderStatus(data.status),
    pixCopyPaste: txData.qr_code || '',
    qrImageBase64: txData.qr_code_base64 || null,
    expiresAt: data.date_of_expiration || null,
    split: splitBreakdown
  };
}

export function mapProviderStatus(rawStatus) {
  const s = String(rawStatus || '').toUpperCase();
  if (['RECEIVED', 'CONFIRMED', 'APPROVED', 'PAID'].includes(s)) return 'APPROVED';
  if (['REFUNDED', 'REJECTED', 'CANCELLED', 'FAILED', 'EXPIRED', 'OVERDUE'].includes(s)) return 'FAILED';
  return 'PENDING';
}

export function verifyMercadoPagoSignature({ xSignature, xRequestId, dataId, secret }) {
  if (!secret || !xSignature || !dataId) return false;
  const parts = Object.fromEntries(
    String(xSignature)
      .split(',')
      .map((kv) => kv.split('=').map((s) => s.trim()))
      .filter((arr) => arr.length === 2)
  );
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${dataId};request-id:${xRequestId || ''};ts:${parts.ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return expected === parts.v1;
}
