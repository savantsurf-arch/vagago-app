import { createClient } from '@supabase/supabase-js';
import { applyRateLimit, verifyCsrfOrigin, sanitizeString, validateBookingPayload } from '../_lib/security.js';
import { calculateSplitBreakdown } from '../_lib/pixProviders.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!verifyCsrfOrigin(req, res)) return;
  if (!applyRateLimit(req, res, { windowMs: 60_000, max: 20, bucket: 'booking-create' })) return;

  const { valid, errors, sanitized } = validateBookingPayload(req.body || {});
  if (!valid) {
    return res.status(400).json({ error: errors[0], details: errors });
  }

  const bookingNumber = sanitizeString(req.body?.bookingNumber, 32) || `VG-${Math.floor(10000 + Math.random() * 90000)}`;
  const split = calculateSplitBreakdown({
    amount: sanitized.totalPrice,
    feePercent: 10,
    isDayOff: Boolean(req.body?.isDayOff)
  });

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRole) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRole);
      await supabaseAdmin.from('bookings').insert([
        {
          booking_number: bookingNumber,
          space_title: sanitizeString(req.body?.spaceTitle || 'Garagem Itabuna', 140),
          space_address: sanitizeString(req.body?.spaceAddress || 'Itabuna - BA', 220),
          date: sanitized.date,
          start_time: sanitized.startTime,
          end_time: sanitized.endTime,
          total_hours: Math.max(1, Number(req.body?.totalHours || 1)),
          subtotal: split.amount,
          platform_fee: split.platformFee,
          owner_payout: split.ownerPayout,
          total_price: split.amount,
          payment_method: sanitizeString(req.body?.paymentMethod || 'PIX', 40),
          payment_status: req.body?.paymentMethod === 'PIX' ? 'Pendente' : 'Aprovado',
          booking_status: req.body?.paymentMethod === 'PIX' ? 'Aguardando Pagamento' : 'Confirmado',
          qr_code_data: `VAGAGO-${bookingNumber}-${sanitized.spaceId}`,
          vehicle: {
            plate: sanitized.plate,
            model: sanitizeString(req.body?.vehicle?.model || 'Veículo', 60),
            brand: sanitizeString(req.body?.vehicle?.brand || '', 60)
          }
        }
      ]);
    } catch (err) {
      console.warn('Supabase server booking insert warning:', err?.message);
    }
  }

  return res.status(201).json({
    ok: true,
    bookingNumber,
    split,
    sanitized
  });
}
