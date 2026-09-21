import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { INITIAL_PARKING_SPACES } from './mockData.js';


// Map mock user IDs to Supabase UUIDs
const USER_ID_TO_UUID = {
  'usr_1': '6a71704d-71f0-48bd-9f8e-06f1a3a8c199',
  'usr_2': '70154527-86d3-41c0-9bdc-a575228e76ce',
  'usr_3': '1ff712d8-0448-4d02-baef-e441701ad3bc'
};

// Map mock space IDs to deterministic UUIDs for Supabase
const SPACE_ID_TO_UUID = {
  'spc_ita_1': 'e4f5a6b7-c8d9-4012-89ab-345678901234',
  'spc_ita_2': 'b2c3d4e5-f6a7-4890-bcde-234567890123',
  'spc_ita_3': 'c3d4e5f6-a7b8-4901-cdef-345678901234',
  'spc_ita_4': 'd4e5f6a7-b8c9-4012-def0-456789012345'
};

function generateSafeUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function ensureUUID(idStr, isUser = false) {
  if (!idStr) return isUser ? '70154527-86d3-41c0-9bdc-a575228e76ce' : generateSafeUUID();
  if (isUser && USER_ID_TO_UUID[idStr]) return USER_ID_TO_UUID[idStr];
  if (!isUser && SPACE_ID_TO_UUID[idStr]) return SPACE_ID_TO_UUID[idStr];
  
  // Test if it's already a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(idStr)) return idStr;

  return generateSafeUUID();
}


// Format camelCase frontend object to snake_case Supabase table row matching actual schema
export function mapSpotToSupabaseRow(spot) {
  return {
    id: ensureUUID(spot.id, false),
    owner_id: ensureUUID(spot.ownerId, true),
    title: spot.title || 'Garagem em Itabuna',
    description: spot.description || '',
    address: spot.address || 'Centro, Itabuna - BA',
    city: 'Itabuna',
    state: 'BA',
    neighborhood: spot.neighborhood || 'Centro',
    zip_code: spot.zipCode || '45600-000',
    lat: parseFloat(spot.lat || -14.7966),
    lng: parseFloat(spot.lng || -39.2789),
    price_hourly: parseFloat(spot.priceHourly || 6.00),
    price_daily: parseFloat(spot.priceDaily || 28.00),
    price_monthly: parseFloat(spot.priceMonthly || 280.00),
    rating: parseFloat(spot.rating || 5.0),
    reviews_count: parseInt(spot.reviewsCount || 0),
    photos: Array.isArray(spot.photos) ? spot.photos : [],
    features: Array.isArray(spot.features) ? spot.features : [],
    allowed_vehicles: Array.isArray(spot.allowedVehicles) ? spot.allowedVehicles : [],
    size: spot.size || 'Padrão',
    is_covered: spot.isCovered !== false,
    height_limit: spot.heightLimit || '2.10m',
    rules: Array.isArray(spot.rules) ? spot.rules : [],
    status: spot.status || 'Aprovado',
    availability_status: spot.availabilityStatus || 'Disponível',
    is_available: spot.isAvailable !== false,
    available_hours: spot.availableHours || '24 horas',
    created_at: spot.createdAt || new Date().toISOString()
  };
}

// Format snake_case Supabase row to camelCase frontend object
export function mapSupabaseRowToSpot(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerName: row.owner_name || 'Anfitrião VagaGo',
    ownerPhone: row.owner_phone || '(73) 99123-4567',
    ownerAvatar: row.owner_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',

    title: row.title,
    description: row.description,
    address: row.address,
    city: row.city || 'Itabuna',
    state: row.state || 'BA',
    neighborhood: row.neighborhood || 'Centro',
    zipCode: row.zip_code,
    lat: parseFloat(row.lat),
    lng: parseFloat(row.lng),
    entranceLat: parseFloat(row.lat) - 0.0002,
    entranceLng: parseFloat(row.lng) + 0.0002,
    entranceInstructions: 'Entre pelo portão principal.',
    facadePhoto: row.photos && row.photos[0] ? row.photos[0] : "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80",
    priceHourly: parseFloat(row.price_hourly),
    priceDaily: parseFloat(row.price_daily || 28),
    priceMonthly: parseFloat(row.price_monthly || 280),
    rating: parseFloat(row.rating || 5.0),
    reviewsCount: parseInt(row.reviews_count || 0),
    isCovered: row.is_covered !== false,
    isAvailable: row.is_available !== false,
    availabilityStatus: row.availability_status || 'Disponível',
    status: row.status || 'Aprovado',
    is24h: true,
    availableHours: row.available_hours || '24 horas',
    photos: Array.isArray(row.photos) && row.photos.length ? row.photos : [
      "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80"
    ],
    features: Array.isArray(row.features) ? row.features : ["Coberta", "Câmeras 24h", "Portão Eletrônico"],
    allowedVehicles: Array.isArray(row.allowed_vehicles) ? row.allowed_vehicles : ["Moto", "Carro pequeno", "Sedan", "SUV"]
  };
}

