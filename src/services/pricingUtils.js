const WEEKDAY_KEYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function timeToMinutes(timeStr = '00:00') {
  const [h, m] = String(timeStr).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function getWeekdayLabel(dateStr) {
  if (!dateStr) return 'Seg';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return 'Seg';
  const dt = new Date(y, m - 1, d);
  return WEEKDAY_KEYS[dt.getDay()] || 'Seg';
}

export function isSpotAvailableOnDay(spot, dateStr) {
  if (!spot || !dateStr) return true;
  if (!Array.isArray(spot.availableDays) || spot.availableDays.length === 0) return true;
  const weekday = getWeekdayLabel(dateStr);
  return spot.availableDays.some((d) => String(d).toLowerCase().startsWith(weekday.toLowerCase()));
}

export function getOccupiedSlotsForDate(bookings = [], spaceId, dateStr) {
  if (!spaceId || !dateStr || !Array.isArray(bookings)) return [];
  return bookings
    .filter((b) => {
      if (!b) return false;
      const bSpaceId = b.spaceId || b.space_id || b.parkingId;
      if (bSpaceId !== spaceId) return false;
      const status = b.bookingStatus || b.booking_status || '';
      if (status === 'Cancelado' || status === 'Recusado' || b.status === 'cancelled') return false;
      const bDate = b.date || b.startDate || b.start_date;
      const bEndDate = b.endDate || b.end_date || bDate;
      return dateStr >= bDate && dateStr <= bEndDate;
    })
    .map((b) => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      startTime: b.startTime || '08:00',
      endTime: b.endTime || '18:00'
    }));
}

export function calculateBookingPricing({
  spot,
  planType = 'hora',
  startTime = '14:00',
  endTime = '18:00',
  days = 1,
  months = 1
}) {
  const hourlyRate = Number(spot?.priceHourly || spot?.price_hourly || 6);
  const dailyRate = Number(spot?.priceDaily || spot?.price_daily || hourlyRate * 5);
  const monthlyRate = Number(spot?.priceMonthly || spot?.price_monthly || hourlyRate * 45);

  if (planType === 'diaria') {
    const safeDays = Math.max(1, Number(days || 1));
    const subtotal = Number((safeDays * dailyRate).toFixed(2));
    return {
      planType: 'diaria',
      unitRate: dailyRate,
      quantity: safeDays,
      unitLabel: safeDays === 1 ? 'diária' : 'diárias',
      totalHours: safeDays * 24,
      durationMinutes: safeDays * 24 * 60,
      subtotal
    };
  }

  if (planType === 'mensal') {
    const safeMonths = Math.max(1, Number(months || 1));
    const subtotal = Number((safeMonths * monthlyRate).toFixed(2));
    return {
      planType: 'mensal',
      unitRate: monthlyRate,
      quantity: safeMonths,
      unitLabel: safeMonths === 1 ? 'mês' : 'meses',
      totalHours: safeMonths * 30 * 24,
      durationMinutes: safeMonths * 30 * 24 * 60,
      subtotal
    };
  }

  const startM = timeToMinutes(startTime);
  const endM = timeToMinutes(endTime);
  const durationMinutes = Math.max(0, endM - startM);
  const totalHours = Math.max(1, Math.ceil(durationMinutes / 60));
  const rawHourlyTotal = Number((totalHours * hourlyRate).toFixed(2));

  return {
    planType: 'hora',
    unitRate: hourlyRate,
    quantity: totalHours,
    unitLabel: totalHours === 1 ? 'hora' : 'horas',
    totalHours,
    durationMinutes,
    subtotal: rawHourlyTotal,
    dailyCapAvailable: rawHourlyTotal > dailyRate ? dailyRate : null
  };
}

export function addDaysToDateStr(dateStr, daysToAdd) {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, (d || 1) + daysToAdd);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
