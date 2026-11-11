import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from './InteractiveMap';
import { SmartParkWidget } from './SmartParkWidget';
import { PwaInstallSection } from './PwaInstallSection';
import { PLATFORM_GUARANTEES, ITABUNA_TESTIMONIALS } from '../services/brandConfig';
import {
  Search,
  MapPin,
  Car,
  ShieldCheck,
  Zap,
  Star,
  Sparkles,
  ArrowRight,
  Navigation,
  CheckCircle2,
  Home,
  Lock,
  RefreshCw,
  UserCheck,
  Camera,
  Wallet,
  PlusCircle
} from 'lucide-react';

const FALLBACK_GARAGE_PHOTO =
  'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80';

export const LandingPage = () => {
  const {
    parkingSpaces,
    openSpotDetails,
    setActiveTab,
    searchLocation,
    setSearchLocation,
    searchFilters,
    setSearchFilters,
    setIsAddSpotModalOpen,
    requestUserLocation,
    isAuthenticated,
    setActiveRole,
    openRegisterModal
  } = useApp();

  // Toggle no Hero: 'driver' ("Sou Motorista") | 'host' ("Sou Anfitrião")
  const [heroAudience, setHeroAudience] = useState('driver');
  const [quickHostHourly, setQuickHostHourly] = useState(6);
  const [quickHostHoursDay, setQuickHostHoursDay] = useState(6);

  const safeFilters = searchFilters || {
    dateType: 'hoje',
    billingType: 'hora'
  };

  const safeSpots = Array.isArray(parkingSpaces) ? parkingSpaces : [];
  const activeSpots = safeSpots.filter(
    (s) => s && s.status !== 'Pausada' && s.isAvailable !== false
  );
  const displaySpots = activeSpots.length > 0 ? activeSpots : safeSpots;

  const estimatedMonthlyHostNet = quickHostHourly * quickHostHoursDay * 22 * 0.9;

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setActiveTab('search');
  };

  const handleStartHosting = () => {
    if (isAuthenticated) {
      setActiveRole('PROPRIETÁRIO');
      setIsAddSpotModalOpen(true);
    } else {
      openRegisterModal('PROPRIETÁRIO');
    }
  };

  const guaranteeIcons = {
    refund: RefreshCw,
    verified: UserCheck,
    protected_access: Lock,
    real_photos: Camera
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-16 bg-slate-50/50">
      {/* ==================================================
          1. HERO SECTION COM TOGGLE MOTORISTA / ANFITRIÃO
         ================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-slate-50/80 to-white pt-7 sm:pt-12 pb-14 sm:pb-20 border-b border-slate-200/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-gradient-to-r from-sky-400/10 to-emerald-400/10 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Pilot Badge + Role Toggle no Topo */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50/90 border border-emerald-200/90 text-emerald-800 text-xs font-bold px-4 py-1.5 rounded-full shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Operação Oficial em Itabuna - BA • Web App (PWA)</span>
            </div>

            {/* Toggle Claro no Topo: Sou Motorista / Sou Anfitrião */}
            <div
              role="tablist"
              aria-label="Selecione seu perfil no VagaGo"
              className="inline-flex items-center p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm"
            >
              <button
                type="button"
                role="tab"
                aria-selected={heroAudience === 'driver'}
                onClick={() => setHeroAudience('driver')}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition cursor-pointer ${
                  heroAudience === 'driver'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Sou Motorista</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={heroAudience === 'host'}
                onClick={() => setHeroAudience('host')}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition cursor-pointer ${
                  heroAudience === 'host'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Sou Anfitrião (Alugar Vaga)</span>
              </button>
            </div>
          </div>

          {heroAudience === 'driver' ? (
            <>
              {/* Hero Motorista */}
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.14] text-balance">
                  Encontre vagas de estacionamento <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                    perto de você em Itabuna
                  </span>
                </h1>

                <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed text-balance">
                  Garagens privativas e seguras por hora, diária ou mês no Centro, Av. do Cinquentenário, Shopping Jequitibá e bairros — veja fotos reais e reserve pelo celular.
                </p>
              </div>

              {/* Card de Busca Motorista */}
              <div className="mt-6 max-w-4xl mx-auto">
                <form
                  onSubmit={handleSearchSubmit}
                  className="bg-white rounded-3xl p-4 sm:p-7 shadow-xl shadow-slate-200/50 border border-slate-200/80 space-y-4 relative z-10"
                >
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 shrink-0" />
                    <input
                      type="text"
                      placeholder="Buscar garagem em Itabuna (Ex: Centro, Av. Cinquentenário, Góes Calmon...)"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="w-full bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-2xl pl-12 pr-12 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 focus:outline-none transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={requestUserLocation}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      title="Usar minha localização atual via GPS"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Populares em Itabuna */}
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 text-xs">
                    <span className="text-slate-400 font-semibold shrink-0">Populares em Itabuna:</span>
                    {[
                      'Centro - Av. Cinquentenário',
                      'Shopping Jequitibá',
                      'Góes Calmon',
                      'Jardim Vitória',
                      'São Caetano',
                      'Bairro Fátima'
                    ].map((nb) => (
                      <button
                        key={nb}
                        type="button"
                        onClick={() => {
                          setSearchLocation(nb + ', Itabuna - BA');
                          setActiveTab('search');
                        }}
                        className="bg-sky-50/80 hover:bg-sky-100 text-sky-800 border border-sky-200/80 px-3 py-1 rounded-full shrink-0 font-bold transition cursor-pointer"
                      >
                        📍 {nb}
                      </button>
                    ))}
                  </div>

                  {/* Filtros Data e Período */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                      {[
                        { id: 'agora', label: 'Agora' },
                        { id: 'hoje', label: 'Hoje' },
                        { id: 'amanha', label: 'Amanhã' }
                      ].map((mode) => (
                        <button
                          type="button"
                          key={mode.id}
                          onClick={() => setSearchFilters({ ...safeFilters, dateType: mode.id })}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                            safeFilters.dateType === mode.id
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
                      {[
                        { id: 'hora', label: 'Por hora' },
                        { id: 'diaria', label: 'Diária' },
                        { id: 'semanal', label: 'Semanal' },
                        { id: 'mensal', label: 'Mensal' }
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => setSearchFilters({ ...safeFilters, billingType: item.id })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            safeFilters.billingType === item.id
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hierarquia Clara de CTAs: Primário Destaque + Secundário Contorno */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                    <button
                      type="submit"
                      className="flex-1 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-sm sm:text-base py-3.5 sm:py-4 px-6 rounded-2xl shadow-lg shadow-sky-600/25 hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Search className="w-5 h-5" />
                      <span>Reservar Agora</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const mapEl = document.getElementById('mapa-itabuna-section');
                        if (mapEl) {
                          mapEl.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          setActiveTab('search');
                        }
                      }}
                      className="sm:w-auto border-2 border-slate-300 hover:border-sky-600 hover:bg-sky-50/60 text-slate-700 hover:text-sky-700 font-extrabold text-xs sm:text-sm py-3.5 px-6 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-sky-600" />
                      <span>Ver no mapa</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <>
              {/* Hero Anfitrião */}
              <div className="text-center max-w-3xl mx-auto space-y-4 animate-in fade-in duration-200">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.14] text-balance">
                  Alugue sua garagem parada <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600 bg-clip-text text-transparent">
                    com segurança em Itabuna
                  </span>
                </h1>

                <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed text-balance">
                  Cadastre sua vaga residencial, comercial ou de condomínio gratuitamente. Motoristas chegam com CPF e placa verificados e você recebe <strong>90% direto no seu PIX</strong>.
                </p>
              </div>

              {/* Simulador Rápido do Anfitrião no Hero */}
              <div className="mt-6 max-w-4xl mx-auto bg-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/50 border border-emerald-200/80 grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-in fade-in duration-200">
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Valor por hora na sua região:</span>
                    <span className="text-emerald-700 font-black text-sm">R$ {quickHostHourly},00/h</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="12"
                    step="1"
                    value={quickHostHourly}
                    onChange={(e) => setQuickHostHourly(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-1">
                    <span>Horas alugadas por dia útil:</span>
                    <span className="text-emerald-700 font-black text-sm">{quickHostHoursDay}h / dia</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    step="1"
                    value={quickHostHoursDay}
                    onChange={(e) => setQuickHostHoursDay(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />

                  <div className="flex flex-wrap gap-3 pt-1 text-[11px] font-bold text-slate-600">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Grátis para anunciar
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Você escolhe horários
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Saque via PIX
                    </span>
                  </div>
                </div>

                <div className="md:col-span-5 bg-slate-900 text-white p-5 rounded-2xl space-y-4 text-center">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
                      Estimativa Mensal (90% seu)
                    </span>
                    <div className="text-3xl font-black text-white mt-1">
                      R$ {estimatedMonthlyHostNet.toFixed(0)}
                      <span className="text-xs font-normal text-slate-400"> / mês</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Considerando 22 dias úteis • Sem taxa fixa
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleStartHosting}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Anunciar Minha Garagem</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('host_landing')}
                      className="w-full border border-slate-600 hover:border-emerald-400 text-slate-200 hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
                    >
                      Ver detalhes para anfitriões
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Barra de Credibilidade Realista (sem números inflados ou vagos) */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-center">
            <div className="p-3.5 sm:p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-base sm:text-lg font-black text-slate-900">A partir de R$ 5/h</div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5">
                Mais econômico que rotativos
              </div>
            </div>
            <div className="p-3.5 sm:p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-base sm:text-lg font-black text-emerald-600">Reembolso Imediato</div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5">
                Estorno se a vaga falhar
              </div>
            </div>
            <div className="p-3.5 sm:p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-base sm:text-lg font-black text-sky-600">CPF &amp; Placa Checados</div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5">
                Portão e senha protegidos
              </div>
            </div>
            <div className="p-3.5 sm:p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-base sm:text-lg font-black text-slate-900">Itabuna - BA</div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5">
                Centro, Jequitibá e Bairros
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. SUGESTÕES AUTOMÁTICAS PERTO DE VOCÊ (SEM REPETIÇÃO)
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SmartParkWidget />
      </section>

      {/* ==================================================
          3. MAPA INTERATIVO (LAZY LOADING 4G/5G) + FOTOS REAIS DAS GARAGENS
         ================================================== */}
      <section id="mapa-itabuna-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4" /> Mapa de Garagens em Itabuna
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Garagens disponíveis com fotos reais e preço por hora
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Confira portão de entrada, iluminação e cobertura antes de reservar sua vaga.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className="border-2 border-slate-300 hover:border-sky-600 hover:bg-sky-50 text-slate-800 hover:text-sky-700 text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-2 self-start md:self-auto transition cursor-pointer"
          >
            <span>Ver no mapa completo</span>
            <ArrowRight className="w-4 h-4 text-sky-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Interactive Lazy Map (7 cols) */}
          <div className="lg:col-span-7 h-[360px] sm:h-[440px] rounded-3xl overflow-hidden shadow-md border border-slate-200">
            <InteractiveMap
              spots={displaySpots}
              onSelectSpot={(spot) => openSpotDetails(spot)}
            />
          </div>

          {/* Lista de Vagas com Miniaturas Reais (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5 flex flex-col justify-center">
            {displaySpots.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-3 shadow-2xs">
                <Car className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-extrabold text-slate-800 text-base">
                  Nenhuma garagem disponível no momento
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Seja o primeiro a cadastrar sua garagem em Itabuna e comece a faturar!
                </p>
                <button
                  type="button"
                  onClick={handleStartHosting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  Anunciar Minha Garagem
                </button>
              </div>
            ) : (
              displaySpots.slice(0, 3).map((spot) => {
                const spotPhotos =
                  Array.isArray(spot.photos) && spot.photos.length > 0
                    ? spot.photos
                    : [spot.facadePhoto || FALLBACK_GARAGE_PHOTO];
                const mainPhoto = spotPhotos[0] || FALLBACK_GARAGE_PHOTO;

                return (
                  <div
                    key={spot.id}
                    onClick={() => openSpotDetails(spot)}
                    className="p-3.5 sm:p-4 bg-white hover:bg-slate-50/90 rounded-2xl border border-slate-200/80 hover:border-sky-300 shadow-2xs hover:shadow-md transition cursor-pointer flex gap-3.5 items-start group"
                  >
                    {/* Foto Principal + Tira de Miniaturas Reais (Portão, Iluminação, Espaço) */}
                    <div className="shrink-0 space-y-1.5">
                      <div className="relative">
                        <img
                          src={mainPhoto}
                          alt={`Garagem ${spot.title}`}
                          loading="lazy"
                          decoding="async"
                          className="w-24 h-20 sm:w-28 sm:h-22 rounded-xl object-cover ring-1 ring-slate-200 group-hover:scale-102 transition"
                        />
                        {spot.isCovered && (
                          <span className="absolute bottom-1 left-1 bg-slate-900/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            🛡️ Coberta
                          </span>
                        )}
                      </div>

                      {spotPhotos.length > 1 && (
                        <div className="flex items-center gap-1">
                          {spotPhotos.slice(0, 3).map((thumb, idx) => (
                            <img
                              key={idx}
                              src={thumb}
                              alt={`Detalhe ${idx + 1} de ${spot.title}`}
                              loading="lazy"
                              decoding="async"
                              className="w-7 h-5 sm:w-8 sm:h-6 rounded object-cover ring-1 ring-slate-200"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full uppercase border border-sky-200/60 truncate">
                          📍 {spot.neighborhood || 'Itabuna'}
                        </span>
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {Number(spot.rating || 4.8).toFixed(1)}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-sm mt-1 truncate group-hover:text-sky-600 transition">
                        {spot.title}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{spot.address}</p>

                      {/* Características visuais de confiança (Portão, Iluminação, etc.) */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(spot.features || ['Portão Eletrônico', 'Iluminação']).slice(0, 2).map((feat, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-black text-slate-900">
                            R$ {Number(spot.priceHourly || 6).toFixed(2)}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">/ hora</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSpotDetails(spot);
                          }}
                          className="text-xs font-extrabold bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-xl transition shadow-2xs cursor-pointer"
                        >
                          Reservar Agora
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ==================================================
          4. PROTEÇÃO NA PRÁTICA (DETALHAMENTO DA SEGURANÇA)
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-2xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-emerald-600 tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Transparência e Proteção
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              O que a segurança VagaGo garante na prática
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Sem promessas vagas: regras claras que protegem seu dinheiro, seu veículo e a garagem do anfitrião.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {PLATFORM_GUARANTEES.map((item) => {
              const IconComp = guaranteeIcons[item.id] || ShieldCheck;
              return (
                <div
                  key={item.id}
                  className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3 hover:border-emerald-300 transition"
                >
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================
          5. COMO FUNCIONA PARA MOTORISTAS
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase text-sky-600 tracking-wider">
              Passo a Passo Simples
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Como estacionar com o VagaGo em 3 passos
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Economize tempo e evite voltas desnecessárias pelo centro de Itabuna.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-center space-y-3">
              <div className="w-11 h-11 bg-sky-600 text-white font-black rounded-2xl flex items-center justify-center mx-auto text-base shadow-sm">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Compare fotos e preços</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Veja no mapa as garagens disponíveis perto do seu destino com fotos reais do portão, iluminação e tarifa por hora.
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-center space-y-3">
              <div className="w-11 h-11 bg-sky-600 text-white font-black rounded-2xl flex items-center justify-center mx-auto text-base shadow-sm">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Reserve e pague via PIX</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Escolha o veículo cadastrado, defina entrada e saída e pague via PIX ou créditos com cancelamento grátis até 1h antes.
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-center space-y-3">
              <div className="w-11 h-11 bg-emerald-600 text-white font-black rounded-2xl flex items-center justify-center mx-auto text-base shadow-sm">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Entre com QR Code</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receba as orientações exatas do portão após o pagamento, faça check-in pelo celular e estacione com tranquilidade.
              </p>
            </div>
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className="border-2 border-sky-600 text-sky-700 hover:bg-sky-50 font-extrabold text-xs sm:text-sm py-3 px-6 rounded-2xl transition cursor-pointer inline-flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Explorar vagas disponíveis no mapa</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================
          6. DEPOIMENTOS DE MORADORES DE ITABUNA
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-bold uppercase text-sky-600 tracking-wider">
            Comunidade Local em Itabuna - BA
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Quem usa no dia a dia em Itabuna recomenda
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Motoristas e proprietários de bairros como Fátima, Góes Calmon, Centro e Jardim Vitória.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {ITABUNA_TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: item.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <img
                  src={item.avatar}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-sky-100 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] font-semibold text-sky-700 truncate">
                    {item.neighborhood}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================
          7. SEÇÃO DEDICADA PARA ANFITRIÕES (DONOS DE GARAGEM)
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl space-y-8 border border-emerald-900/40">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full">
                <Home className="w-3.5 h-3.5" /> Para Proprietários e Condomínios
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Tem uma vaga parada? Alugue com segurança e receba via PIX
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Seu espaço vazio durante o horário comercial ou nos fins de semana pode gerar renda extra mensal sem dor de cabeça e sem custos fixos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                type="button"
                onClick={handleStartHosting}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Anunciar Minha Vaga</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('host_landing')}
                className="border border-emerald-400/50 hover:bg-emerald-500/15 text-emerald-200 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-2xl transition cursor-pointer"
              >
                Simular ganhos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 pt-2">
            <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm">Controle total de horários e preço</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Defina tarifas por hora, diária ou mensalidade, escolha se quer aprovar pedidos manualmente e pause sua vaga em 1 clique quando precisar usar.
              </p>
            </div>

            <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="w-9 h-9 bg-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm">Motoristas identificados e check-in</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Antes de liberar o portão, você recebe nome, telefone, CPF e modelo/placa do veículo do motorista no seu painel.
              </p>
            </div>

            <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="w-9 h-9 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm">90% líquido direto via PIX</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sem mensalidade nem taxa de adesão: você fica com 90% de cada reserva concluída e solicita saque para sua chave PIX a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          8. IDENTIFICAÇÃO DA PLATAFORMA (WEB APP / PWA)
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PwaInstallSection />
      </section>

      {/* ==================================================
          9. BANNER CTA FINAL COM HIERARQUIA CLARA
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 text-white rounded-3xl p-7 sm:p-12 text-center space-y-6 shadow-xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black">
              Pronto para estacionar tranquilo em Itabuna?
            </h2>
            <p className="text-sky-100 text-xs sm:text-sm">
              Compare garagens privativas por hora, diária ou mês e garanta sua vaga em poucos segundos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-900 font-black text-xs sm:text-sm py-3.5 px-7 rounded-2xl shadow-xl transition transform hover:scale-105 cursor-pointer"
            >
              Reservar Agora
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('host_landing')}
              className="w-full sm:w-auto border border-sky-300/60 hover:bg-white/10 text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-2xl transition cursor-pointer"
            >
              Quero alugar minha garagem
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
