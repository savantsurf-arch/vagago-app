import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  ShieldCheck,
  Users,
  Car,
  Calendar,
  DollarSign,
  Gift,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Lock,
  Search,
  Check,
  X,
  Filter,
  Eye,
  UserX,
  UserCheck,
  Ban,
  Clock,
  Cake,
  TrendingUp,
  MapPin,
  Sparkles,
  Percent,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  SlidersHorizontal,
  Flame,
  Zap,
  Info,
  ChevronRight,
  Copy,
  Gauge,
  Compass,
  CheckCircle,
  Lightbulb,
  Scale,
  CreditCard,
  Wallet,
  Star,
  Activity,
  ArrowRight
} from 'lucide-react';

export const AdminPanel = () => {
  const appContext = useApp() || {};
  const {
    users = [],
    parkingSpaces = [],
    setParkingSpaces = () => {},
    bookings = [],
    withdrawals = [],
    approveWithdrawal = () => {},
    coupons = [],
    addCoupon = () => {},
    toggleCouponStatus = () => {},
    deleteCoupon = () => {},
    daysOff = [],
    addDayOff = () => {},
    toggleDayOffStatus = () => {},
    deleteDayOff = () => {},
    approveUserRegistration = () => {},
    suspendUser = () => {},
    banUser = () => {},
    activateUser = () => {},
    deleteUser = () => {},
    deleteParkingSpace = () => {},
    itabunaNeighborhoods = [],
    demandRegions = [],
    setActiveTab = () => {},
    vehicles = []
  } = appContext;

  // Active Admin Module Tab
  const [adminTab, setAdminTab] = useState('visãogeral'); 
  // Options: 'visãogeral', 'motoristas_analytics', 'anfitrioes_analytics', 'comparativo', 'frota', 'motoristas', 'vagas', 'saques', 'cupons', 'aniversariantes'

  // Search and Filter States
  const [driverSearch, setDriverSearch] = useState('');
  const [driverStatusFilter, setDriverStatusFilter] = useState('ALL'); // ALL, Ativo, Pendente, Suspenso, Banido
  const [selectedUserForInspection, setSelectedUserForInspection] = useState(null);
  const [userToSuspend, setUserToSuspend] = useState(null);
  const [suspendDays, setSuspendDays] = useState('7');
  const [suspendReason, setSuspendReason] = useState('Descumprimento das regras do condomínio');

  // Coupon & Day Off Form State
  const [couponMode, setCouponMode] = useState('coupon'); // 'coupon' | 'day_off'
  const [newCouponCode, setNewCouponCode] = useState('PROMO20');
  const [newCouponPercent, setNewCouponPercent] = useState('20');
  const [newCouponMax, setNewCouponMax] = useState('25');
  const [newDayOffTitle, setNewDayOffTitle] = useState('Dia dos Pais - Taxa Zero');
  const [newDayOffDate, setNewDayOffDate] = useState('2026-08-09');
  const [newDayOffDesc, setNewDayOffDesc] = useState('Isenção total da taxa da plataforma para todas as reservas contratadas no Dia dos Pais.');
  const [copiedNotice, setCopiedNotice] = useState('');

  // Safe Arrays
  const safeUsers = Array.isArray(users) ? users.filter(Boolean) : [];
  const safeSpaces = Array.isArray(parkingSpaces) ? parkingSpaces.filter(Boolean) : [];
  const safeBookings = Array.isArray(bookings) ? bookings.filter(Boolean) : [];
  const safeWithdrawals = Array.isArray(withdrawals) ? withdrawals.filter(Boolean) : [];
  const safeCoupons = Array.isArray(coupons) ? coupons.filter(Boolean) : [];
  const safeDaysOff = Array.isArray(daysOff) ? daysOff.filter(Boolean) : [];
  const safeDemandRegions = Array.isArray(demandRegions) ? demandRegions.filter(Boolean) : [];

  // ==========================================
  // METRICS & BI CALCULATIONS
  // ==========================================
  const totalGMV = safeBookings.reduce((sum, b) => sum + Number(b?.subtotal || b?.totalPrice || b?.amount || 0), 0);
  const totalPlatformRevenue = safeBookings.reduce((sum, b) => sum + Number(b?.platformFee || b?.platform_fee || ((b?.totalPrice || 0) * 0.1) || 0), 0);
  const totalHostPayouts = safeBookings.reduce((sum, b) => sum + Number(b?.ownerPayout || b?.owner_payout || ((b?.totalPrice || 0) * 0.9) || 0), 0);

  const driversList = safeUsers.filter(u => u && (u.role === 'CLIENTE' || !u.role));
  const hostsList = safeUsers.filter(u => u && u.role === 'PROPRIETÁRIO');

  const pendingApprovalsCount = safeUsers.filter(u => u && u.status === 'Pendente').length;
  const suspendedCount = safeUsers.filter(u => u && (u.status === 'Suspenso' || u.status === 'Banido')).length;
  const pendingWithdrawalsCount = safeWithdrawals.filter(w => w && w.status === 'Pendente').length;

  // Rental Averages
  const avgHourlyPrice = safeSpaces.length > 0
    ? (safeSpaces.reduce((sum, s) => sum + Number(s?.priceHourly || 6), 0) / safeSpaces.length).toFixed(2)
    : '6.50';

  const avgBookingTicket = safeBookings.length > 0
    ? (totalGMV / safeBookings.length).toFixed(2)
    : '28.00';

  // BI: Bairros mais alugados em Itabuna
  const itabunaNeighs = Array.isArray(itabunaNeighborhoods) && itabunaNeighborhoods.length > 0
    ? itabunaNeighborhoods
    : ["Centro", "Góes Calmon", "Jardim Vitória", "Conceição", "São Caetano", "Fátima", "Pontalzinho", "Santo Antônio"];

  const neighborhoodRentalsMap = {};
  itabunaNeighs.forEach(n => { neighborhoodRentalsMap[n] = 0; });
  
  // Seed with realistic rentals count per neighborhood
  neighborhoodRentalsMap['Centro'] = 48;
  neighborhoodRentalsMap['Góes Calmon'] = 34;
  neighborhoodRentalsMap['Jardim Vitória'] = 26;
  neighborhoodRentalsMap['São Caetano'] = 19;
  neighborhoodRentalsMap['Conceição'] = 14;
  neighborhoodRentalsMap['Fátima'] = 11;
  neighborhoodRentalsMap['Pontalzinho'] = 8;
  neighborhoodRentalsMap['Santo Antônio'] = 6;

  safeBookings.forEach(b => {
    if (!b) return;
    const space = safeSpaces.find(s => s && (s.id === b.spaceId || s.id === b.parkingId));
    const neigh = space?.neighborhood || 'Centro';
    neighborhoodRentalsMap[neigh] = (neighborhoodRentalsMap[neigh] || 0) + 1;
  });

  const neighborhoodChartData = Object.keys(neighborhoodRentalsMap)
    .map(name => ({ name, reservas: neighborhoodRentalsMap[name] || 0 }))
    .sort((a, b) => b.reservas - a.reservas)
    .slice(0, 7);

  // BI: Revenue chart data (Semana)
  const revenueChartData = [
    { periodo: 'Seg', gmv: 340, receita: 34, reservas: 12 },
    { periodo: 'Ter', gmv: 420, receita: 42, reservas: 15 },
    { periodo: 'Qua', gmv: 510, receita: 51, reservas: 18 },
    { periodo: 'Qui', gmv: 680, receita: 68, reservas: 24 },
    { periodo: 'Sex', gmv: 920, receita: 92, reservas: 32 },
    { periodo: 'Sáb', gmv: 1150, receita: 115, reservas: 41 },
    { periodo: 'Dom', gmv: 780, receita: 78, reservas: 28 }
  ];

  // BI: Horários de Pico em Itabuna (Entradas na Garagem)
  const peakHoursData = [
    { hora: '07h', fluxo: 18 },
    { hora: '08h', fluxo: 45 },
    { hora: '09h', fluxo: 28 },
    { hora: '10h', fluxo: 22 },
    { hora: '11h', fluxo: 35 },
    { hora: '12h', fluxo: 38 },
    { hora: '13h', fluxo: 30 },
    { hora: '14h', fluxo: 25 },
    { hora: '15h', fluxo: 20 },
    { hora: '16h', fluxo: 22 },
    { hora: '17h', fluxo: 42 },
    { hora: '18h', fluxo: 48 },
    { hora: '19h', fluxo: 32 },
    { hora: '20h', fluxo: 26 },
    { hora: '21h', fluxo: 14 }
  ];

  // ==============================================================
  // 1. MOTORISTAS (LOCATÁRIOS) - DADOS GRÁFICOS
  // ==============================================================
  const driverDurationData = [
    { faixa: '1 a 2 Horas (Rápido)', percentual: 35, count: 49, color: '#0284c7' },
    { faixa: '3 a 4 Horas (Comercial)', percentual: 42, count: 59, color: '#10b981' },
    { faixa: '5 a 8 Horas (Turno)', percentual: 15, count: 21, color: '#f59e0b' },
    { faixa: 'Diária / Mensal (Integral)', percentual: 8, count: 11, color: '#8b5cf6' }
  ];

  const driverFeaturesPreferenceData = [
    { item: 'Garagem Coberta / Subsolo', preferencia: 78, cor: '#0284c7' },
    { item: 'Câmera & Portaria 24h', preferencia: 65, cor: '#10b981' },
    { item: 'Portão Automático / Tag', preferencia: 58, cor: '#8b5cf6' },
    { item: 'Acesso Livre 24 Horas', preferencia: 45, cor: '#f59e0b' },
    { item: 'Recarga para Elétrico', preferencia: 8, cor: '#06b6d4' }
  ];

  const driverPaymentMethodsData = [
    { name: 'PIX Direto no Check-out', value: 62, color: '#10b981' },
    { name: 'Saldo da Carteira Digital VagaGo', value: 28, color: '#0284c7' },
    { name: 'Cupons Promocionais Aplicados', value: 10, color: '#ec4899' }
  ];

  const driverLoyaltyData = [
    { categoria: 'Novos Motoristas (1ª reserva)', percentual: 42, cor: '#38bdf8' },
    { categoria: 'Recorrentes (2 a 5 reservas/mês)', percentual: 38, cor: '#34d399' },
    { categoria: 'Power Users (+5 reservas/mês)', percentual: 20, cor: '#a78bfa' }
  ];

  // ==============================================================
  // 2. ANFITRIÕES (LOCADORES) - DADOS GRÁFICOS
  // ==============================================================
  const hostOccupancyByNeighborhoodData = [
    { bairro: 'Centro', taxaOcupacao: 84, faturamentoMedio: 680, cor: '#9333ea' },
    { bairro: 'Góes Calmon', taxaOcupacao: 76, faturamentoMedio: 540, cor: '#0284c7' },
    { bairro: 'Jardim Vitória', taxaOcupacao: 68, faturamentoMedio: 490, cor: '#10b981' },
    { bairro: 'São Caetano', taxaOcupacao: 52, faturamentoMedio: 380, cor: '#f59e0b' },
    { bairro: 'Conceição', taxaOcupacao: 44, faturamentoMedio: 310, cor: '#64748b' }
  ];

  const hostRevenueDistributionData = [
    { faixa: 'R$ 200 a R$ 400 /mês (1 vaga parcial)', percentual: 35, color: '#94a3b8' },
    { faixa: 'R$ 401 a R$ 800 /mês (1 vaga comercial)', percentual: 45, color: '#10b981' },
    { faixa: 'R$ 801 a R$ 1.500+ /mês (2+ vagas)', percentual: 20, color: '#0284c7' }
  ];

  const hostSpeedConfirmationData = [
    { tempo: 'Imediato (Reserva Instantânea)', percentual: 82, color: '#10b981' },
    { tempo: 'Até 5 minutos', percentual: 12, color: '#f59e0b' },
    { tempo: 'Mais de 10 minutos', percentual: 6, color: '#ef4444' }
  ];

  // ==============================================================
  // 3. COMPARATIVO & MERCADO (DEMANDA vs OFERTA)
  // ==============================================================
  const marketDemandVsSupplyData = [
    { bairro: 'Centro', demandaMotoristas: 42, ofertaGaragens: 28, diferenca: '+14% Déficit de Vagas' },
    { bairro: 'Góes Calmon', demandaMotoristas: 24, ofertaGaragens: 22, diferenca: '+2% Equilíbrio' },
    { bairro: 'Jardim Vitória', demandaMotoristas: 18, ofertaGaragens: 20, diferenca: '-2% Equilíbrio' },
    { bairro: 'São Caetano', demandaMotoristas: 9, ofertaGaragens: 16, diferenca: '-7% Sobra de Vagas' },
    { bairro: 'Conceição', demandaMotoristas: 7, ofertaGaragens: 14, diferenca: '-7% Sobra de Vagas' }
  ];

  const conversionFunnelData = [
    { etapa: '1. Buscas no Mapa / Região', volume: 100, valor: '1.240 buscas' },
    { etapa: '2. Clique nos Detalhes da Garagem', volume: 68, valor: '843 visualizações' },
    { etapa: '3. Início do Fluxo de Reserva', volume: 41, valor: '508 intenções' },
    { etapa: '4. Reserva Concluída & Paga', volume: 38, valor: '471 locações' }
  ];

  // ==============================================================
  // 4. FROTA & CARROS
  // ==============================================================
  const topCarModelsRanking = [
    { rank: 1, brand: 'Toyota', model: 'Corolla / Yaris', percentage: 38, count: 42, category: 'Sedan Médio', icon: '🚗', badge: 'Mais Popular', color: '#0284c7' },
    { rank: 2, brand: 'Chevrolet', model: 'Onix / Tracker', percentage: 27, count: 30, category: 'Hatch / SUV Compacto', icon: '🚙', badge: 'Alta Rotatividade', color: '#10b981' },
    { rank: 3, brand: 'Fiat', model: 'Strada / Argo / Mobi', percentage: 21, count: 23, category: 'Hatch / Picape', icon: '🛻', badge: 'Comercial', color: '#f59e0b' },
    { rank: 4, brand: 'Hyundai', model: 'Creta / HB20', percentage: 18, count: 20, category: 'SUV / Hatch', icon: '🚙', badge: 'Urbano', color: '#8b5cf6' },
    { rank: 5, brand: 'Honda', model: 'Civic / HR-V', percentage: 16, count: 17, category: 'Sedan / SUV', icon: '🚗', badge: 'Fidelizado', color: '#ec4899' },
    { rank: 6, brand: 'Jeep', model: 'Compass / Renegade', percentage: 12, count: 13, category: 'SUV Médio', icon: '🚙', badge: 'Porte Maior', color: '#6366f1' },
    { rank: 7, brand: 'Motos', model: 'Honda CG 160 / Fazer', percentage: 10, count: 11, category: 'Motocicleta', icon: '🏍️', badge: 'Ágil / Econômico', color: '#14b8a6' },
    { rank: 8, brand: 'BYD / Elétricos', model: 'Dolphin / Song Plus', percentage: 6, count: 7, category: 'Elétrico / Híbrido', icon: '⚡', badge: 'Em Expansão', color: '#06b6d4' }
  ];

  const vehicleCategoriesData = [
    { name: 'Hatchbacks (Onix, Argo, HB20)', value: 36, color: '#10b981' },
    { name: 'Sedans (Corolla, Civic, Yaris)', value: 28, color: '#0284c7' },
    { name: 'SUVs & Crossovers (Compass, Creta, HR-V)', value: 22, color: '#8b5cf6' },
    { name: 'Motocicletas (CG 160, Fazer 250)', value: 10, color: '#f59e0b' },
    { name: 'Picapes & Elétricos (Strada, Dolphin)', value: 4, color: '#ec4899' }
  ];

  // ==========================================
  // BIRTHDAYS FILTER (CRM & FIDELIZAÇÃO)
  // ==========================================
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();

  // Mock birth dates for users that don't have one
  const enrichedUsersWithBirthday = safeUsers.map((u, idx) => {
    let bDay = typeof u?.birthDate === 'string' ? u.birthDate : '';
    if (!bDay) {
      const m = ((idx * 3 + 2) % 12) + 1;
      const d = ((idx * 5 + 7) % 28) + 1;
      bDay = `199${idx % 9}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    let month = 1;
    let day = 1;
    if (bDay.includes('-')) {
      const parts = bDay.split('-');
      month = Number(parts[1]) || 1;
      day = Number(parts[2]) || 1;
    } else if (bDay.includes('/')) {
      const parts = bDay.split('/');
      day = Number(parts[0]) || 1;
      month = Number(parts[1]) || 1;
    }

    const isThisMonth = month === currentMonth;
    const isToday = isThisMonth && day === currentDay;
    return { ...u, birthDate: bDay, isBirthdayMonth: isThisMonth, isBirthdayToday: isToday };
  });

  const birthdayUsersMonth = enrichedUsersWithBirthday.filter(u => u.isBirthdayMonth);
  const birthdayUsersToday = enrichedUsersWithBirthday.filter(u => u.isBirthdayToday);

  // Filtered drivers list
  const filteredDrivers = enrichedUsersWithBirthday.filter(u => {
    if (u.role === 'PROPRIETÁRIO') return false;
    if (driverStatusFilter !== 'ALL' && (u.status || 'Ativo') !== driverStatusFilter) return false;
    if (driverSearch.trim()) {
      const q = driverSearch.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      const matchVehicle = u.vehicle ? `${u.vehicle.brand} ${u.vehicle.model} ${u.vehicle.plate}`.toLowerCase().includes(q) : false;
      return matchName || matchEmail || matchPhone || matchVehicle;
    }
    return true;
  });

  // Handlers
  const handleToggleSpot = (id) => {
    setParkingSpaces(prev => (Array.isArray(prev) ? prev : []).map(s => {
      if (s?.id === id) {
        return { ...s, status: s.status === 'Aprovado' ? 'Pendente' : 'Aprovado' };
      }
      return s;
    }));
  };

  const handleCreateCouponSubmit = (e) => {
    e.preventDefault();
    if (couponMode === 'coupon') {
      if (!newCouponCode) return;
      addCoupon({
        code: newCouponCode.toUpperCase().trim(),
        discountPercent: Number(newCouponPercent),
        maxDiscount: Number(newCouponMax),
        validUntil: '2026-12-31'
      });
      setNewCouponCode('');
    } else {
      if (!newDayOffTitle || !newDayOffDate) return;
      addDayOff({
        title: newDayOffTitle,
        date: newDayOffDate,
        description: newDayOffDesc,
        discountFeePercent: 100
      });
      setNewDayOffTitle('');
    }
  };

  const copyToClipboard = (text, label) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedNotice(`${label} copiado!`);
      setTimeout(() => setCopiedNotice(''), 3000);
    } catch (e) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Master Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl shadow-lg ring-2 ring-purple-400/30">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/30 text-purple-200 text-[11px] font-black px-3 py-0.5 rounded-full border border-purple-400/30 uppercase tracking-wider">
                Área de Controle Master
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-mono px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                /admin
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1.5 text-white">
              Painel de Administração VagaGo
            </h1>
            <p className="text-xs text-purple-200/80">
              Análise gráfica de motoristas, anfitriões, comparativos de mercado, moderação e controle financeiro
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('landing')}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition cursor-pointer"
          >
            Ver App como Usuário
          </button>
        </div>
      </div>

      {copiedNotice && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl font-bold text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{copiedNotice}</span>
        </div>
      )}

      {/* Primary KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Volume Transacionado (GMV)</span>
          <div className="text-xl font-black text-slate-900">R$ {totalGMV.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500 font-medium">{safeBookings.length} reservas registradas</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">Receita VagaGo (10%)</span>
          <div className="text-xl font-black text-purple-700">R$ {totalPlatformRevenue.toFixed(2)}</div>
          <div className="text-[11px] text-purple-600 font-bold">Comissão da plataforma</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Repasses aos Locadores</span>
          <div className="text-xl font-black text-emerald-600">R$ {totalHostPayouts.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500">{hostsList.length} anfitriões cadastrados</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Garagens em Itabuna</span>
          <div className="text-xl font-black text-sky-600">{safeSpaces.length} vagas</div>
          <div className="text-[11px] text-slate-500">Média: R$ {avgHourlyPrice}/h</div>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Moderação Pendente</span>
          <div className="text-xl font-black text-amber-700">{pendingApprovalsCount + pendingWithdrawalsCount}</div>
          <div className="text-[11px] text-amber-800">{pendingApprovalsCount} cadastros • {pendingWithdrawalsCount} saques</div>
        </div>

      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        {[
          { id: 'visãogeral', label: '📊 Visão Geral & BI' },
          { id: 'motoristas_analytics', label: '🚗 Dados dos Motoristas' },
          { id: 'anfitrioes_analytics', label: '🏠 Dados dos Anfitriões' },
          { id: 'comparativo', label: '⚖️ Comparativo & Mercado' },
          { id: 'frota', label: '🚘 Frota & Carros' },
          { id: 'motoristas', label: `👤 Gestão de Motoristas (${driversList.length})` },
          { id: 'vagas', label: `🅿️ Garagens (${safeSpaces.length})` },
          { id: 'saques', label: `💰 Saques PIX (${pendingWithdrawalsCount})` },
          { id: 'cupons', label: `🎟️ Cupons & Days Off (${safeCoupons.length + safeDaysOff.length})` },
          { id: 'aniversariantes', label: `🎂 Aniversariantes (${birthdayUsersMonth.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setAdminTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 cursor-pointer ${
              adminTab === tab.id
                ? 'bg-purple-900 text-white shadow-md font-extrabold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* MODULE 1: VISÃO GERAL & BI EXECUTIVO */}
      {/* ============================================================== */}
      {adminTab === 'visãogeral' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart: Faturamento e Receita */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Faturamento da Plataforma (GMV x Receita)</h3>
                  <p className="text-xs text-slate-500">Volume bruto transacionado e comissão líquida de 10% VagaGo</p>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                  Ticket Médio: R$ {avgBookingTicket}
                </span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <XAxis dataKey="periodo" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip formatter={(v) => [`R$ ${v}`, 'Valor']} />
                    <Area type="monotone" dataKey="gmv" stroke="#6366f1" fill="#e0e7ff" name="Volume Total (GMV)" />
                    <Area type="monotone" dataKey="receita" stroke="#9333ea" fill="#f3e8ff" name="Receita VagaGo (10%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart: Bairros Mais Alugados em Itabuna */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Bairros com Mais Aluguéis de Garagens</h3>
                <p className="text-xs text-slate-500">Concentração de locações por região de Itabuna - BA</p>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={neighborhoodChartData} layout="vertical">
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                    <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} width={90} />
                    <Tooltip />
                    <Bar dataKey="reservas" fill="#9333ea" radius={[0, 6, 6, 0]} name="Reservas Concluídas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Quick Demands Regions in Itabuna */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Mapeamento de Demanda e Bairros em Expansão</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {safeDemandRegions.map((region) => (
                <div key={region.id || Math.random()} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">{region.region}</span>
                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md uppercase border border-rose-200">
                      {region.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">🔥 {region.searchesLast7Days} buscas na última semana</p>
                  <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                    <span className="text-slate-600">Tarifa sugerida: <strong>{region.avgHourlyPrice}</strong></span>
                    <span className="text-emerald-700 font-bold">{region.recommendedHostRevenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 2: DADOS & ANALYTICS DOS MOTORISTAS (LOCATÁRIOS) */}
      {/* ============================================================== */}
      {adminTab === 'motoristas_analytics' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Summary Card */}
          <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-sky-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-400/30">
                <Car className="w-8 h-8" />
              </div>
              <div>
                <span className="bg-sky-500/30 text-sky-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold">
                  Comportamento dos Locatários
                </span>
                <h3 className="text-xl font-black text-white mt-1">Analytics de Uso dos Motoristas</h3>
                <p className="text-xs text-slate-300">Tempo de permanência, itens mais buscados, fidelização e ticket médio</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-right">
              <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-sky-300 uppercase block font-bold">Permanência Média</span>
                <strong className="text-base text-white">3.8 Horas</strong>
              </div>
              <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-emerald-300 uppercase block font-bold">Taxa de Extensão</span>
                <strong className="text-base text-white">24%</strong>
              </div>
            </div>
          </div>

          {/* Grid of Driver Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Graph 1: Duração das Reservas */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Tempo de Permanência nas Garagens</h4>
                <p className="text-xs text-slate-500">Distribuição percentual da duração das locações contratadas</p>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={driverDurationData}>
                    <XAxis dataKey="faixa" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
                    <Tooltip formatter={(v) => [`${v}%`, 'Percentual']} />
                    <Bar dataKey="percentual" fill="#0284c7" radius={[6, 6, 0, 0]} name="% dos Motoristas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-600">Pico de permanência: <strong>3 a 4 horas (42%)</strong></span>
                <span className="text-slate-600">Diárias completas: <strong>8% das reservas</strong></span>
              </div>
            </div>

            {/* Graph 2: Itens Mais Buscados / Preferências de Filtros */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">O que os Motoristas mais Exigem nas Garagens</h4>
                <p className="text-xs text-slate-500">Filtros e comodidades mais selecionados na busca por vagas</p>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={driverFeaturesPreferenceData} layout="vertical">
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} unit="%" />
                    <YAxis dataKey="item" type="category" stroke="#475569" fontSize={10} width={130} />
                    <Tooltip formatter={(v) => [`${v}% dos motoristas`, 'Preferência']} />
                    <Bar dataKey="preferencia" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>78% dos motoristas priorizam garagens 100% cobertas para proteção solar e de chuva.</span>
              </div>
            </div>

            {/* Graph 3: Métodos de Pagamento Usados */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Meios de Pagamento Escolhidos</h4>
                <p className="text-xs text-slate-500">Como os motoristas pagam suas locações no app</p>
              </div>

              <div className="h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={driverPaymentMethodsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                      {driverPaymentMethodsData.map((entry, index) => (
                        <Cell key={`cell-pay-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1 text-xs">
                {driverPaymentMethodsData.map(p => (
                  <div key={p.name} className="flex justify-between items-center p-2 rounded-xl bg-slate-50">
                    <span className="text-slate-700 font-medium">{p.name}</span>
                    <strong className="text-slate-900 font-black">{p.value}%</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Graph 4: Fidelidade & Recorrência */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Nível de Recorrência dos Motoristas</h4>
                <p className="text-xs text-slate-500">Frequência mensal de contratação de garagens</p>
              </div>

              <div className="space-y-3 pt-2">
                {driverLoyaltyData.map((item) => (
                  <div key={item.categoria} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{item.categoria}</span>
                      <span>{item.percentual}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.percentual}%`, backgroundColor: item.cor }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 space-y-1 mt-4">
                <strong>📈 Média de Uso: 3.2 reservas por motorista/mês</strong>
                <p className="text-[11px] text-sky-800">58% dos motoristas voltam a alugar a mesma vaga na semana seguinte.</p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 3: DADOS & ANALYTICS DOS ANFITRIÕES (LOCADORES) */}
      {/* ============================================================== */}
      {adminTab === 'anfitrioes_analytics' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Summary Card */}
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-purple-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-400/30">
                <DollarSign className="w-8 h-8" />
              </div>
              <div>
                <span className="bg-purple-500/30 text-purple-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold">
                  Performance dos Locadores
                </span>
                <h3 className="text-xl font-black text-white mt-1">Analytics de Oferta & Faturamento dos Anfitriões</h3>
                <p className="text-xs text-slate-300">Renda líquida média, taxa de ocupação por bairro e tempo de resposta</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-right">
              <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-purple-300 uppercase block font-bold">Renda Média / Vaga</span>
                <strong className="text-base text-emerald-400">R$ 512 /mês</strong>
              </div>
              <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-sky-300 uppercase block font-bold">Avaliação Média</span>
                <strong className="text-base text-amber-300">⭐ 4.88</strong>
              </div>
            </div>
          </div>

          {/* Grid of Host Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Graph 1: Taxa de Ocupação por Bairro */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Taxa de Ocupação das Garagens por Bairro</h4>
                  <p className="text-xs text-slate-500">% média de tempo em que a vaga fica ocupada com reservas pagas</p>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl">
                  Líder: Centro (84%)
                </span>
              </div>

              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hostOccupancyByNeighborhoodData}>
                    <XAxis dataKey="bairro" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
                    <Tooltip formatter={(v) => [`${v}%`, 'Taxa de Ocupação']} />
                    <Bar dataKey="taxaOcupacao" fill="#9333ea" radius={[6, 6, 0, 0]} name="Ocupação da Vaga" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-100 text-center">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">CENTRO</span>
                  <strong className="text-purple-700 font-black">R$ 680 /mês</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">GÓES CALMON</span>
                  <strong className="text-sky-700 font-black">R$ 540 /mês</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">JARDIM VITÓRIA</span>
                  <strong className="text-emerald-700 font-black">R$ 490 /mês</strong>
                </div>
              </div>
            </div>

            {/* Graph 2: Faixa de Renda Líquida Mensal dos Proprietários */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Distribuição de Renda dos Locadores</h4>
                <p className="text-xs text-slate-500">Quanto os anfitriões recebem livre na conta (90% líquido)</p>
              </div>

              <div className="h-60 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={hostRevenueDistributionData} dataKey="percentual" nameKey="faixa" cx="50%" cy="50%" outerRadius={75} label>
                      {hostRevenueDistributionData.map((entry, index) => (
                        <Cell key={`cell-rev-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`, 'Proporção']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1 text-xs">
                {hostRevenueDistributionData.map(h => (
                  <div key={h.faixa} className="flex justify-between items-center p-2 rounded-xl bg-slate-50">
                    <span className="text-slate-700 font-medium truncate">{h.faixa}</span>
                    <strong className="text-slate-900 font-black shrink-0">{h.percentual}%</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Graph 3: Velocidade de Liberação do Portão / Resposta */}
            <div className="lg:col-span-12 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Velocidade de Confirmação & Liberação de Acesso</h4>
                  <p className="text-xs text-slate-500">Tempo que o anfitrião ou sistema leva para liberar a entrada do veículo</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">
                  82% Instantâneo (Tag/Automação)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {hostSpeedConfirmationData.map(s => (
                  <div key={s.tempo} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs font-bold text-slate-700">{s.tempo}</span>
                    <div className="text-2xl font-black text-slate-900">{s.percentual}%</div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.percentual}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 4: COMPARATIVO & DINÂMICA DO MARKETPLACE */}
      {/* ============================================================== */}
      {adminTab === 'comparativo' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-3xl border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-400/30">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold">
                  Balanço Demanda vs Oferta
                </span>
                <h3 className="text-xl font-black text-white mt-1">Comparativos & Dinâmica do Ecossistema</h3>
                <p className="text-xs text-slate-300">Cruzamento de dados entre motoristas que buscam e anfitriões que ofertam em Itabuna</p>
              </div>
            </div>

            <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 text-right">
              <span className="text-[10px] text-emerald-300 uppercase block font-bold">Relação de Liquidez</span>
              <strong className="text-lg text-white">3.8 Motoristas / Vaga</strong>
            </div>
          </div>

          {/* Main Comparison Chart: Demanda vs Oferta por Bairro */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Curva Comparativa: Procura de Motoristas vs Vagas Disponíveis</h4>
                <p className="text-xs text-slate-500">Identificação clara de regiões com déficit ou sobra de garagens em Itabuna</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-sky-700">
                  <span className="w-3 h-3 rounded-full bg-sky-600" />
                  Demanda Motoristas (%)
                </span>
                <span className="flex items-center gap-1.5 text-purple-700">
                  <span className="w-3 h-3 rounded-full bg-purple-600" />
                  Oferta de Garagens (%)
                </span>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketDemandVsSupplyData}>
                  <XAxis dataKey="bairro" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
                  <Tooltip />
                  <Bar dataKey="demandaMotoristas" fill="#0284c7" radius={[4, 4, 0, 0]} name="Demanda dos Motoristas (%)" />
                  <Bar dataKey="ofertaGaragens" fill="#9333ea" radius={[4, 4, 0, 0]} name="Oferta de Garagens (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Strategic Diagnostic Cards per Neighborhood */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {marketDemandVsSupplyData.map(m => (
                <div key={m.bairro} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-xs text-slate-900 block">{m.bairro}</strong>
                  <div className="text-[11px] font-bold text-slate-600">
                    Procura: <span className="text-sky-700">{m.demandaMotoristas}%</span> • Vagas: <span className="text-purple-700">{m.ofertaGaragens}%</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md inline-block ${
                    m.diferenca.includes('Déficit')
                      ? 'bg-rose-100 text-rose-800'
                      : m.diferenca.includes('Equilíbrio')
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {m.diferenca}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Funnel & Conversion Journey */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Funil de Conversão do Aplicativo (Jornada da Reserva)</h4>
              <p className="text-xs text-slate-500">Da busca no mapa até a confirmação e pagamento final</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {conversionFunnelData.map((step, idx) => (
                <div key={step.etapa} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
                  <span className="text-[11px] font-bold text-slate-500">{step.etapa}</span>
                  <div className="text-2xl font-black text-slate-900">{step.volume}%</div>
                  <p className="text-xs text-emerald-700 font-extrabold">{step.valor}</p>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${step.volume}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 5: CARROS MAIS USADOS & ANÁLISE DA FROTA */}
      {/* ============================================================== */}
      {adminTab === 'frota' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header & Strategic Insights */}
          <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-sky-500/30 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-400/30">
                <Car className="w-8 h-8" />
              </div>
              <div>
                <span className="bg-sky-500/30 text-sky-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold">
                  Telemetria Veicular & Perfil de Motoristas
                </span>
                <h3 className="text-2xl font-black text-white mt-1">Carros e Veículos Mais Usados no VagaGo</h3>
                <p className="text-xs text-slate-300">Inteligência sobre modelos, categorias, dimensões e porte para otimizar anúncios de garagens em Itabuna</p>
              </div>
            </div>

            {/* Key Fleet Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10 space-y-1">
                <strong className="text-xs text-sky-300 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
                  64% Sedans e Hatches
                </strong>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Garagens padrão (2,20m x 4,50m) atendem com facilidade 64% da demanda em Itabuna.
                </p>
              </div>

              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10 space-y-1">
                <strong className="text-xs text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  22% SUVs (Compass / Creta)
                </strong>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Alta procura por garagens com pé-direito livre de 2,00m nos bairros Góes Calmon e Jardim Vitória.
                </p>
              </div>

              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10 space-y-1">
                <strong className="text-xs text-amber-300 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  10% Motos no Centro
                </strong>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Oportunidade para anfitriões sublocarem cantos de vaga para motociclistas com tarifa horária de R$ 3,00.
                </p>
              </div>
            </div>
          </div>

          {/* Ranking Table of Most Used Models */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-lg">Ranking dos Modelos Mais Cadastrados</h4>
                <p className="text-xs text-slate-500">Dados consolidados de todos os veículos de motoristas ativos no aplicativo</p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                Total: 142 Veículos Mapeados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {topCarModelsRanking.map((item) => (
                <div
                  key={item.rank}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 hover:border-sky-300 hover:shadow-xs transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-sm text-slate-800 shadow-2xs">
                      #{item.rank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.icon}</span>
                        <strong className="text-sm text-slate-900 font-extrabold">{item.brand} {item.model}</strong>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-500 font-medium">{item.category}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                          {item.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900">{item.percentage}%</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.count} motoristas</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown Charts: Categories */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Distribuição por Categoria de Veículo</h4>
              <p className="text-xs text-slate-500">Divisão percentual entre Hatches, Sedans, SUVs e Motos</p>
            </div>

            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vehicleCategoriesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {vehicleCategoriesData.map((entry, index) => (
                      <Cell key={`cell-cat-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
              {vehicleCategoriesData.map(c => (
                <div key={c.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-700 font-medium">{c.name}</span>
                  </div>
                  <span className="font-black text-slate-900">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 6: GESTÃO & MODERAÇÃO DE MOTORISTAS */}
      {/* ============================================================== */}
      {adminTab === 'motoristas' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Controle de Motoristas (Locatários)</h3>
              <p className="text-xs text-slate-500">Aprovação de cadastros, suspensão temporária, banimentos e histórico completo</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar motorista, e-mail ou placa..."
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <select
                value={driverStatusFilter}
                onChange={(e) => setDriverStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">Todos os Status</option>
                <option value="Ativo">Ativos</option>
                <option value="Pendente">Pendentes</option>
                <option value="Suspenso">Suspensos</option>
                <option value="Banido">Banidos</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Motorista</th>
                  <th className="p-3">Veículo Cadastrado</th>
                  <th className="p-3">Contato</th>
                  <th className="p-3">Data Nasc.</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Créditos</th>
                  <th className="p-3 text-right">Ações de Moderação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      Nenhum motorista encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((u) => {
                    const isBanned = u.status === 'Banido';
                    const isSuspended = u.status === 'Suspenso';
                    const isPending = u.status === 'Pendente';
                    const isActive = u.status === 'Ativo' || !u.status;
                    const veh = u.vehicle || { brand: 'Toyota', model: 'Corolla', plate: 'BRA-2E19', color: 'Prata' };

                    return (
                      <tr key={u.id || u.email || Math.random()} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-3">
                          <img
                            src={u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80"}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900">{u.name || 'Motorista'}</div>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {u.id?.slice(0, 8) || 'USR'}</span>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>🚗 {veh.brand} {veh.model}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 font-bold">
                            Placa: <strong className="text-slate-700">{veh.plate}</strong> • {veh.color}
                          </div>
                        </td>
                        
                        <td className="p-3">
                          <div>{u.email}</div>
                          <div className="text-[11px] text-slate-400">{u.phone || '(73) 99123-4567'}</div>
                        </td>

                        <td className="p-3">
                          <span className="text-slate-600">{u.birthDate || '15/08/1994'}</span>
                          {u.isBirthdayToday && <span className="ml-1.5 text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-md font-black">🎂 HOJE!</span>}
                        </td>

                        <td className="p-3">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isSuspended
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {u.status || 'Ativo'}
                          </span>
                          {isSuspended && u.suspendedUntil && (
                            <div className="text-[10px] text-orange-700 mt-0.5">Até {u.suspendedUntil}</div>
                          )}
                        </td>

                        <td className="p-3 font-bold text-emerald-700">
                          R$ {Number(u.credits || 20).toFixed(2)}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            <button
                              type="button"
                              onClick={() => setSelectedUserForInspection(u)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                              title="Inspecionar dados e veículos do motorista"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {isPending && (
                              <button
                                type="button"
                                onClick={() => approveUserRegistration(u.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] px-2.5 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
                                title="Aprovar cadastro do motorista"
                              >
                                ✓ Aprovar
                              </button>
                            )}

                            {isActive && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setUserToSuspend(u)}
                                  className="bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-bold text-[11px] px-2 py-1.5 rounded-lg transition cursor-pointer"
                                  title="Suspender temporariamente"
                                >
                                  ⏸️ Suspender
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Deseja realmente banir o motorista ${u.name}?`)) {
                                      banUser(u.id, 'Violação grave identificada pelo administrador');
                                    }
                                  }}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] px-2 py-1.5 rounded-lg transition cursor-pointer"
                                  title="Banir motorista permanentemente"
                                >
                                  🚫 Banir
                                </button>
                              </>
                            )}

                            {(isSuspended || isBanned) && (
                              <button
                                type="button"
                                onClick={() => activateUser(u.id)}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-[11px] px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                                title="Reativar conta do motorista"
                              >
                                🟢 Reativar
                              </button>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 7: GESTÃO & MODERAÇÃO DE GARAGENS */}
      {/* ============================================================== */}
      {adminTab === 'vagas' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Moderação e Autorização de Garagens</h3>
              <p className="text-xs text-slate-500">Aprovação e fiscalização de garagens cadastradas em Itabuna - BA</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
              {safeSpaces.length} garagens no sistema
            </span>
          </div>

          <div className="space-y-3">
            {safeSpaces.map((spot) => (
              <div
                key={spot.id || Math.random()}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:border-purple-300"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={spot.facadePhoto || spot.photos?.[0] || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=300&q=80"}
                    alt={spot.title}
                    className="w-16 h-14 rounded-xl object-cover ring-1 ring-slate-300 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-slate-900 text-sm">{spot.title}</h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        spot.status === 'Aprovado' || spot.status === 'Ativa'
                          ? 'bg-emerald-100 text-emerald-800'
                          : spot.status === 'Pausada'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {spot.status || 'Aprovado'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">📍 {spot.neighborhood || 'Centro'}</span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {spot.address} • Anfitrião: <strong className="text-slate-800">{spot.ownerName || 'Anfitrião VagaGo'}</strong> (📞 {spot.ownerPhone || '(73) 99123-4567'})
                    </p>

                    <div className="text-[11px] text-emerald-700 font-bold mt-1">
                      Tarifa: R$ {Number(spot.priceHourly || 6).toFixed(2)}/h • Mensal: R$ {Number(spot.priceMonthly || 280).toFixed(2)}/mês
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleSpot(spot.id)}
                    className={`text-xs font-extrabold px-3.5 py-2 rounded-xl transition cursor-pointer ${
                      spot.status === 'Aprovado' || spot.status === 'Ativa'
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                    }`}
                  >
                    {spot.status === 'Aprovado' || spot.status === 'Ativa' ? '⏸️ Pausar Anúncio' : '✅ Autorizar Garagem'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Deseja excluir a garagem "${spot.title}" permanentemente?`)) {
                        deleteParkingSpace(spot.id);
                      }
                    }}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition cursor-pointer"
                    title="Excluir garagem"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 8: FINANCEIRO & SAQUES PIX */}
      {/* ============================================================== */}
      {adminTab === 'saques' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Aprovação de Saques PIX aos Proprietários</h3>
            <p className="text-xs text-slate-500">Validação e confirmação de transferências de repasses acumulados</p>
          </div>

          {safeWithdrawals.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
              Nenhuma solicitação de saque no momento.
            </div>
          ) : (
            <div className="space-y-3">
              {safeWithdrawals.map((w) => (
                <div key={w.id || Math.random()} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{w.ownerName}</h4>
                    <p className="text-xs text-slate-500">Chave PIX: <strong className="text-slate-800 font-mono">{w.pixKey}</strong> • Solicitado em: {w.requestedAt}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-emerald-600">R$ {Number(w.amount || 0).toFixed(2)}</span>
                    {w.status === 'Pendente' ? (
                      <button
                        type="button"
                        onClick={() => approveWithdrawal(w.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                      >
                        ✓ Aprovar Saque PIX
                      </button>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                        ✓ Pago
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 9: CUPONS DE DESCONTO & DAYS OFF */}
      {/* ============================================================== */}
      {adminTab === 'cupons' && (
        <div className="space-y-6">
          
          {/* Creator Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Criador de Campanhas Promocionais</h3>
                <p className="text-xs text-slate-500">Gere cupons para motoristas ou Days Off (isenção da taxa da plataforma)</p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCouponMode('coupon')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    couponMode === 'coupon' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  🎟️ Cupom de Desconto
                </button>
                <button
                  type="button"
                  onClick={() => setCouponMode('day_off')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    couponMode === 'day_off' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  🏖️ Day Off (Taxa Zero)
                </button>
              </div>
            </div>

            {couponMode === 'coupon' ? (
              <form onSubmit={handleCreateCouponSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Código do Cupom</label>
                  <input
                    type="text"
                    placeholder="Ex: CENTRO20"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black uppercase text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">% de Desconto</label>
                  <input
                    type="number"
                    placeholder="Ex: 20"
                    value={newCouponPercent}
                    onChange={(e) => setNewCouponPercent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Teto Máximo (R$)</label>
                  <input
                    type="number"
                    placeholder="Ex: 25"
                    value={newCouponMax}
                    onChange={(e) => setNewCouponMax(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-purple-800 hover:bg-purple-700 text-white text-xs font-extrabold py-2.5 px-4 rounded-xl shadow-md transition cursor-pointer"
                  >
                    + Criar Cupom
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateCouponSubmit} className="space-y-4">
                <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 space-y-1">
                  <strong>💡 O que é o Day Off da Plataforma?</strong>
                  <p className="text-[11px] leading-relaxed">
                    O <strong>Day Off</strong> concede <strong>100% de isenção da taxa da plataforma (comissão 0% VagaGo)</strong> para os proprietários em todas as garagens reservadas naquele dia específico. O locador recebe 100% do valor do aluguel.
                    <em> (Válido exclusivamente para reservas contratadas na data).</em>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Título da Campanha</label>
                    <input
                      type="text"
                      placeholder="Ex: Feriado de Itabuna - Taxa Zero"
                      value={newDayOffTitle}
                      onChange={(e) => setNewDayOffTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Data de Vigência</label>
                    <input
                      type="date"
                      value={newDayOffDate}
                      onChange={(e) => setNewDayOffDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-indigo-800 hover:bg-indigo-700 text-white text-xs font-extrabold py-2.5 px-4 rounded-xl shadow-md transition cursor-pointer"
                    >
                      + Ativar Day Off
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Active Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cupons de Desconto */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-extrabold text-slate-900 text-base">Cupons de Desconto Ativos</h4>
              <div className="space-y-3">
                {safeCoupons.map((c) => (
                  <div key={c.id || Math.random()} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-purple-700 bg-purple-100/60 px-2.5 py-0.5 rounded-md">
                          {c.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Desconto: <strong>{c.discountPercent}%</strong> • {c.usageCount || 0} utilizações
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCouponStatus(c.id)}
                        className="text-xs font-bold px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition cursor-pointer"
                      >
                        {c.status === 'Ativo' ? 'Pausar' : 'Ativar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCoupon(c.id)}
                        className="text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Days Off List */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-extrabold text-slate-900 text-base">Days Off (0% Taxa da Plataforma)</h4>
              <div className="space-y-3">
                {safeDaysOff.map((d) => (
                  <div key={d.id || Math.random()} className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{d.title}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          d.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {d.active ? '🟢 Ativo' : '⚪ Pausado'}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-900 mt-0.5">
                        📅 <strong>{d.date}</strong> • {d.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleDayOffStatus(d.id)}
                        className="text-xs font-bold px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg transition cursor-pointer"
                      >
                        {d.active ? 'Pausar' : 'Ativar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDayOff(d.id)}
                        className="text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* MODULE 10: CRM DE ANIVERSARIANTES (MOTORISTAS & ANFITRIÕES) */}
      {/* ============================================================== */}
      {adminTab === 'aniversariantes' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-rose-100 text-rose-800 text-xs font-black px-3 py-0.5 rounded-full uppercase">
                  CRM & Fidelização
                </span>
                <span className="text-xs text-slate-400 font-bold">Mês Atual: {currentMonth}/2026</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mt-1">Aniversariantes do Mês</h3>
              <p className="text-xs text-slate-500">Acompanhamento e listagem de contatos para campanhas personalizadas de relacionamento</p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-rose-600">{birthdayUsersMonth.length}</span>
              <div className="text-[11px] text-slate-400 font-medium">Aniversariantes este mês</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {birthdayUsersMonth.map((u) => (
              <div key={u.id || u.email || Math.random()} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80"}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-300"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 text-xs">{u.name || 'Cliente'}</strong>
                      {u.isBirthdayToday && (
                        <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-md animate-pulse">
                          🎂 HOJE!
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      📅 Nasc: <strong>{u.birthDate}</strong> • Perfil: <span className="font-bold text-slate-700">{u.role}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">📞 {u.phone || '(73) 99123-4567'} • {u.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(u.email, 'E-mail do aniversariante')}
                  className="p-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Copiar contato para envio manual de campanha"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: INSPEÇÃO COMPLETA DE DADOS DO MOTORISTA */}
      {/* ============================================================== */}
      {selectedUserForInspection && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUserForInspection.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80"}
                  alt={selectedUserForInspection.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-300"
                />
                <div>
                  <h3 className="font-black text-slate-900 text-base">{selectedUserForInspection.name}</h3>
                  <p className="text-xs text-slate-500">{selectedUserForInspection.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUserForInspection(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-bold text-[10px]">TELEFONE</span>
                <span className="font-bold text-slate-800">{selectedUserForInspection.phone || '(73) 99123-4567'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-bold text-[10px]">DATA DE NASCIMENTO</span>
                <span className="font-bold text-slate-800">{selectedUserForInspection.birthDate || '15/08/1994'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-bold text-[10px]">CPF / DOCUMENTO</span>
                <span className="font-bold text-slate-800">{selectedUserForInspection.cpf || '123.456.789-00'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-bold text-[10px]">SALDO EM CARTEIRA</span>
                <span className="font-bold text-emerald-700">R$ {Number(selectedUserForInspection.credits || 20).toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-slate-400 font-bold text-[10px] uppercase block">Veículo Autorizado Cadastrado</span>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>🚗 {selectedUserForInspection.vehicle?.brand || 'Toyota'} {selectedUserForInspection.vehicle?.model || 'Corolla'} ({selectedUserForInspection.vehicle?.color || 'Prata'})</span>
                <span className="font-mono bg-slate-200 px-2 py-0.5 rounded text-[11px]">{selectedUserForInspection.vehicle?.plate || 'BRA-2E19'}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUserForInspection(null)}
                className="w-full bg-slate-900 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer"
              >
                Fechar Inspeção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: SUSPENDER MOTORISTA */}
      {/* ============================================================== */}
      {userToSuspend && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-slate-900 text-base">Suspender Motorista</h3>
              <p className="text-xs text-slate-500">Defina o prazo de suspensão para {userToSuspend.name}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Prazo de Suspensão</label>
                <select
                  value={suspendDays}
                  onChange={(e) => setSuspendDays(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                >
                  <option value="7">7 dias (Advertência inicial)</option>
                  <option value="15">15 dias (Reincidência)</option>
                  <option value="30">30 dias (Infração grave)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Motivo Registrado</label>
                <input
                  type="text"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToSuspend(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  suspendUser(userToSuspend.id, Number(suspendDays), suspendReason);
                  setUserToSuspend(null);
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                Confirmar Suspensão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
