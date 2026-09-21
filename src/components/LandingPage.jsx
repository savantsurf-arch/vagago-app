import React from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from './InteractiveMap';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Car,
  ShieldCheck,
  Zap,
  DollarSign,
  Star,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Navigation,
  CheckCircle2,
  Shield
} from 'lucide-react';
import { SmartParkWidget } from './SmartParkWidget';

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
    userLocation,
    requestUserLocation
  } = useApp();

  const safeFilters = searchFilters || {
    dateType: 'hoje',
    billingType: 'hora'
  };

  const safeSpots = Array.isArray(parkingSpaces) ? parkingSpaces : [];

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setActiveTab('search');
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-20 bg-slate-50/50">
      
      {/* ==================================================
          1. HERO SECTION & SEARCH
         ================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/60 via-slate-50/80 to-white pt-8 sm:pt-14 pb-14 sm:pb-20 border-b border-slate-200/80">
        
        {/* Glow backdrop shapes - subtle & professional */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-gradient-to-r from-sky-400/8 to-emerald-400/8 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            {/* 4. BANNER "CIDADE PILOTO" */}
            <div className="inline-flex items-center gap-2 bg-emerald-50/90 border border-emerald-200/90 text-emerald-800 text-xs sm:text-xs font-bold px-4 py-1.5 rounded-full shadow-2xs transition hover:bg-emerald-100/70">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">🚀 CIDADE PILOTO: VagaGo Lançado Oficialmente em Itabuna - BA!</span>
            </div>

            {/* 5. HERO PRINCIPAL */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] text-balance">
              Estacione sem estresse <br />
              <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                em Itabuna - BA
              </span>
            </h1>

            {/* 6. TEXTO DO HERO */}
            <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-xl sm:max-w-2xl mx-auto font-normal leading-relaxed text-balance">
              Encontre garagens e vagas privativas no Centro de Itabuna, Shopping Jequitibá e bairros vizinhos, ou alugue sua vaga parada para gerar renda.
            </p>

          </div>

          {/* 7. COMPONENTE DE BUSCA (CARD PRINCIPAL) */}
          <div className="mt-8 sm:mt-10 max-w-4xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white rounded-3xl p-4 sm:p-7 shadow-xl shadow-slate-200/50 border border-slate-200/80 space-y-4 relative z-10"
            >
              
              {/* Location Input with GPS trigger */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Digite o bairro ou rua em Itabuna (Ex: Centro, Av. Cinquentenário...)"
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

              {/* 8. LOCALIZAÇÕES POPULARES */}
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

              {/* 9 & 10. FILTROS DE DATA E PERÍODO */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                
                {/* 9. Filtro de Data (Agora, Hoje, Amanhã) */}
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

                {/* 10. Filtro de Período (Por hora, Diária, Semanal, Mensal) */}
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

              {/* Botão de Encontrar Vagas */}
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-sm sm:text-base py-3.5 sm:py-4 px-6 rounded-2xl shadow-lg shadow-sky-600/25 hover:shadow-xl hover:shadow-sky-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-5 h-5" />
                <span>Encontrar vaga agora</span>
              </button>

            </form>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-center">
            <div className="p-3.5 sm:p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-xl sm:text-2xl font-black text-slate-900">+12.400</div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-semibold">Vagas Reservadas</div>
            </div>
            <div className="p-3.5 sm:p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-xl sm:text-2xl font-black text-sky-600">4.9 ★</div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-semibold">Avaliação Média</div>
            </div>
            <div className="p-3.5 sm:p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-xl sm:text-2xl font-black text-emerald-600">R$ 6/h</div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-semibold">Preço Inicial Médio</div>
            </div>
            <div className="p-3.5 sm:p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-xl sm:text-2xl font-black text-slate-900">100%</div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-semibold">Seguro Garantido</div>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================
          2. SMART PARKING RECOMMENDATION ENGINE
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SmartParkWidget />
      </section>

      {/* ==================================================
          3. RESULTADOS / VAGAS E MAPA INTERATIVO
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4" /> Mapa Interativo ao Vivo
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Garagens Disponíveis com Preços em Tempo Real
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Veja no mapa as vagas próximas com valores por hora claramente sinalizados.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('search')}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 self-start md:self-auto transition shadow-xs cursor-pointer"
          >
            <span>Ver todas as vagas no mapa completo</span>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </button>
        </div>

        {/* Split Grid: Map + Featured Spot Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Interactive Map (7 cols) */}
          <div className="lg:col-span-7 h-[360px] sm:h-[420px] rounded-3xl overflow-hidden shadow-md border border-slate-200">
            <InteractiveMap
              spots={safeSpots}
              onSelectSpot={(spot) => openSpotDetails(spot)}
            />
          </div>

          {/* 11 & 12. Cards List (5 cols) */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4 flex flex-col justify-center">
            {safeSpots.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-3 shadow-2xs">
                <Car className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-extrabold text-slate-800 text-base">Nenhuma garagem cadastrada ainda</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Seja o primeiro a cadastrar sua garagem em Itabuna e comece a lucrar alugando seu espaço!
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddSpotModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  + Cadastrar Primeira Garagem
                </button>
              </div>
            ) : (
              safeSpots.slice(0, 3).map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => openSpotDetails(spot)}
                  className="p-3.5 sm:p-4 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-sky-300 shadow-2xs hover:shadow-md transition cursor-pointer flex gap-3.5 sm:gap-4 items-center group"
                >
                  <div className="relative shrink-0">
                    <img
                      src={(spot.photos && spot.photos[0]) || spot.facadePhoto || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80"}
                      alt={spot.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover ring-1 ring-slate-200 group-hover:scale-102 transition"
                    />
                    {spot.isCovered && (
                      <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                        🛡️ Coberta
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full uppercase border border-sky-200/60 truncate">
                        📍 {spot.neighborhood || spot.distance || "Centro"}
                      </span>
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {spot.rating || '4.9'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm mt-1 truncate group-hover:text-sky-600 transition">
                      {spot.title}
                    </h3>

                    <p className="text-xs text-slate-500 truncate mt-0.5">{spot.address}</p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-slate-900">R$ {Number(spot.priceHourly || 6).toFixed(2)}</span>
                        <span className="text-[11px] text-slate-400 font-semibold">/ hora</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openSpotDetails(spot);
                        }}
                        className="text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-xl transition shadow-2xs cursor-pointer"
                      >
                        Ver vaga
                      </button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* ==================================================
          4. VANTAGENS PARA MOTORISTAS
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase text-sky-600 tracking-wider">Vantagens para Motoristas</span>
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
              Deixe seu carro protegido do sol e da chuva em garagens privativas com portão eletrônico, câmeras 24h e anfitriões verificados.
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
      </section>

      {/* ==================================================
          5. COMO FUNCIONA PARA MOTORISTAS (PASSO A PASSO)
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-12 rounded-3xl border border-slate-200/80 shadow-2xs space-y-8 sm:space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Passo a Passo Simples</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Como funciona para motoristas?</h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Em menos de 1 minuto você encontra e garante sua vaga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-center space-y-3">
              <div className="w-11 h-11 bg-sky-600 text-white font-black rounded-2xl flex items-center justify-center mx-auto text-base shadow-sm shadow-sky-600/20">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Localize no Mapa</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Digite o bairro ou use o GPS para ver garagens disponíveis perto de você com valores transparentes por hora.
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-center space-y-3">
              <div className="w-11 h-11 bg-sky-600 text-white font-black rounded-2xl flex items-center justify-center mx-auto text-base shadow-sm shadow-sky-600/20">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Reserve e Pague via PIX</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Escolha seu veículo, defina o tempo de permanência e aproveite o pagamento instantâneo e 100% seguro.
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-center space-y-3">
              <div className="w-11 h-11 bg-emerald-600 text-white font-black rounded-2xl flex items-center justify-center mx-auto text-base shadow-sm shadow-emerald-600/20">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Chegue e Estacione</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Abra o portão com o código de acesso ou QR Code liberado pelo app e estacione sem preocupações.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className="bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold text-xs sm:text-sm py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl shadow-lg shadow-sky-600/25 transition cursor-pointer"
            >
              Buscar Vaga em Itabuna Agora
            </button>
          </div>

        </div>
      </section>

      {/* ==================================================
          6. DRIVER CTA BANNER
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 text-white rounded-3xl p-7 sm:p-12 text-center space-y-6 shadow-xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black">
              Chega de perder tempo procurando vaga!
            </h2>
            <p className="text-sky-100 text-xs sm:text-sm">
              Encontre uma garagem privativa, economize dinheiro e estacione com total tranquilidade em Itabuna.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className="bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl shadow-xl transition transform hover:scale-105 cursor-pointer"
          >
            Encontrar Garagem Perto de Mim
          </button>
        </div>
      </section>

      {/* ==================================================
          7. FOOTER
         ================================================== */}
      <footer className="bg-slate-900 text-white pt-12 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img src="/logo-vagago.png" alt="VagaGo" className="h-10 sm:h-11 w-auto object-contain" />
              <div>
                <div className="font-black text-lg">VagaGo</div>
                <div className="text-xs text-slate-400">Estacionamento inteligente, seguro e econômico.</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setActiveTab('host_landing')}
                className="text-emerald-400 hover:text-emerald-300 font-bold transition cursor-pointer"
              >
                🏠 Seja um Anfitrião (Alugue sua vaga)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className="hover:text-white transition cursor-pointer"
              >
                Encontrar Vagas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('terms')}
                className="hover:text-white transition cursor-pointer"
              >
                Termos de Uso & Privacidade (LGPD)
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            © 2026 VagaGo Tecnologia e Plataforma de Garagens LTDA. Todos os direitos reservados.
          </div>

        </div>
      </footer>

    </div>
  );
};