// Fetch all spots from Supabase with automatic local fallback
export async function fetchSpacesFromSupabase() {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('parking_spaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Supabase fetch notice:", error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map(mapSupabaseRowToSpot);
    }
  } catch (e) {
    console.warn("Supabase fetch error:", e);
  }
  return null;
}

// Seed initial Itabuna garages into Supabase cloud table
export async function seedInitialSpacesToSupabase() {
  if (!isSupabaseConfigured) return;
  try {
    for (const spot of INITIAL_PARKING_SPACES) {
      await publishSpaceToSupabase(spot);
    }
  } catch (e) {
    console.warn("Supabase seed error:", e);
  }
}

// Publish/Upsert spot into Supabase database in the cloud
export async function publishSpaceToSupabase(spot) {
  if (!isSupabaseConfigured) return false;

  try {
    const row = mapSpotToSupabaseRow(spot);
    const { data, error } = await supabase
      .from('parking_spaces')
      .upsert([row], { onConflict: 'id' })
      .select();

    if (error) {
      console.warn("Supabase publish notice:", error.message);
      return false;
    }
    console.log("🎉 Vaga publicada no Supabase Cloud:", data);
    return true;
  } catch (e) {
    console.warn("Supabase publish error:", e);
    return false;
  }
}

// Delete spot from Supabase Cloud
export async function deleteSpaceFromSupabase(spotId) {
  if (!isSupabaseConfigured || !spotId) return false;

  try {
    const targetUUID = ensureUUID(spotId, false);
    const { error } = await supabase
      .from('parking_spaces')
      .delete()
      .or(`id.eq.${targetUUID},id.eq.${spotId}`);

    if (error) {
      console.warn("Supabase delete notice:", error.message);
      return false;
    }
    console.log("🗑️ Vaga excluída no Supabase Cloud:", spotId);
    return true;
  } catch (e) {
    console.warn("Supabase delete error:", e);
    return false;
  }
}

// Register user in Supabase Cloud users table
export async function registerUserInSupabase(user) {
  if (!isSupabaseConfigured || !user) return false;

  try {
    const userUUID = ensureUUID(user.id, true);
    const userRow = {
      id: userUUID,
      name: user.name,
      email: user.email.toLowerCase(),
      role: user.role || 'CLIENTE',
      phone: user.phone || '(73) 99123-4567',
      cpf: user.cpf || '000.000.000-00',
      avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      credits: Number(user.credits || 20.00),
      status: user.status || 'Ativo',
      referral_code: user.referralCode || `VAGA${Math.floor(1000 + Math.random() * 9000)}`
    };

    const { data, error } = await supabase
      .from('users')
      .upsert([userRow], { onConflict: 'email' })
      .select();

    if (error) {
      console.warn("Supabase user register notice:", error.message);
      return false;
    }
    console.log("👤 Usuário sincronizado no Supabase Cloud:", data);
    return true;
  } catch (e) {
    console.warn("Supabase user register error:", e);
    return false;
  }
}

