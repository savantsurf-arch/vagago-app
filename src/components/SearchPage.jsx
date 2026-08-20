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
      return a.priceHourly - b.priceHourly;
    }
    if (sortBy === 'TOP_RATED') {
      return b.rating - a.rating;
    }
    // 'BEST' (combination of rating & price)
    return (b.rating / b.priceHourly) - (a.rating / a.priceHourly);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* GPS Location & Accuracy Status Banner */}
      <div className="bg-emerald-900 text-white p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold shadow-md">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>📍 GPS Ativo: {userLocation.addressName || "Centro, Itabuna - BA (Alta Precisão)"}</span>
        </div>

        <button
          onClick={requestUserLocation}
          className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-extrabold px-3 py-1.5 rounded-xl transition text-[11px] flex items-center gap-1"
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
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition shrink-0 w-full sm:w-auto shadow-sm"
            >
              <Navigation className="w-4 h-4 text-sky-200" />
              <span>📍 Estacionar Perto de Mim</span>
            </button>

            <button
              onClick={() => setIsFilterMobileOpen(!isFilterMobileOpen)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-3 rounded-2xl flex items-center gap-1.5 transition lg:hidden shrink-0"
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
                onClick={() => setSearchFilters({ ...searchFilters, accessHours: h.id })}
                className={`px-3 py-1.5 rounded-full transition shrink-0 ${
                  searchFilters.accessHours === h.id
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

      {/* ESTACIONAR PERTO DE MIM - SORTING TABS BAR */}
      <div className="bg-slate-900 p-2 sm:p-3 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <span className="text-xs font-black uppercase text-sky-400 flex items-center gap-1.5 px-2">
          <Navigation className="w-4 h-4" />
          Ordenação Inteligente de Vagas em Itabuna:
        </span>

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
                className={`px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
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
                  coveredOnly: false,
                  hasCamera: false,
                  hasEVCharger: false,
                  hasGate: false,
                  has24h: false,
                  maxPrice: 50
                });
              }}
              className="text-[11px] font-bold text-sky-600 hover:underline"
            >
              Limpar
            </button>
          </div>

          {/* Max Price Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Preço Máximo por Hora:</span>
              <span className="font-extrabold text-sky-600">R$ {searchFilters.maxPrice}/h</span>
            </div>
            <input
              type="range"
              min="3"
              max="30"
              step="1"
              value={searchFilters.maxPrice}
              onChange={(e) => setSearchFilters({ ...searchFilters, maxPrice: Number(e.target.value) })}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>

          {/* Vehicle Compatibility Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">Tipo de Veículo</label>
            <select
              value={searchFilters.vehicleType}
              onChange={(e) => setSearchFilters({ ...searchFilters, vehicleType: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value="Todos">Todos os Veículos</option>
              <option value="Moto">Moto</option>
              <option value="Carro pequeno">Carro pequeno (Hatch)</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Caminhonete">Caminhonete</option>
            </select>
          </div>

          {/* Amenities & Security Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700">
            <label className="font-bold text-slate-900 block mb-1">Recursos de Segurança</label>
            
            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={searchFilters.coveredOnly}
                onChange={(e) => setSearchFilters({ ...searchFilters, coveredOnly: e.target.checked })}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>Apenas Vagas Cobertas</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={searchFilters.hasCamera}
                onChange={(e) => setSearchFilters({ ...searchFilters, hasCamera: e.target.checked })}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>Câmeras de Segurança 24h</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={searchFilters.hasGate}
                onChange={(e) => setSearchFilters({ ...searchFilters, hasGate: e.target.checked })}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>Portão Eletrônico / Tag</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={searchFilters.hasEVCharger}
                onChange={(e) => setSearchFilters({ ...searchFilters, hasEVCharger: e.target.checked })}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>Carregador Carro Elétrico (EV)</span>
            </label>
          </div>

        </div>

        {/* Center Spot Cards List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {sortedSpots.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
              <Search className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">Nenhuma vaga em Itabuna atende aos filtros aplicados.</p>
            </div>
          ) : (
            sortedSpots.map((spot, index) => {
              const isFav = favorites.includes(spot.id);
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
                      src={spot.photos[0]}
                      alt={spot.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    
                    {/* Top Pick Badge */}
                    {isTopPick && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-sky-600 to-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                        <Trophy className="w-3 h-3 text-amber-300" />
                        Nº 1 EM ITABUNA
                      </div>
                    )}

                    <div className="absolute top-3 right-12 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {spot.rating} ({spot.reviewsCount})
                    </div>

                    {/* Share Garage Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSharingSpot(spot);
                      }}
                      className="absolute bottom-2 right-3 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition shadow-sm"
                      title="Compartilhar Garagem"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Facade Badge */}
                    <div className="absolute bottom-2 left-3 bg-slate-900/90 text-amber-300 font-extrabold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                      📷 Foto da Entrada / Fachada
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(spot.id);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition ${
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
                      <span className="text-sky-700 font-extrabold">{spot.distFormatted || spot.distance}</span>
                      <span>•</span>
                      <span>{spot.walkTime || "4 min a pé"}</span>
                      <span>•</span>
                      <span>{spot.driveTime || "2 min carro"}</span>
                    </div>

                    {/* Features Badges */}
                    <div className="flex flex-wrap gap-1">
                      {spot.features.slice(0, 3).map((feat, idx) => (
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
                        className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 transition shadow-xs"
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
        <div className="lg:col-span-5 h-[650px] sticky top-20 rounded-3xl overflow-hidden shadow-xl border border-slate-200 hidden lg:block">
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
