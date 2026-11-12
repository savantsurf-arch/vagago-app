import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from './InteractiveMap';
import { SmartParkWidget } from './SmartParkWidget';
import { GaragePhotoCarousel } from './GaragePhotoCarousel';
import { HostWaitlist } from './HostWaitlist';
import { PwaInstallSection } from './PwaInstallSection';
import {
  PLATFORM_GUARANTEES,
  GARAGE_TRUST_GALLERY,
  ITABUNA_TESTIMONIALS
} from '../services/brandConfig';
import {
  Search,
  MapPin,
  Car,
  ShieldCheck,
  Zap,
  DollarSign,
  Star,
  ArrowRight,
  Navigation,
  CheckCircle2,
  Home,
  Lock,
  RefreshCw,
  UserCheck,
  Camera,
  PlusCircle,
  QrCode,
  Clock,
  Maximize2,
  ChevronRight,
  Tag
} from 'lucide-react';

export const LandingPage = ({ onOpenDepositModal = () => {} }) => {
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
    userLocation,
    isAuthenticated,
    currentUser,
    openLoginModal,
    setActiveRole,
    openRegisterModal,
    coupons = []
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

  const firstName =
    isAuthenticated && currentUser?.name
      ? currentUser.name.trim().split(/\s+/)[0]
      : 'Motorista';

  const activeCoupon = Array.isArray(coupons) && coupons.length > 0 ? coupons[0] : null;
  const couponLabel = activeCoupon
    ? `Cupom ${activeCoupon.code || 'VAGAGO10'}: ${activeCoupon.discountPercent || 10}% OFF na reserva`
    : 'Cupom Primeira Reserva: 10% OFF com VAGAGO10';

  const cleanSearchInput =
    !searchLocation || searchLocation.trim().toLowerCase() === 'itabuna, ba'
      ? ''
      : searchLocation;

  const cheapestPrice =
    displaySpots.length > 0
      ? Math.min(...displaySpots.map((s) => Number(s.priceHourly || 6)))
      : 4;

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setActiveTab('search');
  };

  const handleQuickDestination = (address) => {
    setSearchLocation(address);
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

  const handleQuickPixClick = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    onOpenDepositModal();
  };

  const guaranteeIcons = {
    refund: RefreshCw,
    verified: UserCheck,
    protected_access: Lock,
    real_photos: Camera
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 bg-slate-50">
      {/* ==================================================
          1. HERO MOBILE-FIRST ESTILO 99 (TOPO AMARELO + MAPA + "PARA ONDE VAMOS?")
         ================================================== */}
      <section className="relative bg-gradient-to-b from-[#FFDC00] via-[#FFE64D] to-slate-50 pt-4 sm:pt-6 pb-6 border-b border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-4">
          {/* Header Estilo 99: Avatar + "Olá, Nome!" + Atalho Pix/QR + Toggle Anfitrião */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => (isAuthenticated ? setActiveTab('profile') : openLoginModal())}
              className="flex items-center gap-3 text-left group cursor-pointer min-h-[44px]"
            >
              <img
                src={
                  currentUser?.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                }
                alt={firstName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm shrink-0"
              />
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-950 leading-tight group-hover:underline">
                  Olá, {firstName}!
                </h1>
                <p className="text-xs font-bold text-slate-800/80 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{userLocation?.isLive ? 'GPS ativo em Itabuna' : 'Itabuna - BA • Estacione fácil'}</span>
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2">
              {/* Toggle Rápido Motorista / Anfitrião */}
              <div
                role="tablist"
                aria-label="Selecione seu perfil no VagaGo"
                className="hidden sm:inline-flex items-center p-1 bg-white/90 rounded-full shadow-xs border border-amber-300"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={heroAudience === 'driver'}
                  onClick={() => setHeroAudience('driver')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                    heroAudience === 'driver'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Motorista</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={heroAudience === 'host'}
                  onClick={() => setHeroAudience('host')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                    heroAudience === 'host'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Anfitrião</span>
                </button>
              </div>

              {/* Atalho Pix + QR (Canto superior direito, igual imagem modelo) */}
              <button
                type="button"
                onClick={handleQuickPixClick}
                className="relative min-w-[44px] min-h-[44px] px-2.5 py-1.5 bg-white/85 hover:bg-white rounded-2xl border border-amber-300/80 shadow-xs flex items-center justify-center transition cursor-pointer"
                aria-label="Abrir Carteira Pix e QR Code"
                title="Carteira Pix e QR Code"
              >
                <span className="absolute -top-1.5 left-1 bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none shadow-2xs">
                  Pix
                </span>
                <QrCode className="w-5 h-5 text-slate-900 mt-1" />
              </button>
            </div>
          </div>

          {/* Toggle Mobile Motorista / Anfitrião */}
          <div
            role="tablist"
            aria-label="Alternar entre Motorista e Anfitrião"
            className="grid grid-cols-2 sm:hidden p-1 bg-white/90 rounded-2xl shadow-xs border border-amber-300/80"
          >
            <button
              type="button"
              role="tab"
              aria-selected={heroAudience === 'driver'}
              onClick={() => setHeroAudience('driver')}
              className={`min-h-[40px] rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                heroAudience === 'driver' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Estacionar</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={heroAudience === 'host'}
              onClick={() => setHeroAudience('host')}
              className={`min-h-[40px] rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                heroAudience === 'host' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Alugar minha vaga</span>
            </button>
          </div>

          {heroAudience === 'driver' ? (
            <div className="space-y-4">
              {/* Card do Mapa Vivo Integrado (Exatamente como a imagem modelo!) */}
              <div className="relative h-52 sm:h-72 lg:h-80 rounded-3xl overflow-hidden shadow-lg border-2 border-white bg-sky-50">
                <InteractiveMap
                  eagerLoad={true}
                  fullScreen={false}
                  disablePopupOnSelect={true}
                  spots={displaySpots}
                  userLocation={userLocation}
                  onSelectSpot={(spot) => openSpotDetails(spot)}
                  className="w-full h-full min-h-0 relative"
                />
                <button
                  type="button"
                  onClick={() => setActiveTab('search')}
                  className="absolute bottom-4 left-3 z-[15] bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-extrabold px-3.5 py-2 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-xs transition cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#FFDC00]" />
                  <span>Mapa em tela cheia</span>
                </button>
              </div>

              {/* Faixa Verde de Cupom + Card "Para onde vamos?" sobreposto */}
              <div className="-mt-6 relative z-20">
                <button
                  type="button"
                  onClick={() => setActiveTab('search')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 pt-2.5 pb-4 rounded-t-2xl text-xs font-extrabold flex items-center justify-between transition cursor-pointer shadow-sm"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Tag className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{couponLabel}</span>
                  </span>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full shrink-0">
                    Ver vagas →
                  </span>
                </button>

                <form
                  onSubmit={handleSearchSubmit}
                  className="-mt-2.5 bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-100 space-y-3"
                >
                  {/* Barra "Para onde vamos?" */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/30 focus-within:border-sky-500 transition">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center text-slate-700 shrink-0">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      aria-label="Para onde vamos? Buscar vaga em Itabuna"
                      placeholder="Para onde vamos?"
                      value={cleanSearchInput}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-600 font-black text-base sm:text-lg min-w-0 py-1.5"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        requestUserLocation();
                        setActiveTab('search');
                      }}
                      className="min-w-[44px] min-h-[44px] rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-700 flex items-center justify-center transition cursor-pointer shrink-0"
                      title="Usar minha localização atual"
                      aria-label="Usar minha localização GPS"
                    >
                      <Navigation className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Destinos rápidos / recentes estilo 99 */}
                  <div className="divide-y divide-slate-100">
                    {[
                      {
                        icon: Home,
                        title: 'Centro • Av. do Cinquentenário',
                        sub: 'Av. do Cinquentenário, 193 - Itabuna',
                        query: 'Centro - Av. Cinquentenário'
                      },
                      {
                        icon: Clock,
                        title: 'Shopping Jequitibá',
                        sub: 'Rod. Jorge Amado, s/n - Salobrinho',
                        query: 'Shopping Jequitibá'
                      },
                      {
                        icon: MapPin,
                        title: 'Bairro Fátima',
                        sub: 'Rua Saturnino José Soares, 120',
                        query: 'Bairro Fátima'
                      }
                    ].map((place) => {
                      const PlaceIcon = place.icon;
                      return (
                        <button
                          key={place.title}
                          type="button"
                          onClick={() => handleQuickDestination(place.query)}
                          className="w-full py-2.5 px-1 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl transition text-left cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-sky-100 text-slate-600 group-hover:text-sky-700 flex items-center justify-center shrink-0 transition">
                              <PlaceIcon className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm font-extrabold text-slate-900 truncate">
                                {place.title}
                              </div>
                              <div className="text-xs text-slate-500 truncate">{place.sub}</div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 shrink-0" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Período + CTA Principal */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
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
                          className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition shrink-0 cursor-pointer ${
                            safeFilters.billingType === item.id
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="min-h-[44px] bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-black text-sm px-6 py-2.5 rounded-2xl shadow-md shadow-sky-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Abrir mapa de vagas</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Banner Promocional Estilo Card (igual centro da imagem modelo) */}
              <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-[#FFDC00] rounded-3xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
                <div className="space-y-1">
                  <span className="inline-block bg-slate-950 text-[#FFDC00] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    VagaGo Itabuna
                  </span>
                  <h2 className="text-lg sm:text-xl font-black leading-tight text-white drop-shadow-2xs">
                    Estacione até 40% mais barato ou fature com sua vaga parada
                  </h2>
                  <p className="text-xs text-sky-50 font-semibold">
                    Garagens verificadas a partir de R$ {cheapestPrice.toFixed(0)}/h • Anfitriões recebem 90% no PIX
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartHosting}
                  className="min-h-[44px] bg-orange-500 hover:bg-orange-400 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-md shrink-0 transition cursor-pointer"
                >
                  ANUNCIAR GRÁTIS
                </button>
              </div>

              {/* Vagas recomendadas na região (Hierarquia Preço + Distância estilo 99) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Vagas recomendadas na região
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('search')}
                    className="text-xs font-extrabold text-sky-700 hover:text-sky-800 flex items-center gap-0.5 cursor-pointer py-1 px-2"
                  >
                    <span>Mais</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displaySpots.slice(0, 3).map((spot, idx) => {
                    const priceFixed = Number(spot.priceHourly || 6).toFixed(2);
                    const [intPart, decPart] = priceFixed.split('.');
                    const thumb =
                      (spot.photos && spot.photos[0]) ||
                      spot.facadePhoto ||
                      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=300&q=80';

                    return (
                      <div
                        key={spot.id}
                        onClick={() => openSpotDetails(spot)}
                        className={`relative flex items-center justify-between p-3.5 rounded-2xl bg-white shadow-sm hover:shadow-md transition cursor-pointer gap-3 ${
                          idx === 0 ? 'border-2 border-sky-500 bg-sky-50/30' : 'border border-slate-200'
                        }`}
                      >
                        {idx === 0 && (
                          <span className="absolute -top-2.5 left-3.5 bg-sky-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                            ⭐ RECOMENDADA
                          </span>
                        )}

                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={thumb}
                            alt={spot.title}
                            loading="lazy"
                            className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                          />
                          <div className="min-w-0 space-y-0.5">
                            <h3 className="font-extrabold text-slate-900 text-sm truncate">
                              {spot.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-sky-600 shrink-0" />
                              <span>{spot.distFormatted || '250 m'} • {spot.walkTime || '3 min a pé'}</span>
                            </p>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                              <span>{Number(spot.rating || 4.8).toFixed(1)}</span>
                              {spot.isCovered && (
                                <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                  Coberta
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 space-y-1">
                          <p className="text-xl font-black text-slate-900 leading-none">
                            R$ {intPart}
                            <span className="text-xs font-normal text-slate-500">,{decPart}/h</span>
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openSpotDetails(spot);
                            }}
                            className="min-h-[38px] bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                          >
                            Reservar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center max-w-3xl mx-auto space-y-3 pt-2 animate-in fade-in duration-200">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                  Alugue sua garagem parada com segurança em Itabuna
                </h2>
                <p className="text-slate-800 text-xs sm:text-base max-w-2xl mx-auto font-semibold leading-relaxed">
                  Cadastre sua vaga residencial, comercial ou de condomínio gratuitamente. Motoristas chegam com CPF e placa verificados e você recebe <strong>90% direto no seu PIX</strong>.
                </p>
              </div>

              <div className="mt-4 bg-white rounded-3xl p-5 sm:p-8 shadow-xl border border-emerald-200/80 grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-in fade-in duration-200">
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
                      className="w-full min-h-[44px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Anunciar Minha Garagem</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const wlEl = document.getElementById('para-anfitrioes-waitlist');
                        if (wlEl) wlEl.scrollIntoView({ behavior: 'smooth' });
                        else setActiveTab('host_landing');
                      }}
                      className="w-full min-h-[44px] border border-slate-600 hover:border-emerald-400 text-slate-200 hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
                    >
                      Entrar na Lista Prioritária
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ==================================================
          2. ESTACIONAR PERTO DE MIM (DADOS DISTINTOS + CARROSSEL)
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SmartParkWidget />
      </section>

      {/* ==================================================
          3. MAPA INTERATIVO (LAZY 4G/5G) + CARDS COM CARROSSEL DE FOTOS
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
              Navegue pelas fotos do portão, interior e iluminação diretamente nos cards antes de reservar.
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Lazy Map (7 cols) */}
          <div className="lg:col-span-7 h-[360px] sm:h-[460px] rounded-3xl overflow-hidden shadow-md border border-slate-200 lg:sticky lg:top-24">
            <InteractiveMap
              spots={displaySpots}
              onSelectSpot={(spot) => openSpotDetails(spot)}
            />
          </div>

          {/* Cards com Carrossel de Fotos Reais (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
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
                const ratingLabel = Number(spot.rating || 4.8).toFixed(1);
                const reviewsCount = Number(spot.reviewsCount || 0);

                return (
                  <div
                    key={spot.id}
                    onClick={() => openSpotDetails(spot)}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-sky-300 overflow-hidden shadow-2xs hover:shadow-md transition cursor-pointer group"
                  >
                    <GaragePhotoCarousel
                      photos={spot.photos}
                      captions={spot.photoCaptions}
                      fallbackPhoto={spot.facadePhoto}
                      altPrefix={spot.title}
                      heightClass="h-40"
                      topLeftSlot={
                        spot.isCovered ? (
                          <span className="bg-white/95 px-2.5 py-1 rounded-md text-[11px] font-extrabold text-slate-800 flex items-center gap-1 shadow-xs">
                            🛡️ Coberta e Monitorada
                          </span>
                        ) : null
                      }
                      topRightSlot={
                        <span className="bg-sky-50/95 text-sky-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-sky-200 shadow-xs">
                          📍 {spot.neighborhood || 'Itabuna'}
                        </span>
                      }
                    />

                    <div className="p-4">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-sky-600 transition truncate">
                          {spot.title}
                        </h3>
                        <span className="text-emerald-600 font-black text-base shrink-0">
                          R$ {Number(spot.priceHourly || 6).toFixed(2)}/h
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-1 truncate">
                        📍 {spot.address}
                      </p>

                      <div className="flex items-center gap-2 mt-3 text-xs">
                        <span className="text-amber-500 font-bold flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {ratingLabel}
                          {reviewsCount > 0 && (
                            <span className="text-slate-400 font-normal">({reviewsCount})</span>
                          )}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-sky-600 font-bold">
                          {spot.walkTime || '3 min a pé'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openSpotDetails(spot);
                        }}
                        className="w-full mt-3.5 bg-sky-600 hover:bg-sky-500 text-white py-2.5 rounded-xl text-xs font-extrabold transition shadow-xs cursor-pointer"
                      >
                        Ver detalhes e reservar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ==================================================
          4. GALERIA DE CONFIANÇA: FOTOS REAIS DAS GARAGENS
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-2xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-sky-600 tracking-wider">
              <Camera className="w-4 h-4" /> Galeria de Confiança VagaGo
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Confira portão, espaço interno e iluminação antes de sair
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Foto real é o que dá segurança: incentivamos todo anfitrião a registrar os 3 ângulos essenciais da garagem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {GARAGE_TRUST_GALLERY.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/70 hover:border-sky-300 transition group"
              >
                <div className="relative h-44 bg-slate-200 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-slate-900/85 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                    {item.step}
                  </span>
                  <span className="absolute bottom-2.5 left-2.5 bg-white/95 text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-xs">
                    {item.tag}
                  </span>
                </div>
                <div className="p-4 space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          5. VANTAGENS PARA MOTORISTAS + SEGURANÇA NA PRÁTICA
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-bold uppercase text-sky-600 tracking-wider">
              Vantagens para Motoristas
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              Por que estacionar com o VagaGo?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Acabe com a dor de cabeça de rodar procurando vaga ou pagar preços abusivos no centro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <div className="p-6 sm:p-7 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3.5 hover:border-sky-300 transition group">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Até 40% Mais Barato</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Pague valores justos por hora, diária ou mês. Sem surpresas ou cobranças abusivas de estacionamentos convencionais.
              </p>
            </div>

            <div className="p-6 sm:p-7 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3.5 hover:border-emerald-300 transition group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Garagem Segura e Coberta</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Deixe seu carro protegido do sol e da chuva em garagens privativas com portão eletrônico, iluminação noturna e anfitriões verificados.
              </p>
            </div>

            <div className="p-6 sm:p-7 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3.5 hover:border-sky-300 transition group">
              <div className="w-12 h-12 bg-sky-50 text-sky-700 rounded-2xl flex items-center justify-center group-hover:scale-105 transition">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Vaga Garantida no Destino</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Reserve antes de sair de casa com navegação integrada no GPS. Chegue no seu compromisso em Itabuna sempre no horário.
              </p>
            </div>
          </div>
        </div>

        {/* Segurança Garantida na Prática */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-emerald-600 tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Transparência e Proteção
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              O que a segurança VagaGo garante na prática
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORM_GUARANTEES.map((item) => {
              const IconComp = guaranteeIcons[item.id] || ShieldCheck;
              return (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5"
                >
                  <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================
          6. SEÇÃO "PARA ANFITRIÕES" COM WAITLIST (LOGO APÓS VANTAGENS)
         ================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HostWaitlist />
      </div>

      {/* ==================================================
          7. COMO FUNCIONA PARA MOTORISTAS
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
          8. DEPOIMENTOS DE MORADORES DE ITABUNA
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
          9. IDENTIFICAÇÃO DA PLATAFORMA (WEB APP / PWA)
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PwaInstallSection />
      </section>

      {/* ==================================================
          10. BANNER CTA FINAL COM HIERARQUIA CLARA
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
