// Data Models for VagaGo Marketplace Platform

export const INITIAL_USERS = [];

export const INITIAL_VEHICLES = [];

export const INITIAL_PARKING_SPACES = [];

export const INITIAL_BOOKINGS = [];

export const INITIAL_DEMAND_REGIONS = [
  {
    id: "dem_1",
    region: "Centro / Cinquentenário",
    city: "Itabuna",
    searchesLast7Days: 189,
    status: "MUITO ALTA DEMANDA",
    avgHourlyPrice: "R$ 6,00",
    recommendedHostRevenue: "R$ 580 /mês"
  },
  {
    id: "dem_2",
    region: "Shopping Jequitibá",
    city: "Itabuna",
    searchesLast7Days: 142,
    status: "MUITO ALTA DEMANDA",
    avgHourlyPrice: "R$ 5,00",
    recommendedHostRevenue: "R$ 520 /mês"
  },
  {
    id: "dem_3",
    region: "São Caetano",
    city: "Itabuna",
    searchesLast7Days: 88,
    status: "Alta Demanda",
    avgHourlyPrice: "R$ 4,50",
    recommendedHostRevenue: "R$ 450 /mês"
  }
];

export const INITIAL_NOTIFICATIONS = [];

export const INITIAL_COUPONS = [
  {
    id: "cp_1",
    code: "VAGAGO10",
    discountPercent: 10,
    maxDiscount: 15.00,
    validUntil: "2026-12-31",
    usageCount: 0,
    status: "Ativo"
  },
  {
    id: "cp_2",
    code: "PRIMEIRAVAGA",
    discountPercent: 15,
    maxDiscount: 20.00,
    validUntil: "2026-12-31",
    usageCount: 0,
    status: "Ativo"
  }
];

export const INITIAL_REVIEWS = [];

export const INITIAL_WITHDRAWALS = [];

// Shared In-Memory Repository for Cross-Device Multi-Device Live Synchronization
export let GLOBAL_DYNAMIC_PARKING_SPACES = [];

export function getGlobalParkingSpaces() {
  const saved = localStorage.getItem('vagago_parkingSpaces');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {}
  }
  return GLOBAL_DYNAMIC_PARKING_SPACES;
}

export function registerGlobalParkingSpace(newSpot) {
  const existingIdx = GLOBAL_DYNAMIC_PARKING_SPACES.findIndex(s => s.id === newSpot.id);
  if (existingIdx >= 0) {
    GLOBAL_DYNAMIC_PARKING_SPACES[existingIdx] = newSpot;
  } else {
    GLOBAL_DYNAMIC_PARKING_SPACES.unshift(newSpot);
  }
  try {
    localStorage.setItem('vagago_parkingSpaces', JSON.stringify(GLOBAL_DYNAMIC_PARKING_SPACES));
  } catch (e) {}
  return GLOBAL_DYNAMIC_PARKING_SPACES;
}
