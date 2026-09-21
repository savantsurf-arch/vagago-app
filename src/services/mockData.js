// Data Models for VagaGo Marketplace Platform

export const INITIAL_USERS = [
  {
    id: "usr_d1",
    name: "Rodrigo Mendonça",
    email: "rodrigo.mendonca@gmail.com",
    role: "CLIENTE",
    phone: "(73) 99182-3490",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80",
    cpf: "842.193.505-12",
    birthDate: "1992-08-29", // Aniversário HOJE
    credits: 45.00,
    status: "Ativo",
    createdAt: "2026-01-15",
    vehicle: { brand: "Toyota", model: "Corolla XEi", plate: "BRA-2E19", color: "Prata", type: "Sedan" }
  },
  {
    id: "usr_d2",
    name: "Camila Vasconcelos",
    email: "camila.vasconcelos@hotmail.com",
    role: "CLIENTE",
    phone: "(73) 98845-1234",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80",
    cpf: "721.492.308-44",
    birthDate: "1996-08-14", // Aniversário este mês
    credits: 120.00,
    status: "Ativo",
    createdAt: "2026-01-20",
    vehicle: { brand: "Chevrolet", model: "Onix Premier", plate: "JQX-4921", color: "Branco", type: "Hatch" }
  },
  {
    id: "usr_d3",
    name: "Felipe Nogueira",
    email: "felipe.nogueira@yahoo.com.br",
    role: "CLIENTE",
    phone: "(73) 99912-8877",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80",
    cpf: "612.839.102-77",
    birthDate: "1988-08-05", // Aniversário este mês
    credits: 0.00,
    status: "Pendente",
    createdAt: "2026-02-28",
    vehicle: { brand: "Jeep", model: "Compass Longitude", plate: "RTH-7B32", color: "Preto", type: "SUV" }
  },
  {
    id: "usr_d4",
    name: "Larissa Santana",
    email: "larissa.santana@gmail.com",
    role: "CLIENTE",
    phone: "(73) 99877-6655",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80",
    cpf: "519.284.773-01",
    birthDate: "1995-09-12",
    credits: 80.00,
    status: "Ativo",
    createdAt: "2026-02-01",
    vehicle: { brand: "Fiat", model: "Argo Drive", plate: "PLN-3A88", color: "Vermelho", type: "Hatch" }
  },
  {
    id: "usr_d5",
    name: "Marcos Vinicius Bahia",
    email: "marcos.bahia@gmail.com",
    role: "CLIENTE",
    phone: "(73) 98122-3344",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
    cpf: "402.918.663-88",
    birthDate: "1990-11-20",
    credits: 15.00,
    status: "Suspenso",
    suspendedUntil: "2026-09-05",
    statusReason: "Estacionou fora do limite demarcado da vaga",
    createdAt: "2026-01-10",
    vehicle: { brand: "Hyundai", model: "Creta Ultimate", plate: "RDZ-9F55", color: "Cinza", type: "SUV" }
  },
  {
    id: "usr_d6",
    name: "Lucas Alencar",
    email: "lucas.alencar@outlook.com",
    role: "CLIENTE",
    phone: "(73) 99155-7788",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
    cpf: "391.029.485-66",
    birthDate: "1999-08-29", // Aniversário HOJE
    credits: 60.00,
    status: "Ativo",
    createdAt: "2026-02-12",
    vehicle: { brand: "Honda", model: "Civic Touring", plate: "OZI-8812", color: "Preto", type: "Sedan" }
  },
  {
    id: "usr_d7",
    name: "Gabriel Porto",
    email: "gabriel.porto@gmail.com",
    role: "CLIENTE",
    phone: "(73) 98833-2211",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80",
    cpf: "281.938.472-55",
    birthDate: "2001-08-18", // Aniversário este mês
    credits: 30.00,
    status: "Ativo",
    createdAt: "2026-02-15",
    vehicle: { brand: "Honda", model: "CG 160 Fan", plate: "PKJ-1190", color: "Azul", type: "Moto" }
  },
  {
    id: "usr_d8",
    name: "Juliana Peixoto (Anfitriã)",
    email: "juliana.peixoto@gmail.com",
    role: "PROPRIETÁRIO",
    phone: "(73) 99881-2244",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    cpf: "192.837.465-99",
    birthDate: "1985-08-22", // Aniversário este mês
    credits: 350.00,
    status: "Ativo",
    createdAt: "2026-01-05"
  },
  {
    id: "usr_d9",
    name: "Carlos Eduardo Costa (Anfitrião)",
    email: "carlos.costa@gmail.com",
    role: "PROPRIETÁRIO",
    phone: "(73) 99112-9900",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80",
    cpf: "938.472.615-33",
    birthDate: "1979-08-29", // Aniversário HOJE
    credits: 620.00,
    status: "Ativo",
    createdAt: "2026-01-08"
  }
];

