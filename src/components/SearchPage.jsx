import React, { useState, useEffect, useRef } from 'react';
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
  Share2,
  Trophy,
  DollarSign,
  Award,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Info
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
    setDistanceRadius,
    activeTab,
    setActiveTab,
    isPageLoading
  } = useApp();

  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);
  const [sortBy, setSortBy] = useState('BEST'); // 'BEST', 'NEAREST', 'CHEAPEST', 'TOP_RATED'
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'map'
  const [sharingSpot, setSharingSpot] = useState(null);
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [hoveredSpotId, setHoveredSpotId] = useState(null);
  const [mobilePreviewSpot, setMobilePreviewSpot] = useState(null);

  const listContainerRef = useRef(null);
  const safeFilters = searchFilters || {};
  const isFavoritesMode = activeTab === 'favorites';
  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  // Filter application logic
  const filteredSpots = (parkingSpaces || []).filter(spot => {
    if (!spot) return false;
    if (spot.status === 'Pausada' || spot.isAvailable === false) return false;

    // In Favorites mode, show only user favorites
    if (isFavoritesMode && !safeFavorites.includes(spot.id)) {
      return false;
    }

    // 1. Text Location Search Filter
    if (searchLocation && searchLocation.trim()) {
      const cleanQuery = searchLocation.toLowerCase().replace(/, itabuna - ba/gi, '').replace(/itabuna/gi, '').trim();
      if (cleanQuery.length > 1) {
        const spotText = `${spot.title || ''} ${spot.address || ''} ${spot.neighborhood || ''} ${spot.description || ''}`.toLowerCase();
        const queryTerms = cleanQuery.split(/[\s-]+/).filter(t => t.length > 1);
        const matchesQuery = queryTerms.some(term => spotText.includes(term));
        if (!matchesQuery) return false;
      }
    }

    // 2. Distance radius filter
    const dist = spot.calculatedDistKm ?? 0.5;
    if (distanceRadius === '500m' && dist > 0.5) return false;
    if (distanceRadius === '1km' && dist > 1.0) return false;
    if (distanceRadius === '2km' && dist > 2.0) return false;
    if (distanceRadius === '5km' && dist > 5.0) return false;

    // 3. Access Hours Filter
    const is24hSpot = spot.is24h === true || spot.availableHours?.includes('24') || (spot.features || []).some(f => f.toLowerCase().includes('24'));
    if (safeFilters.accessHours === '24H' && !is24hSpot) return false;
    if (safeFilters.accessHours === 'COMMERCIAL' && is24hSpot) return false;

    // 4. Price filter
    const spotPrice = Number(spot.priceHourly || 6);
    if (safeFilters.maxPrice && spotPrice > safeFilters.maxPrice) return false;
    
    // 5. Feature filters
    const featuresList = (spot.features || []).map(f => (f || '').toLowerCase());
    
    if (safeFilters.coveredOnly && !spot.isCovered && !featuresList.some(f => f.includes('cobert'))) return false;
    if (safeFilters.hasCamera && !featuresList.some(f => f.includes('câmera') || f.includes('camera'))) return false;
    if (safeFilters.hasEVCharger && !featuresList.some(f => f.includes('elétric') || f.includes('eletric') || f.includes('ev') || f.includes('carregador'))) return false;
    if (safeFilters.hasGate && !featuresList.some(f => f.includes('portão') || f.includes('portao') || f.includes('tag') || f.includes('eletrônic') || f.includes('eletronic'))) return false;

    // 6. Vehicle compatibility filter
    if (safeFilters.vehicleType && safeFilters.vehicleType !== 'Todos') {
      const targetType = safeFilters.vehicleType.toLowerCase();
      const allowedList = (spot.allowedVehicles || ['Todos', 'Carro', 'Moto', 'SUV']).map(v => (v || '').toLowerCase());
      
      const isCompatible = allowedList.some(v => {
        if (v.includes('todos')) return true;
        if (targetType === 'carro' && (v.includes('carro') || v.includes('sedan') || v.includes('hatch') || v.includes('pequeno'))) return true;
        if (targetType === 'moto' && v.includes('moto')) return true;
        if (targetType === 'suv' && (v.includes('suv') || v.includes('caminhonete') || v.includes('pickup'))) return true;
        if (targetType === 'caminhonete' && (v.includes('caminhonete') || v.includes('pickup') || v.includes('suv'))) return true;
        return v.includes(targetType);
      });

      if (!isCompatible) return false;
    }

    return true;
  });

  // Sort logic
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

  const handleClearFilters = () => {
    setDistanceRadius('all');
    setSearchLocation('');
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
  };

  const handleSpotSelectFromMap = (spot) => {
    setSelectedSpotId(spot.id);
    setMobilePreviewSpot(spot);
    
    // In desktop, scroll to spot card if list is visible
    if (window.innerWidth >= 1024) {
      const cardEl = document.getElementById(`spot-card-${spot.id}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const activeFiltersCount = [
    distanceRadius !== 'all',
    safeFilters.vehicleType && safeFilters.vehicleType !== 'Todos',
    safeFilters.accessHours && safeFilters.accessHours !== 'ALL',
    safeFilters.coveredOnly,
    safeFilters.hasCamera,
    safeFilters.hasGate,
    safeFilters.hasEVCharger,
    safeFilters.maxPrice && safeFilters.maxPrice < 50
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5">
      
      {/* ==================================================
          1. TOP NAVIGATION HEADER: [← Voltar] + Title
         ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('landing')}
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-sky-600 rounded-2xl border border-slate-200 transition shadow-2xs flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Voltar para a página inicial"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {isFavoritesMode ? (
                <>
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <span>Minhas Vagas Favoritas</span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {safeFavorites.length}
                  </span>
                </>
              ) : (
                <>
                  <span>Encontrar uma vaga</span>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200/70 px-2.5 py-0.5 rounded-full">
                    Itabuna - BA
                  </span>
                </>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isFavoritesMode
                ? "Garagens que você salvou para alugar com rapidez."
                : "Busque garagens privativas e seguras por bairro, rua ou ponto de interesse."}
            </p>
          </div>
        </div>

        {/* GPS Location Action / Status */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={requestUserLocation}
            className={`px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
              userLocation?.isLive
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-sky-600'
            }`}
            title="Usar minha localização atual para encontrar vagas próximas"
          >
            <Navigation className={`w-3.5 h-3.5 ${userLocation?.isLive ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            <span className="truncate max-w-[190px] sm:max-w-[220px]">
              {userLocation?.isLive ? "📍 GPS: " + (userLocation.addressName || "Localização Ativa") : "📍 Usar minha localização"}
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================
          2. SEARCH INPUT & QUICK FILTERS BAR
         ================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3.5">
        
        {/* Search Input Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
            <input
              type="text"
              placeholder="Digite um endereço, bairro ou ponto de referência em Itabuna..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-2xl pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 focus:outline-none transition shadow-2xs"
            />
            {searchLocation && (
              <button
                type="button"
                onClick={() => setSearchLocation('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full transition"
                title="Limpar pesquisa"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Modal Button (Mobile) */}
          <button
            type="button"
            onClick={() => setIsFilterMobileOpen(!isFilterMobileOpen)}
            className={`p-3 sm:px-4 sm:py-3 rounded-2xl border flex items-center gap-1.5 transition lg:hidden shrink-0 cursor-pointer shadow-2xs text-xs font-bold ${
              activeFiltersCount > 0
                ? 'bg-sky-50 text-sky-700 border-sky-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Abrir filtros"
          >
            <SlidersHorizontal className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Chips: Distance Radius + Quick Access */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs font-bold">
          
          {/* Distance Radius */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-slate-400 font-semibold shrink-0">Distância:</span>
            {[
              { id: 'all', label: 'Qualquer' },
              { id: '500m', label: 'Até 500m' },
              { id: '1km', label: 'Até 1 km' },
              { id: '2km', label: 'Até 2 km' },
              { id: '5km', label: 'Até 5 km' }
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setDistanceRadius(r.id)}
                className={`px-3 py-1.5 rounded-full transition shrink-0 cursor-pointer ${
                  distanceRadius === r.id
                    ? 'bg-sky-600 text-white shadow-xs font-extrabold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Quick Access Hours */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-slate-400 font-semibold shrink-0">Acesso:</span>
            {[
              { id: 'ALL', label: 'Todos' },
              { id: '24H', label: '⚡ 24 Horas' },
              { id: 'COMMERCIAL', label: '🕒 Comercial' }
            ].map(h => (
              <button
                key={h.id}
                type="button"
                onClick={() => setSearchFilters({ ...safeFilters, accessHours: h.id })}
                className={`px-3 py-1.5 rounded-full transition shrink-0 cursor-pointer ${
                  (safeFilters.accessHours || 'ALL') === h.id
                    ? 'bg-slate-900 text-white shadow-xs font-extrabold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* ==================================================
          3. SORTING TABS & MOBILE VIEW TOGGLE (LISTA / MAPA)
         ================================================== */}
      <div className="bg-slate-900 p-2 sm:p-2.5 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-md">
        
        <div className="flex items-center justify-between w-full sm:w-auto gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-sky-400 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>Vagas ({sortedSpots.length})</span>
            </span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-[11px] text-slate-400 hover:text-white underline transition"
              >
                Limpar filtros
              </button>
            )}
          </div>

          {/* Mobile View Toggle: [📋 Lista] vs [🗺️ Mapa] */}
          <div className="flex lg:hidden bg-slate-800 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setMobileView('list')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                mobileView === 'list' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 Lista
            </button>
            <button
              type="button"
              onClick={() => setMobileView('map')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                mobileView === 'map' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              🗺️ Mapa
            </button>
          </div>
        </div>

        {/* Sort Options Tabs */}
        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 w-full sm:w-auto text-xs font-bold">
          {[
            { id: 'BEST', label: '🏆 Melhor Opção', icon: Trophy },
            { id: 'NEAREST', label: '📍 Mais Próxima', icon: MapPin },
            { id: 'CHEAPEST', label: '💰 Menor Preço', icon: DollarSign },
            { id: 'TOP_RATED', label: '⭐ Melhor Avaliada', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = sortBy === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSortBy(tab.id)}
                className={`px-3 py-1.5 sm:py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* ==================================================
          4. MAIN SPLIT GRID: FILTERS (3) + LIST (4) + MAP (5)
         ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        
        {/* Left Filters Sidebar (3 cols on desktop, modal on mobile) */}
        <div className={`lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/80 space-y-4 shadow-sm ${
          isFilterMobileOpen
            ? 'fixed inset-x-4 top-20 bottom-6 z-50 overflow-y-auto shadow-2xl lg:static lg:inset-auto lg:z-auto'
            : 'hidden lg:block'
        }`}>
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-sky-600" />
              <span>Filtros Detalhados</span>
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold text-slate-400 hover:text-sky-600 transition cursor-pointer"
              >
                Limpar
              </button>
              {isFilterMobileOpen && (
                <button
                  type="button"
                  onClick={() => setIsFilterMobileOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
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
                  className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                    (safeFilters.vehicleType || 'Todos') === vt
                      ? 'bg-sky-50 border-sky-500 text-sky-700 font-extrabold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {vt}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Range Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Preço Máximo</span>
              <span className="text-sky-600 font-black">R$ {safeFilters.maxPrice || 50}/h</span>
            </div>
            <input
              type="range"
              min="3"
              max="50"
              step="1"
              value={safeFilters.maxPrice || 50}
              onChange={(e) => setSearchFilters({ ...safeFilters, maxPrice: Number(e.target.value) })}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>R$ 3/h</span>
              <span>R$ 25/h</span>
              <span>R$ 50/h</span>
            </div>
          </div>

          {/* Security & Amenity Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700">
            <label className="font-bold text-slate-900 block mb-1">Comodidades & Segurança</label>
            
            <label className="flex items-center gap-2 cursor-pointer py-1 hover:text-slate-900">
              <input
                type="checkbox"
                checked={Boolean(safeFilters.coveredOnly)}
                onChange={(e) => setSearchFilters({ ...safeFilters, coveredOnly: e.target.checked })}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>🛡️ Apenas Vagas Cobertas</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-1 hover:text-slate-900">
              <input
                type="checkbox"
                checked={Boolean(safeFilters.hasCamera)}
                onChange={(e) => setSearchFilters({ ...safeFilters, hasCamera: e.target.checked })}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>📹 Câmeras de Segurança 24h</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-1 hover:text-slate-900">
              <input
                type="checkbox"
                checked={Boolean(safeFilters.hasGate)}
                onChange={(e) => setSearchFilters({ ...safeFilters, hasGate: e.target.checked })}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>🚪 Portão Eletrônico / Tag</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-1 hover:text-slate-900">
              <input
                type="checkbox"
                checked={Boolean(safeFilters.hasEVCharger)}
                onChange={(e) => setSearchFilters({ ...safeFilters, hasEVCharger: e.target.checked })}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>⚡ Tomada para Carro Elétrico</span>
            </label>
          </div>

          {isFilterMobileOpen && (
            <button
              type="button"
              onClick={() => setIsFilterMobileOpen(false)}
              className="w-full bg-sky-600 text-white font-bold text-xs py-3 rounded-xl mt-3 lg:hidden"
            >
              Aplicar Filtros ({sortedSpots.length} Vagas)
            </button>
          )}

        </div>

        {/* Center Spot Cards List (4 cols on desktop) */}
        <div
          ref={listContainerRef}
          className={`lg:col-span-4 space-y-3.5 ${
            mobileView === 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          {isPageLoading ? (
            /* Skeletons Loading State */
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white p-4 rounded-2xl border border-slate-200 animate-pulse space-y-3">
                  <div className="h-40 bg-slate-200 rounded-xl w-full" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-8 bg-slate-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : sortedSpots.length === 0 ? (
            /* 15. Resultado Zero (Estado Vazio) */
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-dashed border-slate-300 text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800 text-base">
                  Não encontramos vagas nessa região
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Experimente aumentar a área de busca ou alterar os filtros selecionados.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                Limpar todos os filtros
              </button>
            </div>
          ) : (
            sortedSpots.map((spot, index) => {
              const isFav = safeFavorites.includes(spot.id);
              const isTopPick = index === 0;
              const isSelected = selectedSpotId === spot.id;
              const isHovered = hoveredSpotId === spot.id;

              return (
                <div
                  id={`spot-card-${spot.id}`}
                  key={spot.id}
                  onMouseEnter={() => setHoveredSpotId(spot.id)}
                  onMouseLeave={() => setHoveredSpotId(null)}
                  onClick={() => {
                    setSelectedSpotId(spot.id);
                  }}
                  className={`bg-white hover:bg-slate-50/90 rounded-2xl border transition duration-200 overflow-hidden group relative flex flex-col justify-between cursor-pointer ${
                    isSelected || isHovered
                      ? 'border-sky-500 ring-2 ring-sky-300/60 shadow-md'
                      : isTopPick
                      ? 'border-sky-400/80 shadow-2xs'
                      : 'border-slate-200/80 shadow-2xs'
                  }`}
                >
                  {/* Spot Image Header */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={(spot.photos && spot.photos[0]) || spot.facadePhoto || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80"}
                      alt={spot.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                    />
                    
                    {/* Top Pick / Destaque Badge */}
                    {isTopPick && (
                      <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-sky-600 to-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                        <Trophy className="w-3 h-3 text-amber-300" />
                        DESTAQUE
                      </div>
                    )}

                    {/* Rating Pill */}
                    <div className="absolute top-2.5 right-11 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{spot.rating || '4.9'}</span>
                    </div>

                    {/* Share Garage Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSharingSpot(spot);
                      }}
                      className="absolute bottom-2 right-2.5 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl transition shadow-sm cursor-pointer"
                      title="Compartilhar Garagem"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Covered / Facade Tag */}
                    <div className="absolute bottom-2 left-2.5 flex items-center gap-1">
                      {spot.isCovered && (
                        <span className="bg-slate-900/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                          🛡️ Coberta
                        </span>
                      )}
                      <span className="bg-slate-900/90 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                        📷 Fachada
                      </span>
                    </div>

                    {/* Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof toggleFavorite === 'function') toggleFavorite(spot.id);
                      }}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-xl backdrop-blur-xs transition cursor-pointer ${
                        isFav ? 'bg-rose-500 text-white' : 'bg-slate-900/60 text-white hover:bg-slate-900'
                      }`}
                      title={isFav ? "Remover dos favoritos" : "Salvar nos favoritos"}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Spot Card Body */}
                  <div className="p-3.5 sm:p-4 space-y-2.5">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm truncate group-hover:text-sky-600 transition">
                        {spot.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{spot.address || spot.neighborhood || "Centro, Itabuna"}</span>
                      </div>
                    </div>

                    {/* Distance & Real Times */}
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-sky-50/70 p-2 rounded-xl border border-sky-100/80">
                      <span className="text-sky-700 font-extrabold">
                        {spot.distFormatted || (spot.calculatedDistKm ? `${spot.calculatedDistKm} km` : spot.distance || "Centro")}
                      </span>
                      <span>•</span>
                      <span>{spot.walkTime || "4 min a pé"}</span>
                      <span>•</span>
                      <span>{spot.driveTime || "2 min carro"}</span>
                    </div>

                    {/* Feature Badges */}
                    <div className="flex flex-wrap gap-1">
                      {(spot.features || ['Portão Eletrônico', 'Câmeras 24h']).slice(0, 3).map((feat, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {feat}
                        </span>
                      ))}
                    </div>

                    {/* Pricing & CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-black text-slate-900">R$ {Number(spot.priceHourly || 6).toFixed(2)}</span>
                          <span className="text-[11px] text-slate-500 font-medium">/h</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openSpotDetails(spot);
                        }}
                        className="bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 transition shadow-2xs cursor-pointer"
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

        {/* Right Sticky Map (5 cols on desktop, full view on mobile) */}
        <div className={`lg:col-span-5 relative h-[500px] lg:h-[680px] lg:sticky lg:top-24 rounded-3xl overflow-hidden shadow-md border border-slate-200 ${
          mobileView === 'list' ? 'hidden lg:block' : 'block'
        }`}>
          <InteractiveMap
            spots={sortedSpots}
            userLocation={userLocation}
            favorites={favorites}
            selectedSpotId={selectedSpotId}
            hoveredSpotId={hoveredSpotId}
            onSelectSpot={handleSpotSelectFromMap}
          />

          {/* Mobile Bottom Sheet Preview Card when a spot is clicked on map */}
          {mobilePreviewSpot && (
            <div className="lg:hidden absolute bottom-3 left-3 right-3 z-[20] bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xl space-y-2 animate-in slide-in-from-bottom-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex gap-3 items-center min-w-0">
                  <img
                    src={(mobilePreviewSpot.photos && mobilePreviewSpot.photos[0]) || mobilePreviewSpot.facadePhoto || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=300&q=80"}
                    alt={mobilePreviewSpot.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-sm truncate">
                      {mobilePreviewSpot.title}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{mobilePreviewSpot.address}</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-600 mt-0.5">
                      <span>R$ {Number(mobilePreviewSpot.priceHourly || 6).toFixed(2)}/h</span>
                      <span>•</span>
                      <span className="text-slate-500">{mobilePreviewSpot.distFormatted || "Centro"}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobilePreviewSpot(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg shrink-0"
                  title="Fechar preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => openSpotDetails(mobilePreviewSpot)}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
              >
                <span>Ver detalhes da vaga</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
