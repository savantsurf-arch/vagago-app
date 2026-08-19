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
    ownerName: row.owner_name || 'Carlos Alberto Mendes (Anfitrião)',
    ownerPhone: row.owner_phone || '(73) 99123-4567',
    ownerAvatar: row.owner_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
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