export const INITIAL_VEHICLES = [
  { id: "v1", userId: "usr_d1", brand: "Toyota", model: "Corolla XEi", plate: "BRA-2E19", color: "Prata", type: "Sedan", isDefault: true },
  { id: "v2", userId: "usr_d2", brand: "Chevrolet", model: "Onix Premier", plate: "JQX-4921", color: "Branco", type: "Hatch", isDefault: true },
  { id: "v3", userId: "usr_d3", brand: "Jeep", model: "Compass Longitude", plate: "RTH-7B32", color: "Preto", type: "SUV", isDefault: true },
  { id: "v4", userId: "usr_d4", brand: "Fiat", model: "Argo Drive", plate: "PLN-3A88", color: "Vermelho", type: "Hatch", isDefault: true },
  { id: "v5", userId: "usr_d5", brand: "Hyundai", model: "Creta Ultimate", plate: "RDZ-9F55", color: "Cinza", type: "SUV", isDefault: true },
  { id: "v6", userId: "usr_d6", brand: "Honda", model: "Civic Touring", plate: "OZI-8812", color: "Preto", type: "Sedan", isDefault: true },
  { id: "v7", userId: "usr_d7", brand: "Honda", model: "CG 160 Fan", plate: "PKJ-1190", color: "Azul", type: "Moto", isDefault: true }
];

export const INITIAL_PARKING_SPACES = [
  {
    id: "sp_itabuna_1",
    title: "Garagem Coberta Praça Adami",
    address: "Av. do Cinquentenário, 450 - Centro, Itabuna - BA",
    neighborhood: "Centro",
    city: "Itabuna",
    state: "BA",
    priceHourly: 7.00,
    priceMonthly: 300.00,
    status: "Aprovado",
    ownerName: "Juliana Peixoto",
    ownerPhone: "(73) 99881-2244",
    ownerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    photos: ["https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=400&q=80"],
    facadePhoto: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=400&q=80",
    lat: -14.7938,
    lng: -39.2775
  },
  {
    id: "sp_itabuna_2",
    title: "Vaga Privativa Shopping Jequitibá",
    address: "Av. Firmino Alves, 120 - Góes Calmon, Itabuna - BA",
    neighborhood: "Góes Calmon",
    city: "Itabuna",
    state: "BA",
    priceHourly: 6.50,
    priceMonthly: 280.00,
    status: "Aprovado",
    ownerName: "Carlos Eduardo Costa",
    ownerPhone: "(73) 99112-9900",
    ownerAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80",
    photos: ["https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=400&q=80"],
    facadePhoto: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=400&q=80",
    lat: -14.7912,
    lng: -39.2741
  },
  {
    id: "sp_itabuna_3",
    title: "Garagem Beira Rio Residencial",
    address: "Rua Almirante Tamandaré, 88 - Jardim Vitória, Itabuna - BA",
    neighborhood: "Jardim Vitória",
    city: "Itabuna",
    state: "BA",
    priceHourly: 6.00,
    priceMonthly: 260.00,
    status: "Aprovado",
    ownerName: "Juliana Peixoto",
    ownerPhone: "(73) 99881-2244",
    photos: ["https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?auto=format&fit=crop&w=400&q=80"],
    facadePhoto: "https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?auto=format&fit=crop&w=400&q=80",
    lat: -14.7981,
    lng: -39.2810
  },
  {
    id: "sp_itabuna_4",
    title: "Vaga Comercial São Caetano",
    address: "Av. Princesa Isabel, 600 - São Caetano, Itabuna - BA",
    neighborhood: "São Caetano",
    city: "Itabuna",
    state: "BA",
    priceHourly: 5.00,
    priceMonthly: 220.00,
    status: "Aprovado",
    ownerName: "Carlos Eduardo Costa",
    ownerPhone: "(73) 99112-9900",
    photos: ["https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80"],
    facadePhoto: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80",
    lat: -14.8050,
    lng: -39.2835
  }
];

