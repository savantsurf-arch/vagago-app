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
  TrendingUp,
  DollarSign,
  Star,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Shield,
  Smartphone,
  Lock,
  Flame,
  Award,
  Navigation
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
    demandRegions,
    setIsAddSpotModalOpen,
    setActiveRole,
    userLocation,
    requestUserLocation
  } = useApp();


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveTab('search');
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-slate-50 to-white pt-10 pb-16 border-b border-slate-200">
        
        {/* Glow backdrop shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-sky-400/10 to-emerald-400/10 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            {/* Badge pill - Pilot Launch City */}
            <div className="inline-flex items-center gap-2 bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-black px-4 py-1.5 rounded-full shadow-sm animate-soft-pulse">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>🚀 CIDADE PILOTO: VagaGo Lançado Oficialmente em Itabuna - BA!</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Estacione sem estresse <br />
              <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                em Itabuna - BA
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Encontre garagens e vagas privativas no Centro de Itabuna, Shopping Jequitibá e bairros vizinhos, ou alugue sua vaga parada para gerar renda.
            </p>

          </div>

          {/* MAIN SEARCH & FILTERS CONTAINER */}
          <div className="mt-10 max-w-4xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 relative z-10"
            >
              
              {/* Location Input */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  type="text"
                  placeholder="Digite o bairro em Itabuna (Ex: Centro, Av. Cinquentenário, Shopping Jequitibá...)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                />
              </div>

              {/* Itabuna Quick Neighborhood Pills */}
              <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold pt-1">
                <span className="text-slate-400 font-semibold shrink-0">Populares em Itabuna:</span>
                {[
                  'Centro - Av. Cinquentenário',
                  'Shopping Jequitibá',
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
                    className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 px-3 py-1 rounded-full shrink-0 transition"
                  >
                    📍 {nb}
                  </button>
                ))}
              </div>


              {/* Quick Time & Mode Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                
                {/* Date presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {['agora', 'hoje', 'amanha'].map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setSearchFilters({ ...searchFilters, dateType: mode })}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition capitalize ${
                        searchFilters.dateType === mode
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Billing Types */}
                <div className="flex items-center gap-1 overflow-x-auto py-1">
                  {[
                    { id: 'hora', label: 'Por hora' },
                    { id: 'diaria', label: 'Diária' },
                    { id: 'semanal', label: 'Semanal' },
                    { id: 'mensal', label: 'Mensal' }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSearchFilters({ ...searchFilters, billingType: item.id })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        searchFilters.billingType === item.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-base py-4 px-6 rounded-2xl shadow-xl shadow-sky-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-5 h-5" />
                <span>Encontrar vaga agora</span>
              </button>


            </form>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
            <div className="p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/80">
              <div className="text-2xl font-black text-slate-900">+12.400</div>
              <div className="text-xs text-slate-500 font-semibold">Vagas Reservadas</div>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/80">
              <div className="text-2xl font-black text-sky-600">4.9 ★</div>
              <div className="text-xs text-slate-500 font-semibold">Avaliação Média</div>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/80">
              <div className="text-2xl font-black text-emerald-600">R$ 8/h</div>
              <div className="text-xs text-slate-500 font-semibold">Preço Inicial Médio</div>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/80">
              <div className="text-2xl font-black text-slate-900">100%</div>
              <div className="text-xs text-slate-500 font-semibold">Seguro Garantido</div>
            </div>
          </div>

        </div>
      </section>

      {/* SMART PARKING RECOMMENDATION ENGINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SmartParkWidget />
      </section>


      {/* MAP & SPOTS PREVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4" /> Mapa Interativo ao Vivo
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Garagens Disponíveis com Preços em Tempo Real
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Veja no mapa as vagas próximas com valores por hora claramente sinalizados.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('search')}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 self-start md:self-auto transition shadow-sm"
          >
            <span>Ver todas as vagas no mapa completo</span>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </button>
        </div>

        {/* Split Grid: Map + Featured Spot Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Interactive Map (7 cols) */}
          <div className="lg:col-span-7 h-[420px] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
            <InteractiveMap
              spots={parkingSpaces}
              onSelectSpot={(spot) => openSpotDetails(spot)}
            />
          </div>

          {/* Cards List (5 cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            {parkingSpaces.slice(0, 3).map((spot) => (
              <div
                key={spot.id}
                onClick={() => openSpotDetails(spot)}
                className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md transition cursor-pointer flex gap-4 items-center group"
              >
                <img
                  src={spot.photos[0]}
                  alt={spot.title}
                  className="w-24 h-24 rounded-xl object-cover shrink-0 group-hover:scale-105 transition"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full uppercase">
                      {spot.distance}
                    </span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {spot.rating}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-1 truncate group-hover:text-sky-600 transition">
                    {spot.title}
                  </h3>

                  <p className="text-xs text-slate-500 truncate mt-0.5">{spot.address}</p>

                  <div className="flex items-baseline gap-2 mt-2 pt-2 border-t border-slate-100">
                    <span className="text-base font-black text-slate-900">R$ {Number(spot.priceHourly || 6).toFixed(2)}/h</span>
                    <span className="text-xs text-slate-400 font-semibold">• R$ {Number(spot.priceDaily || 28).toFixed(2)}/dia</span>
                  </div>

                </div>

                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition shrink-0" />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* STRATEGIC DEMAND MAP SECTION FOR HOSTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span>Mapa de Demanda VagaGo</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                Regiões com Altíssima Procura por Estacionamento
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed">
                Nossos dados mostram centenas de motoristas buscando vagas diariamente nessas áreas. Se você tem uma garagem parada nestes bairros, pode faturar imediatamente!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {demandRegions.map((region) => (
                  <div key={region.id} className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{region.region} ({region.city})</h4>
                      <span className="text-[11px] text-emerald-400 font-semibold">{region.searchesLast7Days} buscas nos últimos 7 dias</span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded uppercase">
                      {region.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center space-y-5">
              <div className="w-14 h-14 bg-emerald-500 text-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg font-black text-2xl">
                R$
              </div>
              <h3 className="text-xl font-bold">Simule seus Ganhos como Anfitrião</h3>
              <p className="text-xs text-slate-300">
                Garagens na região Central e Paulista faturam em média <strong className="text-emerald-400 font-extrabold">R$ 680 a R$ 1.200 / mês</strong> com 0 esforço.
              </p>

              <button
                onClick={() => {
                  setActiveRole('PROPRIETÁRIO');
                  setIsAddSpotModalOpen(true);
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-3.5 px-4 rounded-2xl shadow-lg transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                <span>Cadastrar minha garagem agora</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* HOW IT WORKS / USER BENEFITS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-slate-900">Como funciona o VagaGo?</h2>
          <p className="text-slate-600 text-sm mt-2">
            Simplicidade absoluta para quem precisa estacionar e para quem quer lucrar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto font-black text-lg">
              1
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Localize a Vaga ideal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pesquise pelo endereço ou bairro de destino e veja todas as opções com preço por hora ou mensalidade.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto font-black text-lg">
              2
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Reserve e Pague via PIX</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Escolha seu veículo, selecione os horários de entrada/saída e confirme o pagamento em segundos.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto font-black text-lg">
              3
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Chegue e Estacione</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Apresente o QR Code no portão eletrônico ou portaria e desfrute de um estacionamento seguro.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white pt-12 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img src="/logo-vagago.png" alt="VagaGo" className="h-10 w-auto bg-white p-1 rounded-lg" />
              <div>
                <div className="font-black text-lg">VagaGo</div>
                <div className="text-xs text-slate-400">Sua vaga parada pode gerar dinheiro.</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <a href="#" className="hover:text-white transition">Sobre o VagaGo</a>
              <a href="#" className="hover:text-white transition">Termos de Uso</a>
              <a href="#" className="hover:text-white transition">Privacidade</a>
              <a href="#" className="hover:text-white transition">Suporte 24h</a>
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
