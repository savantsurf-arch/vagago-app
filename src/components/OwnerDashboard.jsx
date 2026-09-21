import React, { useState, useEffect } from 'react';
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
  MessageSquare
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
    setIsScannerOpen,
    toggleEventPricing,
    demandRegions,
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


  const [withdrawalAmount, setWithdrawalAmount] = useState('250');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [spotToDelete, setSpotToDelete] = useState(null);
  const [lockedHours, setLockedHours] = useState(['12:00', '13:00']);
  const [chatBooking, setChatBooking] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);



  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <DollarSign className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-900">Painel do Anfitrião</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Faça login na sua conta de proprietário para cadastrar garagens, acompanhar reservas, controlar faturamento e solicitar saques PIX.
          </p>
        </div>
        <button
          type="button"
          onClick={openLoginModal}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition cursor-pointer"
        >
          Entrar como Anfitrião
        </button>
      </div>
    );
  }

  const safeUser = currentUser || {};

  const safeSpaces = Array.isArray(parkingSpaces) ? parkingSpaces : [];
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  // Filter host spaces & bookings - Robust Cross-Field Matching (by ID, Email, UUID or Spot reference)
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


  // Real Revenue math
  const grossRevenue = myBookings.reduce((sum, b) => sum + Number(b.subtotal || b.totalPrice || 0), 0);
  const platformCommissions = myBookings.reduce((sum, b) => sum + Number(b.platformFee || 0), 0);
  const netEarnings = grossRevenue - platformCommissions;

  // Real withdrawals math
  const totalWithdrawn = (withdrawals || [])
    .filter(w => (w.ownerId === safeUser.id || w.ownerName === safeUser.name) && (w.status === 'Concluído' || w.status === 'Pendente'))
    .reduce((sum, w) => sum + Number(w.amount || 0), 0);

  const availableBalance = Math.max(0, netEarnings - totalWithdrawn);


  // Analytics Chart Data
  const monthlyRevenueData = [
    { month: 'Mar', bruto: 420, liquido: 378 },
    { month: 'Abr', bruto: 580, liquido: 522 },
    { month: 'Mai', bruto: 710, liquido: 639 },
    { month: 'Jun', bruto: 850, liquido: 765 },
    { month: 'Jul', bruto: 940, liquido: 846 },
    { month: 'Ago', bruto: grossRevenue + 800, liquido: netEarnings + 720 }
  ];

  const peakHoursData = [
    { hora: '07h', reservas: 4 },
    { hora: '09h', reservas: 12 },
    { hora: '12h', reservas: 18 },
    { hora: '14h', reservas: 22 },
    { hora: '17h', reservas: 19 },
    { hora: '20h', reservas: 8 }
  ];

  const handleWithdrawSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const val = parseFloat(withdrawalAmount);
    if (val > 0 && typeof requestWithdrawal === 'function') {
      requestWithdrawal(val);
      setIsWithdrawModalOpen(false);
    }
  };

  const toggleLockHour = (hour) => {
    setLockedHours(prev =>
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={openEditProfileModal}>
            <img
              src={safeUser.avatar}
              alt={safeUser.name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-white/20 shadow-md group-hover:ring-white/50 transition"
            />
            <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <UserCog className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                ⭐ SuperHost Verificado
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
              <span className="text-emerald-200 text-xs hidden sm:inline">• PIX: {safeUser.pixKey || safeUser.email || "pix@vagago.com.br"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">{safeUser.name || "Meu Painel de Anfitrião"}</h1>
            <p className="text-xs text-emerald-100/80">Sua vaga gerando renda passiva 24h por dia em Itabuna - BA</p>
            {safeUser.bio && (
              <p className="text-xs text-emerald-100/90 mt-1 italic max-w-md line-clamp-2">"{safeUser.bio}"</p>
            )}
          </div>
        </div>


        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Validar QR Code Entrada</span>
          </button>

          <button
            onClick={() => {
              setEditingSpot(null);
              setIsAddSpotModalOpen(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Nova Vaga</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Faturamento Líquido</span>
          <div className="text-2xl font-black text-emerald-600">R$ {netEarnings.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">Comissão VagaGo 10% já descontada</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Reservas Recebidas</span>
          <div className="text-2xl font-black text-slate-900">{myBookings.length}</div>
          <div className="text-[11px] text-slate-500">Taxa de ocupação: <strong className="text-slate-800">84%</strong></div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Vagas Ativas</span>
          <div className="text-2xl font-black text-sky-600">{mySpaces.length} garagens</div>
          <div className="text-[11px] text-slate-500">Disponíveis no app</div>
        </div>

        <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-emerald-800 uppercase block">Saldo Disponível Saque</span>
          <div className="text-2xl font-black text-emerald-700">R$ {availableBalance.toFixed(2)}</div>
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-1.5 rounded-lg transition shadow-xs"
          >
            Solicitar Saque PIX
          </button>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold pt-2">

        {[
          { id: 'visãogeral', label: 'Visão Geral & Gráficos', tabKey: 'owner_dashboard' },
          { id: 'vagas', label: `Minhas Garagens (${mySpaces.length})`, tabKey: 'owner_spots' },
          { id: 'reservas', label: `Solicitações & Reservas (${myBookings.length})`, tabKey: 'owner_dashboard' },
          { id: 'calendario', label: 'Calendário & Bloqueios', tabKey: 'owner_dashboard' },
          { id: 'mensalistas', label: 'Mensalistas (Assinaturas)', tabKey: 'owner_dashboard' },
          { id: 'financeiro', label: 'Financeiro & Comissões (10%)', tabKey: 'owner_finance' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveOwnerTab(tab.id);
              if (typeof setActiveTab === 'function') setActiveTab(tab.tabKey);
            }}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 cursor-pointer ${
              activeOwnerTab === tab.id
                ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}

      </div>


      {/* TAB 1: VISÃO GERAL & GRÁFICOS */}
      {activeOwnerTab === 'visãogeral' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Monthly Earnings Chart (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Faturamento Mensal (Bruto x Líquido)</h3>
              <p className="text-xs text-slate-500">Evolução dos rendimentos da sua garagem</p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueData}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
                  <Area type="monotone" dataKey="bruto" stroke="#0284c7" fill="#e0f2fe" name="Faturamento Bruto" />
                  <Area type="monotone" dataKey="liquido" stroke="#10b981" fill="#d1fae5" name="Líquido (Anfitrião)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peak Hours Chart (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Horários de Maior Ocupação</h3>
              <p className="text-xs text-slate-500">Picos de reservas durante o dia</p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursData}>
                  <XAxis dataKey="hora" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="reservas" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick List: Últimas Reservas Recebidas no Overview */}
          <div className="lg:col-span-12 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Últimas Reservas Recebidas</h3>
                <p className="text-xs text-slate-500">Motoristas que reservaram suas vagas recentemente</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveOwnerTab('reservas')}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer"
              >
                Ver todas ({myBookings.length}) ➔
              </button>
            </div>

            {myBookings.length === 0 ? (
              <div className="text-center py-6 text-slate-400 space-y-1">
                <Calendar className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">Nenhuma reserva recebida até o momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myBookings.slice(0, 4).map((b) => (
                  <div key={b.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.driverAvatar || b.userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80"}
                        alt={b.driverName || b.userName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">{b.driverName || b.userName || 'Motorista'}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">#{b.bookingNumber}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{b.spaceTitle || 'Garagem'}</p>
                        <p className="text-[10px] text-slate-400">📅 {b.date || b.startDate} • {b.startTime} às {b.endTime}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-700 block">R$ {Number(b.ownerPayout || (b.totalPrice * 0.9)).toFixed(2)}</span>
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
      )}


      {/* TAB 2: MINHAS GARAGENS */}
      {activeOwnerTab === 'vagas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">Garagens Cadastradas e Gestão por Lote</h3>
          </div>

          {mySpaces.length === 0 ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
                <Car className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-base">Você ainda não possui garagens cadastradas</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Cadastre sua primeira garagem e comece a faturar alugando o espaço para outros motoristas.
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
                + Cadastrar Minha Garagem
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySpaces.map((spot) => (
                <div key={spot.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex gap-4">
                    <img src={spot.photos[0]} alt="" className="w-24 h-24 rounded-xl object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                          {spot.status}
                        </span>
                        {spot.isMultiSpot && (
                          <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            🏢 Lote de {spot.totalBoxes || 5} Boxes
                          </span>
                        )}
                        {spot.isEventPricingActive && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                            ⚡ Eventos (+30%)
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm mt-1">{spot.title}</h4>
                      <p className="text-xs text-slate-500">{spot.address}</p>
                      
                      <div className="mt-2 text-xs font-black text-sky-600">
                        R$ {spot.priceHourly.toFixed(2)}/h • R$ {spot.priceDaily.toFixed(2)}/dia
                      </div>
                    </div>
                  </div>

                  {/* Host Pack 2: Multi-Spot Boxes Operations Grid */}
                  {spot.isMultiSpot && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[11px] font-extrabold text-slate-800 uppercase block">
                        Gestão dos Boxes no Terreno / Prédio:
                      </span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {(spot.boxes || [
                          { id: 1, name: "Box 01", status: "Ocupado" },
                          { id: 2, name: "Box 02", status: "Livre" },
                          { id: 3, name: "Box 03", status: "Livre" },
                          { id: 4, name: "Box 04", status: "Livre" },
                          { id: 5, name: "Box 05", status: "Livre" }
                        ]).map((b) => (
                          <div
                            key={b.id}
                            className={`p-2 rounded-lg text-center border text-[10px] font-bold ${
                              b.status === 'Ocupado'
                                ? 'bg-rose-50 border-rose-300 text-rose-800'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            }`}
                          >
                            <span className="block font-black">{b.name}</span>
                            <span className="text-[9px] uppercase">{b.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Host Pack 2: Event Dynamic Surge Button & Edit Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleEventPricing && toggleEventPricing(spot.id)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1 cursor-pointer ${
                        spot.isEventPricingActive
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                      }`}
                      title="Aumentar preço automaticamente em +30% para dias de shows ou jogos de futebol"
                    >
                      <span>⚡ Tarifa Dinâmica de Eventos (+30%)</span>
                    </button>


                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => spot.status === 'Pausada' ? activateParkingSpace(spot.id) : pauseParkingSpace(spot.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          spot.status === 'Pausada'
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {spot.status === 'Pausada' ? '🟢 Ativar Anúncio' : '⏸️ Pausar Anúncio'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingSpot(spot);
                          setIsAddSpotModalOpen(true);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSpotToDelete(spot)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                        title="Excluir garagem do aplicativo"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: SOLICITAÇÕES & RESERVAS (RESERVAS RECEBIDAS) */}
      {activeOwnerTab === 'reservas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-base">Reservas Recebidas da Garagem</h3>
              <p className="text-xs text-slate-500">Acompanhe quem reservou suas vagas, aprove solicitações e visualize os repasses em tempo real.</p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
              {myBookings.length} {myBookings.length === 1 ? 'reserva' : 'reservas'}
            </span>
          </div>

          {myBookings.length === 0 ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="font-extrabold text-slate-800 text-base">Nenhuma reserva recebida ainda</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Assim que um motorista reservar sua garagem, a solicitação aparecerá aqui automaticamente com todos os dados do motorista, veículo e horário.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map((b) => {
                const driverAvatar = b.driverAvatar || b.userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80";
                const driverName = b.driverName || b.userName || "Motorista";
                const driverPhone = b.driverPhone || b.userPhone || "(73) 98765-4321";
                const spotTitle = b.parkingTitle || b.spaceTitle || "Garagem VagaGo";
                const spotAddress = b.parkingAddress || b.spaceAddress || "Itabuna - BA";
                const bookingDate = b.startDate || b.date || "Hoje";
                const netAmount = Number(b.ownerPayout || b.owner_payout || (b.totalPrice * 0.9)).toFixed(2);
                const isPending = b.bookingStatus === 'Aguardando Aprovação' || b.status === 'pending';
                const isConfirmed = b.bookingStatus === 'Confirmado' || b.status === 'confirmed';
                const isCancelled = b.bookingStatus === 'Cancelado' || b.bookingStatus === 'Recusado' || b.status === 'cancelled';
                const createdDate = b.createdAt ? new Date(b.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Recente';

                return (
                  <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:border-emerald-300">
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={driverAvatar}
                        alt={driverName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isConfirmed
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isCancelled
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {b.bookingStatus || (isConfirmed ? 'Confirmado' : isPending ? 'Aguardando Aprovação' : 'Concluído')}
                          </span>
                          <span className="text-xs font-mono text-slate-400 font-bold">#{b.bookingNumber}</span>
                          <span className="text-[11px] text-slate-400">• Reservada em {createdDate}</span>
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                          <span>{driverName}</span>
                          <span className="text-xs font-normal text-slate-500">📞 {driverPhone}</span>
                        </h4>

                        <p className="text-xs text-slate-600">
                          📍 <strong className="text-slate-800">{spotTitle}</strong> ({spotAddress})
                        </p>

                        <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap pt-0.5">
                          <span>📅 <strong>{bookingDate}</strong> das {b.startTime} às {b.endTime} ({b.totalHours}h)</span>
                          {b.vehicle && (
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                              🚗 {b.vehicle.brand} {b.vehicle.model} • <span className="font-mono font-bold text-slate-900">{b.vehicle.plate}</span>
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-black text-emerald-700 pt-1">
                          💰 Valor líquido a receber: R$ {netAmount} <span className="text-slate-400 font-normal">(Taxa VagaGo: R$ {Number(b.platformFee || b.platform_fee || (b.totalPrice * 0.1)).toFixed(2)})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setChatBooking(b);
                          setIsChatOpen(true);
                        }}
                        className="bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition border border-sky-200 cursor-pointer"
                        title="Falar com o Motorista com moderação do Vagago Concierge"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                        <span>Chat Locatário</span>
                      </button>

                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => approveBooking(b.id)}
                            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition cursor-pointer"
                          >
                            ✓ Aceitar Reserva
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectBooking(b.id)}
                            className="flex-1 md:flex-none bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
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





      {/* TAB 3: CALENDÁRIO & BLOQUEIO DE HORÁRIOS */}
      {activeOwnerTab === 'calendario' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Gerenciador de Disponibilidade do Anfitrião</h3>
            <p className="text-xs text-slate-500">Clique sobre um horário para bloquear ou liberar a garagem instantaneamente.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
            {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map((hour) => {
              const isLocked = lockedHours.includes(hour);
              return (
                <button
                  key={hour}
                  onClick={() => toggleLockHour(hour)}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1 transition ${
                    isLocked
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
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

      {/* TAB 4: MENSALISTAS */}
      {activeOwnerTab === 'mensalistas' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Contratos Mensais Ativos (Mensalistas)</h3>
              <p className="text-xs text-slate-500">Renda recorrente garantida mês a mês</p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
              1 Contrato Ativo
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-900">
              <span>Cliente Mensalista: Matheus Silva</span>
              <span className="text-emerald-600">R$ 380,00 / mês</span>
            </div>
            <p className="text-slate-500">Plano: Garagem Privativa Paulista Prime • Segunda a Sexta (07:00 às 19:00)</p>
            <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-200">
              <span>Início do Contrato: 01/08/2026</span>
              <span>Próximo Vencimento: 01/09/2026 (Renovação Automática)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FINANCEIRO & DETALHAMENTO DE COMISSÃO 10% */}
      {activeOwnerTab === 'financeiro' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Detalhamento de Transações e Comissão VagaGo (10%)</h3>
            <p className="text-xs text-slate-500">Transparência total dos seus repasses</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Reserva</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Valor Bruto</th>
                  <th className="p-3">Comissão VagaGo (10%)</th>
                  <th className="p-3">Você Recebe</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {myBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="p-3 font-bold text-slate-900">{b.bookingNumber}</td>
                    <td className="p-3">{b.date}</td>
                    <td className="p-3 font-bold text-slate-800">R$ {Number(b.subtotal || b.totalPrice || 0).toFixed(2)}</td>
                    <td className="p-3 font-bold text-rose-500">- R$ {Number(b.platformFee || ((b.totalPrice || 0) * 0.1)).toFixed(2)}</td>
                    <td className="p-3 font-black text-emerald-600">R$ {Number(b.ownerPayout || ((b.totalPrice || 0) * 0.9)).toFixed(2)}</td>

                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Liberado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Withdrawal Request Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleWithdrawSubmit} className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Solicitar Saque PIX</h3>
            <p className="text-xs text-slate-500">Chave cadastrada: <strong className="text-slate-800">{currentUser?.pixKey || currentUser?.email || "Chave PIX do Anfitrião"}</strong></p>


            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Valor do Saque (R$)</label>
              <input
                type="number"
                step="10"
                max={availableBalance}
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-emerald-600"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="flex-1 bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold py-2.5 rounded-xl cursor-pointer"
              >
                Confirmar Saque
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Garage Confirmation Modal */}
      {spotToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-base">Excluir Garagem?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tem certeza que deseja remover <strong>"{spotToDelete.title}"</strong> do aplicativo? Esta ação é permanente e removerá a vaga do mapa e do banco de dados.
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