export const INITIAL_BOOKINGS = [
  {
    id: "bk_101",
    bookingNumber: "VG-84920",
    spaceId: "sp_itabuna_1",
    spaceTitle: "Garagem Coberta Praça Adami",
    neighborhood: "Centro",
    driverName: "Rodrigo Mendonça",
    driverPhone: "(73) 99182-3490",
    ownerName: "Juliana Peixoto",
    subtotal: 28.00,
    totalPrice: 28.00,
    platformFee: 2.80,
    ownerPayout: 25.20,
    totalHours: 4,
    status: "confirmed",
    date: "2026-08-29",
    vehicle: { brand: "Toyota", model: "Corolla XEi", plate: "BRA-2E19", color: "Prata", type: "Sedan" }
  },
  {
    id: "bk_102",
    bookingNumber: "VG-51928",
    spaceId: "sp_itabuna_2",
    spaceTitle: "Vaga Privativa Shopping Jequitibá",
    neighborhood: "Góes Calmon",
    driverName: "Camila Vasconcelos",
    driverPhone: "(73) 98845-1234",
    ownerName: "Carlos Eduardo Costa",
    subtotal: 39.00,
    totalPrice: 39.00,
    platformFee: 3.90,
    ownerPayout: 35.10,
    totalHours: 6,
    status: "confirmed",
    date: "2026-08-29",
    vehicle: { brand: "Chevrolet", model: "Onix Premier", plate: "JQX-4921", color: "Branco", type: "Hatch" }
  },
  {
    id: "bk_103",
    bookingNumber: "VG-91204",
    spaceId: "sp_itabuna_3",
    spaceTitle: "Garagem Beira Rio Residencial",
    neighborhood: "Jardim Vitória",
    driverName: "Larissa Santana",
    driverPhone: "(73) 99877-6655",
    ownerName: "Juliana Peixoto",
    subtotal: 18.00,
    totalPrice: 18.00,
    platformFee: 1.80,
    ownerPayout: 16.20,
    totalHours: 3,
    status: "confirmed",
    date: "2026-08-28",
    vehicle: { brand: "Fiat", model: "Argo Drive", plate: "PLN-3A88", color: "Vermelho", type: "Hatch" }
  },
  {
    id: "bk_104",
    bookingNumber: "VG-33910",
    spaceId: "sp_itabuna_1",
    spaceTitle: "Garagem Coberta Praça Adami",
    neighborhood: "Centro",
    driverName: "Lucas Alencar",
    driverPhone: "(73) 99155-7788",
    ownerName: "Juliana Peixoto",
    subtotal: 35.00,
    totalPrice: 35.00,
    platformFee: 3.50,
    ownerPayout: 31.50,
    totalHours: 5,
    status: "confirmed",
    date: "2026-08-27",
    vehicle: { brand: "Honda", model: "Civic Touring", plate: "OZI-8812", color: "Preto", type: "Sedan" }
  },
  {
    id: "bk_105",
    bookingNumber: "VG-48201",
    spaceId: "sp_itabuna_4",
    spaceTitle: "Vaga Comercial São Caetano",
    neighborhood: "São Caetano",
    driverName: "Gabriel Porto",
    driverPhone: "(73) 98833-2211",
    ownerName: "Carlos Eduardo Costa",
    subtotal: 15.00,
    totalPrice: 15.00,
    platformFee: 1.50,
    ownerPayout: 13.50,
    totalHours: 3,
    status: "confirmed",
    date: "2026-08-26",
    vehicle: { brand: "Honda", model: "CG 160 Fan", plate: "PKJ-1190", color: "Azul", type: "Moto" }
  }
];

