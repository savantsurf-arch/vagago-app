// Data for VagaGo SaaS Platform - Pilot City: ITABUNA - BA with Entrance Coordinates 🚪

export const INITIAL_USERS = [];

export const INITIAL_VEHICLES = [];


export const INITIAL_PARKING_SPACES = [
  {
    id: "spc_ita_1",
    ownerId: "host_itabuna_1",
    ownerEmail: "anfitriao1@vagago.com.br",
    ownerName: "Anfitrião VagaGo (Praça Adami)",
    ownerPhone: "(73) 99123-4567",
    ownerRating: 4.9,
    isSuperHost: true,
    ownerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    title: "Garagem Privativa Centro Itabuna (Praça Adami)",
    description: "Garagem coberta, iluminada e com segurança 24 horas a 50 metros da Praça Adami no Centro de Itabuna.",
    address: "Av. Cinquentenário, 450 - Centro",
    city: "Itabuna",
    state: "BA",
    neighborhood: "Centro",
    zipCode: "45600-000",
    lat: -14.7966,
    lng: -39.2789,
    entranceLat: -14.7968,
    entranceLng: -39.2787,
    entranceInstructions: "🚪 Entre pelo portão azul localizado à direita, logo após a farmácia Drogasil.",
    distance: "150m",
    rating: 4.9,
    reviewsCount: 28,
    priceHourly: 6.00,
    priceDaily: 28.00,
    priceMonthly: 280.00,
    price30Min: 4.00,
    price2Hours: 11.00,
    price4Hours: 18.00,
    weekendSurge: 1.0,
    isEventPricingActive: false,
    secretAccessInstructions: "🔐 O portão automático abre via controle na guarita ou aplicativo. A vaga 01 fica logo à esquerda após o portão.",
    facadePhoto: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80",
    isMultiSpot: true,
    totalBoxes: 5,
    boxes: [
      { id: 1, name: "Box 01", status: "Livre", currentVehicle: null },
      { id: 2, name: "Box 02", status: "Livre", currentVehicle: null },
      { id: 3, name: "Box 03", status: "Livre", currentVehicle: null },
      { id: 4, name: "Box 04", status: "Livre", currentVehicle: null },
      { id: 5, name: "Box 05", status: "Livre", currentVehicle: null }
    ],
    photos: [
      "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1000&q=80"
    ],
    features: [
      "Coberta",
      "Câmeras 24h",
      "Portão Eletrônico",
      "Segurança 24h",
      "Iluminação LED"
    ],
    allowedVehicles: ["Moto", "Carro pequeno", "Sedan", "SUV"],
    size: "Padrão",
    isCovered: true,
    heightLimit: "2.10m",
    rules: [
      "Estacionar de ré na marcação",
      "Apresente o QR Code no celular"
    ],
    status: "Aprovado",
    availabilityStatus: "Disponível",
    isAvailable: true,
    availableHours: "24 horas",
    is24h: true,
    monthlyPlanAvailable: true
  },
  {
    id: "spc_ita_2",
    ownerId: "host_itabuna_2",
    ownerEmail: "anfitriao2@vagago.com.br",
    ownerName: "Anfitrião VagaGo (Shopping Jequitibá)",
    ownerPhone: "(73) 98844-3322",
    ownerRating: 4.8,
    isSuperHost: true,
    ownerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    title: "Vaga Privativa Shopping Jequitibá Itabuna",
    description: "Vaga rápida e ultra segura ao lado do Shopping Jequitibá e do HBR Medical Center em Itabuna.",
    address: "Av. José Soares Pinheiro, 2141 - Centro",
    city: "Itabuna",
    state: "BA",
    neighborhood: "Jequitibá / Centro",
    zipCode: "45600-001",
    lat: -14.7905,
    lng: -39.2712,
    entranceLat: -14.7907,
    entranceLng: -39.2710,
    entranceInstructions: "🚪 Entrada pelo portão do edifício comercial Jequitibá, guarita 2.",
    distance: "300m",
    rating: 4.8,
    reviewsCount: 19,
    priceHourly: 5.00,
    priceDaily: 25.00,
    priceMonthly: 250.00,
    price30Min: 3.50,
    price2Hours: 9.00,
    price4Hours: 16.00,
    weekendSurge: 1.2,
    secretAccessInstructions: "🔑 Apresente a reserva na portaria do edifício comercial Jequitibá. Vaga no 1º subsolo.",
    facadePhoto: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80"
    ],
    features: [
      "Coberta",
      "Câmeras 24h",
      "Portão Eletrônico",
      "Segurança 24h",
      "Acesso 24h"
    ],
    allowedVehicles: ["Moto", "Carro pequeno", "Sedan", "SUV", "Caminhonete"],
    size: "Grande",
    isCovered: true,
    heightLimit: "2.20m",
    rules: [
      "Manter os faróis acesos ao entrar"
    ],
    status: "Aprovado",
    availabilityStatus: "Disponível",
    isAvailable: true,
    availableHours: "24 horas",
    is24h: true,
    monthlyPlanAvailable: true
  },
  {
    id: "spc_ita_3",
    ownerId: "host_itabuna_3",
    ownerEmail: "anfitriao3@vagago.com.br",
    ownerName: "Anfitrião VagaGo (São Caetano)",
    ownerPhone: "(73) 99911-2233",
    ownerRating: 5.0,
    isSuperHost: true,
    ownerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    title: "Garagem São Caetano Residenciais",
    description: "Vaga espaçosa no bairro São Caetano em Itabuna. Perfeita para moradores ou visitantes da zona sul de Itabuna.",
    address: "Av. Princesa Isabel, 890 - São Caetano",
    city: "Itabuna",
    state: "BA",
    neighborhood: "São Caetano",
    zipCode: "45607-000",
    lat: -14.8050,
    lng: -39.2810,
    entranceLat: -14.8052,
    entranceLng: -39.2808,
    entranceInstructions: "🚪 Portão basculante marrom com sensor de proximidade.",
    distance: "800m",
    rating: 5.0,
    reviewsCount: 14,
    priceHourly: 4.50,
    priceDaily: 22.00,
    priceMonthly: 220.00,
    price30Min: 3.00,
    price2Hours: 8.00,
    price4Hours: 14.00,
    weekendSurge: 1.0,
    secretAccessInstructions: "🔐 A senha da fechadura eletrônica é 1928. Entre e feche o portão basculante.",
    facadePhoto: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80"
    ],
    features: [
      "Coberta",
      "Portão Eletrônico",
      "Iluminação LED"
    ],
    allowedVehicles: ["Moto", "Carro pequeno", "Sedan"],
    size: "Média",
    isCovered: true,
    heightLimit: "2.00m",
    rules: [
      "Respeitar o silêncio após 22h"
    ],
    status: "Aprovado",
    availabilityStatus: "Disponível",
    isAvailable: true,
    availableHours: "08:00 - 18:00",
    is24h: false,
    monthlyPlanAvailable: true
  },
  {
    id: "spc_ita_4",
    ownerId: "host_itabuna_4",
    ownerEmail: "anfitriao4@vagago.com.br",
    ownerName: "Anfitrião VagaGo (Bairro Fátima)",
    ownerPhone: "(73) 98822-3311",
    ownerRating: 4.7,
    isSuperHost: true,
    ownerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    title: "Vaga Coberta Bairro Fátima Itabuna",
    description: "Garagem coberta em casa de vila no Bairro Fátima, a pouquíssimos minutos do centro de Itabuna.",
    address: "Rua Saturnino José Soares, 120 - Fátima",
    city: "Itabuna",
    state: "BA",
    neighborhood: "Fátima",
    zipCode: "45604-000",
    lat: -14.7890,
    lng: -39.2820,
    entranceLat: -14.7892,
    entranceLng: -39.2818,
    entranceInstructions: "🚪 Portão verde de grade metálica.",
    distance: "650m",
    rating: 4.7,
    reviewsCount: 11,
    priceHourly: 4.00,
    priceDaily: 20.00,
    priceMonthly: 200.00,
    price30Min: 2.50,
    price2Hours: 7.00,
    price4Hours: 12.00,
    weekendSurge: 1.0,
    secretAccessInstructions: "🔐 Chave fica no cofre metálico com senha 4020 ao lado do portão.",
    facadePhoto: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80"
    ],
    features: [
      "Coberta",
      "Portão Eletrônico",
      "Iluminação LED"
    ],
    allowedVehicles: ["Moto", "Carro pequeno", "Sedan", "SUV"],
    size: "Padrão",
    isCovered: true,
    heightLimit: "2.10m",
    rules: [
      "Trancar o portão após entrar"
    ],
    status: "Aprovado",
    availabilityStatus: "Disponível",
    isAvailable: true,
    availableHours: "24 horas",
    is24h: true,
    monthlyPlanAvailable: true
  }
];


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
    code: "ITABUNA10",
    discountPercent: 10,
    maxDiscount: 15.00,
    validUntil: "2026-12-31",
    usageCount: 142,
    status: "Ativo"
  }
];

export const INITIAL_REVIEWS = [
  {
    id: "rev_1",
    spaceId: "spc_ita_1",
    userName: "Lucas Oliveira",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
    rating: 5,
    comment: "Excelente opção no centro de Itabuna! Parei na Cinquentenário sem estresse.",
    categories: { seguranca: 5, localizacao: 5, limpeza: 5, atendimento: 5, acesso: 5 },
    date: "2026-08-02"
  }
];

export const INITIAL_WITHDRAWALS = [];

// Shared In-Memory Repository for Cross-Device Multi-Device Live Synchronization
export let GLOBAL_DYNAMIC_PARKING_SPACES = [...INITIAL_PARKING_SPACES];

export function getGlobalParkingSpaces() {
  const saved = localStorage.getItem('vagago_parkingSpaces');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) {
        // Merge saved local items into global array
        parsed.forEach(p => {
          if (!GLOBAL_DYNAMIC_PARKING_SPACES.some(g => g.id === p.id)) {
            GLOBAL_DYNAMIC_PARKING_SPACES.unshift(p);
          }
        });
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

