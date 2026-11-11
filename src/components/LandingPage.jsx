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
  Sparkles,
  ArrowRight,
  Navigation,
  CheckCircle2,
  Home,
  Lock,
  RefreshCw,
  UserCheck,
  Camera,
  PlusCircle
} from 'lucide-react';

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

              <div className="mt-6 max-w-4xl mx-auto">
                <form
                  onSubmit={handleSearchSubmit}
                  className="bg-white rounded-3xl p-4 sm:p-7 shadow-xl shadow-slate-200/50 border border-slate-200/80 space-y-4 relative z-10"
                >
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 shrink-0" />
                    <input
                      type="text"
                      placeholder="Buscar garagem em Itabuna (Ex: Centro, Av. Cinquentenário, Fátima...)"
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
                      onClick={() => {
                        const wlEl = document.getElementById('para-anfitrioes-waitlist');
                        if (wlEl) wlEl.scrollIntoView({ behavior: 'smooth' });
                        else setActiveTab('host_landing');
                      }}
                      className="w-full border border-slate-600 hover:border-emerald-400 text-slate-200 hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
                    >
                      Entrar na Lista Prioritária
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Barra de Credibilidade Realista */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-center">
            <div className="p-3.5 sm:p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-base sm:text-lg font-black text-slate-900">A partir de R$ 4/h</div>
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
                Centro, Jequitibá e Fátima
              </div>
            </div>
          </div>
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