export const INITIAL_DEMAND_REGIONS = [
  {
    id: "dem_1",
    region: "Centro / Cinquentenário",
    city: "Itabuna",
    neighborhood: "Centro",
    searchesLast7Days: 245,
    status: "MUITO ALTA DEMANDA",
    avgHourlyPrice: "R$ 6,50",
    recommendedHostRevenue: "R$ 620 /mês"
  },
  {
    id: "dem_2",
    region: "Shopping Jequitibá / Góes Calmon",
    city: "Itabuna",
    neighborhood: "Góes Calmon",
    searchesLast7Days: 180,
    status: "MUITO ALTA DEMANDA",
    avgHourlyPrice: "R$ 6,00",
    recommendedHostRevenue: "R$ 560 /mês"
  },
  {
    id: "dem_3",
    region: "Jardim Vitória / Beira Rio",
    city: "Itabuna",
    neighborhood: "Jardim Vitória",
    searchesLast7Days: 135,
    status: "ALTA DEMANDA",
    avgHourlyPrice: "R$ 5,50",
    recommendedHostRevenue: "R$ 500 /mês"
  },
  {
    id: "dem_4",
    region: "São Caetano / Fátima",
    city: "Itabuna",
    neighborhood: "São Caetano",
    searchesLast7Days: 95,
    status: "ALTA DEMANDA",
    avgHourlyPrice: "R$ 4,50",
    recommendedHostRevenue: "R$ 440 /mês"
  },
  {
    id: "dem_5",
    region: "Conceição / Vila Zara",
    city: "Itabuna",
    neighborhood: "Conceição",
    searchesLast7Days: 78,
    status: "MÉDIA DEMANDA",
    avgHourlyPrice: "R$ 4,00",
    recommendedHostRevenue: "R$ 390 /mês"
  }
];

export const ITABUNA_NEIGHBORHOODS = [
  "Centro",
  "Góes Calmon",
  "Jardim Vitória",
  "Conceição",
  "São Caetano",
  "Fátima",
  "Pontalzinho",
  "Santo Antônio",
  "Castália",
  "Zildolândia",
  "Califórnia",
  "Mangabinha"
];

export const INITIAL_NOTIFICATIONS = [];

export const INITIAL_COUPONS = [
  {
    id: "cp_1",
    code: "VAGAGO10",
    discountPercent: 10,
    maxDiscount: 15.00,
    validUntil: "2026-12-31",
    usageCount: 14,
    status: "Ativo",
    type: "percent"
  },
  {
    id: "cp_2",
    code: "PRIMEIRAVAGA",
    discountPercent: 15,
    maxDiscount: 20.00,
    validUntil: "2026-12-31",
    usageCount: 28,
    status: "Ativo",
    type: "percent"
  },
  {
    id: "cp_3",
    code: "CENTROITABUNA",
    discountPercent: 20,
    maxDiscount: 25.00,
    validUntil: "2026-10-31",
    usageCount: 8,
    status: "Ativo",
    type: "percent"
  }
];

export const INITIAL_DAYS_OFF = [
  {
    id: "do_1",
    title: "Dia das Mães - Taxa Zero Anfitrião",
    date: "2026-05-10",
    description: "Isenção total da taxa da plataforma (0% comissão VagaGo) para novas reservas contratadas neste dia.",
    active: true,
    discountFeePercent: 100,
    createdAt: "2026-02-01"
  },
  {
    id: "do_2",
    title: "Aniversário de Itabuna - 28 de Julho",
    date: "2026-07-28",
    description: "0% de taxa da plataforma para todas as garagens reservadas no feriado da cidade de Itabuna.",
    active: true,
    discountFeePercent: 100,
    createdAt: "2026-02-01"
  },
  {
    id: "do_3",
    title: "Black Friday VagaGo",
    date: "2026-11-27",
    description: "Isenção de comissão da plataforma para impulsionar a locação de novas vagas.",
    active: true,
    discountFeePercent: 100,
    createdAt: "2026-02-01"
  }
];

export const INITIAL_REVIEWS = [];

export const INITIAL_WITHDRAWALS = [
  {
    id: "w_1",
    ownerName: "Carlos Eduardo Costa",
    amount: 350.00,
    pixKey: "carlos.costa@gmail.com",
    status: "Pendente",
    requestedAt: "29/08/2026 às 14:20"
  },
  {
    id: "w_2",
    ownerName: "Juliana Peixoto",
    amount: 520.00,
    pixKey: "73998812244",
    status: "Pago",
    requestedAt: "25/08/2026 às 09:15"
  }
];

// Shared In-Memory Repository for Cross-Device Multi-Device Live Synchronization
export let GLOBAL_DYNAMIC_PARKING_SPACES = [];

export function getGlobalParkingSpaces() {
  const saved = localStorage.getItem('vagago_parkingSpaces');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {}
  }
  return INITIAL_PARKING_SPACES;
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
