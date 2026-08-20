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
  ArrowUpRight
} from 'lucide-react';

export const OwnerDashboard = () => {
  const {
    currentUser,
    isAuthenticated,
    openLoginModal,
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
    demandRegions
  } = useApp();


  const [activeOwnerTab, setActiveOwnerTab] = useState('visãogeral'); // visãogeral, vagas, calendario, mensalistas, financeiro
  const [withdrawalAmount, setWithdrawalAmount] = useState('250');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [spotToDelete, setSpotToDelete] = useState(null);
  const [lockedHours, setLockedHours] = useState(['12:00', '13:00']);

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

  // Filter host spaces & bookings - Matching by ID or Email of authenticated host
  const mySpaces = safeSpaces.filter(s => s && (
    s.ownerId === safeUser.id || 
    (s.ownerEmail && safeUser.email && s.ownerEmail.toLowerCase() === safeUser.email.toLowerCase())
  ));


  const myBookings = safeBookings.filter(b => b && (
    b.ownerId === safeUser.id || 
    (b.ownerEmail && safeUser.email && b.ownerEmail.toLowerCase() === safeUser.email.toLowerCase()) ||
    mySpaces.some(space => space.id === b.spaceId)
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
          <img
            src={safeUser.avatar}
            alt={safeUser.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-white/20 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                ⭐ SuperHost Verificado
              </span>

              <span className="text-slate-400 text-xs hidden sm:inline">• PIX: {safeUser.pixKey || safeUser.email || "pix@vagago.com.br"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">{safeUser.name || "Meu Painel de Anfitrião"}</h1>

            <p className="text-xs text-emerald-100/80">Sua vaga gerando renda passiva 24h por dia em Itabuna - BA</p>
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

      {/* Real-time Host Fluid Logistics Board */}
      <div className="p-5 bg-gradient-to-r from-sky-900 via-slate-900 to-slate-900 text-white rounded-3xl shadow-md border border-sky-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h4 className="font-extrabold text-sm text-sky-400">Logística de Chegada de Clientes em Tempo Real</h4>
          </div>
          <span className="text-[11px] font-bold bg-sky-500/20 text-sky-300 px-2.5 py-0.5 rounded border border-sky-400/30">
            Monitoramento Google Maps
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {myBookings.map((b) => (
            <div key={b.id} className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{b.userName}</span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                    ETA 5 min
                  </span>
                </div>
                <p className="text-slate-400">{b.vehicle.brand} {b.vehicle.model} ({b.vehicle.plate})</p>
                <p className="text-[11px] font-bold text-sky-400">Vaga: {b.spaceTitle}</p>
              </div>

              <button
                onClick={() => setIsScannerOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] px-3 py-2 rounded-xl shrink-0 transition"
              >
                Autorizar Entrada
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Demand Map Alert Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Oportunidade de Alta Demanda Detectada!</h4>
            <p className="text-xs text-slate-600">
              Na região <strong>Bela Vista / Paulista</strong>, 142 motoristas procuraram vagas nos últimos 7 dias. Cadastre mais uma vaga e aumente seus lucros.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingSpot(null);
            setIsAddSpotModalOpen(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shrink-0 transition"
        >
          Cadastrar mais 1 vaga
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'visãogeral', label: 'Visão Geral & Gráficos' },
          { id: 'vagas', label: `Minhas Garagens (${mySpaces.length})` },
          { id: 'reservas', label: `Solicitações & Reservas (${myBookings.length})` },
          { id: 'calendario', label: 'Calendário & Bloqueios' },
          { id: 'mensalistas', label: 'Mensalistas (Assinaturas)' },
          { id: 'financeiro', label: 'Financeiro & Comissões (10%)' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveOwnerTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 ${
              activeOwnerTab === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
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
                      onClick={() => useApp().toggleEventPricing(spot.id)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1 ${
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

      {/* TAB: SOLICITAÇÕES & RESERVAS */}
      {activeOwnerTab === 'reservas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Controle de Reservas da Garagem</h3>
              <p className="text-xs text-slate-500">Aprove ou recuse solicitações e gerencie quem está estacionando.</p>
            </div>
          </div>

          {myBookings.length === 0 ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="font-extrabold text-slate-800 text-base">Nenhuma reserva recebida ainda</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Assim que um motorista reservar sua garagem, a solicitação aparecerá aqui com todos os detalhes do veículo e horários.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map((b) => (
                <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                        b.bookingStatus === 'Aguardando Aprovação'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : b.bookingStatus === 'Confirmado'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : b.bookingStatus === 'Recusado' || b.bookingStatus === 'Cancelado'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {b.bookingStatus}
                      </span>
                      <span className="text-xs font-mono text-slate-400">#{b.bookingNumber}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">
                      {b.userName} • <span className="text-slate-600 font-normal">{b.vehicle?.brand} {b.vehicle?.model} ({b.vehicle?.plate})</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      📍 {b.spaceTitle} • 📅 {b.date} das {b.startTime} às {b.endTime} ({b.totalHours}h)
                    </p>
                    <div className="text-xs font-black text-emerald-700">
                      Recebimento líquido: R$ {Number(b.ownerPayout || b.totalPrice * 0.9).toFixed(2)} (Taxa VagaGo: R$ {Number(b.platformFee || b.totalPrice * 0.1).toFixed(2)})
                    </div>
                  </div>

                  {b.bookingStatus === 'Aguardando Aprovação' && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => approveBooking(b.id)}
                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                      >
                        ✓ Aceitar Reserva
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectBooking(b.id)}
                        className="flex-1 sm:flex-none bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                      >
                        ✕ Recusar
                      </button>
                    </div>
                  )}
                </div>
              ))}
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
                    <td className="p-3 font-bold text-slate-800">R$ {b.subtotal.toFixed(2)}</td>
                    <td className="p-3 font-bold text-rose-500">- R$ {b.platformFee.toFixed(2)}</td>
                    <td className="p-3 font-black text-emerald-600">R$ {b.ownerPayout.toFixed(2)}</td>
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

    </div>
  );
};

