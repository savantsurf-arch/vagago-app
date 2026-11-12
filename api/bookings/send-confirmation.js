/**
 * Vercel Serverless Function — Confirmação de Reserva por E-mail (via Resend opcional)
 * POST /api/bookings/send-confirmation
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const {
    toEmail,
    bookingNumber,
    spaceTitle,
    spaceAddress,
    date,
    startTime,
    endTime,
    totalPrice,
    qrCodeData,
    vehiclePlate
  } = req.body || {};

  if (!toEmail || !String(toEmail).includes('@') || !bookingNumber) {
    return res.status(400).json({ error: 'E-mail e número da reserva são obrigatórios.' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.VAGAGO_FROM_EMAIL || 'VagaGo <reservas@vagago.com.br>';

  if (!resendKey) {
    return res.status(200).json({
      sent: false,
      previewMode: true,
      message: 'Comprovante preparado localmente (configure RESEND_API_KEY na Vercel para envio automático de e-mails).'
    });
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrCodeData || bookingNumber)}`;
  const safeHtml = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;">
      <h2 style="color:#0284c7;margin:0 0 8px;">Reserva Confirmada #${String(bookingNumber).replace(/[<>&"]/g, '')}</h2>
      <p style="color:#334155;font-size:14px;">Sua vaga em Itabuna - BA está garantida.</p>
      <div style="background:#f8fafc;padding:16px;border-radius:12px;margin:16px 0;font-size:13px;color:#0f172a;">
        <p><strong>Garagem:</strong> ${String(spaceTitle || '').replace(/[<>&"]/g, '')}</p>
        <p><strong>Endereço:</strong> ${String(spaceAddress || '').replace(/[<>&"]/g, '')}</p>
        <p><strong>Data e horário:</strong> ${String(date || '')} • ${String(startTime || '')} às ${String(endTime || '')}</p>
        <p><strong>Placa autorizada:</strong> ${String(vehiclePlate || 'Veículo cadastrado').replace(/[<>&"]/g, '')}</p>
        <p><strong>Valor pago:</strong> R$ ${Number(totalPrice || 0).toFixed(2)}</p>
      </div>
      <div style="text-align:center;margin:20px 0;">
        <img src="${qrUrl}" alt="QR Code da reserva" width="180" height="180" style="border:8px solid #0f172a;border-radius:12px;" />
        <p style="font-family:monospace;font-size:12px;color:#475569;margin-top:8px;">${String(qrCodeData || bookingNumber).replace(/[<>&"]/g, '')}</p>
      </div>
    </div>
  `;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `VagaGo | Comprovante e QR Code da Reserva #${bookingNumber}`,
        html: safeHtml
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(502).json({ sent: false, error: errText });
    }

    return res.status(200).json({ sent: true, message: 'Confirmação enviada por e-mail com QR Code!' });
  } catch (err) {
    return res.status(500).json({ sent: false, error: err?.message || 'Erro ao enviar e-mail.' });
  }
}