// Map Booking between Frontend (camelCase) and Supabase DB (snake_case)
export function mapBookingToSupabaseRow(booking) {
  const driverId = booking.driver_id || booking.driverId || booking.userId || booking.user_id;
  const hostId = booking.host_id || booking.hostId || booking.ownerId || booking.owner_id;
  const spaceId = booking.parking_id || booking.parkingId || booking.spaceId || booking.space_id;

  return {
    id: ensureUUID(booking.id, false),
    booking_number: booking.bookingNumber || booking.booking_number || `VG-${Math.floor(10000 + Math.random() * 90000)}`,
    user_id: ensureUUID(driverId, true),
    user_name: booking.driverName || booking.driver_name || booking.userName || booking.user_name || 'Motorista VagaGo',
    user_phone: booking.driverPhone || booking.driver_phone || booking.userPhone || booking.user_phone || '(73) 99123-4567',
    space_id: ensureUUID(spaceId, false),
    space_title: booking.parkingTitle || booking.parking_title || booking.spaceTitle || booking.space_title || 'Garagem VagaGo',
    space_address: booking.parkingAddress || booking.parking_address || booking.spaceAddress || booking.space_address || 'Itabuna - BA',
    owner_id: ensureUUID(hostId, true),
    owner_name: booking.hostName || booking.host_name || booking.ownerName || booking.owner_name || 'Anfitrião VagaGo',
    date: booking.startDate || booking.start_date || booking.date || new Date().toISOString().split('T')[0],
    start_time: booking.startTime || booking.start_time || '14:00',
    end_time: booking.endTime || booking.end_time || '18:00',
    total_hours: parseFloat(booking.totalHours || booking.total_hours || 1),
    subtotal: parseFloat(booking.subtotal || booking.totalPrice || 10),
    platform_fee: parseFloat(booking.platformFee || booking.platform_fee || 1),
    owner_payout: parseFloat(booking.ownerPayout || booking.owner_payout || 9),
    discount_amount: parseFloat(booking.discountAmount || booking.discount_amount || 0),
    total_price: parseFloat(booking.totalPrice || booking.total_price || booking.amount || 10),
    payment_method: booking.paymentMethod || booking.payment_method || 'PIX',
    payment_status: booking.paymentStatus || booking.payment_status || 'Aprovado',
    booking_status: booking.bookingStatus || booking.booking_status || booking.status || 'Confirmado',
    qr_code_data: booking.qrCodeData || booking.qr_code_data || `VAGAGO-${booking.bookingNumber || 'BK'}-${spaceId || 'SP1'}`,
    vehicle: typeof booking.vehicle === 'object' && booking.vehicle !== null ? booking.vehicle : { plate: 'ABC-1D23', brand: 'Carro', model: 'Passeio', type: 'Carro' },
    created_at: booking.createdAt || booking.created_at || new Date().toISOString()
  };
}

export function mapSupabaseRowToBooking(row) {
  const statusStr = row.booking_status || row.status || 'Confirmado';
  return {
    id: row.id,
    bookingNumber: row.booking_number,
    booking_number: row.booking_number,

    // Driver Identifiers
    driverId: row.user_id,
    driver_id: row.user_id,
    userId: row.user_id,
    user_id: row.user_id,
    driverName: row.user_name || 'Motorista VagaGo',
    driver_name: row.user_name || 'Motorista VagaGo',
    userName: row.user_name || 'Motorista VagaGo',
    user_name: row.user_name || 'Motorista VagaGo',
    driverPhone: row.user_phone || '(73) 99123-4567',
    driver_phone: row.user_phone || '(73) 99123-4567',
    userPhone: row.user_phone || '(73) 99123-4567',
    user_phone: row.user_phone || '(73) 99123-4567',
    driverAvatar: row.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    userAvatar: row.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    driverEmail: row.user_email || '',
    userEmail: row.user_email || '',

    // Host Identifiers
    hostId: row.owner_id,
    host_id: row.owner_id,
    ownerId: row.owner_id,
    owner_id: row.owner_id,
    hostName: row.owner_name || 'Anfitrião VagaGo',
    host_name: row.owner_name || 'Anfitrião VagaGo',
    ownerName: row.owner_name || 'Anfitrião VagaGo',
    owner_name: row.owner_name || 'Anfitrião VagaGo',
    hostPhone: row.owner_phone || '(73) 99123-4567',
    ownerPhone: row.owner_phone || '(73) 99123-4567',
    hostEmail: row.owner_email || '',
    ownerEmail: row.owner_email || '',

    // Space Identifiers
    parkingId: row.space_id,
    parking_id: row.space_id,
    spaceId: row.space_id,
    space_id: row.space_id,
    parkingTitle: row.space_title,
    parking_title: row.space_title,
    spaceTitle: row.space_title,
    space_title: row.space_title,
    parkingAddress: row.space_address,
    parking_address: row.space_address,
    spaceAddress: row.space_address,
    space_address: row.space_address,

    // Dates & Times
    startDate: row.date,
    start_date: row.date,
    date: row.date,
    startTime: row.start_time,
    start_time: row.start_time,
    endDate: row.end_date || row.date,
    end_date: row.end_date || row.date,
    endTime: row.end_time,
    end_time: row.end_time,
    totalHours: parseFloat(row.total_hours || 1),
    total_hours: parseFloat(row.total_hours || 1),

    // Financials
    subtotal: parseFloat(row.subtotal || 0),
    platformFee: parseFloat(row.platform_fee || 0),
    platform_fee: parseFloat(row.platform_fee || 0),
    ownerPayout: parseFloat(row.owner_payout || 0),
    owner_payout: parseFloat(row.owner_payout || 0),
    discountAmount: parseFloat(row.discount_amount || 0),
    discount_amount: parseFloat(row.discount_amount || 0),
    totalPrice: parseFloat(row.total_price || 0),
    total_price: parseFloat(row.total_price || 0),
    amount: parseFloat(row.total_price || 0),

    // Status & Methods
    paymentMethod: row.payment_method || 'PIX',
    payment_method: row.payment_method || 'PIX',
    paymentStatus: row.payment_status || 'Aprovado',
    payment_status: row.payment_status || 'Aprovado',
    bookingStatus: statusStr,
    booking_status: statusStr,
    status: statusStr.toLowerCase().includes('pend') || statusStr.toLowerCase().includes('aguard') ? 'pending' : statusStr.toLowerCase().includes('canc') ? 'cancelled' : statusStr.toLowerCase().includes('concl') ? 'completed' : 'confirmed',

    // Access
    qrCodeData: row.qr_code_data,
    qr_code_data: row.qr_code_data,
    vehicle: typeof row.vehicle === 'object' && row.vehicle !== null ? row.vehicle : { plate: 'ABC-1D23', brand: 'Carro', model: 'Passeio', type: 'Carro' },
    checkInTime: row.check_in_time,
    check_in_time: row.check_in_time,
    checkOutTime: row.check_out_time,
    check_out_time: row.check_out_time,
    createdAt: row.created_at || new Date().toISOString(),
    created_at: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || row.created_at || new Date().toISOString()
  };
}

