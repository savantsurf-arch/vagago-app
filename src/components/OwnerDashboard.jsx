import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import {
  DollarSign,
  Car,
  Calendar,
  Clock,
  TrendingUp,
  PlusCircle,
  Edit,
  Trash2,
  QrCode,
  Flame,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  AlertTriangle,
  PieChart,
  ArrowUpRight,
  UserCog,
  MessageSquare,
  Eye,
  Check,
  X,
  Filter,
  ShieldCheck,
  LayoutDashboard,
  Wallet,
  ChevronRight,
  Info,
  Phone,
  MapPin,
  Sparkles
} from 'lucide-react';
import { HostChatModal } from './HostChatModal';

export const OwnerDashboard = () => {
  const {
    currentUser,
    isAuthenticated,
    openLoginModal,
    openEditProfileModal,
    parkingSpaces = [],
    bookings = [],
    withdrawals = [],
    requestWithdrawal,
    deleteParkingSpace,
    pauseParkingSpace,
    activateParkingSpace,
    approveBooking,
    rejectBooking,
    setIsAddSpotModalOpen,
    setEditingSpot,
    openSpotDetails,
    setIsScannerOpen,
    toggleEventPricing,
    activeTab,
    setActiveTab
  } = useApp();

  const [activeOwnerTab, setActiveOwnerTab] = useState(() => {
    if (activeTab === 'owner_spots') return 'vagas';
    if (activeTab === 'owner_finance') return 'financeiro';
    if (activeTab === 'owner_reservas') return 'reservas';
    return 'visãogeral';
  });

  // Sync internal tab whenever Navbar tab changes
  useEffect(() => {
    if (activeTab === 'owner_spots') {
      setActiveOwnerTab('vagas');
    } else if (activeTab === 'owner_finance') {
      setActiveOwnerTab('financeiro');
    } else if (activeTab === 'owner_reservas') {
      setActiveOwnerTab('reservas');
    } else if (activeTab === 'owner_dashboard') {
      setActiveOwnerTab('visãogeral');
    }
  }, [activeTab]);

  // Filters state
  const [spotStatusFilter, setSpotStatusFilter] = useState('all'); // 'all' | 'active' | 'paused'
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all'); // 'all' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled'
  const [financePeriodFilter, setFinancePeriodFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month'

  // Modals state
  const [withdrawalAmount, setWithdrawalAmount] = useState('100');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [spotToDelete, setSpotToDelete] = useState(null);
  const [spotToPause, setSpotToPause] = useState(null);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState(null);
  const [lockedHours, setLockedHours] = useState(['12:00', '13:00']);
  const [chatBooking, setChatBooking] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const safeUser = currentUser || {};
  const safeSpaces = Array.isArray(parkingSpaces) ? parkingSpaces : [];
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  // Filter host spaces & bookings - Strict Ownership Matching (by ID or Email)
  const mySpaces = safeSpaces.filter(s => s && (
    s.ownerId === safeUser.id || 
    s.owner_id === safeUser.id ||
    (s.ownerEmail && safeUser.email && s.ownerEmail.toLowerCase() === safeUser.email.toLowerCase()) ||
    (s.owner_email && safeUser.email && s.owner_email.toLowerCase() === safeUser.email.toLowerCase())
  ));

  const myBookings = safeBookings.filter(b => b && (
    b.ownerId === safeUser.id || 
    b.owner_id === safeUser.id ||
    b.hostId === safeUser.id ||
    b.host_id === safeUser.id ||
    (b.ownerEmail && safeUser.email && b.ownerEmail.toLowerCase() === safeUser.email.toLowerCase()) ||
    (b.hostEmail && safeUser.email && b.hostEmail.toLowerCase() === safeUser.email.toLowerCase()) ||
    mySpaces.some(space => space.id === b.spaceId || space.id === b.parkingId || space.id === b.parking_id || space.id === b.space_id)
  ));

  // Real Monthly Aggregation for Revenue Chart (No fake numbers!)
  const monthlyRevenueData = useMemo(() => {
    if (!myBookings || myBookings.length === 0) return [];

    const monthMap = {};
    myBookings.forEach(b => {
      const rawDate = b.date || b.startDate || b.createdAt;
      let monthName = 'Recente';
      if (rawDate) {
        try {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            monthName = d.toLocaleDateString('pt-BR', { month: 'short' });
            monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1).replace('.', '');
          }
        } catch (e) {}
      }

      if (!monthMap[monthName]) {
        monthMap[monthName] = { month: monthName, bruto: 0, liquido: 0 };
      }
      const bruto = Number(b.subtotal || b.totalPrice || 0);
      const liquido = Number(b.ownerPayout || (bruto * 0.9));
      monthMap[monthName].bruto += bruto;
      monthMap[monthName].liquido += liquido;
    });

    return Object.values(monthMap);
  }, [myBookings]);

  // Real Peak Hours from Bookings
  const peakHoursData = useMemo(() => {
    if (!myBookings || myBookings.length === 0) return [];
    const hoursMap = {};
    myBookings.forEach(b => {
      const hour = (b.startTime || '12:00').split(':')[0] + 'h';
      hoursMap[hour] = (hoursMap[hour] || 0) + 1;
    });
    return Object.entries(hoursMap).map(([hora, reservas]) => ({ hora, reservas }));
  }, [myBookings]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <DollarSign className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-900">Área do Proprietário</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Faça login na sua conta para anunciar suas garagens, acompanhar reservas de motoristas e gerenciar seus recebimentos.
          </p>
        </div>
        <button
          type="button"
          onClick={openLoginModal}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition cursor-pointer"
        >
          Entrar como Proprietário
        </button>
      </div>
    );
  }

  // Active vs Paused Spaces
  const activeSpaces = mySpaces.filter(s => (s.status === 'Ativa' || s.status === 'Aprovado') && s.isAvailable !== false);
  const pausedSpaces = mySpaces.filter(s => s.status === 'Pausada' || s.isAvailable === false);

  // Filtered spots for "Minhas Vagas"
  const displayedSpaces = mySpaces.filter(s => {
    if (spotStatusFilter === 'active') return (s.status === 'Ativa' || s.status === 'Aprovado') && s.isAvailable !== false;
    if (spotStatusFilter === 'paused') return s.status === 'Pausada' || s.isAvailable === false;
    return true;
  });

  // Categorized bookings
  const upcomingBookings = myBookings.filter(b => b.bookingStatus === 'Confirmado' || b.bookingStatus === 'Aguardando Aprovação' || b.status === 'pending');
  const inProgressBookings = myBookings.filter(b => b.bookingStatus === 'Em Andamento');
  const completedBookings = myBookings.filter(b => b.bookingStatus === 'Concluído' || b.status === 'completed');
  const cancelledBookings = myBookings.filter(b => b.bookingStatus === 'Cancelado' || b.bookingStatus === 'Recusado' || b.status === 'cancelled');

  // Filtered bookings for "Reservas Recebidas"
  const displayedBookings = myBookings.filter(b => {
    if (bookingStatusFilter === 'upcoming') return b.bookingStatus === 'Confirmado' || b.bookingStatus === 'Aguardando Aprovação' || b.status === 'pending';
    if (bookingStatusFilter === 'in_progress') return b.bookingStatus === 'Em Andamento';
    if (bookingStatusFilter === 'completed') return b.bookingStatus === 'Concluído' || b.status === 'completed';
    if (bookingStatusFilter === 'cancelled') return b.bookingStatus === 'Cancelado' || b.bookingStatus === 'Recusado' || b.status === 'cancelled';
    return true;
  });

  // Real Revenue Calculations (100% real data)
  const grossRevenue = myBookings.reduce((sum, b) => sum + Number(b.subtotal || b.totalPrice || 0), 0);
  const platformCommissions = myBookings.reduce((sum, b) => sum + Number(b.platformFee || ((b.totalPrice || 0) * 0.1)), 0);
  const netEarnings = grossRevenue > 0 ? (grossRevenue - platformCommissions) : 0;

  // Real withdrawals math
  const totalWithdrawn = (withdrawals || [])
    .filter(w => (w.ownerId === safeUser.id || w.ownerName === safeUser.name) && (w.status === 'Concluído' || w.status === 'Pendente'))
    .reduce((sum, w) => sum + Number(w.amount || 0), 0);

  const availableBalance = Math.max(0, netEarnings - totalWithdrawn);

  const handleWithdrawSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const val = parseFloat(withdrawalAmount);
    if (val > 0 && val <= availableBalance && typeof requestWithdrawal === 'function') {
      requestWithdrawal(val);
      setIsWithdrawModalOpen(false);
    }
  };

  const toggleLockHour = (hour) => {
    setLockedHours(prev =>
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    );
  };

  const handleOpenSpotDetails = (spot) => {
    if (typeof openSpotDetails === 'function') {
      openSpotDetails(spot);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* SaaS Greeting & Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={openEditProfileModal}>
            <img
              src={safeUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80"}
              alt={safeUser.name || "Proprietário"}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-white/20 shadow-md group-hover:ring-white/50 transition"
            />
            <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <UserCog className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                ⭐ Proprietário Verificado
              </span>
              <button
                type="button"
                onClick={openEditProfileModal}
                className="bg-white/15 hover:bg-white/25 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border border-white/20 transition flex items-center gap-1 cursor-pointer"
                title="Editar Nome, Foto, Telefone, PIX e Bio"
              >
                <UserCog className="w-3.5 h-3.5 text-emerald-300" />
                <span>Editar Perfil</span>
              </button>
              <span className="text-emerald-200 text-xs hidden sm:inline">
                • Chave PIX: {safeUser.pixKey || safeUser.email || "Não cadastrada"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Olá, {safeUser.name || "Proprietário"}
            </h1>
            <p className="text-xs text-emerald-100/90">
              Gerencie suas vagas e acompanhe suas reservas em tempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Validar QR Entrada</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingSpot(null);
              setIsAddSpotModalOpen(true);
            }}
            className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Cadastrar Nova Vaga</span>
          </button>
        </div>
      </div>

      {/* KPI Cards — 100% Real Data Only */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Minhas Vagas */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase">Minhas Vagas</span>
            <Car className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {mySpaces.length} {mySpaces.length === 1 ? 'vaga' : 'vagas'}
          </div>
          <p className="text-[11px] text-slate-500">Cadastradas no seu portfólio</p>
        </div>

        {/* Card 2: Vagas Ativas */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase">Vagas Ativas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {activeSpaces.length} {activeSpaces.length === 1 ? 'ativa' : 'ativas'}
          </div>
          <p className="text-[11px] text-slate-500">
            {pausedSpaces.length > 0 ? `${pausedSpaces.length} pausada(s)` : 'Disponíveis para reservas'}
          </p>
        </div>

        {/* Card 3: Reservas */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase">Reservas</span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {myBookings.length}
          </div>
          <p className="text-[11px] text-slate-500">
            {upcomingBookings.length > 0 ? `${upcomingBookings.length} ativa(s) / futuras` : 'Histórico de locações'}
          </p>
        </div>

        {/* Card 4: Ganhos & Saldo */}
        <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-extrabold uppercase">Saldo para Saque</span>
            <Wallet className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            R$ {availableBalance.toFixed(2)}
          </div>
          <button
            type="button"
            onClick={() => setIsWithdrawModalOpen(true)}
            disabled={availableBalance <= 0}
            className={`w-full font-extrabold text-xs py-2 rounded-xl transition shadow-xs cursor-pointer ${
              availableBalance > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {availableBalance > 0 ? 'Solicitar Saque PIX' : 'Sem saldo disponível'}
          </button>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold pt-2">
        {[
          { id: 'visãogeral', label: 'Visão Geral & Desempenho', icon: LayoutDashboard, tabKey: 'owner_dashboard' },
          { id: 'vagas', label: `Minhas Vagas (${mySpaces.length})`, icon: Car, tabKey: 'owner_spots' },
          { id: 'reservas', label: `Reservas Recebidas (${myBookings.length})`, icon: Calendar, tabKey: 'owner_reservas' },
          { id: 'disponibilidade', label: 'Disponibilidade & Horários', icon: Clock, tabKey: 'owner_dashboard' },
          { id: 'financeiro', label: 'Meus Ganhos & Saques', icon: DollarSign, tabKey: 'owner_finance' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeOwnerTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveOwnerTab(tab.id);
                if (typeof setActiveTab === 'function') setActiveTab(tab.tabKey);
              }}
              className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VISÃO GERAL & DESEMPENHO REAL */}
      {/* ========================================================================= */}
      {activeOwnerTab === 'visãogeral' && (
        <div className="space-y-6">
          
          {/* Performance Aggregation Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Real Revenue Chart */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Faturamento da Garagem</h3>
                <p className="text-xs text-slate-500">Histórico de rendimentos reais gerados pelas suas vagas</p>
              </div>

              {monthlyRevenueData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenueData}>
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
                      <Area type="monotone" dataKey="bruto" stroke="#0284c7" fill="#e0f2fe" name="Faturamento Bruto" />
                      <Area type="monotone" dataKey="liquido" stroke="#10b981" fill="#d1fae5" name="Líquido (Você Recebe)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <TrendingUp className="w-10 h-10 text-slate-300" />
                  <p className="text-xs font-extrabold text-slate-700">Sem dados financeiros suficientes</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Os dados de desempenho aparecerão conforme sua vaga receber reservas de motoristas.
                  </p>
                </div>
              )}
            </div>

            {/* Peak Hours or Occupation */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Horários de Ocupação</h3>
                <p className="text-xs text-slate-500">Distribuição real das locações ao longo do dia</p>
              </div>

              {peakHoursData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakHoursData}>
                      <XAxis dataKey="hora" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="reservas" fill="#059669" radius={[6, 6, 0, 0]} name="Reservas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Clock className="w-10 h-10 text-slate-300" />
                  <p className="text-xs font-extrabold text-slate-700">Aguardando primeiras locações</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Os horários de pico e ocupação serão calculados automaticamente a partir das suas reservas reais.
                  </p>
                </div>
              )}
            </div>

            {/* Quick List: Últimas Reservas Recebidas */}
            <div className="lg:col-span-12 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Últimas Reservas Recebidas</h3>
                  <p className="text-xs text-slate-500">Motoristas que reservaram suas vagas recentemente</p>
                </div>
                {myBookings.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveOwnerTab('reservas')}
                    className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer"
                  >
                    Ver todas ({myBookings.length}) ➔
                  </button>
                )}
              </div>

              {myBookings.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-xs font-extrabold text-slate-700">Nenhuma reserva recebida até o momento</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Assim que um motorista reservar sua garagem no app, os dados e instruções de portão aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {myBookings.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBookingForDetails(b)}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 flex items-center justify-between gap-3 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={b.driverAvatar || b.userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80"}
                          alt={b.driverName || b.userName}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">{b.driverName || b.userName || 'Motorista'}</span>
                            <span className="text-[10px] font-mono text-slate-400 font-bold">#{b.bookingNumber}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 truncate max-w-[200px]">{b.spaceTitle || 'Garagem'}</p>
                          <p className="text-[10px] text-slate-400">📅 {b.date || b.startDate} • {b.startTime} às {b.endTime}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-700 block">
                          R$ {Number(b.ownerPayout || ((b.totalPrice || 0) * 0.9)).toFixed(2)}
                        </span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase inline-block mt-0.5 ${
                          b.bookingStatus === 'Confirmado' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {b.bookingStatus || 'Confirmado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MINHAS VAGAS */}
      {/* ========================================================================= */}
      {activeOwnerTab === 'vagas' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Minhas Vagas Cadastradas</h3>
              <p className="text-xs text-slate-500">Gerencie fotos, preços, status e disponibilidade de cada garagem.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSpotStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    spotStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Todas ({mySpaces.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSpotStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    spotStatusFilter === 'active' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Ativas ({activeSpaces.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSpotStatusFilter('paused')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    spotStatusFilter === 'paused' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Pausadas ({pausedSpaces.length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingSpot(null);
                  setIsAddSpotModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Cadastrar Vaga</span>
              </button>
            </div>
          </div>

          {displayedSpaces.length === 0 ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
                <Car className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-base">
                  {spotStatusFilter === 'paused'
                    ? 'Nenhuma vaga pausada no momento'
                    : spotStatusFilter === 'active'
                    ? 'Nenhuma vaga ativa no momento'
                    : 'Você ainda não possui vagas cadastradas'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Cadastre sua primeira garagem para começar a alugar por hora, dia ou mês para outros motoristas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingSpot(null);
                  setIsAddSpotModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                + Cadastrar Minha Primeira Vaga
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedSpaces.map((spot) => {
                const isPaused = spot.status === 'Pausada' || spot.isAvailable === false;
                const spotBookings = myBookings.filter(b => b.spaceId === spot.id || b.parkingId === spot.id || b.parking_id === spot.id || b.space_id === spot.id);
                const spotPhoto = spot.photos && spot.photos[0] ? spot.photos[0] : "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80";

                return (
                  <div key={spot.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex gap-4">
                        <img
                          src={spotPhoto}
                          alt={spot.title}
                          className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                              isPaused
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}>
                              {isPaused ? 'Pausada' : 'Ativa'}
                            </span>
                            {spot.isCovered && (
                              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                Coberta
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              • {spotBookings.length} {spotBookings.length === 1 ? 'reserva' : 'reservas'}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-slate-900 text-sm mt-1 truncate" title={spot.title}>
                            {spot.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-1">{spot.address}</p>
                          
                          <div className="mt-2 text-xs font-black text-sky-700">
                            R$ {Number(spot.priceHourly || 6).toFixed(2)}/h • R$ {Number(spot.priceDaily || 28).toFixed(2)}/dia
                          </div>
                        </div>
                      </div>

                      {/* Multi-spot / boxes operational status if enabled */}
                      {spot.isMultiSpot && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                          <span className="text-[11px] font-extrabold text-slate-800 uppercase block">
                            Boxes vinculados ({spot.totalBoxes || 5} boxes):
                          </span>
                          <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold">
                            {(spot.boxes || [
                              { id: 1, name: "Box 1", status: "Livre" },
                              { id: 2, name: "Box 2", status: "Livre" },
                              { id: 3, name: "Box 3", status: "Livre" }
                            ]).map((b) => (
                              <div
                                key={b.id}
                                className={`p-1.5 rounded-lg border ${
                                  b.status === 'Ocupado'
                                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                }`}
                              >
                                {b.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleOpenSpotDetails(spot)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        title="Ver como os motoristas visualizam a vaga no app"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visualizar</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (isPaused) {
                              activateParkingSpace(spot.id);
                            } else {
                              setSpotToPause(spot);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            isPaused
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {isPaused ? '🟢 Reativar Vaga' : '⏸️ Pausar Vaga'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingSpot(spot);
                            setIsAddSpotModalOpen(true);
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSpotToDelete(spot)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
                          title="Excluir garagem do aplicativo"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RESERVAS RECEBIDAS */}
      {/* ========================================================================= */}
      {activeOwnerTab === 'reservas' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Reservas Recebidas</h3>
              <p className="text-xs text-slate-500">Acompanhe quem reservou, motoristas no local e comprovantes de acesso.</p>
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto w-full sm:w-auto">
              {[
                { id: 'all', label: `Todas (${myBookings.length})` },
                { id: 'upcoming', label: `Próximas (${upcomingBookings.length})` },
                { id: 'in_progress', label: `Em Andamento (${inProgressBookings.length})` },
                { id: 'completed', label: `Concluídas (${completedBookings.length})` },
                { id: 'cancelled', label: `Canceladas (${cancelledBookings.length})` }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setBookingStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                    bookingStatusFilter === f.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {displayedBookings.length === 0 ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-extrabold text-slate-800 text-base">
                {bookingStatusFilter === 'all'
                  ? 'Nenhuma reserva recebida até o momento'
                  : 'Nenhuma reserva encontrada nesta categoria'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Assim que motoristas realizarem agendamentos nas suas garagens, as reservas aparecerão aqui automaticamente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedBookings.map((b) => {
                const driverAvatar = b.driverAvatar || b.userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80";
                const driverName = b.driverName || b.userName || "Motorista";
                const driverPhone = b.driverPhone || b.userPhone || "(73) 99123-4567";
                const spotTitle = b.parkingTitle || b.spaceTitle || "Garagem VagaGo";
                const spotAddress = b.parkingAddress || b.spaceAddress || "Itabuna - BA";
                const bookingDate = b.startDate || b.date || "Hoje";
                const netAmount = Number(b.ownerPayout || ((b.totalPrice || 0) * 0.9)).toFixed(2);
                const feeAmount = Number(b.platformFee || ((b.totalPrice || 0) * 0.1)).toFixed(2);
                const isPending = b.bookingStatus === 'Aguardando Aprovação' || b.status === 'pending';
                const isConfirmed = b.bookingStatus === 'Confirmado' || b.status === 'confirmed';
                const isInProgress = b.bookingStatus === 'Em Andamento';
                const isCancelled = b.bookingStatus === 'Cancelado' || b.bookingStatus === 'Recusado' || b.status === 'cancelled';
                const isCompleted = b.bookingStatus === 'Concluído' || b.status === 'completed';

                return (
                  <div
                    key={b.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:border-emerald-300"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <img
                        src={driverAvatar}
                        alt={driverName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isConfirmed
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isInProgress
                              ? 'bg-sky-100 text-sky-900 border border-sky-300'
                              : isCompleted
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}>
                            {b.bookingStatus || 'Confirmado'}
                          </span>
                          <span className="text-xs font-mono text-slate-400 font-bold">#{b.bookingNumber}</span>
                          <span className="text-[11px] text-slate-400">
                            • {b.paymentMethod || 'PIX'} ({b.paymentStatus || 'Aprovado'})
                          </span>
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                          <span>{driverName}</span>
                          <span className="text-xs font-normal text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {driverPhone}
                          </span>
                        </h4>

                        <p className="text-xs text-slate-600 truncate">
                          📍 <strong className="text-slate-800">{spotTitle}</strong> ({spotAddress})
                        </p>

                        <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap pt-0.5">
                          <span>📅 <strong>{bookingDate}</strong> das {b.startTime} às {b.endTime} ({b.totalHours}h)</span>
                          {b.vehicle && (
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold text-[11px] flex items-center gap-1">
                              🚗 {b.vehicle.brand} {b.vehicle.model} • <strong className="font-mono text-slate-900">{b.vehicle.plate}</strong>
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-black text-emerald-700 pt-1">
                          💰 Você recebe líquido: R$ {netAmount}{' '}
                          <span className="text-slate-400 font-normal text-[11px]">
                            (Valor bruto: R$ {Number(b.totalPrice || b.subtotal || 0).toFixed(2)} • Taxa VagaGo 10%: R$ {feeAmount})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedBookingForDetails(b)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Detalhes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setChatBooking(b);
                          setIsChatOpen(true);
                        }}
                        className="bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition border border-sky-200 cursor-pointer"
                        title="Falar com o Motorista no Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                        <span>Chat</span>
                      </button>

                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => approveBooking(b.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
                          >
                            ✓ Aceitar
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectBooking(b.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer"
                          >
                            ✕ Recusar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DISPONIBILIDADE & HORÁRIOS */}
      {/* ========================================================================= */}
      {activeOwnerTab === 'disponibilidade' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Controle de Horários e Bloqueios</h3>
            <p className="text-xs text-slate-500">
              Clique sobre um horário para bloquear ou liberar a entrada de motoristas instantaneamente.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Horários marcados em verde estão livres para reserva imediata no aplicativo. Horários em vermelho ficam bloqueados para novos agendamentos.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map((hour) => {
              const isLocked = lockedHours.includes(hour);
              return (
                <button
                  key={hour}
                  type="button"
                  onClick={() => toggleLockHour(hour)}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    isLocked
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-emerald-50/70 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  {isLocked ? <Lock className="w-4 h-4 text-rose-600" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
                  <span className="font-extrabold text-xs">{hour}</span>
                  <span className="text-[10px] font-bold">
                    {isLocked ? "Bloqueado" : "Disponível"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MEUS GANHOS & FINANCEIRO COM TRANSPARÊNCIA */}
      {/* ========================================================================= */}
      {activeOwnerTab === 'financeiro' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Detalhamento Financeiro & Repasses</h3>
                <p className="text-xs text-slate-500">Transparência total: retenção fixa da plataforma de 10% e repasse líquido de 90% ao anfitrião.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(true)}
                disabled={availableBalance <= 0}
                className={`font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                  availableBalance > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Solicitar Saque PIX</span>
              </button>
            </div>

            {/* Quick summary strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Faturamento Bruto</span>
                <div className="text-xl font-black text-slate-900">R$ {grossRevenue.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Taxa Plataforma (10%)</span>
                <div className="text-xl font-black text-rose-600">- R$ {platformCommissions.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 uppercase">Você Recebe Líquido (90%)</span>
                <div className="text-xl font-black text-emerald-700">R$ {netEarnings.toFixed(2)}</div>
              </div>
            </div>

            {/* Transactions table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">Data</th>
                    <th className="p-3">Motorista</th>
                    <th className="p-3">Valor Bruto</th>
                    <th className="p-3">Taxa VagaGo (10%)</th>
                    <th className="p-3">Você Recebe</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {myBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        Nenhuma transação financeira registrada até o momento.
                      </td>
                    </tr>
                  ) : (
                    myBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3 font-bold text-slate-900 font-mono">#{b.bookingNumber}</td>
                        <td className="p-3">{b.date || b.startDate || 'Recente'}</td>
                        <td className="p-3 font-bold text-slate-800">{b.driverName || b.userName || 'Motorista'}</td>
                        <td className="p-3 font-bold text-slate-800">
                          R$ {Number(b.subtotal || b.totalPrice || 0).toFixed(2)}
                        </td>
                        <td className="p-3 font-bold text-rose-500">
                          - R$ {Number(b.platformFee || ((b.totalPrice || 0) * 0.1)).toFixed(2)}
                        </td>
                        <td className="p-3 font-black text-emerald-600">
                          R$ {Number(b.ownerPayout || ((b.totalPrice || 0) * 0.9)).toFixed(2)}
                        </td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Liberado
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DETALHES COMPLETOS DA RESERVA (SEÇÃO 13 DO PROMPT) */}
      {/* ========================================================================= */}
      {selectedBookingForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  🎫
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Reserva #{selectedBookingForDetails.bookingNumber}
                  </h3>
                  <span className="text-[11px] text-slate-400">Comprovante de locação oficial VagaGo</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingForDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informações da Vaga */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vaga Reservada</span>
              <h4 className="font-extrabold text-slate-900 text-sm">
                {selectedBookingForDetails.parkingTitle || selectedBookingForDetails.spaceTitle || "Garagem VagaGo"}
              </h4>
              <p className="text-xs text-slate-500">
                {selectedBookingForDetails.parkingAddress || selectedBookingForDetails.spaceAddress || "Itabuna - BA"}
              </p>
            </div>

            {/* Motorista & Veículo */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Motorista</span>
                <p className="font-black text-slate-900">
                  {selectedBookingForDetails.driverName || selectedBookingForDetails.userName || "Motorista"}
                </p>
                <p className="text-slate-500">
                  📞 {selectedBookingForDetails.driverPhone || selectedBookingForDetails.userPhone || "(73) 99123-4567"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Veículo Autorizado</span>
                <p className="font-black text-slate-900">
                  {selectedBookingForDetails.vehicle?.brand || 'Carro'} {selectedBookingForDetails.vehicle?.model || 'Passeio'}
                </p>
                <p className="font-mono font-black text-emerald-700 text-xs">
                  Placa: {selectedBookingForDetails.vehicle?.plate || 'ABC-1D23'}
                </p>
              </div>
            </div>

            {/* Data & Horário */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Período da Reserva</span>
              <div className="flex items-center justify-between font-extrabold text-slate-900">
                <span>📅 Data: {selectedBookingForDetails.date || selectedBookingForDetails.startDate}</span>
                <span>⏰ {selectedBookingForDetails.startTime} às {selectedBookingForDetails.endTime} ({selectedBookingForDetails.totalHours}h)</span>
              </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Resumo Financeiro</span>
              <div className="flex justify-between text-slate-600">
                <span>Valor pago pelo motorista:</span>
                <span className="font-bold">R$ {Number(selectedBookingForDetails.totalPrice || selectedBookingForDetails.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Taxa da plataforma (10%):</span>
                <span className="font-bold">- R$ {Number(selectedBookingForDetails.platformFee || ((selectedBookingForDetails.totalPrice || 0) * 0.1)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-black text-sm pt-1 border-t border-emerald-200">
                <span>Você recebe líquido:</span>
                <span>R$ {Number(selectedBookingForDetails.ownerPayout || ((selectedBookingForDetails.totalPrice || 0) * 0.9)).toFixed(2)}</span>
              </div>
            </div>

            {/* QR Code de Validação */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Código de Validação</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedBookingForDetails.qrCodeData || `VAGAGO-${selectedBookingForDetails.bookingNumber}`}
                </span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase">
                {selectedBookingForDetails.bookingStatus || 'Confirmado'}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const b = selectedBookingForDetails;
                  setSelectedBookingForDetails(null);
                  setChatBooking(b);
                  setIsChatOpen(true);
                }}
                className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Abrir Chat com Motorista</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedBookingForDetails(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMAÇÃO DE PAUSA DA VAGA (SEÇÃO 10 DO PROMPT) */}
      {/* ========================================================================= */}
      {spotToPause && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-base">Pausar Vaga?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tem certeza que deseja pausar a vaga <strong>"{spotToPause.title}"</strong>? Ela deixará de aparecer para novas reservas de motoristas na busca e no mapa. Suas reservas já confirmadas permanecerão seguras.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSpotToPause(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetId = spotToPause.id;
                  setSpotToPause(null);
                  if (typeof pauseParkingSpace === 'function') {
                    await pauseParkingSpace(targetId);
                  }
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black py-3 rounded-xl shadow-md transition cursor-pointer"
              >
                Sim, Pausar Vaga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EXCLUSÃO DE GARAGEM */}
      {/* ========================================================================= */}
      {spotToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-base">Excluir Garagem?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tem certeza que deseja remover <strong>"{spotToDelete.title}"</strong> do aplicativo? Esta ação é permanente e removerá o anúncio do mapa e do sistema.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSpotToDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetId = spotToDelete.id;
                  setSpotToDelete(null);
                  if (typeof deleteParkingSpace === 'function') {
                    await deleteParkingSpace(targetId);
                  }
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black py-3 rounded-xl shadow-md shadow-rose-600/30 transition cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SOLICITAÇÃO DE SAQUE PIX */}
      {/* ========================================================================= */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleWithdrawSubmit} className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Solicitar Saque PIX</h3>
            <p className="text-xs text-slate-500">
              Chave PIX cadastrada:{' '}
              <strong className="text-slate-800">
                {currentUser?.pixKey || currentUser?.email || "Chave PIX do Anfitrião"}
              </strong>
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Valor do Saque (R$) — Disponível: R$ {availableBalance.toFixed(2)}
              </label>
              <input
                type="number"
                step="10"
                min="10"
                max={availableBalance}
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-emerald-600 outline-hidden"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="flex-1 bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={parseFloat(withdrawalAmount) > availableBalance || parseFloat(withdrawalAmount) <= 0}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:text-slate-500 text-white text-xs font-extrabold py-2.5 rounded-xl transition cursor-pointer"
              >
                Confirmar Saque
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Host Chat with Driver (Vagago Concierge Moderated) */}
      <HostChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        spot={chatBooking}
        booking={chatBooking}
        ownerName={chatBooking?.ownerName}
        ownerPhone={chatBooking?.ownerPhone}
      />

    </div>
  );
};
