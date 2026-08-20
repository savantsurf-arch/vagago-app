import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from './InteractiveMap';
import { ShareGarageModal } from './ShareGarageModal';
import {
  Search,
  Filter,
  Star,
  MapPin,
  ShieldCheck,
  Zap,
  Car,
  ChevronRight,
  SlidersHorizontal,
  X,
  Heart,
  Navigation,
  Clock,
  Compass,
  Share2,
  Trophy,
  DollarSign,
  Award,
  AlertTriangle
} from 'lucide-react';

export const SearchPage = () => {
  const {
    parkingSpaces,
    openSpotDetails,
    searchLocation,
    setSearchLocation,
    searchFilters,
    setSearchFilters,
    favorites,
    toggleFavorite,
    userLocation,
    requestUserLocation,
    distanceRadius,
    setDistanceRadius
  } = useApp();

  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);
  const [sortBy, setSortBy] = useState('BEST'); // 'BEST', 'NEAREST', 'CHEAPEST', 'TOP_RATED'
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'map'
  const [sharingSpot, setSharingSpot] = useState(null);
  const safeFilters = searchFilters || {};

  // Filter application logic including Distance Radius & Access Hours
  const filteredSpots = (parkingSpaces || []).filter(spot => {
    if (!spot) return false;
    if (spot.status === 'Pausada' || spot.isAvailable === false) return false;

    // Distance radius filter
    if (distanceRadius === '500m' && spot.calculatedDistKm > 0.5) return false;
    if (distanceRadius === '1km' && spot.calculatedDistKm > 1.0) return false;
    if (distanceRadius === '2km' && spot.calculatedDistKm > 2.0) return false;
    if (distanceRadius === '5km' && spot.calculatedDistKm > 5.0) return false;

    // Access Hours Filter
    if (safeFilters.accessHours === '24H' && !spot.is24h && !spot.availableHours?.includes('24')) return false;
    if (safeFilters.accessHours === 'COMMERCIAL' && (spot.is24h || spot.availableHours?.includes('24'))) return false;

    // Price filter
    if (safeFilters.maxPrice && spot.priceHourly > safeFilters.maxPrice) return false;
    
    // Feature filters
    if (safeFilters.coveredOnly && !spot.isCovered) return false;
    if (safeFilters.hasCamera && !spot.features?.includes('Câmeras 24h')) return false;
    if (safeFilters.hasEVCharger && !spot.features?.some(f => f.includes('Carregador') || f.includes('EV'))) return false;
    if (safeFilters.hasGate && !spot.features?.includes('Portão Eletrônico')) return false;

    // Vehicle compatibility
    if (safeFilters.vehicleType && safeFilters.vehicleType !== 'Todos' && !spot.allowedVehicles?.includes(safeFilters.vehicleType)) return false;

    return true;
  });


  // Sort logic for "Estacionar Perto de Mim"
  const sortedSpots = [...filteredSpots].sort((a, b) => {
    if (sortBy === 'NEAREST') {
      return (a.calculatedDistKm || 0.5) - (b.calculatedDistKm || 0.5);
    }
    if (sortBy === 'CHEAPEST') {
      return (a.priceHourly || 6) - (b.priceHourly || 6);
    }
    if (sortBy === 'TOP_RATED') {
      return (b.rating || 5) - (a.rating || 5);
    }
    // 'BEST' (combination of rating & price)
    return ((b.rating || 5) / (b.priceHourly || 6)) - ((a.rating || 5) / (a.priceHourly || 6));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* GPS Location & Accuracy Status Banner */}
      <div className="bg-emerald-900 text-white p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold shadow-md">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>📍 GPS Ativo: {userLocation?.addressName || "Centro, Itabuna - BA (Alta Precisão)"}</span>
        </div>

        <button
          onClick={requestUserLocation}
          className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-extrabold px-3 py-1.5 rounded-xl transition text-[11px] flex items-center gap-1 cursor-pointer"
        >
          <span>Atualizar Minha Posição</span>
        </button>
      </div>

      {/* Mobile First Header & Search bar: [ 🔎 Onde você quer estacionar? ] */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-600" />
            <input
              type="text"
              placeholder="🔎 Onde você quer estacionar? (Ex: Centro de Itabuna, Cinquentenário, Shopping Jequitibá...)"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={requestUserLocation}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition shrink-0 w-full sm:w-auto shadow-sm cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-sky-200" />
              <span>📍 Estacionar Perto de Mim</span>
            </button>

            <button
              onClick={() => setIsFilterMobileOpen(!isFilterMobileOpen)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-3 rounded-2xl flex items-center gap-1.5 transition lg:hidden shrink-0 cursor-pointer"
              title="Filtros"
            >
              <SlidersHorizontal className="w-4 h-4 text-sky-600" />
            </button>
          </div>

        </div>

        {/* Distance Radius & Access Hours Quick Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs font-bold">
          
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-slate-400 font-semibold shrink-0">Distância:</span>
            {[
              { id: 'all', label: 'Qualquer' },
              { id: '500m', label: 'Até 500m' },
              { id: '1km', label: 'Até 1 km' },
              { id: '2km', label: 'Até 2 km' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setDistanceRadius(r.id)}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  distanceRadius === r.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Access Hours Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-slate-400 font-semibold shrink-0">Acesso:</span>
            {[
              { id: 'ALL', label: 'Todos os Horários' },
              { id: '24H', label: '⚡ Acesso 24 Horas' },
              { id: 'COMMERCIAL', label: '🕒 Horário Comercial' }
            ].map(h => (
              <button
                key={h.id}
                onClick={() => setSearchFilters({ ...safeFilters, accessHours: h.id })}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  safeFilters.accessHours === h.id
                    ? 'bg-sky-600 text-white shadow-sm font-extrabold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* ESTACIONAR PERTO DE MIM - SORTING TABS & MOBILE VIEW TOGGLE */}
      <div className="bg-slate-900 p-2 sm:p-3 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <span className="text-xs font-black uppercase text-sky-400 flex items-center gap-1.5 px-2">
            <Navigation className="w-4 h-4" />
            Vagas em Itabuna ({sortedSpots.length}):
          </span>

          {/* Mobile View Toggle (Lista / Mapa) */}
          <div className="flex lg:hidden bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setMobileView('list')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                mobileView === 'list' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 Lista
            </button>
            <button
              onClick={() => setMobileView('map')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                mobileView === 'map' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🗺️ Mapa
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 w-full sm:w-auto text-xs font-extrabold">
          {[
            { id: 'BEST', label: '🏆 Melhor Opção', icon: Trophy },
            { id: 'NEAREST', label: '📍 Mais Próxima', icon: MapPin },
            { id: 'CHEAPEST', label: '💰 Mais Barata', icon: DollarSign },
            { id: 'TOP_RATED', label: '⭐ Melhor Avaliada', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = sortBy === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSortBy(tab.id)}
                className={`px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Layout: Filter Sidebar + Spot Cards + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Filters Sidebar (3 cols) */}
        <div className={`lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 space-y-5 shadow-sm ${
          isFilterMobileOpen ? 'block' : 'hidden lg:block'
        }`}>
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-sky-600" /> Filtros Avançados
            </h3>
            <button
              onClick={() => {
                setDistanceRadius('all');
                setSearchFilters({
                  dateType: 'hoje',
                  billingType: 'hora',
                  date: new Date().toISOString().split('T')[0],
                  startTime: '14:00',
                  endTime: '18:00',
                  vehicleType: 'Todos',
                  accessHours: 'ALL',
                  coveredOnly: false,
                  hasCamera: false,
                  hasEVCharger: false,
                  hasGate: false,
                  has24h: false,
                  maxPrice: 50
                });
              }}
              className="text-xs font-bold text-slate-400 hover:text-sky-600 cursor-pointer"
            >
              Limpar
            </button>
          </div>

          {/* Vehicle Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">Tipo de Veículo</label>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
              {['Todos', 'Carro', 'Moto', 'SUV', 'Caminhonete'].map(vt => (
                <button
                  key={vt}
                  type="button"
                  onClick={() => setSearchFilters({ ...safeFilters, vehicleType: vt })}
                  className={`p-2 rounded-xl border text-center transition ${
                    (safeFilters.vehicleType || 'Todos') === vt
                      ? 'bg-sky-50 border-sky-500 text-sky-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {vt}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Preço Máximo</span>
              <span className="text-sky-600">R$ {safeFilters.maxPrice || 50}/hora</span>
            </div>
            <input
              type="range"
              min="3"
              max="30"
              step="1"
              value={safeFilters.maxPrice || 30}
              onChange={(e) => setSearchFilters({ ...safeFilters, maxPrice: Number(e.target.value) })}
              className="w-full accent-sky-600"
            />
          </div>

          {/* Amenities & Security Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700">
            <label className="font-bold text-slate-900 block mb-1">Recursos de Segurança</label>
            
            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={Boolean(safeFilters.coveredOnly)}
                onChange={(e) => setSearchFilters({ ...safeFilters, coveredOnly: e.target.checked })}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>Apenas Vagas Cobertas</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={Boolean(safeFilters.hasCamera)}
                onChange={(e) => setSearchFilters({ ...safeFilters, hasCamera: e.target.checked })}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>Câmeras de Segurança 24h</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={Boolean(safeFilters.hasGate)}
                onChange={(e) => setSearchFilters({ ...safeFilters, hasGate: e.target.checked })}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>Portão Eletrônico / Tag</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={Boolean(safeFilters.hasEVCharger)}
                onChange={(e) => setSearchFilters({ ...safeFilters, hasEVCharger: e.target.checked })}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>Carregador Carro Elétrico (EV)</span>
            </label>
          </div>

        </div>

        {/* Center Spot Cards List (4 cols) */}
        <div className={`lg:col-span-4 space-y-4 ${mobileView === 'map' ? 'hidden lg:block' : 'block'}`}>
          {sortedSpots.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center text-slate-400 space-y-3 shadow-sm">
              <Search className="w-10 h-10 mx-auto text-slate-300" />
              <h4 className="font-extrabold text-slate-800 text-base">Nenhuma vaga encontrada</h4>
              <p className="text-xs text-slate-500">
                Nenhuma garagem cadastrada no momento para estes filtros. Cadastre sua primeira garagem no Modo Anfitrião!
              </p>
            </div>
          ) : (
            sortedSpots.map((spot, index) => {
              const isFav = Array.isArray(favorites) && favorites.includes(spot.id);
              const isTopPick = index === 0;

              return (
                <div
                  key={spot.id}
                  className={`bg-white hover:bg-slate-50/80 rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden group relative flex flex-col justify-between ${
                    isTopPick ? 'border-sky-500 ring-2 ring-sky-200' : 'border-slate-200'
                  }`}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={(spot.photos && spot.photos[0]) || spot.facadePhoto || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80"}
                      alt={spot.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    
                    {/* Top Pick Badge */}
                    {isTopPick && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-sky-600 to-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                        <Trophy className="w-3 h-3 text-amber-300" />
                        DESTAQUE
                      </div>
                    )}

                    <div className="absolute top-3 right-12 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {spot.rating || 5.0} ({spot.reviewsCount || 0})
                    </div>

                    {/* Share Garage Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSharingSpot(spot);
                      }}
                      className="absolute bottom-2 right-3 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition shadow-sm cursor-pointer"
                      title="Compartilhar Garagem"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Facade Badge */}
                    <div className="absolute bottom-2 left-3 bg-slate-900/90 text-amber-300 font-extrabold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                      📷 Fachada / Entrada
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof toggleFavorite === 'function') toggleFavorite(spot.id);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition cursor-pointer ${
                        isFav ? 'bg-rose-500 text-white' : 'bg-slate-900/60 text-white hover:bg-slate-900'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm truncate">{spot.title}</h3>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="truncate">{spot.address}</span>
                      </div>
                    </div>

                    {/* Distance & Estimated Travel Times */}
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 bg-sky-50/70 p-2 rounded-xl border border-sky-100">
                      <span className="text-sky-700 font-extrabold">{spot.distFormatted || spot.distance || "Centro"}</span>
                      <span>•</span>
                      <span>{spot.walkTime || "4 min a pé"}</span>
                      <span>•</span>
                      <span>{spot.driveTime || "2 min carro"}</span>
                    </div>

                    {/* Features Badges */}
                    <div className="flex flex-wrap gap-1">
                      {(spot.features || []).slice(0, 3).map((feat, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {feat}
                        </span>
                      ))}
                    </div>

                    {/* Pricing & CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Cobrança</span>
                        <span className="text-lg font-black text-sky-600">R$ {Number(spot.priceHourly || 6).toFixed(2)}/h</span>
                      </div>

                      <button
                        onClick={() => openSpotDetails(spot)}
                        className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 transition shadow-xs cursor-pointer"
                      >
                        <span>Ver vaga</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Right Sticky Map (5 cols) */}
        <div className={`lg:col-span-5 h-[550px] lg:h-[650px] lg:sticky lg:top-20 rounded-3xl overflow-hidden shadow-xl border border-slate-200 ${
          mobileView === 'list' ? 'hidden lg:block' : 'block'
        }`}>
          <InteractiveMap
            spots={sortedSpots}
            userLocation={userLocation}
            favorites={favorites}
            onSelectSpot={(spot) => openSpotDetails(spot)}
          />
        </div>

      </div>

      {/* Share Garage Modal */}
      <ShareGarageModal
        spot={sharingSpot}
        isOpen={Boolean(sharingSpot)}
        onClose={() => setSharingSpot(null)}
      />

    </div>
  );
};