// Publish Booking to Supabase Cloud
export async function publishBookingToSupabase(booking) {
  if (!isSupabaseConfigured || !booking) return false;

  try {
    const row = mapBookingToSupabaseRow(booking);
    const { data, error } = await supabase
      .from('bookings')
      .upsert([row], { onConflict: 'id' })
      .select();

    if (error) {
      console.warn("Supabase booking publish notice:", error.message);
      return false;
    }
    console.log("🎫 Reserva persistida no Supabase Cloud:", data);
    return true;
  } catch (e) {
    console.warn("Supabase booking publish error:", e);
    return false;
  }
}

// Fetch all bookings from Supabase Cloud
export async function fetchBookingsFromSupabase() {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Supabase fetch bookings notice:", error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map(mapSupabaseRowToBooking);
    }
  } catch (e) {
    console.warn("Supabase fetch bookings error:", e);
  }
  return null;
}

// Update Booking Status in Supabase Cloud (Accept, Reject, Cancel, Complete)
export async function updateBookingStatusInSupabase(bookingId, status) {
  if (!isSupabaseConfigured || !bookingId) return false;

  try {
    const targetUUID = ensureUUID(bookingId, false);
    const { data, error } = await supabase
      .from('bookings')
      .update({ booking_status: status, updated_at: new Date().toISOString() })
      .or(`id.eq.${targetUUID},id.eq.${bookingId}`);

    if (error) {
      console.warn("Supabase update booking notice:", error.message);
      return false;
    }
    console.log("🔄 Status da reserva atualizado no Supabase Cloud:", status);
    return true;
  } catch (e) {
    console.warn("Supabase update booking error:", e);
    return false;
  }
}

// Realtime subscription for Supabase bookings table
export function subscribeToBookingsRealtime(onInsert, onUpdate) {
  if (!isSupabaseConfigured) return null;

  try {
    const channel = supabase
      .channel('public:bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        if (payload && payload.new && onInsert) {
          onInsert(mapSupabaseRowToBooking(payload.new));
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, (payload) => {
        if (payload && payload.new && onUpdate) {
          onUpdate(mapSupabaseRowToBooking(payload.new));
        }
      })
      .subscribe();

    return channel;
  } catch (e) {
    console.warn("Supabase realtime subscribe error:", e);
    return null;
  }
}


